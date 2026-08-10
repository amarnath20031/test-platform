"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function StudentAnalyticsPage() {
  const params = useParams();
const attemptId = params.attemptId as string;

console.log("Attempt ID from URL:", attemptId);

  const [attempt, setAttempt] = useState<any>(null);
const [answers, setAnswers] = useState<any[]>([]);
const [options, setOptions] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const { data, error } = await supabase
      .from("Attempt")
      .select(`
        *,
        student:Student(name),
        test:Test(title)
      `)
      .eq("id", attemptId)
      .single();

    console.log(data);
    console.log(error);

    if (data) {
      setAttempt(data);
    const { data: answerData, error: answerError } = await supabase
  .from("Answer")
  .select(`
    *,
    question:Question(
      text,
      Option(
        id,
        text,
        isCorrect
      )
    ),
    selected:Option!optionId(
      text
    )
  `)
  .eq("attemptId", attemptId);

console.log("Attempt ID:", attemptId);
console.log("Answer rows:", answerData);
console.log("Answer error:", answerError);

if (answerData) {
  setAnswers(answerData);
}
const { data: optionData } = await supabase
  .from("Option")
  .select("*");

if (optionData) {
  setOptions(optionData);
}
    }
  }

  if (!attempt) {
    return (
      <div className="p-8 text-white">
        Loading...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-8">

      <h1 className="text-4xl font-bold mb-8">
        👤 Student Analytics
      </h1>

      <div className="bg-gray-900 rounded-xl p-6 mb-8">
        <h2 className="text-2xl font-bold">
          {attempt.student?.name}
        </h2>

        <p className="text-gray-400">
          {attempt.test?.title}
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-6">

        <div className="bg-gray-900 p-6 rounded-xl">
          <p className="text-gray-400">
            Score
          </p>

          <h2 className="text-4xl font-bold text-green-400">
            {attempt.score}
          </h2>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl">
          <p className="text-gray-400">
            Percentage
          </p>

          <h2 className="text-4xl font-bold text-blue-400">
            {attempt.percentage.toFixed(2)}%
          </h2>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl">
          <p className="text-gray-400">
            Rank
          </p>

          <h2 className="text-4xl font-bold text-yellow-400">
            #{attempt.rank}
          </h2>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl">
          <p className="text-gray-400">
            Time Taken
          </p>

          <h2 className="text-4xl font-bold text-red-400">
            {Math.floor((attempt.timeTaken || 0) / 60)}m{" "}
            {(attempt.timeTaken || 0) % 60}s
          </h2>
        </div>

      </div>

      <div className="grid md:grid-cols-3 gap-6 mt-8">

        <div className="bg-green-900/30 border border-green-600 rounded-xl p-6">
          <p className="text-gray-300">
            Correct
          </p>

          <h2 className="text-4xl font-bold text-green-400">
            {attempt.correctAnswers}
          </h2>
        </div>

        <div className="bg-red-900/30 border border-red-600 rounded-xl p-6">
          <p className="text-gray-300">
            Wrong
          </p>

          <h2 className="text-4xl font-bold text-red-400">
            {attempt.wrongAnswers}
          </h2>
        </div>

        <div className="bg-yellow-900/30 border border-yellow-600 rounded-xl p-6">
          <p className="text-gray-300">
            Skipped
          </p>

          <h2 className="text-4xl font-bold text-yellow-400">
            {attempt.skippedAnswers}
          </h2>
        </div>

        <div className="mt-10">
  <h2 className="text-2xl font-bold mb-6">
    Behaviour Analytics
  </h2>

  <div className="grid md:grid-cols-2 gap-6">

    <div className="bg-gray-900 rounded-xl p-6">
      <p className="text-gray-400">
        Average Time / Question
      </p>

      <h2 className="text-3xl font-bold text-cyan-400">
       {(
  answers.reduce(
    (sum, a) => sum + Number(a.timeSpent || 0),
    0
  ) / Math.max(answers.length, 1)
).toFixed(1)} sec
      </h2>
    </div>

    <div className="bg-gray-900 rounded-xl p-6">
      <p className="text-gray-400">
        Total Answer Changes
      </p>

      <h2 className="text-3xl font-bold text-orange-400">
        {answers.reduce(
  (sum, a) => sum + Number(a.answerChanges || 0),
  0
)}
      </h2>
    </div>

  </div>
</div>

      </div>

<div className="mt-12">
  {answers.map((answer, index) => {
  const selectedOption = options.find(
  (o) => o.id === answer.optionId
);

const correctOption = options.find(
  (o) =>
    o.questionId === answer.questionId &&
    o.isCorrect
);

  return (
    <div
      key={answer.id}
      className="bg-gray-900 rounded-xl p-6 mb-6"
    >
      <h2 className="text-xl font-bold mb-3">
        Question {index + 1}
      </h2>

      <p className="mb-6">
        {answer.question.text}
      </p>

      <div className="grid md:grid-cols-2 gap-6">

        <div>
          <p className="text-gray-400">
            Student Answer
          </p>

          <p className="font-semibold">
            {selectedOption?.text ?? "Skipped"}
          </p>
        </div>

        <div>
          <p className="text-gray-400">
            Correct Answer
          </p>

          <p className="text-green-400 font-semibold">
            {correctOption?.text}
          </p>
        </div>

        <div>
          <p className="text-gray-400">
            Time Spent
          </p>

          <p>{answer.timeSpent} sec</p>
        </div>

        <div>
          <p className="text-gray-400">
            Answer Changes
          </p>

          <p>{answer.answerChanges}</p>
        </div>

      </div>
    </div>
  );
})}
  </div>
    </main>
  );
}