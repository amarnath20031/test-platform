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

    // Get institute id
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
      alert(result.error);
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
    <div className="max-w-xl p-8">

      <h1 className="text-3xl font-bold mb-6">
        Add Student
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
        value={batchId}
        onChange={(e) => setBatchId(e.target.value)}
        className="border p-3 rounded w-full mb-6"
      >
        <option value="">
          Select Batch
        </option>

        {batches.map((batch) => (
          <option
            key={batch.id}
            value={batch.id}
          >
            {batch.name}
          </option>
        ))}
      </select>

      <button
        onClick={createStudent}
        disabled={loading}
        className="bg-black text-white px-5 py-3 rounded"
      >
        {loading ? "Creating..." : "Create Student"}
      </button>

    </div>
  );
}