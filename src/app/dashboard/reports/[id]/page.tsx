"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useParams, useRouter } from "next/navigation";
import * as XLSX from "xlsx";

export default function TestReportPage() {
  const router = useRouter();
  const { id } = useParams();

  const [test, setTest] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [attempts, setAttempts] =
  useState<any[]>([]);
  const [studentsAttempted, setStudentsAttempted] =
  useState(0);

const [averageScore, setAverageScore] =
  useState("0");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReport();
  }, []);

  async function loadReport() {
    setLoading(true);

    const { data: testData } = await supabase
      .from("Test")
      .select("*")
      .eq("id", id)
      .single();

    setTest(testData);
    console.log("TEST DATA:", testData);

    const { data: questionData } = await supabase
      .from("Question")
      .select("*")
      .eq("testId", id);

    setQuestions(questionData || []);

    const { data: assignmentData } = await supabase
      .from("TestAssignment")
      .select("*")
      .eq("testId", id);

    setAssignments(assignmentData || []);
   const { data: attempts } = await supabase
  .from("Attempt")
  .select(`
    *,
    student:Student(name,email)
  `)
  .eq("testId", id)
  .eq("isPractice", false);

setAttempts(attempts || []);

const uniqueStudents = new Set(
  (attempts || []).map((a) => a.studentId)
);

setStudentsAttempted(uniqueStudents.size);

const avg =
  attempts && attempts.length > 0
    ? attempts.reduce(
        (sum, a) => sum + (a.score || 0),
        0
      ) / attempts.length
    : 0;

setAverageScore(avg.toFixed(2));

setLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Loading Report...
      </div>
    );
  }

  function exportExcel() {
  const data = attempts.map((attempt, index) => ({
    Rank: index + 1,
    Student: attempt.student?.name,
    Score: attempt.score,
    Accuracy: `${attempt.percentage?.toFixed(2) || 0}%`,
    Time: `${Math.floor((attempt.timeTaken || 0) / 60)}m ${(attempt.timeTaken || 0) % 60}s`,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Leaderboard"
  );

  XLSX.writeFile(
    workbook,
    `${test.title}-Leaderboard.xlsx`
  );
}

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">

      <div className="flex justify-between items-center mb-10">

        <div>

          <h1 className="text-4xl font-bold">
            {test?.title}
          </h1>

          <p className="text-slate-400 mt-2">
            Test Performance Report
          </p>

        </div>

        <button
          onClick={() => router.back()}
          className="bg-slate-800 hover:bg-slate-700 px-5 py-3 rounded-xl"
        >
          ← Back
        </button>

      </div>

      {/* Summary */}

      <div className="grid md:grid-cols-4 gap-6 mb-10">

        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
          <p className="text-slate-400">
            Questions
          </p>

          <h2 className="text-4xl font-bold mt-2">
            {questions.length}
          </h2>
        </div>

        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
  <p className="text-slate-400">
    Students Attempted
  </p>

  <h2 className="text-4xl font-bold mt-2">
    {studentsAttempted}
  </h2>
</div>

        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
          <p className="text-slate-400">
            Duration
          </p>

          <h2 className="text-4xl font-bold mt-2">
            {`${test?.durationHours || 0}h ${test?.durationMinutes || 0}m ${test?.durationSeconds || 0}s`}
          </h2>
        </div>

        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
  <p className="text-slate-400">
    Average Score
  </p>

  <h2 className="text-4xl font-bold mt-2">
    {averageScore}
  </h2>
</div>

      </div>

      {/* Questions */}

      <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden">

        <div className="px-6 py-5 border-b border-slate-800">

          <h2 className="text-2xl font-bold">
            Questions
          </h2>

        </div>

        {questions.length === 0 ? (

          <div className="p-8 text-slate-400">
            No questions found.
          </div>

        ) : (

          <table className="w-full">

            <thead className="bg-slate-800">

              <tr>

                <th className="text-left p-4">
                  Question
                </th>

                <th className="text-left p-4">
                  Difficulty
                </th>

                <th className="text-left p-4">
                  Marks
                </th>

                <th className="text-left p-4">
                  Negative
                </th>

              </tr>

            </thead>

            <tbody>

              {questions.map((question) => (

                <tr
                  key={question.id}
                  className="border-t border-slate-800"
                >

                  <td className="p-4">
                    {question.text}
                  </td>

                  <td className="p-4">
                    {question.difficulty || "-"}
                  </td>

                  <td className="p-4">
                    +{question.marks}
                  </td>

                  <td className="p-4 text-red-400">
                    -{question.negativeMarks || 0}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        )}

      </div>
{/* Leaderboard */}

<div className="mt-10 bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden">

  <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">

    <h2 className="text-2xl font-bold">
      Student Leaderboard
    </h2>

    <button
  onClick={exportExcel}
  className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-xl"
>
      Export Excel
    </button>

  </div>

  {attempts.length === 0 ? (

    <div className="p-8 text-slate-400">
      No students assigned to this test.
    </div>

  ) : (

    <table className="w-full">

      <thead className="bg-slate-800">

        <tr>

          <th className="text-left p-4">
            Rank
          </th>

          <th className="text-left p-4">
            Student
          </th>

          <th className="text-left p-4">
            Status
          </th>

          <th className="text-left p-4">
            Score
          </th>

          <th className="text-left p-4">
            Accuracy
          </th>

          <th className="text-left p-4">
            Time
          </th>

        </tr>

      </thead>

      <tbody>

        {attempts
  .sort(
    (a, b) =>
      (b.percentage || 0) -
      (a.percentage || 0)
  )
  .map((attempt, index) => (
    <tr
      key={attempt.id}
      className="border-t border-slate-800"
    >
      <td className="p-4 font-bold">
        #{index + 1}
      </td>

      <td className="p-4">
        {attempt.student?.name}
      </td>

      <td className="p-4">
        <span className="bg-green-600 px-3 py-1 rounded-full text-xs">
          Completed
        </span>
      </td>

      <td className="p-4">
        {attempt.score}
      </td>

      <td className="p-4">
        {attempt.percentage?.toFixed(2)}%
      </td>

      <td className="p-4">
        {Math.floor((attempt.timeTaken || 0) / 60)}m{" "}
        {(attempt.timeTaken || 0) % 60}s
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