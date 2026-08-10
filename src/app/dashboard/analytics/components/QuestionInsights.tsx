"use client";

type Props = {
  data: {
    hardest: any[];
    skipped: any[];
    slowest: any[];
    fastWrong: any[];
    slowWrong: any[];
    answerChanges: any[];
  };
};

export default function QuestionInsights({
  data,
}: Props) {
  return (
    <section className="mt-12">

      <h2 className="text-3xl font-bold mb-8">
        Question Intelligence
      </h2>

      <div className="grid xl:grid-cols-2 gap-6">

        <InsightCard
          title="🔥 Most Difficult Questions"
          rows={data.hardest}
          type="hard"
        />

        <InsightCard
          title="⏭ Most Skipped Questions"
          rows={data.skipped}
          type="skip"
        />

        <InsightCard
          title="⏱ Slowest Questions"
          rows={data.slowest}
          type="slow"
        />

        <InsightCard
          title="⚡ Fast Wrong Questions"
          rows={data.fastWrong}
          type="fastWrong"
        />

        <InsightCard
          title="🐢 Slow Wrong Questions"
          rows={data.slowWrong}
          type="slowWrong"
        />

        <InsightCard
          title="🔄 Highest Answer Changes"
          rows={data.answerChanges}
          type="changes"
        />

      </div>
    </section>
  );
}


function InsightCard({
  title,
  rows,
  type,
}: {
  title: string;
  rows: any[];
  type:
    | "hard"
    | "skip"
    | "slow"
    | "fastWrong"
    | "slowWrong"
    | "changes";
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

      <h3 className="text-2xl font-bold mb-6">
        {title}
      </h3>

      <div className="space-y-5">

        {rows.length === 0 && (
          <p className="text-slate-400">
            No data available.
          </p>
        )}

        {rows.map((q: any) => (

          <div
            key={q.id}
            className="border-b border-slate-800 pb-4"
          >

            <h4 className="font-semibold line-clamp-2">
              {q.text}
            </h4>

            <p className="text-slate-500 text-sm mt-1">
              {q.subjectName || "No Subject"}
              {" • "}
              {q.topic || "No Topic"}
            </p>

            <p className="text-slate-500 text-xs mt-1">
              {q.attempts} attempts
            </p>

            {type === "hard" && (
              <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                <p>🔥 Difficulty</p>
                <p>{Math.round(q.difficultyScore)}/100</p>

                <p>✅ Accuracy</p>
                <p>{q.accuracy.toFixed(1)}%</p>

                <p>⏱ Avg Time</p>
                <p>{q.avgTime.toFixed(1)} sec</p>

                <p>⏭ Skip Rate</p>
                <p>{q.skipRate.toFixed(1)}%</p>
              </div>
            )}

            {type === "skip" && (
              <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                <p>⏭ Skip Rate</p>
                <p>{q.skipRate.toFixed(1)}%</p>

                <p>Accuracy</p>
                <p>{q.accuracy.toFixed(1)}%</p>
              </div>
            )}

            {type === "slow" && (
              <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                <p>⏱ Avg Time</p>
                <p>{q.avgTime.toFixed(1)} sec</p>

                <p>Accuracy</p>
                <p>{q.accuracy.toFixed(1)}%</p>
              </div>
            )}

            {type === "fastWrong" && (
              <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                <p>⚡ Fast Wrong</p>
                <p>{q.fastWrong}</p>

                <p>Accuracy</p>
                <p>{q.accuracy.toFixed(1)}%</p>
              </div>
            )}

            {type === "slowWrong" && (
              <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                <p>🐢 Slow Wrong</p>
                <p>{q.slowWrong}</p>

                <p>Avg Time</p>
                <p>{q.avgTime.toFixed(1)} sec</p>

                <p>Accuracy</p>
                <p>{q.accuracy.toFixed(1)}%</p>
              </div>
            )}

            {type === "changes" && (
              <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                <p>🔄 Avg Changes</p>
                <p>{q.avgChanges.toFixed(1)}</p>

                <p>Accuracy</p>
                <p>{q.accuracy.toFixed(1)}%</p>
              </div>
            )}

          </div>

        ))}

      </div>

    </div>
  );
}