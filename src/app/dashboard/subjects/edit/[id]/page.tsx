"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function EditSubjectPage() {
  const { id } = useParams();
  const router = useRouter();

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSubject();
  }, []);

  async function loadSubject() {
    const { data, error } = await supabase
      .from("Subject")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      alert("Subject not found.");
      router.push("/dashboard/subjects");
      return;
    }

    setName(data.name || "");
    setLoading(false);
  }

  async function updateSubject() {
    if (!name.trim()) {
      alert("Enter subject name.");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("Subject")
      .update({
        name: name.trim(),
      })
      .eq("id", id);

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/dashboard/subjects");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050816] text-white flex items-center justify-center">
        Loading...
      </div>
    );
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
            Edit Subject
          </h1>

          <p className="text-slate-400 mt-2 mb-8">
            Update subject details.
          </p>

          <div className="space-y-6">

            <div>

              <label className="block mb-2 text-slate-300">
                Subject Name
              </label>

              <input
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
              />

            </div>

            <div className="flex gap-4 pt-4">

              <button
                onClick={updateSubject}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-6 py-3 rounded-xl font-semibold"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>

              <button
                onClick={() =>
                  router.push("/dashboard/subjects")
                }
                className="bg-slate-700 hover:bg-slate-600 px-6 py-3 rounded-xl font-semibold"
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