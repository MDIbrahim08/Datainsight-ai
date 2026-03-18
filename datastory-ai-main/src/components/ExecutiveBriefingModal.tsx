import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Download, Printer, CheckCircle2, Loader2, Sparkles, ShieldCheck, AlertCircle, TrendingUp } from 'lucide-react';
import { Button } from './ui/button';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from 'recharts';

interface ExecutiveBriefingModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string | null;
  isLoading: boolean;
  datasetName: string;
  charts?: any[];
  kpis?: any[];
}

const ExecutiveBriefingModal = ({ 
  isOpen, 
  onClose, 
  content, 
  isLoading,
  datasetName,
  charts = [],
  kpis = []
}: ExecutiveBriefingModalProps) => {
  const [downloading, setDownloading] = useState<'txt' | 'doc' | 'pdf' | null>(null);
  const [success, setSuccess] = useState(false);

  const handleExport = async (type: 'txt' | 'doc' | 'pdf') => {
    if (!content) return;
    setDownloading(type);
    await new Promise(r => setTimeout(r, 1200));

    try {
      if (type === 'pdf') {
        window.print();
      } else {
        const element = document.createElement("a");
        let mimeType = 'text/plain';
        let extension = 'txt';
        let finalContent = content;

        if (type === 'doc') {
          mimeType = 'application/msword';
          extension = 'doc';
          finalContent = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head><meta charset='utf-8'><title>Executive Briefing</title></head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; padding: 40px;">
              <h1 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">Executive Strategic Briefing</h1>
              <p><b>Dataset:</b> ${datasetName} | <b>Date:</b> ${new Date().toLocaleDateString()}</p>
              <div style="background: #f8fafc; padding: 20px; border-radius: 10px; margin: 20px 0;">
                <p><b>KPI SCORECARD:</b></p>
                ${kpis.map(k => `<p>${k.label}: ${k.value}</p>`).join('')}
              </div>
              <hr/>
              <div style="white-space: pre-wrap; font-size: 14pt;">${content.replace(/\n\n/g, '<br/><br/>')}</div>
            </body>
            </html>
          `;
        }

        const file = new Blob([finalContent], {type: mimeType});
        element.href = URL.createObjectURL(file);
        element.download = `Executive_Briefing_${datasetName}_${new Date().toLocaleDateString()}.${extension}`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setDownloading(null);
    }
  };

  const renderFailsafeChart = () => {
    if (!charts || charts.length === 0 || !charts[0].data) return null;
    const chart = charts[0];
    const data = chart.data || [];
    
    return (
      <div className="h-[250px] w-full bg-secondary/10 rounded-2xl border border-primary/10 p-4 mb-8 print:border-black print:h-[400px]">
        <h4 className="text-xs font-bold text-primary uppercase mb-4 flex items-center gap-2">
          <TrendingUp className="w-3 h-3" />
          Primary Strategic Visualization: {chart.title}
        </h4>
        <ResponsiveContainer width="100%" height="100%">
          {chart.type === 'line' ? (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="name" hide />
              <YAxis hide />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} dot={false} isAnimationActive={false} />
            </LineChart>
          ) : (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="name" hide />
              <YAxis hide />
              <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} isAnimationActive={false} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 print:p-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/90 backdrop-blur-md print:hidden"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl max-h-[90vh] glass-card rounded-3xl border border-primary/20 shadow-2xl overflow-hidden flex flex-col print:shadow-none print:border-none print:bg-white print:text-black print:max-h-full print:relative print:scale-100"
          >
            {/* Header */}
            <div className="p-8 border-b border-border/40 flex items-center justify-between bg-primary/5 print:bg-transparent print:border-black">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-inner print:hidden">
                  <TrendingUp className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-foreground print:text-black print:text-4xl">Executive Strategic Briefing</h2>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold print:text-black/60">
                      AI-Synthesized for Board of Directors
                    </span>
                    <div className="w-1 h-1 rounded-full bg-primary print:hidden" />
                    <span className="text-[10px] text-primary/70 font-mono print:text-black/40">DS-REVISION: 1.0.4</span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-12 h-12 rounded-2xl hover:bg-secondary/50 flex items-center justify-center transition-all hover:rotate-90 print:hidden"
              >
                <X className="w-6 h-6 text-muted-foreground" />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-card/10 print:overflow-visible print:bg-transparent print:p-16">
              {isLoading ? (
                <div className="py-24 flex flex-col items-center justify-center space-y-6">
                  <div className="relative">
                    <Loader2 className="w-16 h-16 text-primary animate-spin" />
                    <Sparkles className="w-6 h-6 text-primary absolute -top-1 -right-1 animate-pulse" />
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-black text-foreground">Synthesizing Briefing...</p>
                    <p className="text-sm text-muted-foreground max-w-xs mx-auto">Gemini 1.5 is analyzing dashboard aggregates and trends</p>
                  </div>
                </div>
              ) : content ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="max-w-none print:text-black"
                >
                   {/* Strategic Scorecard */}
                   <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10 print:hidden">
                     {kpis.slice(0, 4).map((kpi, i) => (
                       <div key={i} className="p-4 rounded-2xl bg-secondary/5 border border-border/50 shadow-sm">
                         <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
                         <p className="text-lg font-black text-foreground mt-1">{kpi.value}</p>
                       </div>
                     ))}
                   </div>

                   {/* Strategic Visualization */}
                   {renderFailsafeChart()}

                   <div className="flex items-center gap-2 mb-10 bg-success/10 border border-success/20 px-4 py-3 rounded-2xl w-fit shadow-sm print:hidden">
                    <ShieldCheck className="w-5 h-5 text-success" />
                    <span className="text-[11px] font-black text-success uppercase tracking-widest">Verified Tactical Intelligence</span>
                  </div>

                  <div className="space-y-10 text-lg text-foreground/90 font-medium leading-relaxed font-sans subpixel-antialiased print:text-black print:text-xl">
                    {/* Render with much cleaner logic */}
                    {content.split('#').map((section, idx) => {
                      if (!section.trim()) return null;
                      const lines = section.trim().split('\n');
                      const title = lines[0];
                      const body = lines.slice(1).join('\n');
                      
                      return (
                        <div key={idx} className="group">
                          <h3 className="text-sm font-black text-primary uppercase tracking-[0.2em] mb-4 flex items-center gap-3">
                            <div className="w-8 h-[2px] bg-primary group-hover:w-12 transition-all print:bg-black" />
                            {title}
                          </h3>
                          <div className="text-foreground/80 pl-11 whitespace-pre-line group-hover:text-foreground transition-colors print:text-black print:pl-0">
                            {body}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-20 pt-10 border-t border-border/20 text-center flex items-center justify-between print:border-black/20 print:mt-12">
                     <p className="text-[10px] text-muted-foreground font-mono uppercase print:text-black/40">
                      Generated by DataInsight AI • {datasetName}
                    </p>
                     <p className="text-[10px] text-muted-foreground font-sans font-bold uppercase print:text-black/40">
                      Confidential • Board Access Only
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
            <div className="p-8 border-t border-border/40 bg-secondary/10 flex flex-col sm:flex-row items-center justify-between gap-6 print:hidden">
              <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                <CheckCircle2 className="w-5 h-5 text-success" />
                Confidence: Verified
              </div>
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <Button
                  variant="ghost"
                  onClick={() => handleExport('pdf')}
                  disabled={!!downloading || isLoading}
                  className="flex-1 sm:flex-none gap-2 rounded-xl h-12"
                >
                  <Printer className="w-4 h-4" />
                  PDF Report
                </Button>
                
                <Button
                  onClick={() => handleExport('doc')}
                  disabled={!!downloading || isLoading}
                  className="flex-1 sm:flex-none gap-2 glass-button hover:bg-primary/20 rounded-xl h-12 border border-primary/10 shadow-lg"
                >
                  {downloading === 'doc' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  {success && downloading === 'doc' ? 'Saved!' : 'Export Word'}
                </Button>

                <Button
                  onClick={() => handleExport('txt')}
                  disabled={!!downloading || isLoading}
                  className="flex-1 sm:flex-none gap-2 bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 rounded-xl h-12 px-6"
                >
                    <Download className="w-4 h-4" />
                    Download Briefing
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
