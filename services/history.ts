
import { AnalysisHistoryItem, AnalysisResult } from '../types';

const DB_KEY = 'deepanalyze_history_db';

export const HistoryService = {
  saveAnalysis: (fileName: string, result: AnalysisResult, model: string, language: string): AnalysisHistoryItem => {
    const history = HistoryService.getAll();
    
    const newItem: AnalysisHistoryItem = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      fileName,
      result,
      model,
      language
    };

    // Prepend to list (newest first)
    const updatedHistory = [newItem, ...history];
    localStorage.setItem(DB_KEY, JSON.stringify(updatedHistory));
    return newItem;
  },

  getAll: (): AnalysisHistoryItem[] => {
    try {
      const raw = localStorage.getItem(DB_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  },

  delete: (id: string): AnalysisHistoryItem[] => {
    const history = HistoryService.getAll();
    const updated = history.filter(item => item.id !== id);
    localStorage.setItem(DB_KEY, JSON.stringify(updated));
    return updated;
  },

  clearAll: () => {
    localStorage.removeItem(DB_KEY);
  }
};
