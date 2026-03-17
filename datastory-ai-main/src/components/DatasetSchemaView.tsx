import React from 'react';
import { motion } from 'framer-motion';
import { Database, Table, Calendar, List, CheckCircle2 } from 'lucide-react';

interface ColumnDetail {
  name: string;
  type: string;
  unique_values: string[];
}

interface SchemaData {
  type: "schema";
  columns: string[];
  row_count: number;
  column_details: ColumnDetail[];
  date_range: Record<string, [string, string]>;
  sample_data: Record<string, any>[];
}

interface DatasetSchemaViewProps {
  data: string; // The JSON string insight
}

export const DatasetSchemaView = ({ data }: DatasetSchemaViewProps) => {
  let schema: SchemaData;
  try {
    schema = JSON.parse(data);
    if (schema.type !== 'schema') return null;
  } catch {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Overview Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-6 rounded-2xl border border-border/50"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <Database className="w-5 h-5 text-blue-500" />
            </div>
            <h3 className="font-bold text-lg">Dataset Overview</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-secondary/30 border border-border/30">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Total Rows</p>
              <p className="text-2xl font-bold text-foreground">{schema.row_count.toLocaleString()}</p>
            </div>
            <div className="p-4 rounded-xl bg-secondary/30 border border-border/30">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Total Columns</p>
              <p className="text-2xl font-bold text-foreground">{schema.columns.length}</p>
            </div>
          </div>
        </motion.div>

        {/* Date Range Card */}
        {Object.keys(schema.date_range).length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6 rounded-2xl border border-border/50"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <Calendar className="w-5 h-5 text-purple-500" />
              </div>
              <h3 className="font-bold text-lg">Timeline Coverage</h3>
            </div>
            {Object.entries(schema.date_range).map(([col, [start, end]]) => (
              <div key={col} className="space-y-3">
                <p className="text-sm font-medium text-foreground capitalize">{col.replace(/_/g, ' ')}</p>
                <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/30">
                  <div className="text-center flex-1">
                    <p className="text-[10px] text-muted-foreground uppercase mb-1">Start Date</p>
                    <p className="text-sm font-bold">{start}</p>
                  </div>
                  <div className="h-4 w-px bg-border/50" />
                  <div className="text-center flex-1">
                    <p className="text-[10px] text-muted-foreground uppercase mb-1">End Date</p>
                    <p className="text-sm font-bold">{end}</p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Column Details Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card rounded-2xl border border-border/50 overflow-hidden"
      >
        <div className="p-6 border-b border-border/50 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-green-500/10 border border-green-500/20">
            <Table className="w-5 h-5 text-green-500" />
          </div>
          <h3 className="font-bold text-lg">Column Architecture</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-secondary/20">
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Column Name</th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Data Type</th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Unique Snippets</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {schema.column_details.map((col, idx) => (
                <tr key={idx} className="hover:bg-secondary/10 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-foreground bg-secondary/30 px-2 py-1 rounded-md">
                      {col.name}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        col.type === 'int/float' ? 'bg-blue-500' : 
                        col.type === 'datetime' ? 'bg-purple-500' : 'bg-orange-500'
                      }`} />
                      <span className="text-xs font-medium text-muted-foreground uppercase">{col.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {col.unique_values.map((val, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-border/20 text-muted-foreground border border-border/30">
                          {val}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Raw Data Preview (First 5 Rows) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card rounded-2xl border border-border/50 overflow-hidden mt-8"
      >
        <div className="p-6 border-b border-border/50 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20">
            <Table className="w-5 h-5 text-orange-500" />
          </div>
          <h3 className="font-bold text-lg">Raw Data Preview (First 5 Records)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="bg-secondary/20">
                {schema.columns.map((col, i) => (
                  <th key={i} className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {schema.sample_data.map((row, i) => (
                <tr key={i} className="hover:bg-secondary/10 transition-colors">
                  {schema.columns.map((col, j) => (
                    <td key={j} className="px-6 py-4 text-sm text-muted-foreground">
                      {String(row[col] ?? '-')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};
