import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Bot, User, Sparkles } from 'lucide-react';
import { getHealthChatResponse } from '../services/geminiService';
import { cn } from '../lib/utils';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([
    { role: 'model', text: 'Hi! I am Healthu. How can I help you with your wellness journey today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    const response = await getHealthChatResponse(userMessage, history);
    setMessages(prev => [...prev, { role: 'model', text: response || "I'm sorry, I couldn't process that." }]);
    setLoading(false);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-200 transition-transform hover:scale-110 active:scale-95 md:bottom-8 md:right-8"
      >
        <Sparkles size={24} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed inset-0 z-[60] flex flex-col bg-white md:inset-auto md:bottom-24 md:right-8 md:h-[600px] md:w-[400px] md:rounded-3xl md:shadow-2xl md:ring-1 md:ring-gray-100"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b bg-blue-600 p-4 text-white md:rounded-t-3xl">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                  <Bot size={24} />
                </div>
                <div>
                  <h3 className="font-bold">Healthu AI</h3>
                  <p className="text-[10px] uppercase tracking-widest opacity-80">Online & Ready</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="rounded-full p-2 hover:bg-white/10 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50"
            >
              {messages.map((m, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "flex max-w-[85%] items-start gap-2",
                    m.role === 'user' ? "ml-auto flex-row-reverse" : ""
                  )}
                >
                  <div className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white",
                    m.role === 'model' ? "bg-blue-600" : "bg-gray-800"
                  )}>
                    {m.role === 'model' ? <Bot size={16} /> : <User size={16} />}
                  </div>
                  <div className={cn(
                    "rounded-2xl p-3 text-sm shadow-sm",
                    m.role === 'model' ? "bg-white text-gray-800" : "bg-blue-600 text-white"
                  )}>
                    {m.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex items-start gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                    <Bot size={16} />
                  </div>
                  <div className="rounded-2xl bg-white p-3 text-sm shadow-sm">
                    <div className="flex gap-1">
                      <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-300"></div>
                      <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-300 [animation-delay:0.2s]"></div>
                      <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-300 [animation-delay:0.4s]"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="border-t p-4 pb-8 md:pb-4">
              <div className="flex items-center gap-2 rounded-2xl bg-gray-100 p-2 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask anything about health..."
                  className="flex-1 bg-transparent px-3 py-2 text-sm focus:outline-none"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50"
                >
                  <Send size={18} />
                </button>
              </div>
              <p className="mt-2 text-center text-[10px] text-gray-400">
                Healthu can make mistakes. Check important info.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
