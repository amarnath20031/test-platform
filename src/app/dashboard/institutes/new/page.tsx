"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function NewInstitutePage() {
  const [name, setName] = useState("");

  async function createInstitute() {
    const { data, error } = await supabase
      .from("Institute")
      .insert([
        {
          id: crypto.randomUUID(),
          name,
        },
      ])
      .select();

    console.log(data);
    console.log(error);

    if (!error) {
      alert("Institute created!");
      setName("");
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">
        Add Institute
      </h1>

      <input
        type="text"
        placeholder="Institute Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2 rounded w-96"
      />

      <br />

      <button
        onClick={createInstitute}
        className="bg-black text-white px-4 py-2 rounded mt-4"
      >
        Save
      </button>
    </div>
  );
}