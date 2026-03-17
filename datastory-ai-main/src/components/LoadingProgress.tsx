import { motion } from 'framer-motion';
import { CheckCircle2, Loader2 } from 'lucide-react';

interface ProgressStep {
  label: string;
  detail: string;
  done: boolean;
  active: boolean;
}

interface LoadingProgressProps {
  currentMessage: string;
}

const STEPS = [
  { label: 'Parsing Query', detail: 'Natural language → structured intent' },
  { label: 'Smart Retrieval', detail: 'Scanning dataset rows for matches' },
  { label: 'AI Analysis', detail: 'Gemini selecting charts & insights' },
  { label: 'Rendering Dashboard', detail: 'Building interactive visuals' },
];

const LoadingProgress = ({ currentMessage }: LoadingProgressProps) => {
  // Map message to step index
  const activeIdx = currentMessage.toLowerCase().includes('match') || currentMessage.toLowerCase().includes('search')
    ? 1
    : currentMessage.toLowerCase().includes('gemini') || currentMessage.toLowerCase().includes('analyz') || currentMessage.toLowerCase().includes('pinpoint') || currentMessage.toLowerCase().includes('retriev')
    ? 2
    : currentMessage.toLowerCase().includes('render') || currentMessage.toLowerCase().includes('chart') || currentMessage.toLowerCase().includes('dashboard')
    ? 3
    : 0;

  const steps: ProgressStep[] = STEPS.map((s, i) => ({
    ...s,
    done: i < activeIdx,
    active: i === activeIdx,
  }));

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-6 border border-primary/10"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <div>
            <p className="text-sm font-semibold text-foreground">{currentMessage}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Powered by Google Gemini 1.5 Flash</p>
          </div>
        </div>

        {/* Step track */}
        <div className="space-y-3">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              {/* Connector line */}
              <div className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                  step.done
                    ? 'bg-primary/20 border-primary text-primary'
                    : step.active
                    ? 'bg-primary/10 border-primary animate-pulse'
                    : 'bg-secondary/30 border-border/30 text-muted-foreground/30'
                }`}>
                  {step.done ? (
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  ) : step.active ? (
                    <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
                  ) : (
                    <span className="text-[10px] font-bold">{i + 1}</span>
                  )}
                </div>
                {i < steps.length - 1 && (
                  <div className={`w-px h-4 mt-0.5 transition-all duration-500 ${step.done ? 'bg-primary/40' : 'bg-border/20'}`} />
                )}
              </div>

              <div className={`transition-all duration-300 ${step.active ? 'opacity-100' : step.done ? 'opacity-70' : 'opacity-30'}`}>
                <p className={`text-xs font-semibold ${step.active ? 'text-foreground' : step.done ? 'text-foreground/70' : 'text-muted-foreground'}`}>
                  {step.label}
                  {step.done && <span className="ml-2 text-[9px] font-bold text-primary uppercase tracking-widest">✓ Done</span>}
                  {step.active && <span className="ml-2 text-[9px] font-bold text-primary uppercase tracking-widest animate-pulse">● Active</span>}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{step.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Skeleton charts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass-card rounded-2xl p-5" style={{ animationDelay: `${i * 100}ms` }}>
            <div className="skeleton-shimmer h-3 w-24 rounded-md mb-4" />
            <div className="skeleton-shimmer h-8 w-20 rounded-md" />
          </div>
        ))}
      </div>
      <div className="glass-card rounded-2xl p-5">
        <div className="skeleton-shimmer h-3 w-32 rounded-md mb-3" />
        <div className="skeleton-shimmer h-3 w-full rounded-md mb-2" />
        <div className="skeleton-shimmer h-3 w-3/4 rounded-md" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[0, 1].map((i) => (
          <div key={i} className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="skeleton-shimmer w-9 h-9 rounded-xl" />
              <div>
                <div className="skeleton-shimmer h-4 w-36 rounded-md mb-2" />
                <div className="skeleton-shimmer h-3 w-20 rounded-md" />
              </div>
            </div>
            <div className="skeleton-shimmer h-[280px] w-full rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoadingProgress;
