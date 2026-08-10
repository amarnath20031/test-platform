"use client";

interface Props {
  difficultQuestion: string;
  difficultAccuracy: number;

  skippedQuestion: string;
  skippedPercentage: number;

  slowQuestion: string;
  slowTime: number;

  fastWrongQuestion: string;

  weakSubject: string;

  weakBatch: string;

  bestBatch: string;
}

export default function TeachingInsights({
  difficultQuestion,
  difficultAccuracy,
  skippedQuestion,
  skippedPercentage,
  slowQuestion,
  slowTime,
  fastWrongQuestion,
  weakSubject,
  weakBatch,
  bestBatch,
}: Props) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">

      <h2 className="text-3xl font-bold mb-8">
        📈 Teaching Insights
      </h2>

      <div className="grid md:grid-cols-2 gap-6">

        <div className="bg-slate-950 rounded-2xl p-5">
          <p className="text-red-400 font-semibold">
            🔥 Most Difficult Question
          </p>

          <p className="mt-3 text-xl font-bold">
            {difficultQuestion || "-"}
          </p>

          <p className="text-gray-400 mt-1">
            Accuracy {difficultAccuracy}%
          </p>
        </div>

        <div className="bg-slate-950 rounded-2xl p-5">
          <p className="text-yellow-400 font-semibold">
            🚫 Most Skipped Question
          </p>

          <p className="mt-3 text-xl font-bold">
            {skippedQuestion || "-"}
          </p>

          <p className="text-gray-400 mt-1">
            {skippedPercentage}% skipped
          </p>
        </div>

        <div className="bg-slate-950 rounded-2xl p-5">
          <p className="text-blue-400 font-semibold">
            ⏱ Slowest Question
          </p>

          <p className="mt-3 text-xl font-bold">
            {slowQuestion || "-"}
          </p>

          <p className="text-gray-400 mt-1">
            {slowTime} sec average
          </p>
        </div>

        <div className="bg-slate-950 rounded-2xl p-5">
          <p className="text-orange-400 font-semibold">
            ⚡ Fast But Wrong
          </p>

          <p className="mt-3 text-xl font-bold">
            {fastWrongQuestion || "-"}
          </p>
        </div>

        <div className="bg-slate-950 rounded-2xl p-5">
          <p className="text-pink-400 font-semibold">
            📚 Subject Needing Revision
          </p>

          <p className="mt-3 text-xl font-bold">
            {weakSubject || "-"}
          </p>
        </div>

        <div className="bg-slate-950 rounded-2xl p-5">
          <p className="text-red-400 font-semibold">
            👥 Weakest Batch
          </p>

          <p className="mt-3 text-xl font-bold">
            {weakBatch || "-"}
          </p>
        </div>

        <div className="bg-slate-950 rounded-2xl p-5 md:col-span-2">
          <p className="text-green-400 font-semibold">
            ⭐ Best Performing Batch
          </p>

          <p className="mt-3 text-xl font-bold">
            {bestBatch || "-"}
          </p>
        </div>

      </div>

    </div>
  );
}