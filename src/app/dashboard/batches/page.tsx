"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function BatchesPage() {
  const [batches, setBatches] = useState<any[]>([]);

  useEffect(() => {
    async function getBatches() {
      const { data, error } = await supabase
        .from("Batch")
        .select(`
          *,
          institute:Institute(name)
        `);

      console.log(data);
      console.log(error);

      if (data) {
        setBatches(data);
      }
    }

    getBatches();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">
        Batches
      </h1>

      <a
        href="/dashboard/batches/new"
        className="bg-black text-white px-4 py-2 rounded"
      >
        Add Batch
      </a>

      <div className="mt-8 space-y-4">
        {batches.map((batch) => (
          <div
            key={batch.id}
            className="border p-4 rounded"
          >
            <h2 className="font-bold">
              {batch.name}
            </h2>

            <p>
              Institute: {batch.institute?.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}