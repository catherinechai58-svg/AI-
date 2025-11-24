export interface ChartConfig {
  title: string;
  type: 'bar' | 'line' | 'pie' | 'area';
  data: any[];
  xAxisKey: string;
  seriesKeys: string[];
  description: string;
}

export interface AnalysisResult {
  summary: string;
  keyInsights: string[];
  sentiment?: 'positive' | 'neutral' | 'negative';
  charts: ChartConfig[];
  rawAnalysis: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
