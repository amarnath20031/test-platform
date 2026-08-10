import { supabase } from "@/lib/supabase/client";

export async function getOverview(instituteId: string) {
  const [
    { count: students },
    { count: batches },
    { count: subjects },
    { count: tests },
    { data: attempts },
  ] = await Promise.all([

    supabase
      .from("Student")
      .select("*", { count: "exact", head: true })
      .eq("instituteId", instituteId),

    supabase
      .from("Batch")
      .select("*", { count: "exact", head: true })
      .eq("instituteId", instituteId),

    supabase
      .from("Subject")
      .select("*", { count: "exact", head: true })
      .eq("instituteId", instituteId),

    supabase
      .from("Test")
      .select("*", { count: "exact", head: true })
      .eq("instituteId", instituteId),

    supabase
      .from("Attempt")
      .select(`
        score,
        percentage,
        timeTaken,
        student:Student!inner(instituteId)
      `)
      .eq("student.instituteId", instituteId)
      .eq("isPractice", false),

  ]);

  const totalAttempts =
    attempts?.length || 0;

  const averageScore =
    totalAttempts === 0
      ? 0
      : (attempts ?? []).reduce(
          (sum, a: any) =>
            sum + Number(a.score || 0),
          0
        ) / totalAttempts;

  const averageAccuracy =
    totalAttempts === 0
      ? 0
      : (attempts ?? []).reduce(
          (sum, a: any) =>
            sum + Number(a.percentage || 0),
          0
        ) / totalAttempts;

  const averageTime =
    totalAttempts === 0
      ? 0
      : (attempts ?? []).reduce(
          (sum, a: any) =>
            sum + Number(a.timeTaken || 0),
          0
        ) / totalAttempts;

  return {
    students: students || 0,
    batches: batches || 0,
    subjects: subjects || 0,
    tests: tests || 0,
    attempts: totalAttempts,
    averageScore,
    averageAccuracy,
    averageTime,
  };
}