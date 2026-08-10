"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function InstituteAnalyticsPage() {

  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    students: 0,
    batches: 0,
    subjects: 0,
    tests: 0,
    attempts: 0,
    averageScore: 0,
    averageAccuracy: 0,
    averageTime: 0,
  });

  const [insights, setInsights] = useState({
    difficultQuestion: "-",
    skippedQuestion: "-",
    slowQuestion: "-",
    weakSubject: "-",
  });

  const [questionStats, setQuestionStats] = useState<any[]>([]);
  const [subjectStats, setSubjectStats] = useState<any[]>([]);
  const [batchStats, setBatchStats] = useState<any[]>([]);
  const [topStudents, setTopStudents] = useState<any[]>([]);
  const [weakStudents, setWeakStudents] = useState<any[]>([]);
  const [optionDistribution, setOptionDistribution] =
  useState<any[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics() {

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: profile } = await supabase
      .from("profile")
      .select("instituteId")
      .eq("id", user.id)
      .single();

    if (!profile) return;

    const instituteId = profile.instituteId;
    const { data: studentsData } = await supabase
  .from("Student")
  .select("id,name,batchId")
  .eq("instituteId", instituteId);

const { data: batchData } = await supabase
  .from("Batch")
  .select("id,name")
  .eq("instituteId", instituteId);

    const [
      { count: students },
      { count: batches },
      { count: subjects },
      { count: tests },
      { data: attempts },
    ] = await Promise.all([

      supabase
        .from("Student")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq("instituteId", instituteId),

      supabase
        .from("Batch")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq("instituteId", instituteId),

      supabase
        .from("Subject")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq("instituteId", instituteId),

      supabase
        .from("Test")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq("instituteId", instituteId),

      supabase
  .from("Attempt")
  .select(`
    studentId,
    score,
    percentage,
    timeTaken
  `)
  .eq("isPractice", false)

    ]);

    const totalAttempts =
      attempts?.length || 0;

   const averageScore =
  totalAttempts === 0
    ? 0
    : (attempts ?? []).reduce(
            (sum: number, a: any) =>
              sum + Number(a.score || 0),
            0
          ) / totalAttempts;

    const averageAccuracy =
  totalAttempts === 0
    ? 0
    : (attempts ?? []).reduce(
            (sum: number, a: any) =>
              sum + Number(a.percentage || 0),
            0
          ) / totalAttempts;

    const averageTime =
  totalAttempts === 0
    ? 0
    : (attempts ?? []).reduce(
            (sum: number, a: any) =>
              sum + Number(a.timeTaken || 0),
            0
          ) / totalAttempts;

    setStats({

      students: students || 0,

      batches: batches || 0,

      subjects: subjects || 0,

      tests: tests || 0,

      attempts: totalAttempts,

      averageScore,

      averageAccuracy,

      averageTime,

    });

    const { data: questions } =
      await supabase
        .from("Question")
        .select(`
          id,
          text,
          test:Test(
            title,
            subject:Subject(name)
          )
        `);

    const [
  { data: answers },
  { data: options },
] = await Promise.all([

  supabase
    .from("Answer")
    .select("*"),

  supabase
    .from("Option")
    .select("*"),

]);

    if (questions && answers) {

      let hardest = "";
      let hardestAccuracy = 101;

      let skipped = "";
      let skippedCount = -1;

      let slowest = "";
      let slowestTime = -1;

      const subjectMap: any = {};

      const analytics =
        questions.map((q: any) => {

          const qAnswers =
            answers.filter(
              (a: any) =>
                a.questionId === q.id
            );

          const total =
            qAnswers.length;

          const correct =
            qAnswers.filter(
              (a: any) =>
                a.isCorrect
            ).length;

          const skippedNow =
            qAnswers.filter(
              (a: any) =>
                !a.optionId
            ).length;

          const accuracy =
            total === 0
              ? 0
              : Math.round(
                  (correct /
                    total) *
                    100
                );

          const avgTime =
            total === 0
              ? 0
              : qAnswers.reduce(
                  (
                    sum: number,
                    a: any
                  ) =>
                    sum +
                    Number(
                      a.timeSpent || 0
                    ),
                  0
                ) / total;

          if (
            accuracy <
            hardestAccuracy
          ) {
            hardestAccuracy =
              accuracy;

            hardest = q.text;
          }

          if (
            skippedNow >
            skippedCount
          ) {
            skippedCount =
              skippedNow;

            skipped = q.text;
          }

          if (
            avgTime >
            slowestTime
          ) {
            slowestTime =
              avgTime;

            slowest = q.text;
          }

          const subject =
            q.test?.subject
              ?.name || "Unknown";

          if (!subjectMap[subject]) {
            subjectMap[subject] = {
              correct: 0,
              total: 0,
            };
          }

          subjectMap[
            subject
          ].correct += correct;

          subjectMap[
            subject
          ].total += total;

          return {

            id: q.id,

            question: q.text,

            subject,

            accuracy,

            skipped:
              total === 0
                ? 0
                : Math.round(
                    (skippedNow /
                      total) *
                      100
                  ),

            averageTime:
              Math.round(avgTime),

          };

        });

      let weakSubject = "-";
      let weakest = 101;

      Object.entries(subjectMap)
        .forEach(
          ([name, value]: any) => {

            const acc =
              (value.correct /
                value.total) *
              100;

            if (acc < weakest) {

              weakest = acc;

              weakSubject = name;

            }

          }
        );

      analytics.sort(
        (a, b) =>
          a.accuracy -
          b.accuracy
      );

      setQuestionStats(
        analytics.slice(0, 10)
      );

      const subjectsAnalytics = Object.entries(subjectMap).map(
  ([name, value]: any) => {

    const accuracy =
      value.total === 0
        ? 0
        : Math.round(
            (value.correct / value.total) * 100
          );

    return {

      subject: name,

      accuracy,

      attempts: value.total,

      status:
        accuracy >= 75
          ? "Strong"
          : accuracy >= 50
          ? "Moderate"
          : "Needs Revision",

    };

  }
);

subjectsAnalytics.sort(
  (a, b) => a.accuracy - b.accuracy
);

setSubjectStats(subjectsAnalytics);
if (studentsData && batchData) {

  const batchesAnalytics = batchData.map((batch: any) => {

    const batchStudents =
      studentsData.filter(
        (s: any) => s.batchId === batch.id
      );

    const ids =
      batchStudents.map(
        (s: any) => s.id
      );

    const batchAttempts =
  (attempts ?? []).filter(
    (a: any) =>
      ids.includes(a.studentId)
  );

    const average =
      batchAttempts.length === 0
        ? 0
        : batchAttempts.reduce(
            (
              sum: number,
              a: any
            ) =>
              sum +
              Number(
                a.percentage || 0
              ),
            0
          ) /
          batchAttempts.length;

    return {

      batch: batch.name,

      students:
        batchStudents.length,

      attempts:
        batchAttempts.length,

      accuracy:
        Math.round(
          average
        ),

      status:
        average >= 75
          ? "Excellent"
          : average >= 50
          ? "Average"
          : "Weak",

    };

  });

  batchesAnalytics.sort(
    (a, b) =>
      b.accuracy -
      a.accuracy
  );

  setBatchStats(
    batchesAnalytics
  );
if (studentsData) {

  const studentAnalytics = studentsData.map((student: any) => {

    const studentAttempts =
  (attempts ?? []).filter(
    (a: any) =>
      a.studentId === student.id
  );

    const avgAccuracy =
      studentAttempts.length === 0
        ? 0
        : studentAttempts.reduce(
            (sum: number, a: any) =>
              sum + Number(a.percentage || 0),
            0
          ) / studentAttempts.length;

    const avgScore =
      studentAttempts.length === 0
        ? 0
        : studentAttempts.reduce(
            (sum: number, a: any) =>
              sum + Number(a.score || 0),
            0
          ) / studentAttempts.length;

    return {

      id: student.id,

      name: student.name,

      attempts: studentAttempts.length,

      accuracy: Math.round(avgAccuracy),

      score: Number(avgScore.toFixed(1)),

    };

  });

  studentAnalytics.sort(
    (a, b) => b.accuracy - a.accuracy
  );

  setTopStudents(
    studentAnalytics.slice(0, 10)
  );
const weakestStudents = [...studentAnalytics]
  .sort((a, b) => a.accuracy - b.accuracy)
  .slice(0, 10);

setWeakStudents(weakestStudents);
}
}
const optionStats =
  analytics.map((question: any) => {

    const qAnswers =
      answers.filter(
        (a: any) =>
          a.questionId === question.id
      );

    const qOptions =
  (options || []).filter(
    (o: any) =>
      o.questionId === question.id
  );

    const distribution =
      qOptions.map((option: any) => {

        const count =
          qAnswers.filter(
            (a: any) =>
              a.optionId === option.id
          ).length;

        return {

          option: option.text,

          isCorrect:
            option.isCorrect,

          count,

        };

      });

    distribution.sort(
      (a: any, b: any) =>
        b.count - a.count
    );

    return {

      question:

        question.question,

      distribution,

    };

  });

setOptionDistribution(
  optionStats
);
      setInsights({

        difficultQuestion:
          hardest,

        skippedQuestion:
          skipped,

        slowQuestion:
          slowest,

        weakSubject,

      });

    }

    setLoading(false);

  }
    if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Loading Analytics...
      </div>
    );
  }

  return (

    <div className="min-h-screen bg-[#050816] text-white p-8">

      <div className="mb-10">

        <h1 className="text-5xl font-bold">

          Institute Analytics

        </h1>

        <p className="text-slate-400 mt-3">

          Complete teaching intelligence dashboard.

        </p>

      </div>

      {/* Overview */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

          <p className="text-slate-400">
            Students
          </p>

          <h2 className="text-4xl font-bold mt-3">
            {stats.students}
          </h2>

        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

          <p className="text-slate-400">
            Batches
          </p>

          <h2 className="text-4xl font-bold mt-3">
            {stats.batches}
          </h2>

        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

          <p className="text-slate-400">
            Subjects
          </p>

          <h2 className="text-4xl font-bold mt-3">
            {stats.subjects}
          </h2>

        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

          <p className="text-slate-400">
            Tests
          </p>

          <h2 className="text-4xl font-bold mt-3">
            {stats.tests}
          </h2>

        </div>

        <div className="bg-gradient-to-br from-green-700 to-green-900 rounded-2xl p-6">

          <p className="text-green-100">
            Accuracy
          </p>

          <h2 className="text-4xl font-bold mt-3">
            {stats.averageAccuracy.toFixed(1)}%
          </h2>

        </div>

        <div className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-2xl p-6">

          <p className="text-blue-100">
            Average Score
          </p>

          <h2 className="text-4xl font-bold mt-3">
            {stats.averageScore.toFixed(1)}
          </h2>

        </div>

        <div className="bg-gradient-to-br from-orange-700 to-orange-900 rounded-2xl p-6">

          <p className="text-orange-100">
            Average Time
          </p>

          <h2 className="text-4xl font-bold mt-3">
            {Math.round(stats.averageTime)} sec
          </h2>

        </div>

        <div className="bg-gradient-to-br from-purple-700 to-purple-900 rounded-2xl p-6">

          <p className="text-purple-100">
            Attempts
          </p>

          <h2 className="text-4xl font-bold mt-3">
            {stats.attempts}
          </h2>

        </div>

      </div>
            {/* Teaching Insights */}

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 mt-10">

        <h2 className="text-3xl font-bold mb-8">

          📈 Teaching Insights

        </h2>

        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">

          <div className="bg-slate-950 rounded-2xl p-6">

            <p className="text-red-400 font-semibold">

              Hardest Question

            </p>

            <p className="mt-4 text-lg">

              {insights.difficultQuestion}

            </p>

          </div>

          <div className="bg-slate-950 rounded-2xl p-6">

            <p className="text-yellow-400 font-semibold">

              Most Skipped

            </p>

            <p className="mt-4 text-lg">

              {insights.skippedQuestion}

            </p>

          </div>

          <div className="bg-slate-950 rounded-2xl p-6">

            <p className="text-blue-400 font-semibold">

              Slowest Question

            </p>

            <p className="mt-4 text-lg">

              {insights.slowQuestion}

            </p>

          </div>

          <div className="bg-slate-950 rounded-2xl p-6">

            <p className="text-pink-400 font-semibold">

              Subject Needing Revision

            </p>

            <p className="mt-4 text-lg">

              {insights.weakSubject}

            </p>

          </div>

        </div>

      </div>

      {/* Most Difficult Questions */}

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 mt-10">

        <div className="flex justify-between items-center mb-8">

          <h2 className="text-3xl font-bold">

            🔥 Most Difficult Questions

          </h2>

          <span className="text-slate-400">

            Lowest Accuracy

          </span>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>

              <tr className="border-b border-slate-800">

                <th className="text-left py-4">

                  Question

                </th>

                <th className="text-center">

                  Subject

                </th>

                <th className="text-center">

                  Accuracy

                </th>

                <th className="text-center">

                  Skipped

                </th>

                <th className="text-center">

                  Avg Time

                </th>

              </tr>

            </thead>

            <tbody>

              {questionStats.map((question) => (

                <tr
                  key={question.id}
                  className="border-b border-slate-800 hover:bg-slate-950 transition"
                >

                  <td className="py-5 pr-8">

                    {question.question}

                  </td>

                  <td className="text-center">

                    {question.subject}

                  </td>

                  <td className="text-center">

                    <span className="text-red-400 font-bold">

                      {question.accuracy}%

                    </span>

                  </td>

                  <td className="text-center">

                    {question.skipped}%

                  </td>

                  <td className="text-center">

                    {question.averageTime}s

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>
      {/* Subject Performance */}

<div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 mt-10">

  <h2 className="text-3xl font-bold mb-8">

    📚 Subject Performance

  </h2>

  <div className="overflow-x-auto">

    <table className="w-full">

      <thead>

        <tr className="border-b border-slate-800">

          <th className="text-left py-4">
            Subject
          </th>

          <th className="text-center">
            Accuracy
          </th>

          <th className="text-center">
            Questions Answered
          </th>

          <th className="text-center">
            Status
          </th>

        </tr>

      </thead>

      <tbody>

        {subjectStats.map((subject) => (

          <tr
            key={subject.subject}
            className="border-b border-slate-800"
          >

            <td className="py-5">

              {subject.subject}

            </td>

            <td className="text-center font-bold">

              {subject.accuracy}%

            </td>

            <td className="text-center">

              {subject.attempts}

            </td>

            <td className="text-center">

              <span
                className={
                  subject.status === "Strong"
                    ? "text-green-400"
                    : subject.status === "Moderate"
                    ? "text-yellow-400"
                    : "text-red-400"
                }
              >
                {subject.status}
              </span>

            </td>

          </tr>

        ))}

      </tbody>

    </table>

  </div>

</div>
{/* Batch Performance */}

<div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 mt-10">

  <h2 className="text-3xl font-bold mb-8">

    👥 Batch Performance

  </h2>

  <table className="w-full">

    <thead>

      <tr className="border-b border-slate-800">

        <th className="text-left py-4">
          Batch
        </th>

        <th className="text-center">
          Students
        </th>

        <th className="text-center">
          Attempts
        </th>

        <th className="text-center">
          Accuracy
        </th>

        <th className="text-center">
          Status
        </th>

      </tr>

    </thead>

    <tbody>

      {batchStats.map((batch) => (

        <tr
          key={batch.batch}
          className="border-b border-slate-800"
        >

          <td className="py-5">

            {batch.batch}

          </td>

          <td className="text-center">

            {batch.students}

          </td>

          <td className="text-center">

            {batch.attempts}

          </td>

          <td className="text-center font-bold">

            {batch.accuracy}%

          </td>

          <td className="text-center">

            <span
              className={
                batch.status === "Excellent"
                  ? "text-green-400"
                  : batch.status === "Average"
                  ? "text-yellow-400"
                  : "text-red-400"
              }
            >
              {batch.status}
            </span>

          </td>

        </tr>

      ))}

    </tbody>

  </table>

</div>
{/* Top Students */}

<div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 mt-10">

  <h2 className="text-3xl font-bold mb-8">

    🏆 Top Students

  </h2>

  <table className="w-full">

    <thead>

      <tr className="border-b border-slate-800">

        <th className="text-left py-4">
          Student
        </th>

        <th className="text-center">
          Attempts
        </th>

        <th className="text-center">
          Avg Score
        </th>

        <th className="text-center">
          Accuracy
        </th>

      </tr>

    </thead>

    <tbody>

      {topStudents.map((student, index) => (

        <tr
          key={student.id}
          className="border-b border-slate-800"
        >

          <td className="py-5">

            #{index + 1} {student.name}

          </td>

          <td className="text-center">

            {student.attempts}

          </td>

          <td className="text-center">

            {student.score}

          </td>

          <td className="text-center text-green-400 font-bold">

            {student.accuracy}%

          </td>

        </tr>

      ))}

    </tbody>

  </table>

</div>
{/* Students Needing Attention */}

<div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 mt-10">

  <h2 className="text-3xl font-bold mb-8">

    ⚠️ Students Needing Attention

  </h2>

  <table className="w-full">

    <thead>

      <tr className="border-b border-slate-800">

        <th className="text-left py-4">
          Student
        </th>

        <th className="text-center">
          Attempts
        </th>

        <th className="text-center">
          Avg Score
        </th>

        <th className="text-center">
          Accuracy
        </th>

      </tr>

    </thead>

    <tbody>

      {weakStudents.map((student) => (

        <tr
          key={student.id}
          className="border-b border-slate-800"
        >

          <td className="py-5">

            {student.name}

          </td>

          <td className="text-center">

            {student.attempts}

          </td>

          <td className="text-center">

            {student.score}

          </td>

          <td className="text-center text-red-400 font-bold">

            {student.accuracy}%

          </td>

        </tr>

      ))}

    </tbody>

  </table>

</div>
{/* Option Distribution */}

<div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 mt-10">

<h2 className="text-3xl font-bold mb-8">

🎯 Option Distribution

</h2>

<div className="space-y-10">

{optionDistribution
.slice(0,5)
.map((q,index)=>(

<div
key={index}
className="bg-slate-950 rounded-2xl p-6"
>

<h3 className="font-bold mb-5">

{q.question}

</h3>

<div className="space-y-3">

{q.distribution.map((option:any,i:number)=>(

<div
key={i}
className="flex justify-between"
>

<div>

{String.fromCharCode(65+i)}.

{" "}

{option.option}

</div>

<div
className={
option.isCorrect
?"text-green-400"
:"text-red-400"
}
>

{option.count}

</div>

</div>

))}

</div>

</div>

))}

</div>

</div>
            {/* Most Skipped Questions */}

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 mt-10">

        <h2 className="text-3xl font-bold mb-8">

          🚫 Most Skipped Questions

        </h2>

        <div className="space-y-4">

          {questionStats
            .slice()
            .sort((a, b) => b.skipped - a.skipped)
            .slice(0, 5)
            .map((question) => (

              <div
                key={question.id}
                className="flex justify-between items-center bg-slate-950 rounded-2xl p-5"
              >

                <div>

                  <h3 className="font-semibold">
                    {question.question}
                  </h3>

                  <p className="text-slate-400 mt-1">
                    {question.subject}
                  </p>

                </div>

                <div className="text-yellow-400 text-2xl font-bold">

                  {question.skipped}%

                </div>

              </div>

            ))}

        </div>

      </div>

      {/* Slowest Questions */}

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 mt-10">

        <h2 className="text-3xl font-bold mb-8">

          ⏱ Slowest Questions

        </h2>

        <div className="space-y-4">

          {questionStats
            .slice()
            .sort(
              (a, b) =>
                b.averageTime -
                a.averageTime
            )
            .slice(0, 5)
            .map((question) => (

              <div
                key={question.id}
                className="flex justify-between items-center bg-slate-950 rounded-2xl p-5"
              >

                <div>

                  <h3 className="font-semibold">
                    {question.question}
                  </h3>

                  <p className="text-slate-400 mt-1">
                    {question.subject}
                  </p>

                </div>

                <div className="text-blue-400 text-2xl font-bold">

                  {question.averageTime}s

                </div>

              </div>

            ))}

        </div>

      </div>

    </div>

  );

}
