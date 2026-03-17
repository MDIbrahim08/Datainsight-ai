import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Bot, RotateCcw, Shield, Target, BarChart3 } from 'lucide-react';

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  query?: string;
  summary?: string;
  chartCount?: number;
  isDirectAnswer?: boolean;
  isRAG?: boolean;
  hasError?: boolean;
  timestamp: Date;
}

interface ChatThreadProps {
  messages: ChatMessage[];
  onRerun: (query: string) => void;
  isLoading?: boolean;
  loadingQuery?: string;
}

const ChatThread = ({ messages, onRerun, isLoading, loadingQuery }: ChatThreadProps) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (messages.length === 0 && !isLoading) return null;

  return (
    <div className="glass-card rounded-2xl border border-border/30 overflow-hidden mb-6">
      {/* Header */}
      <div className="px-5 py-3 border-b border-border/30 bg-secondary/20 flex items-center gap-2">
        <Bot className="w-4 h-4 text-primary" />
        <span className="text-xs font-bold text-foreground uppercase tracking-widest">Conversation Thread</span>
        <span className="ml-auto text-[10px] text-muted-foreground/50 font-mono">{messages.length} exchange{messages.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Messages */}
      <div className="p-4 space-y-3 max-h-72 overflow-y-auto custom-scrollbar">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex gap-3 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.type === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5 text-primary" />
                </div>
              )}

              <div className={`max-w-[75%] ${msg.type === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                {msg.type === 'user' ? (
                  <div className="px-4 py-2.5 rounded-2xl rounded-tr-sm bg-primary/15 border border-primary/20 text-sm text-foreground font-medium">
                    {msg.query}
                  </div>
                ) : (
                  <div className="px-4 py-2.5 rounded-2xl rounded-tl-sm bg-secondary/40 border border-border/40 text-sm">
                    {msg.hasError ? (
                      <span className="text-destructive/80 text-xs">⚠ {msg.summary}</span>
                    ) : (
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Mode badge */}
                        {msg.isRAG && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-[9px] font-bold text-green-400 uppercase tracking-wider">
                            <Target className="w-2.5 h-2.5" /> RAG
                          </span>
                        )}
                        {msg.isDirectAnswer && !msg.isRAG && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[9px] font-bold text-blue-400 uppercase tracking-wider">
                            🎯 Pinpoint
                          </span>
                        )}
                        {!msg.isDirectAnswer && msg.chartCount !== undefined && msg.chartCount > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-[9px] font-bold text-accent uppercase tracking-wider">
                            <BarChart3 className="w-2.5 h-2.5" /> {msg.chartCount} chart{msg.chartCount !== 1 ? 's' : ''}
                          </span>
                        )}
                        <span className="text-muted-foreground text-xs">{msg.summary}</span>
                      </div>
                    )}
                  </div>
                )}
                <span className="text-[9px] text-muted-foreground/40 px-1">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {msg.type === 'user' && (
                <div className="flex flex-col items-center gap-1">
                  <div className="w-7 h-7 rounded-lg bg-secondary/60 border border-border/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <button
                    onClick={() => onRerun(msg.query!)}
                    className="w-7 h-7 rounded-lg bg-transparent hover:bg-secondary/50 flex items-center justify-center transition-colors"
                    title="Re-run this query"
                  >
                    <RotateCcw className="w-3 h-3 text-muted-foreground/40 hover:text-muted-foreground" />
                  </button>
                </div>
              )}
            </motion.div>
          ))}

          {/* Loading bubble */}
          {isLoading && loadingQuery && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 justify-end"
            >
              <div className="px-4 py-2.5 rounded-2xl rounded-tr-sm bg-primary/15 border border-primary/20 text-sm text-foreground/70 italic max-w-[75%]">
                {loadingQuery}
              </div>
              <div className="w-7 h-7 rounded-lg bg-secondary/60 border border-border/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
            </motion.div>
          )}
          {isLoading && (
            <motion.div
              key="ai-loading"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 justify-start"
            >
              <div className="w-7 h-7 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-secondary/40 border border-border/40">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default ChatThread;
