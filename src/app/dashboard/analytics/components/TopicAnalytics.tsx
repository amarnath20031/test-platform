"use client";

type Props = {
  data: any[];
};

export default function TopicAnalytics({
  data,
}: Props) {
  return (
    <section className="mt-16">

      <h2 className="text-3xl font-bold mb-8">
        📖 Topic Analytics
      </h2>

      {data.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-400">
          No topic analytics available. Make sure questions have topics assigned.
        </div>
      ) : (
        <div className="space-y-5">

          {data.map((topic: any) => (

            <div
              key={topic.topic}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
            >

              <div className="flex justify-between items-start gap-4">

                <div>
                  <h3 className="text-2xl font-bold">
                    {topic.topic}
                  </h3>

                  <p className="text-slate-400 mt-1">
                    {topic.attempts} answer attempts
                  </p>
                </div>

                <span className="text-red-400 font-bold">
                  Revision Score{" "}
                  {Math.round(
                    topic.revisionScore
                  )}
                </span>

              </div>

              <div className="grid md:grid-cols-5 gap-6 mt-6">

                <div>
                  <p className="text-slate-400">
                    Accuracy
                  </p>

                  <h4 className="text-3xl font-bold">
                    {topic.accuracy.toFixed(1)}%
                  </h4>
                </div>

                <div>
                  <p className="text-slate-400">
                    Wrong Answers
                  </p>

                  <h4 className="text-3xl font-bold text-red-400">
                    {topic.wrong.toFixed(1)}%
                  </h4>
                </div>

                <div>
                  <p className="text-slate-400">
                    Avg Time
                  </p>

                  <h4 className="text-3xl font-bold">
                    {topic.avgTime.toFixed(1)} sec
                  </h4>
                </div>

                <div>
                  <p className="text-slate-400">
                    Skip Rate
                  </p>

                  <h4 className="text-3xl font-bold">
                    {topic.skipRate.toFixed(1)}%
                  </h4>
                </div>

                <div>
                  <p className="text-slate-400">
                    Recommendation
                  </p>

                  <h4 className="font-bold mt-2">
                    {topic.recommendation}
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