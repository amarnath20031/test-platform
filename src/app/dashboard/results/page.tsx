"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function ResultsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    loadResults();
  }, []);

  async function loadResults() {
  const { data, error } = await supabase
  .from("TestAssignment")
  .select(`
    *,
    Student(name),
    Test(title)
  `)
  .order("assignedAt", {
    ascending: false,
  });

  console.log(data?.[0]);
  console.log("Error:", error);

  if (data) {
    setRows(data);
  }
}

  return (
    <main className="min-h-screen bg-slate-950 text-white p-10">
      <h1 className="text-4xl font-bold mb-10">
        📊 Test Results
      </h1>

      <div className="rounded-3xl overflow-hidden border border-slate-800">
        <table className="w-full">
          <thead className="bg-slate-900">
            <tr>
              <th className="text-left p-5">Student</th>
              <th className="text-left p-5">Test</th>
              <th className="text-left p-5">Status</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className="border-t border-slate-800"
              >
               <td className="p-5">
  {row.Student?.name}
</td>

<td className="p-5">
  {row.Test?.title}
</td>

                <td className="p-5">
                  {row.status === "completed" ? (
  <button
    onClick={() =>
      router.push(`/dashboard/student-analysis/${row.attemptId}`)
    }
    className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-semibold"
  >
    View Analytics
  </button>
) : (
  <span className="text-yellow-400 font-semibold">
    Pending
  </span>
)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {rows.length === 0 && (
          <div className="p-8 text-center text-gray-400">
            No test assignments found.
          </div>
        )}
      </div>
    </main>
  );
}