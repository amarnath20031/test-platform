import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("BODY RECEIVED =", body);

    const {
      name,
      email,
      instituteId,
      batchId,
    } = body;

    if (!name || !email || !instituteId || !batchId) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    // Generate temporary password
    const password =
      "testplatform@" + Math.floor(1000 + Math.random() * 9000);

    // Create Auth User
    const { data: authUser, error: authError } =
      await admin.auth.admin.createUser({
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

    const userId = authUser.user.id;

    // Create Student
    const { error: studentError } = await admin
      .from("Student")
     .insert({
  id: userId,
  name,
  email,
  instituteId,
  batchId,
});

    if (studentError) {
      return NextResponse.json(
        { error: studentError.message },
        { status: 400 }
      );
    }

    // Create profile
    const { error: profileError } = await admin
      .from("profile")
      .insert({
        id: userId,
        email,
        role: "student",
        studentId: userId,
        instituteId,
      });

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      password,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Server Error" },
      { status: 500 }
    );
  }
}