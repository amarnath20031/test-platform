"use client";

interface Props {
  students: number;
  batches: number;
  subjects: number;
  tests: number;

  attempts: number;
  accuracy: number;
  avgScore: number;
  avgTime: number;
}

export default function OverviewCards({
  students,
  batches,
  subjects,
  tests,
  attempts,
  accuracy,
  avgScore,
  avgTime,
}: Props) {
  const cards = [
    {
      title: "Students",
      value: students,
      color: "bg-slate-900",
    },
    {
      title: "Batches",
      value: batches,
      color: "bg-slate-900",
    },
    {
      title: "Subjects",
      value: subjects,
      color: "bg-slate-900",
    },
    {
      title: "Tests",
      value: tests,
      color: "bg-slate-900",
    },
    {
      title: "Overall Accuracy",
      value: `${accuracy}%`,
      color: "bg-green-700",
    },
    {
      title: "Average Score",
      value: avgScore.toFixed(1),
      color: "bg-blue-700",
    },
    {
      title: "Official Attempts",
      value: attempts,
      color: "bg-purple-700",
    },
    {
      title: "Average Time",
      value: `${Math.floor(avgTime / 60)}m ${avgTime % 60}s`,
      color: "bg-orange-700",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => (
        <div
          key={card.title}
          className={`${card.color} rounded-2xl p-6`}
        >
          <p className="text-gray-200">
            {card.title}
          </p>

          <h2 className="text-4xl font-bold mt-3">
            {card.value}
          </h2>
        </div>
      ))}
    </div>
  );
}