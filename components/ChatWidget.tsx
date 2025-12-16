
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, User } from 'lucide-react';
import { ChatMessage, TokenUsage } from '../types';
// Switch back to inference service which now wraps Gemini
import { streamChatResponse } from '../services/inference';
import ReactMarkdown from 'react-markdown';

interface ChatWidgetProps {
  contextData?: string | null;
  language: string;
  modelName: string;
  onTokenUsage?: (usage: TokenUsage) => void;
}

const translations: Record<string, any> = {
  'Simplified Chinese': {
    askAboutData: '向AI询问数据',
    chatWithAI: '与AI对话',
    aiAnalyst: 'AI 分析师',
    greetingData: '你好！我已经分析了您的数据。您可以问我关于特定趋势、数值或更深层见解的问题。',
    greetingGeneral: '你好！我是您的AI数据分析助手。上传数据以进行特定分析，或问我关于数据科学的一般问题。',
    placeholderData: '询问趋势、异常值...',
    placeholderGeneral: '输入您的消息...',
    error: '处理您的请求时遇到错误。请重试。'
  },
  'English': {
    askAboutData: 'Ask AI about Data',
    chatWithAI: 'Chat with AI',
    aiAnalyst: 'AI Analyst',
    greetingData: 'Hello! I have analyzed your data. Ask me anything about specific trends, values, or deeper insights.',
    greetingGeneral: 'Hello! I am your AI Data Analyst assistant. Upload data for specific analysis, or ask me general questions about data science.',
    placeholderData: 'Ask about trends, outliers...',
    placeholderGeneral: 'Type your message...',
    error: 'I encountered an error processing your request. Please try again.'
  },
  'Japanese': {
    askAboutData: 'データについてAIに聞く',
    chatWithAI: 'AIとチャット',
    aiAnalyst: 'AIアナリスト',
    greetingData: 'こんにちは！データを分析しました。特定の傾向や数値、深い洞察について質問してください。',
    greetingGeneral: 'こんにちは！AIデータ分析アシスタントです。分析のためにデータをアップロードするか、データサイエンスについて質問してください。',
    placeholderData: '傾向や異常値について聞く...',
    placeholderGeneral: 'メッセージを入力...',
    error: 'リクエストの処理中にエラーが発生しました。もう一度お試しください。'
  },
  'Korean': {
    askAboutData: 'AI에게 데이터 문의',
    chatWithAI: 'AI와 채팅',
    aiAnalyst: 'AI 분석가',
    greetingData: '안녕하세요! 데이터를 분석했습니다. 특정 추세, 값 또는 더 깊은 통찰력에 대해 질문해 주세요.',
    greetingGeneral: '안녕하세요! AI 데이터 분석 도우미입니다. 분석할 데이터를 업로드하거나 데이터 과학에 대한 일반적인 질문을 하세요.',
    placeholderData: '추세, 이상치에 대해 질문...',
    placeholderGeneral: '메시지를 입력하세요...',
    error: '요청을 처리하는 중 오류가 발생했습니다. 다시 시도해 주세요.'
  },
   'Spanish': {
    askAboutData: 'Preguntar a IA sobre Datos',
    chatWithAI: 'Chat con IA',
    aiAnalyst: 'Analista IA',
    greetingData: '¡Hola! He analizado tus datos. Pregúntame cualquier cosa sobre tendencias específicas, valores o ideas profundas.',
    greetingGeneral: '¡Hola! Soy tu asistente de análisis de datos. Sube datos para un análisis específico o hazme preguntas generales.',
    placeholderData: 'Preguntar sobre tendencias...',
    placeholderGeneral: 'Escribe tu mensaje...',
    error: 'Encontré un error al procesar tu solicitud. Por favor intenta de nuevo.'
  },
  'French': {
    askAboutData: 'Demander à l\'IA sur les Données',
    chatWithAI: 'Discuter avec l\'IA',
    aiAnalyst: 'Analyste IA',
    greetingData: 'Bonjour ! J\'ai analysé vos données. Posez-moi des questions sur les tendances spécifiques, les valeurs ou des informations plus approfondies.',
    greetingGeneral: 'Bonjour ! Je suis votre assistant d\'analyse de données. Téléchargez des données ou posez-moi des questions générales.',
    placeholderData: 'Demander sur les tendances...',
    placeholderGeneral: 'Tapez votre message...',
    error: 'J\'ai rencontré une erreur lors du traitement de votre demande. Veuillez réessayer.'
  },
  'German': {
    askAboutData: 'KI zu Daten befragen',
    chatWithAI: 'Mit KI chatten',
    aiAnalyst: 'KI Analyst',
    greetingData: 'Hallo! Ich habe Ihre Daten analysiert. Fragen Sie mich nach Trends, Werten oder tieferen Erkenntnissen.',
    greetingGeneral: 'Hallo! Ich bin Ihr KI-Datenanalyse-Assistent. Laden Sie Daten hoch oder stellen Sie allgemeine Fragen.',
    placeholderData: 'Fragen Sie nach Trends...',
    placeholderGeneral: 'Nachricht eingeben...',
    error: 'Bei der Verarbeitung Ihrer Anfrage ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.'
  }
};

export const ChatWidget: React.FC<ChatWidgetProps> = ({ contextData, language = "English", modelName, onTokenUsage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const t = translations[language] || translations['English'];

  useEffect(() => {
    // Initial greeting based on context
    if (messages.length === 0) {
      if (contextData) {
        setMessages([{ role: 'model', text: t.greetingData, timestamp: Date.now() }]);
      } else {
        setMessages([{ role: 'model', text: t.greetingGeneral, timestamp: Date.now() }]);
      }
    }
  }, [contextData, language]); // Re-run if language changes to update greeting? Ideally should just stay, but for demo good to switch.

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // Convert to format expected by API
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const resultStream = await streamChatResponse(history, userMsg.text, contextData || "", language, modelName);
      
      let fullResponse = '';
      const botMsgId = Date.now();
      
      setMessages(prev => [...prev, { role: 'model', text: '', timestamp: botMsgId }]);

      for await (const chunk of resultStream) {
        if (chunk.text) {
          const text = chunk.text || '';
          fullResponse += text;
          setMessages(prev => 
            prev.map(msg => msg.timestamp === botMsgId ? { ...msg, text: fullResponse } : msg)
          );
        }
        if (chunk.usage && onTokenUsage) {
          onTokenUsage(chunk.usage);
        }
      }
    } catch (error) {
      console.error('Chat error', error);
      setMessages(prev => [...prev, { role: 'model', text: t.error, timestamp: Date.now() }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-full shadow-lg transition-all hover:scale-105 z-50 group"
      >
        <MessageSquare className="w-6 h-6" />
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          {contextData ? t.askAboutData : t.chatWithAI}
        </span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl flex flex-col z-50 animate-in fade-in slide-in-from-bottom-10">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/50 backdrop-blur rounded-t-2xl">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">{t.aiAnalyst}</h3>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              {modelName}
            </p>
          </div>
        </div>
        <button 
          onClick={() => setIsOpen(false)}
          className="text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              msg.role === 'user' ? 'bg-slate-700' : 'bg-blue-600/20 text-blue-400'
            }`}>
              {msg.role === 'user' ? <User className="w-4 h-4 text-slate-300" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white' 
                : 'bg-slate-700/50 text-slate-200 border border-slate-700'
            }`}>
              {msg.role === 'model' ? (
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              ) : (
                msg.text
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-slate-700 bg-slate-800/50 rounded-b-2xl">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={contextData ? t.placeholderData : t.placeholderGeneral}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
          />
          <button 
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
