"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function InstitutesPage() {
  const [institutes, setInstitutes] = useState<any[]>([]);

  async function getInstitutes() {
    const { data, error } = await supabase
      .from("Institute")
      .select("*");

    console.log("DATA:", data);
    console.log("ERROR:", error);

    if (data) {
      setInstitutes(data);
    }
  }

  useEffect(() => {
    getInstitutes();
  }, []);

  async function deleteInstitute(id: string) {
    const { error } = await supabase
      .from("Institute")
      .delete()
      .eq("id", id);

    console.log("DELETE ERROR:", error);

    if (!error) {
      getInstitutes();
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">
        Institutes
      </h1>

      <a
        href="/dashboard/institutes/new"
        className="bg-black text-white px-4 py-2 rounded"
      >
        Add Institute
      </a>

      <div className="mt-8">
        {institutes.length === 0 ? (
          <p>No institutes found.</p>
        ) : (
          institutes.map((institute) => (
            <div
              key={institute.id}
              className="border p-4 rounded mb-4 flex justify-between items-center"
            >
              <div>
  <p>{institute.name}</p>
</div>

              <div className="flex gap-2">
  <a
    href={`/dashboard/institutes/${institute.id}`}
    className="bg-blue-500 text-white px-3 py-1 rounded"
  >
    Edit
  </a>

  <button
    onClick={() => deleteInstitute(institute.id)}
    className="bg-red-500 text-white px-3 py-1 rounded"
  >
    Delete
  </button>
</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}