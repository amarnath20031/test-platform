import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

export async function POST(
  req: NextRequest
) {
  try {
    const formData = await req.formData();

    const file =
      formData.get("file") as File | null;

    const testId =
      formData.get("testId") as string | null;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: "Excel file is required.",
        },
        { status: 400 }
      );
    }

    if (!testId) {
      return NextResponse.json(
        {
          success: false,
          error: "Test ID is required.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // GET TEST
    // --------------------------------------------------

    const test =
      await prisma.test.findUnique({
        where: {
          id: testId,
        },
        select: {
          id: true,
          subjectId: true,
        },
      });

    if (!test) {
      return NextResponse.json(
        {
          success: false,
          error: "Test not found.",
        },
        { status: 404 }
      );
    }

    // --------------------------------------------------
    // READ EXCEL
    // --------------------------------------------------

    const buffer =
      Buffer.from(
        await file.arrayBuffer()
      );

    const workbook =
      XLSX.read(buffer, {
        type: "buffer",
      });

    const sheetName =
      workbook.SheetNames[0];

    if (!sheetName) {
      return NextResponse.json(
        {
          success: false,
          error: "Excel file has no worksheet.",
        },
        { status: 400 }
      );
    }

    const worksheet =
      workbook.Sheets[sheetName];

    const rows =
      XLSX.utils.sheet_to_json<any>(
        worksheet,
        {
          defval: "",
        }
      );

    if (!rows.length) {
      return NextResponse.json(
        {
          success: false,
          error: "Excel file contains no questions.",
        },
        { status: 400 }
      );
    }

    console.log(
      "EXCEL ROW COUNT:",
      rows.length
    );

    console.log(
      "FIRST EXCEL ROW:",
      rows[0]
    );

    // --------------------------------------------------
    // CREATE SECTIONS
    // --------------------------------------------------

    const sections =
      new Map<string, string>();

    for (const row of rows) {
      const sectionName =
        String(
          row.Section ||
            row.section ||
            "General"
        ).trim() || "General";

      if (!sections.has(sectionName)) {
        const section =
          await prisma.section.create({
            data: {
              name: sectionName,
              testId,
              order:
                sections.size + 1,
            },
          });

        sections.set(
          sectionName,
          section.id
        );
      }
    }

    // --------------------------------------------------
    // SAVE QUESTIONS
    // --------------------------------------------------

    let totalSaved = 0;
    let skippedRows = 0;

    for (const row of rows) {
      const question =
        String(
          row.Question ||
            row.question ||
            ""
        ).trim();

      const optionA =
        String(
          row["Option A"] ||
            row.optionA ||
            ""
        ).trim();

      const optionB =
        String(
          row["Option B"] ||
            row.optionB ||
            ""
        ).trim();

      const optionC =
        String(
          row["Option C"] ||
            row.optionC ||
            ""
        ).trim();

      const optionD =
        String(
          row["Option D"] ||
            row.optionD ||
            ""
        ).trim();

      const correctAnswer =
        String(
          row["Correct Answer"] ||
            row.correctAnswer ||
            ""
        )
          .trim()
          .toUpperCase();

      const topic =
        String(
          row.Topic ||
            row.topic ||
            ""
        ).trim();

      const explanation =
        String(
          row.Explanation ||
            row.explanation ||
            ""
        ).trim();

      const sectionName =
        String(
          row.Section ||
            row.section ||
            "General"
        ).trim() || "General";

      // Required fields
      if (
        !question ||
        !optionA ||
        !optionB ||
        !optionC ||
        !optionD
      ) {
        skippedRows++;
        continue;
      }

      if (
        !["A", "B", "C", "D"].includes(
          correctAnswer
        )
      ) {
        skippedRows++;
        continue;
      }

      const sectionId =
        sections.get(sectionName);

      if (!sectionId) {
        skippedRows++;
        continue;
      }

      const newQuestion =
        await prisma.question.create({
          data: {
            text: question,

            testId,

            sectionId,

            subjectId:
              test.subjectId || null,

            topic:
              topic || null,

            marks: 1,

            explanation,
          },
        });

      await prisma.option.createMany({
        data: [
          {
            text: optionA,
            questionId:
              newQuestion.id,
            isCorrect:
              correctAnswer === "A",
          },
          {
            text: optionB,
            questionId:
              newQuestion.id,
            isCorrect:
              correctAnswer === "B",
          },
          {
            text: optionC,
            questionId:
              newQuestion.id,
            isCorrect:
              correctAnswer === "C",
          },
          {
            text: optionD,
            questionId:
              newQuestion.id,
            isCorrect:
              correctAnswer === "D",
          },
        ],
      });

      totalSaved++;
    }

    console.log(
      "EXCEL QUESTIONS SAVED:",
      totalSaved
    );

    console.log(
      "EXCEL ROWS SKIPPED:",
      skippedRows
    );

    return NextResponse.json({
      success: true,
      totalSaved,
      skippedRows,
      subjectId: test.subjectId,
    });
  } catch (error) {
    console.error(
      "EXCEL IMPORT ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: String(error),
      },
      {
        status: 500,
      }
    );
  }
}