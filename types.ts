export type ArticleDestination = 'LinkedIn' | 'Medium' | 'Substack' | 'Facebook' | 'Non Fiction Book' | 'Fiction Book';

export interface ArticleIdea {
  title: string;
  summary: string;
  keyPoints: string[];
}

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
  specialInstructions?: string;
  isNew?: boolean;
}

export interface QueuedPost extends TopPostAssessment {
  id: string;
  scheduledTime?: string;
  platforms?: string[];
  status?: 'scheduled' | 'sent-to-ayrshare' | 'posted' | 'error';
  // Fix: Add optional sentAt property to support displaying sent posts in the same component.
  sentAt?: string;
}

export interface SentPost extends TopPostAssessment {
  id: string;
  sentAt: string;
  platforms: string[];
}

export interface PlatformAnalytics {
  impressions?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  clicks?: number;
  retweets?: number;
  reach?: number;
  views?: number;
}

export type PostAnalytics = Record<string, PlatformAnalytics>;

export interface AppSettings {
  ayrshareApiKey: string;
}

export interface UserActivity {
  posts: number[]; // Array of timestamps
  articles: number[]; // Array of timestamps
}

export interface AdminSettings {
  authorizedEmails: string[];
  secretPassword: string;
  userActivity?: Record<string, UserActivity>;
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
  headlineApplied?: boolean;
  type?: 'initial' | 'enhanced' | 'polished';
}

export interface GeneratedHeadline {
  id: string;
  headline: string;
  subheadline?: string;
  score: number;
  reasoning: string;
}

export interface BackupData {
  userEmail?: string | null;
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
  scheduledPosts?: QueuedPost[];
  historicalPosts?: QueuedPost[];
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
  
  generatedArticleIdeas?: ArticleIdea[] | null;
  generateArticleIdeasScript?: string;
  
  generateArticleWordCount?: number;
  generateArticleSourceType?: 'url' | 'text';
  generateArticleSourceUrl?: string;
  generateArticleSourceText?: string;
  generateArticleStyleRefs?: string;
  generateArticleScript?: string;
  recycleArticleText?: string;
  recycleArticleScript?: string;
  generatedArticleHistory: GeneratedArticle[];
  currentArticleIterationIndex: number;
  generateArticleTitle?: string;
  articleStarterText?: string;
  endOfArticleSummary?: string;
  articleEvalCriteria?: string;
  headlineEvalCriteriaForArticle?: string;
  generateHeadlinesForArticleScript?: string;
  generateArticleDestination?: ArticleDestination;
  finalDestinationGuidelines?: string;
  
  showCreateArticleTemplateModal?: boolean;
}