import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type AnswerData = {
  optionId: string;
  timeSpent?: number;
  answerChanges?: number;
  initialOptionId?: string;
};

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const body = await req.json();

    const {
      studentId,
      answers,
      answerDetails,
    }: {
      studentId: string;
      answers: Record<string, string>;
      answerDetails?: Record<string, AnswerData>;
    } = body;

    if (!studentId) {
      return NextResponse.json(
        { error: "Student ID is required" },
        { status: 400 }
      );
    }

    if (!answers || typeof answers !== "object") {
      return NextResponse.json(
        { error: "Answers are required" },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // GET TEST
    // --------------------------------------------------

    const test = await prisma.test.findUnique({
      where: {
        id,
      },
      include: {
        questions: {
          include: {
            options: true,
          },
        },
      },
    });

    if (!test) {
      return NextResponse.json(
        { error: "Test not found" },
        { status: 404 }
      );
    }

    // --------------------------------------------------
    // CALCULATE RESULT
    // --------------------------------------------------

    let correctAnswers = 0;
    let wrongAnswers = 0;
    let skippedAnswers = 0;

    let score = 0;

    const answerRows: {
      id: string;
      attemptId: string;
      questionId: string;
      optionId: string | null;
      isCorrect: boolean;
      timeSpent: number;
      answerChanges: number;
      changedAnswer: boolean;
      initialOptionId: string | null;
    }[] = [];

    for (const question of test.questions) {
      const selectedOptionId = answers[question.id];

      // ----------------------------------------------
      // SKIPPED QUESTION
      // ----------------------------------------------

     if (!selectedOptionId) {
  skippedAnswers++;

  const details = answerDetails?.[question.id];

  const timeSpent = Math.max(
    0,
    Number(details?.timeSpent ?? 0)
  );

  const answerChanges = Math.max(
    0,
    Number(details?.answerChanges ?? 0)
  );

  answerRows.push({
    id: crypto.randomUUID(),

    // Filled after Attempt is created
    attemptId: "",

    questionId: question.id,

    // null = skipped
    optionId: null,

    isCorrect: false,

    timeSpent,

    answerChanges,

    changedAnswer: false,

    initialOptionId: null,
  });

  continue;
}

      // ----------------------------------------------
      // FIND CORRECT OPTION
      // ----------------------------------------------

      const correctOption = question.options.find(
  (option: {
    id: string;
    isCorrect: boolean | null;
    is_correct: boolean | null;
  }) =>
    option.isCorrect === true ||
    option.is_correct === true
);

      const isCorrect =
        !!correctOption &&
        selectedOptionId === correctOption.id;

      if (isCorrect) {
        correctAnswers++;

        score += Number(test.positiveMarks ?? 1);
      } else {
        wrongAnswers++;

        score -= Number(test.negativeMarks ?? 0);
      }

      // ----------------------------------------------
      // BEHAVIORAL DATA
      // ----------------------------------------------

      const details = answerDetails?.[question.id];

      const timeSpent = Math.max(
        0,
        Number(details?.timeSpent ?? 0)
      );

      const answerChanges = Math.max(
        0,
        Number(details?.answerChanges ?? 0)
      );

      const initialOptionId =
        details?.initialOptionId ?? selectedOptionId;

      const changedAnswer =
        answerChanges > 0 ||
        initialOptionId !== selectedOptionId;

      answerRows.push({
        id: crypto.randomUUID(),

        // Filled after Attempt is created
        attemptId: "",

        questionId: question.id,

        optionId: selectedOptionId,

        isCorrect,

        timeSpent,

        answerChanges,

        changedAnswer,

        initialOptionId,
      });
    }

    // --------------------------------------------------
    // PERCENTAGE
    // --------------------------------------------------

    const totalQuestions = test.questions.length;

    const percentage =
      totalQuestions === 0
        ? 0
        : Math.round(
            (correctAnswers / totalQuestions) * 100
          );

    // --------------------------------------------------
    // TOTAL TIME
    // --------------------------------------------------

    const totalTime = answerRows.reduce(
      (sum, answer) =>
        sum + Number(answer.timeSpent || 0),
      0
    );

    // --------------------------------------------------
    // CREATE ATTEMPT + ANSWERS
    // --------------------------------------------------

    const result = await prisma.$transaction(async (tx: any) => {
        const attempt = await tx.attempt.create({
          data: {
            studentId,
            testId: id,

            score,

            percentage,

            correctAnswers,

            wrongAnswers,

            skippedAnswers,

            timeTaken: totalTime,

            completedAt: new Date(),
          },
        });

        // Add the Attempt ID to each Answer
        const rows = answerRows.map((answer) => ({
          ...answer,
          attemptId: attempt.id,
        }));

        if (rows.length > 0) {
          await tx.answer.createMany({
            data: rows,
          });
        }

        return attempt;
      }
    );

    // --------------------------------------------------
    // UPDATE TEST ASSIGNMENT
    // --------------------------------------------------

    const assignment =
      await prisma.testAssignment.findFirst({
        where: {
          studentId,
          testId: id,
        },
      });

    if (assignment) {
      await prisma.testAssignment.update({
        where: {
          id: assignment.id,
        },
        data: {
          status: "completed",

          // Your database currently has this column.
          // Store the newly created attempt.
          attemptId: result.id,
        },
      });
    }

    // --------------------------------------------------
    // RESPONSE
    // --------------------------------------------------

    return NextResponse.json({
      success: true,

      score: result.score,

      percentage: result.percentage,

      correctAnswers: result.correctAnswers,

      wrongAnswers: result.wrongAnswers,

      skippedAnswers: result.skippedAnswers,

      timeTaken: result.timeTaken,

      attempt: result,
    });
  } catch (error) {
    console.error(
      "SUBMIT TEST ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to submit test",
      },
      {
        status: 500,
      }
    );
  }
}