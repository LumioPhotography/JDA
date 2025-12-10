import { GoogleGenAI } from "@google/genai";
import { ReportCard, Player } from "../types";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GOOGLE_API_KEY });

export const generateCoachFeedback = async (
  player: Player,
  statsInput: string,
  rawNotes: string
): Promise<string> => {
  try {
    const prompt = `
      You are an expert youth football (soccer) coach.
      Generate a constructive, encouraging, but honest report card summary for a player named ${player.name} (${player.ageGroup}, ${player.position}).
      
      Here are the player's recent stats (grouped by category):
      ${statsInput}

      Here are my raw notes as a coach:
      ${rawNotes}

      Please provide a structured response with:
      1. A short Summary paragraph (approx 50 words) focusing on the season progress.
      2. 3 Key Strengths (be specific based on the stats).
      3. 2 Areas for Improvement.
      
      Format the output as JSON so I can parse it easily.
      Schema:
      {
        "summary": "string",
        "strengths": ["string", "string", "string"],
        "improvements": ["string", "string"]
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
      Coach Notes: ${reportCard.coachNotes}.
      Strengths: ${reportCard.strengths.join(', ')}.
      Improvements: ${reportCard.improvements.join(', ')}.
    `;

    const prompt = `
      Context: ${context}
      
      Parent's Question: "${question}"
      
      You are an AI Assistant for the football club. Answer the parent's question based on the player's specific report card data.
      Be helpful, suggest specific drills if asked, and maintain a positive, encouraging tone. Keep the answer concise (under 150 words).
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
