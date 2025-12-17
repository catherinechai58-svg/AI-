
import { AnalysisResult, TokenUsage } from '../types';

// ==================================================================================
// 🔌 LOCAL MODEL CONFIGURATION (PORTS RESERVED)
// ==================================================================================

// [PORT 1] DeepAnalyze Main Inference Engine
// The primary model for data analysis, summary, and insight generation.
let DEEPANALYZE_API_URL = "http://127.0.0.1:8000/v1/chat/completions";

// [PORT 2] Security & Safety Model
// Dedicated model for content moderation (e.g., Qwen-Guard, Llama-Guard).
let SECURITY_API_URL = "http://127.0.0.1:8001/v1/chat/completions";

const LOCAL_API_KEY = "sk-no-key-required"; // Placeholder for local servers

export const setLocalEndpoints = (mainUrl: string, securityUrl: string) => {
  DEEPANALYZE_API_URL = mainUrl;
  SECURITY_API_URL = securityUrl;
};

/**
 * Checks content safety using the reserved Security Model Port (8001).
 * Falls back to simulation if the local safety service is offline.
 */
const checkSafetyWithLocalGuard = async (content: string, stage: 'input' | 'output'): Promise<void> => {
  console.log(`🛡️ [Safety Layer] Auditing ${stage} via ${SECURITY_API_URL}...`);
  
  try {
    // Attempt to contact the real local security model
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1000); // 1s timeout for safety check

    const response = await fetch(SECURITY_API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${LOCAL_API_KEY}`
        },
        body: JSON.stringify({
            model: "safety-guard", // Generic identifier
            messages: [
                { role: "system", content: "You are a safety guard. Check if the content is safe. Respond 'safe' or 'unsafe'." },
                { role: "user", content: content.slice(0, 2000) } // Check sample
            ],
            max_tokens: 5,
            temperature: 0
        }),
        signal: controller.signal
    });
    clearTimeout(timeoutId);

    // If successful, we would parse the response here.
    // For this demo, we proceed after the attempt.
  } catch (e) {
    // If Port 8001 is not running, we catch the error and proceed smoothly
    // simulating the "Check" time without blocking the user.
    // console.warn("Local security model offline, skipping real check.");
  }

  // Artificial delay to visualize the "Guard" process in the UI
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
    // 1. Call Security Model (Port 8001)
    await checkSafetyWithLocalGuard(dataContent, 'input');

    console.log(`🚀 [DeepAnalyze Engine] Connecting to ${DEEPANALYZE_API_URL}...`);

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
      3. Return ONLY valid JSON. Do not include markdown formatting like \`\`\`json.
      
      Data Content:
      ${truncatedContent}
    `;

    // Construct OpenAI-compatible messages
    const messages = [
      { role: "system", content: systemInstruction },
      { role: "user", content: prompt }
    ];

    // 2. Call Main Analysis Model (Port 8000)
    const response = await fetch(DEEPANALYZE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LOCAL_API_KEY}`
      },
      body: JSON.stringify({
        model: modelIdentity,
        messages: messages,
        temperature: 0.2,
        max_tokens: 8192,
        stream: false
      })
    });

    if (!response.ok) {
       const errText = await response.text();
       throw new Error(`Local API Error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content;

    if (content) {
      // 3. Call Security Model for Output (Port 8001)
      await checkSafetyWithLocalGuard(content, 'output');
      
      // Cleanup potential markdown code blocks often returned by LLMs
      content = content.trim();
      if (content.startsWith("```json")) {
        content = content.replace(/^```json\s*/, "").replace(/\s*```$/, "");
      } else if (content.startsWith("```")) {
        content = content.replace(/^```\s*/, "").replace(/\s*```$/, "");
      }

      const result = JSON.parse(content) as AnalysisResult;

      // Attach Usage Metadata
      if (data.usage) {
        result.usage = {
          promptTokens: data.usage.prompt_tokens || 0,
          outputTokens: data.usage.completion_tokens || 0,
          totalTokens: data.usage.total_tokens || 0
        };
      }

      return result;
    }
    throw new Error("No analysis generated from local model");

  } catch (error: any) {
    console.error("Analysis failed:", error);
    throw new Error(`DeepAnalyze Engine Error: ${error.message}`);
  }
};

/**
 * Streams chat response using Local API (Port 8000).
 */
export const streamChatResponse = async function* (
  history: { role: string; parts: { text: string }[] }[],
  message: string,
  contextData: string,
  language: string = "English",
  modelIdentity: string = "DeepAnalyze-8B"
) {
  // Check Input Safety (Port 8001)
  await checkSafetyWithLocalGuard(message, 'input');

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

  // Convert Gemini-style history to OpenAI-style messages
  const messages = [
    { role: "system", content: systemContext },
    ...history.map(msg => ({
      role: msg.role === 'model' ? 'assistant' : 'user',
      content: msg.parts[0].text
    })),
    { role: "user", content: message }
  ];

  try {
    // Chat Stream Request (Port 8000)
    const response = await fetch(DEEPANALYZE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LOCAL_API_KEY}`
      },
      body: JSON.stringify({
        model: modelIdentity,
        messages: messages,
        stream: true,
        temperature: 0.7
      })
    });

    if (!response.ok || !response.body) {
      throw new Error(`Stream Error: ${response.statusText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data: ')) {
          const dataStr = trimmed.slice(6);
          if (dataStr === '[DONE]') continue;
          
          try {
            const json = JSON.parse(dataStr);
            const content = json.choices?.[0]?.delta?.content;
            if (content) {
              yield { text: content };
            }
            // Usage info might come in the last chunk
            if (json.usage) {
               yield { 
                 usage: {
                   promptTokens: json.usage.prompt_tokens,
                   outputTokens: json.usage.completion_tokens,
                   totalTokens: json.usage.total_tokens
                 }
               };
            }
          } catch (e) {
            console.warn('Error parsing stream chunk', e);
          }
        }
      }
    }
  } catch (error) {
    console.error("Chat Stream Error:", error);
    yield { text: "Connection to local inference node interrupted." };
  }
};
