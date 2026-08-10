"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function EditQuestionPage() {
  const router = useRouter();
  const params = useParams();

  const questionId = params.id as string;

  const [loading, setLoading] = useState(true);

  const [question, setQuestion] = useState<any>(null);

  const [text, setText] = useState("");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] =
    useState("Medium");

  const [marks, setMarks] = useState(1);
  const [negativeMarks, setNegativeMarks] =
    useState(0);

  const [explanation, setExplanation] =
    useState("");
    const [options, setOptions] = useState<any[]>([]);

  useEffect(() => {
    loadQuestion();
  }, []);

  async function loadQuestion() {
    const { data, error } = await supabase
  .from("Question")
  .select("*")
  .eq("id", questionId)
  .maybeSingle();

  if (!data) {
  router.replace("/dashboard/questions");
  return;
}

    setQuestion(data);

    setText(data.text || "");
    setTopic(data.topic || "");
    setDifficulty(
      data.difficulty || "Medium"
    );
    setMarks(data.marks || 1);
    setNegativeMarks(
      data.negativeMarks || 0
    );
    const { data: optionData } = await supabase
  .from("Option")
  .select("*")
  .eq("questionId", questionId)
  .order("text");

setOptions(optionData || []);

    setLoading(false);
  }

  async function saveQuestion() {
    const { error } = await supabase
      .from("Question")
      .update({
        text,
        topic,
        difficulty,
        marks,
        negativeMarks,
        explanation,
      })
      .eq("id", questionId);

      for (const option of options) {
  await supabase
    .from("Option")
    .update({
      text: option.text,
      isCorrect: option.isCorrect,
    })
    .eq("id", option.id);
}
    if (error) {
  alert(error.message);
  return;
}

await supabase.rpc(
  "refresh_test_total_marks",
  {
    p_test_id: question.testId,
  }
);

alert("Question updated successfully.");

router.replace("/dashboard/questions");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">

      <div className="max-w-5xl mx-auto">

        <div className="flex justify-between items-center mb-8">

          <div>
            <h1 className="text-4xl font-bold">
              Edit Question
            </h1>

            <p className="text-slate-400 mt-2">
              Update your question details
            </p>
          </div>

          <button
            onClick={() =>
              router.push("/dashboard/questions")
            }
            className="bg-slate-800 hover:bg-slate-700 px-5 py-3 rounded-xl"
          >
            ← Back
          </button>

        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6">

          <textarea
            value={text}
            onChange={(e) =>
              setText(e.target.value)
            }
            className="w-full min-h-[140px] bg-slate-950 border border-slate-700 rounded-xl p-4"
            placeholder="Question"
          />

          <input
            value={topic}
            onChange={(e) =>
              setTopic(e.target.value)
            }
            placeholder="Topic"
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4"
          />

          <div className="grid md:grid-cols-3 gap-5">

            <select
              value={difficulty}
              onChange={(e) =>
                setDifficulty(e.target.value)
              }
              className="bg-slate-950 border border-slate-700 rounded-xl p-4"
            >
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>

            <input
              type="number"
              value={marks}
              onChange={(e) =>
                setMarks(Number(e.target.value))
              }
              className="bg-slate-950 border border-slate-700 rounded-xl p-4"
              placeholder="Marks"
            />

            <input
              type="number"
              step="0.25"
              value={negativeMarks}
              onChange={(e) =>
                setNegativeMarks(
                  Number(e.target.value)
                )
              }
              className="bg-slate-950 border border-slate-700 rounded-xl p-4"
              placeholder="Negative Marks"
            />

          </div>

          <textarea
            value={explanation}
            onChange={(e) =>
              setExplanation(e.target.value)
            }
            className="w-full min-h-[180px] bg-slate-950 border border-slate-700 rounded-xl p-4"
            placeholder="Explanation"
          />

<div className="space-y-4">

  <h2 className="text-2xl font-bold">
    Answer Options
  </h2>

  {options.map((option, index) => (

    <div
      key={option.id}
      className="flex items-center gap-4"
    >

      <input
        type="radio"
        checked={option.isCorrect}
        onChange={() => {
          setOptions(
            options.map((o) => ({
              ...o,
              isCorrect: o.id === option.id,
            }))
          );
        }}
      />

      <input
        value={option.text}
        onChange={(e) => {
          const copy = [...options];
          copy[index].text = e.target.value;
          setOptions(copy);
        }}
        className="flex-1 bg-slate-950 border border-slate-700 rounded-xl p-4"
      />

    </div>

  ))}

</div>
          <div className="flex gap-4 pt-6">

            <button
              onClick={saveQuestion}
              className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-xl font-bold"
            >
              💾 Save Changes
            </button>

            <button
              onClick={() =>
                router.push("/dashboard/questions")
              }
              className="bg-slate-700 hover:bg-slate-600 px-8 py-4 rounded-xl"
            >
              Cancel
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}