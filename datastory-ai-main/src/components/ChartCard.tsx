import { motion } from 'framer-motion';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend
} from 'recharts';
import { Info, BarChart3, TrendingUp, PieChart as PieIcon, AreaChart as AreaIcon } from 'lucide-react';
import type { ChartConfig } from '@/lib/dataEngine';

interface ChartCardProps {
  config: ChartConfig;
  data: Record<string, any>[];
  index: number;
  onFilter?: (column: string, value: any) => void;
}

const CHART_COLORS = [
  '#38BDF8', '#818CF8', '#10B981', '#06B6D4',
  '#A78BFA', '#34D399', '#60A5FA', '#C084FC',
];

const CHART_ICONS = {
  line: TrendingUp,
  bar: BarChart3,
  pie: PieIcon,
  area: AreaIcon,
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card/95 backdrop-blur-xl rounded-xl px-4 py-3 text-sm border border-border shadow-2xl">
      <p className="text-foreground font-semibold mb-1.5">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color || CHART_COLORS[0] }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="text-foreground font-medium">{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</span>
        </div>
      ))}
    </div>
  );
};

const ChartCard = ({ config, data, index, onFilter }: ChartCardProps) => {
  const title = config.title.replace(/(^|\s)\w/g, l => l.toUpperCase());
  const Icon = CHART_ICONS[config.type] || BarChart3;

  const handleClick = (state: any) => {
    if (state && state.activeLabel && onFilter) {
      onFilter(config.xAxis, state.activeLabel);
    } else if (state && state.name && onFilter) {
      onFilter(config.xAxis, state.name);
    }
  };

  const renderChart = () => {
    const gridStyle = { stroke: 'hsl(215, 14%, 13%)' };
    const tickStyle = { fill: 'hsl(215, 10%, 50%)', fontSize: 11, fontFamily: 'Inter' };

    switch (config.type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart 
              data={data} 
              margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
              onClick={handleClick}
            >
              <defs>
                <linearGradient id={`lineGrad-${index}`} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#38BDF8" />
                  <stop offset="100%" stopColor="#818CF8" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" {...gridStyle} />
              <XAxis dataKey="name" tick={tickStyle} axisLine={false} tickLine={false} />
              <YAxis tick={tickStyle} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke={`url(#lineGrad-${index})`}
                strokeWidth={3}
                dot={{ fill: '#38BDF8', r: 4, strokeWidth: 2, stroke: '#0A0D12' }}
                activeDot={{ r: 7, fill: '#38BDF8', stroke: '#0A0D12', strokeWidth: 3 }}
                className="cursor-pointer"
              />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart 
              data={data} 
              margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
              onClick={handleClick}
            >
              <defs>
                {data.map((_, i) => (
                  <linearGradient key={i} id={`barGrad-${index}-${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_COLORS[i % CHART_COLORS.length]} stopOpacity={1} />
                    <stop offset="100%" stopColor={CHART_COLORS[i % CHART_COLORS.length]} stopOpacity={0.6} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" {...gridStyle} />
              <XAxis dataKey="name" tick={tickStyle} axisLine={false} tickLine={false} />
              <YAxis tick={tickStyle} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="value" 
                radius={[8, 8, 0, 0]} 
                maxBarSize={60}
                className="cursor-pointer"
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={`url(#barGrad-${index}-${i})`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <defs>
                {data.map((_, i) => (
                  <linearGradient key={i} id={`pieGrad-${index}-${i}`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={CHART_COLORS[i % CHART_COLORS.length]} />
                    <stop offset="100%" stopColor={CHART_COLORS[(i + 1) % CHART_COLORS.length]} stopOpacity={0.7} />
                  </linearGradient>
                ))}
              </defs>
              <Tooltip content={<CustomTooltip />} />
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={110}
                innerRadius={60}
                strokeWidth={2}
                stroke="hsl(216, 28%, 3%)"
                paddingAngle={2}
                onClick={(entry) => onFilter?.(config.xAxis, entry.name)}
                className="cursor-pointer outline-none"
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={`url(#pieGrad-${index}-${i})`} />
                ))}
              </Pie>
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(value: string) => <span className="text-xs text-muted-foreground ml-1">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart 
              data={data} 
              margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
              onClick={handleClick}
            >
              <defs>
                <linearGradient id={`areaGrad-${index}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38BDF8" stopOpacity={0.4} />
                  <stop offset="50%" stopColor="#818CF8" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#818CF8" stopOpacity={0} />
                </linearGradient>
                <linearGradient id={`areaStroke-${index}`} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#38BDF8" />
                  <stop offset="100%" stopColor="#818CF8" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" {...gridStyle} />
              <XAxis dataKey="name" tick={tickStyle} axisLine={false} tickLine={false} />
              <YAxis tick={tickStyle} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke={`url(#areaStroke-${index})`}
                strokeWidth={2.5}
                fill={`url(#areaGrad-${index})`}
                className="cursor-pointer"
              />
            </AreaChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.15 + index * 0.1, type: 'spring', damping: 20 }}
      className="glass-card rounded-2xl p-6 card-hover"
    >
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Icon className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5 uppercase tracking-wider">
              {config.aggregation} • {config.type} chart
            </p>
          </div>
        </div>
        <div className="group relative">
          <div className="w-7 h-7 rounded-lg bg-secondary/50 flex items-center justify-center cursor-help hover:bg-secondary transition-colors">
            <Info className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
          <div className="absolute right-0 top-9 w-72 p-4 rounded-xl glass-card border border-border text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-xl">
            <p className="font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Chart Selection Reason
            </p>
            <p className="leading-relaxed">{config.reason}</p>
          </div>
        </div>
      </div>
      {renderChart()}
    </motion.div>
  );
};

export default ChartCard;
