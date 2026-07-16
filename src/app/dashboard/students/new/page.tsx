"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function NewStudentPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [instituteId, setInstituteId] = useState("");
  const [batchId, setBatchId] = useState("");

  const [institutes, setInstitutes] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      const { data: instituteData } = await supabase
        .from("Institute")
        .select("*")
        .order("name");

      const { data: batchData } = await supabase
        .from("Batch")
        .select("*")
        .order("name");

      if (instituteData) {
        setInstitutes(instituteData);
      }

      if (batchData) {
        setBatches(batchData);
      }
    }

    loadData();
  }, []);

  async function createStudent() {
    if (!name || !instituteId) {
      alert("Please fill required fields.");
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from("Student")
      .insert([
        {
          id: crypto.randomUUID(),
          name,
          email,
          instituteId,
          batchId: batchId || null,
        },
      ]);

    setLoading(false);

    if (error) {
      console.log(error);
      alert(error.message);
      return;
    }

    router.push("/dashboard/students");
  }

  return (
    <div className="p-8 max-w-xl">
      <h1 className="text-3xl font-bold mb-6">
        Add Student
      </h1>

      <div className="space-y-4">
        <input
          className="border p-3 rounded w-full"
          placeholder="Student Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="border p-3 rounded w-full"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <select
          className="border p-3 rounded w-full"
          value={instituteId}
          onChange={(e) => setInstituteId(e.target.value)}
        >
          <option value="">
            Select Institute
          </option>

          {institutes.map((institute) => (
            <option
              key={institute.id}
              value={institute.id}
            >
              {institute.name}
            </option>
          ))}
        </select>

        <select
          className="border p-3 rounded w-full"
          value={batchId}
          onChange={(e) => setBatchId(e.target.value)}
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
          {loading ? "Saving..." : "Save Student"}
        </button>
      </div>
    </div>
  );
}