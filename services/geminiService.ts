import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from '../types';

// Use a lazy-initialized singleton pattern for the AI client
// to prevent app crash on startup if API_KEY is not set.
let ai: GoogleGenAI | null = null;

const getAiClient = (): GoogleGenAI => {
    // The UI layer should prevent this from being called without an API key,
    // so this check acts as a safeguard.
    if (!process.env.API_KEY) {
        throw new Error("Attempted to initialize Gemini client without an API key.");
    }
    
    if (!ai) {
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
    return ai;
};

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
        const client = getAiClient();
        const response = await client.models.generateContent({
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
        if (error instanceof Error && error.message.includes('API key')) {
             throw new Error("Failed to get analysis from Gemini API. The API key might be invalid or missing.");
        }
        throw new Error("Failed to get analysis from Gemini API.");
    }
};
