import { motion } from "framer-motion";
import { 
  Globe, Database as DatabaseIcon, UserCheck, Zap, 
  ArrowUpRight, Clock, Server, Activity
} from "lucide-react";
import { identityDimensions, systemStatus } from "@/data/dashboard";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { usePlatforms } from "@/hooks/usePlatforms";
import { cn } from "@/lib/utils";
import { MockData } from "@/components/MockData";
import { Skeleton } from "@/components/ui/skeleton";

const fadeUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
};

function StatCard({ icon: Icon, label, value, suffix, color, delay, loading }: {
  icon: React.ElementType; label: string; value: number | string; suffix?: string; color: string; delay: number; loading?: boolean;
}) {
  return (
    <motion.div
      variants={fadeUp}
      initial="initial"
      animate="animate"
      transition={{ delay, duration: 0.4 }}
      className="rounded-lg border border-border/50 bg-card p-4 hover:border-border transition-colors"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={cn("w-8 h-8 rounded-md flex items-center justify-center")} style={{ backgroundColor: `${color}15`, color }}>
          <Icon className="w-4 h-4" />
        </div>
        <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground" />
      </div>
      {loading ? (
        <Skeleton className="h-8 w-20 mb-1" />
      ) : (
        <div className="font-heading text-2xl font-bold text-foreground">
          {value}{suffix}
        </div>
      )}
      <div className="text-xs text-muted-foreground mt-0.5 font-mono uppercase tracking-wider">
        {label}
      </div>
    </motion.div>
  );
}

function DimensionBar({ label, value, color, delay }: {
  label: string; value: number; color: string; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="space-y-1.5"
    >
      <div className="flex justify-between items-center">
        <span className="text-xs text-muted-foreground"><MockData>{label}</MockData></span>
        <span className="text-xs font-mono text-foreground"><MockData>{value}%</MockData></span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ delay: delay + 0.2, duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const { data: platforms = [], isLoading: platformsLoading } = usePlatforms();
  const { data: dashData, isLoading: statsLoading } = useDashboardStats();
  const topPlatforms = platforms.filter(p => p.status !== 'not_started').slice(0, 9);

  const stats = dashData?.stats;
  const knowledgeBase = dashData?.knowledgeBase;
  const queue = dashData?.queue ?? [];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl font-heading font-bold text-foreground">Identity Map</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your unified digital identity intelligence overview
        </p>
      </motion.div>

      <div className="grid grid-cols-12 gap-6">
        {/* Main content - 8 cols */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={Globe} label="Platforms Connected" value={stats?.platformsConnected ?? 0} color="hsl(217, 91%, 60%)" delay={0.05} loading={statsLoading} />
            <StatCard icon={DatabaseIcon} label="Sources Processed" value={stats?.dataSourcesProcessed ?? 0} color="hsl(263, 70%, 50%)" delay={0.1} loading={statsLoading} />
            <StatCard icon={UserCheck} label="Profile Completion" value={stats?.profileCompletion ?? 0} suffix="%" color="hsl(160, 84%, 39%)" delay={0.15} loading={statsLoading} />
            <StatCard icon={Zap} label="Knowledge Vectors" value={(stats?.knowledgeVectors ?? 0).toLocaleString()} color="hsl(36, 100%, 44%)" delay={0.2} loading={statsLoading} />
          </div>

          {/* Identity Dimensions */}
          <motion.div
            variants={fadeUp} initial="initial" animate="animate" transition={{ delay: 0.25 }}
            className="rounded-lg border border-border/50 bg-card p-5"
          >
            <h2 className="text-sm font-heading font-semibold text-foreground mb-4">Identity Dimensions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
              {identityDimensions.map((dim, i) => (
                <DimensionBar key={dim.label} {...dim} delay={0.3 + i * 0.05} />
              ))}
            </div>
          </motion.div>

          {/* Platform Grid */}
          <motion.div
            variants={fadeUp} initial="initial" animate="animate" transition={{ delay: 0.5 }}
            className="rounded-lg border border-border/50 bg-card p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-heading font-semibold text-foreground">Data Sources</h2>
              <a href="/platforms" className="text-xs text-primary hover:underline">View all →</a>
            </div>
            {platformsLoading ? (
              <div className="grid grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-md" />)}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {topPlatforms.map((platform) => (
                  <div
                    key={platform.id}
                    className="rounded-md border border-border/30 bg-muted/30 p-3 hover:border-border/60 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{platform.icon}</span>
                      <span className="text-xs font-medium text-foreground truncate">{platform.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: platform.status === 'indexed' ? 'hsl(160, 84%, 39%)' : platform.status === 'processing' ? 'hsl(263, 70%, 50%)' : 'hsl(36, 100%, 44%)' }}
                        />
                        <span className="text-[10px] font-mono text-muted-foreground capitalize">
                          {platform.status.replace('_', ' ')}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground">{platform.insightPotential}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Right Sidebar - 4 cols */}
        <div className="col-span-12 lg:col-span-4 space-y-5">
          {/* System Status */}
          <motion.div
            variants={fadeUp} initial="initial" animate="animate" transition={{ delay: 0.3 }}
            className="rounded-lg border border-border/50 bg-card p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <Server className="w-3.5 h-3.5 text-primary" />
              <h3 className="text-xs font-heading font-semibold text-foreground uppercase tracking-wider">System Status</h3>
            </div>
            <div className="space-y-2.5">
              {Object.entries(systemStatus).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span className="text-xs font-mono text-foreground"><MockData>{value}</MockData></span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Processing Queue */}
          <motion.div
            variants={fadeUp} initial="initial" animate="animate" transition={{ delay: 0.4 }}
            className="rounded-lg border border-border/50 bg-card p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-3.5 h-3.5 text-secondary" />
              <h3 className="text-xs font-heading font-semibold text-foreground uppercase tracking-wider">Processing Queue</h3>
            </div>
            {statsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-8" />)}
              </div>
            ) : queue.length === 0 ? (
              <p className="text-xs text-muted-foreground">No items in queue</p>
            ) : (
              <div className="space-y-3">
                {queue.map((item, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-foreground">{item.source}</span>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {item.status === 'processing' ? `${item.progress}%` : item.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="h-1 rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          item.status === 'processing' ? "bg-secondary" : "bg-muted-foreground/20"
                        )}
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Knowledge Base Stats */}
          <motion.div
            variants={fadeUp} initial="initial" animate="animate" transition={{ delay: 0.5 }}
            className="rounded-lg border border-border/50 bg-card p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <DatabaseIcon className="w-3.5 h-3.5 text-accent" />
              <h3 className="text-xs font-heading font-semibold text-foreground uppercase tracking-wider">Knowledge Base</h3>
            </div>
            {statsLoading ? (
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(knowledgeBase ?? { vectorChunks: 0, platforms: 0, dateRange: 'No data', dimensions: 1536 }).map(([key, value]) => (
                  <div key={key}>
                    <div className="text-lg font-heading font-bold text-foreground">
                      {typeof value === 'number' ? value.toLocaleString() : value}
                    </div>
                    <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Quick actions */}
          <motion.div
            variants={fadeUp} initial="initial" animate="animate" transition={{ delay: 0.55 }}
            className="rounded-lg border border-primary/20 bg-primary/5 p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-3.5 h-3.5 text-primary" />
              <h3 className="text-xs font-heading font-semibold text-primary uppercase tracking-wider">Next Steps</h3>
            </div>
            <ul className="space-y-1.5">
              <li className="text-xs text-muted-foreground"><MockData>• Upload LinkedIn data export</MockData></li>
              <li className="text-xs text-muted-foreground"><MockData>• Process YouTube watch history</MockData></li>
              <li className="text-xs text-muted-foreground"><MockData>• Connect Notion workspace</MockData></li>
              <li className="text-xs text-muted-foreground"><MockData>• Run identity profile v0.4</MockData></li>
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
