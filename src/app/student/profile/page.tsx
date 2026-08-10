"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Student = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  batch?: {
    name: string;
  } | null;
};

export default function StudentProfilePage() {
  const router = useRouter();

  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState("");
  const [savingName, setSavingName] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/student/login");
      return;
    }

    const { data: profile, error: profileError } =
      await supabase
        .from("profile")
        .select("studentId")
        .eq("id", user.id)
        .single();

    if (profileError || !profile?.studentId) {
      console.error("Profile error:", profileError);
      setLoading(false);
      return;
    }

   const { data: studentData, error: studentError } =
  await supabase
    .from("Student")
    .select(`
      *,
      batch:Batch(name)
    `)
    .eq("id", profile.studentId)
    .single();

    if (studentError) {
      console.error("Student error:", studentError);
    }

    if (studentData) {
      setStudent(studentData);
      setName(studentData.name || "");
    }

    setLoading(false);
  }

  async function saveName() {
    if (!student) return;

    const trimmedName = name.trim();

    if (!trimmedName) {
      alert("Name cannot be empty.");
      return;
    }

    setSavingName(true);

    const { data, error } = await supabase
      .from("Student")
      .update({
        name: trimmedName,
      })
      .eq("id", student.id)
      .select()
      .single();

    if (error) {
      console.error("Name update error:", error);
      alert("Could not update your name.");
      setSavingName(false);
      return;
    }

    if (data) {
      setStudent(data);
      setName(data.name);
    }

    setEditingName(false);
    setSavingName(false);
  }

  async function logout() {
    await supabase.auth.signOut();
    router.push("/student/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="text-slate-400">
          Loading Profile...
        </p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">

          <p className="text-red-400 mb-4">
            Student profile not found.
          </p>

          <button
            onClick={() => router.push("/student")}
            className="bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded-xl"
          >
            Back to Dashboard
          </button>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-10">

      {/* Header */}

      <div className="flex items-center justify-between mb-10">

        <div>
          <h1 className="text-4xl font-bold">
            My Profile
          </h1>

          <p className="text-slate-400 mt-2">
            View and edit your student information
          </p>
        </div>

        <button
          onClick={() => router.push("/student")}
          className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700"
        >
          ← Dashboard
        </button>

      </div>

      {/* Profile Card */}

      <div className="max-w-4xl">

        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8">

          {/* Avatar + Name */}

          <div className="flex items-center gap-6 pb-8 border-b border-slate-800">

            <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-4xl font-bold">

              {student.name
                ?.charAt(0)
                .toUpperCase()}

            </div>

            <div className="flex-1">

              {!editingName ? (

                <>
                  <div className="flex items-center gap-4">

                    <h2 className="text-3xl font-bold">
                      {student.name}
                    </h2>

                    

                  </div>

                  <p className="text-slate-400 mt-1">
                    Student
                  </p>
                </>

              ) : (

                <div>

                  <p className="text-sm text-slate-400 mb-2">
                    Change your name
                  </p>

                  <div className="flex gap-3">

                    <input
  value={name}
  disabled
  className="bg-gray-700 cursor-not-allowed"
/>

                    <button
                      onClick={saveName}
                      disabled={savingName}
                      className="bg-green-600 hover:bg-green-700 disabled:opacity-50 px-5 py-3 rounded-xl font-semibold"
                    >
                      {savingName
                        ? "Saving..."
                        : "Save"}
                    </button>

                    <button
                      onClick={() => {
                        setName(student.name);
                        setEditingName(false);
                      }}
                      disabled={savingName}
                      className="bg-slate-700 hover:bg-slate-600 disabled:opacity-50 px-5 py-3 rounded-xl"
                    >
                      Cancel
                    </button>

                  </div>

                </div>

              )}

            </div>

          </div>

          {/* Information */}

          <div className="grid grid-cols-2 gap-6 mt-8">

            {/* Full Name */}

            <div className="bg-slate-950 rounded-2xl p-5">

              <p className="text-sm text-slate-500">
                Full Name
              </p>

              <p className="text-lg font-semibold mt-2">
                {student.name || "Not available"}
              </p>

            </div>

            {/* Student ID */}

            <div className="bg-slate-950 rounded-2xl p-5">

              <p className="text-sm text-slate-500">
                Student ID
              </p>

              <p className="text-lg font-semibold mt-2 break-all">
                {student.id}
              </p>

            </div>

            {/* Email */}

            <div className="bg-slate-950 rounded-2xl p-5">

              <p className="text-sm text-slate-500">
                Email
              </p>

              <p className="text-lg font-semibold mt-2">
                {student.email || "Not available"}
              </p>

            </div>

            <div className="bg-slate-950 rounded-2xl p-5">
  <p className="text-sm text-slate-500">
    Batch
  </p>

  <p className="text-lg font-semibold mt-2">
    {student.batch?.name || "Not Assigned"}
  </p>
</div>

            {/* Phone */}

            <div className="bg-slate-950 rounded-2xl p-5">

              <p className="text-sm text-slate-500">
                Phone
              </p>

              <p className="text-lg font-semibold mt-2">
                {student.phone || "Not available"}
              </p>

            </div>

          </div>

          {/* Account */}

          <div className="mt-8 pt-8 border-t border-slate-800">

            <h3 className="text-xl font-bold">
              Account
            </h3>

            <p className="text-slate-400 mt-2">
              Your account is connected to your
              student profile.
            </p>

            <div className="mt-6 flex flex-wrap gap-4">
  <button
    onClick={() => router.push("/student/profile/change-password")}
    className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-semibold"
  >
    🔑 Change Password
  </button>

  <button
    onClick={logout}
    className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-xl font-semibold"
  >
    Logout
  </button>
</div>

          </div>

        </div>

      </div>

    </div>
  );
}