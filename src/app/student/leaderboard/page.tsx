"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Student = {
  id: string;
  name: string;
};

type Attempt = {
  id: string;
  studentId: string;
  score: number;
  percentage: number;
  createdAt: string;
};

type LeaderboardRow = {
  studentId: string;
  name: string;
  bestScore: number;
  bestPercentage: number;
  testsTaken: number;
};

export default function LeaderboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
  const [studentName, setStudentName] = useState("");

  useEffect(() => {
    loadLeaderboard();
  }, []);

  async function loadLeaderboard() {
    setLoading(true);

    // Check logged-in student
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/student/login");
      return;
    }

    // Get logged-in student's profile
    const { data: profile } = await supabase
      .from("profile")
      .select("studentId")
      .eq("id", user.id)
      .single();

    if (!profile?.studentId) {
      router.push("/student/login");
      return;
    }

    // Get current student's name
    const { data: currentStudent } = await supabase
      .from("Student")
      .select("name")
      .eq("id", profile.studentId)
      .single();

    if (currentStudent) {
      setStudentName(currentStudent.name);
    }

    // Get all students
    const { data: students, error: studentsError } =
      await supabase
        .from("Student")
        .select("id, name");

    if (studentsError) {
      console.error(
        "Error loading students:",
        studentsError
      );

      setLoading(false);
      return;
    }

    // Get all attempts
    const { data: attempts, error: attemptsError } =
  await supabase
    .from("Attempt")
    .select(
      "id, studentId, score, percentage, createdAt"
    )
    .eq("isPractice", false) // 👈 Add this line
    .order("percentage", {
      ascending: false,
    });

    if (attemptsError) {
      console.error(
        "Error loading attempts:",
        attemptsError
      );

      setLoading(false);
      return;
    }

    const studentList =
      (students || []) as Student[];

    const attemptList =
      (attempts || []) as Attempt[];

    // Create leaderboard
    const leaderboardMap = new Map<
      string,
      LeaderboardRow
    >();

    for (const attempt of attemptList) {
      const student = studentList.find(
        (s) => s.id === attempt.studentId
      );

      if (!student) continue;

      const percentage = Number(
        attempt.percentage || 0
      );

      const score = Number(
        attempt.score || 0
      );

      const existing =
        leaderboardMap.get(attempt.studentId);

      if (!existing) {
        leaderboardMap.set(attempt.studentId, {
          studentId: attempt.studentId,
          name: student.name,
          bestScore: score,
          bestPercentage: percentage,
          testsTaken: 1,
        });
      } else {
        existing.testsTaken += 1;

        if (
          percentage >
          existing.bestPercentage
        ) {
          existing.bestPercentage =
            percentage;

          existing.bestScore = score;
        }
      }
    }

    // Convert map to array and sort
    const sortedLeaderboard = Array.from(
      leaderboardMap.values()
    ).sort((a, b) => {
      // First: highest percentage
      if (
        b.bestPercentage !==
        a.bestPercentage
      ) {
        return (
          b.bestPercentage -
          a.bestPercentage
        );
      }

      // Second: highest score
      return b.bestScore - a.bestScore;
    });

    setLeaderboard(sortedLeaderboard);

    setLoading(false);
  }

  const currentStudentRank = useMemo(() => {
    if (!leaderboard.length) return "-";

    const index = leaderboard.findIndex(
      (student) =>
        student.studentId ===
        leaderboard.find(
          (s) => s.name === studentName
        )?.studentId
    );

    if (index === -1) return "-";

    return index + 1;
  }, [leaderboard, studentName]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="text-lg text-slate-400">
          Loading Leaderboard...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-10">

      {/* Header */}

      <div className="mb-10">

        <h1 className="text-4xl font-bold">
          Leaderboard
        </h1>

        <p className="text-slate-400 mt-2">
          See how you are performing compared with
          other students.
        </p>

      </div>

      {/* Student Summary */}

      <div className="grid grid-cols-3 gap-6 mb-10">

        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6">

          <p className="text-slate-400">
            Your Name
          </p>

          <h2 className="text-2xl font-bold mt-3">
            {studentName || "Student"}
          </h2>

        </div>

        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6">

          <p className="text-slate-400">
            Your Rank
          </p>

          <h2 className="text-4xl font-bold mt-3 text-yellow-400">
            #{currentStudentRank}
          </h2>

        </div>

        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6">

          <p className="text-slate-400">
            Students Ranked
          </p>

          <h2 className="text-4xl font-bold mt-3">
            {leaderboard.length}
          </h2>

        </div>

      </div>

      {/* Leaderboard */}

      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8">

        <h2 className="text-2xl font-bold mb-8">
          Overall Rankings
        </h2>

        {leaderboard.length === 0 ? (

          <div className="py-16 text-center">

            <p className="text-slate-400 text-lg">
              No leaderboard data yet.
            </p>

            <p className="text-slate-500 mt-2">
              Complete a test to appear on the
              leaderboard.
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead>

                <tr className="border-b border-slate-700 text-left text-slate-400">

                  <th className="py-4 px-3">
                    Rank
                  </th>

                  <th className="py-4 px-3">
                    Student
                  </th>

                  <th className="py-4 px-3">
                    Best Score
                  </th>

                  <th className="py-4 px-3">
                    Best %
                  </th>

                  <th className="py-4 px-3">
                    Tests
                  </th>

                </tr>

              </thead>

              <tbody>

                {leaderboard.map(
                  (student, index) => {

                    const rank =
                      index + 1;

                    const isCurrentStudent =
                      student.name ===
                      studentName;

                    return (

                      <tr
                        key={
                          student.studentId
                        }
                        className={`
                          border-b
                          border-slate-800
                          transition
                          ${
                            isCurrentStudent
                              ? "bg-blue-600/10"
                              : "hover:bg-slate-800"
                          }
                        `}
                      >

                        {/* Rank */}

                        <td className="py-5 px-3">

                          {rank === 1 ? (

                            <span className="text-2xl">
                              🥇
                            </span>

                          ) : rank === 2 ? (

                            <span className="text-2xl">
                              🥈
                            </span>

                          ) : rank === 3 ? (

                            <span className="text-2xl">
                              🥉
                            </span>

                          ) : (

                            <span className="font-bold text-slate-400">
                              #{rank}
                            </span>

                          )}

                        </td>

                        {/* Student */}

                        <td className="py-5 px-3">

                          <div className="flex items-center gap-3">

                            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold">

                              {student.name
                                ?.charAt(0)
                                .toUpperCase()}

                            </div>

                            <div>

                              <p className="font-semibold">

                                {student.name}

                                {isCurrentStudent && (
                                  <span className="ml-2 text-xs bg-blue-600 px-2 py-1 rounded-full">
                                    You
                                  </span>
                                )}

                              </p>

                            </div>

                          </div>

                        </td>

                        {/* Score */}

                        <td className="py-5 px-3 font-semibold">

                          {student.bestScore}

                        </td>

                        {/* Percentage */}

                        <td className="py-5 px-3">

                          <span
                            className={`
                              font-bold
                              ${
                                student.bestPercentage >=
                                75
                                  ? "text-green-400"
                                  : student.bestPercentage >=
                                    50
                                  ? "text-yellow-400"
                                  : "text-red-400"
                              }
                            `}
                          >

                            {Math.round(
                              student.bestPercentage
                            )}
                            %

                          </span>

                        </td>

                        {/* Tests */}

                        <td className="py-5 px-3 text-slate-400">

                          {student.testsTaken}

                        </td>

                      </tr>

                    );
                  }
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}