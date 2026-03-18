import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileSpreadsheet, X, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';

interface FileUploadModalProps {
  open: boolean;
  onClose: () => void;
  onFileLoaded: (text: string, fileName: string) => void;
  error?: string | null;
}

const FileUploadModal = ({ open, onClose, onFileLoaded, error }: FileUploadModalProps) => {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    const isJson = file.name.toLowerCase().endsWith('.json');
    const isExcel = file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls');
    const isCsv = file.name.toLowerCase().endsWith('.csv');

    if (!isJson && !isExcel && !isCsv) {
      alert("Please upload a CSV, JSON, or Excel file.");
      return;
    }

    reader.onload = (e) => {
      let content = e.target?.result as string;
      
      // If JSON, we might want to pre-process it or just pass it as string
      // Our dataEngine.parseCSV will be updated to handle JSON detection
      onFileLoaded(content, file.name);
    };

    if (isExcel) {
       // For Excel we need to read as array buffer (will add library later)
       reader.readAsArrayBuffer(file);
    } else {
       reader.readAsText(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md relative"
            >
            <div className="glass-card rounded-2xl p-6 border border-border">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-foreground">Upload Dataset</h2>
                <Button 
                   onClick={onClose} 
                  variant="ghost" 
                  size="sm" 
                  className="rounded-lg text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div
                onDrop={handleDrop}
                onDragOver={e => e.preventDefault()}
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-border hover:border-primary/50 rounded-xl p-10 text-center cursor-pointer transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <FileSpreadsheet className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">Drop your file here</p>
                <p className="text-xs text-muted-foreground">CSV, Excel (.xlsx), or JSON</p>
              </div>

              <input
                ref={fileRef}
                type="file"
                accept=".csv,.json,.xlsx,.xls"
                onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
                className="hidden"
              />

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 flex items-start gap-2 text-destructive text-sm bg-destructive/10 rounded-lg p-3"
                >
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  {error}
                </motion.div>
              )}

            </div>
          </motion.div>
        </div>
      </>
    )}
      </AnimatePresence>
    );
  };
  
  export default FileUploadModal;
