export function buildAnalytics(data: any) {
  const {
    attempts = [],
    answers = [],
    questions = [],
    students = [],
    batches = [],
    subjects = [],
    tests = [],
  } = data;

  const subjectMap: Record<string, any> = {};

  subjects.forEach((subject: any) => {
    subjectMap[subject.id] = subject;
  });

  const testMap: Record<string, any> = {};

tests.forEach((test: any) => {
  testMap[test.id] = test;
});

  const officialAttemptIds = new Set(
    attempts.map((attempt: any) => attempt.id)
  );

  const officialAnswers = answers.filter(
  (answer: any) =>
    answer.attemptId &&
    officialAttemptIds.has(answer.attemptId)
);

  const answersWithContext = officialAnswers.map(
    (answer: any) => {
      const question = Array.isArray(answer.question)
        ? answer.question[0]
        : answer.question;

      const attempt = attempts.find(
        (item: any) =>
          item.id === answer.attemptId
      );

      const student = Array.isArray(attempt?.student)
        ? attempt.student[0]
        : attempt?.student;

      const batch = Array.isArray(student?.batch)
        ? student.batch[0]
        : student?.batch;

    const test =
  testMap[question?.testId];

const resolvedSubjectId =
  question?.subjectId ||
  test?.subjectId ||
  null;

return {
  ...answer,

  question: question
    ? {
        ...question,
        subjectId: resolvedSubjectId,
      }
    : question,

  attempt,
  student,
  batch,
};
    }
  );

  return {
    overview: buildOverview(
      attempts,
      students,
      batches,
      subjects,
      questions,
      tests
    ),

    questionInsights:
      buildQuestionInsights(
        answersWithContext,
        subjectMap
      ),

    subjectAnalytics:
      buildSubjectAnalytics(
        answersWithContext,
        subjectMap
      ),

    topicAnalytics:
      buildTopicAnalytics(
        answersWithContext
      ),

    batchComparison:
      buildBatchComparison(
        attempts,
        answersWithContext,
        subjectMap
      ),

    studentsAtRisk:
      buildStudentRisk(
        attempts,
        answersWithContext
      ),

    facultyInsights:
      buildFacultyInsights(
        attempts,
        answersWithContext,
        subjectMap
      ),
  };
}


/* =========================================================
   OVERVIEW
========================================================= */

function buildOverview(
  attempts: any[],
  students: any[],
  batches: any[],
  subjects: any[],
  questions: any[],
  tests: any[]
) {
  const totalAttempts = attempts.length;

  const average = (
    field: string
  ) => {
    if (!totalAttempts) return 0;

    return (
      attempts.reduce(
        (sum: number, attempt: any) =>
          sum + Number(attempt[field] || 0),
        0
      ) / totalAttempts
    );
  };

  return {
    students: students.length,
    batches: batches.length,
    subjects: subjects.length,
    tests: tests.length,
    questions: questions.length,
    attempts: totalAttempts,

    averageScore: average("score"),

    averageAccuracy:
      average("percentage"),

    averageTime:
      average("timeTaken"),
  };
}


/* =========================================================
   QUESTION INTELLIGENCE
========================================================= */

function buildQuestionInsights(
  answers: any[],
  subjectMap: Record<string, any>
) {
  const map: Record<string, any> = {};

  answers.forEach((answer: any) => {
    const question = answer.question;

    if (!question || !answer.questionId) {
      return;
    }

    const questionId = answer.questionId;

    if (!map[questionId]) {
      map[questionId] = {
        id: questionId,

        text:
          question.text ||
          "Unknown Question",

        topic:
          question.topic ||
          "No Topic",

        subjectId:
          question.subjectId ||
          null,

        subjectName:
          subjectMap[question.subjectId]?.name ||
          "No Subject",

        total: 0,
        answered: 0,
        correct: 0,
        skipped: 0,

        totalTime: 0,
        timedAnswers: 0,

        totalChanges: 0,
        changedAnswers: 0,

        fastWrong: 0,
        slowWrong: 0,
      };
    }

    const item = map[questionId];

    item.total++;

    const skipped = !answer.optionId;

    if (skipped) {
      item.skipped++;
      return;
    }

    item.answered++;

    if (answer.isCorrect === true) {
      item.correct++;
    } else {
      const time = Number(
        answer.timeSpent || 0
      );

      // 0 means timing was not recorded.
      if (time > 0 && time <= 20) {
        item.fastWrong++;
      }

      if (time >= 60) {
        item.slowWrong++;
      }
    }

    const time = Number(
      answer.timeSpent || 0
    );

    if (time > 0) {
      item.totalTime += time;
      item.timedAnswers++;
    }

    const changes = Number(
      answer.answerChanges || 0
    );

    if (changes > 0) {
      item.totalChanges += changes;
      item.changedAnswers++;
    }
  });

  const analytics = Object.values(map)
    .map((question: any) => {
      const accuracy =
        question.answered > 0
          ? (question.correct /
              question.answered) *
            100
          : 0;

      const wrong =
        question.answered > 0
          ? ((question.answered -
              question.correct) /
              question.answered) *
            100
          : 0;

      const skipRate =
        question.total > 0
          ? (question.skipped /
              question.total) *
            100
          : 0;

      const avgTime =
        question.timedAnswers > 0
          ? question.totalTime /
            question.timedAnswers
          : 0;

      const avgChanges =
        question.changedAnswers > 0
          ? question.totalChanges /
            question.changedAnswers
          : 0;

      const fastWrongRate =
        question.answered > 0
          ? (question.fastWrong /
              question.answered) *
            100
          : 0;

      const slowWrongRate =
        question.answered > 0
          ? (question.slowWrong /
              question.answered) *
            100
          : 0;

      const difficultyScore =
        wrong * 0.5 +
        skipRate * 0.2 +
        (avgTime > 0
          ? Math.min(
              avgTime / 90,
              1
            ) * 20
          : 0) +
        fastWrongRate * 0.1 +
        slowWrongRate * 0.1;

      return {
        ...question,

        attempts: question.total,

        accuracy,
        wrong,
        skipRate,

        avgTime,
        avgChanges,

        hasTimingData:
          question.timedAnswers > 0,

        hasChangeData:
          question.changedAnswers > 0,

        fastWrongRate,
        slowWrongRate,

        difficultyScore,
      };
    });

  const timedQuestions =
    analytics.filter(
      (question: any) =>
        question.hasTimingData
    );

  const changedQuestions =
    analytics.filter(
      (question: any) =>
        question.hasChangeData
    );

  return {
    hardest: [...analytics]
      .sort(
        (a: any, b: any) =>
          b.difficultyScore -
          a.difficultyScore
      )
      .slice(0, 10),

    skipped: [...analytics]
      .sort(
        (a: any, b: any) =>
          b.skipRate -
          a.skipRate
      )
      .slice(0, 10),

    // ONLY questions with real timing data
    slowest: [...timedQuestions]
      .sort(
        (a: any, b: any) =>
          b.avgTime -
          a.avgTime
      )
      .slice(0, 10),

    fastWrong: [...analytics]
      .filter(
        (q: any) =>
          q.fastWrong > 0
      )
      .sort(
        (a: any, b: any) =>
          b.fastWrong -
          a.fastWrong
      )
      .slice(0, 10),

    slowWrong: [...analytics]
      .filter(
        (q: any) =>
          q.slowWrong > 0
      )
      .sort(
        (a: any, b: any) =>
          b.slowWrong -
          a.slowWrong
      )
      .slice(0, 10),

    // ONLY questions with actual change data
    answerChanges: [...changedQuestions]
      .sort(
        (a: any, b: any) =>
          b.avgChanges -
          a.avgChanges
      )
      .slice(0, 10),
  };
}
/* =========================================================
   SUBJECT ANALYTICS
========================================================= */

function buildSubjectAnalytics(
  answers: any[],
  subjectMap: Record<string, any>
) {
  const map: Record<string, any> = {};

  answers.forEach((answer: any) => {
    const subjectId = answer.question?.subjectId;

    if (!subjectId) return;

    const subject = subjectMap[subjectId];

    if (!subject) return;

    if (!map[subjectId]) {
      map[subjectId] = {
        id: subjectId,
        name: subject.name,

        total: 0,
        answered: 0,
        correct: 0,
        wrong: 0,
        skipped: 0,

        totalTime: 0,
        totalChanges: 0,
      };
    }

    const item = map[subjectId];

    // Every Answer row counts toward total
    item.total++;

    // No selected option = skipped
    const skipped = !answer.optionId;

    if (skipped) {
      item.skipped++;
      return;
    }

    // Only answered questions count toward accuracy
    item.answered++;

    if (answer.isCorrect === true) {
      item.correct++;
    } else {
      item.wrong++;
    }

    item.totalTime += Number(
      answer.timeSpent || 0
    );

    item.totalChanges += Number(
      answer.answerChanges || 0
    );
  });

  return Object.values(map)
    .map((subject: any) => {
      // Accuracy is based ONLY on answered questions
      const accuracy =
        subject.answered > 0
          ? (subject.correct / subject.answered) * 100
          : 0;

      // Wrong percentage is based ONLY on answered questions
      const wrong =
        subject.answered > 0
          ? (subject.wrong / subject.answered) * 100
          : 0;

      // Skip percentage is based on ALL answers
      const skipRate =
        subject.total > 0
          ? (subject.skipped / subject.total) * 100
          : 0;

      // Time only makes sense for answered questions
      const avgTime =
        subject.answered > 0
          ? subject.totalTime / subject.answered
          : 0;

      const avgChanges =
        subject.answered > 0
          ? subject.totalChanges / subject.answered
          : 0;

      /*
       * Revision score:
       *
       * - Wrong answers are the main factor
       * - Skipping is a secondary factor
       * - Slow answering adds some risk
       * - Changing answers adds a small factor
       */

      const revisionScore =
        wrong * 0.55 +
        Math.min(avgTime / 90, 1) * 20 +
        skipRate * 0.15 +
        Math.min(avgChanges / 2, 1) * 10;

      return {
        ...subject,
          attempts: subject.total,

        accuracy,
        wrong,
        avgTime,
        avgChanges,
        skipRate,

        revisionScore,

        recommendation:
          revisionScore >= 70
            ? "Immediate Revision"
            : revisionScore >= 50
            ? "Conduct Practice Test"
            : revisionScore >= 30
            ? "Needs Reinforcement"
            : "Healthy",
      };
    })
    .sort(
      (a: any, b: any) =>
        b.revisionScore - a.revisionScore
    );
}


/* =========================================================
   TOPIC ANALYTICS
========================================================= */

function buildTopicAnalytics(
  answers: any[]
) {
  const map: Record<string, any> = {};

  answers.forEach((answer: any) => {
    const topic =
      answer.question?.topic;

    if (!topic) return;

    if (!map[topic]) {
      map[topic] = {
        topic,

        total: 0,
        answered: 0,
        correct: 0,
        skipped: 0,

        totalTime: 0,
        timedAnswers: 0,

        totalChanges: 0,
        changedAnswers: 0,
      };
    }

    const item = map[topic];

    item.total++;

    const skipped = !answer.optionId;

    if (skipped) {
      item.skipped++;
      return;
    }

    item.answered++;

    if (answer.isCorrect === true) {
      item.correct++;
    }

    const time = Number(
      answer.timeSpent || 0
    );

    if (time > 0) {
      item.totalTime += time;
      item.timedAnswers++;
    }

    const changes = Number(
      answer.answerChanges || 0
    );

    if (changes > 0) {
      item.totalChanges += changes;
      item.changedAnswers++;
    }
  });

  return Object.values(map)
    .map((topic: any) => {
      const accuracy =
        topic.answered > 0
          ? (topic.correct /
              topic.answered) *
            100
          : 0;

      const wrong =
        topic.answered > 0
          ? ((topic.answered -
              topic.correct) /
              topic.answered) *
            100
          : 0;

      const avgTime =
        topic.timedAnswers > 0
          ? topic.totalTime /
            topic.timedAnswers
          : 0;

      const avgChanges =
        topic.changedAnswers > 0
          ? topic.totalChanges /
            topic.changedAnswers
          : 0;

      const skipRate =
        topic.total > 0
          ? (topic.skipped /
              topic.total) *
            100
          : 0;

     const revisionScore =
  wrong * 0.55 +
  (avgTime > 0
    ? Math.min(
        avgTime / 90,
        1
      ) * 20
    : 0) +
  skipRate * 0.30 +
  (avgChanges > 0
    ? Math.min(
        avgChanges / 2,
        1
      ) * 10
    : 0);

      return {
        ...topic,

        attempts: topic.total,
        answered: topic.answered,

        accuracy,
        wrong,
        avgTime,
        avgChanges,
        skipRate,

        revisionScore,

        recommendation:
          revisionScore >= 70
            ? "Immediate Revision"
            : revisionScore >= 50
            ? "Conduct Practice Test"
            : revisionScore >= 30
            ? "Needs Reinforcement"
            : "Healthy",
      };
    })
    .sort(
      (a: any, b: any) =>
        b.revisionScore -
        a.revisionScore
    );
}


/* =========================================================
   BATCH COMPARISON
========================================================= */

function buildBatchComparison(
  attempts: any[],
  answers: any[],
  subjectMap: Record<string, any>
) {
  const map: Record<string, any> = {};

  attempts.forEach((attempt: any) => {
    const student =
      Array.isArray(attempt.student)
        ? attempt.student[0]
        : attempt.student;

    const batch =
      Array.isArray(student?.batch)
        ? student.batch[0]
        : student?.batch;

    if (!batch?.id) return;

    if (!map[batch.id]) {
      map[batch.id] = {
        id: batch.id,
        name: batch.name,

        attempts: 0,
        totalScore: 0,
        totalAccuracy: 0,
        totalTime: 0,

        answers: [],
      };
    }

    const item =
      map[batch.id];

    item.attempts++;

    item.totalScore +=
      Number(attempt.score || 0);

    item.totalAccuracy +=
      Number(
        attempt.percentage || 0
      );

    item.totalTime +=
      Number(
        attempt.timeTaken || 0
      );

    item.answers.push(
      ...answers.filter(
        (answer: any) =>
          answer.attemptId ===
          attempt.id
      )
    );
  });

  return Object.values(map)
    .map((batch: any) => {
      const accuracy =
        batch.attempts > 0
          ? batch.totalAccuracy /
            batch.attempts
          : 0;

      const avgScore =
        batch.attempts > 0
          ? batch.totalScore /
            batch.attempts
          : 0;

      const avgTime =
        batch.attempts > 0
          ? batch.totalTime /
            batch.attempts
          : 0;

      const subjectStats: Record<
  string,
  any
> = {};

batch.answers.forEach(
  (answer: any) => {
    const subjectId =
      answer.question?.subjectId;

    if (!subjectId) return;

    // Skipped answers do not count
    // toward accuracy.
    if (!answer.optionId) {
      return;
    }

    if (!subjectStats[subjectId]) {
      subjectStats[subjectId] = {
        total: 0,
        correct: 0,
      };
    }

    subjectStats[subjectId].total++;

    if (answer.isCorrect === true) {
      subjectStats[subjectId].correct++;
    }
  }
);

      let weakestSubject =
        "Not enough data";

      let weakestAccuracy =
        101;

      Object.entries(
        subjectStats
      ).forEach(
        ([subjectId, value]: any) => {
          if (value.total < 5) {
            return;
          }

          const subjectAccuracy =
            (value.correct /
              value.total) *
            100;

          if (
            subjectAccuracy <
            weakestAccuracy
          ) {
            weakestAccuracy =
              subjectAccuracy;

            weakestSubject =
              subjectMap[
                subjectId
              ]?.name ||
              "Unknown";
          }
        }
      );

      const riskScore =
        (100 - accuracy) * 0.6 +
        Math.min(
          avgTime / 120,
          1
        ) *
          25 +
        (avgScore < 40
          ? 15
          : avgScore < 60
          ? 8
          : 0);

      return {
        ...batch,

        accuracy,
        avgScore,
        avgTime,

        riskScore,

        weakestSubject,

        weakestSubjectAccuracy:
          weakestAccuracy === 101
            ? 0
            : weakestAccuracy,

        recommendation:
          riskScore >= 70
            ? "Immediate Faculty Attention"
            : riskScore >= 50
            ? "Conduct Extra Mock Test"
            : riskScore >= 35
            ? "Monitor Progress"
            : "Healthy Batch",
      };
    })
    .sort(
      (a: any, b: any) =>
        b.riskScore -
        a.riskScore
    );
}


/* =========================================================
   STUDENT RISK
========================================================= */

function buildStudentRisk(
  attempts: any[],
  answers: any[]
) {
  const map: Record<string, any> = {};

  attempts.forEach((attempt: any) => {
    const student =
      Array.isArray(attempt.student)
        ? attempt.student[0]
        : attempt.student;

    if (!student?.id) return;

    if (!map[student.id]) {
      map[student.id] = {
        id: student.id,
        name: student.name,

        batch:
          Array.isArray(student.batch)
            ? student.batch[0]?.name
            : student.batch?.name ||
              "-",

        attempts: 0,
        totalScore: 0,
        totalAccuracy: 0,

        answers: [],
      };
    }

    const item =
      map[student.id];

    item.attempts++;

    item.totalScore +=
      Number(attempt.score || 0);

    item.totalAccuracy +=
      Number(
        attempt.percentage || 0
      );

    item.answers.push(
      ...answers.filter(
        (answer: any) =>
          answer.attemptId ===
          attempt.id
      )
    );
  });

  return Object.values(map)
    .map((student: any) => {
      const accuracy =
        student.attempts > 0
          ? student.totalAccuracy /
            student.attempts
          : 0;

      const avgScore =
        student.attempts > 0
          ? student.totalScore /
            student.attempts
          : 0;

      const topicStats: Record<
        string,
        any
      > = {};

     student.answers.forEach(
  (answer: any) => {
    const topic =
      answer.question?.topic;

    if (!topic) return;

    // Skipped answers do not count
    // toward topic accuracy.
    if (!answer.optionId) {
      return;
    }

    if (!topicStats[topic]) {
      topicStats[topic] = {
        total: 0,
        correct: 0,
      };
    }

    topicStats[topic].total++;

    if (answer.isCorrect === true) {
      topicStats[topic].correct++;
    }
  }
);

      let weakestTopic =
        "Not enough data";

      let weakestTopicAccuracy =
        101;

      Object.entries(
        topicStats
      ).forEach(
        ([topic, value]: any) => {
          if (value.total < 2) {
            return;
          }

          const topicAccuracy =
            (value.correct /
              value.total) *
            100;

          if (
            topicAccuracy <
            weakestTopicAccuracy
          ) {
            weakestTopicAccuracy =
              topicAccuracy;

            weakestTopic = topic;
          }
        }
      );

      const riskScore =
        (100 - accuracy) * 0.65 +
        (avgScore < 40 ? 20 : 0) +
        (avgScore < 60 ? 10 : 0);

      return {
        ...student,

        accuracy,
        avgScore,

        weakestTopic,

        weakestTopicAccuracy:
          weakestTopicAccuracy === 101
            ? 0
            : weakestTopicAccuracy,

        riskScore,

        status:
          riskScore >= 60
            ? "At Risk"
            : riskScore >= 40
            ? "Needs Attention"
            : "On Track",
      };
    })
    .filter(
      (student: any) =>
        student.riskScore >= 40
    )
    .sort(
      (a: any, b: any) =>
        b.riskScore -
        a.riskScore
    )
    .slice(0, 10);
}


/* =========================================================
   FACULTY INSIGHTS
========================================================= */

function buildFacultyInsights(
  attempts: any[],
  answers: any[],
  subjectMap: Record<string, any>
) {
  const messages: string[] = [];

  if (!attempts.length) {
    return [
      "No official test attempts are available yet.",
    ];
  }

  const averageAccuracy =
    attempts.reduce(
      (sum: number, attempt: any) =>
        sum +
        Number(
          attempt.percentage || 0
        ),
      0
    ) / attempts.length;

  messages.push(
    `Institute accuracy is ${averageAccuracy.toFixed(
      1
    )}%.`
  );

  const subjects =
    buildSubjectAnalytics(
      answers,
      subjectMap
    );

  if (subjects.length > 0) {
    const weakestSubject =
      subjects[0];

    messages.push(
      `${weakestSubject.name} is the weakest subject at ${weakestSubject.accuracy.toFixed(
        1
      )}% accuracy. ${weakestSubject.recommendation} is recommended.`
    );
  }

  const topics =
    buildTopicAnalytics(
      answers
    );

  if (topics.length > 0) {
    const weakestTopic =
      topics[0];

    messages.push(
      `${weakestTopic.topic} is the weakest topic at ${weakestTopic.accuracy.toFixed(
        1
      )}% accuracy.`
    );
  }

  const questionInsights =
    buildQuestionInsights(
      answers,
      subjectMap
    );

  if (
    questionInsights.fastWrong
      .length > 0
  ) {
    const question =
      questionInsights
        .fastWrong[0];

    messages.push(
      `"${question.text}" has ${question.fastWrong} fast-wrong responses. Faculty should reinforce the concept and discourage rushed answering.`
    );
  }

  const atRisk =
    buildStudentRisk(
      attempts,
      answers
    );

  if (atRisk.length > 0) {
    messages.push(
      `${atRisk.length} students currently require attention based on performance risk.`
    );
  }

  return messages;
}