"use client";

interface Props {
  answers: any[];
}

export default function AnswerChangeAnalytics({
  answers,
}: Props) {

  const total =
    answers.length;

  const changed =
    answers.filter(
      (a) =>
        Number(a.answerChanges || 0) > 0
    ).length;

  const neverChanged =
    total - changed;

  const averageChanges =
    total === 0
      ? 0
      : answers.reduce(
          (sum, a) =>
            sum +
            Number(
              a.answerChanges || 0
            ),
          0
        ) / total;

  const maxChanges =
    total === 0
      ? 0
      : Math.max(
          ...answers.map((a) =>
            Number(
              a.answerChanges || 0
            )
          )
        );

  const confusion =
    averageChanges > 2
      ? "High"
      : averageChanges > 1
      ? "Moderate"
      : "Low";

  return (

    <div className="bg-slate-900 rounded-3xl p-8 mt-10">

      <h2 className="text-3xl font-bold mb-8">

        🔄 Answer Change Analytics

      </h2>

      <div className="grid md:grid-cols-4 gap-6 mb-8">

        <div className="bg-slate-950 rounded-xl p-5">

          <p className="text-slate-400">

            Average Changes

          </p>

          <h2 className="text-4xl font-bold mt-3">

            {averageChanges.toFixed(1)}

          </h2>

        </div>

        <div className="bg-slate-950 rounded-xl p-5">

          <p className="text-slate-400">

            Changed Answer

          </p>

          <h2 className="text-4xl font-bold mt-3">

            {changed}

          </h2>

        </div>

        <div className="bg-slate-950 rounded-xl p-5">

          <p className="text-slate-400">

            Never Changed

          </p>

          <h2 className="text-4xl font-bold mt-3">

            {neverChanged}

          </h2>

        </div>

        <div className="bg-slate-950 rounded-xl p-5">

          <p className="text-slate-400">

            Maximum Changes

          </p>

          <h2 className="text-4xl font-bold mt-3">

            {maxChanges}

          </h2>

        </div>

      </div>

      <div className="bg-indigo-900 rounded-2xl p-6">

        <h3 className="text-2xl font-bold mb-4">

          🤖 Insight

        </h3>

        <p className="leading-8 text-lg">

          Question confusion is

          <b> {confusion}</b>.

          {confusion === "High" &&
            " Students frequently changed answers, suggesting uncertainty or confusing wording."}

          {confusion === "Moderate" &&
            " Students occasionally changed answers before submission."}

          {confusion === "Low" &&
            " Most students answered confidently without changing their choice."}

        </p>

      </div>

    </div>

  );

}