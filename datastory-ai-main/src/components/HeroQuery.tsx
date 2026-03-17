import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, ArrowRight, Zap, Brain, BarChart3, Upload } from 'lucide-react';
import VaporizeTextCycle, { Tag } from './ui/VaporizeTextCycle';
import { Button } from './ui/button';

interface HeroQueryProps {
  onQuery: (query: string) => void;
  isLoading: boolean;
  datasetActive: boolean;
}

const EXAMPLE_PROMPTS = [
  { text: 'Show schema overview', icon: '📋' },
  { text: 'Show monthly total revenue trend', icon: '📈' },
  { text: 'Top 5 categories by total revenue', icon: '🏆' },
  { text: 'Revenue breakdown by region', icon: '🗺️' },
  { text: 'Show payment method distribution', icon: '💳' },
];

const FEATURES = [
  { icon: Brain, label: 'Advanced AI', desc: 'Gemini 1.5 Flash' },
  { icon: Zap, label: 'Real-time', desc: 'Instant insights' },
  { icon: BarChart3, label: 'Smart Engine', desc: 'Auto visualization' },
];

const HeroQuery = ({ onQuery, isLoading, datasetActive }: HeroQueryProps) => {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) onQuery(query.trim());
  };

  return (
    <div className="relative pt-28 pb-8 px-6">
      <div className="max-w-3xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: 'spring', damping: 20 }}
        >
          {/* Badge */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/8 border border-primary/15 mb-6 backdrop-blur-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary tracking-wide">Powered by Google Gemini AI</span>
          </motion.div>

          <div className="h-[180px] md:h-[220px] mb-2 flex flex-col justify-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-tight mb-2">
              Ask your data
            </h1>
            <VaporizeTextCycle
              texts={["anything", "trends", "patterns", "insights", "forecasts"]}
              font={{
                fontFamily: "Inter, sans-serif",
                fontSize: "60px",
                fontWeight: 800
              }}
              color="rgb(59, 130, 246)"
              spread={4}
              density={6}
              animation={{
                vaporizeDuration: 2.5,
                fadeInDuration: 1.2,
                waitDuration: 0.8
              }}
              direction="left-to-right"
              alignment="center"
              tag={Tag.H2}
            />
          </div>

          <p className="text-muted-foreground text-lg mb-4 max-w-xl mx-auto leading-relaxed">
            Upload a dataset and get instant AI-powered insights with natural language.
            No SQL. No complexity. Just answers.
          </p>

          {/* Feature pills */}
          <div className="flex items-center justify-center gap-3 mb-8">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/40 border border-border/50 text-xs"
              >
                <f.icon className="w-3 h-3 text-primary" />
                <span className="text-muted-foreground font-medium">{f.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
        {datasetActive && (
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="relative max-w-2xl mx-auto mt-10"
          >
            <div className="relative group">
              <div className="absolute inset-0 bg-primary/20 blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
              <div className="relative flex items-center bg-secondary/80 backdrop-blur-xl border border-border/50 rounded-2xl overflow-hidden focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 transition-all duration-300">
                <span className="absolute h-px opacity-0 group-hover:opacity-100 transition-all duration-500 ease-in-out inset-x-0 inset-y-0 bg-gradient-to-r w-3/4 mx-auto from-transparent dark:via-blue-500 via-blue-600 to-transparent" />
                <div className="pl-5 text-muted-foreground">
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  ) : (
                    <Search className="w-5 h-5" />
                  )}
                </div>
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  placeholder="Ask your data anything (e.g. 'show schema')..."
                  className="w-full bg-transparent border-none py-5 px-4 text-foreground placeholder:text-muted-foreground/60 focus:ring-0 text-lg outline-none"
                />
                <div className="pr-3">
                  <Button
                    type="submit"
                    variant="solid"
                    size="sm"
                    disabled={!query.trim() || isLoading}
                    className="rounded-full w-10 h-10 p-0 flex items-center justify-center shadow-lg shadow-blue-500/20"
                  >
                    {isLoading ? (
                       <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <ArrowRight className="w-5 h-5" />
                    )}
                  </Button>
                </div>
                <span className="absolute group-hover:opacity-30 transition-all duration-500 ease-in-out inset-x-0 h-px -bottom-px bg-gradient-to-r w-3/4 mx-auto from-transparent dark:via-blue-500 via-blue-600 to-transparent" />
              </div>
            </div>
          </motion.form>
        )}


        {/* Example prompts */}
        <AnimatePresence>
          {datasetActive && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap justify-center gap-2 mt-6"
            >
              {EXAMPLE_PROMPTS.map((prompt, i) => (
                <motion.div
                  key={prompt.text}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + i * 0.07 }}
                  whileHover={{ scale: 1.03 }}
                >
                  <Button
                    onClick={() => { setQuery(prompt.text); onQuery(prompt.text); }}
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-secondary/40 text-muted-foreground hover:text-foreground hover:bg-secondary/70 border border-transparent hover:border-border/50 transition-all duration-200"
                  >
                    <span>{prompt.icon}</span>
                    {prompt.text}
                  </Button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default HeroQuery;
