export type PlatformStatus = 'not_started' | 'exporting' | 'uploaded' | 'processing' | 'indexed';

export interface Platform {
  id: string;
  name: string;
  category: string;
  color: string;
  icon: string;
  status: PlatformStatus;
  insightPotential: number;
  description: string;
  dataTypes: string[];
  exportInstructions: string[];
  analysisCapabilities: string[];
}

export const platformCategories = [
  'core', 'social', 'professional', 'consumption', 'behavioral', 'creative', 'ai'
] as const;

export const statusLabels: Record<PlatformStatus, string> = {
  not_started: 'Not Started',
  exporting: 'Exporting',
  uploaded: 'Uploaded',
  processing: 'Processing',
  indexed: 'Indexed',
};

export const statusColors: Record<PlatformStatus, string> = {
  not_started: 'hsl(var(--muted-foreground))',
  exporting: 'hsl(var(--amber))',
  uploaded: 'hsl(var(--primary))',
  processing: 'hsl(var(--secondary))',
  indexed: 'hsl(var(--accent))',
};
