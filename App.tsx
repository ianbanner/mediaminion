

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
import ArticleTemplateLibrary from './components/ArticleTemplateLibrary.tsx';
import CreateArticleTemplateModal from './components/CreateArticleTemplateModal.tsx';
import MobileCompanionPanel from './components/MobileCompanionPanel.tsx';

import {
  generateAndEvaluatePosts,
  researchPopularPosts,
  parseSchedule,
  generateArticleIdeas,
  generateAndEvaluateHeadlines,
  reevaluateHeadline,
  generateArticle,
  enhanceArticle,
  createArticleTemplateFromText,
} from './services/geminiService.ts';

// Corrected imports for Ayrshare services
import {
  testAyrshareConnection,
  postToAyrshare,
} from './services/ayrshareService.ts';

import {
  LINKEDIN_GENERATION_EVALUATION_SCRIPT,
  RESEARCH_POPULAR_POSTS_SCRIPT, // Corrected export name
  PARSE_SCHEDULE_SCRIPT, // Corrected export name
  DEFAULT_HEADLINE_EVAL_CRITERIA,
  GENERATE_HEADLINES_SCRIPT,
  GENERATE_ARTICLE_SCRIPT,
  DEFAULT_ARTICLE_EVAL_CRITERIA,
} from './services/scriptService.ts';

import { initialTemplates } from './services/templateData.ts';
import { initialArticleTemplates } from './services/articleTemplateData.ts';

import {
  SavedTemplate,
  QueuedPost,
  SentPost,
  AppSettings,
  AdminSettings,
  TopPostAssessment,
  BackupData,
  GeneratedHeadline,
  GeneratedArticle,
  Suggestion,
  SavedArticleTemplate,
} from './types.ts';

const LOCAL_STORAGE_KEY = 'socialMediaMinionData';
const ADMIN_EMAIL = 'admin@example.com'; // Default admin email

// Define default values locally as they are not exported from scriptService.ts
const DEFAULT_END_OF_ARTICLE_SUMMARY = `
---
Want to master AI for leadership?

Join our exclusive "AI for Leaders" workshop series and transform your strategic capabilities.

Click here to learn more and sign up! [Link to your website/course]
`;
const DEFAULT_THIS_IS_HOW_I_WRITE_ARTICLES = `# My Personal Article Writing Style & Philosophy

## Core Principles
1.  **Clarity Above All**: Every sentence must convey a clear, singular idea. Avoid jargon unless absolutely necessary and immediately explained.
2.  **Actionable Insights**: Articles must leave the reader with practical takeaways they can implement immediately. Theoretical musings are fine, but they must lead to a "so what?" for the reader.
3.  **Narrative-Driven**: Human beings are wired for stories. Weave personal anecdotes, client case studies, and relatable scenarios throughout the article.
4.  **Challenger Mindset**: Don't just regurgitate common advice. Challenge assumptions, offer contrarian perspectives, and make the reader think.
5.  **Conciseness & Flow**: Every word earns its place. Eliminate fluff. Ensure a smooth, logical flow from one paragraph to the next, using strong transition phrases.
6.  **Engagement Hooks**: Employ rhetorical questions, bold claims, and direct address ("you") to keep the reader engaged.

## Structure
I often use a variation of the PAS (Problem-Agitate-Solution) framework, but extended:

-   **Hook (100-200 words)**: Start with a relatable problem, a surprising statistic, or a bold statement that immediately grabs attention.
-   **Problem Amplification (200-300 words)**: Dive deeper into the problem, showing its nuances and impact on the reader. Agitate the pain points.
-   **The Conventional (Mis)Solution (150-200 words)**: Briefly explain what most people try, and why it often fails.
-   **The Better Way / My Framework (500-800 words)**: Introduce my unique framework or solution, breaking it down into 3-5 clear steps or principles. Each step gets its own mini-section with examples.
-   **Case Study / Example (200-300 words)**: Illustrate the framework in action with a real-world (or composite) example, showcasing results.
-   **Overcoming Obstacles (150-200 words)**: Address common challenges in implementing the solution and how to overcome them.
-   **Call to Action (50-100 words)**: A clear, single call to action—e.g., download a resource, join a workshop, book a call.

## Tone
-   **Confident & Authoritative**: I speak from experience, not theory.
-   **Empathetic**: I understand the reader's struggles and aspirations.
-   **Direct & Unflinching**: I don't shy away from difficult truths.
-   **Energetic & Engaging**: Avoid dry, academic language. Keep it conversational but professional.

## Formatting
-   **Short Paragraphs**: No more than 3-5 sentences per paragraph. Often just one or two.
-   **Lists & Bullet Points**: Used frequently for readability and breaking down complex ideas.
-   **Bold Text**: Used sparingly to highlight key terms or phrases.
-   **Subheadings**: Every 200-300 words to break up text and guide the reader.
`;


// Utility to play a sound
const playSound = (type: 'success' | 'error' | 'notification') => {
  if (window.AudioContext || (window as any).webkitAudioContext) {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    switch (type) {
      case 'success':
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5
        gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
        break;
      case 'error':
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4
        gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
        break;
      case 'notification':
      default:
        oscillator.frequency.setValueAtTime(660, audioContext.currentTime); // E5
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        break;
    }

    oscillator.type = 'sine';
    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
    oscillator.stop(audioContext.currentTime + 0.3);
  }
};

export const App: React.FC = () => {
  // Authentication State - TEMPORARILY BYPASSED
  const [userEmail, setUserEmail] = useState<string | null>('dave@bigagility.com');
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [authError, setAuthError] = useState<React.ReactNode | null>(null);
  const isAdmin = useMemo(() => userEmail?.toLowerCase() === ADMIN_EMAIL, [userEmail]);

  // Global UI State
  const [view, setView] = useState('generate-posts');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<React.ReactNode | null>(null);

  // Persona State
  const [userRole, setUserRole] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [referenceWorldContent, setReferenceWorldContent] = useState('');
  const [thisIsHowIWriteArticles, setThisIsHowIWriteArticles] = useState(DEFAULT_THIS_IS_HOW_I_WRITE_ARTICLES);


  // Generate Posts Panel State
  const [articleUrl, setArticleUrl] = useState('');
  const [articleText, setArticleText] = useState('');
  const [postSourceType, setPostSourceType] = useState<'url' | 'text'>('url');
  const [standardStarterText, setStandardStarterText] = useState('');
  const [standardSummaryText, setStandardSummaryText] = useState('');
  const [generationScript, setGenerationScript] = useState(LINKEDIN_GENERATION_EVALUATION_SCRIPT);
  const [generationResults, setGenerationResults] = useState<any>(null);

  // Template Library State
  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>(initialTemplates);

  // Ayrshare Queue State
  const [ayrshareQueue, setAyrshareQueue] = useState<QueuedPost[]>([]);
  const [schedulingInstructions, setSchedulingInstructions] = useState('');
  const [parsedSchedule, setParsedSchedule] = useState<string[]>([]);
  const [isParsingSchedule, setIsParsingSchedule] = useState(false);
  const [ayrshareLog, setAyrshareLog] = useState<SentPost[]>([]);
  const schedulerIntervalRef = useRef<number | null>(null);

  // Post Researcher State
  const [researchScript, setResearchScript] = useState(RESEARCH_POPULAR_POSTS_SCRIPT);
  const [researchedPosts, setResearchedPosts] = useState<any[] | null>(null);

  // Headline Generator State
  const [headlineEvalCriteria, setHeadlineEvalCriteria] = useState(DEFAULT_HEADLINE_EVAL_CRITERIA);
  const [headlineGenerationScript, setHeadlineGenerationScript] = useState(GENERATE_HEADLINES_SCRIPT);
  const [generatedHeadlines, setGeneratedHeadlines] = useState<GeneratedHeadline[] | null>(null);
  const [headlineSourceType, setHeadlineSourceType] = useState<'url' | 'text'>('url');
  const [headlineSourceUrl, setHeadlineSourceUrl] = useState('');
  const [headlineSourceText, setHeadlineSourceText] = useState('');
  const [articleIdeas, setArticleIdeas] = useState<string[] | null>(null);
  const [selectedArticleIdea, setSelectedArticleIdea] = useState<string | null>(null);

  // Article Generator State
  const [generateArticleWordCount, setGenerateArticleWordCount] = useState<number>(1000);
  const [generateArticleSourceType, setGenerateArticleSourceType] = useState<'url' | 'text'>('url');
  const [generateArticleSourceUrl, setGenerateArticleSourceUrl] = useState('');
  const [generateArticleSourceText, setGenerateArticleSourceText] = useState('');
  const [generateArticleStyleRefs, setGenerateArticleStyleRefs] = useState('');
  const [generateArticleScript, setGenerateArticleScript] = useState(GENERATE_ARTICLE_SCRIPT);
  const [generatedArticleHistory, setGeneratedArticleHistory] = useState<GeneratedArticle[]>([]);
  const [currentArticleIterationIndex, setCurrentArticleIterationIndex] = useState(0);
  const [articleTitle, setArticleTitle] = useState('');
  const [endOfArticleSummary, setEndOfArticleSummary] = useState(DEFAULT_END_OF_ARTICLE_SUMMARY);
  const [articleEvalCriteria, setArticleEvalCriteria] = useState(DEFAULT_ARTICLE_EVAL_CRITERIA);

  // Article Template Library State
  const [savedArticleTemplates, setSavedArticleTemplates] = useState<SavedArticleTemplate[]>(initialArticleTemplates);
  const [showCreateArticleTemplateModal, setShowCreateArticleTemplateModal] = useState(false);
  const [createArticleTemplateError, setCreateArticleTemplateError] = useState<React.ReactNode | null>(null);

  // Settings State
  const [appSettings, setAppSettings] = useState<AppSettings>({ ayrshareApiKey: '' });
  const [adminSettings, setAdminSettings] = useState<AdminSettings>({ authorizedEmails: [], secretPassword: '' });

  // --- Authentication Handlers ---
  const handleSignIn = useCallback(async (email: string, password?: string) => {
    setAuthError(null);
    if (email.toLowerCase() === ADMIN_EMAIL) {
      setIsAuthenticated(true);
      setUserEmail(email);
      return;
    }

    if (!adminSettings.authorizedEmails.includes(email)) {
      setAuthError('Email not authorized.');
      return;
    }
    if (password !== adminSettings.secretPassword) {
      setAuthError('Incorrect secret password.');
      return;
    }
    setIsAuthenticated(true);
    setUserEmail(email);
  }, [adminSettings.authorizedEmails, adminSettings.secretPassword]);

  const handleSignOut = useCallback(() => {
    setIsAuthenticated(false);
    setUserEmail(null);
    setAuthError(null);
  }, []);

  // --- Data Persistence (localStorage) ---
  useEffect(() => {
    const loadData = () => {
      try {
        const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedData) {
          const data: BackupData = JSON.parse(storedData);
          setUserRole(data.userRole || '');
          setTargetAudience(data.targetAudience || '');
          setReferenceWorldContent(data.referenceWorldContent || '');
          setThisIsHowIWriteArticles(data.thisIsHowIWriteArticles || DEFAULT_THIS_IS_HOW_I_WRITE_ARTICLES);
          setArticleUrl(data.articleUrl || '');
          setArticleText(data.articleText || '');
          setPostSourceType(data.postSourceType || 'url');
          setStandardStarterText(data.standardStarterText || '');
          setStandardSummaryText(data.standardSummaryText || '');
          setGenerationScript(data.generationScript || LINKEDIN_GENERATION_EVALUATION_SCRIPT);
          setSavedTemplates(data.savedTemplates || initialTemplates);
          setAyrshareQueue(data.ayrshareQueue || []);
          setSchedulingInstructions(data.schedulingInstructions || '');
          setParsedSchedule(data.parsedSchedule || []);
          setAyrshareLog(data.ayrshareLog || []);
          setAppSettings(data.settings || { ayrshareApiKey: '' });
          setAdminSettings(data.adminSettings || { authorizedEmails: [], secretPassword: '' });
          setResearchScript(data.researchScript || RESEARCH_POPULAR_POSTS_SCRIPT);
          setResearchedPosts(data.researchedPosts || null);
          setHeadlineEvalCriteria(data.headlineEvalCriteria || DEFAULT_HEADLINE_EVAL_CRITERIA);
          setHeadlineGenerationScript(data.headlineGenerationScript || GENERATE_HEADLINES_SCRIPT);
          setGeneratedHeadlines(data.generatedHeadlines || null);
          setHeadlineSourceType(data.headlineSourceType || 'url');
          setHeadlineSourceUrl(data.headlineSourceUrl || '');
          setHeadlineSourceText(data.headlineSourceText || '');
          setArticleIdeas(data.generatedArticleIdeas || null);
          setSelectedArticleIdea(data.selectedArticleIdea || null);
          setGenerateArticleWordCount(data.generateArticleWordCount || 1000);
          setGenerateArticleSourceType(data.generateArticleSourceType || 'url');
          setGenerateArticleSourceUrl(data.generateArticleSourceUrl || '');
          setGenerateArticleSourceText(data.generateArticleSourceText || '');
          setGenerateArticleStyleRefs(data.generateArticleStyleRefs || DEFAULT_THIS_IS_HOW_I_WRITE_ARTICLES);
          setGenerateArticleScript(data.generateArticleScript || GENERATE_ARTICLE_SCRIPT);
          setGeneratedArticleHistory(data.generatedArticleHistory || []);
          setCurrentArticleIterationIndex(data.currentArticleIterationIndex || 0);
          setArticleTitle(data.generateArticleTitle || '');
          setEndOfArticleSummary(data.endOfArticleSummary || DEFAULT_END_OF_ARTICLE_SUMMARY);
          setArticleEvalCriteria(data.articleEvalCriteria || DEFAULT_ARTICLE_EVAL_CRITERIA);
          setSavedArticleTemplates(data.savedArticleTemplates || initialArticleTemplates);
          setShowCreateArticleTemplateModal(data.showCreateArticleTemplateModal || false);
        }
      } catch (e) {
        console.error("Failed to load data from localStorage", e);
        setError("Failed to load saved data. Data might be corrupted. Resetting.");
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    };
    loadData();
  }, []);

  const backupData: BackupData = useMemo(() => ({
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
    ayrshareQueue,
    schedulingInstructions,
    parsedSchedule,
    ayrshareLog,
    settings: appSettings,
    adminSettings,
    researchScript,
    researchedPosts,
    headlineEvalCriteria,
    headlineGenerationScript,
    generatedHeadlines,
    headlineSourceType,
    headlineSourceUrl,
    headlineSourceText,
    generatedArticleIdeas: articleIdeas,
    selectedArticleIdea,
    generateArticleWordCount,
    generateArticleSourceType,
    generateArticleSourceUrl,
    generateArticleSourceText,
    generateArticleStyleRefs,
    generateArticleScript,
    generatedArticleHistory,
    currentArticleIterationIndex,
    generateArticleTitle: articleTitle,
    endOfArticleSummary,
    articleEvalCriteria,
    savedArticleTemplates,
    showCreateArticleTemplateModal,
  }), [
    userRole, targetAudience, referenceWorldContent, thisIsHowIWriteArticles, articleUrl, articleText, postSourceType,
    standardStarterText, standardSummaryText, generationScript, savedTemplates, ayrshareQueue,
    schedulingInstructions, parsedSchedule, ayrshareLog, appSettings, adminSettings, researchScript,
    researchedPosts, headlineEvalCriteria, headlineGenerationScript, generatedHeadlines,
    headlineSourceType, headlineSourceUrl, headlineSourceText, articleIdeas, selectedArticleIdea,
    generateArticleWordCount, generateArticleSourceType, generateArticleSourceUrl, generateArticleSourceText,
    generateArticleStyleRefs, generateArticleScript, generatedArticleHistory, currentArticleIterationIndex, articleTitle,
    endOfArticleSummary, articleEvalCriteria, savedArticleTemplates, showCreateArticleTemplateModal
  ]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(backupData));
  }, [backupData]);

  const handleRestoreBackup = useCallback((data: BackupData) => {
    setUserRole(data.userRole || '');
    setTargetAudience(data.targetAudience || '');
    setReferenceWorldContent(data.referenceWorldContent || '');
    setThisIsHowIWriteArticles(data.thisIsHowIWriteArticles || DEFAULT_THIS_IS_HOW_I_WRITE_ARTICLES);
    setArticleUrl(data.articleUrl || '');
    setArticleText(data.articleText || '');
    setPostSourceType(data.postSourceType || 'url');
    setStandardStarterText(data.standardStarterText || '');
    setStandardSummaryText(data.standardSummaryText || '');
    setGenerationScript(data.generationScript || LINKEDIN_GENERATION_EVALUATION_SCRIPT);
    setSavedTemplates(data.savedTemplates || initialTemplates);
    setAyrshareQueue(data.ayrshareQueue || []);
    setSchedulingInstructions(data.schedulingInstructions || '');
    setParsedSchedule(data.parsedSchedule || []);
    setAyrshareLog(data.ayrshareLog || []);
    setAppSettings(data.settings || { ayrshareApiKey: '' });
    setAdminSettings(data.adminSettings || { authorizedEmails: [], secretPassword: '' });
    setResearchScript(data.researchScript || RESEARCH_POPULAR_POSTS_SCRIPT);
    setResearchedPosts(data.researchedPosts || null);
    setHeadlineEvalCriteria(data.headlineEvalCriteria || DEFAULT_HEADLINE_EVAL_CRITERIA);
    setHeadlineGenerationScript(data.headlineGenerationScript || GENERATE_HEADLINES_SCRIPT);
    setGeneratedHeadlines(data.generatedHeadlines || null);
    setHeadlineSourceType(data.headlineSourceType || 'url');
    setHeadlineSourceUrl(data.headlineSourceUrl || '');
    setHeadlineSourceText(data.headlineSourceText || '');
    setArticleIdeas(data.generatedArticleIdeas || null);
    setSelectedArticleIdea(data.selectedArticleIdea || null);
    setGenerateArticleWordCount(data.generateArticleWordCount || 1000);
    setGenerateArticleSourceType(data.generateArticleSourceType || 'url');
    setGenerateArticleSourceUrl(data.generateArticleSourceUrl || '');
    setGenerateArticleSourceText(data.generateArticleSourceText || '');
    setGenerateArticleStyleRefs(data.generateArticleStyleRefs || DEFAULT_THIS_IS_HOW_I_WRITE_ARTICLES);
    setGenerateArticleScript(data.generateArticleScript || GENERATE_ARTICLE_SCRIPT);
    setGeneratedArticleHistory(data.generatedArticleHistory || []);
    setCurrentArticleIterationIndex(data.currentArticleIterationIndex || 0);
    setArticleTitle(data.generateArticleTitle || '');
    setEndOfArticleSummary(data.endOfArticleSummary || DEFAULT_END_OF_ARTICLE_SUMMARY);
    setArticleEvalCriteria(data.articleEvalCriteria || DEFAULT_ARTICLE_EVAL_CRITERIA);
    setSavedArticleTemplates(data.savedArticleTemplates || initialArticleTemplates);
    setShowCreateArticleTemplateModal(data.showCreateArticleTemplateModal || false);
    setError(null);
  }, []);

  // --- General UI Handlers ---
  const handleClearError = useCallback(() => setError(null), []);

  // --- Template Library Handlers ---
  const handleAddNewTemplate = useCallback(() => {
    const newId = uuidv4();
    setSavedTemplates(prev => [
      ...prev,
      {
        id: newId,
        title: 'New Template',
        template: '{{Hook}}\n{{MainPoint}}\n{{CallToAction}}',
        example: 'Hook example.\nMain point example.\nCTA example.',
        instructions: '',
        dateAdded: new Date().toLocaleDateString(),
        usageCount: 0,
        lastUsed: 'Never',
        isNew: true,
      },
    ]);
    setView('template-library');
  }, []);

  const handleSaveTemplate = useCallback((id: string, updates: Partial<Omit<SavedTemplate, 'id'>>) => {
    setSavedTemplates(prev =>
      prev.map(t => (t.id === id ? { ...t, ...updates, isNew: false } : t))
    );
  }, []);

  const handleDeleteTemplate = useCallback((id: string) => {
    const templateToDelete = savedTemplates.find(t => t.id === id);
    if (templateToDelete?.isNew) {
      setSavedTemplates(prev => prev.filter(t => t.id !== id));
      return;
    }
    if (window.confirm('Are you sure you want to delete this template?')) {
      setSavedTemplates(prev => prev.filter(t => t.id !== id));
    }
  }, [savedTemplates]);

  // --- Article Template Library Handlers ---
  const handleOpenCreateArticleTemplateModal = useCallback(() => {
    setShowCreateArticleTemplateModal(true);
    setCreateArticleTemplateError(null);
  }, []);

  const handleCloseCreateArticleTemplateModal = useCallback(() => {
    setShowCreateArticleTemplateModal(false);
    setCreateArticleTemplateError(null);
  }, []);

  const handleCreateArticleTemplateFromText = useCallback(async (articleText: string): Promise<boolean> => {
    setIsLoading(true);
    setCreateArticleTemplateError(null);
    try {
      const newTemplate = await createArticleTemplateFromText({ articleText, existingTemplates: savedArticleTemplates });
      setSavedArticleTemplates(prev => [
        ...prev,
        { ...newTemplate, id: uuidv4(), isNew: false },
      ]);
      playSound('success');
      return true;
    } catch (err: any) {
      console.error("Error creating article template from text:", err);
      setCreateArticleTemplateError(`Failed to create template: ${err.message}`);
      playSound('error');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [savedArticleTemplates]);

  const handleSaveArticleTemplate = useCallback((id: string, updates: Partial<Omit<SavedArticleTemplate, 'id'>>) => {
    setSavedArticleTemplates(prev =>
      prev.map(t => (t.id === id ? { ...t, ...updates, isNew: false } : t))
    );
  }, []);

  const handleDeleteArticleTemplate = useCallback((id: string) => {
    const templateToDelete = savedArticleTemplates.find(t => t.id === id);
    if (templateToDelete?.isNew) {
      setSavedArticleTemplates(prev => prev.filter(t => t.id !== id));
      return;
    }
    if (window.confirm('Are you sure you want to delete this article template?')) {
      setSavedArticleTemplates(prev => prev.filter(t => t.id !== id));
    }
  }, [savedArticleTemplates]);

  // --- Generate Posts Handlers ---
  const handleGeneratePosts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setGenerationResults(null);
    try {
      if (!articleUrl && !articleText) throw new Error("Please provide an article URL or text.");
      if (!userRole) throw new Error("Please define your professional role in the Persona section.");
      if (!targetAudience) throw new Error("Please define your target audience in the Persona section.");

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
      setView('generate-posts');
    } catch (err: any) {
      setError(`Failed to generate posts: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [articleUrl, articleText, userRole, targetAudience, savedTemplates, generationScript, standardStarterText, standardSummaryText]);

  // --- Ayrshare Queue Handlers ---
  const handleSendToAyrshareQueue = useCallback((post: TopPostAssessment) => {
    setAyrshareQueue(prev => [...prev, { ...post, id: uuidv4(), platforms: ['linkedin'] }]);
    alert(`Post "${post.title}" added to queue.`);
  }, []);

  const handleDeleteQueuedPost = useCallback((id: string) => {
    setAyrshareQueue(prev => prev.filter(post => post.id !== id));
  }, []);

  const handleUpdateQueuedPost = useCallback((id: string, updates: Partial<QueuedPost>) => {
    setAyrshareQueue(prev => prev.map(post => (post.id === id ? { ...post, ...updates } : post)));
  }, []);

  const handleParseSchedule = useCallback(async () => {
    setIsParsingSchedule(true);
    setError(null);
    try {
      const times = await parseSchedule(schedulingInstructions);
      setParsedSchedule(times);
      playSound('success');
    } catch (err: any) {
      setError(`Failed to parse schedule: ${err.message}`);
      playSound('error');
    } finally {
      setIsParsingSchedule(false);
    }
  }, [schedulingInstructions]);

  // --- Scheduling Logic ---
  useEffect(() => {
    if (parsedSchedule.length > 0 && appSettings.ayrshareApiKey && isAuthenticated) {
      if (schedulerIntervalRef.current) clearInterval(schedulerIntervalRef.current);
      schedulerIntervalRef.current = window.setInterval(async () => {
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        if (parsedSchedule.includes(currentTime)) {
          const postToSend = ayrshareQueue[0];
          if (postToSend) {
            try {
              await postToAyrshare(postToSend.content, appSettings.ayrshareApiKey, postToSend.platforms);
              setAyrshareLog(prev => [{ ...postToSend, sentAt: new Date().toISOString() } as SentPost, ...prev]);
              setAyrshareQueue(prev => prev.slice(1));
              new Notification('Post Sent!', { 
                body: `"${postToSend.title}" was successfully posted.`,
                icon: '/icon.png' 
              });
              playSound('notification');
            } catch (err: any) {
              console.error("[Scheduler] Error posting:", err);
              new Notification('Post Failed!', {
                body: `Failed to post "${postToSend.title}": ${err.message}`,
                icon: '/icon.png',
              });
              playSound('error');
            }
          } else {
            console.log("[Scheduler] No posts in queue to send.");
            new Notification('Scheduler Idle', {
              body: 'No posts in queue to send at scheduled time.',
              icon: '/icon.png',
            });
          }
        }
      }, 60 * 1000); // Check every minute
    }

    return () => {
      if (schedulerIntervalRef.current) {
        clearInterval(schedulerIntervalRef.current);
      }
    };
  }, [ayrshareQueue, parsedSchedule, appSettings.ayrshareApiKey, isAuthenticated]);


  // --- Post Researcher Handlers ---
  const handleResearchPosts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setResearchedPosts(null);
    try {
      const results = await researchPopularPosts(researchScript);
      setResearchedPosts(results);
    } catch (err: any) {
      setError(`Failed to research posts: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [researchScript]);

  // --- Headline Generator Handlers ---
  const handleGenerateIdeas = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setArticleIdeas(null);
    setSelectedArticleIdea(null);
    setGeneratedHeadlines(null);
    try {
      const source = headlineSourceType === 'url' ? headlineSourceUrl : headlineSourceText;
      if (!source.trim()) throw new Error("Please provide a source article (URL or text) to generate ideas.");
      if (!userRole.trim() || !targetAudience.trim()) throw new Error("Please define your professional role and target audience in the Persona section.");
      const ideas = await generateArticleIdeas({ sourceArticle: source, userRole, targetAudience });
      setArticleIdeas(ideas);
    } catch (err: any) {
      setError(`Failed to generate article ideas: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [headlineSourceType, headlineSourceUrl, headlineSourceText, userRole, targetAudience]);

  const handleSelectArticleIdea = useCallback((idea: string) => {
    setSelectedArticleIdea(idea);
    setGeneratedHeadlines(null);
  }, []);

  const handleGenerateHeadlines = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setGeneratedHeadlines(null);
    try {
      if (!selectedArticleIdea) throw new Error("Please select an article idea first.");
      const source = headlineSourceType === 'url' ? headlineSourceUrl : headlineSourceText;
      const results = await generateAndEvaluateHeadlines({
        chosenArticleIdea: selectedArticleIdea,
        sourceArticle: source,
        generationScript: headlineGenerationScript,
        evalScript: headlineEvalCriteria,
      });
      setGeneratedHeadlines(results.sort((a, b) => b.score - a.score));
    } catch (err: any) {
      setError(`Failed to generate headlines: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [selectedArticleIdea, headlineSourceType, headlineSourceUrl, headlineSourceText, headlineGenerationScript, headlineEvalCriteria]);

  const handleReevaluateHeadline = useCallback(async (id: string, newText: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await reevaluateHeadline({ headline: newText, evalScript: headlineEvalCriteria });
      setGeneratedHeadlines(prev => {
        if (!prev) return null;
        const updatedHeadlines = prev.map(h =>
          h.id === id ? { ...h, headline: newText, score: result.score, reasoning: result.reasoning } : h
        );
        return updatedHeadlines.sort((a, b) => b.score - a.score);
      });
      playSound('notification');
    } catch (err: any) {
      setError(`Failed to re-evaluate headline: ${err.message}`);
      playSound('error');
    } finally {
      setIsLoading(false);
    }
  }, [headlineEvalCriteria]);

  const handleSelectHeadlineForArticle = useCallback((headline: GeneratedHeadline) => {
    setArticleTitle(headline.headline);
    setGenerateArticleSourceType(headlineSourceType);
    setGenerateArticleSourceUrl(headlineSourceUrl);
    setGenerateArticleSourceText(headlineSourceText);
    setView('generate-articles');
  }, [headlineSourceType, headlineSourceUrl, headlineSourceText]);

  // --- Article Generator Handlers ---
  const handleGenerateArticle = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setGeneratedArticleHistory([]);
    setCurrentArticleIterationIndex(0);
    try {
      if (!articleTitle) throw new Error("A working title is required.");
      if (!generateArticleSourceUrl && !generateArticleSourceText) throw new Error("Please provide a primary source (URL or text).");
      if (!userRole.trim() || !targetAudience.trim()) throw new Error("Please define your role and audience in the Persona section.");
      const newArticle = await generateArticle({
        script: generateArticleScript,
        wordCount: generateArticleWordCount,
        styleReferences: thisIsHowIWriteArticles,
        sourceContent: generateArticleSourceType === 'url' ? generateArticleSourceUrl : generateArticleSourceText,
        referenceWorld: referenceWorldContent,
        userRole,
        targetAudience,
        title: articleTitle,
        endOfArticleSummary,
        evalCriteria: articleEvalCriteria,
      });
      setGeneratedArticleHistory([newArticle]);
      setCurrentArticleIterationIndex(0);
      playSound('success');
    } catch (err: any) {
      setError(`Failed to generate article: ${err.message}`);
      playSound('error');
    } finally {
      setIsLoading(false);
    }
  }, [
    articleTitle, generateArticleSourceType, generateArticleSourceUrl, generateArticleSourceText,
    userRole, targetAudience, generateArticleScript, generateArticleWordCount,
    thisIsHowIWriteArticles, referenceWorldContent, endOfArticleSummary, articleEvalCriteria
  ]);

  const handleRevertToIteration = useCallback((index: number) => {
    if (index >= 0 && index < generatedArticleHistory.length) {
      setCurrentArticleIterationIndex(index);
    }
  }, [generatedArticleHistory]);

  const handleEnhanceArticle = useCallback(async (selectedSuggestions: Suggestion[]) => {
    setIsLoading(true);
    setError(null);
    try {
      if (!generatedArticleHistory.length || currentArticleIterationIndex === -1) throw new Error("No article found to enhance.");
      if (selectedSuggestions.length === 0) throw new Error("Please select at least one suggestion to apply.");
      const currentArticle = generatedArticleHistory[currentArticleIterationIndex];
      const enhancedArticle = await enhanceArticle({
        originalTitle: currentArticle.title,
        originalContent: currentArticle.content,
        evalCriteria: articleEvalCriteria,
        suggestions: selectedSuggestions,
      });
      setGeneratedArticleHistory(prev => [...prev, enhancedArticle]);
      setCurrentArticleIterationIndex(generatedArticleHistory.length);
      playSound('notification');
    } catch (err: any) {
      setError(`Failed to enhance article: ${err.message}`);
      playSound('error');
    } finally {
      setIsLoading(false);
    }
  }, [generatedArticleHistory, currentArticleIterationIndex, articleEvalCriteria]);

  // --- Settings Handlers ---
  const handleSaveAppSettings = useCallback(async (newSettings: AppSettings) => {
    setError(null);
    try {
      const testResult = await testAyrshareConnection(newSettings.ayrshareApiKey);
      if (!testResult.success) throw new Error(testResult.message);
      setAppSettings(newSettings);
      return true;
    } catch (err: any) {
      setError(`Failed to save settings: ${err.message}`);
      return false;
    }
  }, []);

  const handleSaveAdminSettings = useCallback((newSettings: AdminSettings) => {
    setAdminSettings(newSettings);
  }, []);

  // if (!isAuthenticated) {
  //   return <LoginScreen onSignIn={handleSignIn} error={authError} adminEmail={ADMIN_EMAIL} />;
  // }

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <Sidebar
        view={view}
        setView={setView}
        onSignOut={handleSignOut}
        userEmail={userEmail || ''}
        isAdmin={isAdmin}
        templateCount={savedTemplates.length}
        articleTemplateCount={savedArticleTemplates.length}
      />
      <main className="flex-1 overflow-y-auto p-8">
        {error && (
          <div className="bg-red-900/50 p-4 rounded-lg border border-red-700 text-sm text-red-300 mb-6 flex justify-between items-center animate-fade-in">
            <span>{error}</span>
            <button onClick={handleClearError} className="ml-4 px-3 py-1 bg-red-800/50 rounded-md hover:bg-red-700">Dismiss</button>
          </div>
        )}
        
        {(() => {
          switch (view) {
            case 'generate-posts':
              return (
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
                  isLoading={isLoading}
                  results={generationResults}
                  onSendToAyrshareQueue={handleSendToAyrshareQueue}
                />
              );
            case 'ayrshare-queue':
              return (
                <QueuedPostsDisplay
                  queuedPosts={ayrshareQueue}
                  onDeletePost={handleDeleteQueuedPost}
                  onUpdatePost={handleUpdateQueuedPost}
                />
              );
            case 'ayrshare-log':
               return (
                <QueuedPostsDisplay
                  queuedPosts={ayrshareLog.map(log => ({ ...log, assessment: '', score: 0, platforms: log.platforms || [] }))}
                  readOnly={true}
                  title="Ayrshare Log"
                  emptyMessage="No posts have been sent yet."
                />
              );
            case 'scheduler':
              return (
                <Scheduler
                  instructions={schedulingInstructions}
                  onInstructionsChange={setSchedulingInstructions}
                  onParseSchedule={handleParseSchedule}
                  isParsing={isParsingSchedule}
                  parsedSchedule={parsedSchedule}
                />
              );
            case 'template-library':
              return (
                <PostsTemplateLibrary
                  templates={savedTemplates}
                  onSave={handleSaveTemplate}
                  onDelete={handleDeleteTemplate}
                  onAddNew={handleAddNewTemplate}
                />
              );
            case 'researcher':
              return (
                <PostResearcherPanel
                  researchScript={researchScript}
                  onResearchScriptChange={setResearchScript}
                  onResearchPosts={handleResearchPosts}
                  isLoading={isLoading}
                  results={researchedPosts}
                />
              );
            case 'generate-headlines':
              return (
                <HeadlineGeneratorPanel
                  evalCriteria={headlineEvalCriteria}
                  onEvalCriteriaChange={setHeadlineEvalCriteria}
                  onGenerateHeadlines={handleGenerateHeadlines}
                  isLoading={isLoading}
                  headlines={generatedHeadlines}
                  onReevaluate={handleReevaluateHeadline}
                  onGenerateArticle={handleSelectHeadlineForArticle}
                  sourceType={headlineSourceType}
                  onSourceTypeChange={setHeadlineSourceType}
                  sourceUrl={headlineSourceUrl}
                  onSourceUrlChange={setHeadlineSourceUrl}
                  sourceText={headlineSourceText}
                  onSourceTextChange={setHeadlineSourceText}
                  generationScript={headlineGenerationScript}
                  onGenerationScriptChange={setHeadlineGenerationScript}
                  onGenerateIdeas={handleGenerateIdeas}
                  articleIdeas={articleIdeas}
                  selectedArticleIdea={selectedArticleIdea}
                  onSelectArticleIdea={handleSelectArticleIdea}
                />
              );
            case 'generate-articles':
              return (
                <ArticleGeneratorPanel
                  wordCount={generateArticleWordCount}
                  onWordCountChange={setGenerateArticleWordCount}
                  sourceType={generateArticleSourceType}
                  onSourceTypeChange={setGenerateArticleSourceType}
                  sourceUrl={generateArticleSourceUrl}
                  onSourceUrlChange={setGenerateArticleSourceUrl}
                  sourceText={generateArticleSourceText}
                  onSourceTextChange={setGenerateArticleSourceText}
                  generationScript={generateArticleScript}
                  onGenerationScriptChange={setGenerateArticleScript}
                  onGenerate={handleGenerateArticle}
                  isLoading={isLoading}
                  generatedArticleHistory={generatedArticleHistory}
                  currentArticleIterationIndex={currentArticleIterationIndex}
                  onRevertToIteration={handleRevertToIteration}
                  articleTitle={articleTitle}
                  onArticleTitleChange={setArticleTitle}
                  endOfArticleSummary={endOfArticleSummary}
                  onEndOfArticleSummaryChange={setEndOfArticleSummary}
                  articleEvalCriteria={articleEvalCriteria}
                  onArticleEvalCriteriaChange={setArticleEvalCriteria}
                  onEnhanceArticle={handleEnhanceArticle}
                />
              );
            case 'article-template-library':
              return (
                <ArticleTemplateLibrary
                  templates={savedArticleTemplates}
                  onSave={handleSaveArticleTemplate}
                  onDelete={handleDeleteArticleTemplate}
                  onAddNew={handleOpenCreateArticleTemplateModal}
                />
              );
            case 'persona':
              return (
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
              );
            case 'backup-restore':
              return (
                <BackupRestorePanel
                  backupData={backupData}
                  onRestore={handleRestoreBackup}
                />
              );
            case 'settings':
              return (
                <SettingsPanel
                  settings={appSettings}
                  onSettingsChange={handleSaveAppSettings}
                  isAdmin={isAdmin}
                />
              );
            case 'admin':
              return isAdmin ? (
                <AdminPanel
                  settings={adminSettings}
                  onSettingsChange={handleSaveAdminSettings}
                />
              ) : null;
            case 'mobile-companion':
                return <MobileCompanionPanel />;
            default:
              return <div>View not found</div>;
          }
        })()}

        {showCreateArticleTemplateModal && (
          <CreateArticleTemplateModal
            onCreateTemplate={handleCreateArticleTemplateFromText}
            onClose={handleCloseCreateArticleTemplateModal}
            isLoading={isLoading}
            error={createArticleTemplateError}
          />
        )}
      </main>
    </div>
  );
};