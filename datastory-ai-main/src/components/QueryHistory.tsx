import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import { Button } from './ui/button';

interface QueryHistoryProps {
  queries: string[];
  onRerun: (query: string) => void;
}

const QueryHistory = ({ queries, onRerun }: QueryHistoryProps) => {
  if (queries.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-2 flex-wrap"
    >
      <span className="text-xs text-muted-foreground flex items-center gap-1">
        <MessageSquare className="w-3 h-3" /> Recent:
      </span>
      {queries.slice(-5).reverse().map((q, i) => (
        <Button
          key={`${q}-${i}`}
          onClick={() => onRerun(q)}
          variant="ghost"
          size="sm"
          className="text-xs px-2.5 py-1 rounded-md bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary transition-all truncate max-w-[200px]"
        >
          {q}
        </Button>
      ))}
    </motion.div>
  );
};

export default QueryHistory;
