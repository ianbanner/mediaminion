
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
    secretPassword: '',
    userActivity: {}
  });

  // Post Researcher State
  const [researchScript, setResearchScript] = useState(LINKEDIN_ANALYSIS_SCRIPT);
  const [isResearching, setIsResearching] = useState(false);
  const [researchedPosts, setResearchedPosts] = useState<ResearchedPost[] | null>(null);

  // Article Idea Generation State
  const [headlineSourceType, setHeadlineSourceType] = useState<'url' | 'text'>('url');
  const [headlineSourceUrl, setHeadlineSourceUrl] = useState('');
  const [headlineSourceText, setHeadlineSourceText] = useState('');
  const [generatedArticleIdeas, setGeneratedArticleIdeas] = useState<ArticleIdea[] | null>(null);
  const [isGeneratingArticleIdeas, setIsGeneratingArticleIdeas] = useState(false);
  const [generateArticleIdeasScript, setGenerateArticleIdeasScript] = useState(GENERATE_ARTICLE_IDEAS_SCRIPT);
  
  // Article Generation State
  const [generateArticleWordCount, setGenerateArticleWordCount] = useState(2000);
  const [generateArticleSourceType, setGenerateArticleSourceType] = useState<'url' | 'text'>('url');
  const [generateArticleSourceUrl, setGenerateArticleSourceUrl] = useState('');
  const [generateArticleSourceText, setGenerateArticleSourceText] = useState('');
  const [generateArticleScript, setGenerateArticleScript] = useState(GENERATE_ARTICLE_SCRIPT);
  const [generatedArticleHistory, setGeneratedArticleHistory] = useState<GeneratedArticle[]>([]);
  const [currentArticleIterationIndex, setCurrentArticleIterationIndex] = useState(0);
  const [isGeneratingArticle, setIsGeneratingArticle] = useState(false);
  const [generateArticleTitle, setGenerateArticleTitle] = useState('');
  const [articleStarterText, setArticleStarterText] = useState('');
  const [endOfArticleSummary, setEndOfArticleSummary] = useState(DEFAULT_END_OF_ARTICLE_SUMMARY);
  const [articleEvalCriteria, setArticleEvalCriteria] = useState(DEFAULT_ARTICLE_EVAL_CRITERIA);
  const [isEnhancingArticle, setIsEnhancingArticle] = useState(false);
  const [isPolishingArticle, setIsPolishingArticle] = useState(false);

  // Recycle Article State
  const [recycleArticleText, setRecycleArticleText] = useState('');
  const [recycleArticleScript, setRecycleArticleScript] = useState(RECYCLE_ARTICLE_SCRIPT);
  const [isRecyclingArticle, setIsRecyclingArticle] = useState(false);

  // Headline Generation for Article State
  const [headlineEvalCriteriaForArticle, setHeadlineEvalCriteriaForArticle] = useState(DEFAULT_HEADLINE_EVAL_CRITERIA);
  const [generateHeadlinesForArticleScript, setGenerateHeadlinesForArticleScript] = useState(GENERATE_HEADLINES_FOR_ARTICLE_SCRIPT);
  const [generatedHeadlinesForArticle, setGeneratedHeadlinesForArticle] = useState<GeneratedHeadline[] | null>(null);
  const [isGeneratingHeadlines, setIsGeneratingHeadlines] = useState(false);
  
  // Article Destination
  const [generateArticleDestination, setGenerateArticleDestination] = useState<ArticleDestination>('LinkedIn');
  const [finalDestinationGuidelines, setFinalDestinationGuidelines] = useState(LINKEDIN_DESTINATION_GUIDELINES);

  // Modals State
  const [showCreateArticleTemplateModal, setShowCreateArticleTemplateModal] = useState(false);
  const [isCreatingArticleTemplate, setIsCreatingArticleTemplate] = useState(false);
  const [createArticleTemplateError, setCreateArticleTemplateError] = useState<React.ReactNode | null>(null);
  
  const [showSelectArticleTemplateModal, setShowSelectArticleTemplateModal] = useState(false);

  const [editingHeadline, setEditingHeadline] = useState<GeneratedHeadline | null>(null);
  
  // UI State
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  const stateToBackup = useMemo((): BackupData => ({
    userEmail, userRole, targetAudience, referenceWorldContent, thisIsHowIWriteArticles,
    articleUrl, articleText, postSourceType, standardStarterText, standardSummaryText,
    generationScript, savedTemplates, savedArticleTemplates, ayrshareQueue,
    scheduledPosts, historicalPosts, schedulingInstructions, parsedSchedule, ayrshareLog,
    settings, adminSettings, researchScript, researchedPosts,
    headlineEvalCriteria: headlineEvalCriteriaForArticle,
    headlineGenerationScript: generateHeadlinesForArticleScript,
    generatedHeadlines: generatedHeadlinesForArticle,
    headlineSourceType, headlineSourceUrl, headlineSourceText, generatedArticleIdeas,
    generateArticleIdeasScript, generateArticleWordCount, generateArticleSourceType,
    generateArticleSourceUrl, generateArticleSourceText, generateArticleScript,
    generatedArticleHistory, currentArticleIterationIndex, generateArticleTitle,
    articleStarterText,
    endOfArticleSummary, articleEvalCriteria, headlineEvalCriteriaForArticle,
    generateHeadlinesForArticleScript, generateArticleDestination, finalDestinationGuidelines,
    recycleArticleText, recycleArticleScript,
    showCreateArticleTemplateModal,
  }), [
    userEmail, userRole, targetAudience, referenceWorldContent, thisIsHowIWriteArticles,
    articleUrl, articleText, postSourceType, standardStarterText, standardSummaryText,
    generationScript, savedTemplates, savedArticleTemplates, ayrshareQueue,
    scheduledPosts, historicalPosts, schedulingInstructions, parsedSchedule, ayrshareLog,
    settings, adminSettings, researchScript, researchedPosts,
    headlineEvalCriteriaForArticle, generateHeadlinesForArticleScript, generatedHeadlinesForArticle,
    headlineSourceType, headlineSourceUrl, headlineSourceText, generatedArticleIdeas,
    generateArticleIdeasScript, generateArticleWordCount, generateArticleSourceType,
    generateArticleSourceUrl, generateArticleSourceText, generateArticleScript,
    generatedArticleHistory, currentArticleIterationIndex, generateArticleTitle,
    articleStarterText,
    endOfArticleSummary, articleEvalCriteria, generateArticleDestination,
    finalDestinationGuidelines, recycleArticleText, recycleArticleScript, showCreateArticleTemplateModal,
  ]);

  const saveStateToLocalStorage = useCallback(() => {
    try {
      const stateString = JSON.stringify(stateToBackup);
      localStorage.setItem(LOCAL_STORAGE_KEY, stateString);
    } catch (error) {
      console.error("Failed to save state to local storage:", error);
    }
  }, [stateToBackup]);
  
  useEffect(() => {
    const timer = setTimeout(() => {
        if(userEmail) saveStateToLocalStorage();
    }, 1000); // Debounce saving
    return () => clearTimeout(timer);
  }, [stateToBackup, userEmail, saveStateToLocalStorage]);


  const loadStateFromLocalStorage = useCallback((data: BackupData) => {
      setUserRole(data.userRole || DEFAULT_USER_ROLE);
      setTargetAudience(data.targetAudience || DEFAULT_TARGET_AUDIENCE);
      setReferenceWorldContent(data.referenceWorldContent || '');
      setThisIsHowIWriteArticles(data.thisIsHowIWriteArticles || DEFAULT_THIS_IS_HOW_I_WRITE_ARTICLES);
      setArticleUrl(data.articleUrl || '');
      setArticleText(data.articleText || '');
      setPostSourceType(data.postSourceType || 'url');
      setStandardStarterText(data.standardStarterText || '');
      setStandardSummaryText(data.standardSummaryText || '');
      setGenerationScript(data.generationScript || LINKEDIN_GENERATION_EVALUATION_SCRIPT);
      setSavedTemplates(data.savedTemplates || initialTemplates);
      setSavedArticleTemplates(data.savedArticleTemplates || initialArticleTemplates);
      setAyrshareQueue(data.ayrshareQueue || []);
      setScheduledPosts(data.scheduledPosts || []);
      setHistoricalPosts(data.historicalPosts || []);
      setSchedulingInstructions(data.schedulingInstructions || DEFAULT_SCHEDULING_INSTRUCTIONS);
      setParsedSchedule(data.parsedSchedule || []);
      setAyrshareLog(data.ayrshareLog || []);
      setSettings(data.settings || { ayrshareApiKey: '' });
      setAdminSettings(data.adminSettings || { authorizedEmails: [], secretPassword: '', userActivity: {} });
      setResearchScript(data.researchScript || LINKEDIN_ANALYSIS_SCRIPT);
      setResearchedPosts(data.researchedPosts || null);
// FIX: The original code used DEFAULT_HEADLINE_EVAL_CRITERIA for headlineEvalCriteria, which is correct. However, for articleEvalCriteria, it should be initialized with DEFAULT_ARTICLE_EVAL_CRITERIA. The backup data field name was also 'headlineEvalCriteria' which could be confusing. This is corrected to use the correct constant and field name 'articleEvalCriteria'.
      setHeadlineEvalCriteriaForArticle(data.headlineEvalCriteriaForArticle || DEFAULT_HEADLINE_EVAL_CRITERIA);
      setGenerateHeadlinesForArticleScript(data.generateHeadlinesForArticleScript || GENERATE_HEADLINES_FOR_ARTICLE_SCRIPT);
      setGeneratedHeadlinesForArticle(data.generatedHeadlines || null);
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
      setGeneratedArticleHistory(data.generatedArticleHistory || []);
      setCurrentArticleIterationIndex(data.currentArticleIterationIndex || 0);
      setGenerateArticleTitle(data.generateArticleTitle || '');
      setArticleStarterText(data.articleStarterText || '');
      setEndOfArticleSummary(data.endOfArticleSummary || DEFAULT_END_OF_ARTICLE_SUMMARY);
      setArticleEvalCriteria(data.articleEvalCriteria || DEFAULT_ARTICLE_EVAL_CRITERIA);
      setGenerateArticleDestination(data.generateArticleDestination || 'LinkedIn');
      setFinalDestinationGuidelines(data.finalDestinationGuidelines || LINKEDIN_DESTINATION_GUIDELINES);
      setRecycleArticleText(data.recycleArticleText || '');
      setRecycleArticleScript(data.recycleArticleScript || RECYCLE_ARTICLE_SCRIPT);
  }, []);

  useEffect(() => {
    try {
        const savedState = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedState) {
            const parsedState: BackupData = JSON.parse(savedState);
            // Always load state from local storage if it exists to ensure
            // settings (like authorized users) are available for login.
            loadStateFromLocalStorage(parsedState);

            if (parsedState.userEmail) { // Then, attempt auto-login
                setUserEmail(parsedState.userEmail);
                setIsAdmin(parsedState.userEmail === ADMIN_EMAIL);
                setView('generate-posts');
            }
        }
    } catch (error) {
        console.error("Failed to load state from local storage:", error);
    }
  }, [loadStateFromLocalStorage]);


  const handleSignIn = useCallback((email: string, password?: string) => {
    setAuthError(null);
    const trimmedEmail = email.trim().toLowerCase();
    
    const authorizedEmails = adminSettings.authorizedEmails.map(e => e.toLowerCase());
    const isAdminUser = trimmedEmail === ADMIN_EMAIL.toLowerCase();
    const isStandardAuthorized = authorizedEmails.includes(trimmedEmail);

    if (isAdminUser) {
        setUserEmail(trimmedEmail);
        setIsAdmin(true);
        setView('generate-posts');
        setShowLogin(false);
    } else if (isStandardAuthorized) {
        if (password === adminSettings.secretPassword) {
            setUserEmail(trimmedEmail);
            setIsAdmin(false);
            setView('generate-posts');
            setShowLogin(false);
        } else {
            setAuthError(<span>The secret password is incorrect. <br/> Please check with the administrator.</span>);
        }
    } else {
        setAuthError(<span>This email address is not authorized. <br/> Please contact the administrator to get access.</span>);
    }
  }, [adminSettings]);

  const handleSignOut = useCallback(() => {
    saveStateToLocalStorage();
    setUserEmail(null);
    setIsAdmin(false);
    setView('landing');
  }, [saveStateToLocalStorage]);
  
  const handleRestoreBackup = useCallback((data: BackupData) => {
    loadStateFromLocalStorage(data);
    if(data.userEmail) {
        setUserEmail(data.userEmail);
        setIsAdmin(data.userEmail === ADMIN_EMAIL);
    }
    // After restoring, it's a good idea to navigate to a default view
    setView('persona'); 
  }, [loadStateFromLocalStorage]);

  const handleGenerateAndEvaluatePosts = useCallback(async () => {
    setIsGenerating(true);
    setGenerationResults(null);
    try {
      let sourceText = articleText;
      if (postSourceType === 'url' && articleUrl) {
        // In a real app, you'd fetch and parse the URL content here.
        // For this example, we'll just indicate what would happen.
        sourceText = `Content from URL: ${articleUrl}`;
      }

      const results = await generateAndEvaluatePosts({
        articleUrl,
        articleText: sourceText,
        templates: savedTemplates,
        script: generationScript,
        targetAudience,
        standardSummaryText,
        standardStarterText,
        userRole
      });
      setGenerationResults(results);

      // Log activity
      if(userEmail) {
          setAdminSettings(prev => ({
              ...prev,
              userActivity: {
                  ...prev.userActivity,
                  [userEmail]: {
                      posts: [...(prev.userActivity?.[userEmail]?.posts || []), Date.now()],
                      articles: [...(prev.userActivity?.[userEmail]?.articles || [])]
                  }
              }
          }));
      }

    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "An unknown error occurred.");
    } finally {
      setIsGenerating(false);
    }
  }, [articleUrl, articleText, postSourceType, savedTemplates, generationScript, targetAudience, standardSummaryText, standardStarterText, userRole, userEmail]);
  
  const handleSendToAyrshareQueue = useCallback((post: TopPostAssessment, platforms: string[]) => {
      const newPost: QueuedPost = {
        ...post,
        id: uuidv4(),
        platforms: platforms,
      };
      setAyrshareQueue(prev => [newPost, ...prev]);
  }, []);

  const handleDeleteFromAyrshareQueue = useCallback((id: string) => {
    setAyrshareQueue(prev => prev.filter(p => p.id !== id));
  }, []);

  const handleUpdateAyrshareQueuePost = useCallback((id: string, updates: Partial<QueuedPost>) => {
    setAyrshareQueue(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  const handlePostNow = useCallback(async (postId: string) => {
    const post = ayrshareQueue.find(p => p.id === postId);
    if (!post) return;
    
    setPostingNowId(postId);
    setPostToAyrshareError(null);
    setQuickPostSuccess(null);
    
    try {
        if (!settings.ayrshareApiKey) throw new Error("Ayrshare API Key is not set in Settings.");
        
        const response = await postToAyrshare(post.content, settings.ayrshareApiKey, post.platforms);

        if (response.status === 'success' && response.id) {
            // FIX: Ensure 'platforms' property is included to satisfy the SentPost type.
            const sentPost: SentPost = { ...post, id: response.id, sentAt: new Date().toISOString(), platforms: post.platforms || ['linkedin'] };
            setAyrshareLog(prev => [sentPost, ...prev]);
            setAyrshareQueue(prev => prev.filter(p => p.id !== postId));
            setQuickPostSuccess(`Posted: "${post.content.substring(0, 100)}..."`);
        } else {
            throw new Error(response.message || "Failed to post to Ayrshare.");
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        setPostToAyrshareError(<span><strong>Error:</strong> {errorMessage}</span>);
    } finally {
        setPostingNowId(null);
    }
  }, [ayrshareQueue, settings.ayrshareApiKey]);


  const handleUpdateSchedule = useCallback(async () => {
    setIsUpdatingSchedule(true);
    try {
        const times = await parseSchedule(schedulingInstructions);
        setParsedSchedule(times);
        
        // Clear existing scheduled posts and move queue to schedule
        setScheduledPosts(prev => {
            const now = new Date();
            let lastScheduledTime = now;
            
            const findNextSlot = (after: Date) => {
                const scheduleTimes = times.map(t => {
                    const [h, m] = t.split(':').map(Number);
                    const d = new Date(after);
                    d.setHours(h, m, 0, 0);
                    if (d <= after) { // If time is already past today, schedule for tomorrow
                        d.setDate(d.getDate() + 1);
                    }
                    return d;
                }).sort((a, b) => a.getTime() - b.getTime());

                return scheduleTimes[0] || null;
            };

            const newScheduledPosts = ayrshareQueue.map(post => {
                const nextSlot = findNextSlot(lastScheduledTime);
                if (nextSlot) {
                    lastScheduledTime = nextSlot;
                    return { ...post, scheduledTime: nextSlot.toISOString(), status: 'scheduled' as const };
                }
                return { ...post, status: 'scheduled' as const }; // fallback
            });

            // Move historical posts that were just scheduled
            const newHistorical = prev.filter(p => p.status !== 'scheduled');

            return newScheduledPosts;
        });
        setAyrshareQueue([]); // Empty the queue

    } catch (error) {
        alert(error instanceof Error ? error.message : "An unknown error occurred.");
    } finally {
        setIsUpdatingSchedule(false);
    }
  }, [schedulingInstructions, ayrshareQueue]);


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
    let successCount = 0;
    const errors: string[] = [];

    const updatedScheduledPosts = [...scheduledPosts];

    results.forEach((result, index) => {
        const originalPost = postsToSend[index];
        const postIndexInMainArray = updatedScheduledPosts.findIndex(p => p.id === originalPost.id);

        if (result.status === 'fulfilled' && result.value.status === 'success') {
            successCount++;
            if (postIndexInMainArray !== -1) {
                updatedScheduledPosts[postIndexInMainArray].status = 'sent-to-ayrshare';
            }
        } else {
            const errorMessage = result.status === 'rejected' 
                ? (result.reason as Error).message
                : (result.value as { message?: string }).message || 'Unknown error';
            errors.push(`'${originalPost.title}': ${errorMessage}`);
             if (postIndexInMainArray !== -1) {
                updatedScheduledPosts[postIndexInMainArray].status = 'error';
            }
        }
    });

    setScheduledPosts(updatedScheduledPosts);
    
    if (errors.length > 0) {
        setAyrshareScheduleError(<span><strong>{errors.length} post(s) failed to send.</strong> {errors.join(', ')}</span>);
    } else {
        alert(`${successCount} post(s) successfully scheduled with Ayrshare.`);
    }

    setIsSendingToAyrshare(false);
  }, [scheduledPosts, settings.ayrshareApiKey]);

  // Periodically move past scheduled posts to history
  useEffect(() => {
    const interval = setInterval(() => {
        const now = new Date();
        const pastPosts = scheduledPosts.filter(p => p.scheduledTime && new Date(p.scheduledTime) < now);
        if (pastPosts.length > 0) {
            setScheduledPosts(prev => prev.filter(p => !pastPosts.find(pp => pp.id === p.id)));
            setHistoricalPosts(prev => [...pastPosts, ...prev].sort((a,b) => new Date(b.scheduledTime!).getTime() - new Date(a.scheduledTime!).getTime()));
        }
    }, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [scheduledPosts]);

  const handleResearchPosts = useCallback(async () => {
    setIsResearching(true);
    setResearchedPosts(null);
    try {
      const results = await researchPopularPosts(researchScript);
      setResearchedPosts(results);
    } catch (error) {
      alert(error instanceof Error ? error.message : "An unknown error occurred during research.");
    } finally {
      setIsResearching(false);
    }
  }, [researchScript]);

  const handleGenerateArticleIdeas = useCallback(async (script: string) => {
    setIsGeneratingArticleIdeas(true);
    setGeneratedArticleIdeas(null);
    try {
        let sourceContent = headlineSourceText;
        if (headlineSourceType === 'url' && headlineSourceUrl) {
            sourceContent = `Content from URL: ${headlineSourceUrl}`;
        }
        if (!sourceContent) {
            alert("Please provide a source URL or text.");
            setIsGeneratingArticleIdeas(false);
            return;
        }
        const ideas = await generateArticleIdeas({
            sourceArticle: sourceContent,
            userRole,
            targetAudience,
            script
        });
        setGeneratedArticleIdeas(ideas);
    } catch (error) {
        alert(error instanceof Error ? error.message : "Failed to generate article ideas.");
    } finally {
        setIsGeneratingArticleIdeas(false);
    }
  }, [headlineSourceType, headlineSourceUrl, headlineSourceText, userRole, targetAudience]);
  
  const handleStartArticleFromIdea = useCallback((idea: ArticleIdea) => {
    setGenerateArticleTitle(idea.title);
    
    const sourceTextFromIdea = `Title: ${idea.title}\nSummary: ${idea.summary}\nKey Points:\n- ${idea.keyPoints.join('\n- ')}`;
    setGenerateArticleSourceText(sourceTextFromIdea);
    setGenerateArticleSourceType('text');
    setGenerateArticleSourceUrl('');
    setView('generate-articles');
  }, []);

  const handleExecuteArticleGeneration = async (template: SavedArticleTemplate | null) => {
    setShowSelectArticleTemplateModal(false);
    setIsGeneratingArticle(true);
    setGeneratedArticleHistory([]);
    setGeneratedHeadlinesForArticle(null);
    setCurrentArticleIterationIndex(0);

    try {
        let source = generateArticleSourceText;
        if (generateArticleSourceType === 'url' && generateArticleSourceUrl) {
            source = `Content from URL: ${generateArticleSourceUrl}`;
        }
        if (!source) {
            alert("Please provide a source URL or text for the article.");
            setIsGeneratingArticle(false);
            return;
        }
        const result = await generateArticle({
            script: generateArticleScript,
            wordCount: generateArticleWordCount,
            styleReferences: thisIsHowIWriteArticles,
            sourceContent: source,
            referenceWorld: referenceWorldContent,
            userRole,
            targetAudience,
            title: generateArticleTitle,
            articleStarterText,
            endOfArticleSummary,
            evalCriteria: articleEvalCriteria,
            selectedTemplate: template,
            allTemplates: savedArticleTemplates,
            finalDestination: generateArticleDestination,
            finalDestinationGuidelines: finalDestinationGuidelines,
        });
        setGeneratedArticleHistory([{ ...result, type: 'initial' }]);
        
         if(userEmail) {
            setAdminSettings(prev => ({
                ...prev,
                userActivity: {
                    ...prev.userActivity,
                    [userEmail]: {
                        posts: [...(prev.userActivity?.[userEmail]?.posts || [])],
                        articles: [...(prev.userActivity?.[userEmail]?.articles || []), Date.now()]
                    }
                }
            }));
        }
        setView('refine-article');

    } catch (error) {
        alert(error instanceof Error ? error.message : "Failed to generate article.");
    } finally {
        setIsGeneratingArticle(false);
    }
  };

  const handleGenerateArticle = useCallback(() => {
    setShowSelectArticleTemplateModal(true);
  }, []);

  const handleRecycleArticle = useCallback(async () => {
    if (!recycleArticleText.trim()) {
        alert("Please paste the article content you want to recycle.");
        return;
    }
    setIsRecyclingArticle(true);
    setGeneratedArticleHistory([]);
    setGeneratedHeadlinesForArticle(null);
    setCurrentArticleIterationIndex(0);

    try {
        const result = await recycleArticle({
            script: recycleArticleScript,
            existingArticleText: recycleArticleText,
            styleReferences: thisIsHowIWriteArticles,
            userRole,
            targetAudience,
            endOfArticleSummary,
            evalCriteria: articleEvalCriteria,
        });

        setGeneratedArticleHistory([{ ...result, type: 'initial' }]);
        setView('refine-article');

    } catch (error) {
        alert(error instanceof Error ? error.message : "Failed to recycle the article.");
    } finally {
        setIsRecyclingArticle(false);
    }
  }, [
    recycleArticleText,
    recycleArticleScript,
    thisIsHowIWriteArticles,
    userRole,
    targetAudience,
    endOfArticleSummary,
    articleEvalCriteria,
  ]);


  const handleEnhanceArticle = useCallback(async (selectedSuggestions: Suggestion[]) => {
      const currentArticle = generatedArticleHistory[currentArticleIterationIndex];
      if (!currentArticle) return;

      setIsEnhancingArticle(true);
      try {
          const result = await enhanceArticle({
              originalTitle: currentArticle.title,
              originalContent: currentArticle.content,
              evalCriteria: articleEvalCriteria,
              suggestions: selectedSuggestions
          });
          const newHistory = generatedArticleHistory.slice(0, currentArticleIterationIndex + 1);
          newHistory.push({ ...result, type: 'enhanced' });
          setGeneratedArticleHistory(newHistory);
          setCurrentArticleIterationIndex(newHistory.length - 1);
      } catch (error) {
           alert(error instanceof Error ? error.message : "Failed to enhance article.");
      } finally {
          setIsEnhancingArticle(false);
      }
  }, [generatedArticleHistory, currentArticleIterationIndex, articleEvalCriteria]);
  
  const handlePolishArticle = useCallback(async (polishScript: string) => {
    const currentArticle = generatedArticleHistory[currentArticleIterationIndex];
    if (!currentArticle) return;

    setIsPolishingArticle(true);
    try {
        const result = await polishArticle({
            originalTitle: currentArticle.title,
            originalContent: currentArticle.content,
            evalCriteria: articleEvalCriteria,
            styleReferences: thisIsHowIWriteArticles,
            polishScript: polishScript,
        });
        const newHistory = generatedArticleHistory.slice(0, currentArticleIterationIndex + 1);
        newHistory.push({ ...result, type: 'polished' });
        setGeneratedArticleHistory(newHistory);
        setCurrentArticleIterationIndex(newHistory.length - 1);
    } catch (error) {
         alert(error instanceof Error ? error.message : "Failed to polish article.");
    } finally {
        setIsPolishingArticle(false);
    }
  }, [generatedArticleHistory, currentArticleIterationIndex, articleEvalCriteria, thisIsHowIWriteArticles]);


  const handleCreateArticleTemplate = useCallback(async (articleText: string) => {
    setIsCreatingArticleTemplate(true);
    setCreateArticleTemplateError(null);
    try {
        const newTemplateData = await createArticleTemplateFromText({
            articleText,
            existingTemplates: savedArticleTemplates
        });
        const newTemplate: SavedArticleTemplate = {
            id: uuidv4(),
            ...newTemplateData,
            isNew: true,
        };
        setSavedArticleTemplates(prev => [newTemplate, ...prev]);
        return true; // Indicate success
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        setCreateArticleTemplateError(<span><strong>Error:</strong> {errorMessage}</span>);
        return false; // Indicate failure
    } finally {
        setIsCreatingArticleTemplate(false);
    }
  }, [savedArticleTemplates]);

  const handleGenerateHeadlinesForArticle = useCallback(async (script: string) => {
    const currentArticle = generatedArticleHistory[currentArticleIterationIndex];
    if (!currentArticle) {
        alert("No article available to generate headlines for.");
        return;
    }
    
    setIsGeneratingHeadlines(true);
    setGeneratedHeadlinesForArticle(null);
    try {
        const headlines = await generateHeadlinesForArticle({
            articleContent: currentArticle.content,
            evalCriteria: headlineEvalCriteriaForArticle,
            script: script,
        });
        const headlinesWithIds: GeneratedHeadline[] = headlines.map(h => ({ ...h, id: uuidv4() }));
        setGeneratedHeadlinesForArticle(headlinesWithIds);
    } catch (error) {
         alert(error instanceof Error ? error.message : "Failed to generate headlines.");
    } finally {
        setIsGeneratingHeadlines(false);
    }
  }, [generatedArticleHistory, currentArticleIterationIndex, headlineEvalCriteriaForArticle]);

  const handleSaveEditedHeadline = useCallback((edited: { headline: string; subheadline?: string }) => {
    if (!editingHeadline) return;

    const currentArticle = generatedArticleHistory[currentArticleIterationIndex];
    if (!currentArticle) return;
    
    const newTitle = `${edited.headline}${edited.subheadline ? `: ${edited.subheadline}` : ''}`;

    // Create a new article version with the updated title
    const updatedArticle: GeneratedArticle = {
        ...currentArticle,
        title: newTitle,
        headlineApplied: true, // Mark that a headline has been applied
    };
    
    // Replace the current version in history
    const newHistory = [...generatedArticleHistory];
    newHistory[currentArticleIterationIndex] = updatedArticle;
    
    setGeneratedArticleHistory(newHistory);
    setEditingHeadline(null); // Close modal
  }, [editingHeadline, generatedArticleHistory, currentArticleIterationIndex]);


  const handleNavigate = useCallback((page: string) => {
    setView(page);
  }, []);

  const landingPages = ['landing', 'home', 'pricing', 'questions'];
  const isLandingView = landingPages.includes(view);

  const renderLandingPage = () => {
    switch (view) {
        case 'pricing':
            return <PricingPage onLoginClick={() => setShowLogin(true)} onNavigate={handleNavigate} currentPage={view} />;
        case 'questions':
            return <FAQPage onLoginClick={() => setShowLogin(true)} onNavigate={handleNavigate} currentPage={view} />;
        default:
            return <LandingPage onLoginClick={() => setShowLogin(true)} onNavigate={handleNavigate} currentPage={view} />;
    }
  };

  return (
    <>
      {/* All modals are defined at the top level for consistent rendering */}
      {showLogin && (
        <LoginScreen 
          onSignIn={handleSignIn} 
          error={authError}
          adminEmail={ADMIN_EMAIL}
          onClose={() => setShowLogin(false)}
        />
      )}

      {showCreateArticleTemplateModal && (
        <CreateArticleTemplateModal
            onCreateTemplate={handleCreateArticleTemplate}
            onClose={() => {
                setShowCreateArticleTemplateModal(false);
                setCreateArticleTemplateError(null);
            }}
            isLoading={isCreatingArticleTemplate}
            error={createArticleTemplateError}
        />
      )}

      {showSelectArticleTemplateModal && (
          <SelectArticleTemplateModal
              templates={savedArticleTemplates}
              onSelect={handleExecuteArticleGeneration}
              onClose={() => {
                  setShowSelectArticleTemplateModal(false);
              }}
          />
      )}

      {editingHeadline && (
          <HeadlineEditModal
              isOpen={!!editingHeadline}
              headline={editingHeadline}
              onClose={() => setEditingHeadline(null)}
              onSave={handleSaveEditedHeadline}
          />
      )}
      
      {/* Main content switches between landing view and the full app */}
      {isLandingView ? (
        renderLandingPage()
      ) : (
        <div className="flex h-screen bg-gray-900 text-white">
          <Sidebar
            view={view}
            setView={setView}
            onSignOut={handleSignOut}
            userEmail={userEmail || 'Not signed in'}
            isAdmin={isAdmin}
            templateCount={savedTemplates.length}
            articleTemplateCount={savedArticleTemplates.length}
            showMobileMenu={showMobileMenu}
            onToggleMobileMenu={() => setShowMobileMenu(!showMobileMenu)}
            setShowMobileMenu={setShowMobileMenu}
            hasGeneratedArticle={generatedArticleHistory.length > 0}
          />
          <main className="flex-1 p-8 overflow-y-auto">
            {view === 'generate-posts' && (
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
                onGenerate={handleGenerateAndEvaluatePosts}
                isLoading={isGenerating}
                results={generationResults}
                onSendToAyrshareQueue={handleSendToAyrshareQueue}
              />
            )}
            {view === 'template-library' && (
              <PostsTemplateLibrary
                templates={savedTemplates}
                onSave={(id, updates) => {
                  setSavedTemplates(prev =>
                    prev.map(t => (t.id === id ? { ...t, ...updates, isNew: false } : t))
                  );
                }}
                onDelete={(id) => {
                  if (window.confirm('Are you sure you want to delete this template?')) {
                    setSavedTemplates(prev => prev.filter(t => t.id !== id));
                  }
                }}
                onAddNew={() => {
                    const newTemplate: SavedTemplate & { isNew: true } = {
                        id: uuidv4(),
                        title: 'New Template',
                        template: '{{Hook}}\n\n{{Main Point}}\n\n{{Call To Action}}',
                        example: 'Your example post content here.',
                        instructions: 'Instructions for the AI.',
                        dateAdded: new Date().toLocaleDateString(),
                        usageCount: 0,
                        lastUsed: 'Never',
                        isNew: true,
                    };
                    setSavedTemplates(prev => [newTemplate, ...prev]);
                }}
              />
            )}
            {view === 'ayrshare-queue' && (
              <QueuedPostsDisplay
                queuedPosts={ayrshareQueue}
                onDeletePost={handleDeleteFromAyrshareQueue}
                onUpdatePost={handleUpdateAyrshareQueuePost}
                onPostNow={handlePostNow}
                postingNowId={postingNowId}
                error={postToAyrshareError}
                onClearError={() => setPostToAyrshareError(null)}
              />
            )}
            {view === 'ayrshare-log' && (
              <QueuedPostsDisplay
                queuedPosts={ayrshareLog.map(p => ({...p, id: p.id || uuidv4()}))}
                readOnly
                title="Posts Log"
                emptyMessage="No posts have been sent yet."
              />
            )}
            {view === 'scheduler' && (
              <Scheduler
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
              />
            )}
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
            {view === 'backup-restore' && (
              <BackupRestorePanel 
                backupData={stateToBackup} 
                onRestore={handleRestoreBackup}
                userEmail={userEmail || 'anonymous'}
              />
            )}
            {view === 'settings' && (
              <SettingsPanel 
                settings={settings}
                onSettingsChange={setSettings}
                isAdmin={isAdmin}
              />
            )}
            {isAdmin && view === 'admin' && (
                <AdminPanel settings={adminSettings} onSettingsChange={setAdminSettings} />
            )}
            {view === 'researcher' && (
              <PostResearcherPanel
                researchScript={researchScript}
                onResearchScriptChange={setResearchScript}
                onResearchPosts={handleResearchPosts}
                isLoading={isResearching}
                results={researchedPosts}
              />
            )}
            {view === 'generate-headlines' && (
              <HeadlineGeneratorPanel
                isLoading={isGeneratingArticleIdeas}
                sourceType={headlineSourceType}
                onSourceTypeChange={setHeadlineSourceType}
                sourceUrl={headlineSourceUrl}
                onSourceUrlChange={setHeadlineSourceUrl}
                sourceText={headlineSourceText}
                onSourceTextChange={setHeadlineSourceText}
                onGenerateIdeas={handleGenerateArticleIdeas}
                articleIdeas={generatedArticleIdeas}
                onStartArticleFromIdea={handleStartArticleFromIdea}
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
                    onGenerate={handleGenerateArticle}
                    isLoading={isGeneratingArticle}
                    articleTitle={generateArticleTitle}
                    onArticleTitleChange={setGenerateArticleTitle}
                    generateArticleDestination={generateArticleDestination}
                    onGenerateArticleDestinationChange={(dest) => {
                        setGenerateArticleDestination(dest);
                        setFinalDestinationGuidelines(DESTINATION_GUIDELINES_MAP[dest]);
                    }}
                    articleStarterText={articleStarterText}
                    onArticleStarterTextChange={setArticleStarterText}
                    endOfArticleSummary={endOfArticleSummary}
                    onEndOfArticleSummaryChange={setEndOfArticleSummary}
                    generateArticleScript={generateArticleScript}
                    onGenerateArticleScriptChange={setGenerateArticleScript}
                />
             )}
              {view === 'recycle-article' && (
                <RecycleArticlePanel
                  articleText={recycleArticleText}
                  onArticleTextChange={setRecycleArticleText}
                  script={recycleArticleScript}
                  onScriptChange={setRecycleArticleScript}
                  onRecycle={handleRecycleArticle}
                  isLoading={isRecyclingArticle}
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
                    onEnhanceArticle={handleEnhanceArticle}
                    onPolishArticle={handlePolishArticle}
                    onGenerateHeadlinesForArticle={handleGenerateHeadlinesForArticle}
                    generatedHeadlinesForArticle={generatedHeadlinesForArticle}
                    onSelectHeadlineForEdit={setEditingHeadline}
                    generateHeadlinesForArticleScript={generateHeadlinesForArticleScript}
                    onGenerateHeadlinesForArticleScriptChange={setGenerateHeadlinesForArticleScript}
                />
             )}
             {view === 'article-templates' && (
                <ArticleTemplateLibrary
                    templates={savedArticleTemplates}
                    onSave={(id, updates) => {
                        setSavedArticleTemplates(prev =>
                            prev.map(t => (t.id === id ? { ...t, ...updates, isNew: false } : t))
                        );
                    }}
                    onDelete={(id) => {
                        if (window.confirm('Are you sure you want to delete this article template?')) {
                            setSavedArticleTemplates(prev => prev.filter(t => t.id !== id));
                        }
                    }}
                    onAddNew={() => setShowCreateArticleTemplateModal(true)}
                />
             )}
             {view === 'new-user-guide' && <NewUserGuide />}
             {view === 'posting-guides' && <PostingGuides />}
             {view === 'analytics' && (
                <AnalyticsPanel 
                    sentPosts={ayrshareLog} 
                    ayrshareApiKey={settings.ayrshareApiKey} 
                />
             )}
          </main>
        </div>
      )}
    </>
  );
}
