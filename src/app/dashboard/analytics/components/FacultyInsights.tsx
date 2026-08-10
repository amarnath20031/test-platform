"use client";

type Props = {
  data: string[];
};

export default function FacultyInsights({
  data,
}: Props) {
  return (
    <section className="mt-16">

      <h2 className="text-3xl font-bold mb-8">
        👨🏻‍🏫 Faculty Insights
      </h2>

      {data.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-400">
          No insights available.
        </div>
      ) : (
        <div className="space-y-4">

          {data.map(
            (
              insight: string,
              index: number
            ) => (

              <div
                key={index}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
              >

                <p className="leading-8">
                  {insight}
                </p>

              </div>

            )
          )}

        </div>
      )}

    </section>
  );
}