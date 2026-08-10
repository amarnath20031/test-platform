"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function NewSubjectPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function createSubject() {
    if (!name.trim()) {
      alert("Enter subject name");
      return;
    }

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Please login again.");
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profile")
      .select("instituteId")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      alert("Institute not found.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("Subject").insert({
      id: crypto.randomUUID(),
      name: name.trim(),
      instituteId: profile.instituteId,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/dashboard/subjects");
  }

  return (
    <div className="min-h-screen bg-[#050816] text-white p-8">

      <button
        onClick={() => router.back()}
        className="text-blue-400 hover:text-blue-300 mb-8"
      >
        ← Back
      </button>

      <div className="max-w-2xl mx-auto">

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">

          <h1 className="text-4xl font-bold">
            Create Subject
          </h1>

          <p className="text-slate-400 mt-2 mb-8">
            Add a new subject for your institute.
          </p>

          <div className="space-y-6">

            <div>
              <label className="block mb-2 text-slate-300">
                Subject Name
              </label>

              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Example: Mathematics"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex gap-4 pt-4">

              <button
                onClick={createSubject}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-6 py-3 rounded-xl font-semibold transition"
              >
                {loading ? "Saving..." : "Save Subject"}
              </button>

              <button
                onClick={() => router.push("/dashboard/subjects")}
                className="bg-slate-700 hover:bg-slate-600 px-6 py-3 rounded-xl font-semibold transition"
              >
                Cancel
              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}