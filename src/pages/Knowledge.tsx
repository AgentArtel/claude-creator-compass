import { useState } from "react";
import { motion } from "framer-motion";
import { Database as DatabaseIcon, Search, Filter, FileText } from "lucide-react";
import { useKnowledgeChunks, useKnowledgeStats } from "@/hooks/useKnowledgeBase";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const fadeUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
};

export default function Knowledge() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [platformFilter, setPlatformFilter] = useState("");
  const [chunkTypeFilter, setChunkTypeFilter] = useState("");
  const [page, setPage] = useState(0);

  const { data: stats, isLoading: statsLoading } = useKnowledgeStats();
  const { data: chunkData, isLoading: chunksLoading } = useKnowledgeChunks({
    search: debouncedSearch,
    platformFilter,
    chunkTypeFilter,
    page,
  });

  // Simple debounce on Enter
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setDebouncedSearch(search);
      setPage(0);
    }
  };

  const totalPages = chunkData ? Math.ceil(chunkData.total / 50) : 0;

  if (statsLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats || stats.totalChunks === 0) {
    return (
      <div className="max-w-7xl mx-auto">
        <motion.div {...fadeUp} className="text-center py-20 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto">
            <DatabaseIcon className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Knowledge Base</h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            No knowledge chunks yet. Process platform data to populate your knowledge base.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-heading font-bold text-foreground">Knowledge Base</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {stats.totalChunks.toLocaleString()} vectors across {stats.uniquePlatforms} platforms
        </p>
      </motion.div>

      {/* Stats bar */}
      <motion.div variants={fadeUp} initial="initial" animate="animate" className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Chunks", value: stats.totalChunks.toLocaleString() },
          { label: "Platforms", value: stats.uniquePlatforms },
          { label: "Total Tokens", value: stats.totalTokens.toLocaleString() },
          { label: "Date Range", value: stats.dateRange },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-border/50 bg-card p-4">
            <div className="text-lg font-heading font-bold text-foreground">{s.value}</div>
            <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{s.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search knowledge chunks... (press Enter)"
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
        </div>
        <div className="flex gap-2">
          {stats.chunkTypes.length > 1 && (
            <div className="flex gap-1 items-center">
              <Filter className="w-3.5 h-3.5 text-muted-foreground" />
              {stats.chunkTypes.map((ct) => (
                <button
                  key={ct}
                  onClick={() => { setChunkTypeFilter(chunkTypeFilter === ct ? "" : ct); setPage(0); }}
                  className={cn(
                    "px-2 py-1 text-[10px] font-mono rounded-full border transition-colors",
                    chunkTypeFilter === ct
                      ? "bg-primary/10 border-primary/30 text-primary"
                      : "border-border/50 text-muted-foreground hover:text-foreground"
                  )}
                >
                  {ct}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chunks list */}
      <div className="space-y-2">
        {chunksLoading ? (
          Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)
        ) : !chunkData?.chunks.length ? (
          <div className="text-center py-10 text-sm text-muted-foreground">No chunks match your search.</div>
        ) : (
          chunkData.chunks.map((chunk) => (
            <motion.div
              key={chunk.id}
              variants={fadeUp}
              initial="initial"
              animate="animate"
              className="rounded-lg border border-border/50 bg-card p-4 hover:border-border transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground line-clamp-2 mb-2">{chunk.content}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {chunk.platform_id && (
                      <Badge variant="outline" className="text-[10px] font-mono">{chunk.platform_id}</Badge>
                    )}
                    <Badge variant="outline" className="text-[10px] font-mono">{chunk.chunk_type}</Badge>
                    {chunk.token_count && (
                      <span className="text-[10px] font-mono text-muted-foreground">{chunk.token_count} tokens</span>
                    )}
                  </div>
                </div>
                <div className="text-[10px] font-mono text-muted-foreground whitespace-nowrap">
                  {new Date(chunk.created_at).toLocaleDateString()}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>
            Previous
          </Button>
          <span className="text-xs font-mono text-muted-foreground">
            {page + 1} / {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
