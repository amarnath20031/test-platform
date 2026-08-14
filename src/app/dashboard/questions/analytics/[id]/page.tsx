"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { loadAnalytics } from "@/lib/analytics/loadAnalytics";
import { buildAnalytics } from "@/lib/analytics/buildAnalytics";

export default function QuestionAnalyticsPage() {
  const params = useParams();
  const router = useRouter();

  const questionId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState<any>(null);

  useEffect(() => {
    async function load() {
      try {
        const rawData = await loadAnalytics();

        const analytics = buildAnalytics(rawData);

       const allQuestions =
  analytics.questionInsights?.all || [];

const found = allQuestions.find(
  (q: any) => q.id === questionId
);

setQuestion(found || null);
      } catch (error) {
        console.error(
          "QUESTION ANALYTICS ERROR:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [questionId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050816] text-white flex items-center justify-center">
        Loading Question Analytics...
      </main>
    );
  }

  if (!question) {
    return (
      <main className="min-h-screen bg-[#050816] text-white p-8">
        <div className="max-w-4xl mx-auto">

          <button
            onClick={() =>
              router.push("/dashboard/questions")
            }
            className="mb-8 bg-slate-800 hover:bg-slate-700 px-5 py-3 rounded-xl"
          >
            ← Back to Questions
          </button>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center">
            <h1 className="text-3xl font-bold">
              No Analytics Available
            </h1>

            <p className="text-slate-400 mt-3">
              This question does not have enough official
              attempt data yet.
            </p>
          </div>

        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050816] text-white p-8">

      <div className="max-w-6xl mx-auto">

        {/* Header */}

        <div className="flex justify-between items-start mb-10">

          <div>
            <p className="text-purple-400 font-semibold mb-2">
              Question Analytics
            </p>

            <h1 className="text-4xl font-bold leading-tight">
              {question.text}
            </h1>

            <div className="flex flex-wrap gap-3 mt-4">

              <span className="bg-slate-800 px-4 py-2 rounded-full text-sm">
                {question.subjectName}
              </span>

              <span className="bg-slate-800 px-4 py-2 rounded-full text-sm">
                {question.topic}
              </span>

            </div>
          </div>

          <button
            onClick={() =>
              router.push("/dashboard/questions")
            }
            className="bg-slate-800 hover:bg-slate-700 px-5 py-3 rounded-xl"
          >
            ← Back
          </button>

        </div>

        {/* Main statistics */}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <p className="text-slate-400">
              Attempts
            </p>

            <h2 className="text-4xl font-bold mt-3">
              {question.attempts}
            </h2>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <p className="text-slate-400">
              Accuracy
            </p>

            <h2 className="text-4xl font-bold mt-3 text-green-400">
              {Math.round(question.accuracy)}%
            </h2>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <p className="text-slate-400">
              Skipped
            </p>

            <h2 className="text-4xl font-bold mt-3 text-yellow-400">
              {Math.round(question.skipRate)}%
            </h2>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <p className="text-slate-400">
              Avg Time
            </p>

            <h2 className="text-4xl font-bold mt-3 text-blue-400">
              {Math.round(question.avgTime)}s
            </h2>
          </div>

        </div>

        {/* Detailed statistics */}

        <div className="grid md:grid-cols-2 gap-6">

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">

            <h2 className="text-2xl font-bold mb-6">
              Answer Performance
            </h2>

            <div className="space-y-5">

              <div className="flex justify-between">
                <span className="text-slate-400">
                  Answered
                </span>

                <span className="font-semibold">
                  {question.answered}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">
                  Correct
                </span>

                <span className="text-green-400 font-semibold">
                  {question.correct}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">
                  Wrong
                </span>

                <span className="text-red-400 font-semibold">
                  {question.answered -
                    question.correct}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">
                  Answer Changes
                </span>

                <span className="font-semibold">
                  {question.avgChanges.toFixed(1)}
                </span>
              </div>

            </div>

          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">

            <h2 className="text-2xl font-bold mb-6">
              Question Difficulty
            </h2>

            <div className="space-y-5">

              <div className="flex justify-between">
                <span className="text-slate-400">
                  Difficulty Score
                </span>

                <span className="font-semibold">
                  {Math.round(
                    question.difficultyScore
                  )}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">
                  Fast Wrong
                </span>

                <span className="font-semibold">
                  {Math.round(
                    question.fastWrongRate
                  )}%
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">
                  Slow Wrong
                </span>

                <span className="font-semibold">
                  {Math.round(
                    question.slowWrongRate
                  )}%
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">
                  Timing Data
                </span>

                <span className="font-semibold">
                  {question.hasTimingData
                    ? "Available"
                    : "Not available"}
                </span>
              </div>

            </div>

          </div>

        </div>

      </div>

    </main>
  );
}