import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { KPI } from '@/lib/dataEngine';

interface KPICardsProps {
  kpis: KPI[];
}

const KPICards = ({ kpis }: KPICardsProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {kpis.map((kpi, i) => (
        <motion.div
          key={kpi.label}
          initial={{ opacity: 0, y: 25, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, delay: i * 0.08, type: 'spring', damping: 20 }}
          className="glass-card rounded-2xl p-5 card-hover group"
        >
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.1em] mb-3">
            {kpi.label}
          </p>
          <div className="flex items-end justify-between">
            <p className="text-3xl font-extrabold text-foreground tracking-tight">{kpi.value}</p>
            {kpi.change && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 + i * 0.1, type: 'spring' }}
                className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${
                  kpi.trend === 'up' ? 'text-success bg-success/10' :
                  kpi.trend === 'down' ? 'text-destructive bg-destructive/10' :
                  'text-muted-foreground bg-secondary/50'
                }`}
              >
                {kpi.trend === 'up' ? <TrendingUp className="w-3 h-3" /> :
                 kpi.trend === 'down' ? <TrendingDown className="w-3 h-3" /> :
                 <Minus className="w-3 h-3" />}
                {kpi.change}
              </motion.div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default KPICards;
