import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const pdf = formData.get("file") as File;

    if (!pdf) {
      return NextResponse.json(
        {
          success: false,
          error: "No PDF uploaded.",
        },
        { status: 400 }
      );
    }

    const uploaded = await ai.files.upload({
  file: pdf,
  config: {
    mimeType: "application/pdf",
  },
});

const result = await ai.models.generateContent({
  model: "gemini-flash-lite-latest",

  contents: [
    {
      fileData: {
        fileUri: uploaded.uri!,
        mimeType: uploaded.mimeType!,
      },
    },
    {
     text: `
Read the PDF carefully.

Identify every section and every question.

For each question, determine the most appropriate topic based ONLY on the content of that question.

Return ONLY valid JSON. No markdown. No code fences. No explanation outside the JSON.

Use exactly this structure:

[
  {
    "section": "General Intelligence",
    "topic": "Analogy",
    "question": "...",
    "optionA": "...",
    "optionB": "...",
    "optionC": "...",
    "optionD": "...",
    "correctAnswer": "A",
    "explanation": ""
  }
]

Rules:
- "section" should contain the section/category from the PDF.
- "topic" should be a concise subject topic such as "Algebra", "Probability", "Trigonometry", "Electricity", "Chemical Reactions", etc.
- Do not leave "topic" empty when the question content clearly indicates a topic.
- Do not invent a topic unrelated to the question.
- Preserve the question and options accurately.
- Return every question found in the PDF.
- Return ONLY the JSON array.
`,
    },
  ],
});

return NextResponse.json({
  success: true,
  questions: result.text,
});

  } catch (err: any) {
  console.error("========== GEMINI ERROR ==========");
  console.error(err);

  if (err?.stack) {
    console.error(err.stack);
  }

  return NextResponse.json(
    {
      success: false,
      error: err?.message || "Unknown error",
    },
    { status: 500 }
  );
}}