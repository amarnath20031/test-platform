"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function NewStudentPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [batchId, setBatchId] = useState("");
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadBatches() {
      const { data, error } = await supabase
        .from("Batch")
        .select("*")
        .order("name");

      console.log("Batches:", data);
      console.log(error);

      if (data) {
        setBatches(data);
      }
    }

    loadBatches();
  }, []);

  async function createStudent() {
    if (!name || !email || !batchId) {
      alert("Fill all fields");
      return;
    }

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      alert("Please login again.");
      return;
    }

    // Get the institute belonging to the currently logged-in institute account
    const { data: profile, error: profileError } = await supabase
      .from("profile")
      .select("instituteId")
      .eq("id", user.id)
      .single();

    if (profileError || !profile?.instituteId) {
      setLoading(false);
      alert("Institute profile not found.");
      return;
    }

    const response = await fetch("/api/auth/create-student", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        instituteId: profile.instituteId,
        batchId,
      }),
    });

    const result = await response.json();

    setLoading(false);

    if (!response.ok) {
      alert(result.error || "Failed to create student.");
      return;
    }

    alert(
      `Student Created Successfully!

Email:
${email}

Temporary Password:
${result.password}`
    );

    setName("");
    setEmail("");
    setBatchId("");
  }

  return (
  <div className="min-h-screen bg-[#070b14] text-white px-6 py-10">
    <div className="max-w-3xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-2xl">
            🎓
          </div>

          <div>
            <h1 className="text-3xl font-bold">
              Add Student
            </h1>
            <p className="text-gray-400 mt-1">
              Create a new student account and assign them to a batch.
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-[#111827] border border-gray-700/60 rounded-2xl p-8 shadow-xl">

        {/* Student Name */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-200 mb-2">
            Student Name
          </label>

          <input
            type="text"
            placeholder="Enter student name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl bg-[#1e293b] border border-gray-700 px-4 py-3.5 text-white placeholder-gray-500 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Email */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-200 mb-2">
            Student Email
          </label>

          <input
            type="email"
            placeholder="Enter student email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl bg-[#1e293b] border border-gray-700 px-4 py-3.5 text-white placeholder-gray-500 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Batch */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-200 mb-2">
            Batch
          </label>

          <select
            value={batchId}
            onChange={(e) => setBatchId(e.target.value)}
            className="w-full rounded-xl bg-[#1e293b] border border-gray-700 px-4 py-3.5 text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">
              Select Batch
            </option>

            {batches.map((batch) => (
              <option key={batch.id} value={batch.id}>
                {batch.name}
              </option>
            ))}
          </select>
        </div>

        {/* Button */}
        <button
          onClick={createStudent}
          disabled={loading}
          className="w-full rounded-xl bg-green-600 hover:bg-green-500 disabled:bg-green-800 disabled:cursor-not-allowed px-5 py-3.5 font-semibold text-white transition shadow-lg shadow-green-900/20"
        >
          {loading ? "Creating Student..." : "Create Student"}
        </button>

      </div>
    </div>
  </div>
);
}