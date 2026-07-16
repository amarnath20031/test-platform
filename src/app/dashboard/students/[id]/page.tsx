"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useParams } from "next/navigation";

export default function StudentHistoryPage() {
  const params = useParams();
  const studentId = params.id as string;

  const [student, setStudent] =
    useState<any>(null);

  const [attempts, setAttempts] =
    useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const { data: studentData } =
      await supabase
        .from("Student")
        .select("*")
        .eq("id", studentId)
        .single();

    if (studentData) {
      setStudent(studentData);
    }

    const { data: attemptData } =
      await supabase
        .from("Attempt")
        .select(`
          *,
          test:Test(
            title,
            subject:Subject(name)
          )
        `)
        .eq("studentId", studentId)
        .order("createdAt", {
          ascending: true,
        });

    if (attemptData) {
      setAttempts(attemptData);
    }
  }

  const chartData = attempts.map(
    (attempt, index) => ({
      test: `Attempt ${index + 1}`,
      date: new Date(
        attempt.createdAt
      ).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }),
      percentage: Number(
        (attempt.percentage || 0).toFixed(2)
      ),
      score: attempt.score || 0,
    })
  );

  const subjectData = Object.values(
    attempts.reduce(
      (acc: any, attempt: any) => {
        const subject =
          attempt.test?.subject?.name ||
          "Unknown";

        if (!acc[subject]) {
          acc[subject] = {
            subject,
            total: 0,
            count: 0,
          };
        }

        acc[subject].total +=
          attempt.percentage || 0;

        acc[subject].count += 1;

        return acc;
      },
      {}
    )
  ).map((item: any) => ({
    subject: item.subject,
    percentage: Number(
      (item.total / item.count).toFixed(
        2
      )
    ),
  }));

  return (
    <div className="p-8 text-white">
      <h1 className="text-4xl font-bold mb-2">
        {student?.name}
      </h1>

      {/* Performance Trend */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 mb-8">
        <h2 className="text-2xl font-bold mb-6">
          Performance Trend
        </h2>

        <div
          style={{
            width: "100%",
            height: 250,
          }}
        >
          <ResponsiveContainer>
            <LineChart data={chartData}>
              <CartesianGrid stroke="#374151" />

              <XAxis dataKey="test" />

              <YAxis
                domain={[0, 100]}
              />

              <Tooltip
                labelFormatter={(
                  _,
                  payload
                ) =>
                  payload?.[0]?.payload
                    ?.date
                }
                formatter={(
                  value
                ) => [
                  `${value}%`,
                  "Percentage",
                ]}
                contentStyle={{
                  backgroundColor:
                    "#0f172a",
                  border:
                    "1px solid #1e293b",
                  borderRadius:
                    "12px",
                  color: "#fff",
                }}
                labelStyle={{
                  color: "#94a3b8",
                }}
              />

              <Line
                type="monotone"
                dataKey="percentage"
                stroke="#10b981"
                strokeWidth={4}
                dot={(props) => {
                  const {
                    cx,
                    cy,
                    payload,
                  } = props;

                  let fill =
                    "#ef4444";

                  if (
                    payload.percentage >=
                    80
                  )
                    fill =
                      "#10b981";
                  else if (
                    payload.percentage >=
                    40
                  )
                    fill =
                      "#facc15";

                  return (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={6}
                      fill={fill}
                      stroke="#ffffff"
                      strokeWidth={2}
                    />
                  );
                }}
                activeDot={{
                  r: 8,
                }}
                animationDuration={
                  1200
                }
                animationEasing="ease-out"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Subject Performance */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 mb-8">
        <h2 className="text-2xl font-bold mb-6">
          Subject Performance
        </h2>

        <div
          style={{
            width: "100%",
            height: 300,
          }}
        >
          <ResponsiveContainer>
            <BarChart
              data={subjectData}
            >
              <CartesianGrid stroke="#374151" />

              <XAxis dataKey="subject" />

              <YAxis
                domain={[0, 100]}
              />

              <Tooltip
  cursor={{ fill: "transparent" }}
  formatter={(value) => [
    `${value}%`,
    "Average Score",
  ]}
  contentStyle={{
    backgroundColor: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "12px",
    color: "#fff",
  }}
  labelStyle={{
    color: "#94a3b8",
  }}
/>

              <Bar
                dataKey="percentage"
                fill="#10b981"
                radius={[
                  8, 8, 0, 0,
                ]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <p className="text-gray-400 mb-8">
        Test History
      </p>

      <div className="space-y-4">
        {attempts.map((attempt) => (
          <div
            key={attempt.id}
            className="bg-gray-900 border border-gray-700 rounded-xl p-6"
          >
            <div>
              <div>
                <h2 className="font-bold text-xl">
                  {
                    attempt.test
                      ?.title
                  }
                </h2>

                <p className="text-gray-400">
                  {new Date(
                    attempt.createdAt
                  ).toLocaleDateString(
                    "en-IN",
                    {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    }
                  )}
                </p>

                <p className="text-gray-500 text-sm">
                  {new Date(
                    attempt.createdAt
                  ).toLocaleTimeString(
                    "en-IN",
                    {
                      hour:
                        "2-digit",
                      minute:
                        "2-digit",
                    }
                  )}
                </p>
              </div>

             
            </div>

            <div className="grid grid-cols-4 gap-4 mt-6 text-center">
              <div>
                <p className="text-green-400 text-xl font-bold">
                  {
                    attempt.correctAnswers
                  }
                </p>

                <p className="text-gray-400">
                  Correct
                </p>
              </div>

              <div>
                <p className="text-red-400 text-xl font-bold">
                  {
                    attempt.wrongAnswers
                  }
                </p>

                <p className="text-gray-400">
                  Wrong
                </p>
              </div>

              <div>
                <p className="text-yellow-400 text-xl font-bold">
                  {
                    attempt.skippedAnswers
                  }
                </p>

                <p className="text-gray-400">
                  Skipped
                </p>
              </div>

              <div>
                <p className="text-blue-400 text-xl font-bold">
                  {Math.floor(
                    (attempt.timeTaken ||
                      0) / 60
                  )}
                  m{" "}
                  {(attempt.timeTaken ||
                    0) %
                    60}
                  s
                </p>

                <p className="text-gray-400">
                  Time
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}