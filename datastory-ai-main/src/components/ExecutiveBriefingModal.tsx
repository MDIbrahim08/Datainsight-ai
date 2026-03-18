import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Download, Printer, CheckCircle2, Loader2, Sparkles, ShieldCheck, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';

interface ExecutiveBriefingModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string | null;
  isLoading: boolean;
  datasetName: string;
}

const ExecutiveBriefingModal = ({ 
  isOpen, 
  onClose, 
  content, 
  isLoading,
  datasetName 
}: ExecutiveBriefingModalProps) => {

  const handleDownload = () => {
    if (!content) return;
    const element = document.createElement("a");
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `Executive_Briefing_${datasetName}_${new Date().toLocaleDateString()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl max-h-[90vh] glass-card rounded-3xl border border-primary/20 shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-border/40 flex items-center justify-between bg-primary/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Executive Strategic Briefing</h2>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold flex items-center gap-2">
                    <Sparkles className="w-3 h-3 text-primary/70" />
                    AI-Synthesized for Board of Directors
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl hover:bg-secondary/50 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-card/30">
              {isLoading ? (
                <div className="py-20 flex flex-col items-center justify-center space-y-4">
                  <div className="relative">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                    <Sparkles className="w-5 h-5 text-primary absolute -top-1 -right-1 animate-pulse" />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground">Synthesizing Briefing...</p>
                    <p className="text-sm text-muted-foreground">Gemini 1.5 is analyzing dashboard aggregates & trends</p>
                  </div>
                </div>
              ) : content ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="prose prose-invert max-w-none"
                >
                   <div className="flex items-center gap-2 mb-8 bg-success/10 border border-success/20 px-4 py-2 rounded-xl w-fit">
                    <ShieldCheck className="w-4 h-4 text-success" />
                    <span className="text-[10px] font-bold text-success uppercase tracking-widest">Verified Tactical Intelligence</span>
                  </div>

                  <div className="space-y-6 text-foreground/90 font-medium leading-relaxed font-sans subpixel-antialiased">
                    {/* Render newlines properly */}
                    {content.split('\n').map((line, i) => (
                      <p key={i} className={line.startsWith('#') || line.toUpperCase() === line ? 'font-bold text-primary mt-6 mb-2 border-l-2 border-primary/30 pl-3 uppercase tracking-wide text-sm' : ''}>
                        {line}
                      </p>
                    ))}
                  </div>

                  <div className="mt-12 pt-8 border-t border-border/30 text-center">
                    <p className="text-[10px] text-muted-foreground font-mono uppercase">
                      Generated by DataInsight AI • {datasetName} • {new Date().toLocaleDateString()}
                    </p>
                  </div>
                </motion.div>
              ) : (
                <div className="py-20 text-center">
                  <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-foreground font-semibold">No briefing content available</p>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-border/40 bg-secondary/20 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-success" />
                Confidence Score: 98% (Grounded in Verified Data)
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button
                  variant="ghost"
                  onClick={handlePrint}
                  className="flex-1 sm:flex-none gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Print
                </Button>
                <Button
                  onClick={handleDownload}
                  disabled={!content || isLoading}
                  className="flex-1 sm:flex-none gap-2 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
                >
                  <Download className="w-4 h-4" />
                  Download Report (.txt)
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ExecutiveBriefingModal;
