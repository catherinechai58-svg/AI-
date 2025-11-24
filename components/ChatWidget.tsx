import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, User } from 'lucide-react';
import { ChatMessage } from '../types';
import { streamChatResponse } from '../services/gemini';
import ReactMarkdown from 'react-markdown';

interface ChatWidgetProps {
  contextData: string;
  language?: string;
  modelName: string;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({ contextData, language = "Simplified Chinese", modelName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Hello! I have analyzed your data. Ask me anything about specific trends, values, or deeper insights.', timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      // Transform internal messages to Gemini history format
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const resultStream = await streamChatResponse(history, userMsg.text, contextData, language, modelName);
      
      let fullResponse = '';
      const botMsgId = Date.now();
      
      setMessages(prev => [...prev, { role: 'model', text: '', timestamp: botMsgId }]);

      for await (const chunk of resultStream) {
        const text = chunk.text || '';
        fullResponse += text;
        setMessages(prev => 
          prev.map(msg => msg.timestamp === botMsgId ? { ...msg, text: fullResponse } : msg)
        );
      }
    } catch (error) {
      console.error('Chat error', error);
      setMessages(prev => [...prev, { role: 'model', text: 'Sorry, I encountered an error responding to that.', timestamp: Date.now() }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg transition-all duration-300 hover:scale-105 z-50 flex items-center gap-2"
      >
        <MessageSquare className="w-6 h-6" />
        <span className="font-semibold pr-2">Ask Data</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-[90vw] md:w-[400px] h-[600px] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
      {/* Header */}
      <div className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-500/20 rounded-lg">
            <Bot className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">{modelName} Assistant</h3>
            <p className="text-xs text-slate-400">Powered by {modelName}</p>
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white p-1">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/95">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'model' && (
               <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-blue-400" />
               </div>
            )}
            <div 
              className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
              }`}
            >
              <ReactMarkdown>{msg.text}</ReactMarkdown>
            </div>
             {msg.role === 'user' && (
               <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-white" />
               </div>
            )}
          </div>
        ))}
        {isTyping && (
           <div className="flex gap-3 justify-start">
             <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-blue-400" />
             </div>
             <div className="bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-slate-700">
               <div className="flex gap-1">
                 <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></span>
                 <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-100"></span>
                 <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-200"></span>
               </div>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 bg-slate-800 border-t border-slate-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask about your data in ${language}...`}
            className="flex-1 bg-slate-900 border border-slate-700 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-slate-500"
          />
          <button 
            type="submit"
            disabled={!input.trim() || isTyping}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};