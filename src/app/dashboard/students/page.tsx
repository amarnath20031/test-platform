"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);

  useEffect(() => {
    async function getStudents() {
      const { data, error } = await supabase
        .from("Student")
        .select(`
          *,
          institute:Institute(name),
          batch:Batch(name)
        `);

      console.log(data);
      console.log(error);

      if (data) {
        setStudents(data);
      }
    }

    getStudents();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">
        Students
      </h1>

      <a
        href="/dashboard/students/new"
        className="bg-black text-white px-4 py-2 rounded"
      >
        Add Student
      </a>

      <div className="mt-8 space-y-4">
        {students.map((student) => (
          <div
            key={student.id}
            className="border p-4 rounded"
          >
            <h2 className="font-bold">
              {student.name}
            </h2>

            <p>Email: {student.email || "-"}</p>
            <p>Institute: {student.institute?.name}</p>
            <p>Batch: {student.batch?.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}