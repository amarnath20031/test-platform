import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function GET() {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "Say hello.",
  });

  return NextResponse.json({
    success: true,
    text: response.text,
  });
}