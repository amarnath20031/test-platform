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
      <div className="p-8 text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-xl p-8">

      <h1 className="text-3xl font-bold mb-8">
        Edit Student
      </h1>

      <input
        className="border p-3 rounded w-full mb-4"
        placeholder="Student Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        className="border p-3 rounded w-full mb-4"
        placeholder="Student Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <select
        className="border p-3 rounded w-full mb-6"
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

      <div className="flex gap-3">

        <button
          onClick={saveStudent}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl"
        >
          {saving ? "Saving..." : "Save"}
        </button>

        <button
          onClick={() =>
            router.push("/dashboard/students")
          }
          className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl"
        >
          Cancel
        </button>

      </div>
    </div>
  );
}