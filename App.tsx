

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
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
  GenerationResults,
  ResearchedPost,
} from './services/geminiService.ts';

import {
  postToAyrshare,
} from './services/ayrshareService.ts';

// FIX: Importing the script constants that were missing from scriptService.ts
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
} from './types.ts';

const LOCAL_STORAGE_KEY = 'socialMediaMinionData';
const ADMIN_EMAIL = 'dave@bigagility.com'; 

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
  
  // General error state
  const [appError, setAppError] = useState<React.ReactNode | null>(null);

  const playBeep = useCallback(() => {
    try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        if (!audioContext) return;
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5 tone
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.2);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
    } catch (e) {
        console.error("Could not play beep sound:", e);
    }
  }, []);

  useEffect(() => {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedData) {
      try {
        const parsedData: BackupData = JSON.parse(savedData);
        if (parsedData.userEmail) setUserEmail(parsedData.userEmail);
        if (parsedData.userEmail === ADMIN_EMAIL) setIsAdmin(true);

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
        if (parsedData.settings) setSettings(parsedData.settings);
        if (parsedData.adminSettings) setAdminSettings(parsedData.adminSettings);
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
        setPodcastSourceType(parsedData.podcastSourceType || 'url');
        setPodcastSourceUrl(parsedData.podcastSourceUrl || '');
        setPodcastSourceText(parsedData.podcastSourceText || '');
        setGeneratedPodcastIdeas(parsedData.generatedPodcastIdeas || null);
        setSelectedInitialPodcastIdea(parsedData.selectedInitialPodcastIdea || null);
        setGeneratedAdjacentPodcastIdeas(parsedData.generatedAdjacentPodcastIdeas || null);
        setGeneratedPodcastPlan(parsedData.generatedPodcastPlan || null);
        setPodcastTitleSuggestions(parsedData.podcastTitleSuggestions || null);
        setFinalPodcastIdeaForPlan(parsedData.finalPodcastIdeaForPlan || null);

      } catch (error) {
        console.error("Failed to parse local storage data:", error);
      }
    }
  }, []);

  const backupData = useMemo<BackupData>(() => ({
    userEmail,
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
    headlineEvalCriteriaForArticle: headlineEvalCriteria,
    generateHeadlinesForArticleScript,
    generateArticleDestination,
    finalDestinationGuidelines: DESTINATION_GUIDELINES_MAP[generateArticleDestination],
    podcastSourceType,
    podcastSourceUrl,
    podcastSourceText,
    generatedPodcastIdeas,
    selectedInitialPodcastIdea,
    generatedAdjacentPodcastIdeas,
    generatedPodcastPlan,
    podcastTitleSuggestions,
    finalPodcastIdeaForPlan,
  }), [
    userEmail, userRole, targetAudience, referenceWorldContent, thisIsHowIWriteArticles,
    articleUrl, articleText, postSourceType, standardStarterText, standardSummaryText,
    generationScript, savedTemplates, savedArticleTemplates, ayrshareQueue, scheduledPosts, historicalPosts,
    schedulingInstructions, parsedSchedule, ayrshareLog, settings, adminSettings,
    researchScript, researchedPosts, headlineEvalCriteria, headlineGenerationScript,
    generatedHeadlines, headlineSourceType, headlineSourceUrl, headlineSourceText,
    generatedArticleIdeas, generateArticleIdeasScript, generateArticleWordCount,
    generateArticleSourceType, generateArticleSourceUrl, generateArticleSourceText,
    generateArticleScript, recycleArticleText, recycleArticleScript,
    generatedArticleHistory, currentArticleIterationIndex, generateArticleTitle,
    articleStarterText, endOfArticleSummary, articleEvalCriteria,
    generateHeadlinesForArticleScript, generateArticleDestination,
    podcastSourceType, podcastSourceUrl, podcastSourceText, generatedPodcastIdeas, 
    selectedInitialPodcastIdea, generatedAdjacentPodcastIdeas, generatedPodcastPlan,
    podcastTitleSuggestions, finalPodcastIdeaForPlan,
  ]);

  useEffect(() => {
    if (userEmail) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(backupData));
    }
  }, [backupData, userEmail]);
  
  const logUserActivity = useCallback((type: 'post' | 'article') => {
    if (!userEmail) return;
    setAdminSettings(prev => {
        const newActivity = { ...prev.userActivity };
        const userActivity = newActivity[userEmail] || { posts: [], articles: [] };
        if (type === 'post') {
            userActivity.posts.push(Date.now());
        } else {
            userActivity.articles.push(Date.now());
        }
        newActivity[userEmail] = userActivity;
        return { ...prev, userActivity: newActivity };
    });
  }, [userEmail]);

  const handleSignIn = useCallback((email: string, password?: string) => {
    setAuthError(null);
    const formattedEmail = email.toLowerCase().trim();
    if (formattedEmail === ADMIN_EMAIL) {
      setIsAdmin(true);
      setUserEmail(formattedEmail);
      setView('generate-posts');
      setShowLogin(false);
    } else if (adminSettings.authorizedEmails.includes(formattedEmail) && password === adminSettings.secretPassword) {
      setIsAdmin(false);
      setUserEmail(formattedEmail);
      setView('generate-posts');
      setShowLogin(false);
    } else {
      setAuthError(
        <>
          <p className="font-bold">Authentication Failed</p>
          <p className="text-xs mt-1">Please check your email and password. If you are not the admin, you need the secret password provided by the admin.</p>
        </>
      );
    }
  }, [adminSettings]);
  
  const handleSignOut = useCallback(() => {
      setUserEmail(null);
      setIsAdmin(false);
      setView('landing');
  }, []);

  const handleNavigate = useCallback((page: string) => {
    switch(page) {
        case 'home': setView('landing'); break;
        case 'pricing': setView('pricing'); break;
        case 'questions': setView('faq'); break;
        default: setView('landing');
    }
  }, []);

  const handleGeneratePosts = useCallback(async () => {
    if ((postSourceType === 'url' && !articleUrl) || (postSourceType === 'text' && !articleText)) {
      setAppError("Please provide a source URL or text.");
      return;
    }
    setAppError(null);
    setIsGenerating(true);
    setGenerationResults(null);
    try {
      const results = await generateAndEvaluatePosts({
        articleUrl,
        articleText,
        templates: savedTemplates,
        script: generationScript,
        targetAudience,
        standardSummaryText,
        standardStarterText,
        userRole,
      });
      setGenerationResults(results);
      logUserActivity('post');
    } catch (error: any) {
      setAppError(<><strong>Generation Failed:</strong> {error.message}</>);
    } finally {
      setIsGenerating(false);
      playBeep();
    }
  }, [articleUrl, articleText, savedTemplates, generationScript, targetAudience, standardSummaryText, standardStarterText, userRole, postSourceType, logUserActivity, playBeep]);

  const handleResearchPosts = useCallback(async () => {
    setAppError(null);
    setIsResearching(true);
    setResearchedPosts(null);
    try {
      const results = await researchPopularPosts(researchScript);
      setResearchedPosts(results);
       logUserActivity('post');
    } catch (error: any) {
      setAppError(<><strong>Research Failed:</strong> {error.message}</>);
    } finally {
      setIsResearching(false);
      playBeep();
    }
  }, [researchScript, logUserActivity, playBeep]);

  const handleUpdateSchedule = useCallback(async () => {
    setIsUpdatingSchedule(true);
    setAyrshareScheduleError(null);
    try {
        const times = await parseSchedule(schedulingInstructions);
        setParsedSchedule(times);

        if (times.length === 0) {
            setAyrshareScheduleError("The AI couldn't determine any specific times from your instructions. Please be more specific, e.g., 'Post at 8am and 5pm UK time'.");
            return;
        }

        const now = new Date();
        let currentScheduleTime = new Date(now);
        
        const findNextSlot = (fromTime: Date): Date => {
            let nextTime = new Date(fromTime);
            nextTime.setSeconds(0, 0);

            const sortedTimes = [...times].sort();

            while (true) {
                for (const time of sortedTimes) {
                    const [hour, minute] = time.split(':').map(Number);
                    const potentialNextTime = new Date(nextTime);
                    potentialNextTime.setHours(hour, minute);
                    
                    if (potentialNextTime > fromTime) {
                        return potentialNextTime;
                    }
                }
                nextTime.setDate(nextTime.getDate() + 1);
                nextTime.setHours(0,0,0,0);
                fromTime = new Date(nextTime);
                fromTime.setHours(0,0,0,0);
                fromTime.setMinutes(-1);
            }
        };

        const newScheduledPosts = ayrshareQueue.map(post => {
            currentScheduleTime = findNextSlot(currentScheduleTime);
            return {
                ...post,
                scheduledTime: currentScheduleTime.toISOString(),
                status: 'scheduled' as const,
            };
        });
        
        setScheduledPosts(prev => [...prev, ...newScheduledPosts].sort((a,b) => new Date(a.scheduledTime!).getTime() - new Date(b.scheduledTime!).getTime()));
        setAyrshareQueue([]);
        setHistoricalPosts(prev => prev.filter(p => new Date(p.scheduledTime!).getTime() >= now.getTime()));

    } catch (error) {
        console.error("Scheduling Error:", error);
        setAyrshareScheduleError("Failed to update schedule. Please check your instructions and try again.");
    } finally {
        setIsUpdatingSchedule(false);
        playBeep();
    }
  }, [schedulingInstructions, ayrshareQueue, historicalPosts, playBeep]);

  const handleSendToAyrshare = useCallback(async () => {
    if (!settings.ayrshareApiKey) {
        setAyrshareScheduleError("Ayrshare API Key is not set in Settings.");
        return;
    }
    setIsSendingToAyrshare(true);
    setAyrshareScheduleError(null);

    const postsToSend = scheduledPosts.filter(p => p.status === 'scheduled');
    const promises = postsToSend.map(post => 
        postToAyrshare(post.content, settings.ayrshareApiKey, post.platforms, post.scheduledTime)
    );

    const results = await Promise.allSettled(promises);
    let hasErrors = false;

    const updatedScheduledPosts = [...scheduledPosts];

    results.forEach((result, index) => {
        const originalPost = postsToSend[index];
        const postInSchedule = updatedScheduledPosts.find(p => p.id === originalPost.id);
        if (!postInSchedule) return;

        if (result.status === 'fulfilled' && result.value.status === 'success') {
            postInSchedule.status = 'sent-to-ayrshare';
        } else {
            postInSchedule.status = 'error';
            hasErrors = true;
            console.error(`Failed to send post "${originalPost.title}" to Ayrshare:`, result.status === 'rejected' ? result.reason : (result.value as any).message);
        }
    });

    if (hasErrors) {
        setAyrshareScheduleError("Some posts failed to schedule with Ayrshare. They have been marked with an 'Error' status.");
    }

    setScheduledPosts(updatedScheduledPosts);
    setIsSendingToAyrshare(false);
  }, [scheduledPosts, settings.ayrshareApiKey]);

  const handleGenerateArticleIdeas = useCallback(async (script: string) => {
    const sourceContent = generateArticleSourceType === 'url' ? generateArticleSourceUrl : generateArticleSourceText;
    if (!sourceContent.trim()) {
        setAppError("Please provide a source URL or text for idea generation.");
        return;
    }
    setAppError(null);
    setIsGeneratingArticleIdeas(true);
    setGeneratedArticleIdeas(null);
    try {
        const ideas = await generateArticleIdeas({
            sourceArticle: sourceContent,
            userRole,
            targetAudience,
            script,
        });
        setGeneratedArticleIdeas(ideas);
        logUserActivity('article');
    } catch (error: any) {
        setAppError(<><strong>Idea Generation Failed:</strong> {error.message}</>);
    } finally {
        setIsGeneratingArticleIdeas(false);
        playBeep();
    }
  }, [generateArticleSourceType, generateArticleSourceUrl, generateArticleSourceText, userRole, targetAudience, logUserActivity, playBeep]);
  
  const handleStartArticleFromIdea = useCallback((idea: ArticleIdea) => {
      setGenerateArticleTitle(idea.title);
      const sourceTextFromIdea = `Title: ${idea.title}\nSummary: ${idea.summary}\nKey Points: ${idea.keyPoints.join(', ')}`;
      setGenerateArticleSourceText(sourceTextFromIdea);
      setGenerateArticleSourceType('text');
      setGeneratedArticleIdeas(null); // Clear ideas
      setView('generate-articles');
  }, []);

  const handleGenerateArticle = useCallback(async (selectedTemplate: SavedArticleTemplate | null) => {
    const sourceContent = generateArticleSourceType === 'url' ? generateArticleSourceUrl : generateArticleSourceText;
    if (!sourceContent.trim()) {
      setAppError("Please provide a source URL or text to generate the article.");
      return;
    }
    setAppError(null);
    setIsGeneratingArticle(true);
    try {
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
        selectedTemplate,
        allTemplates: savedArticleTemplates,
        finalDestination: generateArticleDestination,
        finalDestinationGuidelines: DESTINATION_GUIDELINES_MAP[generateArticleDestination],
      });
      article.type = 'initial';
      setGeneratedArticleHistory([article]);
      setCurrentArticleIterationIndex(0);
      setGeneratedHeadlinesForArticle(null);
      setView('refine-article');
      logUserActivity('article');
    } catch (error: any) {
      setAppError(<><strong>Article Generation Failed:</strong> {error.message}</>);
    } finally {
      setIsGeneratingArticle(false);
      setShowSelectArticleTemplateModal(false);
      playBeep();
    }
  }, [
    generateArticleSourceType, generateArticleSourceUrl, generateArticleSourceText,
    generateArticleScript, generateArticleWordCount, thisIsHowIWriteArticles,
    referenceWorldContent, userRole, targetAudience, generateArticleTitle,
    articleStarterText, endOfArticleSummary, articleEvalCriteria,
    savedArticleTemplates, generateArticleDestination, logUserActivity, playBeep
  ]);

  const handleEnhanceArticle = useCallback(async (selectedSuggestions: Suggestion[]) => {
      const currentArticle = generatedArticleHistory[currentArticleIterationIndex];
      if (!currentArticle) return;

      setIsEnhancingArticle(true);
      setAppError(null);
      try {
        const enhancedArticle = await enhanceArticle({
            originalTitle: currentArticle.title,
            originalContent: currentArticle.content,
            evalCriteria: articleEvalCriteria,
            suggestions: selectedSuggestions
        });
        enhancedArticle.type = 'enhanced';
        setGeneratedArticleHistory(prev => [...prev, enhancedArticle]);
        setCurrentArticleIterationIndex(prev => prev + 1);
        setGeneratedHeadlinesForArticle(null); // Clear headlines as article has changed
        logUserActivity('article');
      } catch (error: any) {
          setAppError(<><strong>Article Enhancement Failed:</strong> {error.message}</>);
      } finally {
          setIsEnhancingArticle(false);
          playBeep();
      }
  }, [generatedArticleHistory, currentArticleIterationIndex, articleEvalCriteria, logUserActivity, playBeep]);
  
  const handlePolishArticle = useCallback(async (polishScript: string) => {
      const currentArticle = generatedArticleHistory[currentArticleIterationIndex];
      if (!currentArticle) return;

      setIsPolishingArticle(true);
      setAppError(null);
      try {
        const polishedArticle = await polishArticle({
            originalTitle: currentArticle.title,
            originalContent: currentArticle.content,
            evalCriteria: articleEvalCriteria,
            styleReferences: thisIsHowIWriteArticles,
            polishScript,
        });
        polishedArticle.type = 'polished';
        setGeneratedArticleHistory(prev => [...prev, polishedArticle]);
        setCurrentArticleIterationIndex(prev => prev + 1);
        setGeneratedHeadlinesForArticle(null);
        logUserActivity('article');
      } catch (error: any) {
          setAppError(<><strong>Article Polishing Failed:</strong> {error.message}</>);
      } finally {
          setIsPolishingArticle(false);
          playBeep();
      }
  }, [generatedArticleHistory, currentArticleIterationIndex, articleEvalCriteria, thisIsHowIWriteArticles, logUserActivity, playBeep]);
  
  const handleGenerateHeadlinesForArticle = useCallback(async (script: string) => {
    const currentArticle = generatedArticleHistory[currentArticleIterationIndex];
    if (!currentArticle) return;

    setIsGeneratingHeadlines(true);
    setAppError(null);
    try {
        const headlines = await generateHeadlinesForArticle({
            articleContent: `# ${currentArticle.title}\n\n${currentArticle.content}`,
            evalCriteria: headlineEvalCriteriaForArticle,
            script,
        });
        setGeneratedHeadlinesForArticle(headlines.map(h => ({ ...h, id: uuidv4() })));
    } catch (error: any) {
        setAppError(<><strong>Headline Generation Failed:</strong> {error.message}</>);
    } finally {
        setIsGeneratingHeadlines(false);
        playBeep();
    }
  }, [generatedArticleHistory, currentArticleIterationIndex, headlineEvalCriteriaForArticle, playBeep]);

  const handleCreateArticleTemplateFromText = useCallback(async (articleText: string) => {
    setIsCreatingArticleTemplate(true);
    setCreateArticleTemplateError(null);
    try {
        const newTemplateData = await createArticleTemplateFromText({ articleText, existingTemplates: savedArticleTemplates });
        const newTemplate: SavedArticleTemplate = {
            ...newTemplateData,
            id: uuidv4(),
        };
        setSavedArticleTemplates(prev => [newTemplate, ...prev]);
        return true; // Indicate success
    } catch (error: any) {
        setCreateArticleTemplateError(<><strong>Template Creation Failed:</strong> {error.message}</>);
        return false; // Indicate failure
    } finally {
        setIsCreatingArticleTemplate(false);
        playBeep();
    }
  }, [savedArticleTemplates, playBeep]);
  
  const handleRecycleArticle = useCallback(async () => {
    if (!recycleArticleText.trim()) {
      setAppError("Please paste an article to recycle.");
      return;
    }
    setAppError(null);
    setIsRecyclingArticle(true);
    try {
      const article = await recycleArticle({
        script: recycleArticleScript,
        existingArticleText: recycleArticleText,
        styleReferences: thisIsHowIWriteArticles,
        userRole,
        targetAudience,
        endOfArticleSummary,
        evalCriteria: articleEvalCriteria,
      });
      article.type = 'initial';
      setGeneratedArticleHistory([article]);
      setCurrentArticleIterationIndex(0);
      setGeneratedHeadlinesForArticle(null);
      setView('refine-article');
      logUserActivity('article');
    } catch (error: any) {
      setAppError(<><strong>Article Recycling Failed:</strong> {error.message}</>);
    } finally {
      setIsRecyclingArticle(false);
      playBeep();
    }
  }, [
    recycleArticleText, recycleArticleScript, thisIsHowIWriteArticles,
    userRole, targetAudience, endOfArticleSummary, articleEvalCriteria, logUserActivity, playBeep
  ]);

  const handleGeneratePodcastIdeas = useCallback(async () => {
    const sourceContent = podcastSourceType === 'url' ? podcastSourceUrl : podcastSourceText;
    if (!sourceContent.trim()) {
        setAppError("Please provide a source URL or text for idea generation.");
        return;
    }
    setAppError(null);
    setIsGeneratingPodcastIdeas(true);
    setGeneratedPodcastIdeas(null);
    setSelectedInitialPodcastIdea(null);
    setGeneratedAdjacentPodcastIdeas(null);
    setGeneratedPodcastPlan(null);
    try {
        const ideas = await generatePodcastIdeas({
            sourceArticle: sourceContent,
            userRole,
            targetAudience,
            script: generatePodcastIdeasScript,
        });
        setGeneratedPodcastIdeas(ideas);
    } catch (error: any) {
        setAppError(<><strong>Podcast Idea Generation Failed:</strong> {error.message}</>);
    } finally {
        setIsGeneratingPodcastIdeas(false);
        playBeep();
    }
  }, [podcastSourceType, podcastSourceUrl, podcastSourceText, userRole, targetAudience, generatePodcastIdeasScript, playBeep]);

  const handleGenerateAdjacentPodcastIdeas = useCallback(async (idea: PodcastIdea) => {
    setAppError(null);
    setSelectedInitialPodcastIdea(idea);
    setIsGeneratingAdjacentPodcastIdeas(true);
    setGeneratedAdjacentPodcastIdeas(null);
    try {
        const ideas = await generateAdjacentPodcastIdeas({
            initialIdea: idea,
            userRole,
            targetAudience,
            script: generateAdjacentPodcastIdeasScript,
        });
        setGeneratedAdjacentPodcastIdeas(ideas);
    } catch (error: any) {
        setAppError(<><strong>Adjacent Podcast Idea Generation Failed:</strong> {error.message}</>);
    } finally {
        setIsGeneratingAdjacentPodcastIdeas(false);
        playBeep();
    }
  }, [userRole, targetAudience, generateAdjacentPodcastIdeasScript, playBeep]);

  const handleGeneratePodcastTitleSuggestions = useCallback(async (idea: PodcastIdea) => {
    setAppError(null);
    setFinalPodcastIdeaForPlan(idea);
    setIsGeneratingPodcastTitles(true);
    setPodcastTitleSuggestions(null);
    try {
        const titles = await generatePodcastTitleSuggestions({ idea });
        setPodcastTitleSuggestions([idea.title, ...titles].slice(0, 5));
        setShowPodcastTitleModal(true);
    } catch (error: any) {
        setAppError(<><strong>Podcast Title Suggestion Failed:</strong> {error.message}</>);
    } finally {
        setIsGeneratingPodcastTitles(false);
        playBeep();
    }
  }, [playBeep]);

  const handleGeneratePodcastPlan = useCallback(async (idea: PodcastIdea) => {
      setAppError(null);
      setIsGeneratingPodcastPlan(true);
      setGeneratedPodcastPlan(null);
      setShowPodcastTitleModal(false);
      try {
          const plan = await generatePodcastPlan({
              idea,
              userRole,
              script: generatePodcastPlanScript
          });
          setGeneratedPodcastPlan(plan);
      } catch (error: any) {
          setAppError(<><strong>Podcast Plan Generation Failed:</strong> {error.message}</>);
      } finally {
          setIsGeneratingPodcastPlan(false);
          setFinalPodcastIdeaForPlan(null);
          setPodcastTitleSuggestions(null);
          playBeep();
      }
  }, [userRole, generatePodcastPlanScript, playBeep]);

  const handleFinalizePodcastPlan = useCallback((selectedTitle: string) => {
    if (!finalPodcastIdeaForPlan) {
        setAppError("Error: Could not find the podcast idea to finalize.");
        return;
    }
    const finalIdeaWithChosenTitle = {
        ...finalPodcastIdeaForPlan,
        title: selectedTitle,
    };
    handleGeneratePodcastPlan(finalIdeaWithChosenTitle);
  }, [finalPodcastIdeaForPlan, handleGeneratePodcastPlan]);

  const handleRestoreBackup = useCallback((data: BackupData) => {
    setUserEmail(data.userEmail || null);
    setIsAdmin(data.userEmail === ADMIN_EMAIL);
    setUserRole(data.userRole);
    setTargetAudience(data.targetAudience);
    setReferenceWorldContent(data.referenceWorldContent || '');
    setThisIsHowIWriteArticles(data.thisIsHowIWriteArticles || DEFAULT_THIS_IS_HOW_I_WRITE_ARTICLES);
    setArticleUrl(data.articleUrl);
    setArticleText(data.articleText);
    setPostSourceType(data.postSourceType);
    setStandardStarterText(data.standardStarterText);
    setStandardSummaryText(data.standardSummaryText);
    setGenerationScript(data.generationScript);
    setSavedTemplates(data.savedTemplates);
    setSavedArticleTemplates(data.savedArticleTemplates || initialArticleTemplates);
    setAyrshareQueue(data.ayrshareQueue);
    setScheduledPosts(data.scheduledPosts || []);
    setHistoricalPosts(data.historicalPosts || []);
    setSchedulingInstructions(data.schedulingInstructions);
    setParsedSchedule(data.parsedSchedule);
    setAyrshareLog(data.ayrshareLog);
    setSettings(data.settings);
    setAdminSettings(data.adminSettings);
    setResearchScript(data.researchScript);
    setResearchedPosts(data.researchedPosts);
    setHeadlineEvalCriteria(data.headlineEvalCriteria || DEFAULT_HEADLINE_EVAL_CRITERIA);
    setHeadlineGenerationScript(data.headlineGenerationScript || GENERATE_HEADLINES_FOR_ARTICLE_SCRIPT);
    setGeneratedHeadlines(data.generatedHeadlines || null);
    setHeadlineSourceType(data.headlineSourceType || 'url');
    setHeadlineSourceUrl(data.headlineSourceUrl || '');
    setHeadlineSourceText(data.headlineSourceText || '');
    setGeneratedArticleIdeas(data.generatedArticleIdeas || null);
    setGenerateArticleIdeasScript(data.generateArticleIdeasScript || GENERATE_ARTICLE_IDEAS_SCRIPT);
    setGenerateArticleWordCount(data.generateArticleWordCount || 2000);
    setGenerateArticleSourceType(data.generateArticleSourceType || 'url');
    setGenerateArticleSourceUrl(data.generateArticleSourceUrl || '');
    setGenerateArticleSourceText(data.generateArticleSourceText || '');
    setGenerateArticleScript(data.generateArticleScript || GENERATE_ARTICLE_SCRIPT);
    setRecycleArticleText(data.recycleArticleText || '');
    setRecycleArticleScript(data.recycleArticleScript || RECYCLE_ARTICLE_SCRIPT);
    setGeneratedArticleHistory(data.generatedArticleHistory || []);
    setCurrentArticleIterationIndex(data.currentArticleIterationIndex || 0);
    setGenerateArticleTitle(data.generateArticleTitle || '');
    setArticleStarterText(data.articleStarterText || '');
    setEndOfArticleSummary(data.endOfArticleSummary || DEFAULT_END_OF_ARTICLE_SUMMARY);
    setArticleEvalCriteria(data.articleEvalCriteria || DEFAULT_ARTICLE_EVAL_CRITERIA);
    setHeadlineEvalCriteriaForArticle(data.headlineEvalCriteriaForArticle || DEFAULT_HEADLINE_EVAL_CRITERIA);
    setGenerateHeadlinesForArticleScript(data.generateHeadlinesForArticleScript || GENERATE_HEADLINES_FOR_ARTICLE_SCRIPT);
    setGenerateArticleDestination(data.generateArticleDestination || 'LinkedIn');
    setPodcastSourceType(data.podcastSourceType || 'url');
    setPodcastSourceUrl(data.podcastSourceUrl || '');
    setPodcastSourceText(data.podcastSourceText || '');
    setGeneratedPodcastIdeas(data.generatedPodcastIdeas || null);
    setSelectedInitialPodcastIdea(data.selectedInitialPodcastIdea || null);
    setGeneratedAdjacentPodcastIdeas(data.generatedAdjacentPodcastIdeas || null);
    setGeneratedPodcastPlan(data.generatedPodcastPlan || null);
    setPodcastTitleSuggestions(data.podcastTitleSuggestions || null);
    setFinalPodcastIdeaForPlan(data.finalPodcastIdeaForPlan || null);

  }, []);
  
  const handlePostNow = useCallback(async (postId: string) => {
      const post = ayrshareQueue.find(p => p.id === postId);
      if (!post) {
          setPostToAyrshareError("Post not found in queue.");
          return;
      }
      if (!settings.ayrshareApiKey) {
          setPostToAyrshareError("Ayrshare API Key is not set in Settings.");
          return;
      }
      setPostingNowId(postId);
      setPostToAyrshareError(null);
      try {
          const response = await postToAyrshare(post.content, settings.ayrshareApiKey, post.platforms);
          if (response.status === 'success' && response.id) {
              const newSentPost: SentPost = {
                  ...post,
                  id: response.id,
                  sentAt: new Date().toISOString(),
                  platforms: post.platforms || [],
              };
              setAyrshareLog(prev => [newSentPost, ...prev]);
              setAyrshareQueue(prev => prev.filter(p => p.id !== postId));
          } else {
              throw new Error(response.message || "Failed to post to Ayrshare.");
          }
      } catch (error: any) {
          setPostToAyrshareError(<><strong>Post Failed:</strong> {error.message}</>);
      } finally {
          setPostingNowId(null);
      }
  }, [ayrshareQueue, settings.ayrshareApiKey]);
  
  const handleQuickPost = useCallback(async () => {
    const post = ayrshareQueue[0];
     if (!post) {
          setPostToAyrshareError("Post queue is empty.");
          return;
      }
      if (!settings.ayrshareApiKey) {
          setPostToAyrshareError("Ayrshare API Key is not set in Settings.");
          return;
      }
      setPostingNowId(post.id);
      setPostToAyrshareError(null);
      setQuickPostSuccess(null);
      try {
          const response = await postToAyrshare(post.content, settings.ayrshareApiKey, post.platforms);
          if (response.status === 'success' && response.id) {
              const newSentPost: SentPost = {
                  ...post,
                  id: response.id,
                  sentAt: new Date().toISOString(),
                  platforms: post.platforms || [],
              };
              setAyrshareLog(prev => [newSentPost, ...prev]);
              setAyrshareQueue(prev => prev.slice(1));
              setQuickPostSuccess(post.content);
          } else {
              throw new Error(response.message || "Failed to post to Ayrshare.");
          }
      } catch (error: any) {
          setPostToAyrshareError(<><strong>Quick Post Failed:</strong> {error.message}</>);
      } finally {
          setPostingNowId(null);
      }
  }, [ayrshareQueue, settings.ayrshareApiKey]);

  if (!userEmail) {
    if (view === 'pricing') return <PricingPage onLoginClick={() => setShowLogin(true)} onNavigate={handleNavigate} currentPage={view} />;
    if (view === 'faq') return <FAQPage onLoginClick={() => setShowLogin(true)} onNavigate={handleNavigate} currentPage={view} />;
    
    return (
        <>
            <LandingPage onLoginClick={() => setShowLogin(true)} onNavigate={handleNavigate} currentPage={view} />
            {showLogin && <LoginScreen onSignIn={handleSignIn} error={authError} adminEmail={ADMIN_EMAIL} onClose={() => setShowLogin(false)} />}
        </>
    );
  }

  const renderView = () => {
    switch (view) {
      case 'generate-posts':
        return <GenerationPanel
          articleUrl={articleUrl} onArticleUrlChange={setArticleUrl}
          articleText={articleText} onArticleTextChange={setArticleText}
          sourceType={postSourceType} onSourceTypeChange={setPostSourceType}
          standardStarterText={standardStarterText} onStandardStarterTextChange={setStandardStarterText}
          standardSummaryText={standardSummaryText} onStandardSummaryTextChange={setStandardSummaryText}
          generationScript={generationScript} onGenerationScriptChange={setGenerationScript}
          onGenerate={handleGeneratePosts}
          isLoading={isGenerating}
          results={generationResults}
          onSendToAyrshareQueue={(post, platforms) => setAyrshareQueue(prev => [{ ...post, id: uuidv4(), platforms }, ...prev])}
        />;
      case 'template-library':
        return <PostsTemplateLibrary
            templates={savedTemplates}
            onSave={(id, updates) => {
                const newTemplates = savedTemplates.map(t => t.id === id ? { ...t, ...updates, isNew: false } : t);
                setSavedTemplates(newTemplates);
            }}
            onDelete={(id) => setSavedTemplates(savedTemplates.filter(t => t.id !== id))}
            onAddNew={() => {
                const newTemplate: SavedTemplate & { isNew: true } = {
                    id: uuidv4(),
                    title: 'New Template',
                    template: '{{Hook}}\n\n{{MainPoint}}\n\n{{CallToAction}}',
                    example: 'This is an example post.',
                    instructions: 'Fill in the placeholders.',
                    dateAdded: new Date().toLocaleDateString(),
                    usageCount: 0,
                    lastUsed: 'Never',
                    isNew: true,
                };
                setSavedTemplates([newTemplate, ...savedTemplates]);
            }}
        />;
      case 'ayrshare-queue':
        return <QueuedPostsDisplay 
            queuedPosts={ayrshareQueue}
            onDeletePost={(id) => setAyrshareQueue(ayrshareQueue.filter(p => p.id !== id))}
            onUpdatePost={(id, updates) => setAyrshareQueue(ayrshareQueue.map(p => p.id === id ? { ...p, ...updates } : p))}
            title="Posts Queue"
            onPostNow={handlePostNow}
            postingNowId={postingNowId}
            error={postToAyrshareError}
            onClearError={() => setPostToAyrshareError(null)}
        />;
      case 'ayrshare-log':
        return <QueuedPostsDisplay 
            queuedPosts={ayrshareLog as QueuedPost[]} // FIX: Cast SentPost[] to QueuedPost[] to reuse component
            readOnly
            title="Sent Posts Log"
            emptyMessage="No posts have been sent yet."
        />;
      case 'scheduler':
        return <Scheduler 
            instructions={schedulingInstructions}
            onInstructionsChange={setSchedulingInstructions}
            onUpdateSchedule={handleUpdateSchedule}
            isUpdating={isUpdatingSchedule}
            parsedSchedule={parsedSchedule}
            queueCount={ayrshareQueue.length}
            scheduledPosts={scheduledPosts}
            historicalPosts={historicalPosts}
            onSendToAyrshare={handleSendToAyrshare}
            isSendingToAyrshare={isSendingToAyrshare}
            error={ayrshareScheduleError}
        />;
      case 'settings':
        return <SettingsPanel settings={settings} onSettingsChange={setSettings} isAdmin={isAdmin} />;
      case 'persona':
          return <PersonaPanel 
            userRole={userRole} onUserRoleChange={setUserRole}
            targetAudience={targetAudience} onTargetAudienceChange={setTargetAudience}
            referenceWorldContent={referenceWorldContent} onReferenceWorldContentChange={setReferenceWorldContent}
            thisIsHowIWriteArticles={thisIsHowIWriteArticles} onThisIsHowIWriteArticlesChange={setThisIsHowIWriteArticles}
          />;
      case 'admin':
        return isAdmin ? <AdminPanel settings={adminSettings} onSettingsChange={setAdminSettings} /> : <p>Access Denied</p>;
      case 'backup-restore':
        return <BackupRestorePanel backupData={backupData} onRestore={handleRestoreBackup} userEmail={userEmail} />;
      case 'researcher':
        return <PostResearcherPanel 
            researchScript={researchScript}
            onResearchScriptChange={setResearchScript}
            onResearchPosts={handleResearchPosts}
            isLoading={isResearching}
            results={researchedPosts}
        />
      case 'generate-headlines':
        return <HeadlineGeneratorPanel 
            isLoading={isGeneratingArticleIdeas}
            sourceType={generateArticleSourceType} onSourceTypeChange={setGenerateArticleSourceType}
            sourceUrl={generateArticleSourceUrl} onSourceUrlChange={setGenerateArticleSourceUrl}
            sourceText={generateArticleSourceText} onSourceTextChange={setGenerateArticleSourceText}
            onGenerateIdeas={() => handleGenerateArticleIdeas(generateArticleIdeasScript)}
            articleIdeas={generatedArticleIdeas}
            onStartArticleFromIdea={handleStartArticleFromIdea}
            generateArticleIdeasScript={generateArticleIdeasScript}
            onGenerateArticleIdeasScriptChange={setGenerateArticleIdeasScript}
        />;
      case 'generate-articles':
        return <ArticleGeneratorPanel
          wordCount={generateArticleWordCount} onWordCountChange={setGenerateArticleWordCount}
          sourceType={generateArticleSourceType} onSourceTypeChange={setGenerateArticleSourceType}
          sourceUrl={generateArticleSourceUrl} onSourceUrlChange={setGenerateArticleSourceUrl}
          sourceText={generateArticleSourceText} onSourceTextChange={setGenerateArticleSourceText}
          onGenerate={() => setShowSelectArticleTemplateModal(true)}
          isLoading={isGeneratingArticle}
          articleTitle={generateArticleTitle} onArticleTitleChange={setGenerateArticleTitle}
          generateArticleDestination={generateArticleDestination} onGenerateArticleDestinationChange={setGenerateArticleDestination}
          articleStarterText={articleStarterText} onArticleStarterTextChange={setArticleStarterText}
          endOfArticleSummary={endOfArticleSummary} onEndOfArticleSummaryChange={setEndOfArticleSummary}
          generateArticleScript={generateArticleScript} onGenerateArticleScriptChange={setGenerateArticleScript}
        />
      case 'refine-article':
        return <RefineArticlePanel 
            isEnhancingArticle={isEnhancingArticle}
            isPolishingArticle={isPolishingArticle}
            isGeneratingHeadlines={isGeneratingHeadlines}
            generatedArticleHistory={generatedArticleHistory}
            currentArticleIterationIndex={currentArticleIterationIndex}
            onRevertToIteration={setCurrentArticleIterationIndex}
            onEnhanceArticle={handleEnhanceArticle}
            onPolishArticle={handlePolishArticle}
            onGenerateHeadlinesForArticle={handleGenerateHeadlinesForArticle}
            generatedHeadlinesForArticle={generatedHeadlinesForArticle}
            onSelectHeadlineForEdit={(headline) => {
                setSelectedHeadline(headline);
                setShowHeadlineEditModal(true);
            }}
            generateHeadlinesForArticleScript={generateHeadlinesForArticleScript}
            onGenerateHeadlinesForArticleScriptChange={setGenerateHeadlinesForArticleScript}
        />
      case 'recycle-article':
        return <RecycleArticlePanel
            articleText={recycleArticleText}
            onArticleTextChange={setRecycleArticleText}
            script={recycleArticleScript}
            onScriptChange={setRecycleArticleScript}
            onRecycle={handleRecycleArticle}
            isLoading={isRecyclingArticle}
        />
      case 'article-templates':
        return <ArticleTemplateLibrary 
            templates={savedArticleTemplates}
            onSave={(id, updates) => {
                const newTemplates = savedArticleTemplates.map(t => t.id === id ? { ...t, ...updates, isNew: false } : t);
                setSavedArticleTemplates(newTemplates);
            }}
            onDelete={(id) => setSavedArticleTemplates(savedArticleTemplates.filter(t => t.id !== id))}
            onAddNew={() => setShowCreateArticleTemplateModal(true)}
        />;
      case 'new-user-guide':
        return <NewUserGuide />;
      case 'posting-guides':
        return <PostingGuides />;
      case 'analytics':
        return <AnalyticsPanel sentPosts={ayrshareLog} ayrshareApiKey={settings.ayrshareApiKey} />;
       case 'generate-podcast':
        return <GeneratePodcastPanel 
            sourceType={podcastSourceType} onSourceTypeChange={setPodcastSourceType}
            sourceUrl={podcastSourceUrl} onSourceUrlChange={setPodcastSourceUrl}
            sourceText={podcastSourceText} onSourceTextChange={setPodcastSourceText}
            script={generatePodcastIdeasScript} onScriptChange={setGeneratePodcastIdeasScript}
            onGenerateIdeas={handleGeneratePodcastIdeas}
            isGeneratingIdeas={isGeneratingPodcastIdeas}
            generatedIdeas={generatedPodcastIdeas}
            onGenerateAdjacentIdeas={handleGenerateAdjacentPodcastIdeas}
            isGeneratingAdjacentIdeas={isGeneratingAdjacentPodcastIdeas}
            selectedInitialIdea={selectedInitialPodcastIdea}
            generatedAdjacentIdeas={generatedAdjacentPodcastIdeas}
            onGeneratePlan={handleGeneratePodcastTitleSuggestions}
            isGeneratingPlan={isGeneratingPodcastPlan || isGeneratingPodcastTitles}
            generatedPlan={generatedPodcastPlan}
        />;
      default:
        return <GenerationPanel
          articleUrl={articleUrl} onArticleUrlChange={setArticleUrl}
          articleText={articleText} onArticleTextChange={setArticleText}
          sourceType={postSourceType} onSourceTypeChange={setPostSourceType}
          standardStarterText={standardStarterText} onStandardStarterTextChange={setStandardStarterText}
          standardSummaryText={standardSummaryText} onStandardSummaryTextChange={setStandardSummaryText}
          generationScript={generationScript} onGenerationScriptChange={setGenerationScript}
          onGenerate={handleGeneratePosts}
          isLoading={isGenerating}
          results={generationResults}
          onSendToAyrshareQueue={(post, platforms) => setAyrshareQueue(prev => [{ ...post, id: uuidv4(), platforms }, ...prev])}
        />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <Sidebar
        view={view}
        setView={setView}
        onSignOut={handleSignOut}
        userEmail={userEmail}
        isAdmin={isAdmin}
        templateCount={savedTemplates.length}
        articleTemplateCount={savedArticleTemplates.length}
        showMobileMenu={false}
        onToggleMobileMenu={() => {}}
        setShowMobileMenu={() => {}}
        hasGeneratedArticle={generatedArticleHistory.length > 0}
      />
      <main className="flex-1 p-8 overflow-y-auto">
        {appError && (
            <div className="p-4 mb-6 bg-red-900/50 border border-red-700 text-red-300 rounded-lg flex justify-between items-center">
                <div>{appError}</div>
                <button onClick={() => setAppError(null)} className="text-2xl font-bold">&times;</button>
            </div>
        )}
        {renderView()}
      </main>
      
      {showCreateArticleTemplateModal && (
        <CreateArticleTemplateModal
          onClose={() => setShowCreateArticleTemplateModal(false)}
          onCreateTemplate={handleCreateArticleTemplateFromText}
          isLoading={isCreatingArticleTemplate}
          error={createArticleTemplateError}
        />
      )}

      {showSelectArticleTemplateModal && (
        <SelectArticleTemplateModal 
            templates={savedArticleTemplates}
            onClose={() => setShowSelectArticleTemplateModal(false)}
            onSelect={(template) => handleGenerateArticle(template)}
        />
      )}
      
      {showHeadlineEditModal && selectedHeadline && (
          <HeadlineEditModal
            isOpen={showHeadlineEditModal}
            headline={selectedHeadline}
            onClose={() => setShowHeadlineEditModal(false)}
            onSave={(edited) => {
                const currentArticle = generatedArticleHistory[currentArticleIterationIndex];
                const updatedArticle = {
                    ...currentArticle,
                    title: edited.headline,
                    content: `${edited.subheadline ? `## ${edited.subheadline}\n\n` : ''}${currentArticle.content}`,
                    headlineApplied: true,
                };
                const newHistory = [...generatedArticleHistory];
                newHistory[currentArticleIterationIndex] = updatedArticle;
                setGeneratedArticleHistory(newHistory);
                setShowHeadlineEditModal(false);
                setSelectedHeadline(null);
            }}
          />
      )}

      {showPodcastTitleModal && (
        <PodcastTitleModal
            isOpen={showPodcastTitleModal}
            onClose={() => {
                setShowPodcastTitleModal(false);
                setFinalPodcastIdeaForPlan(null);
                setPodcastTitleSuggestions(null);
            }}
            titles={podcastTitleSuggestions || []}
            onSelectTitle={handleFinalizePodcastPlan}
            isLoading={isGeneratingPodcastPlan}
        />
      )}
    </div>
  );
}