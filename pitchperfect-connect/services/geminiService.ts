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
      You are an expert football coach at JDA Academy.
      Generate a report card summary for ${player.name} (${player.position}).
      
      Stats (Scale 1-5):
      ${statsInput}

      Coach Notes:
      ${rawNotes}

      Provide JSON:
      {
        "summary": "Short 1-2 sentence summary of progress.",
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
      config: { responseMimeType: "application/json" }
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
      Player: ${player.name}, Position: ${player.position}.
      Stats (1-5 scale): ${JSON.stringify(reportCard.stats)}.
      Summary: ${reportCard.finalSummary}.
    `;

    const prompt = `
      Context: ${context}
      Parent Question: "${question}"
      Answer as a helpful coach. Keep it under 100 words.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "I couldn't generate a response.";
  } catch (error) {
    return "Sorry, I'm having trouble connecting to the coach AI right now.";
  }
};

export const getDrillSuggestion = async (area: string): Promise<string> => {
  try {
    const prompt = `Suggest one specific, simple football training drill to improve: "${area}". Keep it under 30 words.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });
    return response.text || "Practice daily controls.";
  } catch {
      return "Practice regularly to improve this skill.";
  }
}