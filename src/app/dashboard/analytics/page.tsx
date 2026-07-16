"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function AnalyticsPage() {
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics() {
    const { data } = await supabase
  .from("Attempt")
  .select(`
    *,
    student:Student(name),
    test:Test(title)
  `)
  .order("rank", {
    ascending: true,
  });

    if (data) {
      setAttempts(data);
    }

    setLoading(false);
  }

  const totalAttempts = attempts.length;

  const averageScore =
    totalAttempts > 0
      ? (
          attempts.reduce(
            (sum, a) => sum + (a.score || 0),
            0
          ) / totalAttempts
        ).toFixed(2)
      : "0";

  const averagePercentage =
    totalAttempts > 0
      ? (
          attempts.reduce(
            (sum, a) =>
              sum + (a.percentage || 0),
            0
          ) / totalAttempts
        ).toFixed(2)
      : "0";

  const topStudents = [...attempts]
    .sort(
      (a, b) =>
        (b.score || 0) -
        (a.score || 0)
    )
    .slice(0, 5);

  if (loading) {
    return (
      <div className="p-8 text-white">
        Loading Analytics...
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 text-white">
      <h1 className="text-4xl font-bold">
        Analytics Dashboard
      </h1>

      {/* Stats Cards */}

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gray-900 border border-gray-700 rounded-xl shadow p-6">
          <p className="text-gray-400">
            Total Attempts
          </p>

          <h2 className="text-4xl font-bold text-blue-400">
            {totalAttempts}
          </h2>
        </div>

        <div className="bg-gray-900 border border-gray-700 rounded-xl shadow p-6">
          <p className="text-gray-400">
            Average Score
          </p>

          <h2 className="text-4xl font-bold text-green-400">
            {averageScore}
          </h2>
        </div>

        <div className="bg-gray-900 border border-gray-700 rounded-xl shadow p-6">
          <p className="text-gray-400">
            Average Percentage
          </p>

          <h2 className="text-4xl font-bold text-yellow-400">
            {averagePercentage}%
          </h2>
        </div>
      </div>

      {/* Top Students */}

      <div className="bg-gray-900 border border-gray-700 rounded-xl shadow p-6">
        <h2 className="text-2xl font-bold mb-4">
          Top Students
        </h2>

        <div className="space-y-4">
          {topStudents.length === 0 && (
            <p className="text-gray-400">
              No attempts yet.
            </p>
          )}

          {topStudents.map(
            (attempt, index) => (
              <div
                key={attempt.id}
                className="flex justify-between items-center border-b border-gray-700 pb-3"
              >
                <div>
                  <p className="font-bold">
                    #{index + 1}{" "}
                    {attempt.student?.name}
                  </p>

                  <p className="text-sm text-gray-400">
                    {attempt.test?.title}
                  </p>
                </div>

                <div className="text-green-400 font-bold text-lg">
                  {attempt.score}
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Recent Attempts */}

      <div className="bg-gray-900 border border-gray-700 rounded-xl shadow p-6">
        <h2 className="text-2xl font-bold mb-4">
          Recent Attempts
        </h2>

        <div className="overflow-auto">
          <table className="w-full text-white">
            <thead>
              <tr className="border-b border-gray-700 text-gray-400">
                <th className="text-left p-3">
                  Rank
                </th>

               <th className="text-left p-3">
                  Student
               </th>

                <th className="text-left p-3">
                  Test
                </th>

                <th className="text-left p-3">
                  Score
                </th>

                <th className="text-left p-3">
                  %
                </th>

                <th className="text-left p-3">
                  Correct
                </th>

                <th className="text-left p-3">
                  Wrong
                </th>

                <th className="text-left p-3">
                  Skipped
                </th>

                <th className="text-left p-3">
                  Time
                </th>
              </tr>
            </thead>

            <tbody>
              {attempts.map(
                (attempt) => (
                  <tr
                    key={attempt.id}
                    className="border-b border-gray-700 hover:bg-gray-800"
                  >
                    <td className="p-3">
                     {attempt.rank === 1
                       ? "🥇"
                       : attempt.rank === 2
                       ? "🥈"
                       : attempt.rank === 3
                       ? "🥉"
                       : `#${attempt.rank}`}
                    </td>

                    <td className="p-3">
                      {attempt.student?.name}
                    </td>

                    <td className="p-3">
                      {attempt.test?.title}
                    </td>

                    <td className="p-3 text-green-400 font-semibold">
                      {attempt.score}
                    </td>

                    <td className="p-3">
                      {attempt.percentage?.toFixed(
                        2
                      )}
                      %
                    </td>

                    <td className="p-3 text-green-400">
                      {
                        attempt.correctAnswers
                      }
                    </td>

                    <td className="p-3 text-red-400">
                      {
                        attempt.wrongAnswers
                      }
                    </td>

                    <td className="p-3 text-yellow-400">
                      {
                        attempt.skippedAnswers
                      }
                    </td>

                    <td className="p-3">
                      {Math.floor(
                        (attempt.timeTaken ||
                          0) / 60
                      )}
                      m{" "}
                      {(attempt.timeTaken ||
                        0) % 60}
                      s
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}