import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.$transaction(async (tx: any) => {
      // Delete Answers
      await tx.answer.deleteMany({
        where: {
          Attempt: {
            testId: id,
          },
        },
      });

      // Delete Attempt Events (if you have this table)
      await tx.attemptEvent.deleteMany({
        where: {
          attempt: {
            testId: id,
          },
        },
      });

      // Delete Draft Answers
      await tx.draftAnswer.deleteMany({
        where: {
          testId: id,
        },
      });

      // Delete Exam Sessions
      await tx.examSession.deleteMany({
        where: {
          testId: id,
        },
      });

      // Delete Attempts
      await tx.attempt.deleteMany({
        where: {
          testId: id,
        },
      });

      // Delete Assignments
      await tx.testAssignment.deleteMany({
        where: {
          testId: id,
        },
      });

      // Delete Options
      await tx.option.deleteMany({
        where: {
          question: {
            testId: id,
          },
        },
      });

      // Delete Questions
      await tx.question.deleteMany({
        where: {
          testId: id,
        },
      });

      // Finally delete the Test
      await tx.test.delete({
        where: {
          id,
        },
      });
    });

    return NextResponse.json({
      success: true,
    });

  } catch (err) {
    console.error(err);

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