import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Sparkles, MessageSquarePlus } from 'lucide-react';
import { Button } from './ui/button';

interface InsightBarProps {
  insight: string;
  query: string;
  suggestions?: string[];
  onSuggestionClick?: (query: string) => void;
}

const InsightBar = ({ insight, query, suggestions, onSuggestionClick }: InsightBarProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, type: 'spring', damping: 20 }}
      className="glass-card rounded-2xl p-5 border-l-2 border-l-accent/50 flex flex-col gap-4"
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-accent" />
        </div>
        <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-bold text-accent uppercase tracking-[0.12em]">
                      {insight.toLowerCase().includes('found') || insight.match(/is (in|at|the|from)/i) ? '🎯 Pinpoint Answer' : 'AI Generated Insight'}
                    </span>
                    <div className="h-px flex-1 bg-border/30" />
            <span className="text-[10px] text-muted-foreground/60 truncate max-w-[200px]">"{query}"</span>
          </div>
          <p className="text-sm text-foreground/85 leading-relaxed">{insight}</p>
        </div>
      </div>
      
      {suggestions && suggestions.length > 0 && (
        <div className="pl-14 pt-3 border-t border-border/40">
           <div className="flex items-center gap-1.5 mb-2.5">
             <MessageSquarePlus className="w-3.5 h-3.5 text-muted-foreground" />
             <span className="text-xs font-semibold text-muted-foreground">Follow-up suggestions:</span>
           </div>
           <div className="flex flex-wrap gap-2">
             {suggestions.map((suggestion, i) => (
               <Button
                 key={i}
                 onClick={() => onSuggestionClick?.(suggestion)}
                 variant="ghost"
                 size="sm"
                 className="text-[11px] bg-secondary/30 hover:bg-secondary/70 border border-border/50 text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg transition-colors text-left font-normal"
               >
                 "{suggestion}"
               </Button>
             ))}
           </div>
        </div>
      )}
    </motion.div>
  );
};

export default InsightBar;
