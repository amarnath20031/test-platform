"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function BatchDetailsPage() {
  const { id } = useParams();

  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const [batch, setBatch] = useState<any>(null);

  const [students, setStudents] = useState<any[]>([]);

  const [attempts, setAttempts] = useState<any[]>([]);

  const [search, setSearch] = useState("");

  useEffect(() => {
    loadBatch();
  }, []);

  async function loadBatch() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { data: batchData } = await supabase
      .from("Batch")
      .select(`
        *,
        institute:Institute(name)
      `)
      .eq("id", id)
      .single();

    setBatch(batchData);

    const { data: studentData } = await supabase
      .from("Student")
      .select("*")
      .eq("batchId", id)
      .order("name");

    setStudents(studentData || []);

    if (studentData && studentData.length > 0) {
      const ids = studentData.map((s) => s.id);

      const { data: attemptData } = await supabase
        .from("Attempt")
        .select("*")
        .in("studentId", ids);

      setAttempts(attemptData || []);
    }

    setLoading(false);
  }

  const filteredStudents = useMemo(() => {
    return students.filter((student) =>
      student.name
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [students, search]);

  const totalStudents = students.length;

  const officialAttemptList = attempts.filter(
  (a) => !a.isPractice
);

const practiceAttemptList = attempts.filter(
  (a) => a.isPractice
);

const totalAttempts = officialAttemptList.length;

const officialAttempts = officialAttemptList.length;

const practiceAttempts = practiceAttemptList.length;

const averageScore =
  officialAttemptList.length === 0
    ? 0
    : Math.round(
        officialAttemptList.reduce(
          (sum, a) => sum + Number(a.score || 0),
          0
        ) / officialAttemptList.length
      );

const averagePercentage =
  officialAttemptList.length === 0
    ? 0
    : Math.round(
        officialAttemptList.reduce(
          (sum, a) =>
            sum + Number(a.percentage || 0),
          0
        ) / officialAttemptList.length
      );

 function getStudentAttempts(studentId: string) {
  return attempts.filter(
    (a) =>
      a.studentId === studentId &&
      !a.isPractice
  );
}

  function getAverage(studentId: string) {
    const list = getStudentAttempts(studentId);

    if (!list.length) return 0;

    return Math.round(
      list.reduce(
        (sum, a) =>
          sum + Number(a.percentage),
        0
      ) / list.length
    );
  }

  function getBest(studentId: string) {
    const list = getStudentAttempts(studentId);

    if (!list.length) return 0;

    return Math.max(
      ...list.map((a) => Number(a.percentage))
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Loading Batch...
      </div>
    );
  }
    return (
    <div className="min-h-screen bg-slate-950 text-white p-8">

      <button
        onClick={() => router.push("/dashboard/batches")}
        className="mb-6 text-blue-400 hover:text-blue-300"
      >
        ← Back to Batches
      </button>

      <div className="flex justify-between items-center">

        <div>

          <h1 className="text-4xl font-bold">
            {batch?.name}
          </h1>

          <p className="text-slate-400 mt-2">
            🏫 {batch?.institute?.name}
          </p>

        </div>

      </div>

      {/* Statistics */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-10">

        <div className="bg-slate-900 rounded-2xl p-6">
          <p className="text-slate-400">
            Students
          </p>

          <h2 className="text-4xl font-bold mt-3">
            {totalStudents}
          </h2>
        </div>

        <div className="bg-slate-900 rounded-2xl p-6">
          <p className="text-slate-400">
            Total Attempts
          </p>

          <h2 className="text-4xl font-bold mt-3">
            {totalAttempts}
          </h2>
        </div>

        <div className="bg-slate-900 rounded-2xl p-6">
          <p className="text-slate-400">
            Average Score
          </p>

          <h2 className="text-4xl font-bold mt-3 text-blue-400">
            {averageScore}
          </h2>
        </div>

        <div className="bg-slate-900 rounded-2xl p-6">
          <p className="text-slate-400">
            Average %
          </p>

          <h2 className="text-4xl font-bold mt-3 text-green-400">
            {averagePercentage}%
          </h2>
        </div>

      </div>

      {/* Official vs Practice */}

      <div className="grid grid-cols-2 gap-6 mt-6">

        <div className="bg-slate-900 rounded-2xl p-6">

          <p className="text-slate-400">
            Official Attempts
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {officialAttempts}
          </h2>

        </div>

        <div className="bg-slate-900 rounded-2xl p-6">

          <p className="text-slate-400">
            Practice Attempts
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {practiceAttempts}
          </h2>

        </div>

      </div>

      {/* Search */}

      <input
        className="w-full mt-10 rounded-xl bg-slate-900 border border-slate-700 px-5 py-3 outline-none"
        placeholder="Search students..."
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
      />

      {/* Students */}

      <div className="space-y-5 mt-8">

        {filteredStudents.map((student) => {

          const studentAttempts =
            getStudentAttempts(student.id);

          return (

            <div
              key={student.id}
              className="bg-slate-900 rounded-2xl p-6 border border-slate-800 hover:border-blue-500 transition"
            >

              <div className="flex justify-between items-center">

                <div>

                  <h2 className="text-2xl font-bold">
                    {student.name}
                  </h2>

                  <p className="text-slate-400 mt-2">
                    📧 {student.email}
                  </p>

                </div>

                <div className="grid grid-cols-3 gap-10 text-center">

                  <div>

                    <p className="text-slate-400 text-sm">
                      Attempts
                    </p>

                    <h3 className="text-2xl font-bold">
                      {studentAttempts.length}
                    </h3>

                  </div>

                  <div>

                    <p className="text-slate-400 text-sm">
                      Average
                    </p>

                    <h3 className="text-2xl font-bold text-blue-400">
                      {getAverage(student.id)}%
                    </h3>

                  </div>

                  <div>

                    <p className="text-slate-400 text-sm">
                      Best
                    </p>

                    <h3 className="text-2xl font-bold text-green-400">
                      {getBest(student.id)}%
                    </h3>

                  </div>

                </div>

              </div>

              <div className="mt-6 flex gap-3">

                <button
                  onClick={() =>
                    router.push(
                      `/dashboard/students/${student.id}`
                    )
                  }
                  className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-xl"
                >
                  View Student
                </button>

              </div>

            </div>

          );

        })}

        {filteredStudents.length === 0 && (

          <div className="text-center text-slate-400 py-20">

            No students found.

          </div>

        )}

      </div>

    </div>
  );
}