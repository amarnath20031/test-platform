"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export default function InstituteDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
  students: 0,
  batches: 0,
  subjects: 0,
  tests: 0,

  attempts: 0,
  averageScore: 0,
  averagePercentage: 0,
  averageTime: 0,
});

useEffect(() => {
  loadStats();
}, []);

async function loadStats() {
 const [
  { count: students },
  { count: batches },
  { count: subjects },
  { count: tests },
  { data: attempts },
] = await Promise.all([
    supabase
      .from("Student")
      .select("*", { count: "exact", head: true }),

    supabase
      .from("Batch")
      .select("*", { count: "exact", head: true }),

    supabase
      .from("Subject")
      .select("*", { count: "exact", head: true }),

    supabase
  .from("Test")
  .select("*", { count: "exact", head: true }),

supabase
  .from("Attempt")
  .select("score, percentage, timeTaken")
  .eq("isPractice", false),

]);

  const totalAttempts = attempts?.length || 0;

const avgScore =
  totalAttempts > 0
    ? (attempts ?? []).reduce(
        (sum: number, a: any) =>
          sum + (a.score || 0),
        0
      ) / totalAttempts
    : 0;

const avgPercentage =
  totalAttempts > 0
    ? (attempts ?? []).reduce(
        (sum: number, a: any) =>
          sum + (a.percentage || 0),
        0
      ) / totalAttempts
    : 0;

const avgTime =
  totalAttempts > 0
    ? (attempts ?? []).reduce(
        (sum: number, a: any) =>
          sum + (a.timeTaken || 0),
        0
      ) / totalAttempts
    : 0;

setStats({
  students: students || 0,
  batches: batches || 0,
  subjects: subjects || 0,
  tests: tests || 0,

  attempts: totalAttempts,
  averageScore: avgScore,
  averagePercentage: avgPercentage,
  averageTime: avgTime,
});

}

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  const cards = [
    {
      title: "Students",
      icon: "🎓",
      desc: "Manage students, credentials & performance",
      route: "/dashboard/students",
    },
    {
      title: "Batches",
      icon: "👥",
      desc: "Create and manage student batches",
      route: "/dashboard/batches",
    },
    {
      title: "Subjects",
      icon: "📚",
      desc: "Manage subjects & syllabus",
      route: "/dashboard/subjects",
    },
    {
      title: "Question Bank",
      icon: "❓",
      desc: "Create, import & manage questions",
      route: "/dashboard/questions",
    },
    {
      title: "Tests",
      icon: "📝",
      desc: "Create, assign & monitor tests",
      route: "/dashboard/tests",
    },
    {
      title: "Reports",
      icon: "📊",
      desc: "Results, analytics & exports",
      route: "/dashboard/reports",
    },
    {
  title: "Analytics",
  icon: "📊",
  desc: "Institute-wide teaching insights",
  route: "/dashboard/analytics",
},
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6 md:p-10">

      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 mb-10">

        <div>
          <h1 className="text-4xl md:text-5xl font-bold">
            Institute Dashboard
          </h1>

          <p className="text-slate-400 mt-2">
            Welcome back 👋
          </p>
        </div>

        <button
          onClick={logout}
          className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-xl font-semibold"
        >
          Logout
        </button>

      </div>

      {/* Phase 2 Summary Cards */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <p className="text-slate-400 text-sm">Students</p>
          <h2 className="text-3xl font-bold mt-2">{stats.students}</h2>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <p className="text-slate-400 text-sm">Batches</p>
          <h2 className="text-3xl font-bold mt-2">{stats.batches}</h2>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <p className="text-slate-400 text-sm">Subjects</p>
          <h2 className="text-3xl font-bold mt-2">{stats.subjects}</h2>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <p className="text-slate-400 text-sm">Tests</p>
          <h2 className="text-3xl font-bold mt-2">{stats.tests}</h2>
        </div>

      </div>

<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">

  <div className="bg-gradient-to-br from-green-700 to-green-900 rounded-2xl p-5">
    <p className="text-green-100 text-sm">
      Overall Accuracy
    </p>

    <h2 className="text-3xl font-bold mt-2">
      {stats.averagePercentage.toFixed(1)}%
    </h2>
  </div>

  <div className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-2xl p-5">
    <p className="text-blue-100 text-sm">
      Average Score
    </p>

    <h2 className="text-3xl font-bold mt-2">
      {stats.averageScore.toFixed(1)}
    </h2>
  </div>

  <div className="bg-gradient-to-br from-purple-700 to-purple-900 rounded-2xl p-5">
    <p className="text-purple-100 text-sm">
      Students Attempted
    </p>

    <h2 className="text-3xl font-bold mt-2">
      {stats.attempts}
    </h2>
  </div>

  <div className="bg-gradient-to-br from-orange-700 to-orange-900 rounded-2xl p-5">
    <p className="text-orange-100 text-sm">
      Average Time
    </p>

    <h2 className="text-3xl font-bold mt-2">
      {Math.floor(stats.averageTime / 60)}m{" "}
      {Math.round(stats.averageTime % 60)}s
    </h2>
  </div>

</div>

<div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-10">

  <h2 className="text-2xl font-bold mb-3">
    📈 Institute Performance Snapshot
  </h2>

  <p className="text-slate-300 leading-8">

    <b>{stats.attempts}</b> official attempts have been completed.

    <br /><br />

    Average student accuracy is

    <b> {stats.averagePercentage.toFixed(1)}%</b>.

    Average score is

    <b> {stats.averageScore.toFixed(1)}</b>.

    Students spend approximately

    <b> {Math.round(stats.averageTime / 60)} minutes</b>

    per test.

    <br /><br />

    <b>
      {stats.averagePercentage < 40
        ? "Performance is currently weak. Focus on revision and concept reinforcement."
        : stats.averagePercentage < 70
        ? "Overall performance is moderate. More practice tests are recommended."
        : "Students are performing well. Consider increasing question difficulty."}
    </b>

  </p>

</div>

      {/* Main Modules */}

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">

        {cards.map((card) => (

          <Link
            key={card.title}
            href={card.route}
            className="rounded-3xl bg-slate-900 border border-slate-800 hover:border-blue-500 hover:scale-[1.02] transition-all duration-200 p-8 shadow-xl"
          >

            <div className="text-6xl mb-6">
              {card.icon}
            </div>

            <h2 className="text-3xl font-bold">
              {card.title}
            </h2>

            <p className="text-slate-400 mt-4 text-lg">
              {card.desc}
            </p>

          </Link>

        ))}

      </div>

    </main>
  );
}