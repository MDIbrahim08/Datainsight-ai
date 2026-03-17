import { motion } from 'framer-motion';
import { 
  Database, 
  Table as TableIcon, 
  Calendar, 
  Tags, 
  ArrowRight, 
  FileText,
  Rows,
  Columns
} from 'lucide-react';
import { type ParsedDataset } from '@/lib/dataEngine';
import { Button } from './ui/button';

interface DatasetIntelligenceProps {
  dataset: ParsedDataset;
  onContinue: () => void;
}

const DatasetIntelligence = ({ dataset, onContinue }: DatasetIntelligenceProps) => {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-8 pb-32">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dataset Intelligence</h1>
          <p className="text-muted-foreground mt-1">Exploration & structural overview of the active dataset.</p>
        </div>
        <Button onClick={onContinue} variant="solid" className="px-8 py-6 rounded-2xl group shadow-lg shadow-primary/10 transition-all hover:scale-[1.02]">
          Confirm & Ask Questions
          <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 1. Dataset Overview Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-1 grid grid-cols-1 gap-4"
        >
          <div className="glass-card p-6 rounded-2xl border border-border/40 bg-primary/5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Rows className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Total Rows</p>
              <p className="text-2xl font-black text-foreground">{dataset.rowCount.toLocaleString()}</p>
            </div>
          </div>
          
          <div className="glass-card p-6 rounded-2xl border border-border/40 bg-accent/5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <Columns className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Total Columns</p>
              <p className="text-2xl font-black text-foreground">{dataset.columnNames.length}</p>
            </div>
          </div>

          {dataset.metadata?.dateRange && (
            <div className="glass-card p-6 rounded-2xl border border-border/40 bg-emerald-500/5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Date Horizon</p>
                <p className="text-xs font-bold text-foreground">
                  {dataset.metadata.dateRange.min} — {dataset.metadata.dateRange.max}
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* 2. Column Table */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-3 glass-card rounded-2xl border border-border/40 overflow-hidden flex flex-col"
        >
          <div className="p-4 border-b border-border/40 flex items-center gap-2 bg-secondary/20">
            <Database className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Column Architecture</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-secondary/40 border-b border-border/20">
                  <th className="px-6 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Column Name</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Type</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Unique Values / Preview</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/10">
                {dataset.columns.map((col, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-foreground">{dataset.originalHeaders[i] || col.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                         <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-tighter border ${
                           col.type === 'numeric' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                           col.type === 'date' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                           'bg-amber-500/10 text-amber-500 border-amber-500/20'
                         }`}>
                           {col.type}
                         </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {col.type === 'categorical' && col.uniqueValues ? (
                        <div className="flex flex-wrap gap-1">
                          {col.uniqueValues.map((v, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded-full bg-secondary/50 text-muted-foreground text-[10px] font-medium border border-border/20">
                              {v}
                            </span>
                          ))}
                          {col.uniqueValues.length >= 5 && <span className="text-[10px] text-muted-foreground/50 ml-1">...</span>}
                        </div>
                      ) : (
                        <span className="text-[10px] italic text-muted-foreground/40">Continuous or specific values</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* 5. Sample Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card rounded-2xl border border-border/40 overflow-hidden"
      >
        <div className="p-4 border-b border-border/40 flex items-center justify-between bg-secondary/20">
          <div className="flex items-center gap-2">
            <TableIcon className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Raw Data Context (Top 5 Samples)</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-widest">Integrity Verified</span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary/40 border-b border-border/20">
                {dataset.originalHeaders.map(col => (
                  <th key={col} className="px-6 py-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/10">
              {dataset.rows.slice(0, 5).map((row, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors group">
                  {dataset.columnNames.map(col => (
                    <td key={col} className="px-6 py-4 text-xs text-foreground/70 group-hover:text-foreground whitespace-nowrap">
                      {typeof row[col] === 'number' ? row[col].toLocaleString() : String(row[col])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Goal Check List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-border/10">
        <div className="flex items-start gap-3">
          <div className="mt-1 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <Tags className="w-3 h-3 text-primary" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground">Category Clarity</h4>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Understanding labels before asking helps AI provide precise visual results.</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="mt-1 w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
            <Calendar className="w-3 h-3 text-emerald-500" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground">Date Horizontality</h4>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Know the temporal range to avoid empty queries outside dataset bounds.</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="mt-1 w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
            <FileText className="w-3 h-3 text-amber-500" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground">Architecture Awareness</h4>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Confirming column types ensures proper aggregation (Sum vs Avg) in charts.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatasetIntelligence;
