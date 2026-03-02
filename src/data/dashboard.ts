export const identityStats = {
  platformsConnected: 7,
  dataSourcesProcessed: 12,
  profileCompletion: 64,
  knowledgeVectors: 24847,
};

export const identityDimensions = [
  { label: 'Communication Style', value: 78, color: 'hsl(var(--primary))' },
  { label: 'Interest Genome', value: 85, color: 'hsl(var(--secondary))' },
  { label: 'Values & Beliefs', value: 52, color: 'hsl(var(--accent))' },
  { label: 'Creative Patterns', value: 71, color: 'hsl(var(--pink))' },
  { label: 'Knowledge Domains', value: 89, color: 'hsl(var(--amber))' },
  { label: 'Social Dynamics', value: 45, color: 'hsl(var(--primary))' },
  { label: 'Decision Heuristics', value: 33, color: 'hsl(var(--secondary))' },
  { label: 'Temporal Patterns', value: 61, color: 'hsl(var(--accent))' },
];

export const processingQueue = [
  { source: 'Claude Conversations', status: 'processing', progress: 72 },
  { source: 'Apple Health Data', status: 'processing', progress: 45 },
  { source: 'YouTube History', status: 'queued', progress: 0 },
  { source: 'LinkedIn Export', status: 'queued', progress: 0 },
];

export const knowledgeBaseStats = {
  vectorChunks: 24847,
  platforms: 7,
  dateRange: 'Jan 2019 – Feb 2026',
  dimensions: 1536,
};

export const systemStatus = {
  embeddingModel: 'text-embedding-3-large',
  vectorDB: 'Local ChromaDB',
  profileVersion: 'v0.3.2',
  lastUpdated: '2 hours ago',
};
