import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.$transaction(async (tx: any) => {

      // All tests under this subject
      const tests = await tx.test.findMany({
        where: {
          subjectId: id,
        },
        select: {
          id: true,
        },
      });

      const testIds = tests.map((t: { id: string }) => t.id);

      // Delete answers
      await tx.answer.deleteMany({
        where: {
          Attempt: {
            testId: {
              in: testIds,
            },
          },
        },
      });

      // Delete attempt events
      await tx.attemptEvent.deleteMany({
        where: {
          attempt: {
            testId: {
              in: testIds,
            },
          },
        },
      });

      // Delete attempts
      await tx.attempt.deleteMany({
        where: {
          testId: {
            in: testIds,
          },
        },
      });

      // Delete assignments
      await tx.testAssignment.deleteMany({
        where: {
          testId: {
            in: testIds,
          },
        },
      });

      // Delete options
      await tx.option.deleteMany({
        where: {
          question: {
            testId: {
              in: testIds,
            },
          },
        },
      });

      // Delete questions
      await tx.question.deleteMany({
        where: {
          testId: {
            in: testIds,
          },
        },
      });

      // Delete tests
      await tx.test.deleteMany({
        where: {
          subjectId: id,
        },
      });

      // Finally delete subject
      await tx.subject.delete({
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