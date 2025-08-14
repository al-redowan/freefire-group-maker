
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from '../types';

if (!process.env.API_KEY) {
    // In a real app, you'd want to handle this more gracefully.
    // For this environment, we'll log an error.
    console.error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const analyzeTeamNames = async (teamNames: string[], instruction: string): Promise<AnalysisResult> => {
    const teamList = teamNames.join(', ');

    const schema = {
        type: Type.OBJECT,
        properties: {
            commonThemes: {
                type: Type.ARRAY,
                description: "Common themes or words found in the team names, like 'Esports', 'Team', 'Royal'.",
                items: { type: Type.STRING }
            },
            mostCreativeNames: {
                type: Type.ARRAY,
                description: "A list of 3-5 of the most unique or creative sounding team names from the list.",
                items: { type: Type.STRING }
            },
            analysisSummary: {
                type: Type.STRING,
                description: "A brief, 2-3 sentence summary of the overall impression of the team names (e.g., aggressive, professional, simple)."
            }
        },
        required: ["commonThemes", "mostCreativeNames", "analysisSummary"]
    };

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `${instruction}. The list of team names is: ${teamList}. Provide an analysis based on the required JSON schema.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });
        
        const jsonText = response.text.trim();
        const parsedResult = JSON.parse(jsonText) as AnalysisResult;
        return parsedResult;
    } catch (error) {
        console.error("Error analyzing team names:", error);
        throw new Error("Failed to get analysis from Gemini API.");
    }
};
