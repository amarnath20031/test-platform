"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Attempt = {
  id: string;
  testId: string;
  score: number;
  percentage: number;
  correctAnswers: number;
  wrongAnswers: number;
  skippedAnswers: number;
  rank: number;
  timeTaken: number;
  createdAt: string;
  Test: {
    title: string;
  };
};

export default function AnalyticsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const [studentName, setStudentName] = useState("");
  const [mode, setMode] = useState<"official" | "practice">("official");
const [officialAttempts, setOfficialAttempts] = useState<Attempt[]>([]);
const [practiceAttempts, setPracticeAttempts] = useState<Attempt[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, []);

 async function loadAnalytics() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    router.push("/student/login");
    return;
  }

  const { data: profile } = await supabase
    .from("profile")
    .select("studentId")
    .eq("id", user.id)
    .single();

  if (!profile) {
    router.push("/student/login");
    return;
  }

  const { data: student } = await supabase
    .from("Student")
    .select("name")
    .eq("id", profile.studentId)
    .single();

  if (student) {
    setStudentName(student.name);
  }

 const { data } = await supabase
  .from("Attempt")
  .select(`
    *,
    Test(title)
  `)
  .eq("studentId", profile.studentId)
  .order("createdAt", {
    ascending: false,
  });

  console.table(
  (data || []).map((a: any) => ({
    test: a.Test?.title,
    score: a.score,
    percentage: a.percentage,
    isPractice: a.isPractice,
  }))
);

const official = (data || []).filter(
  (a: any) => !a.isPractice
);

const practice = (data || []).filter(
  (a: any) => a.isPractice
);

const latestOfficial = Object.values(
  official.reduce((acc: any, attempt: any) => {
    if (
      !acc[attempt.testId] ||
      new Date(attempt.createdAt) >
        new Date(acc[attempt.testId].createdAt)
    ) {
      acc[attempt.testId] = attempt;
    }

    return acc;
  }, {})
);

setOfficialAttempts(latestOfficial as Attempt[]);
setPracticeAttempts(practice as Attempt[]);

  setLoading(false);
}

  const attempts =
  mode === "official"
    ? officialAttempts
    : practiceAttempts;

const totalTests = attempts.length;

  const averageScore = useMemo(() => {
    if (!attempts.length) return 0;

    const total = attempts.reduce(
      (sum, a) => sum + Number(a.score),
      0
    );

    return Math.round(total / attempts.length);
  }, [attempts]);

  const averagePercentage = useMemo(() => {
    if (!attempts.length) return 0;

    const total = attempts.reduce(
      (sum, a) => sum + Number(a.percentage),
      0
    );

    return Math.round(total / attempts.length);
  }, [attempts]);

  const bestScore = useMemo(() => {
    if (!attempts.length) return 0;

    return Math.max(
      ...attempts.map((a) => Number(a.score))
    );
  }, [attempts]);

  const bestPercentage = useMemo(() => {
    if (!attempts.length) return 0;

    return Math.max(
      ...attempts.map((a) => Number(a.percentage))
    );
  }, [attempts]);

  const averageRank = useMemo(() => {
    if (!attempts.length) return "-";

    const total = attempts.reduce(
      (sum, a) => sum + Number(a.rank || 0),
      0
    );

    return Math.round(total / attempts.length);
  }, [attempts]);

  const totalCorrect = useMemo(() => {
    return attempts.reduce(
      (sum, a) => sum + Number(a.correctAnswers),
      0
    );
  }, [attempts]);

  const totalWrong = useMemo(() => {
    return attempts.reduce(
      (sum, a) => sum + Number(a.wrongAnswers),
      0
    );
  }, [attempts]);

  const totalSkipped = useMemo(() => {
    return attempts.reduce(
      (sum, a) => sum + Number(a.skippedAnswers),
      0
    );
  }, [attempts]);

  const totalTime = useMemo(() => {
    return attempts.reduce(
      (sum, a) => sum + Number(a.timeTaken),
      0
    );
  }, [attempts]);

  function formatTime(seconds: number) {
    const h = Math.floor(seconds / 3600);

    const m = Math.floor(
      (seconds % 3600) / 60
    );

    const s = seconds % 60;

    return `${h}h ${m}m ${s}s`;
  }
  const chartData = attempts.map((attempt, index) => ({
  attempt: index + 1,
  score: Number(attempt.score),
  percentage: Number(attempt.percentage),
  rank: Number(attempt.rank),
  time: Number(attempt.timeTaken),
}));

  if (loading) {
    
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Loading Analytics...
      </div>
    );
  }

  

  return (
    <div className="min-h-screen bg-slate-950 text-white p-10">

      <div className="flex justify-between items-center">

  <div>

    <h1 className="text-4xl font-bold">
      Performance Analytics
    </h1>

    <p className="text-slate-400 mt-2">
      Welcome, {studentName}
    </p>

  </div>

  <div className="flex bg-slate-800 rounded-xl p-1">

    <button
      onClick={() => setMode("official")}
      className={`px-6 py-2 rounded-lg transition ${
        mode === "official"
          ? "bg-blue-600"
          : ""
      }`}
    >
      Official Tests
    </button>

    <button
      onClick={() => setMode("practice")}
      className={`px-6 py-2 rounded-lg transition ${
        mode === "practice"
          ? "bg-green-600"
          : ""
      }`}
    >
      Practice Tests
    </button>

  </div>

</div>

      <div className="grid grid-cols-4 gap-6 mt-10">

        <div className="rounded-2xl bg-slate-900 p-6">
          <p className="text-slate-400">
            {mode === "official"
  ? "Official Tests"
  : "Practice Attempts"}
          </p>

          <h2 className="text-4xl font-bold mt-3">
            {totalTests}
          </h2>
        </div>

      {mode === "official" && (
  <div className="rounded-2xl bg-slate-900 p-6">
    <p className="text-slate-400">
      Average Rank
    </p>

    <h2 className="text-4xl font-bold mt-3 text-yellow-400">
      #{averageRank}
    </h2>
  </div>
)}

        <div className="rounded-2xl bg-slate-900 p-6">
          <p className="text-slate-400">
            {mode === "official"
  ? "Average %"
  : "Practice Accuracy"}
          </p>

          <h2 className="text-4xl font-bold mt-3">
            {Math.round(averagePercentage)}%
          </h2>
        </div>

        <div className="rounded-2xl bg-slate-900 p-6">
          <p className="text-slate-400">
            {mode === "official"
  ? "Best Score"
  : "Best Practice Score"}
          </p>

          <h2 className="text-4xl font-bold mt-3">
            {bestScore}
          </h2>
        </div>

      </div>
            <div className="grid grid-cols-4 gap-6 mt-6">

        <div className="rounded-2xl bg-slate-900 p-6">
          <p className="text-slate-400">
            Best %
          </p>

          <h2 className="text-4xl font-bold mt-3 text-green-400">
            {Math.round(bestPercentage)}%
          </h2>
        </div>

        <div className="rounded-2xl bg-slate-900 p-6">
          <p className="text-slate-400">
            Average Rank
          </p>

          <h2 className="text-4xl font-bold mt-3 text-yellow-400">
            #{averageRank}
          </h2>
        </div>

        <div className="rounded-2xl bg-slate-900 p-6">
          <p className="text-slate-400">
            Correct
          </p>

          <h2 className="text-4xl font-bold mt-3 text-green-500">
            {totalCorrect}
          </h2>
        </div>

        <div className="rounded-2xl bg-slate-900 p-6">
          <p className="text-slate-400">
            Wrong
          </p>

          <h2 className="text-4xl font-bold mt-3 text-red-500">
            {totalWrong}
          </h2>
        </div>

      </div>

      <div className="grid grid-cols-2 gap-8 mt-10">

        <div className="rounded-3xl bg-slate-900 p-8">

          <h2 className="text-2xl font-bold mb-8">
            Overall Accuracy
          </h2>

          <div className="mb-6">

            <div className="flex justify-between mb-2">

              <span>Correct</span>

              <span>{totalCorrect}</span>

            </div>

            <div className="h-4 bg-slate-700 rounded-full overflow-hidden">

              <div
                className="h-full bg-green-500"
                style={{
                  width: `${
                    totalCorrect + totalWrong + totalSkipped === 0
                      ? 0
                      : (totalCorrect /
                          (totalCorrect +
                            totalWrong +
                            totalSkipped)) *
                        100
                  }%`,
                }}
              />

            </div>

          </div>

          <div className="mb-6">

            <div className="flex justify-between mb-2">

              <span>Wrong</span>

              <span>{totalWrong}</span>

            </div>

            <div className="h-4 bg-slate-700 rounded-full overflow-hidden">

              <div
                className="h-full bg-red-500"
                style={{
                  width: `${
                    totalCorrect + totalWrong + totalSkipped === 0
                      ? 0
                      : (totalWrong /
                          (totalCorrect +
                            totalWrong +
                            totalSkipped)) *
                        100
                  }%`,
                }}
              />

            </div>

          </div>

          <div>

            <div className="flex justify-between mb-2">

              <span>Skipped</span>

              <span>{totalSkipped}</span>

            </div>

            <div className="h-4 bg-slate-700 rounded-full overflow-hidden">

              <div
                className="h-full bg-gray-500"
                style={{
                  width: `${
                    totalCorrect + totalWrong + totalSkipped === 0
                      ? 0
                      : (totalSkipped /
                          (totalCorrect +
                            totalWrong +
                            totalSkipped)) *
                        100
                  }%`,
                }}
              />

            </div>

          </div>

        </div>

        <div className="rounded-3xl bg-slate-900 p-8">

          <h2 className="text-2xl font-bold mb-8">
            Performance Summary
          </h2>

          <div className="space-y-6">

            <div className="flex justify-between">

              <span className="text-slate-400">
                Total Time
              </span>

              <span className="font-bold">
                {formatTime(totalTime)}
              </span>

            </div>

            <div className="flex justify-between">

              <span className="text-slate-400">
                Tests Taken
              </span>

              <span className="font-bold">
                {totalTests}
              </span>

            </div>

            <div className="flex justify-between">

              <span className="text-slate-400">
                Best Percentage
              </span>

              <span className="font-bold text-green-400">
                {Math.round(bestPercentage)}%
              </span>

            </div>

            <div className="flex justify-between">

              <span className="text-slate-400">
                Average Percentage
              </span>

              <span className="font-bold text-blue-400">
              {Math.round(averagePercentage)}%
              </span>

            </div>

            {mode === "official" && (
  <div className="flex justify-between">

    <span className="text-slate-400">
      Average Rank
    </span>

    <span className="font-bold">
      #{averageRank}
    </span>

  </div>
)}

          </div>

        </div>

      </div>
            {/* Recent Attempts */}

      <div className="mt-10 rounded-3xl bg-slate-900 p-8">

        <h2 className="text-2xl font-bold mb-6">
          {mode === "official"
  ? "Recent Official Tests"
  : "Recent Practice Tests"}
        </h2>

        {attempts.length === 0 ? (

          <p className="text-slate-400">
            No attempts yet.
          </p>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full">

             <thead>
  <tr className="border-b border-slate-700 text-left">
    <th className="py-3">Test</th>
    <th className="py-3">Score</th>
    <th className="py-3">%</th>
    <th className="py-3">Time</th>
    <th className="py-3">Date</th>
  </tr>
</thead>

              <tbody>

                {attempts
                  .slice()
                  .reverse()
                  .map((attempt) => (

                    <tr
                      key={attempt.id}
                      className="border-b border-slate-800 hover:bg-slate-800"
                    >

                      <td className="py-4">
                        {attempt.Test?.title}
                      </td>

                      <td className="py-4 font-semibold">
                        {attempt.score}
                      </td>

                      <td className="py-4 text-green-400">
                        {Math.round(attempt.percentage)}%
                    {mode === "official" && (
  <td className="py-4">
    #{attempt.rank}
  </td>
)}
                      </td>

                      <td className="py-4">
                        {formatTime(attempt.timeTaken)}
                      </td>

                      <td className="py-4 text-slate-400">
                        {new Date(attempt.createdAt)
  .toLocaleDateString("en-GB")
  .replace(/\//g, "-")}
                      </td>

                    </tr>

                  ))}

                           </tbody>

            </table>

          </div>

        )}

      </div>

      {/* Score Progress Chart */}

      <div className="mt-10 rounded-3xl bg-slate-900 p-8">

        <h2 className="text-2xl font-bold mb-8">
          {mode === "official"
  ? "Official Score Progress"
  : "Practice Improvement"}
        </h2>

        <ResponsiveContainer width="100%" height={350}>
  <LineChart data={chartData}>
    <CartesianGrid
      strokeDasharray="3 3"
      stroke="#334155"
    />

    <XAxis
      dataKey="attempt"
      stroke="#94a3b8"
    />

    <YAxis stroke="#94a3b8" />

    <Tooltip
      formatter={(value, name) => {
        if (String(name) === "percentage") {
          return [
            `${Math.round(Number(value))}%`,
            "Percentage",
          ];
        }

        if (String(name) === "score") {
          return [Number(value), "Score"];
        }

        return [value, String(name)];
      }}
    />

    <Line
      type="monotone"
      dataKey="score"
      stroke="#3b82f6"
      strokeWidth={3}
    />

    <Line
      type="monotone"
      dataKey="percentage"
      stroke="#22c55e"
      strokeWidth={3}
    />
  </LineChart>
</ResponsiveContainer>

      </div>

    </div>
  );
}