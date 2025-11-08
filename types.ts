
export interface TopPostAssessment {
    title: string;
    content: string;
    assessment: string;
    score: number;
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
  isNew?: boolean;
}

export interface SavedArticleTemplate {
  id: string;
  title: string;
  description: string;
  structure: string;
  isNew?: boolean;
}

export interface QueuedPost extends TopPostAssessment {
  id: string;
  scheduledTime?: string;
  platforms?: string[];
}

export interface SentPost {
  id: string;
  title: string;
  content: string;
  sentAt: string;
  platforms: string[];
}

export interface AppSettings {
  ayrshareApiKey: string;
}

export interface AdminSettings {
  authorizedEmails: string[];
  secretPassword: string;
}

export interface Suggestion {
  text: string;
  area: string;
}

export interface GeneratedArticle {
  title: string;
  content: string;
  evaluation: string;
  suggestions: Suggestion[];
  score: number;
}

export interface GeneratedHeadline {
  id: string;
  headline: string;
  score: number;
  reasoning: string;
}

export interface BackupData {
  userRole: string;
  targetAudience: string;
  referenceWorldContent?: string;
  thisIsHowIWriteArticles?: string;
  
  articleUrl: string;
  articleText: string;
  postSourceType: 'url' | 'text';
  standardStarterText: string;
  standardSummaryText: string;
  generationScript: string;
  
  savedTemplates: SavedTemplate[];
  savedArticleTemplates?: SavedArticleTemplate[];
  
  ayrshareQueue: QueuedPost[];
  schedulingInstructions: string;
  parsedSchedule: string[];
  ayrshareLog: SentPost[];
  
  settings: AppSettings;
  adminSettings: AdminSettings;
  
  researchScript: string;
  researchedPosts: any[] | null;

  headlineEvalCriteria?: string;
  headlineGenerationScript?: string;
  generatedHeadlines?: GeneratedHeadline[] | null;
  headlineSourceType?: 'url' | 'text';
  headlineSourceUrl?: string;
  headlineSourceText?: string;
  
  generatedArticleIdeas?: string[] | null;
  selectedArticleIdea?: string | null;
  
  generateArticleWordCount?: number;
  generateArticleSourceType?: 'url' | 'text';
  generateArticleSourceUrl?: string;
  generateArticleSourceText?: string;
  generateArticleStyleRefs?: string;
  generateArticleScript?: string;
  generatedArticleHistory: GeneratedArticle[];
  currentArticleIterationIndex: number;
  generateArticleTitle?: string;
  endOfArticleSummary?: string;
  articleEvalCriteria?: string;
  
  showCreateArticleTemplateModal?: boolean;
}
