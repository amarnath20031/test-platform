"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function NewQuestionPage() {
  const router = useRouter();

  const [tests, setTests] = useState<any[]>([]);
  const [testId, setTestId] = useState("");

  const [text, setText] = useState("");
  const [marks, setMarks] = useState(1);
  const [explanation, setExplanation] = useState("");

  const [option1, setOption1] = useState("");
  const [option2, setOption2] = useState("");
  const [option3, setOption3] = useState("");
  const [option4, setOption4] = useState("");

  const [correctOption, setCorrectOption] = useState("");

  useEffect(() => {
    async function loadTests() {
      const { data } = await supabase
        .from("Test")
        .select("*")
        .order("title");

      if (data) {
        setTests(data);
      }
    }

    loadTests();
  }, []);

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
      alert("Please fill all fields.");
      return;
    }

    const questionId = crypto.randomUUID();

    const { error: questionError } = await supabase
      .from("Question")
      .insert([
        {
          id: questionId,
          text,
          testId,
          marks,
          explanation,
        },
      ]);

    if (questionError) {
      alert(questionError.message);
      return;
    }

    const options = [
      {
        id: crypto.randomUUID(),
        text: option1,
        questionId,
        isCorrect: correctOption === "1",
      },
      {
        id: crypto.randomUUID(),
        text: option2,
        questionId,
        isCorrect: correctOption === "2",
      },
      {
        id: crypto.randomUUID(),
        text: option3,
        questionId,
        isCorrect: correctOption === "3",
      },
      {
        id: crypto.randomUUID(),
        text: option4,
        questionId,
        isCorrect: correctOption === "4",
      },
    ];

    const { error: optionError } = await supabase
      .from("Option")
      .insert(options);

    if (optionError) {
      alert(optionError.message);
      return;
    }

    router.push("/dashboard/questions");
  }

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">
        Add Question
      </h1>

      <div className="space-y-4">

        <select
          className="border p-3 rounded w-full"
          value={testId}
          onChange={(e) => setTestId(e.target.value)}
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

        <textarea
          className="border p-3 rounded w-full"
          placeholder="Question"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <input
          className="border p-3 rounded w-full"
          placeholder="Marks"
          type="number"
          value={marks}
          onChange={(e) =>
            setMarks(Number(e.target.value))
          }
        />

        <textarea
          className="border p-3 rounded w-full"
          placeholder="Explanation"
          value={explanation}
          onChange={(e) =>
            setExplanation(e.target.value)
          }
        />

        <input
          className="border p-3 rounded w-full"
          placeholder="Option 1"
          value={option1}
          onChange={(e) =>
            setOption1(e.target.value)
          }
        />

        <input
          className="border p-3 rounded w-full"
          placeholder="Option 2"
          value={option2}
          onChange={(e) =>
            setOption2(e.target.value)
          }
        />

        <input
          className="border p-3 rounded w-full"
          placeholder="Option 3"
          value={option3}
          onChange={(e) =>
            setOption3(e.target.value)
          }
        />

        <input
          className="border p-3 rounded w-full"
          placeholder="Option 4"
          value={option4}
          onChange={(e) =>
            setOption4(e.target.value)
          }
        />

        <select
          className="border p-3 rounded w-full"
          value={correctOption}
          onChange={(e) =>
            setCorrectOption(e.target.value)
          }
        >
          <option value="">
            Correct Option
          </option>

          <option value="1">
            Option 1
          </option>

          <option value="2">
            Option 2
          </option>

          <option value="3">
            Option 3
          </option>

          <option value="4">
            Option 4
          </option>
        </select>

        <button
          onClick={createQuestion}
          className="bg-black text-white px-5 py-3 rounded"
        >
          Save Question
        </button>
      </div>
    </div>
  );
}