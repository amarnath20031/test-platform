import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { testId, questions } = body;
    console.log("========== SAVE QUESTIONS ==========");
console.log("testId:", testId);
console.log("questions count:", questions?.length);
console.log("FIRST QUESTION:", questions?.[0]);

    if (!testId) {
      return NextResponse.json(
        {
          success: false,
          error: "Test ID is required",
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No questions provided",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 1. Get the selected Test and its Subject
    // --------------------------------------------------

    const test = await prisma.test.findUnique({
      where: {
        id: testId,
      },
      select: {
        id: true,
        subjectId: true,
      },
    });
    console.log("TEST FROM DB:", test);

    if (!test) {
      return NextResponse.json(
        {
          success: false,
          error: "Test not found",
        },
        { status: 404 }
      );
    }

    // --------------------------------------------------
    // 2. Create sections only once
    // --------------------------------------------------

    const sections = new Map<string, string>();

    for (const q of questions) {
      const sectionName =
        typeof q.section === "string" && q.section.trim()
          ? q.section.trim()
          : "General";

      if (!sections.has(sectionName)) {
        const section = await prisma.section.create({
          data: {
            name: sectionName,
            testId,
            order: sections.size + 1,
          },
        });

        sections.set(sectionName, section.id);
      }
    }

    // --------------------------------------------------
    // 3. Save questions
    // --------------------------------------------------

    let totalSaved = 0;

    for (const q of questions) {
      if (
        !q.question ||
        !q.optionA ||
        !q.optionB ||
        !q.optionC ||
        !q.optionD
      ) {
        continue;
      }

      const sectionName =
        typeof q.section === "string" && q.section.trim()
          ? q.section.trim()
          : "General";

      const sectionId = sections.get(sectionName);

      if (!sectionId) {
        continue;
      }

      const newQuestion = await prisma.question.create({
  data: {
    text: q.question,
    testId,
    sectionId,
    subjectId: test.subjectId || null,
    topic:
      typeof q.topic === "string" && q.topic.trim()
        ? q.topic.trim()
        : null,
    marks: 1,
    explanation:
      typeof q.explanation === "string"
        ? q.explanation
        : "",
  },
});

console.log("QUESTION SAVED:", newQuestion);

      await prisma.option.createMany({
        data: [
          {
            text: q.optionA,
            questionId: newQuestion.id,
            isCorrect: q.correctAnswer === "A",
          },
          {
            text: q.optionB,
            questionId: newQuestion.id,
            isCorrect: q.correctAnswer === "B",
          },
          {
            text: q.optionC,
            questionId: newQuestion.id,
            isCorrect: q.correctAnswer === "C",
          },
          {
            text: q.optionD,
            questionId: newQuestion.id,
            isCorrect: q.correctAnswer === "D",
          },
        ],
      });

      totalSaved++;
    }

    // --------------------------------------------------
    // 4. Return actual saved count
    // --------------------------------------------------

    return NextResponse.json({
      success: true,
      totalSaved,
      subjectId: test.subjectId,
    });
  } catch (err) {
    console.error("QUESTION SAVE ERROR:", err);

    return NextResponse.json(
      {
        success: false,
        error: String(err),
      },
      {
        status: 500,
      }
    );
  }
}