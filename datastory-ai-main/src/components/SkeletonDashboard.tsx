import { motion } from 'framer-motion';

const SkeletonDashboard = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPI Skeletons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass-card rounded-2xl p-5">
            <div className="skeleton-shimmer h-3 w-24 rounded-md mb-4" />
            <div className="skeleton-shimmer h-8 w-20 rounded-md" />
          </div>
        ))}
      </div>

      {/* Insight Skeleton */}
      <div className="glass-card rounded-2xl p-5 flex items-start gap-4">
        <div className="skeleton-shimmer w-10 h-10 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2.5">
          <div className="skeleton-shimmer h-3 w-32 rounded-md" />
          <div className="skeleton-shimmer h-3 w-full rounded-md" />
          <div className="skeleton-shimmer h-3 w-3/4 rounded-md" />
        </div>
      </div>

      {/* Chart Skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[...Array(2)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15 }}
            className="glass-card rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="skeleton-shimmer w-9 h-9 rounded-xl" />
              <div>
                <div className="skeleton-shimmer h-4 w-36 rounded-md mb-2" />
                <div className="skeleton-shimmer h-3 w-20 rounded-md" />
              </div>
            </div>
            <div className="skeleton-shimmer h-[300px] w-full rounded-xl" />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SkeletonDashboard;
