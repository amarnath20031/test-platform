"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useParams, useRouter } from "next/navigation";

export default function NewAttemptPage() {
  const params = useParams();
  const router = useRouter();

  const testIdFromUrl = params.id as string;
  const [showSubmitModal, setShowSubmitModal] =useState(false);
  const [submitted, setSubmitted] = useState(false);
  const submittingRef = useRef(false);

  const [tests, setTests] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
const [selectedSection, setSelectedSection] = useState("");

  const [studentId, setStudentId] = useState("");
  const [currentQuestion, setCurrentQuestion] =
  useState(0);

const [visitedQuestions, setVisitedQuestions] =
  useState<string[]>([]);
  const visitedQuestionsRef = useRef<string[]>([]);
  const [markedQuestions, setMarkedQuestions] =
  useState<string[]>([]);
  const [testId, setTestId] = useState("");

  const [timeLeft, setTimeLeft] = useState(0);
  const [initialTime, setInitialTime] = useState(0);

  const questionStartTime = useRef(Date.now());

const questionTimes = useRef<Record<string, number>>({});
const answerChanges = useRef<Record<string, number>>({});
const initialAnswers = useRef<Record<string, string>>({});

function saveCurrentQuestionTime() {
  const current = questions[currentQuestion];

  if (!current) return;

  const seconds = Math.floor(
    (Date.now() - questionStartTime.current) / 1000
  );

  questionTimes.current[current.id] =
    (questionTimes.current[current.id] || 0) + seconds;

  questionStartTime.current = Date.now();
}

  useEffect(() => {
  loadData();
}, []);

useEffect(() => {
  if (
    testIdFromUrl &&
    studentId &&
    tests.length > 0
  ) {
    loadQuestions(testIdFromUrl);
  }
}, [testIdFromUrl, studentId, tests]);

  useEffect(() => {
    if (timeLeft <= 0 || submitted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);

          if (!submitted) {
            submitTest();
          }

          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, submitted]);

  useEffect(() => {
  if (!studentId || !testId) return;

  const save = setTimeout(async () => {
    await supabase
      .from("ExamSession")
      .update({
        remainingTime: timeLeft,
      })
      .eq("studentId", studentId)
      .eq("testId", testId);
  }, 1000);

  return () => clearTimeout(save);
}, [timeLeft, studentId, testId]);

async function loadData() {
  // Logged in user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    router.push("/student/login");
    return;
  }

  // Get profile
  const { data: profile } = await supabase
    .from("profile")
    .select("studentId")
    .eq("id", user.id)
    .single();

  console.log("Auth User ID =", user.id);
  console.log("Profile Student ID =", profile?.studentId);

  if (!profile) {
    alert("Profile not found");
    return;
  }

  // THIS is the student id
  setStudentId(profile.studentId);

  // Load Tests
  const { data: testData } = await supabase
    .from("Test")
    .select("*")
    .order("title");

  if (testData) {
    setTests(testData);

    const selected = testData.find(
      (t) => t.id === testIdFromUrl
    );

    if (selected) {
      setTestId(selected.id);
    }
  }
}

async function loadQuestions(id: string) {
  setSubmitted(false);
  setTestId(id);

  const selectedTest = tests.find((t) => t.id === id);
  console.log("SELECTED TEST", selectedTest);
console.log(
  "Duration:",
  selectedTest?.durationHours,
  selectedTest?.durationMinutes,
  selectedTest?.durationSeconds
);

  if (!selectedTest) return;

const totalSeconds =
  (selectedTest.durationHours || 0) * 3600 +
  (selectedTest.durationMinutes || 0) * 60 +
  (selectedTest.durationSeconds || 0);

// Now use it
setTimeLeft(totalSeconds);
setInitialTime(totalSeconds);

  // Restore Exam Session
  const { data: session, error } = await supabase
  .from("ExamSession")
  .select("*")
  .eq("studentId", studentId)
  .eq("testId", id)
  .maybeSingle();

console.log("SESSION =", session);
console.log("SESSION ERROR =", error);

  if (session) {
  setCurrentQuestion(session.currentQuestion);

  setVisitedQuestions(session.visitedQuestions || []);
  visitedQuestionsRef.current =
    session.visitedQuestions || [];

  setMarkedQuestions(session.markedQuestions || []);

  setTimeLeft(session.remainingTime);

}else {
  const newSession = {
    id: crypto.randomUUID(),
    studentId,
    testId: id,
    currentQuestion: 0,
    visitedQuestions: [],
    markedQuestions: [],
    remainingTime: totalSeconds,
  };

  const { error } = await supabase
    .from("ExamSession")
    .insert(newSession);

  if (error) {
    console.error(error);
    return;
  }

  setCurrentQuestion(0);
  setVisitedQuestions([]);
  visitedQuestionsRef.current = [];
  setMarkedQuestions([]);
  setTimeLeft(totalSeconds);
}

  setInitialTime(totalSeconds);

  // Restore Draft Answers
  const { data: drafts } = await supabase
    .from("DraftAnswer")
    .select("*")
    .eq("studentId", studentId)
    .eq("testId", id);

  // Load Questions
  const { data: questionData, error: questionError } = await supabase
  .from("Question")
  .select(`
    *,
    section:Section!Question_sectionId_fkey(*),
    options:Option(*)
  `)
  .eq("testId", id)
  .order("createdAt", { ascending: true });

console.log(questionData);
console.log(questionError);

  if (questionData) {
    const uniqueSections = Array.from(
  new Map(
    questionData
      .filter((q) => q.section)
      .map((q) => [q.section.id, q.section])
  ).values()
);

setSections(uniqueSections);

if (session) {
  const currentQ = questionData[session.currentQuestion];

  if (currentQ?.sectionId) {
    setSelectedSection(currentQ.sectionId);
  } else if (uniqueSections.length > 0) {
    setSelectedSection(uniqueSections[0].id);
  }
} else if (uniqueSections.length > 0) {
  setSelectedSection(uniqueSections[0].id);
}
    setQuestions(
      questionData.map((q) => ({
        ...q,
        selectedOption:
          drafts?.find((d) => d.questionId === q.id)?.optionId || "",
      }))
    );

    const firstQuestionId =
  questionData[currentQuestion]?.id;

if (
  firstQuestionId &&
  !visitedQuestions.includes(firstQuestionId)
) {
  const updatedVisited = [
    ...visitedQuestions,
    firstQuestionId,
  ];

  setVisitedQuestions(updatedVisited);
  visitedQuestionsRef.current = updatedVisited;

  await supabase
    .from("ExamSession")
    .update({
      visitedQuestions: updatedVisited,
    })
    .eq("studentId", studentId)
    .eq("testId", id);
}

    if (!session && questionData.length > 0) {
      const firstVisited = [questionData[0].id];

      setVisitedQuestions(firstVisited);
      visitedQuestionsRef.current = firstVisited;

      await supabase
        .from("ExamSession")
        .update({
          visitedQuestions: firstVisited,
        })
        .eq("studentId", studentId)
        .eq("testId", id);
    }
  }
}

 async function submitTest() {
  if (submittingRef.current) return;

  submittingRef.current = true;

  if (!studentId || !testId) {
    submittingRef.current = false;
    alert("Please select student and test.");
    return;
  }

  setSubmitted(true);
  saveCurrentQuestionTime();

  const selectedTest = tests.find(
    (t) => t.id === testId
  );

  const positive =
    selectedTest?.positiveMarks ?? 1;

  const negative =
    selectedTest?.negativeMarks ?? 0;

  /*
   * ------------------------------------------------
   * FIND THE ASSIGNMENT
   * ------------------------------------------------
   */

  const { data: assignment, error: assignmentError } =
    await supabase
      .from("TestAssignment")
      .select("id, status, attemptId")
      .eq("studentId", studentId)
      .eq("testId", testId)
      .maybeSingle();

  if (assignmentError) {
    console.error(
      "Assignment lookup error:",
      assignmentError
    );

    setSubmitted(false);
    submittingRef.current = false;

    alert(assignmentError.message);
    return;
  }

  if (!assignment) {
    setSubmitted(false);
    submittingRef.current = false;

    alert("Test assignment not found.");
    return;
  }

  /*
   * ------------------------------------------------
   * DETERMINE WHETHER THIS IS PRACTICE
   * ------------------------------------------------
   *
   * assigned  -> official attempt
   * completed -> Practice Again
   */

  const isPractice =
    assignment.status === "completed";

  console.log("Assignment status =", assignment.status);
  console.log("Is practice =", isPractice);

  /*
   * ------------------------------------------------
   * CALCULATE SCORE
   * ------------------------------------------------
   */

  const attemptId = crypto.randomUUID();

  let score = 0;
  let correctAnswers = 0;
  let wrongAnswers = 0;
  let skippedAnswers = 0;

  questions.forEach((q) => {
    const correct = q.options.find(
      (o: any) => o.isCorrect
    );

    if (!q.selectedOption) {
      skippedAnswers++;
      return;
    }

    if (
      correct &&
      q.selectedOption === correct.id
    ) {
      correctAnswers++;
      score += positive;
    } else {
      wrongAnswers++;
      score -= negative;
    }
  });

  const percentage =
    questions.length > 0
      ? (correctAnswers / questions.length) * 100
      : 0;

  const timeTaken =
    initialTime - timeLeft;

  /*
   * ------------------------------------------------
   * CREATE ATTEMPT
   * ------------------------------------------------
   */

  const { data: attemptData, error: attemptError } = await supabase
  .from("Attempt")
  .insert([
    {
      id: attemptId,
      studentId,
      testId,
      score,
      correctAnswers,
      wrongAnswers,
      skippedAnswers,
      percentage,
      timeTaken,
      isPractice,
    },
  ])
  .select();

console.log("Inserted data:", attemptData);
console.log("Attempt error:", attemptError);

    console.log("Attempt insert error:", attemptError);
console.log("Attempt ID:", attemptId);

  if (attemptError) {
    console.error(
      "Attempt insert error:",
      attemptError
    );

    setSubmitted(false);
    submittingRef.current = false;

    alert(attemptError.message);
    return;
  }

  /*
   * ------------------------------------------------
   * SAVE QUESTION ANSWERS
   * ------------------------------------------------
   */

 /*
 * ------------------------------------------------
 * SAVE QUESTION ANSWERS (FAST BULK INSERT)
 * ------------------------------------------------
 */

const answersToInsert = questions.map((q) => {
  const correct = q.options.find(
    (o: any) => o.isCorrect
  );

  return {
    id: crypto.randomUUID(),
    attemptId,
    questionId: q.id,
    optionId: q.selectedOption || null,
    initialOptionId:
      initialAnswers.current[q.id] || null,
    answerChanges:
      answerChanges.current[q.id] || 0,
    visited:
      visitedQuestionsRef.current.includes(q.id),
    isCorrect: q.selectedOption
      ? q.selectedOption === correct?.id
      : false,
    timeSpent:
      questionTimes.current[q.id] || 0,
  };
});

const { error: answersError } = await supabase
  .from("Answer")
  .insert(answersToInsert);

if (answersError) {
  console.error(
    "Answer insert error:",
    answersError
  );
}

  /*
   * ------------------------------------------------
   * OFFICIAL ATTEMPT
   * ------------------------------------------------
   *
   * Only the official attempt should:
   *
   * 1. Complete the assignment
   * 2. Become the assignment's attemptId
   * 3. Affect leaderboard rank
   */

  if (!isPractice) {
    /*
     * Update assignment
     */

    const { error: assignmentUpdateError } =
      await supabase
        .from("TestAssignment")
        .update({
          status: "completed",
          attemptId,
        })
        .eq("id", assignment.id);

    if (assignmentUpdateError) {
      console.error(
        "Assignment update error:",
        assignmentUpdateError
      );
    }

    /*
     * ------------------------------------------------
     * OFFICIAL LEADERBOARD
     * ------------------------------------------------
     *
     * IMPORTANT:
     * Practice attempts are excluded.
     */

    const { data: attempts, error: rankError } =
      await supabase
        .from("Attempt")
        .select("id, score")
        .eq("testId", testId)
        .eq("isPractice", false)
        .order("score", {
          ascending: false,
        });

    if (rankError) {
      console.error(
        "Leaderboard error:",
        rankError
      );
    }

    if (attempts) {
      for (
        let i = 0;
        i < attempts.length;
        i++
      ) {
        await supabase
          .from("Attempt")
          .update({
            rank: i + 1,
          })
          .eq("id", attempts[i].id);
      }
    }
  }

  /*
   * ------------------------------------------------
   * CLEAN UP
   * ------------------------------------------------
   */

  await supabase
    .from("DraftAnswer")
    .delete()
    .eq("studentId", studentId)
    .eq("testId", testId);

  await supabase
    .from("ExamSession")
    .delete()
    .eq("studentId", studentId)
    .eq("testId", testId);

  /*
   * ------------------------------------------------
   * GO TO RESULT
   * ------------------------------------------------
   */

  console.log("================================");
  console.log("ATTEMPT CREATED");
  console.log("Attempt ID:", attemptId);
  console.log("Student:", studentId);
  console.log("Test:", testId);
  console.log("Practice:", isPractice);
  console.log("Score:", score);
  console.log("================================");

  router.replace(`/result/${attemptId}`);
}

const filteredQuestions = questions.filter(
  (q) => q.sectionId === selectedSection
);

const currentSectionQuestion =
  filteredQuestions.findIndex(
    (q) => q.id === questions[currentQuestion]?.id
  );
  const formattedTime =
    `${Math.floor(timeLeft / 3600)}`
      .padStart(2, "0") +
    ":" +
    `${Math.floor(
      (timeLeft % 3600) / 60
    )}`.padStart(2, "0") +
    ":" +
    `${timeLeft % 60}`.padStart(
      2,
      "0"
    );

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">
        Take Test
      </h1>

      {timeLeft > 0 && (
        <div
          className={`p-4 rounded-xl text-center shadow-lg mb-4 transition-all duration-300 ${
            timeLeft <= 60
              ? "bg-red-600 text-white animate-pulse"
              : "bg-gray-900 text-red-500 border border-gray-700"
          }`}
        >
          <p
            className={`text-sm ${
              timeLeft <= 60
                ? "text-red-100"
                : "text-gray-300"
            }`}
          >
            Time Left
          </p>

          <p className="text-4xl font-bold tracking-wider">
            {formattedTime}
          </p>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex gap-3 mb-6 flex-wrap">
  {sections.map((section: any) => (
    <button
      key={section.id}
      onClick={() => {

  saveCurrentQuestionTime();

        setSelectedSection(section.id);

        const firstQuestion = questions.find(
          (q) => q.sectionId === section.id
        );

        if (firstQuestion) {
          const index = questions.findIndex(
            (q) => q.id === firstQuestion.id
          );

          let updatedVisited = [...visitedQuestions];

if (!updatedVisited.includes(firstQuestion.id)) {
  updatedVisited.push(firstQuestion.id);
}

setVisitedQuestions(updatedVisited);
visitedQuestionsRef.current = updatedVisited;
          setCurrentQuestion(index);
          questionStartTime.current = Date.now();
        }
      }}
      className={`px-5 py-3 rounded-xl font-semibold ${
        selectedSection === section.id
          ? "bg-blue-600 text-white"
          : "bg-gray-700 text-white"
      }`}
    >
      {section.name}
    </button>
  ))}
</div>

        {questions.length > 0 && (
  <div className="flex gap-6">
    {/* LEFT SIDE */}
    <div className="flex-1 border p-6 rounded-xl">
      <p className="text-xl font-bold mb-6">
  Question {currentSectionQuestion + 1}
</p>

      <p className="text-lg mb-6">
        {
          questions[currentQuestion]
            ?.text
        }
      </p>

      {questions[
        currentQuestion
      ]?.options.map(
        (option: any) => (
          <label
            key={option.id}
            className="block mb-4"
          >
            <input
              type="radio"
              checked={
                questions[
                  currentQuestion
                ]
                  ?.selectedOption ===
                option.id
              }
             onChange={async () => {
               const questionId = questions[currentQuestion].id;

  const previousOption =
    questions[currentQuestion].selectedOption;

  // First selected option
  if (!initialAnswers.current[questionId]) {
    initialAnswers.current[questionId] = option.id;
  }

  // Count answer changes
  if (
    previousOption &&
    previousOption !== option.id
  ) {
    answerChanges.current[questionId] =
      (answerChanges.current[questionId] || 0) + 1;
  }
  // Update UI
  setQuestions((prev) =>
    prev.map((q, index) =>
      index === currentQuestion
        ? {
            ...q,
            selectedOption: option.id,
          }
        : q
    )
  );

  // Save draft
  await supabase
  .from("DraftAnswer")
 .upsert(
  {
    studentId,
    testId,
    questionId: questions[currentQuestion].id,
    optionId: option.id,
  },
  {
    onConflict: "studentId,testId,questionId",
  }
);
}}
            />

            <span className="ml-3">
              {option.text}
            </span>
          </label>
        )
      )}

      <div className="flex flex-wrap gap-3 mt-8">
  <button
    disabled={currentQuestion === 0}
    onClick={async () => {

  saveCurrentQuestionTime();

  const prev = currentQuestion - 1;

  let updatedVisited = [...visitedQuestions];

if (!updatedVisited.includes(questions[prev].id)) {
  updatedVisited.push(questions[prev].id);
}

setVisitedQuestions(updatedVisited);
visitedQuestionsRef.current = updatedVisited;
  setCurrentQuestion(prev);
  questionStartTime.current = Date.now();

  await supabase
  .from("ExamSession")
  .update({
    currentQuestion: prev,
    visitedQuestions: updatedVisited,
    markedQuestions,
    remainingTime: timeLeft,
  })
    .eq("studentId", studentId)
    .eq("testId", testId);
}}
    className="bg-gray-700 text-white px-5 py-3 rounded disabled:opacity-50"
  >
    Previous
  </button>

  <button
  onClick={async () => {
    const q = questions[currentQuestion];

    let updatedMarked;

    if (markedQuestions.includes(q.id)) {
      updatedMarked = markedQuestions.filter(
        (id) => id !== q.id
      );
    } else {
      updatedMarked = [...markedQuestions, q.id];
    }

    setMarkedQuestions(updatedMarked);

   await supabase
  .from("ExamSession")
  .update({
    markedQuestions: updatedMarked,
    currentQuestion,
    visitedQuestions: visitedQuestionsRef.current,
    remainingTime: timeLeft,
  })
  .eq("studentId", studentId)
  .eq("testId", testId);
}}

  className="bg-purple-600 text-white px-5 py-3 rounded"
>
  {markedQuestions.includes(
    questions[currentQuestion].id
  )
    ? "Unmark Review"
    : "Mark for Review"}
</button>

 <button
  onClick={async () => {
    setQuestions((prev) =>
      prev.map((q, index) =>
        index === currentQuestion
          ? {
              ...q,
              selectedOption: "",
            }
          : q
      )
    );

    await supabase
      .from("DraftAnswer")
      .delete()
      .eq("studentId", studentId)
      .eq("testId", testId)
      .eq("questionId", questions[currentQuestion].id);
  }}
  className="bg-red-600 text-white px-5 py-3 rounded"
>
  Clear Response
</button>

  <button
  disabled={currentQuestion === questions.length - 1}
  onClick={async () => {
  // Current question
  saveCurrentQuestionTime();

  const next = currentQuestion + 1;

  let updatedVisited = [...visitedQuestions];

  if (!updatedVisited.includes(questions[next].id)) {
    updatedVisited.push(questions[next].id);
  }

  setVisitedQuestions(updatedVisited);
  visitedQuestionsRef.current = updatedVisited;
  setCurrentQuestion(next);
questionStartTime.current = Date.now();

  await supabase
    .from("ExamSession")
    .update({
      currentQuestion: next,
      visitedQuestions: updatedVisited,
      markedQuestions,
      remainingTime: timeLeft,
    })
    .eq("studentId", studentId)
    .eq("testId", testId);
}}
  className="bg-blue-600 text-white px-5 py-3 rounded disabled:opacity-50"
>
  Save & Next
</button>
</div>
    </div>

    {/* RIGHT SIDE */}
    <div className="w-72">
      <div className="bg-gray-900 p-5 rounded-xl sticky top-5">
       <h2 className="font-bold mb-5">
  Exam Tools
</h2>

<div className="space-y-2 text-sm mb-5">
  <p>
    Answered: {
      questions.filter(
        (q) => q.selectedOption !== ""
      ).length
    }
  </p>

  <p>
    Not Answered: {
      visitedQuestions.filter(
        (id) =>
          !questions.find(
            (q) =>
              q.id === id &&
              q.selectedOption !== ""
          )
      ).length
    }
  </p>

  <p>
    Not Visited: {
      questions.length -
      visitedQuestions.length
    }
  </p>

  <p>
    Marked: {
      markedQuestions.length
    }
  </p>
</div>


        <div className="grid grid-cols-4 gap-3">
          {filteredQuestions.map(
            (q, index) => {
              const answered =
                q.selectedOption !== "";

              const visited =
                visitedQuestions.includes(
                  q.id
                );

              let color = "bg-gray-500";

const marked =
  markedQuestions.includes(q.id);

if (answered && marked) {
  color = "bg-amber-600";
} else if (marked) {
  color = "bg-purple-600";
} else if (answered) {
  color = "bg-green-500";
} else if (visited) {
  color = "bg-red-500";
}

              return (
                <button
                  key={q.id}
                onClick={async () => {
  saveCurrentQuestionTime();

  let updatedVisited = [...visitedQuestions];

  if (!updatedVisited.includes(q.id)) {
    updatedVisited.push(q.id);
    setVisitedQuestions(updatedVisited);
    visitedQuestionsRef.current = updatedVisited;
  }

  const actualIndex = questions.findIndex(
    (x) => x.id === q.id
  );

  setCurrentQuestion(actualIndex);

  await supabase
    .from("ExamSession")
    .update({
      currentQuestion: actualIndex,
      visitedQuestions: updatedVisited,
      markedQuestions,
      remainingTime: timeLeft,
    })
    .eq("studentId", studentId)
    .eq("testId", testId);

  questionStartTime.current = Date.now();
}}
                  className={`${color} h-12 w-12 rounded-lg text-white font-bold`}
                >
                  {currentSectionQuestion >= 0
  ? filteredQuestions.findIndex(
      (x) => x.id === q.id
    ) + 1
  : index + 1}
                </button>
              );
            }
          )}
        </div>

        <div className="mt-6 space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded" />
            Answered
          </div>

          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded" />
            Visited
          </div>

          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-500 rounded" />
            Not Visited
          </div>
        </div>
      </div>
    </div>
  </div>
)}

        {questions.length >
          0 && (
          <button
            disabled={submitted}
            onClick={() =>
  setShowSubmitModal(true)
}
            className={`px-5 py-3 rounded text-white ${
              submitted
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-black"
            }`}
          >
            {submitted
              ? "Submitted"
              : "Submit Test"}
          </button>
        )}

        {showSubmitModal && (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
    <div className="bg-gray-900 p-8 rounded-xl w-112.5 text-white">
      <h2 className="text-2xl font-bold mb-6">
        Submit Test?
      </h2>

      <div className="space-y-3 mb-6">
        <p>
          Answered: {
            questions.filter(
              (q) =>
                q.selectedOption !== ""
            ).length
          }
        </p>

        <p>
          Not Answered: {
            questions.length -
            questions.filter(
              (q) =>
                q.selectedOption !== ""
            ).length
          }
        </p>

        <p>
          Marked For Review: {
            markedQuestions.length
          }
        </p>
      </div>

      <div className="flex justify-end gap-4">
        <button
          onClick={() =>
            setShowSubmitModal(false)
          }
          className="bg-gray-700 px-5 py-3 rounded"
        >
          Cancel
        </button>

        <button
          onClick={() => {
            setShowSubmitModal(false);
            submitTest();
          }}
          className="bg-red-600 px-5 py-3 rounded"
        >
          Submit Test
        </button>
      </div>
    </div>
  </div>
)}
 </div>
    </div>
  );
}