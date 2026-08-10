"use client";

interface QuestionAnalytics {
  id: string;
  question: string;
  subject: string;
  accuracy: number;
  averageTime: number;
  skipped: number;
}

interface Props {
  questions: QuestionAnalytics[];
}

export default function DifficultQuestions({
  questions,
}: Props) {
  function difficultyColor(acc: number) {
    if (acc < 40)
      return "text-red-400";

    if (acc < 70)
      return "text-yellow-400";

    return "text-green-400";
  }

  function difficulty(acc: number) {
    if (acc < 40) return "Hard";

    if (acc < 70) return "Moderate";

    return "Easy";
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">

      <div className="flex justify-between items-center mb-8">

        <div>

          <h2 className="text-3xl font-bold">
            🔥 Most Difficult Questions
          </h2>

          <p className="text-slate-400 mt-2">
            Questions where students struggle the most.
          </p>

        </div>

      </div>

      <div className="overflow-x-auto">

        <table className="w-full">

          <thead>

            <tr className="text-slate-400 border-b border-slate-800">

              <th className="text-left py-4">
                Question
              </th>

              <th className="text-left">
                Subject
              </th>

              <th>
                Accuracy
              </th>

              <th>
                Avg Time
              </th>

              <th>
                Skipped
              </th>

              <th>
                Difficulty
              </th>

            </tr>

          </thead>

          <tbody>

            {questions.map((q) => (

              <tr
                key={q.id}
                className="border-b border-slate-800 hover:bg-slate-950 transition"
              >

                <td className="py-5 pr-5 max-w-lg">

                  <p className="line-clamp-2">
                    {q.question}
                  </p>

                </td>

                <td>
                  {q.subject}
                </td>

                <td className="text-center">

                  {q.accuracy}%

                </td>

                <td className="text-center">

                  {q.averageTime}s

                </td>

                <td className="text-center">

                  {q.skipped}%

                </td>

                <td
                  className={`text-center font-semibold ${difficultyColor(
                    q.accuracy
                  )}`}
                >

                  {difficulty(q.accuracy)}

                </td>

              </tr>

            ))}

            {questions.length === 0 && (

              <tr>

                <td
                  colSpan={6}
                  className="py-12 text-center text-slate-500"
                >

                  No analytics available yet.

                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}