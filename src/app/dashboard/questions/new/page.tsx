"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function NewQuestionPage() {
  const router = useRouter();

  const [tests, setTests] = useState<any[]>([]);
  const [testId, setTestId] = useState("");

  const [text, setText] = useState("");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] =
    useState("Medium");

  const [marks, setMarks] = useState(1);

  const [negativeMarks, setNegativeMarks] =
    useState(0);

  const [explanation, setExplanation] =
    useState("");

  const [imageUrl, setImageUrl] =
    useState("");

  const [option1, setOption1] =
    useState("");

  const [option2, setOption2] =
    useState("");

  const [option3, setOption3] =
    useState("");

  const [option4, setOption4] =
    useState("");

  const [correctOption, setCorrectOption] =
    useState("");

  useEffect(() => {
    loadTests();
  }, []);

  async function loadTests() {
    const { data } = await supabase
      .from("Test")
      .select("*")
      .order("title");

    if (data) {
      setTests(data);
    }
  }

  async function createQuestion() {
    if (
      !testId ||
      !text ||
      !option1 ||
      !option2 ||
      !option3 ||
      !option4 ||
      !correctOption
    ) {
      alert("Please fill all required fields.");
      return;
    }

    const questionId = crypto.randomUUID();

    const { error: questionError } =
      await supabase
        .from("Question")
        .insert([
          {
            id: questionId,
            text,
            testId,
            topic,
            difficulty,
            marks,
            negativeMarks,
            explanation,
            imageUrl,
          },
        ]);

    if (questionError) {
      alert(questionError.message);
      return;
    }

    const options = [
      {
        id: crypto.randomUUID(),
        questionId,
        text: option1,
        isCorrect: correctOption === "1",
      },
      {
        id: crypto.randomUUID(),
        questionId,
        text: option2,
        isCorrect: correctOption === "2",
      },
      {
        id: crypto.randomUUID(),
        questionId,
        text: option3,
        isCorrect: correctOption === "3",
      },
      {
        id: crypto.randomUUID(),
        questionId,
        text: option4,
        isCorrect: correctOption === "4",
      },
    ];

   const { error: optionError } =
  await supabase
    .from("Option")
    .insert(options);

if (optionError) {
  alert(optionError.message);
  return;
}

await supabase.rpc(
  "refresh_test_total_marks",
  {
    p_test_id: testId,
  }
);

router.push("/dashboard/questions");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">

  <div className="max-w-7xl mx-auto p-6 lg:p-10">

    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

      <div>
        <h1 className="text-4xl font-bold">
          Add Question
        </h1>

        <p className="text-slate-400 mt-2">
          Create a new question for your Question Bank.
        </p>
      </div>

      <button
        onClick={() =>
          router.push("/dashboard/questions")
        }
        className="bg-slate-800 hover:bg-slate-700 px-6 py-3 rounded-xl"
      >
        ← Back
      </button>

    </div>

    <div className="grid lg:grid-cols-3 gap-8">

      {/* LEFT PANEL */}

      <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6">

        <h2 className="text-2xl font-bold">
          Question Details
        </h2>

        <select
          value={testId}
          onChange={(e) =>
            setTestId(e.target.value)
          }
          className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3"
        >
          <option value="">
            Select Test
          </option>

          {tests.map((test) => (
            <option
              key={test.id}
              value={test.id}
            >
              {test.title}
            </option>
          ))}

        </select>

        <input
          value={topic}
          onChange={(e) =>
            setTopic(e.target.value)
          }
          placeholder="Topic / Chapter"
          className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3"
        />

        <div className="grid md:grid-cols-3 gap-4">

          <select
            value={difficulty}
            onChange={(e) =>
              setDifficulty(e.target.value)
            }
            className="rounded-xl bg-slate-950 border border-slate-700 px-4 py-3"
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
            placeholder="Marks"
            className="rounded-xl bg-slate-950 border border-slate-700 px-4 py-3"
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
            placeholder="Negative"
            className="rounded-xl bg-slate-950 border border-slate-700 px-4 py-3"
          />

        </div>

        <input
          value={imageUrl}
          onChange={(e) =>
            setImageUrl(e.target.value)
          }
          placeholder="Image URL (optional)"
          className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3"
        />

        <textarea
          value={text}
          onChange={(e) =>
            setText(e.target.value)
          }
          placeholder="Type your question..."
          className="min-h-[160px] w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3"
        />

        <textarea
          value={explanation}
          onChange={(e) =>
            setExplanation(e.target.value)
          }
          placeholder="Explanation"
          className="min-h-[140px] w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3"
        />

        <h2 className="text-2xl font-bold pt-6">
          Options
        </h2>
        <div className="grid md:grid-cols-2 gap-5">

  {[
    {
      label: "A",
      value: option1,
      setValue: setOption1,
      id: "1",
    },
    {
      label: "B",
      value: option2,
      setValue: setOption2,
      id: "2",
    },
    {
      label: "C",
      value: option3,
      setValue: setOption3,
      id: "3",
    },
    {
      label: "D",
      value: option4,
      setValue: setOption4,
      id: "4",
    },
  ].map((option) => (

    <div
      key={option.id}
      className={`rounded-2xl border p-5 transition ${
        correctOption === option.id
          ? "border-green-500 bg-green-500/10"
          : "border-slate-700 bg-slate-950"
      }`}
    >

      <div className="flex justify-between items-center mb-4">

        <h3 className="text-lg font-bold">
          Option {option.label}
        </h3>

        <label className="flex items-center gap-2 cursor-pointer">

          <input
            type="radio"
            checked={correctOption === option.id}
            onChange={() =>
              setCorrectOption(option.id)
            }
          />

          <span className="text-sm">
            Correct
          </span>

        </label>

      </div>

      <textarea
        value={option.value}
        onChange={(e) =>
          option.setValue(e.target.value)
        }
        placeholder={`Enter Option ${option.label}`}
        className="w-full min-h-[90px] rounded-xl bg-slate-900 border border-slate-700 p-3"
      />

    </div>

  ))}

</div>

<div className="pt-6">

  <button
    onClick={createQuestion}
    className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 py-4 text-lg font-bold transition"
  >
    💾 Save Question
  </button>

</div>

</div>
      {/* RIGHT PANEL */}

      <div className="space-y-6">

        <div className="sticky top-6 bg-slate-900 border border-slate-800 rounded-3xl p-6">

          <h2 className="text-2xl font-bold mb-6">
            Live Preview
          </h2>

          <div className="flex flex-wrap gap-2 mb-6">

            <span className="bg-blue-600 px-3 py-1 rounded-full text-sm">
              {difficulty}
            </span>

            <span className="bg-green-600 px-3 py-1 rounded-full text-sm">
              +{marks} Marks
            </span>

            <span className="bg-red-600 px-3 py-1 rounded-full text-sm">
              -{negativeMarks}
            </span>

          </div>

          {topic && (
            <div className="mb-5">
              <p className="text-slate-400 text-sm">
                Topic
              </p>

              <p className="font-semibold mt-1">
                {topic}
              </p>
            </div>
          )}

          <div className="border-t border-slate-800 pt-5">

            <h3 className="font-bold text-lg mb-4">
              Question
            </h3>

            <p className="whitespace-pre-wrap leading-7">

              {text || "Your question will appear here..."}

            </p>

          </div>

          {imageUrl && (

            <div className="mt-6">

              <img
                src={imageUrl}
                alt="Question"
                className="rounded-xl border border-slate-700 max-h-64 w-full object-contain"
              />

            </div>

          )}

          <div className="space-y-3 mt-8">

            {[
              option1,
              option2,
              option3,
              option4,
            ].map((option, index) => {

              const selected =
                correctOption ===
                String(index + 1);

              return (

                <div
                  key={index}
                  className={`border rounded-xl p-4 ${
                    selected
                      ? "border-green-500 bg-green-500/10"
                      : "border-slate-700 bg-slate-950"
                  }`}
                >

                  <div className="flex justify-between">

                    <span>

                      <b>
                        {String.fromCharCode(
                          65 + index
                        )}
                        .
                      </b>{" "}
                      {option || "Option"}

                    </span>

                    {selected && (

                      <span className="text-green-400 font-semibold">

                        ✓ Correct

                      </span>

                    )}

                  </div>

                </div>

              );

            })}

          </div>

          {explanation && (

            <div className="mt-8 border-t border-slate-800 pt-6">

              <h3 className="font-bold text-lg mb-3">
                Explanation
              </h3>

              <p className="text-slate-300 whitespace-pre-wrap">

                {explanation}

              </p>

            </div>

          )}

        </div>

      </div>

    </div>

  </div>

</div>

);
}