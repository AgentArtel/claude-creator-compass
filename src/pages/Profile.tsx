import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Download, ChevronDown, ChevronRight, Shield } from "lucide-react";
import { useProfileDimensions, getDimensionLabel, getDimensionColor, ALL_DIMENSIONS } from "@/hooks/useProfileDimensions";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Json } from "@/integrations/supabase/types";

const fadeUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
};

function renderJsonValue(value: Json, depth = 0): React.ReactNode {
  if (value === null || value === undefined) return <span className="text-muted-foreground">null</span>;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean")
    return <span className="text-foreground font-mono text-xs">{String(value)}</span>;
  if (Array.isArray(value))
    return (
      <div className="space-y-0.5" style={{ paddingLeft: depth > 0 ? 12 : 0 }}>
        {value.map((v, i) => (
          <div key={i} className="flex gap-2">
            <span className="text-muted-foreground text-xs font-mono">{i}.</span>
            {renderJsonValue(v, depth + 1)}
          </div>
        ))}
      </div>
    );
  if (typeof value === "object")
    return (
      <div className="space-y-1" style={{ paddingLeft: depth > 0 ? 12 : 0 }}>
        {Object.entries(value).map(([k, v]) => (
          <div key={k}>
            <span className="text-muted-foreground text-xs font-mono">{k}: </span>
            {renderJsonValue(v as Json, depth + 1)}
          </div>
        ))}
      </div>
    );
  return null;
}

function generateMarkdownExport(dimensions: ReturnType<typeof useProfileDimensions>["data"], type: string) {
  if (!dimensions?.length) return "";
  const lines = [`# ${type}\n`, `Generated: ${new Date().toISOString()}\n`];
  for (const dim of dimensions) {
    lines.push(`## ${getDimensionLabel(dim.dimension)}`);
    lines.push(`Confidence: ${Math.round(dim.confidence * 100)}% | Version: ${dim.version}\n`);
    lines.push("```json");
    lines.push(JSON.stringify(dim.value, null, 2));
    lines.push("```\n");
  }
  return lines.join("\n");
}

function downloadFile(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Profile() {
  const { data: dimensions, isLoading } = useProfileDimensions();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const completionPct = dimensions
    ? Math.round((new Set(dimensions.map((d) => d.dimension)).size / ALL_DIMENSIONS.length) * 100)
    : 0;

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!dimensions?.length) {
    return (
      <div className="max-w-7xl mx-auto">
        <motion.div {...fadeUp} className="text-center py-20 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
            <User className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Identity Profile</h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            No profile data yet. Process platform data to build your identity profile.
          </p>
        </motion.div>
      </div>
    );
  }

  // Group by dimension (take latest version per dimension)
  const byDimension = ALL_DIMENSIONS.map((dim) => {
    const matches = dimensions.filter((d) => d.dimension === dim);
    return matches.length ? matches.reduce((a, b) => (a.version > b.version ? a : b)) : null;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">Identity Profile</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {completionPct}% complete • {dimensions.length} dimension records
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadFile(generateMarkdownExport(dimensions, "SOUL.md"), "SOUL.md")}
            >
              <Download className="w-3.5 h-3.5" />
              SOUL.md
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadFile(generateMarkdownExport(dimensions, "USER.md"), "USER.md")}
            >
              <Download className="w-3.5 h-3.5" />
              USER.md
            </Button>
          </div>
        </div>
        <div className="mt-3">
          <Progress value={completionPct} className="h-1.5" />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {byDimension.map((dim, i) => {
          const dimKey = ALL_DIMENSIONS[i];
          const color = getDimensionColor(dimKey);
          const isExpanded = expandedId === dimKey;

          return (
            <motion.div
              key={dimKey}
              variants={fadeUp}
              initial="initial"
              animate="animate"
              transition={{ delay: i * 0.05 }}
              className={cn(
                "rounded-lg border border-border/50 bg-card overflow-hidden transition-colors",
                dim ? "cursor-pointer hover:border-border" : "opacity-40"
              )}
              onClick={() => dim && setExpandedId(isExpanded ? null : dimKey)}
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-sm font-medium text-foreground">
                      {getDimensionLabel(dimKey)}
                    </span>
                  </div>
                  {dim ? (
                    isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                    )
                  ) : (
                    <Shield className="w-3.5 h-3.5 text-muted-foreground/30" />
                  )}
                </div>
                {dim ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ backgroundColor: color, width: `${dim.confidence * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono text-muted-foreground">
                        {Math.round(dim.confidence * 100)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground">
                      <span>v{dim.version}</span>
                      <span>Updated {new Date(dim.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground/50">Not yet analyzed</p>
                )}
              </div>
              <AnimatePresence>
                {dim && isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-border/30 bg-muted/20 overflow-hidden"
                  >
                    <div className="p-4 max-h-64 overflow-y-auto">
                      {renderJsonValue(dim.value)}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
