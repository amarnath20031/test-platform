import { supabase } from "@/lib/supabase/client";

export async function getInstituteAnalytics(instituteId: string) {
  const [
    { data: students },
    { data: batches },
    { data: subjects },
    { data: tests },
  ] = await Promise.all([
    supabase
      .from("Student")
      .select("id,name,batchId")
      .eq("instituteId", instituteId),

    supabase
      .from("Batch")
      .select("id,name")
      .eq("instituteId", instituteId),

    supabase
      .from("Subject")
      .select("id,name")
      .eq("instituteId", instituteId),

    supabase
      .from("Test")
      .select("id,title,subjectId")
      .eq("instituteId", instituteId),
  ]);

  const studentIds =
    students?.map((s) => s.id) || [];

  const testIds =
    tests?.map((t) => t.id) || [];

  const [{ data: attempts }] =
    await Promise.all([
      supabase
        .from("Attempt")
        .select("*")
        .in("studentId", studentIds)
        .in("testId", testIds),
    ]);

  const totalAttempts =
    attempts?.length || 0;

  const averageScore =
    totalAttempts === 0
      ? 0
      : attempts!.reduce(
          (sum, a) => sum + Number(a.score || 0),
          0
        ) / totalAttempts;

  const averageAccuracy =
    totalAttempts === 0
      ? 0
      : attempts!.reduce(
          (sum, a) =>
            sum + Number(a.percentage || 0),
          0
        ) / totalAttempts;

  const averageTime =
    totalAttempts === 0
      ? 0
      : attempts!.reduce(
          (sum, a) =>
            sum + Number(a.timeTaken || 0),
          0
        ) / totalAttempts;

        const attemptIds =
  attempts?.map((a) => a.id) || [];

const [
  { data: answers },
  { data: questions },
  { data: options },
] = await Promise.all([
  supabase
    .from("Answer")
    .select("*")
    .in("attemptId", attemptIds),

  supabase
    .from("Question")
    .select("*")
    .in("testId", testIds),

  supabase
    .from("Option")
    .select("*"),
]);

const questionAnalytics = (questions || []).map((question) => {

  const qAnswers =
    (answers || []).filter(
      (a) => a.questionId === question.id
    );

  const attemptsCount =
    qAnswers.length;

  const correct =
    qAnswers.filter(
      (a) => a.isCorrect
    ).length;

  const skipped =
    qAnswers.filter(
      (a) => !a.optionId
    ).length;

  const avgTime =
    attemptsCount === 0
      ? 0
      : qAnswers.reduce(
          (sum, a) =>
            sum +
            Number(a.timeSpent || 0),
          0
        ) / attemptsCount;

  const accuracy =
    attemptsCount === 0
      ? 0
      : Math.round(
          (correct /
            attemptsCount) *
            100
        );

  const skippedPercent =
    attemptsCount === 0
      ? 0
      : Math.round(
          (skipped /
            attemptsCount) *
            100
        );

  const avgChanges =
    attemptsCount === 0
      ? 0
      : (
          qAnswers.reduce(
            (sum, a) =>
              sum +
              Number(
                a.answerChanges || 0
              ),
            0
          ) / attemptsCount
        ).toFixed(1);

  let difficulty = "Easy";

  if (accuracy < 40)
    difficulty = "Hard";
  else if (accuracy < 70)
    difficulty = "Moderate";

  return {

    id: question.id,

    text: question.text,

    accuracy,

    skipped: skippedPercent,

    averageTime: Math.round(
      avgTime
    ),

    answerChanges:
      Number(avgChanges),

    difficulty,

  };

});

 return {

  overview: {
    students: students?.length || 0,
    batches: batches?.length || 0,
    subjects: subjects?.length || 0,
    tests: tests?.length || 0,
    attempts: totalAttempts,
    averageScore,
    averageAccuracy,
    averageTime,
  },

  questionAnalytics,

  students: students || [],
  batches: batches || [],
  subjects: subjects || [],
  tests: tests || [],
  attempts: attempts || [],

};
}