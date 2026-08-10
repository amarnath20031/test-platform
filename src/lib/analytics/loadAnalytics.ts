import { supabase } from "@/lib/supabase/client";

async function loadAllAnswers() {
  const pageSize = 1000;
  let from = 0;
  const allAnswers: any[] = [];

  while (true) {
    const { data, error } = await supabase
      .from("Answer")
      .select(`
        *,
        question:Question(
          id,
          text,
          topic,
          subjectId,
          testId
        )
      `)
      .range(from, from + pageSize - 1);

    if (error) {
      console.error("Answer loading error:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      break;
    }

    allAnswers.push(...data);

    if (data.length < pageSize) {
      break;
    }

    from += pageSize;
  }

  return allAnswers;
}

export async function loadAnalytics() {
  const [
    { data: attempts, error: attemptsError },
    answers,
    { data: questions, error: questionsError },
    { data: students, error: studentsError },
    { data: batches, error: batchesError },
    { data: subjects, error: subjectsError },
    { data: tests, error: testsError },
  ] = await Promise.all([
    supabase
      .from("Attempt")
      .select(`
        *,
        student:Student(
          *,
          batch:Batch(*)
        ),
        test:Test(*)
      `)
      .eq("isPractice", false),

    loadAllAnswers(),

    supabase
      .from("Question")
      .select("*"),

    supabase
      .from("Student")
      .select("*"),

    supabase
      .from("Batch")
      .select("*"),

    supabase
      .from("Subject")
      .select("*"),

    supabase
      .from("Test")
      .select("*"),
  ]);

  const error =
    attemptsError ||
    questionsError ||
    studentsError ||
    batchesError ||
    subjectsError ||
    testsError;

  if (error) {
    console.error(
      "Analytics loading error:",
      error
    );
  }

  console.log(
    "========== ANALYTICS DEBUG =========="
  );

  console.log(
    "ATTEMPTS:",
    attempts?.length
  );

  console.log(
    "ANSWERS:",
    answers?.length
  );

  console.log(
    "QUESTIONS:",
    questions?.length
  );

  console.log(
    "ANSWERS WITH QUESTIONS:",
    answers?.filter(
      (a: any) => a.question
    ).length
  );

  console.log(
    "ANSWERS WITH TOPICS:",
    answers?.filter(
      (a: any) =>
        a.question?.topic &&
        a.question.topic.trim()
    ).length
  );

  return {
    attempts: attempts || [],
    answers: answers || [],
    questions: questions || [],
    students: students || [],
    batches: batches || [],
    subjects: subjects || [],
    tests: tests || [],
  };
}