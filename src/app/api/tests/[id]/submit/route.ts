import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const body = await req.json();

  const {
    studentId,
    answers,
  }: {
    studentId: string;
    answers: Record<string, string>;
  } = body;

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

  let score = 0;

  for (const question of test.questions) {
    const selectedOptionId = answers[question.id];

    const correctOption = question.options.find(
      (o) => o.isCorrect
    );

    if (
      correctOption &&
      selectedOptionId === correctOption.id
    ) {
      score++;
    }
  }

  const attempt = await prisma.attempt.create({
    data: {
      studentId,
      testId: id,
      score,
    },
  });

  return NextResponse.json({
    success: true,
    score,
    attempt,
  });
}