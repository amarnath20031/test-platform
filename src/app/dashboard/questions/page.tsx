"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { supabase } from "@/lib/supabase/client";

export default function QuestionsPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<any[]>([]);
  const [search, setSearch] = useState("");
const [difficultyFilter, setDifficultyFilter] =
  useState("All");

  useEffect(() => {

   async function getQuestions() {
  const { data, error } = await supabase
    .from("Question")
    .select(`
      *,
      Test(title)
    `)
    .order("createdAt", {
      ascending: false,
    });

  console.log("DATA:", data);
  console.log("ERROR:", error);

  if (error) {
    return;
  }

  if (data) {
    setQuestions(data);
  }
}

    getQuestions();
  }, []);

  const filteredQuestions =
  questions.filter((question) => {
    const matchesSearch =
      question.text
        ?.toLowerCase()
        .includes(search.toLowerCase());

    const matchesDifficulty =
      difficultyFilter === "All"
        ? true
        : question.difficulty ===
          difficultyFilter;

    return (
      matchesSearch &&
      matchesDifficulty
    );
  });

 async function duplicateQuestion(question: any) {
  const newId = crypto.randomUUID();

  const { data: options } = await supabase
    .from("Option")
    .select("*")
    .eq("questionId", question.id);

  const { error } = await supabase
    .from("Question")
    .insert({
      id: newId,
      text: question.text + " (Copy)",
      testId: question.testId,
      sectionId: question.sectionId,
      subjectId: question.subjectId,
      topic: question.topic,
      difficulty: question.difficulty,
      marks: question.marks,
      negativeMarks: question.negativeMarks,
      explanation: question.explanation,
      imageUrl: question.imageUrl,
    });

  if (error) {
    alert(error.message);
    return;
  }

  if (options?.length) {
    const newOptions = options.map((option: any) => ({
      id: crypto.randomUUID(),
      questionId: newId,
      text: option.text,
      isCorrect: option.isCorrect,
    }));

    await supabase
      .from("Option")
      .insert(newOptions);
  }

  await supabase.rpc(
  "refresh_test_total_marks",
  {
    p_test_id: question.testId,
  }
);
  setQuestions((prev) => [
  {
    ...question,
    id: newId,
    text: question.text + " (Copy)",
  },
  ...prev,
]);
}

async function deleteQuestion(question: any) {
  if (!confirm("Delete this question?")) return;

  const { error: optionError } = await supabase
    .from("Option")
    .delete()
    .eq("questionId", question.id);

  if (optionError) {
    alert(optionError.message);
    return;
  }

  const { error } = await supabase
    .from("Question")
    .delete()
    .eq("id", question.id);

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

  setQuestions((prev) =>
    prev.filter((q) => q.id !== question.id)
  );
}

return (
  <div className="p-8">

    <h1 className="text-3xl font-bold mb-6">
      Questions
    </h1>

   <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">

  <div className="flex flex-wrap gap-3">

    <Link
  href="/dashboard/questions/new"
  className="bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded-xl"
>
  ➕ Add Question
</Link>

    <Link
  href="/dashboard/questions/import"
  className="bg-green-600 hover:bg-green-700 px-5 py-3 rounded-xl"
>
  📥 Excel Import
</Link>

    <Link
  href="/dashboard/questions/import-pdf"
  className="bg-purple-600 hover:bg-purple-700 px-5 py-3 rounded-xl"
>
  🤖 AI Import
</Link>

  </div>

  <div className="flex flex-col md:flex-row gap-3">

    <input
      value={search}
      onChange={(e) =>
        setSearch(e.target.value)
      }
      placeholder="Search question..."
      className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3"
    />

    <select
      value={difficultyFilter}
      onChange={(e) =>
        setDifficultyFilter(e.target.value)
      }
      className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3"
    >
      <option>All</option>
      <option>Easy</option>
      <option>Medium</option>
      <option>Hard</option>
    </select>

  </div>

</div>

   <div className="space-y-4">
  {filteredQuestions.map((question) => (
    <div
      key={question.id}
      className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-blue-500 transition"
    >
      <div className="flex flex-col lg:flex-row lg:justify-between gap-5">
        <div className="flex-1">
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="bg-blue-600 px-3 py-1 rounded-full text-xs">
              {question.difficulty || "Medium"}
            </span>

            <span className="bg-green-600 px-3 py-1 rounded-full text-xs">
              +{question.marks}
            </span>

            <span className="bg-red-600 px-3 py-1 rounded-full text-xs">
              -{question.negativeMarks || 0}
            </span>

            {question.topic && (
              <span className="bg-slate-700 px-3 py-1 rounded-full text-xs">
                {question.topic}
              </span>
            )}
          </div>

          <h2 className="text-lg font-semibold leading-7">
            {question.text}
          </h2>

          <p className="text-slate-400 mt-3">
            Test: {question.Test?.title || "-"}
          </p>
        </div>

       <div className="flex flex-col gap-2 min-w-[170px]">

  <button
    onClick={() =>
      router.replace(`/dashboard/questions/${question.id}`)
    }
    className="bg-blue-600 hover:bg-blue-700 rounded-xl py-2 px-4"
  >
    ✏ Edit
  </button>

  <button
    onClick={() =>
      router.push(
        `/dashboard/questions/analytics/${question.id}`
      )
    }
    className="bg-purple-600 hover:bg-purple-700 rounded-xl py-2 px-4"
  >
    📊 Analytics
  </button>

  <button
    onClick={() => duplicateQuestion(question)}
    className="bg-yellow-600 hover:bg-yellow-700 rounded-xl py-2 px-4"
  >
    📄 Duplicate
  </button>

  <button
    onClick={() => deleteQuestion(question)}
    className="bg-red-600 hover:bg-red-700 rounded-xl py-2 px-4"
  >
    🗑 Delete
  </button>

</div>
      </div>
    </div>
  ))}
</div>

</div>
);
}