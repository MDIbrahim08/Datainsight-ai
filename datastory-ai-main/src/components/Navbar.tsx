import { motion } from 'framer-motion';
import { Upload, Database, Sparkles, RotateCcw } from 'lucide-react';

import { Button } from './ui/button';

interface NavbarProps {
  datasetActive: boolean;
  datasetName?: string;
  rowCount?: number;
  colCount?: number;
  onUploadClick: () => void;
  onReset: () => void;
}

const Navbar = ({ datasetActive, datasetName, rowCount, colCount, onUploadClick, onReset }: NavbarProps) => {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="fixed top-0 left-0 right-0 z-50 glass-navbar"
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-primary/20 shadow-lg shadow-primary/10 flex-shrink-0">
            <img
              src="/logo.png"
              alt="DataInsight AI Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold tracking-tight text-foreground">DataInsight</span>
            <span className="gradient-text text-lg font-extrabold">AI</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 ml-3 px-2.5 py-1 rounded-md bg-secondary/40 border border-border/30">
            <Sparkles className="w-3 h-3 text-primary/70" />
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Gemini Powered</span>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {datasetActive && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 15 }}
              className="hidden sm:flex items-center gap-2.5 px-4 py-2 rounded-xl bg-success/8 border border-success/15"
            >
              <div className="relative">
                <div className="w-2 h-2 rounded-full bg-success" />
                <div className="w-2 h-2 rounded-full bg-success absolute inset-0 animate-ping opacity-75" />
              </div>
              <div className="flex items-center gap-1.5">
                <Database className="w-3 h-3 text-success/70" />
                <span className="text-xs font-semibold text-success">
                  {datasetName}
                </span>
                <span className="text-[10px] text-success/60">
                  {rowCount?.toLocaleString()} rows • {colCount} cols
                </span>
              </div>
            </motion.div>
          )}
          
          {datasetActive && (
            <Button
              variant="ghost"
              onClick={onReset}
              className="gap-2 font-medium"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
          )}

          <Button
            onClick={onUploadClick}
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Upload CSV</span>
          </Button>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
