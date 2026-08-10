"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";

export default function ReportsPage() {
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentsAttempted, setStudentsAttempted] = useState(0);
const [averageScore, setAverageScore] = useState("0");

  useEffect(() => {
    loadTests();
  }, []);

  async function loadTests() {
    setLoading(true);

    const { data, error } = await supabase
  .from("Test")
  .select(`
    *,
    Question(id)
  `)
  .order("title");

    if (!error && data) {
        console.log(data);
  setTests(data);

  const { data: attempts } = await supabase
  .from("Attempt")
  .select("studentId, score");

  if (attempts) {
    const uniqueStudents = new Set(
      attempts.map((a) => a.studentId)
    );

    setStudentsAttempted(uniqueStudents.size);

    const avg =
      attempts.length > 0
        ? attempts.reduce(
            (sum, a) => sum + (a.score || 0),
            0
          ) / attempts.length
        : 0;

    setAverageScore(avg.toFixed(2));
  }
}

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">

      <div className="flex items-center justify-between mb-10">

        <div>
          <h1 className="text-4xl font-bold">
            Reports
          </h1>

          <p className="text-slate-400 mt-2">
            View test reports and student performance.
          </p>
        </div>

      </div>

      {/* Summary */}

      <div className="grid md:grid-cols-4 gap-6 mb-10">

        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
          <p className="text-slate-400 text-sm">
            Total Tests
          </p>

          <h2 className="text-4xl font-bold mt-2">
            {tests.length}
          </h2>
        </div>

        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
          <p className="text-slate-400 text-sm">
            Reports Ready
          </p>

          <h2 className="text-4xl font-bold mt-2">
            {tests.length}
          </h2>
        </div>

        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
          <p className="text-slate-400 text-sm">
            Students Attempted
          </p>

         <h2 className="text-4xl font-bold mt-2">
  {studentsAttempted}
</h2>
        </div>

        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
          <p className="text-slate-400 text-sm">
            Average Score
          </p>

          <h2 className="text-4xl font-bold mt-2">
  {averageScore}
</h2>
        </div>

      </div>

      {/* Tests */}

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">

        <div className="px-6 py-5 border-b border-slate-800">

          <h2 className="text-2xl font-bold">
            Test Reports
          </h2>

        </div>

        {loading ? (

          <div className="p-8 text-slate-400">
            Loading...
          </div>

        ) : tests.length === 0 ? (

          <div className="p-8 text-slate-400">
            No tests found.
          </div>

        ) : (

          <table className="w-full">

            <thead className="bg-slate-800">

              <tr>

                <th className="text-left p-4">
                  Test
                </th>

                <th className="text-left p-4">
                  Duration
                </th>

                <th className="text-left p-4">
                  Marks
                </th>

                <th className="text-right p-4">
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {tests.map((test) => (

                <tr
                  key={test.id}
                  className="border-t border-slate-800"
                >

                  <td className="p-4 font-semibold">
                    {test.title}
                  </td>

                  <td className="p-4">
                    {test.durationHours || 0}h {test.durationMinutes || 0}m {test.durationSeconds || 0}s
                  </td>

                 <td className="p-4">
  {test.totalMarks}
</td>

                  <td className="p-4 text-right">

                    <Link
                      href={`/dashboard/reports/${test.id}`}
                      className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-xl"
                    >
                      View Report
                    </Link>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        )}

      </div>

    </div>
  );
}