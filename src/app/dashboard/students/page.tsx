"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function StudentsPage() {
  const router = useRouter();

  const [students, setStudents] = useState<any[]>([]);

  async function loadStudents() {
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

  useEffect(() => {
    loadStudents();
  }, []);

  async function deleteStudent(id: string) {
    if (!confirm("Delete this student?")) return;

    const { error } = await supabase
      .from("Student")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadStudents();
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          Students
        </h1>

        <div className="flex gap-3">
          <button
            onClick={() =>
              router.push("/dashboard/students/import")
            }
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-xl"
          >
            📥 Import Students
          </button>

          <button
            onClick={() =>
              router.push("/dashboard/students/new")
            }
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl"
          >
            ➕ Add Student
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {students.map((student) => (
          <div
            key={student.id}
            className="border border-slate-700 bg-slate-900 rounded-2xl p-5 flex justify-between items-center"
          >
            <div>
              <h2 className="text-xl font-bold text-white">
                {student.name}
              </h2>

              <p className="text-gray-300 mt-2">
                📧 {student.email || "-"}
              </p>

              <p className="text-gray-400">
                🏫 {student.institute?.name}
              </p>

              <p className="text-gray-400">
                👥 {student.batch?.name || "-"}
              </p>
            </div>

           <div className="flex gap-3">

  <button
    onClick={() =>
      router.push(
        `/dashboard/students/edit/${student.id}`
      )
    }
    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl"
  >
    Edit
  </button>

  <button
    onClick={() =>
      router.push(
        `/dashboard/students/${student.id}/analytics`
      )
    }
    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl"
  >
    Analytics
  </button>

  <button
    onClick={() =>
      deleteStudent(student.id)
    }
    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl"
  >
    Delete
  </button>

</div>
          </div>
        ))}

        {students.length === 0 && (
          <div className="text-center text-gray-400 py-16">
            No students found.
          </div>
        )}
      </div>
    </div>
  );
}