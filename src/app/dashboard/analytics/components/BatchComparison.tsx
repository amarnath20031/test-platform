"use client";

type Props = {
  data: any[];
};

export default function BatchComparison({
  data,
}: Props) {
  return (
    <section className="mt-16">

      <h2 className="text-3xl font-bold mb-8">
        👥 Batch Comparison
      </h2>

      {data.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-400">
          No batch analytics available.
        </div>
      ) : (
        <div className="space-y-5">

          {data.map((batch: any) => (

            <div
              key={batch.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
            >

              <div className="flex justify-between items-start gap-4">

                <div>
                  <h3 className="text-2xl font-bold">
                    {batch.name}
                  </h3>

                  <p className="text-slate-400 mt-1">
                    {batch.attempts} attempts
                  </p>
                </div>

                <span
                  className={`font-bold ${
                    batch.riskScore >= 70
                      ? "text-red-400"
                      : batch.riskScore >= 50
                      ? "text-yellow-400"
                      : "text-green-400"
                  }`}
                >
                  {batch.recommendation}
                </span>

              </div>

              <div className="grid md:grid-cols-5 gap-6 mt-6">

                <div>
                  <p className="text-slate-400">
                    Accuracy
                  </p>

                  <h4 className="text-3xl font-bold">
                    {batch.accuracy.toFixed(1)}%
                  </h4>
                </div>

                <div>
                  <p className="text-slate-400">
                    Avg Score
                  </p>

                  <h4 className="text-3xl font-bold">
                    {batch.avgScore.toFixed(1)}
                  </h4>
                </div>

                <div>
                  <p className="text-slate-400">
                    Avg Time
                  </p>

                  <h4 className="text-3xl font-bold">
                    {batch.avgTime.toFixed(1)} sec
                  </h4>
                </div>

                <div>
                  <p className="text-slate-400">
                    Weakest Subject
                  </p>

                  <h4 className="font-bold mt-2">
                    {batch.weakestSubject}
                  </h4>

                  {batch.weakestSubjectAccuracy > 0 && (
                    <p className="text-red-400 text-sm mt-1">
                      {batch.weakestSubjectAccuracy.toFixed(1)}%
                      accuracy
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-slate-400">
                    Risk Score
                  </p>

                  <h4
                    className={`text-3xl font-bold ${
                      batch.riskScore >= 70
                        ? "text-red-400"
                        : batch.riskScore >= 50
                        ? "text-yellow-400"
                        : "text-green-400"
                    }`}
                  >
                    {Math.round(
                      batch.riskScore
                    )}
                  </h4>
                </div>

              </div>

            </div>

          ))}

        </div>
      )}

    </section>
  );
}