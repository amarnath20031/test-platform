import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const {
      testId,
      studentIds = [],
      batchIds = [],
    } = await req.json();

    if (!testId) {
      return NextResponse.json(
        { error: "Test ID is required" },
        { status: 400 }
      );
    }

    /*
     * --------------------------------------------------
     * 1. Collect students selected individually
     * --------------------------------------------------
     */

    const studentMap = new Map<
      string,
      {
        studentId: string;
        batchId: string | null;
      }
    >();

    for (const studentId of studentIds) {
      if (!studentId) continue;

      studentMap.set(studentId, {
        studentId,
        batchId: null,
      });
    }

    /*
     * --------------------------------------------------
     * 2. Expand selected batches into students
     * --------------------------------------------------
     */

    for (const batchId of batchIds) {
      if (!batchId) continue;

      const {
        data: batchStudents,
        error: studentsError,
      } = await admin
        .from("Student")
        .select("id, batchId")
        .eq("batchId", batchId);

      if (studentsError) {
        console.error(
          "Error loading batch students:",
          studentsError
        );

        return NextResponse.json(
          {
            error:
              "Could not load students from batch: " +
              studentsError.message,
          },
          { status: 400 }
        );
      }

      for (const student of batchStudents || []) {
        studentMap.set(student.id, {
          studentId: student.id,
          batchId: student.batchId,
        });
      }
    }

    /*
     * --------------------------------------------------
     * 3. Make sure there is at least one student
     * --------------------------------------------------
     */

    if (studentMap.size === 0) {
      return NextResponse.json(
        {
          error:
            "No students were selected or found in the selected batch.",
        },
        { status: 400 }
      );
    }

    /*
     * --------------------------------------------------
     * 4. Remove old batch-only assignment rows
     *
     * Old version of this API created:
     *
     * studentId = null
     * batchId = some batch
     *
     * Those rows are invisible to the student page.
     *
     * We no longer use batch-only assignment rows.
     * --------------------------------------------------
     */

    for (const batchId of batchIds) {
      if (!batchId) continue;

      const { error: deleteError } = await admin
        .from("TestAssignment")
        .delete()
        .eq("testId", testId)
        .eq("batchId", batchId)
        .is("studentId", null);

      if (deleteError) {
        console.error(
          "Error removing old batch assignment:",
          deleteError
        );

        return NextResponse.json(
          {
            error:
              "Could not clean old batch assignment: " +
              deleteError.message,
          },
          { status: 400 }
        );
      }
    }

    /*
     * --------------------------------------------------
     * 5. Create / reset assignment for EVERY student
     * --------------------------------------------------
     */

    for (const student of studentMap.values()) {
      const {
        data: existing,
        error: findError,
      } = await admin
        .from("TestAssignment")
        .select(
          "id, status, attemptId, studentId, batchId"
        )
        .eq("testId", testId)
        .eq("studentId", student.studentId)
        .maybeSingle();

      if (findError) {
        console.error(
          "Error checking existing assignment:",
          findError
        );

        return NextResponse.json(
          {
            error:
              "Could not check existing assignment: " +
              findError.message,
          },
          { status: 400 }
        );
      }

      /*
       * Existing assignment
       *
       * Re-assign it instead of creating duplicate.
       */

      if (existing) {
        const { error: updateError } =
          await admin
            .from("TestAssignment")
            .update({
              batchId: student.batchId,
              status: "assigned",
              attemptId: null,
              assignedAt:
                new Date().toISOString(),
            })
            .eq("id", existing.id);

        if (updateError) {
          console.error(
            "Error resetting assignment:",
            updateError
          );

          return NextResponse.json(
            {
              error:
                "Could not reset assignment: " +
                updateError.message,
            },
            { status: 400 }
          );
        }

        console.log(
          "Assignment reset:",
          existing.id,
          "student:",
          student.studentId
        );
      }

      /*
       * New assignment
       */

      else {
        const { error: insertError } =
          await admin
            .from("TestAssignment")
            .insert({
              id: crypto.randomUUID(),
              testId,
              studentId:
                student.studentId,
              batchId:
                student.batchId,
              status: "assigned",
              assignedAt:
                new Date().toISOString(),
            });

        if (insertError) {
          console.error(
            "Error creating assignment:",
            insertError
          );

          return NextResponse.json(
            {
              error:
                "Could not create assignment: " +
                insertError.message,
            },
            { status: 400 }
          );
        }

        console.log(
          "New assignment created:",
          "test:",
          testId,
          "student:",
          student.studentId,
          "batch:",
          student.batchId
        );
      }
    }

    /*
     * --------------------------------------------------
     * 6. Success
     * --------------------------------------------------
     */

    return NextResponse.json({
      success: true,
      assignedStudents: studentMap.size,
    });
  } catch (error) {
    console.error(
      "Assignment API error:",
      error
    );

    return NextResponse.json(
      {
        error: "Server Error",
      },
      { status: 500 }
    );
  }
}