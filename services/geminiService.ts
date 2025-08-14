
import { GoogleGenAI } from "@google/genai";
import { Team } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you'd want to handle this more gracefully.
  // For this environment, we assume the key is set.
  console.warn("API key for Gemini is not set in environment variables. Analysis feature will not work.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const analyzeTeamNames = async (
  teams: Team[],
  instruction: string
): Promise<string> => {
  if (!API_KEY) {
    return Promise.resolve("Error: Gemini API key is not configured. Please set the API_KEY environment variable.");
  }

  const model = "gemini-2.5-flash";
  const teamNameList = teams.map(team => `- ${team.name}`).join('\n');

  const prompt = `
${instruction}

Here is the list of team names to analyze:
${teamNameList}

Please provide the analysis.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        return `An error occurred while analyzing the names: ${error.message}`;
    }
    return "An unknown error occurred while analyzing the names.";
  }
};
