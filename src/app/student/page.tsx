"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function StudentHome() {
  const router = useRouter();

  const [student, setStudent] = useState<any>(null);

  const [assigned, setAssigned] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [pending, setPending] = useState(0);

  const [weeklyCompleted, setWeeklyCompleted] = useState(0);

  const [weeklyGoal, setWeeklyGoal] = useState(0);

  useEffect(() => {
    loadStudent();
  }, []);

  async function loadStudent() {
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

    if (!profile?.studentId) {
      alert("Student profile not found.");
      return;
    }

    const { data: studentData } = await supabase
      .from("Student")
      .select("*")
      .eq("id", profile.studentId)
      .single();

    setStudent(studentData);

    const { data: assignments } = await supabase
  .from("TestAssignment")
  .select("status, assignedAt")
  .eq("studentId", profile.studentId);

    if (assignments) {
      const today = new Date();

const startOfWeek = new Date(today);

const day = today.getDay();
const diff = day === 0 ? 6 : day - 1; // Monday = start of week

startOfWeek.setDate(today.getDate() - diff);
startOfWeek.setHours(0, 0, 0, 0);

const weeklyAssignments = assignments.filter(
  (a) =>
    a.assignedAt &&
    new Date(a.assignedAt) >= startOfWeek
);

setWeeklyGoal(weeklyAssignments.length);

setWeeklyCompleted(
  weeklyAssignments.filter(
    (a) => a.status === "completed"
  ).length
);

// Update dashboard cards
setAssigned(assignments.length);

setCompleted(
  assignments.filter(
    (a) => a.status === "completed"
  ).length
);

setPending(
  assignments.filter(
    (a) => a.status === "assigned"
  ).length
);

    }

} // <-- THIS WAS MISSING

async function logout() {
    await supabase.auth.signOut();
    router.push("/student/login");
  }

  if (!student) {
    return <div className="p-10">Loading...</div>;
  }

  const weeklyPercentage =
  weeklyGoal === 0
    ? 0
    : Math.min(
        100,
        Math.round((weeklyCompleted / weeklyGoal) * 100)
      );

  const hour = new Date().getHours();

let greeting = "Good Evening";

if (hour < 12) {
  greeting = "Good Morning";
} else if (hour < 17) {
  greeting = "Good Afternoon";
}

 return (
  <div className="min-h-screen bg-slate-950 text-white flex">

    {/* Sidebar */}
    <aside className="w-72 bg-slate-900 border-r border-slate-800 p-6">

      <h1 className="text-3xl font-bold mb-10">
        TestPlatform
      </h1>

      <nav className="space-y-3">

        <button className="w-full text-left px-4 py-3 rounded-xl bg-blue-600">
          🏠 Dashboard
        </button>

        <button
          onClick={() => router.push("/student/tests")}
          className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-800"
        >
          📝 My Tests
        </button>

        <button
          onClick={() => router.push("/student/results")}
          className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-800"
        >
          📊 Results
        </button>

        <button
          onClick={() => router.push("/student/analytics")}
          className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-800"
        >
          📈 Analytics
        </button>

        <button
          onClick={() => router.push("/student/leaderboard")}
          className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-800"
        >
          🏆 Leaderboard
        </button>

        <button
          onClick={() => router.push("/student/profile")}
          className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-800"
        >
          👤 Profile
        </button>

      </nav>

      <button
        onClick={logout}
        className="mt-16 w-full bg-red-600 hover:bg-red-700 rounded-xl py-3"
      >
        Logout
      </button>

    </aside>

    {/* Main */}
    <main className="flex-1 p-10">

      <h1 className="text-4xl font-bold">
  {greeting} 👋
</h1>

      <p className="text-slate-400 mt-2">
        Welcome back, {student.name}
      </p>

      <div className="grid grid-cols-3 gap-6 mt-10">

        <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 shadow-2xl p-6">
          <p className="text-slate-400">Assigned</p>
          <h2 className="text-4xl font-bold mt-3">{assigned}</h2>
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 shadow-2xl p-6">
          <p className="text-slate-400">Completed</p>
          <h2 className="text-4xl font-bold mt-3">{completed}</h2>
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 shadow-2xl p-6">
          <p className="text-slate-400">Pending</p>
          <h2 className="text-4xl font-bold mt-3">{pending}</h2>
        </div>

      </div>

      {/* Weekly Goal */}

      <div className="mt-10 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 shadow-2xl p-10">

        <div className="flex items-center justify-between">

          <div>

            <h2 className="text-2xl font-bold">
              Weekly Goal
            </h2>

            <p className="text-slate-400 mt-2">
              Complete {weeklyGoal} tests this week
            </p>

            <p className="mt-4 text-green-400 font-semibold">
              {weeklyCompleted} / {weeklyGoal} Completed
            </p>

          </div>

          <div className="relative w-44 h-44">

            <svg
              className="w-44 h-44 -rotate-90"
              viewBox="0 0 160 160"
            >

              <circle
                cx="80"
                cy="80"
                r="60"
                stroke="#334155"
                strokeWidth="12"
                fill="none"
              />

              <circle
                cx="80"
                cy="80"
                r="60"
                stroke="#22c55e"
                strokeWidth="12"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={377}
                strokeDashoffset={
                  377 - (377 * weeklyPercentage) / 100
                }
                style={{
                  transition:
                    "stroke-dashoffset .6s ease",
                }}
              />

            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">

              <span className="text-4xl font-bold">
                {weeklyPercentage}%
              </span>

              <span className="text-slate-400 text-sm">
                Goal
              </span>

            </div>

          </div>

        </div>

      </div>

    </main>

  </div>
);
}