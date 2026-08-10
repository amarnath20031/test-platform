"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";

export default function ResultsPage() {
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResults();
  }, []);

  async function loadResults() {
    // Logged in user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    // Profile
    const { data: profile } = await supabase
      .from("profile")
      .select("studentId")
      .eq("id", user.id)
      .single();

    if (!profile) return;

    // Attempts
    const { data, error } = await supabase
      .from("Attempt")
      .select(`
        *,
        Test (
          title
        )
      `)
      .eq("studentId", profile.studentId)
      .order("createdAt", {
        ascending: false,
      });

    console.log(data);
    console.log(error);

    if (data) {
      setAttempts(data);
    }

    setLoading(false);
  }

  return (
    <div className="p-8">

      <h1 className="text-4xl font-bold mb-8">
        📊 Results
      </h1>

      {loading && (
        <p>Loading...</p>
      )}

      {!loading && attempts.length === 0 && (
        <p>No attempts found.</p>
      )}

      <div className="space-y-6">

        {attempts.map((attempt, index) => (

          <div
            key={attempt.id}
            className="bg-gray-900 rounded-xl p-6 border border-gray-700"
          >

            <h2 className="text-2xl font-bold">
              {attempt.Test?.title}
            </h2>

            <div className="flex items-center gap-3 mt-2">
  <p className="text-gray-400">
    Attempt {index + 1}
  </p>

  {attempt.isPractice ? (
    <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
      Practice
    </span>
  ) : (
    <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
      Official
    </span>
  )}
</div>

            <div className="grid grid-cols-4 gap-6 mt-6">

              <div>
                <p className="text-gray-400">
                  Score
                </p>

                <p className="text-xl font-bold">
                  {attempt.score}
                </p>
              </div>

              <div>
                <p className="text-gray-400">
                  Percentage
                </p>

               <p className="text-xl font-bold">
  {Math.round(Number(attempt.percentage))}%
</p>
              </div>

              <div>
                <p className="text-gray-400">
                  Rank
                </p>

               <p className="text-xl font-bold">
  {attempt.isPractice
    ? "-"
    : `#${attempt.rank}`}
</p>
              </div>

              <div>
                <p className="text-gray-400">
                  Correct
                </p>

                <p className="text-xl font-bold">
                  {attempt.correctAnswers}
                </p>
              </div>

            </div>

            <Link
              href={`/result/${attempt.id}`}
              className="inline-block mt-6 bg-blue-600 px-5 py-3 rounded-lg"
            >
              View Result
            </Link>

          </div>

        ))}

      </div>

    </div>
  );
}