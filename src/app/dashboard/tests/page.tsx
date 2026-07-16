"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function TestsPage() {
  const [tests, setTests] = useState<any[]>([]);

  useEffect(() => {
    async function getTests() {
      const { data, error } = await supabase
        .from("Test")
        .select(`
          *,
          institute:Institute(name),
          subject:Subject(name)
        `);

      console.log(data);
      console.log(error);

      if (data) {
        setTests(data);
      }
    }

    getTests();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">
        Tests
      </h1>

      <a
        href="/dashboard/tests/new"
        className="bg-black text-white px-4 py-2 rounded"
      >
        Add Test
      </a>

      <div className="mt-8 space-y-4">
        {tests.map((test) => (
          <div
            key={test.id}
            className="border p-4 rounded"
          >
            <h2 className="font-bold">
              {test.title}
            </h2>

            <p>
              Institute: {test.institute?.name}
            </p>

            <p>
              Subject: {test.subject?.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}