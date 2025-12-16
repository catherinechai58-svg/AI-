
import { GoogleGenAI } from "@google/genai";
import { AnalysisResult } from '../types';

// Initialize with environment variable directly
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeData = async (
  dataContent: string, 
  fileName: string, 
  language: string = "English",
  modelIdentity: string = "DeepAnalyze-8B"
): Promise<AnalysisResult> => {
  try {
    // Truncate content to fit context window if necessary, though Gemini 1.5/2.0 has huge context.
    // We'll keep a safe limit for the prompt construction.
    const truncatedContent = dataContent.slice(0, 50000);

    const prompt = `
      You are ${modelIdentity}, an intelligent data analysis engine. 
      Analyze the following data content (from file(s): ${fileName}).
      
      Perform a deep analysis to find trends, anomalies, and key takeaways.
      Suggest appropriate visualizations.
      
      Output the result strictly as a valid JSON object matching this structure:
      {
        "summary": "Executive summary of the provided data (Must be in ${language})",
        "keyInsights": ["List of 3-5 critical insights (Must be in ${language})"],
        "sentiment": "positive" | "neutral" | "negative",
        "charts": [
          {
            "title": "Title of the chart (Must be in ${language})",
            "type": "bar" | "line" | "pie" | "area",
            "data": [
              { "category": "A", "value": 100 } 
            ],
            "xAxisKey": "Key to use for X axis (e.g. 'category')",
            "seriesKeys": ["Keys to plot as series (e.g. 'value')"],
            "description": "Brief explanation (Must be in ${language})"
          }
        ],
        "rawAnalysis": "Detailed markdown analysis (Must be in ${language})"
      }
      
      CRITICAL RULES:
      1. The 'data' array in charts MUST contain objects with keys matching 'xAxisKey' and 'seriesKeys'.
      2. ALL TEXT OUTPUT (Summary, Insights, Analysis, Titles) MUST BE IN ${language}.
      3. Return ONLY valid JSON.
      
      Data Content:
      ${truncatedContent}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AnalysisResult;
    }
    throw new Error("No analysis generated");
  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
};

/**
 * Streams chat response using Gemini.
 */
export const streamChatResponse = async function* (
  history: { role: string; parts: { text: string }[] }[],
  message: string,
  contextData: string,
  language: string = "English",
  modelIdentity: string = "DeepAnalyze-8B"
) {
  const systemContext = `
    You are ${modelIdentity}, an intelligent data analysis assistant. 
    The user is asking questions about the following dataset they uploaded:
    ---
    ${contextData.slice(0, 20000)}
    ---
    Answer specific questions about this data. 
    Be concise and analytical.
    IMPORTANT: You must answer in ${language}.
  `;

  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: systemContext,
    },
    history: history,
  });

  const resultStream = await chat.sendMessageStream({ message });
  
  for await (const chunk of resultStream) {
    const text = chunk.text;
    if (text) {
      yield { text };
    }
  }
};
