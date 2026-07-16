"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function NewBatchPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [instituteId, setInstituteId] = useState("");
  const [institutes, setInstitutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function getInstitutes() {
      const { data } = await supabase
        .from("Institute")
        .select("*")
        .order("name");

      if (data) {
        setInstitutes(data);
      }
    }

    getInstitutes();
  }, []);

  async function createBatch() {
    if (!name || !instituteId) {
      alert("Please fill all fields.");
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from("Batch")
      .insert([
        {
          id: crypto.randomUUID(),
          name,
          instituteId,
        },
      ]);

    setLoading(false);

    if (error) {
      console.log(error);
      alert(error.message);
      return;
    }

    router.push("/dashboard/batches");
  }

  return (
    <div className="p-8 max-w-xl">
      <h1 className="text-3xl font-bold mb-6">
        Add Batch
      </h1>

      <div className="space-y-4">
        <input
          className="border p-3 rounded w-full"
          placeholder="Batch Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
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

        <button
          onClick={createBatch}
          disabled={loading}
          className="bg-black text-white px-5 py-3 rounded"
        >
          {loading ? "Saving..." : "Save Batch"}
        </button>
      </div>
    </div>
  );
}