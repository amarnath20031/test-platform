"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default function EditInstitutePage({ params }: Props) {
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInstitute() {
      const { id } = await params;
      setId(id);

      const { data, error } = await supabase
        .from("Institute")
        .select("*")
        .eq("id", id)
        .single();

      console.log("DATA:", data);
      console.log("ERROR:", error);

      if (data) {
        setName(data.name);
      }

      setLoading(false);
    }

    loadInstitute();
  }, [params]);

  async function updateInstitute() {
    const { error } = await supabase
      .from("Institute")
      .update({
        name,
      })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Institute updated!");
  }

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">
        Edit Institute
      </h1>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2 rounded w-full"
        placeholder="Institute Name"
      />

      <button
        onClick={updateInstitute}
        className="mt-4 bg-black text-white px-4 py-2 rounded"
      >
        Save
      </button>
    </div>
  );
}