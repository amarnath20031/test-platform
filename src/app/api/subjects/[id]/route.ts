import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // --------------------------------------------------
    // AUTHENTICATED USER
    // --------------------------------------------------

    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    // --------------------------------------------------
    // SERVICE ROLE CLIENT
    // SERVER ONLY - NEVER PUT THIS IN CLIENT CODE
    // --------------------------------------------------

    const admin = createSupabaseAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // --------------------------------------------------
    // VERIFY USER'S INSTITUTE
    // --------------------------------------------------

    const { data: profile, error: profileError } = await admin
      .from("profile")
      .select("instituteId")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        {
          success: false,
          error: "Profile not found",
        },
        { status: 403 }
      );
    }

    // --------------------------------------------------
    // GET SUBJECT
    // --------------------------------------------------

    const { data: subject, error: subjectError } = await admin
      .from("Subject")
      .select("id, instituteId")
      .eq("id", id)
      .single();

    if (subjectError || !subject) {
      return NextResponse.json(
        {
          success: false,
          error: "Subject not found",
        },
        { status: 404 }
      );
    }

    // --------------------------------------------------
    // MAKE SURE SUBJECT BELONGS TO THIS INSTITUTE
    // --------------------------------------------------

    if (subject.instituteId !== profile.instituteId) {
      return NextResponse.json(
        {
          success: false,
          error: "You do not have permission to delete this subject.",
        },
        { status: 403 }
      );
    }

    // --------------------------------------------------
    // GET ALL TESTS
    // --------------------------------------------------

    const { data: tests, error: testsError } = await admin
      .from("Test")
      .select("id")
      .eq("subjectId", id);

    if (testsError) {
      throw testsError;
    }

    const testIds = (tests || []).map((t) => t.id);

    // --------------------------------------------------
    // DELETE DEPENDENT DATA
    // --------------------------------------------------

    if (testIds.length > 0) {
      // Questions
      const { data: questions, error: questionsError } = await admin
        .from("Question")
        .select("id")
        .in("testId", testIds);

      if (questionsError) {
        throw questionsError;
      }

      const questionIds = (questions || []).map((q) => q.id);

      // Attempts
      const { data: attempts, error: attemptsError } = await admin
        .from("Attempt")
        .select("id")
        .in("testId", testIds);

      if (attemptsError) {
        throw attemptsError;
      }

      const attemptIds = (attempts || []).map((a) => a.id);

      // Answers
      if (attemptIds.length > 0) {
        const { error } = await admin
          .from("Answer")
          .delete()
          .in("attemptId", attemptIds);

        if (error) {
          throw error;
        }

        // Attempt Events
        const { error: eventError } = await admin
          .from("AttemptEvent")
          .delete()
          .in("attemptId", attemptIds);

        if (eventError) {
          throw eventError;
        }

        // Attempts
        const { error: deleteAttemptsError } = await admin
          .from("Attempt")
          .delete()
          .in("id", attemptIds);

        if (deleteAttemptsError) {
          throw deleteAttemptsError;
        }
      }

      // Test Assignments
      const { error: assignmentError } = await admin
        .from("TestAssignment")
        .delete()
        .in("testId", testIds);

      if (assignmentError) {
        throw assignmentError;
      }

      // Options
      if (questionIds.length > 0) {
        const { error: optionError } = await admin
          .from("Option")
          .delete()
          .in("questionId", questionIds);

        if (optionError) {
          throw optionError;
        }

        // Questions
        const { error: questionDeleteError } = await admin
          .from("Question")
          .delete()
          .in("id", questionIds);

        if (questionDeleteError) {
          throw questionDeleteError;
        }
      }

      // Tests
      const { error: testDeleteError } = await admin
        .from("Test")
        .delete()
        .in("id", testIds);

      if (testDeleteError) {
        throw testDeleteError;
      }
    }

    // --------------------------------------------------
    // DELETE SUBJECT
    // --------------------------------------------------

    const { error: deleteSubjectError } = await admin
      .from("Subject")
      .delete()
      .eq("id", id);

    if (deleteSubjectError) {
      throw deleteSubjectError;
    }

    return NextResponse.json({
      success: true,
    });
  } catch (err: any) {
    console.error("SUBJECT DELETE ERROR:", err);

    return NextResponse.json(
      {
        success: false,
        error: err?.message || String(err),
      },
      {
        status: 500,
      }
    );
  }
}