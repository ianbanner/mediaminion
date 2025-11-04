export interface TopPostAssessment {
    title: string;
    content: string;
    assessment: string;
}

export interface SavedTemplate {
  id: string; 
  title: string;
  template: string;
  example: string;
  instructions: string;
  dateAdded: string;
  usageCount: number;
  lastUsed: string;
}

export interface QueuedPost extends TopPostAssessment {
  id: string;
}

export interface SentPost {
  id: string;
  title: string;
  content: string;
  sentAt: string;
}

export interface ScheduledTask {
  id: string;
  name: string;
  type: 'generate-posts' | 'ayrshare-api';
  scheduleTime: string; 
  enabled: boolean;
  lastRun: string | null;
  nextRun: number | null; 
  status: 'idle' | 'running' | 'success' | 'error';
  statusMessage: string | null;
}

export interface AppSettings {
  ayrshareApiKey: string;
  airtablePersonalAccessToken: string;
  airtableBaseId: string;
  airtableTemplatesTable: string;
  airtableQueueTable: string;
  airtableLogTable: string;
  airtableUrlsTable: string;
}

export type AirtableSyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'not-configured';