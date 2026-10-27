import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import { sendChatMessage } from '../services/api';

interface ChatAssistantProps {
  currentContext?: {
    owner: string;
    repo: string;
    issueNumber: number;
    title: string;
  };
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const DEFAULT_SUGGESTIONS = [
  'How do I fork and clone this repository?',
  'What git commands do I need to create a branch?',
  'How do I write a good pull request title and description?',
  'What if the tests fail locally?',
];

export const ChatAssistant: React.FC<ChatAssistantProps> = ({ currentContext }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        "Hi! I'm your open-source onboarding guide. Ask me anything about git workflows, understanding this issue, or finding the right files.",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMessage: Message = { role: 'user', content: text };
    const updatedHistory = [...messages, userMessage];
    setMessages(updatedHistory);
    setInput('');
    setIsLoading(true);

    try {
      const reply = await sendChatMessage(text, currentContext, updatedHistory);
      setMessages([...updatedHistory, { role: 'assistant', content: reply }]);
    } catch (error) {
      setMessages([
        ...updatedHistory,
        {
          role: 'assistant',
          content: error instanceof Error
            ? `I couldn't generate an assistant response: ${error.message}`
            : 'I could not generate an assistant response. Check the server setup and try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-[#0A1428] text-white px-4 py-3 rounded-full shadow-lg hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 border border-slate-700"
          aria-label="Open AI contribution assistant"
        >
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium">Ask Assistant</span>
        </button>
      )}

      {/* Slide-over Drawer / Panel */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="FirstCommit AI Assistant"
          className="fixed bottom-6 right-6 z-50 w-full max-w-sm sm:max-w-md bg-white border border-slate-300 rounded-2xl shadow-2xl flex flex-col h-[540px] max-h-[85vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-[#0A1428] text-white px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-500/40 flex items-center justify-center">
                <Bot className="w-4 h-4 text-blue-300" />
              </div>
              <div>
                <h4 className="text-sm font-semibold">FirstCommit Assistant</h4>
                <p className="text-[11px] text-slate-300">
                  {currentContext ? `#${currentContext.issueNumber} • ${currentContext.owner}/${currentContext.repo}` : 'Ready to answer beginner questions'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
              aria-label="Close assistant panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/60">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`rounded-xl px-3.5 py-2.5 text-xs max-w-[85%] leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none shadow-sm'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-sm'
                  }`}
                >
                  {/* Format code segments in messages */}
                  {m.content.split('`').map((part, idx) =>
                    idx % 2 === 1 ? (
                      <code
                        key={idx}
                        className={`font-mono text-[11px] px-1 py-0.5 rounded ${
                          m.role === 'user'
                            ? 'bg-blue-700 text-blue-100'
                            : 'bg-slate-100 text-blue-800 border border-slate-200'
                        }`}
                      >
                        {part}
                      </code>
                    ) : (
                      part
                    )
                  )}
                </div>
                {m.role === 'user' && (
                  <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                </div>
                <div className="bg-white text-slate-500 border border-slate-200 rounded-xl rounded-bl-none px-3.5 py-2 text-xs flex items-center gap-2">
                  <span>Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions if few messages */}
          {messages.length <= 2 && (
            <div className="px-4 py-2 border-t border-slate-100 bg-white">
              <span className="text-[11px] text-slate-400 font-medium block mb-1.5">Common questions:</span>
              <div className="flex flex-wrap gap-1.5">
                {DEFAULT_SUGGESTIONS.slice(0, 2).map((sugg, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(sugg)}
                    className="text-[11px] text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded text-left transition-colors"
                  >
                    {sugg}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 border-t border-slate-200 bg-white flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about git, this issue, or next steps..."
              className="flex-1 text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white p-2 rounded-lg transition-colors"
              aria-label="Send question"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
