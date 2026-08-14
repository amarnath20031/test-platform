"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function EditStudentPage() {
  const params = useParams();
  const router = useRouter();

  const studentId = params.id as string;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [batchId, setBatchId] = useState("");

  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { data: profile } = await supabase
      .from("profile")
      .select("instituteId")
      .eq("id", user.id)
      .single();

    if (!profile) return;

    const { data: batchData } = await supabase
      .from("Batch")
      .select("*")
      .eq("instituteId", profile.instituteId)
      .order("name");

    if (batchData) {
      setBatches(batchData);
    }

    const { data: student } = await supabase
      .from("Student")
      .select("*")
      .eq("id", studentId)
      .single();

    if (student) {
      setName(student.name || "");
      setEmail(student.email || "");
      setBatchId(student.batchId || "");
    }

    setLoading(false);
  }

  async function saveStudent() {
    if (!name || !email) {
      alert("Fill all required fields.");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("Student")
      .update({
        name,
        email,
        batchId,
      })
      .eq("id", studentId);

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Student updated successfully.");

    router.push("/dashboard/students");
  }

   if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050914] text-white">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050914] text-white py-12 px-6">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-5 mb-8">
          <div className="w-14 h-14 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-3xl">
            🎓
          </div>

          <div>
            <h1 className="text-4xl font-bold">
              Edit Student
            </h1>

            <p className="text-gray-400 mt-1">
              Update student details and batch assignment.
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-[#111a2e] border border-slate-700 rounded-2xl p-8 shadow-xl">

          {/* Student Name */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-white mb-2">
              Student Name
            </label>

            <input
              className="w-full bg-[#1d293d] border border-slate-600 rounded-xl px-5 py-4 text-white placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Enter student name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Student Email */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-white mb-2">
              Student Email
            </label>

            <input
              type="email"
              className="w-full bg-[#1d293d] border border-slate-600 rounded-xl px-5 py-4 text-white placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Enter student email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Batch */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-white mb-2">
              Batch
            </label>

            <select
              className="w-full bg-[#1d293d] border border-slate-600 rounded-xl px-5 py-4 text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
            >
              <option value="">Select Batch</option>

              {batches.map((batch) => (
                <option
                  key={batch.id}
                  value={batch.id}
                >
                  {batch.name}
                </option>
              ))}
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">

            <button
              onClick={saveStudent}
              disabled={saving}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 disabled:cursor-not-allowed text-white font-semibold px-6 py-4 rounded-xl transition"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>

            <button
              onClick={() =>
                router.push("/dashboard/students")
              }
              disabled={saving}
              className="px-8 py-4 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white font-semibold rounded-xl transition"
            >
              Cancel
            </button>

          </div>

        </div>
      </div>
    </div>
  );
}