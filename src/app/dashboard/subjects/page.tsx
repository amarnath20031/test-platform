"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<any[]>([]);

  useEffect(() => {
    async function getSubjects() {
      const { data, error } = await supabase
        .from("Subject")
        .select(`
          *,
          institute:Institute(name)
        `);

      console.log(data);
      console.log(error);

      if (data) {
        setSubjects(data);
      }
    }

    getSubjects();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">
        Subjects
      </h1>

      <a
        href="/dashboard/subjects/new"
        className="bg-black text-white px-4 py-2 rounded"
      >
        Add Subject
      </a>

      <div className="mt-8 space-y-4">
        {subjects.map((subject) => (
          <div
            key={subject.id}
            className="border p-4 rounded"
          >
            <h2 className="font-bold">
              {subject.name}
            </h2>

            <p>
              Institute:
              {" "}
              {subject.institute?.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}