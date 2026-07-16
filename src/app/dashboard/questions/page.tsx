"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<any[]>([]);

  useEffect(() => {
    async function getQuestions() {
      const { data } = await supabase
        .from("Question")
        .select("*");

      if (data) {
        setQuestions(data);
      }
    }

    getQuestions();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">
        Questions
      </h1>

      <a
        href="/dashboard/questions/new"
        className="bg-black text-white px-4 py-2 rounded"
      >
        Add Question
      </a>

      <div className="mt-8 space-y-4">
        {questions.map((question) => (
          <div
            key={question.id}
            className="border p-4 rounded"
          >
            <p className="font-bold">
              {question.text}
            </p>

            <p>
              Marks: {question.marks}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}