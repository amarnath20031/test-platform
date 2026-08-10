import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const {
      name,
      email,
      password,
      instituteUserId,
    } = await req.json();

    if (
      !name ||
      !email ||
      !password ||
      !instituteUserId
    ) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    // Find logged-in institute
    const { data: instituteProfile, error: profileError } =
      await supabase
        .from("profile")
        .select("*")
        .eq("id", instituteUserId)
        .single();

    if (
      profileError ||
      !instituteProfile ||
      instituteProfile.role.toLowerCase() !== "institute"
    ) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 403 }
      );
    }

    // Create auth user
    const {
      data: authData,
      error: authError,
    } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    const authUserId = authData.user.id;

    // Create student record
    const studentId = crypto.randomUUID();

    const { error: studentError } =
      await supabase
        .from("Student")
        .insert({
          id: studentId,
          name,
          email,
          instituteId:
            instituteProfile.instituteId,
        });

    if (studentError) {
      return NextResponse.json(
        { error: studentError.message },
        { status: 400 }
      );
    }

    // Create profile
    const { error: profileInsertError } =
      await supabase
        .from("profile")
        .insert({
          id: authUserId,
          email,
          role: "student",
          studentId,
          instituteId:
            instituteProfile.instituteId,
        });

    if (profileInsertError) {
      return NextResponse.json(
        { error: profileInsertError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      studentId,
    });

  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Server Error" },
      { status: 500 }
    );
  }
}