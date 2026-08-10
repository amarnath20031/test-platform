"use client";

type Props = {
  data: any[];
};

export default function StudentsNeedingAttention({
  data,
}: Props) {
  return (
    <section className="mt-16">

      <h2 className="text-3xl font-bold mb-8">
        🚨 Students Needing Attention
      </h2>

      {data.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-400">
          No students currently require attention.
        </div>
      ) : (
        <div className="space-y-5">

          {data.map((student: any) => (

            <div
              key={student.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
            >

              <div className="flex justify-between items-start gap-4">

                <div>
                  <h3 className="text-xl font-bold">
                    {student.name}
                  </h3>

                  <p className="text-slate-400">
                    {student.batch}
                  </p>
                </div>

                <span
                  className={`font-bold ${
                    student.status === "At Risk"
                      ? "text-red-400"
                      : "text-yellow-400"
                  }`}
                >
                  {student.status}
                </span>

              </div>

              <div className="grid md:grid-cols-5 gap-6 mt-6">

                <div>
                  <p className="text-slate-400">
                    Accuracy
                  </p>

                  <h4 className="text-3xl font-bold">
                    {student.accuracy.toFixed(1)}%
                  </h4>
                </div>

                <div>
                  <p className="text-slate-400">
                    Average Score
                  </p>

                  <h4 className="text-3xl font-bold">
                    {student.avgScore.toFixed(1)}
                  </h4>
                </div>

                <div>
                  <p className="text-slate-400">
                    Attempts
                  </p>

                  <h4 className="text-3xl font-bold">
                    {student.attempts}
                  </h4>
                </div>

                <div>
                  <p className="text-slate-400">
                    Weakest Topic
                  </p>

                  <h4 className="font-bold mt-2">
                    {student.weakestTopic}
                  </h4>

                  {student.weakestTopicAccuracy > 0 && (
                    <p className="text-red-400 text-sm mt-1">
                      {student.weakestTopicAccuracy.toFixed(1)}%
                      accuracy
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-slate-400">
                    Risk Score
                  </p>

                  <h4 className="text-3xl font-bold text-red-400">
                    {Math.round(
                      student.riskScore
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