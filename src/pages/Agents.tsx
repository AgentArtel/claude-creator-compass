import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Plus, ArrowLeft, X, Code, Sparkles } from "lucide-react";
import { useAgents, useCreateAgent, useUpdateAgent, type AgentConfig } from "@/hooks/useAgents";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { Json } from "@/integrations/supabase/types";

const fadeUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
};

function AgentCard({ agent, onClick }: { agent: AgentConfig; onClick: () => void }) {
  const updateAgent = useUpdateAgent();
  const modelConfig = agent.model_config as Record<string, Json>;

  return (
    <motion.div
      layout
      variants={fadeUp}
      initial="initial"
      animate="animate"
      className="rounded-lg border border-border/50 bg-card p-4 hover:border-border transition-all cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-md flex items-center justify-center bg-secondary/10 border border-secondary/20">
            <Bot className="w-4 h-4 text-secondary" />
          </div>
          <div>
            <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{agent.name}</div>
            <div className="text-[10px] font-mono text-muted-foreground">
              {String(modelConfig?.model ?? "unknown")} • t={String(modelConfig?.temperature ?? "0.7")}
            </div>
          </div>
        </div>
        <Switch
          checked={agent.is_active}
          onCheckedChange={(checked) => {
            updateAgent.mutate({ id: agent.id, is_active: checked });
          }}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{agent.description || "No description"}</p>
      <div className="flex items-center gap-1.5">
        <Badge variant="outline" className="text-[10px] font-mono">
          {agent.is_active ? "Active" : "Inactive"}
        </Badge>
      </div>
    </motion.div>
  );
}

function AgentDetail({ agent, onClose }: { agent: AgentConfig; onClose: () => void }) {
  const modelConfig = agent.model_config as Record<string, Json>;
  const personality = agent.personality as Record<string, Json>;
  const ragFilter = agent.rag_filter as Record<string, Json>;

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
            Back to agents
          </button>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-secondary/10 border border-secondary/20">
            <Bot className="w-6 h-6 text-secondary" />
          </div>
          <div>
            <h2 className="text-lg font-heading font-bold text-foreground">{agent.name}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-mono text-muted-foreground">
                {String(modelConfig?.model ?? "unknown")}
              </span>
              <Badge variant="outline" className="text-[10px]">{agent.is_active ? "Active" : "Inactive"}</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-5 max-h-[calc(100vh-16rem)] overflow-y-auto">
        {agent.description && (
          <div>
            <h3 className="text-xs font-heading font-semibold text-foreground uppercase tracking-wider mb-2">Description</h3>
            <p className="text-sm text-muted-foreground">{agent.description}</p>
          </div>
        )}

        <div>
          <h3 className="text-xs font-heading font-semibold text-foreground uppercase tracking-wider mb-2">
            <Code className="w-3.5 h-3.5 inline mr-1" />
            System Prompt
          </h3>
          <pre className="text-xs font-mono text-muted-foreground bg-muted/30 border border-border/30 rounded-md p-3 whitespace-pre-wrap max-h-48 overflow-y-auto">
            {agent.system_prompt || "(empty)"}
          </pre>
        </div>

        <div>
          <h3 className="text-xs font-heading font-semibold text-foreground uppercase tracking-wider mb-2">Model Config</h3>
          <div className="space-y-1">
            {Object.entries(modelConfig).map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span className="text-xs text-muted-foreground font-mono">{k}</span>
                <span className="text-xs text-foreground font-mono">{String(v)}</span>
              </div>
            ))}
          </div>
        </div>

        {Object.keys(personality).length > 0 && (
          <div>
            <h3 className="text-xs font-heading font-semibold text-foreground uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 inline mr-1" />
              Personality
            </h3>
            <div className="space-y-1">
              {Object.entries(personality).map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-xs text-muted-foreground font-mono">{k}</span>
                  <span className="text-xs text-foreground font-mono">{typeof v === "object" ? JSON.stringify(v) : String(v)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {Object.keys(ragFilter).length > 0 && (
          <div>
            <h3 className="text-xs font-heading font-semibold text-foreground uppercase tracking-wider mb-2">RAG Filter</h3>
            <pre className="text-xs font-mono text-muted-foreground bg-muted/30 border border-border/30 rounded-md p-3 whitespace-pre-wrap">
              {JSON.stringify(ragFilter, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function NewAgentDialog() {
  const createAgent = useCreateAgent();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [model, setModel] = useState("gemini-3-flash-preview");

  const handleCreate = () => {
    if (!name.trim()) return;
    createAgent.mutate(
      {
        name: name.trim(),
        description: description.trim() || null,
        system_prompt: systemPrompt,
        model_config: { model, temperature: 0.7 },
      },
      {
        onSuccess: () => {
          setOpen(false);
          setName("");
          setDescription("");
          setSystemPrompt("");
          setModel("gemini-3-flash-preview");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="w-3.5 h-3.5" />
          New Agent
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">Create Agent</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1 block">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Agent name" />
          </div>
          <div>
            <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1 block">Description</label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description" />
          </div>
          <div>
            <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1 block">Model</label>
            <Input value={model} onChange={(e) => setModel(e.target.value)} placeholder="gemini-3-flash-preview" />
          </div>
          <div>
            <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1 block">System Prompt</label>
            <Textarea value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} placeholder="You are..." rows={5} />
          </div>
          <Button className="w-full" onClick={handleCreate} disabled={!name.trim() || createAgent.isPending}>
            {createAgent.isPending ? "Creating..." : "Create Agent"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Agents() {
  const { data: agents, isLoading } = useAgents();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = agents?.find((a) => a.id === selectedId) ?? null;

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!agents?.length) {
    return (
      <div className="max-w-7xl mx-auto">
        <motion.div {...fadeUp} className="text-center py-20 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center mx-auto">
            <Bot className="w-8 h-8 text-secondary" />
          </div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Agents</h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            No agents configured yet. Create your first agent to get started.
          </p>
          <NewAgentDialog />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Agents</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {agents.length} agents • {agents.filter((a) => a.is_active).length} active
          </p>
        </div>
        <NewAgentDialog />
      </motion.div>

      <div className="grid grid-cols-12 gap-6">
        <div className={cn("space-y-4", selected ? "col-span-12 lg:col-span-7" : "col-span-12")}>
          <div className={cn("grid gap-4", selected ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3")}>
            {agents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} onClick={() => setSelectedId(agent.id)} />
            ))}
          </div>
        </div>

        <AnimatePresence>
          {selected && (
            <div className="col-span-12 lg:col-span-5">
              <div className="sticky top-20">
                <AgentDetail agent={selected} onClose={() => setSelectedId(null)} />
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
