
export interface ChartConfig {
  title: string;
  type: 'bar' | 'line' | 'pie' | 'area';
  data: any[];
  xAxisKey: string;
  seriesKeys: string[];
  description: string;
}

export interface TokenUsage {
  promptTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface AnalysisResult {
  summary: string;
  keyInsights: string[];
  sentiment?: 'positive' | 'neutral' | 'negative';
  charts: ChartConfig[];
  rawAnalysis: string;
  usage?: TokenUsage; // Added token usage
}

export interface AnalysisHistoryItem {
  id: string;
  timestamp: number;
  fileName: string;
  language: string;
  model: string;
  result: AnalysisResult;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface User {
  username: string;
  lastLogin: number;
  dailyUsageCount: number;
  lastUsageDate: string; // ISO Date string YYYY-MM-DD
}
