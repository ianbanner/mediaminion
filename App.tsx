
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
import SelectArticleTemplateModal from './components/SelectArticleTemplateModal.tsx';
import QuickPostPanel from './components/QuickPostPanel.tsx';
import QuickArticlePanel from './components/QuickArticlePanel.tsx';
import PostingGuides from './components/PostingGuides.tsx';
import NewUserGuide from './components/NewUserGuide.tsx';
import HeadlineEditModal from './components/HeadlineEditModal.tsx';


import {
  generateAndEvaluatePosts,
  researchPopularPosts,
  parseSchedule,
  generateArticleIdeas,
  generateArticle,
  enhanceArticle,
  createArticleTemplateFromText,
  generateHeadlinesForArticle,
  GenerationResults,
  ResearchedPost,
} from './services/geminiService.ts';

import {
  testAyrshareConnection,
  postToAyrshare,
} from './services/ayrshareService.ts';

import {
  LINKEDIN_GENERATION_EVALUATION_SCRIPT,
  LINKEDIN_ANALYSIS_SCRIPT,
  DEFAULT_ARTICLE_EVAL_CRITERIA,
  GENERATE_ARTICLE_SCRIPT,
  DEFAULT_ARTICLE_HEADLINE_EVAL_CRITERIA,
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
  GeneratedArticle,
  Suggestion,
  SavedArticleTemplate,
  ArticleIdea,
  GeneratedHeadline,
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

const DEFAULT_POST_STARTER_TEXT = "Quick Tip:";
const DEFAULT_POST_SUMMARY_TEXT = `If you want to know more, here is a great article that takes this further:
[ARTICLE_URL]

If you liked this, please repost and share. It helps me a lot.

Also - DM me for the details of courses on coaching, leadership and using AI to accelerate the boring bits and get to the good stuff. Remember you won't lose your job to AI, but you might lose your job to someone who gets the very best out of AI.`;

const playSound = (type: 'success' | 'error' | 'notification') => {
  if (window.AudioContext || (window as any).webkitAudioContext) {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0.01);
    switch (type) {
      case 'success':
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.5);
        oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.5);
        break;
      case 'error':
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.3);
        break;
      case 'notification':
      default:
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.4);
        break;
    }
    oscillator.type = 'sine';
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  }
};

export const App: React.FC = () => {
  const [userEmail, setUserEmail] = useState<string | null>('dave@bigagility.com');
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [authError, setAuthError] = useState<React.ReactNode | null>(null);
  const isAdmin = useMemo(() => userEmail?.toLowerCase() === ADMIN_EMAIL, [userEmail]);

  const [view, setView] = useState('generate-posts');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<React.ReactNode | null>(null);
  const [queueError, setQueueError] = useState<React.ReactNode | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const [userRole, setUserRole] = useState(DEFAULT_USER_ROLE);
  const [targetAudience, setTargetAudience] = useState(DEFAULT_TARGET_AUDIENCE);
  const [referenceWorldContent, setReferenceWorldContent] = useState('');
  const [thisIsHowIWriteArticles, setThisIsHowIWriteArticles] = useState(DEFAULT_THIS_IS_HOW_I_WRITE_ARTICLES);

  const [articleUrl, setArticleUrl] = useState('');
  const [articleText, setArticleText] = useState('');
  const [postSourceType, setPostSourceType] = useState<'url' | 'text'>('url');
  const [standardStarterText, setStandardStarterText] = useState(DEFAULT_POST_STARTER_TEXT);
  const [standardSummaryText, setStandardSummaryText] = useState(DEFAULT_POST_SUMMARY_TEXT);
  const [generationScript, setGenerationScript] = useState(LINKEDIN_GENERATION_EVALUATION_SCRIPT);
  const [generationResults, setGenerationResults] = useState<GenerationResults | null>(null);

  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>(initialTemplates);
  const [savedArticleTemplates, setSavedArticleTemplates] = useState<SavedArticleTemplate[]>(initialArticleTemplates);
  const [showCreateArticleTemplateModal, setShowCreateArticleTemplateModal] = useState(false);
  const [showSelectArticleTemplateModal, setShowSelectArticleTemplateModal] = useState(false);

  const [ayrshareQueue, setAyrshareQueue] = useState<QueuedPost[]>([]);
  const [ayrshareLog, setAyrshareLog] = useState<SentPost[]>([]);
  const [schedulingInstructions, setSchedulingInstructions] = useState(DEFAULT_SCHEDULING_INSTRUCTIONS);
  const [parsedSchedule, setParsedSchedule] = useState<string[]>([]);
  const [isParsingSchedule, setIsParsingSchedule] = useState(false);
  const [postingNowId, setPostingNowId] = useState<string | null>(null);
  const [isQuickPosting, setIsQuickPosting] = useState(false);
  const [quickPostError, setQuickPostError] = useState<React.ReactNode | null>(null);
  const [quickPostSuccessMessage, setQuickPostSuccessMessage] = useState<string | null>(null);


  const [settings, setSettings] = useState<AppSettings>({ ayrshareApiKey: '' });
  const [adminSettings, setAdminSettings] = useState<AdminSettings>({ authorizedEmails: [], secretPassword: '' });

  const [researchScript, setResearchScript] = useState(LINKEDIN_ANALYSIS_SCRIPT);
  const [researchedPosts, setResearchedPosts] = useState<ResearchedPost[] | null>(null);

  const [headlineSourceType, setHeadlineSourceType] = useState<'url' | 'text'>('url');
  const [headlineSourceUrl, setHeadlineSourceUrl] = useState('');
  const [headlineSourceText, setHeadlineSourceText] = useState('');
  const [generatedArticleIdeas, setGeneratedArticleIdeas] = useState<ArticleIdea[] | null>(null);

  const [generateArticleWordCount, setGenerateArticleWordCount] = useState(1000);
  const [generateArticleSourceType, setGenerateArticleSourceType] = useState<'url' | 'text'>('text');
  const [generateArticleSourceUrl, setGenerateArticleSourceUrl] = useState('');
  const [generateArticleSourceText, setGenerateArticleSourceText] = useState('');
  const [generateArticleScript, setGenerateArticleScript] = useState(GENERATE_ARTICLE_SCRIPT);
  const [generatedArticleHistory, setGeneratedArticleHistory] = useState<GeneratedArticle[]>([]);
  const [currentArticleIterationIndex, setCurrentArticleIterationIndex] = useState(0);
  const [generateArticleTitle, setGenerateArticleTitle] = useState('');
  const [endOfArticleSummary, setEndOfArticleSummary] = useState(DEFAULT_END_OF_ARTICLE_SUMMARY);
  const [articleEvalCriteria, setArticleEvalCriteria] = useState(DEFAULT_ARTICLE_EVAL_CRITERIA);
  const [headlineEvalCriteriaForArticle, setHeadlineEvalCriteriaForArticle] = useState(DEFAULT_ARTICLE_HEADLINE_EVAL_CRITERIA);
  const [generatedHeadlinesForArticle, setGeneratedHeadlinesForArticle] = useState<GeneratedHeadline[] | null>(null);
  const [selectedHeadlineForEdit, setSelectedHeadlineForEdit] = useState<GeneratedHeadline | null>(null);


  const handleSaveStateToLocalStorage = useCallback(() => {
    const backupData: BackupData = {
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
      schedulingInstructions,
      parsedSchedule,
      ayrshareLog,
      settings,
      adminSettings,
      researchScript,
      researchedPosts,
      headlineSourceType,
      headlineSourceUrl,
      headlineSourceText,
      generatedArticleIdeas,
      generateArticleWordCount,
      generateArticleSourceType,
      generateArticleSourceUrl,
      generateArticleSourceText,
      generateArticleScript,
      generatedArticleHistory,
      currentArticleIterationIndex,
      generateArticleTitle,
      endOfArticleSummary,
      articleEvalCriteria,
      headlineEvalCriteriaForArticle,
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(backupData));
  }, [userRole, targetAudience, referenceWorldContent, thisIsHowIWriteArticles, articleUrl, articleText, postSourceType, standardStarterText, standardSummaryText, generationScript, savedTemplates, savedArticleTemplates, ayrshareQueue, schedulingInstructions, parsedSchedule, ayrshareLog, settings, adminSettings, researchScript, researchedPosts, headlineSourceType, headlineSourceUrl, headlineSourceText, generatedArticleIdeas, generateArticleWordCount, generateArticleSourceType, generateArticleSourceUrl, generateArticleSourceText, generateArticleScript, generatedArticleHistory, currentArticleIterationIndex, generateArticleTitle, endOfArticleSummary, articleEvalCriteria, headlineEvalCriteriaForArticle]);
  
  const restoreFromBackup = useCallback((data: BackupData) => {
    setUserRole(data.userRole || DEFAULT_USER_ROLE);
    setTargetAudience(data.targetAudience || DEFAULT_TARGET_AUDIENCE);
    setReferenceWorldContent(data.referenceWorldContent || '');
    setThisIsHowIWriteArticles(data.thisIsHowIWriteArticles || DEFAULT_THIS_IS_HOW_I_WRITE_ARTICLES);
    setArticleUrl(data.articleUrl || '');
    setArticleText(data.articleText || '');
    setPostSourceType(data.postSourceType || 'url');
    setStandardStarterText(data.standardStarterText || DEFAULT_POST_STARTER_TEXT);
    setStandardSummaryText(data.standardSummaryText || DEFAULT_POST_SUMMARY_TEXT);
    setGenerationScript(data.generationScript || LINKEDIN_GENERATION_EVALUATION_SCRIPT);
    setSavedTemplates(data.savedTemplates || initialTemplates);
    setSavedArticleTemplates(data.savedArticleTemplates || initialArticleTemplates);
    setAyrshareQueue(data.ayrshareQueue || []);
    setSchedulingInstructions(data.schedulingInstructions || DEFAULT_SCHEDULING_INSTRUCTIONS);
    setParsedSchedule(data.parsedSchedule || []);
    setAyrshareLog(data.ayrshareLog || []);
    setSettings(data.settings || { ayrshareApiKey: '' });
    setAdminSettings(data.adminSettings || { authorizedEmails: [], secretPassword: '' });
    setResearchScript(data.researchScript || LINKEDIN_ANALYSIS_SCRIPT);
    setResearchedPosts(data.researchedPosts || null);
    setHeadlineSourceType(data.headlineSourceType || 'url');
    setHeadlineSourceUrl(data.headlineSourceUrl || '');
    setHeadlineSourceText(data.headlineSourceText || '');
    setGeneratedArticleIdeas(data.generatedArticleIdeas || null);
    setGenerateArticleWordCount(data.generateArticleWordCount || 1000);
    setGenerateArticleSourceType(data.generateArticleSourceType || 'text');
    setGenerateArticleSourceUrl(data.generateArticleSourceUrl || '');
    setGenerateArticleSourceText(data.generateArticleSourceText || '');
    setGenerateArticleScript(data.generateArticleScript || GENERATE_ARTICLE_SCRIPT);
    setGeneratedArticleHistory(data.generatedArticleHistory || []);
    setCurrentArticleIterationIndex(data.currentArticleIterationIndex || 0);
    setGenerateArticleTitle(data.generateArticleTitle || '');
    setEndOfArticleSummary(data.endOfArticleSummary || DEFAULT_END_OF_ARTICLE_SUMMARY);
    setArticleEvalCriteria(data.articleEvalCriteria || DEFAULT_ARTICLE_EVAL_CRITERIA);
    setHeadlineEvalCriteriaForArticle(data.headlineEvalCriteriaForArticle || DEFAULT_ARTICLE_HEADLINE_EVAL_CRITERIA);

    playSound('success');
  }, []);

  useEffect(() => {
    const loadedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (loadedData) {
      try {
        const parsedData: BackupData = JSON.parse(loadedData);
        restoreFromBackup(parsedData);
      } catch (e) {
        console.error("Failed to parse local storage data:", e);
      }
    }
  }, [restoreFromBackup]);

  useEffect(() => {
    const saveTimer = setTimeout(() => {
      handleSaveStateToLocalStorage();
    }, 1000); 
    return () => clearTimeout(saveTimer);
  }, [handleSaveStateToLocalStorage]);


  const handleSignIn = (email: string, password?: string) => {
    setAuthError(null);
    const lowerEmail = email.toLowerCase();
    
    if (lowerEmail === ADMIN_EMAIL) {
        setUserEmail(lowerEmail);
        setIsAuthenticated(true);
        playSound('success');
        return;
    }
    
    const isAuthorized = adminSettings.authorizedEmails.map(e => e.toLowerCase()).includes(lowerEmail);
    if (isAuthorized && password === adminSettings.secretPassword) {
        setUserEmail(lowerEmail);
        setIsAuthenticated(true);
        playSound('success');
    } else if (!isAuthorized) {
        setAuthError(<span>Your email is not authorized. Please contact the administrator at <a href={`mailto:${ADMIN_EMAIL}`} className="underline">{ADMIN_EMAIL}</a>.</span>);
        playSound('error');
    } else {
        setAuthError(<span>The secret password is incorrect. Please try again.</span>);
        playSound('error');
    }
  };

  const handleSignOut = () => {
    setUserEmail(null);
    setIsAuthenticated(false);
  };
  
  const handleGeneratePosts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setGenerationResults(null);
    try {
      const results = await generateAndEvaluatePosts({
        articleUrl: postSourceType === 'url' ? articleUrl : '',
        articleText: postSourceType === 'text' ? articleText : '',
        templates: savedTemplates,
        script: generationScript,
        targetAudience,
        standardSummaryText,
        standardStarterText,
        userRole
      });
      setGenerationResults(results);
      playSound('success');
    } catch (err: any) {
      setError(<span>Generation failed. Error: {err.message}</span>);
      playSound('error');
    } finally {
      setIsLoading(false);
    }
  }, [articleUrl, articleText, postSourceType, savedTemplates, generationScript, targetAudience, standardSummaryText, standardStarterText, userRole]);

  const handleSendToAyrshareQueue = useCallback((post: TopPostAssessment, platforms: string[]) => {
    setAyrshareQueue(prev => [{ ...post, id: uuidv4(), platforms }, ...prev]);
    playSound('notification');
  }, []);

  const handleDeleteFromQueue = useCallback((id: string) => {
    setAyrshareQueue(prev => prev.filter(p => p.id !== id));
  }, []);
  
  const handleUpdateQueuePost = useCallback((id: string, updates: Partial<QueuedPost>) => {
    setAyrshareQueue(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  const handleParseSchedule = useCallback(async () => {
    setIsParsingSchedule(true);
    try {
        const times = await parseSchedule(schedulingInstructions);
        setParsedSchedule(times);
        playSound('success');
    } catch (err: any) {
        setError(<span>Failed to parse schedule. Error: {err.message}</span>);
        playSound('error');
    } finally {
        setIsParsingSchedule(false);
    }
  }, [schedulingInstructions]);
  
  const handlePostNow = useCallback(async (id: string) => {
    const post = ayrshareQueue.find(p => p.id === id);
    if (!post) return;
  
    setPostingNowId(id);
    setQueueError(null);
    try {
      if (!settings.ayrshareApiKey) {
        throw new Error("Ayrshare API Key is not set in Settings.");
      }
      await postToAyrshare(post.content, settings.ayrshareApiKey, post.platforms);
      setAyrshareLog(prev => [{ ...post, sentAt: new Date().toISOString() }, ...prev]);
      setAyrshareQueue(prev => prev.filter(p => p.id !== id));
      playSound('success');
    } catch (err: any) {
      setQueueError(<span>Failed to post: {err.message}</span>);
      playSound('error');
    } finally {
      setPostingNowId(null);
    }
  }, [ayrshareQueue, settings.ayrshareApiKey]);
  
  const handleQuickPost = useCallback(async () => {
    const topPost = ayrshareQueue[0];
    if (!topPost) return;

    setIsQuickPosting(true);
    setQuickPostError(null);
    setQuickPostSuccessMessage(null);
    try {
        if (!settings.ayrshareApiKey) {
            throw new Error("Ayrshare API Key is not set in Settings.");
        }
        await postToAyrshare(topPost.content, settings.ayrshareApiKey, topPost.platforms);
        setAyrshareLog(prev => [{ ...topPost, sentAt: new Date().toISOString() }, ...prev]);
        setAyrshareQueue(prev => prev.slice(1));
        setQuickPostSuccessMessage(topPost.content);
        playSound('success');
    } catch (err: any) {
        setQuickPostError(<span>Failed to post: {err.message}</span>);
        playSound('error');
    } finally {
        setIsQuickPosting(false);
    }
}, [ayrshareQueue, settings.ayrshareApiKey]);

  useEffect(() => {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  
    if (parsedSchedule.includes(currentTime)) {
      const topPost = ayrshareQueue[0];
      if (topPost) {
          setTimeout(() => {
              handlePostNow(topPost.id);
              if (Notification.permission === "granted") {
                new Notification("Social Media Minion", {
                  body: `Just posted "${topPost.title.substring(0, 50)}..." as per your schedule.`,
                });
              }
          }, Math.random() * 5 * 60 * 1000); // within 5 minutes
      }
    }
  }, [parsedSchedule, ayrshareQueue, handlePostNow]);

  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  const handleSaveSettings = useCallback(async (newSettings: AppSettings) => {
    const { success, message } = await testAyrshareConnection(newSettings.ayrshareApiKey);
    if (success) {
      setSettings(newSettings);
      playSound('success');
    } else {
      playSound('error');
    }
    return success;
  }, []);

  const handleResearchPosts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setResearchedPosts(null);
    try {
        const posts = await researchPopularPosts(researchScript);
        setResearchedPosts(posts);
        playSound('success');
    } catch (err: any) {
        setError(<span>Research failed. Error: {err.message}</span>);
        playSound('error');
    } finally {
        setIsLoading(false);
    }
  }, [researchScript]);
  
  const handleGenerateArticleIdeas = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setGeneratedArticleIdeas(null);
    try {
        const ideas = await generateArticleIdeas({
            sourceArticle: headlineSourceType === 'text' ? headlineSourceText : headlineSourceUrl,
            userRole,
            targetAudience
        });
        setGeneratedArticleIdeas(ideas);
        playSound('success');
    } catch (err: any) {
        setError(<span>Failed to generate ideas. Error: {err.message}</span>);
        playSound('error');
    } finally {
        setIsLoading(false);
    }
  }, [headlineSourceType, headlineSourceText, headlineSourceUrl, userRole, targetAudience]);
  
  const handleStartArticleFromIdea = (idea: ArticleIdea) => {
    setGenerateArticleTitle(idea.title);
    setGenerateArticleSourceText(`Based on the idea: "${idea.title}"\n\nSummary: ${idea.summary}\n\nKey Points:\n- ${idea.keyPoints.join('\n- ')}`);
    setGenerateArticleSourceType('text');
    setView('generate-articles');
  };

  const handleGenerateArticle = useCallback(async (selectedTemplate: SavedArticleTemplate | null) => {
    setIsLoading(true);
    setError(null);
    setGeneratedHeadlinesForArticle(null);
    setShowSelectArticleTemplateModal(false);

    try {
        const article = await generateArticle({
            script: generateArticleScript,
            wordCount: generateArticleWordCount,
            styleReferences: thisIsHowIWriteArticles,
            sourceContent: generateArticleSourceType === 'text' ? generateArticleSourceText : generateArticleSourceUrl,
            referenceWorld: referenceWorldContent,
            userRole,
            targetAudience,
            title: generateArticleTitle,
            endOfArticleSummary,
            evalCriteria: articleEvalCriteria,
            selectedTemplate,
            allTemplates: savedArticleTemplates
        });
        setGeneratedArticleHistory(prev => [...prev, article]);
        setCurrentArticleIterationIndex(prev => prev + 1);
        playSound('success');
    } catch (err: any) {
        setError(<span>Article generation failed. Error: {err.message}</span>);
        playSound('error');
    } finally {
        setIsLoading(false);
    }
  }, [
      generateArticleScript, generateArticleWordCount, thisIsHowIWriteArticles, 
      generateArticleSourceType, generateArticleSourceText, generateArticleSourceUrl,
      referenceWorldContent, userRole, targetAudience, generateArticleTitle,
      endOfArticleSummary, articleEvalCriteria, savedArticleTemplates
  ]);

  const handleEnhanceArticle = useCallback(async (suggestions: Suggestion[]) => {
      const currentArticle = generatedArticleHistory[currentArticleIterationIndex];
      if (!currentArticle) return;
      
      setIsLoading(true);
      setError(null);
      try {
          const enhancedArticle = await enhanceArticle({
              originalTitle: currentArticle.title,
              originalContent: currentArticle.content,
              evalCriteria: articleEvalCriteria,
              suggestions
          });
          setGeneratedArticleHistory(prev => [...prev, enhancedArticle]);
          setCurrentArticleIterationIndex(prev => prev + 1);
          playSound('success');
      } catch (err: any) {
          setError(<span>Article enhancement failed. Error: {err.message}</span>);
          playSound('error');
      } finally {
          setIsLoading(false);
      }
  }, [generatedArticleHistory, currentArticleIterationIndex, articleEvalCriteria]);
  
  const handleCreateArticleTemplateFromText = useCallback(async (articleText: string) => {
    setIsLoading(true);
    setError(null);
    try {
        const newTemplate = await createArticleTemplateFromText({
            articleText,
            existingTemplates: savedArticleTemplates
        });
        setSavedArticleTemplates(prev => [...prev, { ...newTemplate, id: uuidv4() }]);
        playSound('success');
        setShowCreateArticleTemplateModal(false);
        return true;
    } catch (err: any) {
        setError(<span>Failed to create template. Error: {err.message}</span>);
        playSound('error');
        return false;
    } finally {
        setIsLoading(false);
    }
  }, [savedArticleTemplates]);

  const handleGenerateHeadlinesForArticle = useCallback(async () => {
    if (!generatedArticleHistory[currentArticleIterationIndex]) return;

    setIsLoading(true);
    setError(null);
    setGeneratedHeadlinesForArticle(null);
    try {
        const articleContent = generatedArticleHistory[currentArticleIterationIndex].content;
        const headlines = await generateHeadlinesForArticle({
            articleContent,
            evalCriteria: headlineEvalCriteriaForArticle,
        });
        setGeneratedHeadlinesForArticle(headlines.map(h => ({ ...h, id: uuidv4() })));
        playSound('success');
    } catch (err: any) {
        setError(<span>Headline generation failed. Error: {err.message}</span>);
        playSound('error');
    } finally {
        setIsLoading(false);
    }
  }, [generatedArticleHistory, currentArticleIterationIndex, headlineEvalCriteriaForArticle]);

  const handleApplyHeadlineToArticle = useCallback((edited: { headline: string, subheadline?: string }) => {
      if (!generatedArticleHistory[currentArticleIterationIndex]) return;

      const currentArticle = generatedArticleHistory[currentArticleIterationIndex];
      
      const newContent = edited.subheadline 
          ? `## ${edited.subheadline}\n\n${currentArticle.content}`
          : currentArticle.content;

      const updatedArticle: GeneratedArticle = {
          ...currentArticle,
          title: edited.headline,
          content: newContent,
          headlineApplied: true,
      };

      const newHistory = [...generatedArticleHistory];
      newHistory[currentArticleIterationIndex] = updatedArticle;
      setGeneratedArticleHistory(newHistory);
      
      setGeneratedHeadlinesForArticle(null);
      setSelectedHeadlineForEdit(null);
      
      playSound('notification');
  }, [generatedArticleHistory, currentArticleIterationIndex]);

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
          isLoading={isLoading}
          results={generationResults}
          onSendToAyrshareQueue={handleSendToAyrshareQueue}
        />;
      case 'ayrshare-queue':
        return <QueuedPostsDisplay 
          queuedPosts={ayrshareQueue}
          onDeletePost={handleDeleteFromQueue}
          onUpdatePost={handleUpdateQueuePost}
          onPostNow={handlePostNow}
          postingNowId={postingNowId}
          error={queueError}
          onClearError={() => setQueueError(null)}
        />;
      case 'ayrshare-log':
        return <QueuedPostsDisplay
          queuedPosts={ayrshareLog}
          readOnly={true}
          title="Sent Posts Log"
          emptyMessage="No posts have been sent yet."
        />;
      case 'template-library':
        return <PostsTemplateLibrary 
          templates={savedTemplates}
          onSave={(id, updates) => setSavedTemplates(prev => prev.map(t => t.id === id ? {...t, ...updates, isNew: false} : t))}
          onDelete={(id) => setSavedTemplates(prev => prev.filter(t => t.id !== id))}
          onAddNew={() => setSavedTemplates(prev => [{
              id: uuidv4(),
              title: 'New Template',
              template: '',
              example: '',
              instructions: '',
              dateAdded: new Date().toLocaleDateString(),
              usageCount: 0,
              lastUsed: 'Never',
              isNew: true
          }, ...prev])}
        />;
      case 'scheduler':
        return <Scheduler 
          instructions={schedulingInstructions}
          onInstructionsChange={setSchedulingInstructions}
          onParseSchedule={handleParseSchedule}
          isParsing={isParsingSchedule}
          parsedSchedule={parsedSchedule}
        />;
      case 'admin':
        return <AdminPanel settings={adminSettings} onSettingsChange={setAdminSettings} />;
      case 'backup-restore':
        return <BackupRestorePanel backupData={{
          userRole, targetAudience, referenceWorldContent, thisIsHowIWriteArticles, articleUrl, articleText, postSourceType,
          standardStarterText, standardSummaryText, generationScript, savedTemplates, savedArticleTemplates,
          ayrshareQueue, schedulingInstructions, parsedSchedule, ayrshareLog, settings,
          adminSettings, researchScript, researchedPosts, headlineSourceType, headlineSourceUrl,
          headlineSourceText, generatedArticleIdeas, generateArticleWordCount,
          generateArticleSourceType, generateArticleSourceUrl, generateArticleSourceText,
          generateArticleScript, generatedArticleHistory, currentArticleIterationIndex,
          generateArticleTitle, endOfArticleSummary, articleEvalCriteria, headlineEvalCriteriaForArticle,
        }} onRestore={restoreFromBackup} />;
      case 'settings':
        return <SettingsPanel settings={settings} onSettingsChange={handleSaveSettings} isAdmin={isAdmin} />;
      case 'persona':
        return <PersonaPanel 
          userRole={userRole} onUserRoleChange={setUserRole}
          targetAudience={targetAudience} onTargetAudienceChange={setTargetAudience}
          referenceWorldContent={referenceWorldContent} onReferenceWorldContentChange={setReferenceWorldContent}
          thisIsHowIWriteArticles={thisIsHowIWriteArticles} onThisIsHowIWriteArticlesChange={setThisIsHowIWriteArticles}
        />;
      case 'researcher':
        return <PostResearcherPanel
            researchScript={researchScript}
            onResearchScriptChange={setResearchScript}
            onResearchPosts={handleResearchPosts}
            isLoading={isLoading}
            results={researchedPosts}
        />
      case 'generate-headlines':
        return <HeadlineGeneratorPanel 
            isLoading={isLoading}
            sourceType={headlineSourceType}
            onSourceTypeChange={setHeadlineSourceType}
            sourceUrl={headlineSourceUrl}
            onSourceUrlChange={setHeadlineSourceUrl}
            sourceText={headlineSourceText}
            onSourceTextChange={setHeadlineSourceText}
            onGenerateIdeas={handleGenerateArticleIdeas}
            articleIdeas={generatedArticleIdeas}
            onStartArticleFromIdea={handleStartArticleFromIdea}
        />;
      case 'generate-articles':
        return <ArticleGeneratorPanel 
            wordCount={generateArticleWordCount} onWordCountChange={setGenerateArticleWordCount}
            sourceType={generateArticleSourceType} onSourceTypeChange={setGenerateArticleSourceType}
            sourceUrl={generateArticleSourceUrl} onSourceUrlChange={setGenerateArticleSourceUrl}
            sourceText={generateArticleSourceText} onSourceTextChange={setGenerateArticleSourceText}
            generationScript={generateArticleScript} onGenerationScriptChange={setGenerateArticleScript}
            onGenerate={() => setShowSelectArticleTemplateModal(true)}
            isLoading={isLoading}
            generatedArticleHistory={generatedArticleHistory}
            currentArticleIterationIndex={currentArticleIterationIndex}
            onRevertToIteration={setCurrentArticleIterationIndex}
            articleTitle={generateArticleTitle} onArticleTitleChange={setGenerateArticleTitle}
            endOfArticleSummary={endOfArticleSummary} onEndOfArticleSummaryChange={setEndOfArticleSummary}
            articleEvalCriteria={articleEvalCriteria} onArticleEvalCriteriaChange={setArticleEvalCriteria}
            onEnhanceArticle={handleEnhanceArticle}
            headlineEvalCriteriaForArticle={headlineEvalCriteriaForArticle}
            onHeadlineEvalCriteriaForArticleChange={setHeadlineEvalCriteriaForArticle}
            onGenerateHeadlinesForArticle={handleGenerateHeadlinesForArticle}
            generatedHeadlinesForArticle={generatedHeadlinesForArticle}
            onSelectHeadlineForEdit={(headline) => setSelectedHeadlineForEdit(headline)}
        />;
       case 'article-template-library':
        return <ArticleTemplateLibrary 
          templates={savedArticleTemplates}
          onSave={(id, updates) => setSavedArticleTemplates(prev => prev.map(t => t.id === id ? {...t, ...updates, isNew: false} : t))}
          onDelete={(id) => setSavedArticleTemplates(prev => prev.filter(t => t.id !== id))}
          onAddNew={() => setShowCreateArticleTemplateModal(true)}
        />;
      case 'quick-post':
        return <QuickPostPanel 
            topPost={ayrshareQueue[0]} 
            onQuickPost={handleQuickPost}
            isLoading={isQuickPosting}
            error={quickPostError}
            successMessage={quickPostSuccessMessage}
        />;
      case 'quick-article':
        return <QuickArticlePanel />;
      case 'posting-guides':
        return <PostingGuides />;
      case 'new-user-guide':
        return <NewUserGuide />;
      default:
        return <div>Select a view</div>;
    }
  };

  if (!isAuthenticated) {
    return <LoginScreen onSignIn={handleSignIn} error={authError} adminEmail={ADMIN_EMAIL} />;
  }

  return (
    <>
    {showCreateArticleTemplateModal && (
        <CreateArticleTemplateModal 
            onClose={() => {
                setShowCreateArticleTemplateModal(false);
                setError(null);
            }}
            onCreateTemplate={handleCreateArticleTemplateFromText}
            isLoading={isLoading}
            error={error}
        />
    )}
    {showSelectArticleTemplateModal && (
        <SelectArticleTemplateModal
            templates={savedArticleTemplates}
            onClose={() => setShowSelectArticleTemplateModal(false)}
            onSelect={(template) => handleGenerateArticle(template)}
        />
    )}
    {selectedHeadlineForEdit && (
        <HeadlineEditModal
            isOpen={!!selectedHeadlineForEdit}
            headline={selectedHeadlineForEdit}
            onClose={() => setSelectedHeadlineForEdit(null)}
            onSave={handleApplyHeadlineToArticle}
        />
    )}

    <div className="flex h-screen bg-gray-900 text-white">
      <div className="hidden md:flex">
         <Sidebar 
            view={view} setView={setView} 
            onSignOut={handleSignOut}
            userEmail={userEmail || ''}
            isAdmin={isAdmin}
            templateCount={savedTemplates.length}
            articleTemplateCount={savedArticleTemplates.length}
            showMobileMenu={showMobileMenu}
            onToggleMobileMenu={() => setShowMobileMenu(prev => !prev)}
            setShowMobileMenu={setShowMobileMenu}
        />
      </div>
      <main className="flex-1 p-6 md:p-10 overflow-y-auto bg-slate-900/50 relative">
        {error && (
            <div className="bg-red-900/50 p-4 rounded-lg border border-red-700 text-sm text-red-300 mb-6 flex justify-between items-center animate-fade-in-fast">
                <span>{error}</span>
                <button onClick={() => setError(null)} className="font-bold text-lg">&times;</button>
            </div>
        )}
        {renderView()}
      </main>
    </div>
    </>
  );
};
