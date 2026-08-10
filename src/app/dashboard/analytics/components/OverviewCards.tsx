"use client";

type Props = {
  data: {
    overview: {
      students: number;
      batches: number;
      subjects: number;
      questions: number;
      attempts: number;
      averageScore: number;
      averageAccuracy: number;
      averageTime: number;
    };
  };
};

export default function OverviewCards({ data }: Props) {
  const stats = data.overview;

  const cards = [
    { title: "Students", value: stats.students },
    { title: "Batches", value: stats.batches },
    { title: "Subjects", value: stats.subjects },
    { title: "Questions", value: stats.questions },
    { title: "Attempts", value: stats.attempts },
    {
      title: "Accuracy",
      value: `${stats.averageAccuracy.toFixed(1)}%`,
    },
    {
      title: "Avg Score",
      value: stats.averageScore.toFixed(1),
    },
    {
      title: "Avg Time",
      value: `${Math.round(stats.averageTime)} sec`,
    },
  ];

  return (
    <section className="mb-12">
      <h2 className="text-3xl font-bold mb-6">
        Institute Overview
      </h2>

      <div className="grid gap-5 md:grid-cols-3 xl:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.title}
            className="rounded-2xl bg-slate-900 border border-slate-800 p-6"
          >
            <p className="text-slate-400 text-sm">
              {card.title}
            </p>

            <h3 className="text-4xl font-bold mt-3">
              {card.value}
            </h3>
          </div>
        ))}
      </div>
    </section>
  );
}