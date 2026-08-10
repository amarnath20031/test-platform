import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function generatePassword() {
  return "testplatform@" + Math.floor(1000 + Math.random() * 9000);
}

export async function POST(req: Request) {
  try {
    const { students, instituteId } = await req.json();

    const success: any[] = [];
    const failed: any[] = [];

    for (const student of students) {
      try {
        const name = student.Name?.trim();
        const email = student.Email?.trim().toLowerCase();
        const batchName = student.Batch?.trim();

        if (!name || !email) {
          failed.push({
            email,
            reason: "Missing Name or Email",
          });
          continue;
        }

        // Check duplicate student email
        const { data: existing } = await admin
          .from("Student")
          .select("id")
          .eq("email", email)
          .maybeSingle();

        if (existing) {
          failed.push({
            email,
            reason: "Student already exists",
          });
          continue;
        }

        // Find Batch
        let batchId: string | null = null;

        if (batchName) {
          const { data: batch } = await admin
            .from("Batch")
            .select("id")
            .eq("name", batchName)
            .eq("instituteId", instituteId)
            .maybeSingle();

          batchId = batch?.id ?? null;
        }

        const password = generatePassword();

        // Create Auth user
        const { data: authData, error: authError } =
          await admin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
          });

        if (authError) {
          failed.push({
            email,
            reason: authError.message,
          });
          continue;
        }

        const authId = authData.user.id;
        // Insert Student
        const { data: studentData, error: studentError } =
          await admin
            .from("Student")
            .insert({
              id: authId,
              name,
              email,
              instituteId,
              batchId,
            })
            .select()
            .single();

        if (studentError) {
          await admin.auth.admin.deleteUser(authId);

          failed.push({
            email,
            reason: studentError.message,
          });

          continue;
        }

        // Create profile
        const { error: profileError } =
          await admin
            .from("profile")
            .insert({
              id: authId,
              email,
              role: "student",
              studentId: authId,
              instituteId,
            });

        if (profileError) {
          await admin
            .from("Student")
            .delete()
            .eq("id", authId);

          await admin.auth.admin.deleteUser(authId);

          failed.push({
            email,
            reason: profileError.message,
          });

          continue;
        }

        success.push({
          name,
          email,
          password,
        });

      } catch (err: any) {
        failed.push({
          email: student.Email,
          reason: err.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      imported: success.length,
      failed: failed.length,
      accounts: success,
      errors: failed,
    });

  } catch (err: any) {
    return NextResponse.json(
      {
        error: err.message,
      },
      {
        status: 500,
      }
    );
  }
}