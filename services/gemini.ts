import { GoogleGenAI } from "@google/genai";
import { AnalysisResult } from '../types';

// Initialize with environment variable directly as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- SECURITY GUARD IMPLEMENTATION ---
/**
 * Simulates a call to Qwen3Guard-Gen-0.6B for content moderation.
 * In a real-world scenario, this would make an API call to the guard model endpoint.
 */
const checkSafetyWithQwenGuard = async (content: string, stage: 'input' | 'output'): Promise<void> => {
  // Log the security audit
  console.log(`🛡️ [Qwen3Guard-Gen-0.6B] Auditing ${stage} (Length: ${content.length})...`);
  
  // Simulate network latency for the external model call
  await new Promise(resolve => setTimeout(resolve, 800));

  // Mock detection logic: 
  // Trigger this by including "INJECT_MALWARE" in the file content.
  const isSuspicious = content.includes("INJECT_MALWARE") || content.includes("FORCE_UNSAFE");
  
  if (isSuspicious) {
    console.error(`🛡️ [Qwen3Guard-Gen-0.6B] Blocked ${stage}: Safety violation detected.`);
    throw new Error(`[Security Alert] Qwen3Guard-Gen-0.6B blocked ${stage}: Potentially unsafe content detected.`);
  }

  console.log(`🛡️ [Qwen3Guard-Gen-0.6B] ${stage} passed verification.`);
};

export const analyzeData = async (
  dataContent: string, 
  fileName: string, 
  language: string = "Simplified Chinese",
  modelIdentity: string = "DeepAnalyze-8B"
): Promise<AnalysisResult> => {
  try {
    // 1. Security Check: INPUT
    await checkSafetyWithQwenGuard(dataContent, 'input');

    // Truncate content to prevent payload size issues
    const truncatedContent = dataContent.slice(0, 20000);

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
      // 2. Security Check: OUTPUT
      await checkSafetyWithQwenGuard(response.text, 'output');
      
      return JSON.parse(response.text) as AnalysisResult;
    }
    throw new Error("No analysis generated");
  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
};

/**
 * Streams chat response but wraps it to enable Post-Generation Audit by QwenGuard.
 */
export const streamChatResponse = async function* (
  history: { role: string; parts: { text: string }[] }[],
  message: string,
  contextData: string,
  language: string = "Simplified Chinese",
  modelIdentity: string = "DeepAnalyze-8B"
) {
  // 1. Security Check: INPUT (User Message)
  await checkSafetyWithQwenGuard(message, 'input');

  const systemContext = `
    You are ${modelIdentity}, an intelligent data analysis assistant. 
    The user is asking questions about the following dataset they uploaded:
    ---
    ${contextData.slice(0, 10000)}
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
  
  let fullResponseAccumulator = "";

  // Pass through the stream to the UI for low latency
  for await (const chunk of resultStream) {
    const text = chunk.text;
    if (text) {
      fullResponseAccumulator += text;
    }
    yield chunk;
  }

  // 2. Security Check: OUTPUT (Post-Stream Audit)
  // We check the full gathered response after streaming finishes.
  if (fullResponseAccumulator.length > 0) {
    await checkSafetyWithQwenGuard(fullResponseAccumulator, 'output');
  }
};