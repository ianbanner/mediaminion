
export type ArticleDestination = 'LinkedIn' | 'Medium' | 'Substack' | 'Facebook' | 'Non Fiction Book' | 'Fiction Book';

export interface ArticleIdea {
  title: string;
  summary: string;
  keyPoints: string[];
}

export interface PodcastIdea {
  title: string;
  summary: string;
  keyPoints: string[];
}

export interface PodcastPlan {
  id?: string;
  dateCreated?: string;
  title: string;
  fullPlan: string;
  outline: string;
}

export interface GeneratedAudioScript {
    id?: string;
    dateCreated?: string;
    title: string;
    scriptContent: string;
    estimatedDuration: string;
    wordCount: number;
}

export interface ChapterRewriteResult {
    rewrittenText: string;
    changeSummary: string;
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
  status?: 'draft' | 'scheduled' | 'sent-to-ayrshare' | 'posted' | 'error';
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

// --- NEW PERMISSION TYPES ---
export interface UserPermissions {
  canViewPosts: boolean;
  canViewArticles: boolean;
  canViewAudio: boolean;
  canViewBiblicalCheck: boolean;
  canViewNicheFinder: boolean;
  canViewMediaSummary: boolean;
  canViewChapterRewrite: boolean;
}

export interface AuthorizedUser {
  email: string;
  permissions: UserPermissions;
}

export interface AdminSettings {
  authorizedEmails?: string[]; // Deprecated, kept for safe migration
  authorizedUsers: AuthorizedUser[]; // New main source of truth
  secretPassword: string;
  userActivity?: Record<string, UserActivity>;
}
// -----------------------------

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

export interface ChecklistItem {
  id: string;
  text: string;
  url?: string;
  isCompleted: boolean;
}

// --- NEW PERSONA TYPES ---
export interface PersonaProfile {
  id: string;
  name: string;
  role: string;
  targetAudience: string;
  whatIWriteAbout: string;
  referenceWorldContent: string;
  thisIsHowIWriteArticles: string;
  lastModified?: string;
}
// -------------------------

export interface BackupData {
  userEmail?: string | null;
  
  // Active Persona State
  personaName?: string;
  userRole: string;
  targetAudience: string;
  whatIWriteAbout?: string;
  referenceWorldContent?: string;
  thisIsHowIWriteArticles?: string;
  
  // Persona Library
  savedPersonas?: PersonaProfile[];
  activePersonaId?: string | null;

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

  // Podcast state
  generatedPodcastIdeas?: PodcastIdea[] | null;
  selectedInitialPodcastIdea?: PodcastIdea | null;
  generatedAdjacentPodcastIdeas?: PodcastIdea[] | null;
  generatePodcastIdeasScript?: string;
  generatedPodcastPlan?: PodcastPlan | null;
  podcastSourceUrl?: string;
  podcastSourceText?: string;
  podcastSourceType?: 'url' | 'text';
  podcastTitleSuggestions?: string[] | null;
  finalPodcastIdeaForPlan?: PodcastIdea | null;
  archivedPodcastPlans?: PodcastPlan[];

  // Audio Script State
  audioScriptSourceText?: string;
  audioScriptDuration?: number;
  generateAudioScriptScript?: string;
  generatedAudioScript?: GeneratedAudioScript | null;
  archivedAudioScripts?: GeneratedAudioScript[];

  // Checklist State
  checklistItems?: ChecklistItem[];

  // Media Summary State
  mediaSummaryUrl?: string;
  mediaSummaryScript?: string;

  // Chapter Rewrite State
  chapterRewriteScript?: string;
}