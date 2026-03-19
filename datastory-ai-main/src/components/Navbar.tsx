import { motion } from 'framer-motion';
import { Upload, Database, Sparkles, RotateCcw, FileText, Volume2, VolumeX } from 'lucide-react';

import { Button } from './ui/button';

interface NavbarProps {
  datasetActive: boolean;
  datasetName?: string;
  rowCount?: number;
  colCount?: number;
  onUploadClick: () => void;
  onReset: () => void;
  onGenerateBriefing?: () => void;
  isResultsActive?: boolean;
  voiceEnabled?: boolean;
  onToggleVoice?: () => void;
}

const Navbar = ({ 
  datasetActive, 
  datasetName, 
  rowCount, 
  colCount, 
  onUploadClick, 
  onReset,
  onGenerateBriefing,
  isResultsActive,
  voiceEnabled,
  onToggleVoice
}: NavbarProps) => {
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
                  {rowCount?.toLocaleString()} rows
                </span>
              </div>
            </motion.div>
          )}

          {datasetActive && (
             <Button
                variant={voiceEnabled ? "solid" : "ghost"}
                onClick={onToggleVoice}
                className={`gap-2 font-bold px-4 ${voiceEnabled ? 'bg-primary/20 text-primary border border-primary/30 ring-2 ring-primary/20' : ''}`}
              >
                {voiceEnabled ? <Volume2 className="w-4 h-4 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
                <span className="hidden sm:inline">Voice Sync</span>
              </Button>
          )}

          {isResultsActive && onGenerateBriefing && (
             <Button
                onClick={onGenerateBriefing}
                className="gap-2 font-bold relative overflow-visible"
              >
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline text-white">Executive Briefing</span>
              </Button>
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
            <span className="hidden sm:inline">Upload</span>
          </Button>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
