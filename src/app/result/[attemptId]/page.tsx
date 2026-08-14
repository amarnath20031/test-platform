"use client";

import { useEffect, useState } from "react";
import {
  useParams,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function ResultPage() {
 const params = useParams();
const router = useRouter();
const searchParams = useSearchParams();

const from = searchParams.get("from");

const attemptId = params.attemptId as string;

  const [attempt, setAttempt] =
    useState<any>(null);

  const [answers, setAnswers] =
    useState<any[]>([]);
    const [sections, setSections] = useState<any[]>([]);
const [selectedSection, setSelectedSection] = useState("");

  const [filter, setFilter] = useState<
    "all" |
    "correct" |
    "wrong" |
    "skipped"
  >("all");

  const [currentQuestion, setCurrentQuestion] =
    useState(0);

  useEffect(() => {
  if (!attemptId) return;

  loadData();

  window.history.pushState(null, "", window.location.href);

  const handleBack = () => {
    router.replace("/student");
    router.refresh();
  };

  window.addEventListener("popstate", handleBack);

  return () => {
    window.removeEventListener("popstate", handleBack);
  };
}, [attemptId]);

  async function loadData() {
  console.log("LOADING RESULT FOR ATTEMPT:", attemptId);

  // -----------------------------
  // 1. Load attempt
  // -----------------------------
  const { data: attemptData, error: attemptError } =
    await supabase
      .from("Attempt")
      .select("*")
      .eq("id", attemptId)
      .single();

  console.log("ATTEMPT DATA:", attemptData);
  console.log("ATTEMPT ERROR:", attemptError);

  if (attemptError || !attemptData) {
    console.error("FAILED TO LOAD ATTEMPT:", attemptError);
    return;
  }

  setAttempt(attemptData);

  // -----------------------------
  // 2. Load answers WITHOUT
  //    nested PostgREST joins
  // -----------------------------
  const { data: answerData, error: answerError } =
    await supabase
      .from("Answer")
      .select("*")
      .eq("attemptId", attemptId);

  console.log("ANSWER DATA:", answerData);
  console.log("ANSWER ERROR:", answerError);

  if (answerError) {
    console.error("FAILED TO LOAD ANSWERS:", answerError);
    setAnswers([]);
    return;
  }

  if (!answerData || answerData.length === 0) {
    console.warn("NO ANSWERS FOUND FOR ATTEMPT:", attemptId);
    setAnswers([]);
    setSections([]);
    return;
  }

  // -----------------------------
  // 3. Get question IDs
  // -----------------------------
  const questionIds = Array.from(
    new Set(
      answerData
        .map((a: any) => a.questionId)
        .filter(Boolean)
    )
  );

  console.log("QUESTION IDS:", questionIds);

  if (questionIds.length === 0) {
    console.warn("ANSWERS HAVE NO QUESTION IDS");
    setAnswers(answerData);
    setSections([]);
    return;
  }

  // -----------------------------
  // 4. Load questions
  // -----------------------------
  const { data: questionData, error: questionError } =
    await supabase
      .from("Question")
      .select("*")
      .in("id", questionIds);

  console.log("QUESTION DATA:", questionData);
  console.log("QUESTION ERROR:", questionError);

  if (questionError) {
    console.error(
      "FAILED TO LOAD QUESTIONS:",
      questionError
    );
    return;
  }

  // -----------------------------
  // 5. Load options
  // -----------------------------
  const { data: optionData, error: optionError } =
    await supabase
      .from("Option")
      .select("*")
      .in("questionId", questionIds);

  console.log("OPTION DATA:", optionData);
  console.log("OPTION ERROR:", optionError);

  if (optionError) {
    console.error(
      "FAILED TO LOAD OPTIONS:",
      optionError
    );
    return;
  }

  // -----------------------------
  // 6. Build question lookup
  // -----------------------------
  const questionMap = new Map(
    (questionData || []).map((q: any) => [
      q.id,
      {
        ...q,
        options: (optionData || []).filter(
          (o: any) => o.questionId === q.id
        ),
      },
    ])
  );

  // -----------------------------
  // 7. Attach question to answer
  // -----------------------------
  const enrichedAnswers = answerData.map(
    (a: any) => ({
      ...a,
      question:
        questionMap.get(a.questionId) || null,
    })
  );

  console.log(
    "ENRICHED ANSWERS:",
    enrichedAnswers
  );

  // -----------------------------
  // 8. Set answers
  // -----------------------------
  setAnswers(enrichedAnswers);

  // -----------------------------
  // 9. Build sections from questions
  // -----------------------------
  const uniqueSections = Array.from(
    new Map(
      enrichedAnswers
        .map((a: any) => a.question)
        .filter(
          (q: any) => q && q.sectionId
        )
        .map((q: any) => [
          q.sectionId,
          {
            id: q.sectionId,
            name:
              q.sectionName ||
              q.section ||
              `Section ${q.sectionId}`,
          },
        ])
    ).values()
  );

  console.log(
    "RESULT SECTIONS:",
    uniqueSections
  );

  setSections(uniqueSections);

  if (uniqueSections.length > 0) {
    setSelectedSection(
      uniqueSections[0].id
    );
  }
}

  if (!attempt) {
    return (
      <div className="p-8 text-white">
        Loading...
      </div>
    );
  }

  const sectionAnswers =
  sections.length > 0
    ? answers.filter(
        (a) =>
          a.question?.sectionId === selectedSection
      )
    : answers;

const filteredAnswers =
  sectionAnswers.filter((answer) => {
      if (filter === "all")
        return true;

      if (filter === "correct")
        return answer.isCorrect;

      if (filter === "wrong")
        return (
          !answer.isCorrect &&
          answer.optionId
        );

      if (filter === "skipped")
        return !answer.optionId;

      return true;
    });

  const answer =
    filteredAnswers[currentQuestion];

  const question =
    answer?.question;
    const correctOption = question?.options?.find(
  (o: any) => o.isCorrect
);

const firstOption = question?.options?.find(
  (o: any) => o.id === answer?.initialOptionId
);

const finalOption = question?.options?.find(
  (o: any) => o.id === answer?.optionId
);

const insights: {
  color: string;
  title: string;
  message: string;
}[] = [];

const timeSpent = answer?.timeSpent || 0;
const changes = answer?.answerChanges || 0;
const isCorrect = answer?.isCorrect;
const isVisited = answer?.visited;

const isSkipped =
  isVisited && !answer?.optionId;

const notVisited =
  !isVisited;


if (isSkipped) {
  insights.push({
    color: "gray",
    title: "⏭ Skipped Question",
    message:
      "You chose not to answer this question. Review the concept and decide whether similar questions should be attempted or skipped in future tests.",
  });
}

if (
  isVisited &&
  !isCorrect &&
  !isSkipped &&
  timeSpent <= 10
){
  insights.push({
    color: "red",
    title: "⚠ Rushed Decision",
    message:
      "You answered very quickly but selected the wrong option. Slow down slightly before submitting.",
  });
}

if (
  isVisited &&
  !isCorrect &&
  !isSkipped &&
  timeSpent > 10 &&
  timeSpent <= 40
) {
  insights.push({
    color: "orange",
    title: "📘 Concept Review",
    message:
      "You spent considerable time but still answered incorrectly. This concept needs more revision.",
  });
}

if (
  isVisited &&
  !isCorrect &&
  !isSkipped &&
  timeSpent > 40
) {
  insights.push({
    color: "orange",
    title: "📘 Concept Review",
    message:
      "You spent a long time but still answered incorrectly. This topic needs revision.",
  });
}

if (isCorrect && timeSpent <= 10) {
  insights.push({
    color: "blue",
    title: "⚡ Excellent Speed",
    message:
      "You answered correctly in very little time, showing strong confidence.",
  });
}

if (
  isCorrect &&
  timeSpent > 10 &&
  timeSpent <= 40 &&
  changes === 0
) {
  insights.push({
    color: "green",
    title: "✅ Steady Performance",
    message:
      "You answered correctly with a confident and consistent pace.",
  });
}

if (
  isCorrect &&
  timeSpent > 40
) {
  insights.push({
    color: "cyan",
    title: "🧠 Careful Thinking",
    message:
      "You took extra time but reached the correct answer. Good reasoning.",
  });
}

if (
  answer?.initialOptionId &&
  answer?.initialOptionId !== answer?.optionId &&
  answer?.isCorrect
) {
  insights.push({
    color: "green",
    title: "🎯 Good Recovery",
    message:
      "Reviewing your answer helped you correct your initial mistake.",
  });
}

if (
  answer?.initialOptionId === correctOption?.id &&
  answer?.optionId !== correctOption?.id
) {
  insights.push({
    color: "red",
    title: "⚠ Confidence Issue",
    message:
      "Your first answer was correct but you changed it before submitting.",
  });
}

if (changes >= 2) {
  insights.push({
    color: "yellow",
    title: "🔄 Overthinking",
    message:
      `You changed your answer ${changes} times. Too many changes often indicate uncertainty.`,
  });
}

if (!notVisited && insights.length === 0) {
  insights.push({
    color: "slate",
    title: "📈 Performance",
    message:
      "This question showed a balanced solving pattern without any major issues.",
  });
}

const topicName =
  question?.topic || "this topic";

let speedMessage = "";
let confidenceMessage = "";
let recommendation = "";
let motivation = "";

if (notVisited) {

  speedMessage =
    "This question was never opened during the test.";

  confidenceMessage =
    "No attempt or decision was made for this question.";

  recommendation =
    "Improve time management so every question gets at least a quick review.";

  motivation =
    "Reaching every question increases your chances of scoring more marks.";

}
else if (isSkipped) {

  if (timeSpent <= 5) {

    speedMessage =
      "You skipped this question almost immediately.";

    confidenceMessage =
      "You likely recognised that you weren't confident enough to attempt it.";

    recommendation =
      `Study ${topicName} before your next mock test.`;

    motivation =
      "Quickly identifying weak areas is better than random guessing.";

  } else if (timeSpent <= 60) {

    speedMessage =
      "You spent some time analysing the question before deciding to skip it.";

    confidenceMessage =
      "Avoiding a low-confidence guess is often a good exam strategy.";

    recommendation =
      `Strengthen ${topicName} so you can confidently attempt similar questions next time.`;

    motivation =
      "Strategic skipping protects your score. The next goal is turning skipped questions into correct answers.";

  } else {

    speedMessage =
      "You spent a long time on this question but still chose to skip it.";

    confidenceMessage =
      "The concept wasn't clear enough to make a confident decision.";

    recommendation =
      `Revise ${topicName} thoroughly and practise similar questions.`;

    motivation =
      "Don't spend too much time on one question. Move on earlier and return if time permits.";

  }

}

else if (
  answer?.initialOptionId === correctOption?.id &&
  answer?.optionId !== correctOption?.id
) {
  speedMessage =
    timeSpent > 30
      ? "You had enough time to solve this question."
      : "Your solving speed was acceptable.";

  confidenceMessage =
    `You changed from the correct answer to an incorrect one after ${changes} answer changes. This suggests second-guessing rather than lack of knowledge.`;

  recommendation =
    "Trust your first instinct unless you discover a clear mistake.";

  motivation =
    "You already knew the correct answer. Work on confidence instead of changing answers unnecessarily.";
}

else if (
  answer?.initialOptionId &&
  answer.initialOptionId !== answer.optionId &&
  isCorrect
) {
  speedMessage =
    "Your solving speed was good.";

  confidenceMessage =
    "Reviewing your answer helped you recover from an initial mistake.";

  recommendation =
    "Continue reviewing difficult questions before submitting.";

  motivation =
    "Good recovery. Careful checking improved your final score.";
}

else if (!isCorrect && timeSpent <= 10) {
  speedMessage =
    "You answered much faster than expected.";

  confidenceMessage =
    "The quick response suggests the question wasn't fully analysed.";

  recommendation =
    "Slow down and eliminate incorrect options before selecting an answer.";

  motivation =
    "Taking a few extra seconds can prevent avoidable mistakes.";
}

else if (!isCorrect && timeSpent > 10 && timeSpent <= 40) {
  speedMessage =
    "You spent a reasonable amount of time but still selected the wrong answer.";

  confidenceMessage =
    changes >= 2
      ? "Multiple answer changes indicate uncertainty."
      : "The concept was not applied correctly.";

  recommendation =
    `Revise ${topicName} and solve similar questions before the next test.`;

  motivation =
    "You were close. Better concept clarity will convert these into correct answers.";
}

else if (!isCorrect && timeSpent > 40) {
  speedMessage =
    "You invested a lot of time but couldn't reach the correct answer.";

  confidenceMessage =
    changes >= 2
      ? "Multiple answer changes indicate uncertainty."
      : "You remained consistent but selected the wrong concept.";

  recommendation =
    `Revise ${topicName} thoroughly and solve 15-20 similar questions.`;

  motivation =
    "This isn't a speed issue. Strengthening your understanding will improve your score.";
}

else if (isCorrect && timeSpent <= 10) {
  speedMessage =
    "Excellent speed with the correct answer.";

  confidenceMessage =
    changes === 0
      ? "You trusted your first choice."
      : "Despite reviewing your answer, you reached the correct conclusion.";

  recommendation =
    "Continue practising higher difficulty questions.";

  motivation =
    "Excellent work. You're developing both speed and accuracy.";
}

else if (isCorrect && timeSpent <= 40) {
  speedMessage =
    "You maintained a healthy solving pace.";

  confidenceMessage =
    "Your decision-making remained stable throughout the question.";

  recommendation =
    "Keep practising to improve speed without sacrificing accuracy.";

  motivation =
    "Consistent performance like this builds strong exam scores.";
}

else if (isCorrect && timeSpent > 40) {
  speedMessage =
    "You took extra time but solved the question correctly.";

  confidenceMessage =
    "Your patience helped you reach the correct answer.";

  recommendation =
    "Keep practising to improve solving speed.";

  motivation =
    "Accuracy comes first. Speed will improve with practice.";
}

  return (
    <div className="p-8 text-white">
      <div className="flex justify-between items-center mb-8">

  <h1 className="text-4xl font-bold">
    Test Review
  </h1>

  <button
  onClick={() =>
    router.replace(
      from === "institute"
        ? "/dashboard/institute"
        : "/student"
    )
  }
  className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold"
>
  Exit
</button>

</div>

      <div className="bg-gray-900 rounded-xl p-6 mb-8">
        <div className="grid grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-3xl text-green-400 font-bold">
              {attempt.correctAnswers}
            </p>
            <p>Correct</p>
          </div>

          <div>
            <p className="text-3xl text-red-400 font-bold">
              {attempt.wrongAnswers}
            </p>
            <p>Wrong</p>
          </div>

          <div>
            <p className="text-3xl text-yellow-400 font-bold">
              {attempt.skippedAnswers}
            </p>
            <p>Skipped</p>
          </div>

          <div>
            <p className="text-3xl text-blue-400 font-bold">
  {attempt.score}
</p>

<p>Marks</p>
          </div>
        </div>
      </div>

      <div className="flex gap-3 mb-6 flex-wrap">
  {sections.map((section: any) => (
    <button
      key={section.id}
      onClick={() => {
        setSelectedSection(section.id);
        setCurrentQuestion(0);
      }}
      className={`px-5 py-2 rounded-lg ${
        selectedSection === section.id
          ? "bg-blue-600"
          : "bg-gray-700"
      }`}
    >
      {section.name}
    </button>
  ))}
</div>

      <div className="flex gap-3 mb-8">
        <button
          onClick={() => {
            setFilter("all");
            setCurrentQuestion(0);
          }}
          className={`px-4 py-2 rounded ${
            filter === "all"
              ? "bg-blue-600"
              : "bg-gray-800"
          }`}
        >
          All
        </button>

        <button
          onClick={() => {
            setFilter("correct");
            setCurrentQuestion(0);
          }}
          className={`px-4 py-2 rounded ${
            filter === "correct"
              ? "bg-green-600"
              : "bg-gray-800"
          }`}
        >
          Correct
        </button>

        <button
          onClick={() => {
            setFilter("wrong");
            setCurrentQuestion(0);
          }}
          className={`px-4 py-2 rounded ${
            filter === "wrong"
              ? "bg-red-600"
              : "bg-gray-800"
          }`}
        >
          Wrong
        </button>

        <button
          onClick={() => {
            setFilter("skipped");
            setCurrentQuestion(0);
          }}
          className={`px-4 py-2 rounded ${
            filter === "skipped"
              ? "bg-yellow-600"
              : "bg-gray-800"
          }`}
        >
          Skipped
        </button>
      </div>

      <div className="flex gap-8">
        {/* Question Palette */}
        <div className="w-32">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 sticky top-6">
            <h3 className="font-bold mb-4 text-center">
              Questions
            </h3>

            <div className="grid grid-cols-3 gap-2">
              {filteredAnswers.map(
                (a, index) => (
                  <button
                    key={a.id}
                    onClick={() =>
                      setCurrentQuestion(
                        index
                      )
                    }
                    className={`h-10 rounded font-bold border ${
  index === currentQuestion
    ? "border-white"
    : "border-transparent"
} ${
  a.isCorrect
    ? "bg-green-600"
    : a.optionId
    ? "bg-red-600"
    : "bg-gray-600"
}`}
                  >
                    {index + 1}
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {/* Single Question */}
        <div className="flex-1">
          {answer && (
            <div className="bg-gray-900 rounded-xl border border-gray-700 p-6">
              <div className="flex justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  Question{" "}
                  {currentQuestion + 1}
                </h2>

                {answer.isCorrect ? (
                  <span className="bg-green-500/20 text-green-400 border border-green-500 px-3 py-1 rounded-full text-sm">
                    Correct
                  </span>
                ) : answer.optionId ? (
                  <span className="bg-red-500/20 text-red-400 border border-red-500 px-3 py-1 rounded-full text-sm">
                    Wrong
                  </span>
                ) : (
                  <span className="bg-gray-500/20 text-gray-300 border border-gray-500 px-3 py-1 rounded-full text-sm">
                    Skipped
                  </span>
                )}
              </div>

              <p className="text-xl mb-8">
                {question.text}
              </p>

              <div className="space-y-3">
                {question.options.map(
                  (option: any) => {
                    const selected =
                      option.id ===
                      answer.optionId;

                    return (
                      <div
                        key={option.id}
                        className={`p-4 rounded-lg border ${
                          option.isCorrect
                            ? "border-green-500 bg-green-500/10"
                            : selected
                            ? "border-red-500 bg-red-500/10"
                            : "border-gray-700"
                        }`}
                      >
                        {option.text}
                      </div>
                    );
                  }
                )}
              </div>

              {question.explanation && (
                <div className="mt-8 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <p className="text-blue-400 font-semibold mb-2">
                    Explanation
                  </p>

                  <p className="text-gray-300">
                    {question.explanation}
                  </p>
                </div>
              )}
              <div className="mt-8 bg-slate-900 border border-slate-700 rounded-xl p-6">

  <h3 className="text-xl font-bold mb-5">
    Performance Insights
  </h3>

  <div className="grid md:grid-cols-2 gap-6">

    <div>
      <p className="text-slate-400">
        ⏱ Time Spent
      </p>

      <p className="text-lg font-semibold">
        {answer.timeSpent} sec
      </p>
    </div>

    <div>
      <p className="text-slate-400">
        🔄 Answer Changes
      </p>

      <p className="text-lg font-semibold">
        {answer.answerChanges}
      </p>
    </div>

    <div>
      <p className="text-slate-400">
        🎯 First Answer
      </p>

      <p className="text-lg font-semibold">
        {firstOption?.text || "Not Answered"}
      </p>
    </div>

    <div>
      <p className="text-slate-400">
        ✅ Final Answer
      </p>

      <p className="text-lg font-semibold">
        {finalOption?.text || "Skipped"}
      </p>
    </div>

  </div>

 <div className="mt-6 space-y-4">

  {insights.map((insight, index) => (

    <div
      key={index}
      className={`rounded-xl border p-4 ${
        insight.color === "green"
          ? "border-green-500 bg-green-500/10"
          : insight.color === "red"
          ? "border-red-500 bg-red-500/10"
          : insight.color === "orange"
          ? "border-orange-500 bg-orange-500/10"
          : insight.color === "yellow"
          ? "border-yellow-500 bg-yellow-500/10"
          : insight.color === "blue"
          ? "border-blue-500 bg-blue-500/10"
          : insight.color === "cyan"
          ? "border-cyan-500 bg-cyan-500/10"
          : "border-slate-600 bg-slate-800"
      }`}
    >

      <h4 className="font-bold text-lg mb-2">
        {insight.title}
      </h4>

      <p className="text-slate-300 leading-7">
        {insight.message}
      </p>

    </div>

  ))}

</div>

</div>

  <div className="mt-8 bg-slate-800 border border-slate-700 rounded-xl p-6">

    <h3 className="text-xl font-bold mb-5">
      Smart Coaching
    </h3>

    <div className="space-y-5">

      <div>
        <p className="text-blue-400 font-semibold">
          ⚡ Speed Analysis
        </p>
        <p className="text-slate-300 mt-1">
          {speedMessage}
        </p>
      </div>

      <div>
        <p className="text-green-400 font-semibold">
          🎯 Confidence Analysis
        </p>
        <p className="text-slate-300 mt-1">
          {confidenceMessage}
        </p>
      </div>

      <div>
        <p className="text-yellow-400 font-semibold">
          📚 Recommended Next Step
        </p>
        <p className="text-slate-300 mt-1">
          {recommendation}
        </p>
      </div>

      <div>
        <p className="text-purple-400 font-semibold">
          💪 Coach's Note
        </p>
        <p className="text-slate-300 mt-1">
          {motivation}
        </p>
      </div>

    </div>

  </div>

              <div className="flex justify-between mt-10">
                <button
                  disabled={
                    currentQuestion ===
                    0
                  }
                  onClick={() =>
                    setCurrentQuestion(
                      (p) => p - 1
                    )
                  }
                  className="bg-gray-800 px-5 py-3 rounded disabled:opacity-50"
                >
                  Previous
                </button>

                <button
                  disabled={
                    currentQuestion ===
                    filteredAnswers.length -
                      1
                  }
                  onClick={() =>
                    setCurrentQuestion(
                      (p) => p + 1
                    )
                  }
                  className="bg-blue-600 px-5 py-3 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}