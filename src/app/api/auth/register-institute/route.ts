import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
    console.log("1. API Started");
  try {
    const {
      name,
      email,
      password,
    } = await req.json();
    console.log("2. Request Parsed");
    console.log("3. Creating Auth User");

    // 1. Create Auth User
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
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

    const userId = authData.user.id;
    console.log("4. Auth User Created");

    // 2. Create Institute
    const instituteId = crypto.randomUUID();

    console.log("5. Creating Institute");
    const { error: instituteError } =
      await supabase.from("Institute").insert({
        id: instituteId,
        name,
      });
      console.log("6. Institute Created");

    if (instituteError) {
      return NextResponse.json(
        { error: instituteError.message },
        { status: 400 }
      );
    }

    console.log("7. Creating profile");
    // 3. Create Profile
    const { error: profileError } =
      await supabase.from("profile").insert({
        id: userId,
        email,
        role: "institute",
        instituteId,
      });

      console.log("8. Finished");
    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
    });

  } catch {
    return NextResponse.json(
      { error: "Server Error" },
      { status: 500 }
    );
  }
}