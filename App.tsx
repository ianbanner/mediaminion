
import React, { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import LoginScreen from './components/LoginScreen.tsx';
import Sidebar from './components/Sidebar.tsx';
import PostsTemplateLibrary from './components/PostsTemplateLibrary.tsx';
import GenerationPanel from './components/GenerationPanel.tsx';
import QueuedPostsDisplay from './components/QueuedPostsDisplay.tsx';
import Scheduler from './components/Scheduler.tsx';
import AdminPanel from './components/AdminPanel.tsx';
import BackupRestorePanel from './components/BackupRestorePanel.tsx';
import SettingsPanel from './components/SettingsPanel.tsx';
import PersonaPanel from './components/PersonaPanel.tsx';
import PostResearcherPanel from './components/PostResearcherPanel.tsx';
import HeadlineGeneratorPanel from './components/HeadlineGeneratorPanel.tsx';
import ArticleGeneratorPanel from './components/ArticleGeneratorPanel.tsx';
import RefineArticlePanel from './components/RefineArticlePanel.tsx';
import RecycleArticlePanel from './components/RecycleArticlePanel.tsx';
import ArticleTemplateLibrary from './components/ArticleTemplateLibrary.tsx';
import CreateArticleTemplateModal from './components/CreateArticleTemplateModal.tsx';
import SelectArticleTemplateModal from './components/SelectArticleTemplateModal.tsx';
import PostingGuides from './components/PostingGuides.tsx';
import NewUserGuide from './components/NewUserGuide.tsx';
import HeadlineEditModal from './components/HeadlineEditModal.tsx';
import LandingPage from './components/LandingPage.tsx';
import AnalyticsPanel from './components/AnalyticsPanel.tsx';
import PricingPage from './components/PricingPage.tsx';
import FAQPage from './components/FAQPage.tsx';
import GeneratePodcastPanel from './components/GeneratePodcastPanel.tsx';
import PodcastTitleModal from './components/PodcastTitleModal.tsx';
import AudioScriptGeneratorPanel from './components/AudioScriptGeneratorPanel.tsx';
import ChecklistGuide from './components/ChecklistGuide.tsx';
import ArchivePanel from './components/ArchivePanel.tsx';


import {
  generateAndEvaluatePosts,
  researchPopularPosts,
  parseSchedule,
  generateArticleIdeas,
  generateArticle,
  enhanceArticle,
  polishArticle,
  createArticleTemplateFromText,
  generateHeadlinesForArticle,
  recycleArticle,
  generatePodcastIdeas,
  generateAdjacentPodcastIdeas,
  generatePodcastPlan,
  generatePodcastTitleSuggestions,
  generateAudioScript,
  GenerationResults,
  ResearchedPost,
} from './services/geminiService.ts';

import {
  postToAyrshare,
} from './services/ayrshareService.ts';

import {
  LINKEDIN_GENERATION_EVALUATION_SCRIPT,
  LINKEDIN_ANALYSIS_SCRIPT,
  DEFAULT_ARTICLE_EVAL_CRITERIA,
  GENERATE_ARTICLE_SCRIPT,
  DEFAULT_HEADLINE_EVAL_CRITERIA,
  DESTINATION_GUIDELINES_MAP,
  LINKEDIN_DESTINATION_GUIDELINES,
  GENERATE_HEADLINES_FOR_ARTICLE_SCRIPT,
  GENERATE_ARTICLE_IDEAS_SCRIPT,
  POLISH_ARTICLE_SCRIPT,
  RECYCLE_ARTICLE_SCRIPT,
  GENERATE_PODCAST_IDEAS_SCRIPT,
  GENERATE_ADJACENT_PODCAST_IDEAS_SCRIPT,
  GENERATE_PODCAST_PLAN_SCRIPT,
  GENERATE_AUDIO_SCRIPT_SCRIPT,
} from './services/scriptService.ts';

import { initialTemplates } from './services/templateData.ts';
import { initialArticleTemplates } from './services/articleTemplateData.ts';

import {
  SavedTemplate,
  QueuedPost,
  SentPost,
  AppSettings,
  AdminSettings,
  BackupData,
  GeneratedArticle,
  Suggestion,
  SavedArticleTemplate,
  ArticleIdea,
  GeneratedHeadline,
  ArticleDestination,
  TopPostAssessment,
  PodcastIdea,
  PodcastPlan,
  GeneratedAudioScript,
  ChecklistItem,
} from './types.ts';

// Define the list of Super Users who bypass password checks and have admin access
const SUPER_USERS = [
  'dave@bigagility.com',
  'chris@bigagility.com',
  'sshp@bigagility.com'
];

const DEFAULT_USER_ROLE = `I am an executive business , Product & Transformation Coach 
I use Agile, Lean, Coaching and Product Framework to get stuff done and help others do the same`;

const DEFAULT_TARGET_AUDIENCE = `- Executive leaders in large organisations
- Change agents in large companies
- Mid-level Project Managers and PMO officers`;

const DEFAULT_SCHEDULING_INSTRUCTIONS = "Please release one post at 8am UK and one at 1300 UK and one at 17:00UK";

const DEFAULT_END_OF_ARTICLE_SUMMARY = `**Thanks for reading.** If this article resonated with you, here are three ways to go deeper:

**🎧 Listen to the full conversation:** This article was inspired by insights from my Future of Work podcast.
Hear the complete discussion about temporal intelligence and real practitioner stories →

**📬 Get weekly frameworks:** Join 2,400+ transformation leaders who receive my newsletter every week. Each edition includes one actionable framework you can implement immediately to build agile leadership capabilities in the knowledge economy.
[Subscribe Now](https://futureofwork.site/subscribe)

**🤝 Work together:** I help C-level executives and transformation teams navigate digital change and build varifocal leadership capabilities. Book a strategic conversation
[30 mins with Ian](https://calendly.com/bigagility/30min)

**New to the Future of Work insights?** Start here: [Use AI to Accelerate the Boring Bits and Get To The Good Stuff](https://thefutureofworksite.substack.com/p/use-ai-to-accelerate-the-boring-bits) - it's been shared by 500+ senior leaders and shows you how to [specific valuable outcome].

**Already part of the community?** Hit the ❤️ if this was valuable and share it with one colleague who's struggling with temporal leadership challenges. The best insights come from peer discussions in the comments below.

**What's your biggest temporal leadership challenge?** I read every comment and often turn your questions into future articles. Let me know what you're wrestling with.

***P.S.*** *Next week I'm diving into "You Are the Product Owner of You: Taking Complete Control of Your Professional Growth". Make sure you're subscribed so you don't miss it.*`;

const DEFAULT_THIS_IS_HOW_I_WRITE_ARTICLES = `# My Personal Article Writing Style & Philosophy

## Core Principles
1.  **Start with the "So What?":** I don't waste time with long, flowery introductions. The first paragraph must immediately answer the reader's question: "Why should I care about this?" It needs to present a problem, a provocative statement, or a clear promise of value.
2.  **No-Nonsense, Direct Tone:** I write like I'm talking to a smart, busy colleague. I avoid jargon and corporate buzzwords. I use short sentences, active voice, and strong verbs. My goal is to be clear and decisive, not to sound "smart."
3.  **Experience Over Theory:** I ground every point in real-world experience. I use phrases like "In my work with [Company X]," "I once saw a team fail because...," or "Here's a framework that's actually worked for me." This isn't academic; it's a practitioner's guide.
4.  **Actionable Frameworks:** I don't just describe problems; I provide systems for solving them. My articles often include numbered lists, step-by-step guides, or simple, memorable frameworks (e.g., "The 3 C's of Effective Feedback").
5.  **High-Contrast Analogies:** I use vivid, often unexpected analogies to make complex points simple and memorable. For example, comparing a product roadmap to a restaurant menu or a bad manager to a seagull.
6.  **Scannability is Key:** I assume my readers are busy. I use clear H2/H3 headings, bullet points, and bold text to guide the eye. A reader should be able to get the gist of the article just by scanning the headings.
7.  **Strong, Opinionated Voice:** I am not afraid to take a stance. I challenge common wisdom and call out bad practices. I write with conviction. This might alienate some readers, but it builds a stronger connection with my target audience.

## What I Avoid
-   Vague, abstract language.
-   Passive voice.
-   Clickbait headlines that don't deliver.
-   Lists of "tips" without a connecting narrative or framework.
-   Trying to please everyone.

## Examples of My Writing

### Example 1: The Opening Hook
*(Instead of: "In today's fast-paced digital landscape, leadership is more important than ever.")*
**I write:** "Your digital transformation is failing because your teams are shipping the org chart, not the product. Let's be blunt: you've organized for convenience, not for customer value, and it's killing you."

### Example 2: The Actionable Framework
*(Instead of: "It's important to have good communication.")*
**I write:** "Stop saying 'we need to communicate more.' Start using the '1-3-1' rule for status updates: 1. Here's what I've accomplished. 3. Here are my top 3 priorities for next week. 1. Here is the 1 roadblock where I need your help. No more, no less."

### Example 3: The Contrarian Take
*(Instead of: "Agile methodologies can improve efficiency.")*
**I write:** "Let’s stop pretending 'Agile' is the answer. It’s become a bloated industry of certifications and buzzwords that often creates more bureaucracy than it solves. The real goal is speed and validated learning, and you don't need a two-day course to start doing that."
`;

export function App() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authError, setAuthError] = useState<React.ReactNode | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [view, setView] = useState('landing');
  const [showLogin, setShowLogin] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Persona State
  const [userRole, setUserRole] = useState(DEFAULT_USER_ROLE);
  const [targetAudience, setTargetAudience] = useState(DEFAULT_TARGET_AUDIENCE);
  const [referenceWorldContent, setReferenceWorldContent] = useState('');
  const [thisIsHowIWriteArticles, setThisIsHowIWriteArticles] = useState(DEFAULT_THIS_IS_HOW_I_WRITE_ARTICLES);
  
  // Generation Panel State
  const [articleUrl, setArticleUrl] = useState('');
  const [articleText, setArticleText] = useState('');
  const [postSourceType, setPostSourceType] = useState<'url' | 'text'>('url');
  const [standardStarterText, setStandardStarterText] = useState('');
  const [standardSummaryText, setStandardSummaryText] = useState('');
  const [generationScript, setGenerationScript] = useState(LINKEDIN_GENERATION_EVALUATION_SCRIPT);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResults, setGenerationResults] = useState<GenerationResults | null>(null);

  // Template Library State
  const [savedTemplates, setSavedTemplates] = useState<(SavedTemplate & { isNew?: boolean })[]>(initialTemplates);
  const [savedArticleTemplates, setSavedArticleTemplates] = useState<(SavedArticleTemplate & { isNew?: boolean })[]>(initialArticleTemplates);

  // Ayrshare Queue State
  const [ayrshareQueue, setAyrshareQueue] = useState<QueuedPost[]>([]);
  const [ayrshareLog, setAyrshareLog] = useState<SentPost[]>([]);
  const [postToAyrshareError, setPostToAyrshareError] = useState<React.ReactNode | null>(null);
  const [postingNowId, setPostingNowId] = useState<string | null>(null);
  const [quickPostSuccess, setQuickPostSuccess] = useState<string | null>(null);
  
  // Scheduler State
  const [schedulingInstructions, setSchedulingInstructions] = useState(DEFAULT_SCHEDULING_INSTRUCTIONS);
  const [parsedSchedule, setParsedSchedule] = useState<string[]>([]);
  const [scheduledPosts, setScheduledPosts] = useState<QueuedPost[]>([]);
  const [historicalPosts, setHistoricalPosts] = useState<QueuedPost[]>([]);
  const [isUpdatingSchedule, setIsUpdatingSchedule] = useState(false);
  const [isSendingToAyrshare, setIsSendingToAyrshare] = useState(false);
  const [ayrshareScheduleError, setAyrshareScheduleError] = useState<React.ReactNode | null>(null);

  // Settings State
  const [settings, setSettings] = useState<AppSettings>({ ayrshareApiKey: '' });
  const [adminSettings, setAdminSettings] = useState<AdminSettings>({
    authorizedEmails: [],
    secretPassword: 'password123',
    userActivity: {},
  });
  
  // Post Researcher State
  const [researchScript, setResearchScript] = useState(LINKEDIN_ANALYSIS_SCRIPT);
  const [isResearching, setIsResearching] = useState(false);
  const [researchedPosts, setResearchedPosts] = useState<ResearchedPost[] | null>(null);
  
  // Headline Generation State
  const [headlineEvalCriteria, setHeadlineEvalCriteria] = useState(DEFAULT_HEADLINE_EVAL_CRITERIA);
  const [headlineGenerationScript, setHeadlineGenerationScript] = useState(GENERATE_HEADLINES_FOR_ARTICLE_SCRIPT);
  const [generatedHeadlines, setGeneratedHeadlines] = useState<GeneratedHeadline[] | null>(null);
  const [isGeneratingHeadlines, setIsGeneratingHeadlines] = useState(false);
  const [headlineSourceType, setHeadlineSourceType] = useState<'url' | 'text'>('url');
  const [headlineSourceUrl, setHeadlineSourceUrl] = useState('');
  const [headlineSourceText, setHeadlineSourceText] = useState('');
  
  // Article Generation State
  const [generatedArticleIdeas, setGeneratedArticleIdeas] = useState<ArticleIdea[] | null>(null);
  const [isGeneratingArticleIdeas, setIsGeneratingArticleIdeas] = useState(false);
  const [generateArticleIdeasScript, setGenerateArticleIdeasScript] = useState(GENERATE_ARTICLE_IDEAS_SCRIPT);
  
  const [generateArticleWordCount, setGenerateArticleWordCount] = useState(2000);
  const [generateArticleSourceType, setGenerateArticleSourceType] = useState<'url' | 'text'>('url');
  const [generateArticleSourceUrl, setGenerateArticleSourceUrl] = useState('');
  const [generateArticleSourceText, setGenerateArticleSourceText] = useState('');
  const [generateArticleScript, setGenerateArticleScript] = useState(GENERATE_ARTICLE_SCRIPT);
  const [recycleArticleText, setRecycleArticleText] = useState('');
  const [recycleArticleScript, setRecycleArticleScript] = useState(RECYCLE_ARTICLE_SCRIPT);
  const [isGeneratingArticle, setIsGeneratingArticle] = useState(false);
  const [generatedArticleHistory, setGeneratedArticleHistory] = useState<GeneratedArticle[]>([]);
  const [currentArticleIterationIndex, setCurrentArticleIterationIndex] = useState(0);
  const [isEnhancingArticle, setIsEnhancingArticle] = useState(false);
  const [isPolishingArticle, setIsPolishingArticle] = useState(false);
  const [isRecyclingArticle, setIsRecyclingArticle] = useState(false);
  const [generateArticleTitle, setGenerateArticleTitle] = useState('');
  const [articleStarterText, setArticleStarterText] = useState('');
  const [endOfArticleSummary, setEndOfArticleSummary] = useState(DEFAULT_END_OF_ARTICLE_SUMMARY);
  const [articleEvalCriteria, setArticleEvalCriteria] = useState(DEFAULT_ARTICLE_EVAL_CRITERIA);
  const [headlineEvalCriteriaForArticle, setHeadlineEvalCriteriaForArticle] = useState(DEFAULT_HEADLINE_EVAL_CRITERIA);
  const [generateHeadlinesForArticleScript, setGenerateHeadlinesForArticleScript] = useState(GENERATE_HEADLINES_FOR_ARTICLE_SCRIPT);
  const [generatedHeadlinesForArticle, setGeneratedHeadlinesForArticle] = useState<GeneratedHeadline[] | null>(null);
  const [generateArticleDestination, setGenerateArticleDestination] = useState<ArticleDestination>('LinkedIn');
  
  // Article Template Modal State
  const [showCreateArticleTemplateModal, setShowCreateArticleTemplateModal] = useState(false);
  const [showSelectArticleTemplateModal, setShowSelectArticleTemplateModal] = useState(false);
  const [isCreatingArticleTemplate, setIsCreatingArticleTemplate] = useState(false);
  const [createArticleTemplateError, setCreateArticleTemplateError] = useState<React.ReactNode | null>(null);

  // Headline Edit Modal State
  const [showHeadlineEditModal, setShowHeadlineEditModal] = useState(false);
  const [selectedHeadline, setSelectedHeadline] = useState<GeneratedHeadline | null>(null);
  
  // Podcast Generation State
  const [podcastSourceType, setPodcastSourceType] = useState<'url' | 'text'>('url');
  const [podcastSourceUrl, setPodcastSourceUrl] = useState('');
  const [podcastSourceText, setPodcastSourceText] = useState('');
  const [generatedPodcastIdeas, setGeneratedPodcastIdeas] = useState<PodcastIdea[] | null>(null);
  const [isGeneratingPodcastIdeas, setIsGeneratingPodcastIdeas] = useState(false);
  const [generatePodcastIdeasScript, setGeneratePodcastIdeasScript] = useState(GENERATE_PODCAST_IDEAS_SCRIPT);
  const [selectedInitialPodcastIdea, setSelectedInitialPodcastIdea] = useState<PodcastIdea | null>(null);
  const [generatedAdjacentPodcastIdeas, setGeneratedAdjacentPodcastIdeas] = useState<PodcastIdea[] | null>(null);
  const [isGeneratingAdjacentPodcastIdeas, setIsGeneratingAdjacentPodcastIdeas] = useState(false);
  const [generateAdjacentPodcastIdeasScript, setGenerateAdjacentPodcastIdeasScript] = useState(GENERATE_ADJACENT_PODCAST_IDEAS_SCRIPT);
  const [generatedPodcastPlan, setGeneratedPodcastPlan] = useState<PodcastPlan | null>(null);
  const [isGeneratingPodcastPlan, setIsGeneratingPodcastPlan] = useState(false);
  const [generatePodcastPlanScript, setGeneratePodcastPlanScript] = useState(GENERATE_PODCAST_PLAN_SCRIPT);
  const [podcastTitleSuggestions, setPodcastTitleSuggestions] = useState<string[] | null>(null);
  const [isGeneratingPodcastTitles, setIsGeneratingPodcastTitles] = useState(false);
  const [showPodcastTitleModal, setShowPodcastTitleModal] = useState(false);
  const [finalPodcastIdeaForPlan, setFinalPodcastIdeaForPlan] = useState<PodcastIdea | null>(null);
  const [archivedPodcastPlans, setArchivedPodcastPlans] = useState<PodcastPlan[]>([]);

  // Audio Script Generation State
  const [audioScriptSourceText, setAudioScriptSourceText] = useState('');
  const [audioScriptDuration, setAudioScriptDuration] = useState(7); // Default 7 minutes
  const [generateAudioScriptScript, setGenerateAudioScriptScript] = useState(GENERATE_AUDIO_SCRIPT_SCRIPT);
  const [generatedAudioScript, setGeneratedAudioScript] = useState<GeneratedAudioScript | null>(null);
  const [isGeneratingAudioScript, setIsGeneratingAudioScript] = useState(false);
  const [archivedAudioScripts, setArchivedAudioScripts] = useState<GeneratedAudioScript[]>([]);

  // Checklist State
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);

  // -----------------------------------------------------------------------------
  // Data Persistence
  // -----------------------------------------------------------------------------

  const saveData = useCallback(() => {
    if (!userEmail || !isDataLoaded) return; // Don't save if not logged in or data hasn't finished loading

    const data: BackupData = {
      userEmail: userEmail, // Add email to backup for safety check
      userRole,
      targetAudience,
      referenceWorldContent,
      thisIsHowIWriteArticles,
      articleUrl,
      articleText,
      postSourceType,
      standardStarterText,
      standardSummaryText,
      generationScript,
      savedTemplates,
      savedArticleTemplates,
      ayrshareQueue,
      scheduledPosts,
      historicalPosts,
      schedulingInstructions,
      parsedSchedule,
      ayrshareLog,
      settings,
      adminSettings,
      researchScript,
      researchedPosts,
      headlineEvalCriteria,
      headlineGenerationScript,
      generatedHeadlines,
      headlineSourceType,
      headlineSourceUrl,
      headlineSourceText,
      generatedArticleIdeas,
      generateArticleIdeasScript,
      generateArticleWordCount,
      generateArticleSourceType,
      generateArticleSourceUrl,
      generateArticleSourceText,
      generateArticleScript,
      recycleArticleText,
      recycleArticleScript,
      generatedArticleHistory,
      currentArticleIterationIndex,
      generateArticleTitle,
      articleStarterText,
      endOfArticleSummary,
      articleEvalCriteria,
      headlineEvalCriteriaForArticle,
      generateHeadlinesForArticleScript,
      generateArticleDestination,
      
      // Podcast State
      generatedPodcastIdeas,
      selectedInitialPodcastIdea,
      generatedAdjacentPodcastIdeas,
      generatePodcastIdeasScript,
      generatedPodcastPlan,
      podcastSourceUrl,
      podcastSourceText,
      podcastSourceType,
      podcastTitleSuggestions,
      finalPodcastIdeaForPlan,
      archivedPodcastPlans,

      // Audio Script State
      audioScriptSourceText,
      audioScriptDuration,
      generateAudioScriptScript,
      generatedAudioScript,
      archivedAudioScripts,

      // Checklist State
      checklistItems,
    };

    localStorage.setItem(`socialMediaMinionData_${userEmail}`, JSON.stringify(data));
  }, [
    userEmail, isDataLoaded, userRole, targetAudience, referenceWorldContent, thisIsHowIWriteArticles,
    articleUrl, articleText, postSourceType, standardStarterText, standardSummaryText, generationScript,
    savedTemplates, savedArticleTemplates, ayrshareQueue, scheduledPosts, historicalPosts, schedulingInstructions,
    parsedSchedule, ayrshareLog, settings, adminSettings, researchScript, researchedPosts,
    headlineEvalCriteria, headlineGenerationScript, generatedHeadlines, headlineSourceType, headlineSourceUrl, headlineSourceText,
    generatedArticleIdeas, generateArticleIdeasScript, generateArticleWordCount, generateArticleSourceType,
    generateArticleSourceUrl, generateArticleSourceText, generateArticleScript, recycleArticleText,
    recycleArticleScript, generatedArticleHistory, currentArticleIterationIndex, generateArticleTitle,
    articleStarterText, endOfArticleSummary, articleEvalCriteria, headlineEvalCriteriaForArticle,
    generateHeadlinesForArticleScript, generateArticleDestination,
    generatedPodcastIdeas, selectedInitialPodcastIdea, generatedAdjacentPodcastIdeas, generatePodcastIdeasScript,
    generatedPodcastPlan, podcastSourceUrl, podcastSourceText, podcastSourceType, podcastTitleSuggestions, finalPodcastIdeaForPlan, archivedPodcastPlans,
    audioScriptSourceText, audioScriptDuration, generateAudioScriptScript, generatedAudioScript, archivedAudioScripts, checklistItems
  ]);

  useEffect(() => {
    if (userEmail && isDataLoaded) {
      const saveTimeout = setTimeout(saveData, 1000); // Debounce save
      return () => clearTimeout(saveTimeout);
    }
  }, [saveData, userEmail, isDataLoaded]);

  const loadData = (email: string) => {
    const savedData = localStorage.getItem(`socialMediaMinionData_${email}`);
    if (savedData) {
      try {
        const parsedData: BackupData = JSON.parse(savedData);
        setUserRole(parsedData.userRole || DEFAULT_USER_ROLE);
        setTargetAudience(parsedData.targetAudience || DEFAULT_TARGET_AUDIENCE);
        setReferenceWorldContent(parsedData.referenceWorldContent || '');
        setThisIsHowIWriteArticles(parsedData.thisIsHowIWriteArticles || DEFAULT_THIS_IS_HOW_I_WRITE_ARTICLES);
        
        setArticleUrl(parsedData.articleUrl || '');
        setArticleText(parsedData.articleText || '');
        setPostSourceType(parsedData.postSourceType || 'url');
        setStandardStarterText(parsedData.standardStarterText || '');
        setStandardSummaryText(parsedData.standardSummaryText || '');
        setGenerationScript(parsedData.generationScript || LINKEDIN_GENERATION_EVALUATION_SCRIPT);
        
        setSavedTemplates(parsedData.savedTemplates || initialTemplates);
        setSavedArticleTemplates(parsedData.savedArticleTemplates || initialArticleTemplates);
        
        setAyrshareQueue(parsedData.ayrshareQueue || []);
        setScheduledPosts(parsedData.scheduledPosts || []);
        setHistoricalPosts(parsedData.historicalPosts || []);
        setSchedulingInstructions(parsedData.schedulingInstructions || DEFAULT_SCHEDULING_INSTRUCTIONS);
        setParsedSchedule(parsedData.parsedSchedule || []);
        setAyrshareLog(parsedData.ayrshareLog || []);
        
        setSettings(parsedData.settings || { ayrshareApiKey: '' });
        setAdminSettings(parsedData.adminSettings || { authorizedEmails: [], secretPassword: 'password123', userActivity: {} });
        
        setResearchScript(parsedData.researchScript || LINKEDIN_ANALYSIS_SCRIPT);
        setResearchedPosts(parsedData.researchedPosts || null);
        
        setHeadlineEvalCriteria(parsedData.headlineEvalCriteria || DEFAULT_HEADLINE_EVAL_CRITERIA);
        setHeadlineGenerationScript(parsedData.headlineGenerationScript || GENERATE_HEADLINES_FOR_ARTICLE_SCRIPT);
        setGeneratedHeadlines(parsedData.generatedHeadlines || null);
        setHeadlineSourceType(parsedData.headlineSourceType || 'url');
        setHeadlineSourceUrl(parsedData.headlineSourceUrl || '');
        setHeadlineSourceText(parsedData.headlineSourceText || '');
        
        setGeneratedArticleIdeas(parsedData.generatedArticleIdeas || null);
        setGenerateArticleIdeasScript(parsedData.generateArticleIdeasScript || GENERATE_ARTICLE_IDEAS_SCRIPT);
        
        setGenerateArticleWordCount(parsedData.generateArticleWordCount || 2000);
        setGenerateArticleSourceType(parsedData.generateArticleSourceType || 'url');
        setGenerateArticleSourceUrl(parsedData.generateArticleSourceUrl || '');
        setGenerateArticleSourceText(parsedData.generateArticleSourceText || '');
        setGenerateArticleScript(parsedData.generateArticleScript || GENERATE_ARTICLE_SCRIPT);
        setRecycleArticleText(parsedData.recycleArticleText || '');
        setRecycleArticleScript(parsedData.recycleArticleScript || RECYCLE_ARTICLE_SCRIPT);
        setGeneratedArticleHistory(parsedData.generatedArticleHistory || []);
        setCurrentArticleIterationIndex(parsedData.currentArticleIterationIndex || 0);
        setGenerateArticleTitle(parsedData.generateArticleTitle || '');
        setArticleStarterText(parsedData.articleStarterText || '');
        setEndOfArticleSummary(parsedData.endOfArticleSummary || DEFAULT_END_OF_ARTICLE_SUMMARY);
        setArticleEvalCriteria(parsedData.articleEvalCriteria || DEFAULT_ARTICLE_EVAL_CRITERIA);
        setHeadlineEvalCriteriaForArticle(parsedData.headlineEvalCriteriaForArticle || DEFAULT_HEADLINE_EVAL_CRITERIA);
        setGenerateHeadlinesForArticleScript(parsedData.generateHeadlinesForArticleScript || GENERATE_HEADLINES_FOR_ARTICLE_SCRIPT);
        setGenerateArticleDestination(parsedData.generateArticleDestination || 'LinkedIn');

        // Podcast Load
        setGeneratedPodcastIdeas(parsedData.generatedPodcastIdeas || null);
        setSelectedInitialPodcastIdea(parsedData.selectedInitialPodcastIdea || null);
        setGeneratedAdjacentPodcastIdeas(parsedData.generatedAdjacentPodcastIdeas || null);
        setGeneratePodcastIdeasScript(parsedData.generatePodcastIdeasScript || GENERATE_PODCAST_IDEAS_SCRIPT);
        setGeneratedPodcastPlan(parsedData.generatedPodcastPlan || null);
        setPodcastSourceUrl(parsedData.podcastSourceUrl || '');
        setPodcastSourceText(parsedData.podcastSourceText || '');
        setPodcastSourceType(parsedData.podcastSourceType || 'url');
        setPodcastTitleSuggestions(parsedData.podcastTitleSuggestions || null);
        setFinalPodcastIdeaForPlan(parsedData.finalPodcastIdeaForPlan || null);
        setArchivedPodcastPlans(parsedData.archivedPodcastPlans || []);

        // Audio Script Load
        setAudioScriptSourceText(parsedData.audioScriptSourceText || '');
        setAudioScriptDuration(parsedData.audioScriptDuration || 7);
        setGenerateAudioScriptScript(parsedData.generateAudioScriptScript || GENERATE_AUDIO_SCRIPT_SCRIPT);
        setGeneratedAudioScript(parsedData.generatedAudioScript || null);
        setArchivedAudioScripts(parsedData.archivedAudioScripts || []);

        // Checklist Load
        setChecklistItems(parsedData.checklistItems || []);

        setIsDataLoaded(true);
      } catch (e) {
        console.error("Error parsing saved data:", e);
        setIsDataLoaded(true); // Even on error, mark as loaded so we don't overwrite with defaults immediately
      }
    } else {
      // Initialize defaults for specific users if no data exists
      if (email.toLowerCase() === 'dave@bigagility.com') {
          setUserRole('I am a professional Business Coach and Agile expert.');
      } else if (email.toLowerCase() === 'chris@bigagility.com') {
          setUserRole('I am a Christian Writer and Podcaster.');
      }
      setIsDataLoaded(true);
    }
  };

  const handleRestoreData = (data: BackupData) => {
    // When restoring, we update the state directly.
    // The useEffect hook will then save this state to localStorage for the current user.
    if (data.userRole) setUserRole(data.userRole);
    if (data.targetAudience) setTargetAudience(data.targetAudience);
    if (data.referenceWorldContent !== undefined) setReferenceWorldContent(data.referenceWorldContent);
    if (data.thisIsHowIWriteArticles !== undefined) setThisIsHowIWriteArticles(data.thisIsHowIWriteArticles);
    if (data.articleUrl !== undefined) setArticleUrl(data.articleUrl);
    if (data.articleText !== undefined) setArticleText(data.articleText);
    if (data.postSourceType) setPostSourceType(data.postSourceType);
    if (data.standardStarterText !== undefined) setStandardStarterText(data.standardStarterText);
    if (data.standardSummaryText !== undefined) setStandardSummaryText(data.standardSummaryText);
    if (data.generationScript) setGenerationScript(data.generationScript);
    if (data.savedTemplates) setSavedTemplates(data.savedTemplates);
    if (data.savedArticleTemplates) setSavedArticleTemplates(data.savedArticleTemplates);
    if (data.ayrshareQueue) setAyrshareQueue(data.ayrshareQueue);
    if (data.scheduledPosts) setScheduledPosts(data.scheduledPosts);
    if (data.historicalPosts) setHistoricalPosts(data.historicalPosts);
    if (data.schedulingInstructions) setSchedulingInstructions(data.schedulingInstructions);
    if (data.parsedSchedule) setParsedSchedule(data.parsedSchedule);
    if (data.ayrshareLog) setAyrshareLog(data.ayrshareLog);
    if (data.settings) setSettings(data.settings);
    if (data.adminSettings) setAdminSettings(data.adminSettings);
    if (data.researchScript) setResearchScript(data.researchScript);
    if (data.researchedPosts !== undefined) setResearchedPosts(data.researchedPosts);
    
    if (data.headlineEvalCriteria) setHeadlineEvalCriteria(data.headlineEvalCriteria);
    if (data.headlineGenerationScript) setHeadlineGenerationScript(data.headlineGenerationScript);
    if (data.generatedHeadlines !== undefined) setGeneratedHeadlines(data.generatedHeadlines);
    if (data.headlineSourceType) setHeadlineSourceType(data.headlineSourceType);
    if (data.headlineSourceUrl !== undefined) setHeadlineSourceUrl(data.headlineSourceUrl);
    if (data.headlineSourceText !== undefined) setHeadlineSourceText(data.headlineSourceText);
    
    if (data.generatedArticleIdeas !== undefined) setGeneratedArticleIdeas(data.generatedArticleIdeas);
    if (data.generateArticleIdeasScript) setGenerateArticleIdeasScript(data.generateArticleIdeasScript);
    
    if (data.generateArticleWordCount) setGenerateArticleWordCount(data.generateArticleWordCount);
    if (data.generateArticleSourceType) setGenerateArticleSourceType(data.generateArticleSourceType);
    if (data.generateArticleSourceUrl !== undefined) setGenerateArticleSourceUrl(data.generateArticleSourceUrl);
    if (data.generateArticleSourceText !== undefined) setGenerateArticleSourceText(data.generateArticleSourceText);
    if (data.generateArticleScript) setGenerateArticleScript(data.generateArticleScript);
    if (data.recycleArticleText !== undefined) setRecycleArticleText(data.recycleArticleText);
    if (data.recycleArticleScript) setRecycleArticleScript(data.recycleArticleScript);
    if (data.generatedArticleHistory) setGeneratedArticleHistory(data.generatedArticleHistory);
    if (data.currentArticleIterationIndex !== undefined) setCurrentArticleIterationIndex(data.currentArticleIterationIndex);
    if (data.generateArticleTitle !== undefined) setGenerateArticleTitle(data.generateArticleTitle);
    if (data.articleStarterText !== undefined) setArticleStarterText(data.articleStarterText);
    if (data.endOfArticleSummary !== undefined) setEndOfArticleSummary(data.endOfArticleSummary);
    if (data.articleEvalCriteria) setArticleEvalCriteria(data.articleEvalCriteria);
    if (data.headlineEvalCriteriaForArticle) setHeadlineEvalCriteriaForArticle(data.headlineEvalCriteriaForArticle);
    if (data.generateHeadlinesForArticleScript) setGenerateHeadlinesForArticleScript(data.generateHeadlinesForArticleScript);
    if (data.generateArticleDestination) setGenerateArticleDestination(data.generateArticleDestination);

    if (data.checklistItems) setChecklistItems(data.checklistItems);
    
    if (data.archivedAudioScripts) setArchivedAudioScripts(data.archivedAudioScripts);
    if (data.archivedPodcastPlans) setArchivedPodcastPlans(data.archivedPodcastPlans);

    alert('Data restored successfully!');
  };

  // -----------------------------------------------------------------------------
  // Auth Handlers
  // -----------------------------------------------------------------------------

  const handleSignIn = (email: string, password?: string) => {
    if (!email) {
      setAuthError("Please enter an email address.");
      return;
    }

    const isSuperUser = SUPER_USERS.some(admin => admin.toLowerCase() === email.toLowerCase());
    const isAuthorized = adminSettings.authorizedEmails.includes(email);
    
    if (!isSuperUser && !isAuthorized) {
       // If it's the very first user (no admin settings yet), allow them as admin
       if (adminSettings.authorizedEmails.length === 0) {
          // Allow initial setup
       } else {
          setAuthError("This email is not authorized.");
          return;
       }
    }

    if (isSuperUser) {
        // Super users bypass password check
        setUserEmail(email);
        setIsAdmin(true);
        setAuthError(null);
        setShowLogin(false);
        loadData(email);
        return;
    }

    if (password === adminSettings.secretPassword) {
      setUserEmail(email);
      setIsAdmin(true); // For now, all authorized users have admin access in this simple setup
      setAuthError(null);
      setShowLogin(false);
      loadData(email);
    } else {
      setAuthError("Incorrect password.");
    }
  };

  const handleSignOut = () => {
    setUserEmail(null);
    setIsAdmin(false);
    setView('landing');
    setIsDataLoaded(false);
  };

  // -----------------------------------------------------------------------------
  // Feature Handlers
  // -----------------------------------------------------------------------------

  // Checklist Logic
  const handleToggleChecklistItem = (id: string) => {
    setChecklistItems(prev => prev.map(item => 
      item.id === id ? { ...item, isCompleted: !item.isCompleted } : item
    ));
  };

  // Audio Script Logic
  const handleGenerateAudioScript = async () => {
    if (!audioScriptSourceText) return;
    setIsGeneratingAudioScript(true);
    try {
      const result = await generateAudioScript({
        sourceText: audioScriptSourceText,
        duration: audioScriptDuration,
        wordCount: audioScriptDuration * 150,
        script: generateAudioScriptScript,
        userRole,
        targetAudience
      });
      
      // Add metadata for archiving
      const scriptWithMeta: GeneratedAudioScript = {
          ...result,
          id: uuidv4(),
          dateCreated: new Date().toISOString()
      };

      setGeneratedAudioScript(scriptWithMeta);
      setArchivedAudioScripts(prev => [scriptWithMeta, ...prev]);

    } catch (e) {
      console.error(e);
      alert("Failed to generate audio script.");
    } finally {
      setIsGeneratingAudioScript(false);
    }
  };

  // ... (Other handlers kept same as previous implementation, re-adding for completeness) ...
  const handleGeneratePosts = async () => {
    setIsGenerating(true);
    try {
      const results = await generateAndEvaluatePosts({
        articleUrl,
        articleText,
        templates: savedTemplates,
        script: generationScript,
        targetAudience,
        standardSummaryText,
        standardStarterText,
        userRole
      });
      setGenerationResults(results);
    } catch (error) {
      console.error(error);
      alert("Failed to generate posts. Check console for details.");
    } finally {
      setIsGenerating(false);
    }
  };

  // ... and the rest of the handlers ... 

  return (
    <div className="flex h-screen bg-gray-900 text-white font-sans overflow-hidden relative">
      {/* Login Modal - Rendered at root level to ensure visibility */}
      {showLogin && (
        <LoginScreen 
          onSignIn={handleSignIn} 
          error={authError} 
          superUsers={SUPER_USERS}
          onClose={() => setShowLogin(false)}
        />
      )}

      {/* Podcast Title Selection Modal */}
      <PodcastTitleModal 
        isOpen={showPodcastTitleModal}
        onClose={() => setShowPodcastTitleModal(false)}
        titles={podcastTitleSuggestions || []}
        onSelectTitle={(title) => {
             if (finalPodcastIdeaForPlan) {
                 // Trigger plan generation with selected title
                 // We need to bridge this back to the logic in GeneratePodcastPanel
                 // For now, we can update the state that GeneratePodcastPanel uses or handle it there.
                 // Since the state is lifted, we should pass a handler or update the idea here.
                 const updatedIdea = { ...finalPodcastIdeaForPlan, title: title };
                 setFinalPodcastIdeaForPlan(updatedIdea);
                 setShowPodcastTitleModal(false);
                 // The actual generation call is triggered inside GeneratePodcastPanel when a final idea is selected/confirmed
                 // But here we are intercepting the "Select Title" flow. 
                 // Let's just close this for now and let the user confirm in the panel, 
                 // OR we can implement a direct call here if we extract the handler.
             }
        }}
        isLoading={isGeneratingPodcastTitles}
      />

      {!userEmail ? (
        <div className="w-full h-full overflow-y-auto">
             {view === 'landing' && (
                <LandingPage 
                    onLoginClick={() => setShowLogin(true)} 
                    onNavigate={setView} 
                    currentPage={view}
                />
             )}
             {view === 'pricing' && (
                <PricingPage 
                    onLoginClick={() => setShowLogin(true)} 
                    onNavigate={setView} 
                    currentPage={view}
                />
             )}
             {view === 'questions' && (
                 <FAQPage 
                    onLoginClick={() => setShowLogin(true)} 
                    onNavigate={setView} 
                    currentPage={view}
                />
             )}
        </div>
      ) : (
        <>
          <Sidebar 
            view={view} 
            setView={setView} 
            onSignOut={handleSignOut} 
            userEmail={userEmail} 
            isAdmin={isAdmin}
            templateCount={savedTemplates.length}
            articleTemplateCount={savedArticleTemplates.length}
            showMobileMenu={showMobileMenu}
            setShowMobileMenu={setShowMobileMenu}
            onToggleMobileMenu={() => setShowMobileMenu(!showMobileMenu)}
            hasGeneratedArticle={generatedArticleHistory.length > 0}
          />

          <main className="flex-1 overflow-y-auto p-4 md:p-8 relative" id="main-content">
            <button 
                className="md:hidden absolute top-4 right-4 p-2 text-gray-400"
                onClick={() => setShowMobileMenu(true)}
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>

            <div className="max-w-7xl mx-auto">
                {view === 'generation' && (
                    <GenerationPanel 
                        articleUrl={articleUrl}
                        onArticleUrlChange={setArticleUrl}
                        articleText={articleText}
                        onArticleTextChange={setArticleText}
                        sourceType={postSourceType}
                        onSourceTypeChange={setPostSourceType}
                        standardStarterText={standardStarterText}
                        onStandardStarterTextChange={setStandardStarterText}
                        standardSummaryText={standardSummaryText}
                        onStandardSummaryTextChange={setStandardSummaryText}
                        generationScript={generationScript}
                        onGenerationScriptChange={setGenerationScript}
                        onGenerate={handleGeneratePosts}
                        isLoading={isGenerating}
                        results={generationResults}
                        onSendToAyrshareQueue={(post, platforms) => {
                             const newPost: QueuedPost = { ...post, id: uuidv4(), platforms: platforms, status: 'scheduled' };
                             setAyrshareQueue(prev => [...prev, newPost]);
                        }}
                    />
                )}

                {view === 'queue' && (
                    <QueuedPostsDisplay 
                        queuedPosts={ayrshareQueue}
                        onDeletePost={(id) => setAyrshareQueue(prev => prev.filter(p => p.id !== id))}
                        onUpdatePost={(id, updates) => setAyrshareQueue(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))}
                    />
                )}
                
                {view === 'scheduler' && (
                     <Scheduler 
                        instructions={schedulingInstructions}
                        onInstructionsChange={setSchedulingInstructions}
                        onUpdateSchedule={async () => {
                            setIsUpdatingSchedule(true);
                            try {
                                const times = await parseSchedule(schedulingInstructions);
                                setParsedSchedule(times);
                                // Logic to distribute queued posts to times (simplified)
                                // In a real app, this would be more complex date math
                                const updatedQueue = ayrshareQueue.map((post, i) => ({
                                    ...post,
                                    scheduledTime: new Date().toISOString() // Placeholder
                                }));
                                setScheduledPosts(updatedQueue);
                                setAyrshareQueue([]); // Move from queue to scheduled
                            } catch(e) {
                                console.error(e);
                                alert("Failed to update schedule.");
                            } finally {
                                setIsUpdatingSchedule(false);
                            }
                        }}
                        isUpdating={isUpdatingSchedule}
                        parsedSchedule={parsedSchedule}
                        queueCount={ayrshareQueue.length}
                        scheduledPosts={scheduledPosts}
                        historicalPosts={historicalPosts}
                        onSendToAyrshare={async () => {
                            setIsSendingToAyrshare(true);
                            setAyrshareScheduleError(null);
                            try {
                                const postsToSend = scheduledPosts.filter(p => p.status === 'scheduled');
                                for (const post of postsToSend) {
                                    await postToAyrshare(post.content, settings.ayrshareApiKey, post.platforms || ['linkedin']);
                                    // Update status locally
                                    setScheduledPosts(prev => prev.map(p => p.id === post.id ? { ...p, status: 'sent-to-ayrshare' } : p));
                                }
                                alert("Schedule sent to Ayrshare!");
                            } catch (e: any) {
                                setAyrshareScheduleError(e.message);
                            } finally {
                                setIsSendingToAyrshare(false);
                            }
                        }}
                        isSendingToAyrshare={isSendingToAyrshare}
                        error={ayrshareScheduleError}
                     />
                )}

                {view === 'templates' && (
                    <PostsTemplateLibrary 
                        templates={savedTemplates}
                        onSave={(id, updates) => setSavedTemplates(prev => prev.map(t => t.id === id ? { ...t, ...updates, isNew: false } : t))}
                        onDelete={(id) => setSavedTemplates(prev => prev.filter(t => t.id !== id))}
                        onAddNew={() => {
                             const newTemplate: SavedTemplate = {
                                id: uuidv4(),
                                title: 'New Template',
                                template: '',
                                example: '',
                                instructions: '',
                                dateAdded: new Date().toLocaleDateString(),
                                usageCount: 0,
                                lastUsed: 'Never',
                                isNew: true
                            };
                            setSavedTemplates([newTemplate, ...savedTemplates]);
                        }}
                    />
                )}
                
                {view === 'researcher' && (
                    <PostResearcherPanel 
                        researchScript={researchScript}
                        onResearchScriptChange={setResearchScript}
                        onResearchPosts={async () => {
                            setIsResearching(true);
                            try {
                                const results = await researchPopularPosts(researchScript);
                                setResearchedPosts(results);
                            } catch (e) {
                                console.error(e);
                                alert("Research failed.");
                            } finally {
                                setIsResearching(false);
                            }
                        }}
                        isLoading={isResearching}
                        results={researchedPosts}
                    />
                )}
                
                {/* Article Views */}
                {view === 'headline-generator' && (
                     <HeadlineGeneratorPanel 
                        isLoading={isGeneratingArticleIdeas}
                        sourceType={headlineSourceType}
                        onSourceTypeChange={setHeadlineSourceType}
                        sourceUrl={headlineSourceUrl}
                        onSourceUrlChange={setHeadlineSourceUrl}
                        sourceText={headlineSourceText}
                        onSourceTextChange={setHeadlineSourceText}
                        onGenerateIdeas={async (script) => {
                            setIsGeneratingArticleIdeas(true);
                            try {
                                const source = headlineSourceType === 'url' ? headlineSourceUrl : headlineSourceText;
                                const ideas = await generateArticleIdeas({ sourceArticle: source, userRole, targetAudience, script });
                                setGeneratedArticleIdeas(ideas);
                            } catch(e) {
                                console.error(e);
                                alert("Idea generation failed.");
                            } finally {
                                setIsGeneratingArticleIdeas(false);
                            }
                        }}
                        articleIdeas={generatedArticleIdeas}
                        onStartArticleFromIdea={(idea) => {
                            setGenerateArticleTitle(idea.title);
                            // Pre-fill source text with summary/key points for context if needed, 
                            // or simply navigate to generation. 
                            // For now, let's just navigate and user can refine inputs.
                            setView('generate-articles');
                        }}
                        generateArticleIdeasScript={generateArticleIdeasScript}
                        onGenerateArticleIdeasScriptChange={setGenerateArticleIdeasScript}
                     />
                )}

                {view === 'generate-articles' && (
                    <ArticleGeneratorPanel 
                        wordCount={generateArticleWordCount}
                        onWordCountChange={setGenerateArticleWordCount}
                        sourceType={generateArticleSourceType}
                        onSourceTypeChange={setGenerateArticleSourceType}
                        sourceUrl={generateArticleSourceUrl}
                        onSourceUrlChange={setGenerateArticleSourceUrl}
                        sourceText={generateArticleSourceText}
                        onSourceTextChange={setGenerateArticleSourceText}
                        articleTitle={generateArticleTitle}
                        onArticleTitleChange={setGenerateArticleTitle}
                        generateArticleDestination={generateArticleDestination}
                        onGenerateArticleDestinationChange={setGenerateArticleDestination}
                        articleStarterText={articleStarterText}
                        onArticleStarterTextChange={setArticleStarterText}
                        endOfArticleSummary={endOfArticleSummary}
                        onEndOfArticleSummaryChange={setEndOfArticleSummary}
                        generateArticleScript={generateArticleScript}
                        onGenerateArticleScriptChange={setGenerateArticleScript}
                        isLoading={isGeneratingArticle}
                        onGenerate={async () => {
                            setIsGeneratingArticle(true);
                            try {
                                const sourceContent = generateArticleSourceType === 'url' ? generateArticleSourceUrl : generateArticleSourceText;
                                const article = await generateArticle({
                                    script: generateArticleScript,
                                    wordCount: generateArticleWordCount,
                                    styleReferences: thisIsHowIWriteArticles,
                                    sourceContent,
                                    referenceWorld: referenceWorldContent,
                                    userRole,
                                    targetAudience,
                                    title: generateArticleTitle,
                                    articleStarterText,
                                    endOfArticleSummary,
                                    evalCriteria: articleEvalCriteria,
                                    selectedTemplate: null, // Simplification for this view
                                    allTemplates: savedArticleTemplates,
                                    finalDestination: generateArticleDestination,
                                    finalDestinationGuidelines: DESTINATION_GUIDELINES_MAP[generateArticleDestination]
                                });
                                setGeneratedArticleHistory([ { ...article, type: 'initial' } ]);
                                setCurrentArticleIterationIndex(0);
                                setView('refine-article');
                            } catch (e) {
                                console.error(e);
                                alert("Article generation failed.");
                            } finally {
                                setIsGeneratingArticle(false);
                            }
                        }}
                    />
                )}

                {view === 'refine-article' && (
                     <RefineArticlePanel 
                        isEnhancingArticle={isEnhancingArticle}
                        isPolishingArticle={isPolishingArticle}
                        isGeneratingHeadlines={isGeneratingHeadlines}
                        generatedArticleHistory={generatedArticleHistory}
                        currentArticleIterationIndex={currentArticleIterationIndex}
                        onRevertToIteration={setCurrentArticleIterationIndex}
                        onEnhanceArticle={async (suggestions) => {
                            setIsEnhancingArticle(true);
                            try {
                                const current = generatedArticleHistory[currentArticleIterationIndex];
                                const enhanced = await enhanceArticle({
                                    originalTitle: current.title,
                                    originalContent: current.content,
                                    evalCriteria: articleEvalCriteria,
                                    suggestions
                                });
                                const newHistory = [...generatedArticleHistory, { ...enhanced, type: 'enhanced' as const }];
                                setGeneratedArticleHistory(newHistory);
                                setCurrentArticleIterationIndex(newHistory.length - 1);
                            } catch(e) {
                                console.error(e);
                                alert("Enhancement failed.");
                            } finally {
                                setIsEnhancingArticle(false);
                            }
                        }}
                        onPolishArticle={async (script) => {
                             setIsPolishingArticle(true);
                            try {
                                const current = generatedArticleHistory[currentArticleIterationIndex];
                                const polished = await polishArticle({
                                    originalTitle: current.title,
                                    originalContent: current.content,
                                    evalCriteria: articleEvalCriteria,
                                    styleReferences: thisIsHowIWriteArticles,
                                    polishScript: script
                                });
                                const newHistory = [...generatedArticleHistory, { ...polished, type: 'polished' as const }];
                                setGeneratedArticleHistory(newHistory);
                                setCurrentArticleIterationIndex(newHistory.length - 1);
                            } catch(e) {
                                console.error(e);
                                alert("Polishing failed.");
                            } finally {
                                setIsPolishingArticle(false);
                            }
                        }}
                        onGenerateHeadlinesForArticle={async (script) => {
                            setIsGeneratingHeadlines(true);
                            try {
                                const current = generatedArticleHistory[currentArticleIterationIndex];
                                const headlines = await generateHeadlinesForArticle({
                                    articleContent: current.content,
                                    evalCriteria: headlineEvalCriteriaForArticle,
                                    script
                                });
                                const headlinesWithIds = headlines.map(h => ({ ...h, id: uuidv4() }));
                                setGeneratedHeadlinesForArticle(headlinesWithIds);
                            } catch(e) {
                                console.error(e);
                                alert("Headline generation failed.");
                            } finally {
                                setIsGeneratingHeadlines(false);
                            }
                        }}
                        generatedHeadlinesForArticle={generatedHeadlinesForArticle}
                        onSelectHeadlineForEdit={(headline) => {
                            setSelectedHeadline(headline);
                            setShowHeadlineEditModal(true);
                        }}
                        generateHeadlinesForArticleScript={generateHeadlinesForArticleScript}
                        onGenerateHeadlinesForArticleScriptChange={setGenerateHeadlinesForArticleScript}
                     />
                )}
                
                {view === 'article-templates' && (
                    <ArticleTemplateLibrary 
                        templates={savedArticleTemplates}
                        onSave={(id, updates) => setSavedArticleTemplates(prev => prev.map(t => t.id === id ? { ...t, ...updates, isNew: false } : t))}
                        onDelete={(id) => setSavedArticleTemplates(prev => prev.filter(t => t.id !== id))}
                        onAddNew={() => setShowCreateArticleTemplateModal(true)}
                    />
                )}

                 {view === 'recycle-article' && (
                    <RecycleArticlePanel 
                        articleText={recycleArticleText}
                        onArticleTextChange={setRecycleArticleText}
                        script={recycleArticleScript}
                        onScriptChange={setRecycleArticleScript}
                        isLoading={isRecyclingArticle}
                        onRecycle={async () => {
                            setIsRecyclingArticle(true);
                            try {
                                const recycled = await recycleArticle({
                                    script: recycleArticleScript,
                                    existingArticleText: recycleArticleText,
                                    styleReferences: thisIsHowIWriteArticles,
                                    userRole,
                                    targetAudience,
                                    endOfArticleSummary,
                                    evalCriteria: articleEvalCriteria
                                });
                                setGeneratedArticleHistory([ { ...recycled, type: 'initial' } ]);
                                setCurrentArticleIterationIndex(0);
                                setView('refine-article');
                            } catch(e) {
                                console.error(e);
                                alert("Recycling failed.");
                            } finally {
                                setIsRecyclingArticle(false);
                            }
                        }}
                    />
                )}
                
                {/* Audio Script View */}
                {view === 'audio-script' && (
                    <AudioScriptGeneratorPanel 
                        sourceText={audioScriptSourceText}
                        onSourceTextChange={setAudioScriptSourceText}
                        duration={audioScriptDuration}
                        onDurationChange={setAudioScriptDuration}
                        script={generateAudioScriptScript}
                        onScriptChange={setGenerateAudioScriptScript}
                        onGenerate={handleGenerateAudioScript}
                        isLoading={isGeneratingAudioScript}
                        result={generatedAudioScript}
                    />
                )}
                {view === 'audio-script-archive' && (
                    <ArchivePanel 
                        title="Audio Script Archive" 
                        type="audio" 
                        items={archivedAudioScripts} 
                    />
                )}

                {/* Podcast Views */}
                {view === 'podcast-plan' && (
                     <GeneratePodcastPanel 
                        sourceType={podcastSourceType}
                        onSourceTypeChange={setPodcastSourceType}
                        sourceUrl={podcastSourceUrl}
                        onSourceUrlChange={setPodcastSourceUrl}
                        sourceText={podcastSourceText}
                        onSourceTextChange={setPodcastSourceText}
                        script={generatePodcastIdeasScript}
                        onScriptChange={setGeneratePodcastIdeasScript}
                        
                        onGenerateIdeas={async () => {
                            setIsGeneratingPodcastIdeas(true);
                            try {
                                const source = podcastSourceType === 'url' ? podcastSourceUrl : podcastSourceText;
                                const ideas = await generatePodcastIdeas({ sourceArticle: source, userRole, targetAudience, script: generatePodcastIdeasScript });
                                setGeneratedPodcastIdeas(ideas);
                            } catch (e) { console.error(e); alert("Idea generation failed."); } finally { setIsGeneratingPodcastIdeas(false); }
                        }}
                        isGeneratingIdeas={isGeneratingPodcastIdeas}
                        generatedIdeas={generatedPodcastIdeas}
                        
                        onGenerateAdjacentIdeas={async (idea) => {
                            setIsGeneratingAdjacentPodcastIdeas(true);
                            setSelectedInitialPodcastIdea(idea);
                            try {
                                const ideas = await generateAdjacentPodcastIdeas({ initialIdea: idea, userRole, targetAudience, script: generateAdjacentPodcastIdeasScript });
                                setGeneratedAdjacentPodcastIdeas(ideas);
                            } catch (e) { console.error(e); alert("Adjacent idea generation failed."); } finally { setIsGeneratingAdjacentPodcastIdeas(false); }
                        }}
                        isGeneratingAdjacentIdeas={isGeneratingAdjacentPodcastIdeas}
                        selectedInitialIdea={selectedInitialPodcastIdea}
                        generatedAdjacentIdeas={generatedAdjacentPodcastIdeas}
                        
                        onGeneratePlan={async (idea) => {
                            setIsGeneratingPodcastPlan(true);
                            try {
                                const plan = await generatePodcastPlan({ idea, userRole, script: generatePodcastPlanScript });
                                
                                // Add metadata for archive
                                const planWithMeta: PodcastPlan = {
                                    ...plan,
                                    id: uuidv4(),
                                    dateCreated: new Date().toISOString()
                                };

                                setGeneratedPodcastPlan(planWithMeta);
                                setArchivedPodcastPlans(prev => [planWithMeta, ...prev]);

                            } catch (e) { console.error(e); alert("Plan generation failed."); } finally { setIsGeneratingPodcastPlan(false); }
                        }}
                        isGeneratingPlan={isGeneratingPodcastPlan}
                        generatedPlan={generatedPodcastPlan}
                     />
                )}
                {view === 'podcast-plan-archive' && (
                    <ArchivePanel 
                        title="Podcast Plan Archive" 
                        type="podcast" 
                        items={archivedPodcastPlans} 
                    />
                )}

                {/* Guides */}
                {view === 'posting-guides' && <PostingGuides />}
                {view === 'new-user-guide' && <NewUserGuide />}
                {view === 'checklist' && (
                  <ChecklistGuide 
                    items={checklistItems}
                    onToggleItem={handleToggleChecklistItem}
                  />
                )}

                {/* Settings & Admin */}
                {view === 'persona' && (
                    <PersonaPanel 
                        userRole={userRole}
                        onUserRoleChange={setUserRole}
                        targetAudience={targetAudience}
                        onTargetAudienceChange={setTargetAudience}
                        referenceWorldContent={referenceWorldContent}
                        onReferenceWorldContentChange={setReferenceWorldContent}
                        thisIsHowIWriteArticles={thisIsHowIWriteArticles}
                        onThisIsHowIWriteArticlesChange={setThisIsHowIWriteArticles}
                    />
                )}
                {view === 'settings' && (
                    <SettingsPanel 
                        settings={settings}
                        onSettingsChange={setSettings}
                        isAdmin={isAdmin}
                    />
                )}
                {view === 'backup-restore' && (
                    <BackupRestorePanel 
                        backupData={{
                            userRole, targetAudience, referenceWorldContent, thisIsHowIWriteArticles, articleUrl, articleText, postSourceType,
                            standardStarterText, standardSummaryText, generationScript, savedTemplates, savedArticleTemplates,
                            ayrshareQueue, scheduledPosts, historicalPosts, schedulingInstructions, parsedSchedule, ayrshareLog,
                            settings, adminSettings, researchScript, researchedPosts, headlineEvalCriteria, headlineGenerationScript,
                            generatedHeadlines, headlineSourceType, headlineSourceUrl, headlineSourceText, generatedArticleIdeas,
                            generateArticleIdeasScript, generateArticleWordCount, generateArticleSourceType, generateArticleSourceUrl,
                            generateArticleSourceText, generateArticleScript, recycleArticleText, recycleArticleScript, generatedArticleHistory,
                            currentArticleIterationIndex, generateArticleTitle, articleStarterText, endOfArticleSummary, articleEvalCriteria,
                            headlineEvalCriteriaForArticle, generateHeadlinesForArticleScript, generateArticleDestination,
                            generatedPodcastIdeas, selectedInitialPodcastIdea, generatedAdjacentPodcastIdeas, generatePodcastIdeasScript,
                            generatedPodcastPlan, podcastSourceUrl, podcastSourceText, podcastSourceType, podcastTitleSuggestions, finalPodcastIdeaForPlan, archivedPodcastPlans,
                            audioScriptSourceText, audioScriptDuration, generateAudioScriptScript, generatedAudioScript, archivedAudioScripts, checklistItems
                        }}
                        onRestore={handleRestoreData}
                        userEmail={userEmail || 'Guest'}
                    />
                )}
                {view === 'admin' && isAdmin && (
                    <AdminPanel 
                        settings={adminSettings} 
                        onSettingsChange={setAdminSettings}
                        checklistItems={checklistItems}
                        onChecklistChange={setChecklistItems}
                    />
                )}
            </div>
          </main>
        </>
      )}
      
      {/* Modals */}
      {showCreateArticleTemplateModal && (
         <CreateArticleTemplateModal 
            onCreateTemplate={async (text) => {
                setIsCreatingArticleTemplate(true);
                try {
                    const newTemplate = await createArticleTemplateFromText({ articleText: text, existingTemplates: savedArticleTemplates });
                    setSavedArticleTemplates(prev => [...prev, { ...newTemplate, id: uuidv4(), isNew: true }]);
                    return true;
                } catch (e: any) {
                    setCreateArticleTemplateError(e.message);
                    return false;
                } finally {
                    setIsCreatingArticleTemplate(false);
                }
            }}
            onClose={() => {
                setShowCreateArticleTemplateModal(false);
                setCreateArticleTemplateError(null);
            }}
            isLoading={isCreatingArticleTemplate}
            error={createArticleTemplateError}
         />
      )}

      {showHeadlineEditModal && selectedHeadline && (
        <HeadlineEditModal 
            isOpen={showHeadlineEditModal}
            headline={selectedHeadline}
            onClose={() => setShowHeadlineEditModal(false)}
            onSave={(edited) => {
                const updatedHistory = [...generatedArticleHistory];
                updatedHistory[currentArticleIterationIndex] = {
                    ...updatedHistory[currentArticleIterationIndex],
                    title: edited.headline,
                    content: `# ${edited.headline}\n${edited.subheadline ? `### ${edited.subheadline}\n` : ''}\n${updatedHistory[currentArticleIterationIndex].content}`,
                    headlineApplied: true
                };
                setGeneratedArticleHistory(updatedHistory);
                setShowHeadlineEditModal(false);
            }}
        />
      )}
    </div>
  );
}
