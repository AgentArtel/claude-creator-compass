import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ExternalLink, ChevronRight, Upload, Play, CheckCircle2, Clock, X, Loader2 } from "lucide-react";
import { platformCategories, statusLabels, type Platform, type PlatformStatus } from "@/data/platforms";
import { usePlatforms } from "@/hooks/usePlatforms";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const statusSteps: PlatformStatus[] = ['not_started', 'exporting', 'uploaded', 'processing', 'indexed'];

const importStatusMap: Record<PlatformStatus, string> = {
  not_started: 'pending',
  exporting: 'exporting',
  uploaded: 'uploaded',
  processing: 'processing',
  indexed: 'processed',
};

function StatusBadge({ status }: { status: PlatformStatus }) {
  const colorMap: Record<PlatformStatus, string> = {
    not_started: 'bg-muted text-muted-foreground',
    exporting: 'bg-amber/10 text-amber border-amber/20',
    uploaded: 'bg-primary/10 text-primary border-primary/20',
    processing: 'bg-secondary/10 text-secondary border-secondary/20',
    indexed: 'bg-accent/10 text-accent border-accent/20',
  };
  return (
    <span className={cn("text-[10px] font-mono px-2 py-0.5 rounded-full border", colorMap[status])}>
      {statusLabels[status]}
    </span>
  );
}

function PlatformCard({ platform, onClick }: { platform: Platform; onClick: () => void }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-border/50 bg-card p-4 hover:border-border transition-all cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-md flex items-center justify-center text-lg border border-border/30"
            style={{ backgroundColor: `${platform.color}10` }}
          >
            {platform.icon}
          </div>
          <div>
            <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{platform.name}</div>
            <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{platform.category}</div>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
      </div>
      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{platform.description}</p>
      <div className="flex items-center justify-between">
        <StatusBadge status={platform.status} />
        <div className="flex items-center gap-1">
          <div className="h-1 w-12 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-primary" style={{ width: `${platform.insightPotential}%` }} />
          </div>
          <span className="text-[10px] font-mono text-muted-foreground">{platform.insightPotential}%</span>
        </div>
      </div>
    </motion.div>
  );
}

function PlatformDetail({ platform, onClose, onAdvanceStatus, onFileUpload }: {
  platform: Platform; onClose: () => void; onAdvanceStatus: () => void; onFileUpload: (file: File) => Promise<void>;
}) {
  const currentStep = statusSteps.indexOf(platform.status);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  const triggerUpload = async (file: File) => {
    setUploading(true);
    setUploadProgress(10);
    try {
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 15, 85));
      }, 300);
      await onFileUpload(file);
      clearInterval(progressInterval);
      setUploadProgress(100);
    } catch {
      // error handled by parent
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await triggerUpload(file);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await triggerUpload(file);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="rounded-lg border border-border/50 bg-card overflow-hidden"
    >
      <div className="p-5 border-b border-border/30">
        <div className="flex items-center justify-between mb-3">
          <button onClick={onClose} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to platforms
          </button>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl border border-border/30"
            style={{ backgroundColor: `${platform.color}15` }}
          >
            {platform.icon}
          </div>
          <div>
            <h2 className="text-lg font-heading font-bold text-foreground">{platform.name}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-mono text-muted-foreground uppercase">{platform.category}</span>
              <StatusBadge status={platform.status} />
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-5">
        <div>
          <h3 className="text-xs font-heading font-semibold text-foreground uppercase tracking-wider mb-3">Pipeline Status</h3>
          <div className="flex items-center gap-1">
            {statusSteps.map((step, i) => (
              <div key={step} className="flex items-center gap-1 flex-1">
                <div className={cn(
                  "h-1.5 flex-1 rounded-full transition-colors",
                  i <= currentStep ? "bg-primary" : "bg-muted"
                )} />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-1.5">
            {statusSteps.map((step) => (
              <span key={step} className="text-[9px] font-mono text-muted-foreground capitalize">{step.replace('_', ' ')}</span>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-heading font-semibold text-foreground uppercase tracking-wider mb-2">About</h3>
          <p className="text-sm text-muted-foreground">{platform.description}</p>
        </div>

        <div>
          <h3 className="text-xs font-heading font-semibold text-foreground uppercase tracking-wider mb-2">Data Types</h3>
          <div className="flex flex-wrap gap-1.5">
            {platform.dataTypes.map(dt => (
              <Badge key={dt} variant="outline" className="text-[10px] font-mono">{dt}</Badge>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-heading font-semibold text-foreground uppercase tracking-wider mb-2">Export Instructions</h3>
          <ol className="space-y-1">
            {platform.exportInstructions.map((step, i) => (
              <li key={i} className="text-xs text-muted-foreground flex gap-2">
                <span className="font-mono text-primary">{i + 1}.</span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        <div>
          <h3 className="text-xs font-heading font-semibold text-foreground uppercase tracking-wider mb-2">Analysis Capabilities</h3>
          <div className="flex flex-wrap gap-1.5">
            {platform.analysisCapabilities.map(cap => (
              <span key={cap} className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-secondary/10 text-secondary border border-secondary/20">{cap}</span>
            ))}
          </div>
        </div>

        {uploading && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Uploading...
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
        />

        <Button
          className="w-full"
          onClick={handleActionClick}
          disabled={platform.status === 'indexed' || platform.status === 'processing' || uploading}
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <action.icon className="w-4 h-4" />}
          {uploading ? 'Uploading...' : action.label}
        </Button>
      </div>
    </motion.div>
  );
}

export default function Platforms() {
  const { data: platformData = [], isLoading } = usePlatforms();
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('All');

  const selected = platformData.find(p => p.id === selectedId) || null;

  const advanceStatus = useCallback(async () => {
    if (!selectedId) return;
    const platform = platformData.find(p => p.id === selectedId);
    if (!platform) return;
    const idx = statusSteps.indexOf(platform.status);
    if (idx >= statusSteps.length - 1) return;
    const nextStatus = statusSteps[idx + 1];
    const dbStatus = importStatusMap[nextStatus];

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (platform.status === 'not_started') {
      await supabase.from('platform_imports').insert({
        platform_id: platform.id,
        user_id: user.id,
        status: dbStatus as any,
      });
    } else {
      // Update latest import
      const { data: imports } = await supabase
        .from('platform_imports')
        .select('id')
        .eq('platform_id', platform.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (imports?.[0]) {
        await supabase
          .from('platform_imports')
          .update({ status: dbStatus as any })
          .eq('id', imports[0].id);
      }
    }

    queryClient.invalidateQueries({ queryKey: ['platforms'] });
  }, [selectedId, platformData, queryClient]);

  const handleFileUpload = useCallback(async (file: File) => {
    if (!selectedId) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error('You must be logged in'); return; }

    const filePath = `${user.id}/${selectedId}/${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from('data-exports')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast.error(`Upload failed: ${uploadError.message}`);
      throw uploadError;
    }

    // Find the latest import row for this platform
    const { data: imports } = await supabase
      .from('platform_imports')
      .select('id')
      .eq('platform_id', selectedId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1);

    if (imports?.[0]) {
      await supabase
        .from('platform_imports')
        .update({
          status: 'uploaded' as any,
          file_path: filePath,
          file_size_bytes: file.size,
        })
        .eq('id', imports[0].id);
    }

    queryClient.invalidateQueries({ queryKey: ['platforms'] });
    toast.success(`${file.name} uploaded successfully`);
  }, [selectedId, queryClient]);

  const filtered = filterCategory === 'All'
    ? platformData
    : platformData.filter(p => p.category === filterCategory);

  const grouped = platformCategories.reduce((acc, cat) => {
    const items = filtered.filter(p => p.category === cat);
    if (items.length) acc.push({ category: cat, items });
    return acc;
  }, [] as { category: string; items: Platform[] }[]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div><Skeleton className="h-8 w-48" /><Skeleton className="h-4 w-64 mt-2" /></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-lg" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-heading font-bold text-foreground">Data Platforms</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {platformData.length} platforms • {platformData.filter(p => p.status === 'indexed').length} indexed • {platformData.filter(p => p.status !== 'not_started').length} active
        </p>
      </motion.div>

      <div className="flex items-center gap-1.5 flex-wrap">
        {['All', ...platformCategories].map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={cn(
              "px-3 py-1 text-xs font-mono rounded-full border transition-colors capitalize",
              filterCategory === cat
                ? "bg-primary/10 border-primary/30 text-primary"
                : "border-border/50 text-muted-foreground hover:text-foreground hover:border-border"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className={cn("space-y-6", selected ? "col-span-12 lg:col-span-7" : "col-span-12")}>
          {grouped.map(({ category, items }) => (
            <div key={category}>
              <h2 className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wider mb-3">{category}</h2>
              <div className={cn("grid gap-3", selected ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3")}>
                {items.map(p => (
                  <PlatformCard key={p.id} platform={p} onClick={() => setSelectedId(p.id)} />
                ))}
              </div>
            </div>
          ))}
        </div>

        <AnimatePresence>
          {selected && (
            <div className="col-span-12 lg:col-span-5">
              <div className="sticky top-20">
                <PlatformDetail
                  platform={selected}
                  onClose={() => setSelectedId(null)}
                  onAdvanceStatus={advanceStatus}
                  onFileUpload={handleFileUpload}
                />
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
