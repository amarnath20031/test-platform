"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function AttemptsPage() {
  const [attempts, setAttempts] = useState<any[]>([]);

  useEffect(() => {
    async function getAttempts() {
      const { data } = await supabase
        .from("Attempt")
        .select(`
          *,
          student:Student(name),
          test:Test(title)
        `);

      if (data) {
        setAttempts(data);
      }
    }

    getAttempts();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">
        Attempts
      </h1>

      <a
        href="/dashboard/attempts/new"
        className="bg-black text-white px-4 py-2 rounded"
      >
        Take Test
      </a>

      <div className="mt-8 space-y-4">
        {attempts.map((attempt) => (
          <div
            key={attempt.id}
            className="border p-4 rounded"
          >
            <p>
              Student:
              {" "}
              {attempt.student?.name}
            </p>

            <p>
              Test:
              {" "}
              {attempt.test?.title}
            </p>

            <p>
              Score:
              {" "}
              {attempt.score}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}