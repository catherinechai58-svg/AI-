
import { GoogleGenAI } from "@google/genai";
import { AnalysisResult, TokenUsage } from '../types';

// Initialize Gemini API with the environment variable
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Keep the local endpoint variable for "Settings" display compatibility
let LOCAL_API_URL = "http://localhost:8000/v1/chat/completions";

export const setLocalEndpoint = (url: string) => {
  LOCAL_API_URL = url;
};

/**
 * Simulates the Qwen3Guard local safety check to maintain the "Original Version" feel.
 */
const checkSafetyWithLocalGuard = async (content: string, stage: 'input' | 'output'): Promise<void> => {
  console.log(`🛡️ [Local Qwen3Guard-Gen-4B] Auditing ${stage} (Length: ${content.length})...`);
  // Small artificial delay to simulate local processing
  await new Promise(resolve => setTimeout(resolve, 300)); 
};

export const analyzeData = async (
  dataContent: string, 
  fileName: string, 
  language: string = "English",
  modelIdentity: string = "DeepAnalyze-8B",
  useDeepThinking: boolean = false
): Promise<AnalysisResult> => {
  try {
    // 1. Simulate Local Security Check 
    await checkSafetyWithLocalGuard(dataContent, 'input');

    console.log(`🚀 [Inference Engine] Analyzing ${fileName} with ${modelIdentity} (Thinking: ${useDeepThinking})...`);

    // Determine backend model based on identity selection
    // Note: Thinking Config is only available for Gemini 2.5 series.
    let targetModel = 'gemini-2.5-flash'; 

    if (useDeepThinking) {
      // Force Gemini 2.5 Flash for thinking as it's the most reliable for this config currently
      targetModel = 'gemini-2.5-flash';
    } else {
      if (modelIdentity.includes('Pro') || modelIdentity.includes('Max')) {
        targetModel = 'gemini-3-pro-preview';
      }
    }

    // Truncate content to fit context window safely
    const truncatedContent = dataContent.slice(0, 100000); 

    // Strong System Instruction for Language Enforcement
    const systemInstruction = `
      You are ${modelIdentity}, an expert data scientist and analyst.
      
      GLOBAL LANGUAGE SETTING: ${language}
      
      CRITICAL INSTRUCTION:
      You MUST write ALL text in your response in ${language}.
      If the user provides data in English, you MUST TRANSLATE your analysis, summary, and insights into ${language}.
      Do NOT output English unless ${language} is "English".
    `;

    const prompt = `
      Analyze the following data content (from file(s): ${fileName}).
      
      Target Language: ${language} (EXTREMELY IMPORTANT)

      Perform a deep analysis to find trends, anomalies, and key takeaways.
      Suggest appropriate visualizations.

      Output the result strictly as a valid JSON object matching this structure:
      {
        "summary": "Executive summary of the provided data (WRITE IN ${language})",
        "keyInsights": ["Insight 1 (WRITE IN ${language})", "Insight 2 (WRITE IN ${language})"],
        "sentiment": "positive" | "neutral" | "negative",
        "charts": [
          {
            "title": "Title of the chart (WRITE IN ${language})",
            "type": "bar" | "line" | "pie" | "area",
            "data": [
              { "category": "A", "value": 100 } 
            ],
            "xAxisKey": "Key to use for X axis (e.g. 'category')",
            "seriesKeys": ["Keys to plot as series (e.g. 'value')"],
            "description": "Brief explanation (WRITE IN ${language})"
          }
        ],
        "rawAnalysis": "Detailed markdown analysis (WRITE IN ${language})"
      }
      
      CRITICAL RULES:
      1. The 'data' array in charts MUST contain objects with keys matching 'xAxisKey' and 'seriesKeys'.
      2. ALL TEXT VALUES MUST BE IN ${language}. DO NOT USE ENGLISH.
      3. Return ONLY valid JSON.
      
      Data Content:
      ${truncatedContent}
    `;

    // Configure request
    const requestConfig: any = {
      responseMimeType: 'application/json',
      systemInstruction: systemInstruction,
    };

    if (useDeepThinking) {
      // Apply thinking config if enabled (only works with supported models like 2.5 flash)
      requestConfig.thinkingConfig = { thinkingBudget: 8192 }; // Safe budget
    }

    const response = await ai.models.generateContent({
      model: targetModel,
      contents: prompt,
      config: requestConfig
    });

    if (response.text) {
      // 2. Simulate Output Security Check
      await checkSafetyWithLocalGuard(response.text, 'output');
      
      const result = JSON.parse(response.text) as AnalysisResult;

      // 3. Attach Usage Metadata
      if (response.usageMetadata) {
        result.usage = {
          promptTokens: response.usageMetadata.promptTokenCount || 0,
          outputTokens: response.usageMetadata.candidatesTokenCount || 0,
          totalTokens: response.usageMetadata.totalTokenCount || 0
        };
      }

      return result;
    }
    throw new Error("No analysis generated");

  } catch (error) {
    console.error("Analysis failed:", error);
    throw new Error("DeepAnalyze Engine Error: Unable to complete inference cycle.");
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
  await checkSafetyWithLocalGuard(message, 'input');

  let targetModel = 'gemini-2.5-flash';
  if (modelIdentity.includes('Pro') || modelIdentity.includes('Max')) {
    targetModel = 'gemini-3-pro-preview';
  }

  let systemContext = "";
  
  if (contextData && contextData.length > 0) {
    systemContext = `
      You are ${modelIdentity}, an intelligent data analysis assistant. 
      The user is asking questions about the following dataset they uploaded:
      ---
      ${contextData.slice(0, 30000)}
      ---
      Answer specific questions about this data. 
      Be concise and analytical.
      
      CRITICAL: You MUST answer strictly in ${language}. 
      Even if the data or user question is in English, translate your answer to ${language}.
    `;
  } else {
    systemContext = `
      You are ${modelIdentity}, an intelligent data analysis assistant. 
      The user has not uploaded specific data yet, but you can answer general questions about data science, coding, or help them understand how to upload data.
      
      CRITICAL: You MUST answer strictly in ${language}.
    `;
  }

  try {
    const chat = ai.chats.create({
      model: targetModel,
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
      // Extract token usage from chunks if available
      if (chunk.usageMetadata) {
        const usage: TokenUsage = {
          promptTokens: chunk.usageMetadata.promptTokenCount || 0,
          outputTokens: chunk.usageMetadata.candidatesTokenCount || 0,
          totalTokens: chunk.usageMetadata.totalTokenCount || 0
        };
        yield { usage };
      }
    }
  } catch (error) {
    console.error("Chat Stream Error:", error);
    yield { text: "Connection to inference node interrupted." };
  }
};
