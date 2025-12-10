import { GoogleGenAI } from "@google/genai";
import { ReportCard, Player } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateCoachFeedback = async (
  player: Player,
  statsInput: string,
  rawNotes: string
): Promise<string> => {
  try {
    const prompt = `
      You are an expert youth football (soccer) coach at a high-performance academy.
      Generate a constructive, encouraging, but honest report card summary for a player named ${player.name} (${player.ageGroup}, ${player.position}).
      
      Here are the player's recent stats (Technical, Tactical, Physical, Psychological):
      ${statsInput}

      Here are my raw notes as a coach:
      ${rawNotes}

      Please provide a structured response with:
      1. A detailed Final Summary paragraph (approx 80-100 words) focusing on the season progress, suitable for a formal report.
      2. 3 Key Strengths (be specific based on the stats).
      3. Improvement Areas: One "Key Improvement" (the main focus) and one "Build on" area (something they are doing okay at but can master).
      
      Format the output as JSON.
      Schema:
      {
        "summary": "string",
        "strengths": ["string", "string", "string"],
        "improvements": {
            "keyArea": "string",
            "buildOnArea": "string"
        }
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    return response.text || "{}";
  } catch (error) {
    console.error("Error generating feedback:", error);
    throw error;
  }
};

export const askCoachAI = async (
  question: string,
  reportCard: ReportCard,
  player: Player
): Promise<string> => {
  try {
    const context = `
      Player: ${player.name}, Age Group: ${player.ageGroup}, Position: ${player.position}.
      Season: ${reportCard.season}, Quarter: ${reportCard.quarter}.
      Stats: ${JSON.stringify(reportCard.stats)}.
      Attendance: ${JSON.stringify(reportCard.attendance)}.
      Strengths: ${reportCard.strengths.join(', ')}.
      Improvements: Key: ${reportCard.improvements.keyArea}, Build-on: ${reportCard.improvements.buildOnArea}.
      Coach Final Summary: ${reportCard.finalSummary}.
    `;

    const prompt = `
      Context: ${context}
      
      Parent's Question: "${question}"
      
      You are an AI Assistant for the JDA Football Academy. Answer the parent's question based on the player's specific report card data.
      Be helpful, suggest specific drills if asked, and maintain a professional, encouraging tone. Keep the answer concise (under 150 words).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "I couldn't generate a response at this time.";
  } catch (error) {
    console.error("Chat error:", error);
    return "Sorry, I'm having trouble connecting to the coach AI right now.";
  }
};