import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Sidebar from './components/Sidebar.tsx';
import LoginScreen from './components/LoginScreen.tsx';
import LandingPage from './components/LandingPage.tsx';
import PricingPage from './components/PricingPage.tsx';
import FAQPage from './components/FAQPage.tsx';
import GenerationPanel from './components/GenerationPanel.tsx';
import QueuedPostsDisplay from './components/QueuedPostsDisplay.tsx';
import Scheduler from './components/Scheduler.tsx';
import PostsTemplateLibrary from './components/PostsTemplateLibrary.tsx';
import PostResearcherPanel from './components/PostResearcherPanel.tsx';
import HeadlineGeneratorPanel from './components/HeadlineGeneratorPanel.tsx';
import ArticleGeneratorPanel from './components/ArticleGeneratorPanel.tsx';
import RefineArticlePanel from './components/RefineArticlePanel.tsx';
import ArticleTemplateLibrary from './components/ArticleTemplateLibrary.tsx';
import RecycleArticlePanel from './components/RecycleArticlePanel.tsx';
import AudioScriptGeneratorPanel from './components/AudioScriptGeneratorPanel.tsx';
import ArchivePanel from './components/ArchivePanel.tsx';
import GeneratePodcastPanel from './components/GeneratePodcastPanel.tsx';
import NewUserGuide from './components/NewUserGuide.tsx';
import ChecklistGuide from './components/ChecklistGuide.tsx';
import PostingGuides from './components/PostingGuides.tsx';
import PersonaPanel from './components/PersonaPanel.tsx';
import SettingsPanel from './components/SettingsPanel.tsx';
import BackupRestorePanel from './components/BackupRestorePanel.tsx';
import AdminPanel from './components/AdminPanel.tsx';
import CreateArticleTemplateModal from './components/CreateArticleTemplateModal.tsx';
import SelectArticleTemplateModal from './components/SelectArticleTemplateModal.tsx';
import HeadlineEditModal from './components/HeadlineEditModal.tsx';
import QuickPostPanel from './components/QuickPostPanel.tsx';

import { 
  SavedTemplate, SavedArticleTemplate, QueuedPost, AppSettings, 
  AdminSettings, ChecklistItem, GeneratedArticle, ArticleIdea, 
  GeneratedHeadline, BackupData, PodcastIdea, PodcastPlan, GeneratedAudioScript, 
  ArticleDestination
} from './types.ts';

import { initialTemplates } from './services/templateData.ts';
import { initialArticleTemplates } from './services/articleTemplateData.ts';
import { 
  LINKEDIN_GENERATION_EVALUATION_SCRIPT,
  LINKEDIN_ANALYSIS_SCRIPT,
  GENERATE_ARTICLE_IDEAS_SCRIPT,
  GENERATE_ARTICLE_SCRIPT,
  ENHANCE_ARTICLE_SCRIPT,
  POLISH_ARTICLE_SCRIPT,
  GENERATE_HEADLINES_FOR_ARTICLE_SCRIPT,
  RECYCLE_ARTICLE_SCRIPT,
  GENERATE_AUDIO_SCRIPT_SCRIPT,
  GENERATE_PODCAST_IDEAS_SCRIPT,
  GENERATE_ADJACENT_PODCAST_IDEAS_SCRIPT,
  GENERATE_PODCAST_PLAN_SCRIPT,
  DESTINATION_GUIDELINES_MAP,
  DEFAULT_ARTICLE_EVAL_CRITERIA,
  DEFAULT_HEADLINE_EVAL_CRITERIA
} from './services/scriptService.ts';

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
  generateAudioScript
} from './services/geminiService.ts';

import { postToAyrshare } from './services/ayrshareService.ts';

const DEFAULT_ADMIN_SETTINGS: AdminSettings = {
  authorizedEmails: ['dave@bigagility.com', 'chris@bigagility.com', 'sshp@bigagility.com'],
  secretPassword: 'admin',
  userActivity: {}
};

export const App: React.FC = () => {
  // Auth & Navigation
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [view, setView] = useState('home');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Persona
  const [userRole, setUserRole] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [referenceWorldContent, setReferenceWorldContent] = useState('');
  const [thisIsHowIWriteArticles, setThisIsHowIWriteArticles] = useState('');

  // Settings
  const [settings, setSettings] = useState<AppSettings>({ ayrshareApiKey: '' });
  const [adminSettings, setAdminSettings] = useState<AdminSettings>(DEFAULT_ADMIN_SETTINGS);

  // Posts
  const [postsTemplates, setPostsTemplates] = useState<SavedTemplate[]>(initialTemplates);
  const [postSourceType, setPostSourceType] = useState<'url' | 'text'>('url');
  const [articleUrl, setArticleUrl] = useState('');
  const [articleText, setArticleText] = useState('');
  const [standardStarterText, setStandardStarterText] = useState('');
  const [standardSummaryText, setStandardSummaryText] = useState('');
  const [generationScript, setGenerationScript] = useState(LINKEDIN_GENERATION_EVALUATION_SCRIPT);
  const [generatedPostsResults, setGeneratedPostsResults] = useState<any>(null);
  const [isGeneratingPosts, setIsGeneratingPosts] = useState(false);

  // Queue & Schedule
  const [ayrshareQueue, setAyrshareQueue] = useState<QueuedPost[]>([]);
  const [scheduledPosts, setScheduledPosts] = useState<QueuedPost[]>([]);
  const [historicalPosts, setHistoricalPosts] = useState<QueuedPost[]>([]);
  const [schedulingInstructions, setSchedulingInstructions] = useState('Post once at 8am and again at 5pm UK time on weekdays');
  const [parsedSchedule, setParsedSchedule] = useState<string[]>([]);
  const [isUpdatingSchedule, setIsUpdatingSchedule] = useState(false);
  const [isSendingToAyrshare, setIsSendingToAyrshare] = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [quickPostError, setQuickPostError] = useState<string | null>(null);
  const [quickPostSuccess, setQuickPostSuccess] = useState<string | null>(null);
  const [isQuickPosting, setIsQuickPosting] = useState(false);
  const [postingNowId, setPostingNowId] = useState<string | null>(null);

  // Researcher
  const [researchScript, setResearchScript] = useState(LINKEDIN_ANALYSIS_SCRIPT);
  const [researchedPosts, setResearchedPosts] = useState<any[] | null>(null);
  const [isResearching, setIsResearching] = useState(false);

  // Articles
  const [articleTemplates, setArticleTemplates] = useState<SavedArticleTemplate[]>(initialArticleTemplates);
  
  const [generateArticleIdeasScript, setGenerateArticleIdeasScript] = useState(GENERATE_ARTICLE_IDEAS_SCRIPT);
  const [articleIdeaSourceType, setArticleIdeaSourceType] = useState<'url' | 'text'>('url');
  const [articleIdeaSourceUrl, setArticleIdeaSourceUrl] = useState('');
  const [articleIdeaSourceText, setArticleIdeaSourceText] = useState('');
  const [generatedArticleIdeas, setGeneratedArticleIdeas] = useState<ArticleIdea[] | null>(null);
  const [isGeneratingArticleIdeas, setIsGeneratingArticleIdeas] = useState(false);

  const [generateArticleScript, setGenerateArticleScript] = useState(GENERATE_ARTICLE_SCRIPT);
  const [generateArticleWordCount, setGenerateArticleWordCount] = useState(2000);
  const [generateArticleSourceType, setGenerateArticleSourceType] = useState<'url' | 'text'>('text');
  const [generateArticleSourceUrl, setGenerateArticleSourceUrl] = useState('');
  const [generateArticleSourceText, setGenerateArticleSourceText] = useState('');
  const [generateArticleTitle, setGenerateArticleTitle] = useState('');
  const [articleStarterText, setArticleStarterText] = useState('');
  const [endOfArticleSummary, setEndOfArticleSummary] = useState('');
  const [generateArticleDestination, setGenerateArticleDestination] = useState<ArticleDestination>('LinkedIn');
  const [generatedArticleHistory, setGeneratedArticleHistory] = useState<GeneratedArticle[]>([]);
  const [currentArticleIterationIndex, setCurrentArticleIterationIndex] = useState(-1);
  const [isGeneratingArticle, setIsGeneratingArticle] = useState(false);
  const [showSelectTemplateModal, setShowSelectTemplateModal] = useState(false);
  const [selectedArticleTemplate, setSelectedArticleTemplate] = useState<SavedArticleTemplate | null>(null);

  const [isEnhancingArticle, setIsEnhancingArticle] = useState(false);
  const [polishScript, setPolishScript] = useState(POLISH_ARTICLE_SCRIPT);
  const [isPolishingArticle, setIsPolishingArticle] = useState(false);
  const [generateHeadlinesForArticleScript, setGenerateHeadlinesForArticleScript] = useState(GENERATE_HEADLINES_FOR_ARTICLE_SCRIPT);
  const [generatedHeadlinesForArticle, setGeneratedHeadlinesForArticle] = useState<GeneratedHeadline[] | null>(null);
  const [isGeneratingHeadlines, setIsGeneratingHeadlines] = useState(false);
  const [showHeadlineEditModal, setShowHeadlineEditModal] = useState(false);
  const [selectedHeadlineToEdit, setSelectedHeadlineToEdit] = useState<GeneratedHeadline | null>(null);

  const [recycleArticleText, setRecycleArticleText] = useState('');
  const [recycleArticleScript, setRecycleArticleScript] = useState(RECYCLE_ARTICLE_SCRIPT);
  const [isRecyclingArticle, setIsRecyclingArticle] = useState(false);

  const [showCreateArticleTemplateModal, setShowCreateArticleTemplateModal] = useState(false);
  const [isCreatingArticleTemplate, setIsCreatingArticleTemplate] = useState(false);
  const [createTemplateError, setCreateTemplateError] = useState<string | null>(null);

  // Audio Script
  const [audioScriptSourceText, setAudioScriptSourceText] = useState('');
  const [audioScriptDuration, setAudioScriptDuration] = useState(7);
  const [generateAudioScriptScript, setGenerateAudioScriptScript] = useState(GENERATE_AUDIO_SCRIPT_SCRIPT);
  const [generatedAudioScript, setGeneratedAudioScript] = useState<GeneratedAudioScript | null>(null);
  const [archivedAudioScripts, setArchivedAudioScripts] = useState<GeneratedAudioScript[]>([]);
  const [isGeneratingAudioScript, setIsGeneratingAudioScript] = useState(false);

  // Podcast Plan
  const [podcastSourceType, setPodcastSourceType] = useState<'url' | 'text'>('text');
  const [podcastSourceUrl, setPodcastSourceUrl] = useState('');
  const [podcastSourceText, setPodcastSourceText] = useState('');
  const [generatePodcastIdeasScript, setGeneratePodcastIdeasScript] = useState(GENERATE_PODCAST_IDEAS_SCRIPT);
  const [generatedPodcastIdeas, setGeneratedPodcastIdeas] = useState<PodcastIdea[] | null>(null);
  const [isGeneratingPodcastIdeas, setIsGeneratingPodcastIdeas] = useState(false);
  
  const [generateAdjacentPodcastIdeasScript, setGenerateAdjacentPodcastIdeasScript] = useState(GENERATE_ADJACENT_PODCAST_IDEAS_SCRIPT);
  const [selectedInitialPodcastIdea, setSelectedInitialPodcastIdea] = useState<PodcastIdea | null>(null);
  const [generatedAdjacentPodcastIdeas, setGeneratedAdjacentPodcastIdeas] = useState<PodcastIdea[] | null>(null);
  const [isGeneratingAdjacentPodcastIdeas, setIsGeneratingAdjacentPodcastIdeas] = useState(false);

  const [generatePodcastPlanScript, setGeneratePodcastPlanScript] = useState(GENERATE_PODCAST_PLAN_SCRIPT);
  const [generatedPodcastPlan, setGeneratedPodcastPlan] = useState<PodcastPlan | null>(null);
  const [isGeneratingPodcastPlan, setIsGeneratingPodcastPlan] = useState(false);
  const [archivedPodcastPlans, setArchivedPodcastPlans] = useState<PodcastPlan[]>([]);

  // Checklist
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);

  useEffect(() => {
    const savedData = localStorage.getItem('minionData');
    if (savedData) {
        try {
            const parsed: BackupData = JSON.parse(savedData);
            if (parsed.userEmail) setUserEmail(parsed.userEmail);
            if (parsed.userRole) setUserRole(parsed.userRole);
            if (parsed.targetAudience) setTargetAudience(parsed.targetAudience);
            if (parsed.referenceWorldContent) setReferenceWorldContent(parsed.referenceWorldContent);
            if (parsed.thisIsHowIWriteArticles) setThisIsHowIWriteArticles(parsed.thisIsHowIWriteArticles);
            if (parsed.articleUrl) setArticleUrl(parsed.articleUrl);
            if (parsed.articleText) setArticleText(parsed.articleText);
            if (parsed.postSourceType) setPostSourceType(parsed.postSourceType);
            if (parsed.standardStarterText) setStandardStarterText(parsed.standardStarterText);
            if (parsed.standardSummaryText) setStandardSummaryText(parsed.standardSummaryText);
            if (parsed.generationScript) setGenerationScript(parsed.generationScript);
            if (parsed.savedTemplates) setPostsTemplates(parsed.savedTemplates);
            if (parsed.savedArticleTemplates) setArticleTemplates(parsed.savedArticleTemplates);
            if (parsed.ayrshareQueue) setAyrshareQueue(parsed.ayrshareQueue);
            if (parsed.scheduledPosts) setScheduledPosts(parsed.scheduledPosts);
            if (parsed.historicalPosts) setHistoricalPosts(parsed.historicalPosts);
            if (parsed.schedulingInstructions) setSchedulingInstructions(parsed.schedulingInstructions);
            if (parsed.parsedSchedule) setParsedSchedule(parsed.parsedSchedule);
            if (parsed.settings) setSettings(parsed.settings);
            if (parsed.adminSettings) setAdminSettings(parsed.adminSettings);
            if (parsed.researchScript) setResearchScript(parsed.researchScript);
            if (parsed.researchedPosts) setResearchedPosts(parsed.researchedPosts);
            if (parsed.generatedArticleIdeas) setGeneratedArticleIdeas(parsed.generatedArticleIdeas);
            if (parsed.generateArticleIdeasScript) setGenerateArticleIdeasScript(parsed.generateArticleIdeasScript);
            if (parsed.generateArticleWordCount) setGenerateArticleWordCount(parsed.generateArticleWordCount);
            if (parsed.generateArticleSourceType) setGenerateArticleSourceType(parsed.generateArticleSourceType);
            if (parsed.generateArticleSourceUrl) setGenerateArticleSourceUrl(parsed.generateArticleSourceUrl);
            if (parsed.generateArticleSourceText) setGenerateArticleSourceText(parsed.generateArticleSourceText);
            if (parsed.generateArticleScript) setGenerateArticleScript(parsed.generateArticleScript);
            if (parsed.recycleArticleText) setRecycleArticleText(parsed.recycleArticleText);
            if (parsed.recycleArticleScript) setRecycleArticleScript(parsed.recycleArticleScript);
            if (parsed.generatedArticleHistory) setGeneratedArticleHistory(parsed.generatedArticleHistory);
            if (parsed.currentArticleIterationIndex !== undefined) setCurrentArticleIterationIndex(parsed.currentArticleIterationIndex);
            if (parsed.generateArticleTitle) setGenerateArticleTitle(parsed.generateArticleTitle);
            if (parsed.articleStarterText) setArticleStarterText(parsed.articleStarterText);
            if (parsed.endOfArticleSummary) setEndOfArticleSummary(parsed.endOfArticleSummary);
            if (parsed.generateHeadlinesForArticleScript) setGenerateHeadlinesForArticleScript(parsed.generateHeadlinesForArticleScript);
            if (parsed.generateArticleDestination) setGenerateArticleDestination(parsed.generateArticleDestination);
            
            // Podcast
            if (parsed.generatedPodcastIdeas) setGeneratedPodcastIdeas(parsed.generatedPodcastIdeas);
            if (parsed.selectedInitialPodcastIdea) setSelectedInitialPodcastIdea(parsed.selectedInitialPodcastIdea);
            if (parsed.generatedAdjacentPodcastIdeas) setGeneratedAdjacentPodcastIdeas(parsed.generatedAdjacentPodcastIdeas);
            if (parsed.generatePodcastIdeasScript) setGeneratePodcastIdeasScript(parsed.generatePodcastIdeasScript);
            if (parsed.generatedPodcastPlan) setGeneratedPodcastPlan(parsed.generatedPodcastPlan);
            if (parsed.podcastSourceUrl) setPodcastSourceUrl(parsed.podcastSourceUrl);
            if (parsed.podcastSourceText) setPodcastSourceText(parsed.podcastSourceText);
            if (parsed.podcastSourceType) setPodcastSourceType(parsed.podcastSourceType);
            if (parsed.archivedPodcastPlans) setArchivedPodcastPlans(parsed.archivedPodcastPlans);

            // Audio Script
            if (parsed.audioScriptSourceText) setAudioScriptSourceText(parsed.audioScriptSourceText);
            if (parsed.audioScriptDuration) setAudioScriptDuration(parsed.audioScriptDuration);
            if (parsed.generateAudioScriptScript) setGenerateAudioScriptScript(parsed.generateAudioScriptScript);
            if (parsed.generatedAudioScript) setGeneratedAudioScript(parsed.generatedAudioScript);
            if (parsed.archivedAudioScripts) setArchivedAudioScripts(parsed.archivedAudioScripts);

            // Checklist
            if (parsed.checklistItems) setChecklistItems(parsed.checklistItems);

        } catch (e) {
            console.error("Failed to parse saved data", e);
        }
    }
  }, []);

  useEffect(() => {
    if (userEmail) {
        const backupData: BackupData = {
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
            savedTemplates: postsTemplates,
            savedArticleTemplates: articleTemplates,
            ayrshareQueue,
            scheduledPosts,
            historicalPosts,
            schedulingInstructions,
            parsedSchedule,
            ayrshareLog: [],
            settings,
            adminSettings,
            researchScript,
            researchedPosts,
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
            generateHeadlinesForArticleScript,
            generateArticleDestination,
            generatedPodcastIdeas,
            selectedInitialPodcastIdea,
            generatedAdjacentPodcastIdeas,
            generatePodcastIdeasScript,
            generatedPodcastPlan,
            podcastSourceUrl,
            podcastSourceText,
            podcastSourceType,
            archivedPodcastPlans,
            audioScriptSourceText,
            audioScriptDuration,
            generateAudioScriptScript,
            generatedAudioScript,
            archivedAudioScripts,
            checklistItems
        };
        localStorage.setItem('minionData', JSON.stringify(backupData));
    }
  }, [
      userEmail, userRole, targetAudience, referenceWorldContent, thisIsHowIWriteArticles,
      articleUrl, articleText, postSourceType, standardStarterText, standardSummaryText, generationScript,
      postsTemplates, articleTemplates, ayrshareQueue, scheduledPosts, historicalPosts, schedulingInstructions,
      parsedSchedule, settings, adminSettings, researchScript, researchedPosts,
      generatedArticleIdeas, generateArticleIdeasScript, generateArticleWordCount,
      generateArticleSourceType, generateArticleSourceUrl, generateArticleSourceText, generateArticleScript,
      recycleArticleText, recycleArticleScript, generatedArticleHistory, currentArticleIterationIndex,
      generateArticleTitle, articleStarterText, endOfArticleSummary, generateHeadlinesForArticleScript,
      generateArticleDestination, generatedPodcastIdeas, selectedInitialPodcastIdea, generatedAdjacentPodcastIdeas,
      generatePodcastIdeasScript, generatedPodcastPlan, podcastSourceUrl, podcastSourceText, podcastSourceType, archivedPodcastPlans,
      audioScriptSourceText, audioScriptDuration, generateAudioScriptScript, generatedAudioScript, archivedAudioScripts,
      checklistItems
  ]);

  const handleSignIn = (email: string, password?: string) => {
    setUserEmail(email);
    setShowLoginModal(false);
    setView('checklist');
  };

  const handleSignOut = () => {
      setUserEmail(null);
      setView('home');
      setGeneratedPostsResults(null);
  };

  if (!userEmail) {
      let CurrentPage;
      switch (view) {
          case 'pricing':
              CurrentPage = <PricingPage onLoginClick={() => setShowLoginModal(true)} onNavigate={setView} currentPage={view} />;
              break;
          case 'questions':
              CurrentPage = <FAQPage onLoginClick={() => setShowLoginModal(true)} onNavigate={setView} currentPage={view} />;
              break;
          default:
              CurrentPage = <LandingPage onLoginClick={() => setShowLoginModal(true)} onNavigate={setView} currentPage={view} />;
              break;
      }

      return (
        <>
            {CurrentPage}
            {showLoginModal && (
                <LoginScreen 
                    onSignIn={handleSignIn} 
                    error={loginError} 
                    superUsers={adminSettings.authorizedEmails} 
                    onClose={() => setShowLoginModal(false)}
                />
            )}
        </>
      );
  }

  const isAdmin = true;

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 font-sans overflow-hidden">
        <Sidebar 
            view={view} 
            setView={setView} 
            onSignOut={handleSignOut} 
            userEmail={userEmail} 
            isAdmin={isAdmin}
            templateCount={postsTemplates.length}
            articleTemplateCount={articleTemplates.length}
            showMobileMenu={showMobileMenu}
            setShowMobileMenu={setShowMobileMenu}
            onToggleMobileMenu={() => setShowMobileMenu(!showMobileMenu)}
            hasGeneratedArticle={generatedArticleHistory.length > 0}
        />
        
        <main className="flex-1 overflow-auto bg-gray-900 relative">
             <div className="md:hidden p-4 border-b border-slate-800 flex justify-between items-center bg-gray-900 sticky top-0 z-30">
                <span className="font-bold text-lg">Social Media Minion</span>
                <button onClick={() => setShowMobileMenu(true)} className="text-gray-400">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                </button>
            </div>

            <div className="p-4 md:p-8 max-w-7xl mx-auto">
                {view === 'new-user-guide' && <NewUserGuide />}
                {view === 'checklist' && <ChecklistGuide items={checklistItems} onToggleItem={(id) => {
                     setChecklistItems(prev => prev.map(i => i.id === id ? { ...i, isCompleted: !i.isCompleted } : i));
                }} />}
                {view === 'posting-guides' && <PostingGuides />}

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
                        isLoading={isGeneratingPosts}
                        results={generatedPostsResults}
                        onGenerate={async () => {
                            setIsGeneratingPosts(true);
                            try {
                                const results = await generateAndEvaluatePosts({
                                    articleUrl, articleText, templates: postsTemplates, 
                                    script: generationScript, targetAudience, 
                                    standardSummaryText, standardStarterText, userRole
                                });
                                setGeneratedPostsResults(results);
                            } catch (e) { console.error(e); alert("Generation failed."); } finally { setIsGeneratingPosts(false); }
                        }}
                        onSendToAyrshareQueue={(post, platforms) => {
                            setAyrshareQueue(prev => [...prev, { ...post, id: uuidv4(), platforms, status: 'scheduled', score: post.score }]);
                        }}
                    />
                )}
                {view === 'queue' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                             <QueuedPostsDisplay 
                                queuedPosts={ayrshareQueue} 
                                onDeletePost={(id) => setAyrshareQueue(prev => prev.filter(p => p.id !== id))}
                                onUpdatePost={(id, updates) => setAyrshareQueue(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))}
                                onPostNow={async (id) => {
                                    const post = ayrshareQueue.find(p => p.id === id);
                                    if (!post) return;
                                    setPostingNowId(id);
                                    try {
                                        await postToAyrshare(post.content, settings.ayrshareApiKey, post.platforms || ['linkedin']);
                                        setAyrshareQueue(prev => prev.filter(p => p.id !== id));
                                        setHistoricalPosts(prev => [{...post, status: 'posted', sentAt: new Date().toISOString()}, ...prev]);
                                    } catch (e: any) { alert("Posting failed: " + e.message); } finally { setPostingNowId(null); }
                                }}
                                postingNowId={postingNowId}
                             />
                        </div>
                        <div>
                             <QuickPostPanel 
                                topPost={ayrshareQueue[0]}
                                isLoading={isQuickPosting}
                                error={quickPostError}
                                successMessage={quickPostSuccess}
                                onQuickPost={async () => {
                                    if (!ayrshareQueue[0]) return;
                                    setIsQuickPosting(true);
                                    setQuickPostError(null);
                                    setQuickPostSuccess(null);
                                    try {
                                        const post = ayrshareQueue[0];
                                        await postToAyrshare(post.content, settings.ayrshareApiKey, post.platforms || ['linkedin']);
                                        setAyrshareQueue(prev => prev.slice(1));
                                        setHistoricalPosts(prev => [{...post, status: 'posted', sentAt: new Date().toISOString()}, ...prev]);
                                        setQuickPostSuccess(post.content);
                                    } catch (e: any) { setQuickPostError(e.message); } finally { setIsQuickPosting(false); }
                                }}
                             />
                        </div>
                    </div>
                )}
                {view === 'scheduler' && (
                    <Scheduler 
                        instructions={schedulingInstructions}
                        onInstructionsChange={setSchedulingInstructions}
                        isUpdating={isUpdatingSchedule}
                        parsedSchedule={parsedSchedule}
                        queueCount={ayrshareQueue.length}
                        scheduledPosts={scheduledPosts}
                        historicalPosts={historicalPosts}
                        isSendingToAyrshare={isSendingToAyrshare}
                        error={scheduleError}
                        onUpdateSchedule={async () => {
                            setIsUpdatingSchedule(true);
                            setScheduleError(null);
                            try {
                                const times = await parseSchedule(schedulingInstructions);
                                setParsedSchedule(times);
                                const newScheduled = ayrshareQueue.map((p, i) => ({
                                    ...p, 
                                    scheduledTime: new Date(Date.now() + (i+1)*86400000).toISOString(),
                                    status: 'scheduled' as const
                                }));
                                setScheduledPosts(prev => [...prev, ...newScheduled]);
                                setAyrshareQueue([]);
                            } catch (e: any) { setScheduleError(e.message); } finally { setIsUpdatingSchedule(false); }
                        }}
                        onSendToAyrshare={async () => {
                            setIsSendingToAyrshare(true);
                            setScheduleError(null);
                            try {
                                await new Promise(r => setTimeout(r, 1000));
                                setScheduledPosts(prev => prev.map(p => ({...p, status: 'sent-to-ayrshare'})));
                            } catch (e: any) { setScheduleError(e.message); } finally { setIsSendingToAyrshare(false); }
                        }}
                    />
                )}
                {view === 'templates' && (
                    <PostsTemplateLibrary 
                        templates={postsTemplates} 
                        onSave={(id, updates) => setPostsTemplates(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))}
                        onDelete={(id) => setPostsTemplates(prev => prev.filter(t => t.id !== id))}
                        onAddNew={() => setPostsTemplates(prev => [{ id: uuidv4(), title: 'New Template', template: '', example: '', instructions: '', dateAdded: new Date().toLocaleDateString(), usageCount: 0, lastUsed: 'Never', isNew: true }, ...prev])}
                    />
                )}
                {view === 'researcher' && (
                    <PostResearcherPanel 
                        researchScript={researchScript}
                        onResearchScriptChange={setResearchScript}
                        isLoading={isResearching}
                        results={researchedPosts}
                        onResearchPosts={async () => {
                            setIsResearching(true);
                            try {
                                const posts = await researchPopularPosts(researchScript);
                                setResearchedPosts(posts);
                            } catch (e) { console.error(e); alert("Research failed."); } finally { setIsResearching(false); }
                        }}
                    />
                )}

                {view === 'headline-generator' && (
                    <HeadlineGeneratorPanel 
                        isLoading={isGeneratingArticleIdeas}
                        sourceType={articleIdeaSourceType}
                        onSourceTypeChange={setArticleIdeaSourceType}
                        sourceUrl={articleIdeaSourceUrl}
                        onSourceUrlChange={setArticleIdeaSourceUrl}
                        sourceText={articleIdeaSourceText}
                        onSourceTextChange={setArticleIdeaSourceText}
                        articleIdeas={generatedArticleIdeas}
                        generateArticleIdeasScript={generateArticleIdeasScript}
                        onGenerateArticleIdeasScriptChange={setGenerateArticleIdeasScript}
                        onGenerateIdeas={async (script) => {
                            setIsGeneratingArticleIdeas(true);
                            try {
                                const source = articleIdeaSourceType === 'url' ? articleIdeaSourceUrl : articleIdeaSourceText;
                                const ideas = await generateArticleIdeas({ sourceArticle: source, userRole, targetAudience, script });
                                setGeneratedArticleIdeas(ideas);
                            } catch (e) { console.error(e); alert("Idea generation failed."); } finally { setIsGeneratingArticleIdeas(false); }
                        }}
                        onStartArticleFromIdea={(idea) => {
                            setGenerateArticleTitle(idea.title);
                            setGenerateArticleSourceText(`Title: ${idea.title}\nSummary: ${idea.summary}\nKey Points: ${idea.keyPoints.join('\n')}`);
                            setGenerateArticleSourceType('text');
                            setView('generate-articles');
                        }}
                    />
                )}
                {view === 'generate-articles' && (
                    <>
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
                            onGenerate={() => setShowSelectTemplateModal(true)}
                        />
                        {showSelectTemplateModal && (
                            <SelectArticleTemplateModal 
                                templates={articleTemplates}
                                onClose={() => setShowSelectTemplateModal(false)}
                                onSelect={async (template) => {
                                    setShowSelectTemplateModal(false);
                                    setSelectedArticleTemplate(template);
                                    setIsGeneratingArticle(true);
                                    try {
                                        const source = generateArticleSourceType === 'url' ? generateArticleSourceUrl : generateArticleSourceText;
                                        const article = await generateArticle({
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
                                            evalCriteria: DEFAULT_ARTICLE_EVAL_CRITERIA,
                                            selectedTemplate: template,
                                            allTemplates: articleTemplates,
                                            finalDestination: generateArticleDestination,
                                            finalDestinationGuidelines: DESTINATION_GUIDELINES_MAP[generateArticleDestination]
                                        });
                                        const newArticleWithType = { ...article, type: 'initial' as const, headlineApplied: false };
                                        setGeneratedArticleHistory([newArticleWithType]);
                                        setCurrentArticleIterationIndex(0);
                                        setView('refine-article');
                                    } catch (e) { console.error(e); alert("Generation failed."); } finally { setIsGeneratingArticle(false); }
                                }}
                            />
                        )}
                    </>
                )}
                {view === 'refine-article' && (
                    <>
                        <RefineArticlePanel 
                            isEnhancingArticle={isEnhancingArticle}
                            isPolishingArticle={isPolishingArticle}
                            isGeneratingHeadlines={isGeneratingHeadlines}
                            generatedArticleHistory={generatedArticleHistory}
                            currentArticleIterationIndex={currentArticleIterationIndex}
                            onRevertToIteration={setCurrentArticleIterationIndex}
                            onEnhanceArticle={async (suggestions) => {
                                setIsEnhancingArticle(true);
                                const current = generatedArticleHistory[currentArticleIterationIndex];
                                try {
                                    const enhanced = await enhanceArticle({
                                        originalTitle: current.title,
                                        originalContent: current.content,
                                        evalCriteria: DEFAULT_ARTICLE_EVAL_CRITERIA,
                                        suggestions
                                    });
                                    setGeneratedArticleHistory(prev => [...prev, { ...enhanced, type: 'enhanced', headlineApplied: false }]);
                                    setCurrentArticleIterationIndex(prev => prev + 1);
                                } catch (e) { console.error(e); alert("Enhancement failed."); } finally { setIsEnhancingArticle(false); }
                            }}
                            onPolishArticle={async (script) => {
                                setIsPolishingArticle(true);
                                const current = generatedArticleHistory[currentArticleIterationIndex];
                                try {
                                    const polished = await polishArticle({
                                        originalTitle: current.title,
                                        originalContent: current.content,
                                        evalCriteria: DEFAULT_ARTICLE_EVAL_CRITERIA,
                                        styleReferences: thisIsHowIWriteArticles,
                                        polishScript: script
                                    });
                                    setGeneratedArticleHistory(prev => [...prev, { ...polished, type: 'polished', headlineApplied: false }]);
                                    setCurrentArticleIterationIndex(prev => prev + 1);
                                } catch (e) { console.error(e); alert("Polishing failed."); } finally { setIsPolishingArticle(false); }
                            }}
                            onGenerateHeadlinesForArticle={async (script) => {
                                setIsGeneratingHeadlines(true);
                                const current = generatedArticleHistory[currentArticleIterationIndex];
                                try {
                                    const headlines = await generateHeadlinesForArticle({
                                        articleContent: current.content,
                                        evalCriteria: DEFAULT_HEADLINE_EVAL_CRITERIA,
                                        script
                                    });
                                    setGeneratedHeadlinesForArticle(headlines.map(h => ({ ...h, id: uuidv4() })));
                                } catch (e) { console.error(e); alert("Headline generation failed."); } finally { setIsGeneratingHeadlines(false); }
                            }}
                            generatedHeadlinesForArticle={generatedHeadlinesForArticle}
                            onSelectHeadlineForEdit={(headline) => {
                                setSelectedHeadlineToEdit(headline);
                                setShowHeadlineEditModal(true);
                            }}
                            generateHeadlinesForArticleScript={generateHeadlinesForArticleScript}
                            onGenerateHeadlinesForArticleScriptChange={setGenerateHeadlinesForArticleScript}
                        />
                        {showHeadlineEditModal && selectedHeadlineToEdit && (
                            <HeadlineEditModal 
                                isOpen={showHeadlineEditModal}
                                headline={selectedHeadlineToEdit}
                                onClose={() => setShowHeadlineEditModal(false)}
                                onSave={(edited) => {
                                    const current = generatedArticleHistory[currentArticleIterationIndex];
                                    const updatedArticle = { 
                                        ...current, 
                                        title: edited.headline,
                                        headlineApplied: true 
                                    };
                                    setGeneratedArticleHistory(prev => [...prev, updatedArticle]);
                                    setCurrentArticleIterationIndex(prev => prev + 1);
                                    setShowHeadlineEditModal(false);
                                    setGeneratedHeadlinesForArticle(null);
                                }}
                            />
                        )}
                    </>
                )}
                {view === 'article-templates' && (
                    <>
                        <ArticleTemplateLibrary 
                            templates={articleTemplates}
                            onSave={(id, updates) => setArticleTemplates(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))}
                            onDelete={(id) => setArticleTemplates(prev => prev.filter(t => t.id !== id))}
                            onAddNew={() => setArticleTemplates(prev => [{ id: uuidv4(), title: 'New Template', description: '', structure: '', specialInstructions: '', isNew: true }, ...prev])}
                        />
                         <div className="mt-8 pt-8 border-t border-slate-700">
                             <div className="flex justify-between items-center bg-slate-800/50 p-6 rounded-lg border border-slate-700">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-200">Create Template from Article</h3>
                                    <p className="text-gray-400 text-sm mt-1">Paste an existing article to have the AI reverse-engineer it into a reusable template.</p>
                                </div>
                                <button 
                                    onClick={() => setShowCreateArticleTemplateModal(true)}
                                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-md"
                                >
                                    Create from Article
                                </button>
                             </div>
                        </div>
                        {showCreateArticleTemplateModal && (
                            <CreateArticleTemplateModal 
                                onClose={() => setShowCreateArticleTemplateModal(false)}
                                isLoading={isCreatingArticleTemplate}
                                error={createTemplateError}
                                onCreateTemplate={async (text) => {
                                    setIsCreatingArticleTemplate(true);
                                    setCreateTemplateError(null);
                                    try {
                                        const newTemplate = await createArticleTemplateFromText({ articleText: text, existingTemplates: articleTemplates });
                                        setArticleTemplates(prev => [{...newTemplate, id: uuidv4(), isNew: false}, ...prev]);
                                        return true;
                                    } catch (e: any) { setCreateTemplateError(e.message); return false; } finally { setIsCreatingArticleTemplate(false); }
                                }}
                            />
                        )}
                    </>
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
                                const article = await recycleArticle({
                                    script: recycleArticleScript,
                                    existingArticleText: recycleArticleText,
                                    styleReferences: thisIsHowIWriteArticles,
                                    userRole, targetAudience,
                                    endOfArticleSummary,
                                    evalCriteria: DEFAULT_ARTICLE_EVAL_CRITERIA
                                });
                                setGeneratedArticleHistory([{ ...article, type: 'initial', headlineApplied: false }]);
                                setCurrentArticleIterationIndex(0);
                                setView('refine-article');
                            } catch (e) { console.error(e); alert("Recycling failed."); } finally { setIsRecyclingArticle(false); }
                        }}
                    />
                )}

                {view === 'audio-script' && (
                    <AudioScriptGeneratorPanel 
                        sourceText={audioScriptSourceText}
                        onSourceTextChange={setAudioScriptSourceText}
                        duration={audioScriptDuration}
                        onDurationChange={setAudioScriptDuration}
                        script={generateAudioScriptScript}
                        onScriptChange={setGenerateAudioScriptScript}
                        isLoading={isGeneratingAudioScript}
                        result={generatedAudioScript}
                        onGenerate={async () => {
                            setIsGeneratingAudioScript(true);
                            try {
                                const script = await generateAudioScript({
                                    sourceText: audioScriptSourceText,
                                    duration: audioScriptDuration,
                                    wordCount: audioScriptDuration * 150,
                                    script: generateAudioScriptScript,
                                    userRole, targetAudience
                                });
                                setGeneratedAudioScript(script);
                                const scriptWithMeta = { ...script, id: uuidv4(), dateCreated: new Date().toISOString() };
                                setArchivedAudioScripts(prev => [scriptWithMeta, ...prev]);
                            } catch (e) { console.error(e); alert("Script generation failed."); } finally { setIsGeneratingAudioScript(false); }
                        }}
                    />
                )}
                {view === 'audio-script-archive' && (
                    <ArchivePanel 
                        title="Audio Script Archive" 
                        type="audio" 
                        items={archivedAudioScripts} 
                    />
                )}
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
                            setGeneratedPodcastIdeas(null);
                            setGeneratedAdjacentPodcastIdeas(null);
                            setGeneratedPodcastPlan(null);
                            setSelectedInitialPodcastIdea(null);
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
                            setGeneratedAdjacentPodcastIdeas(null);
                            setGeneratedPodcastPlan(null);
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
                            setGeneratedPodcastPlan(null);
                            setIsGeneratingPodcastPlan(true);
                            try {
                                const plan = await generatePodcastPlan({ idea, userRole, script: generatePodcastPlanScript });
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
                        onClearPlan={() => setGeneratedPodcastPlan(null)}
                     />
                )}
                {view === 'podcast-plan-archive' && (
                    <ArchivePanel 
                        title="Podcast Plan Archive" 
                        type="podcast" 
                        items={archivedPodcastPlans} 
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
                            userEmail, userRole, targetAudience, referenceWorldContent, thisIsHowIWriteArticles,
                            articleUrl, articleText, postSourceType, standardStarterText, standardSummaryText, generationScript,
                            savedTemplates: postsTemplates, savedArticleTemplates: articleTemplates, ayrshareQueue, scheduledPosts,
                            historicalPosts, schedulingInstructions, parsedSchedule, ayrshareLog: [], settings, adminSettings,
                            researchScript, researchedPosts, generatedArticleIdeas, generateArticleIdeasScript, generateArticleWordCount,
                            generateArticleSourceType, generateArticleSourceUrl, generateArticleSourceText, generateArticleScript,
                            recycleArticleText, recycleArticleScript, generatedArticleHistory, currentArticleIterationIndex,
                            generateArticleTitle, articleStarterText, endOfArticleSummary, generateHeadlinesForArticleScript,
                            generateArticleDestination, generatedPodcastIdeas, selectedInitialPodcastIdea, generatedAdjacentPodcastIdeas,
                            generatePodcastIdeasScript, generatedPodcastPlan, podcastSourceUrl, podcastSourceText, podcastSourceType, archivedPodcastPlans,
                            audioScriptSourceText, audioScriptDuration, generateAudioScriptScript, generatedAudioScript, archivedAudioScripts,
                            checklistItems
                        }}
                        userEmail={userEmail}
                        onRestore={(data) => {
                            // Explicitly save to localStorage to ensure persistence before reload
                            localStorage.setItem('minionData', JSON.stringify(data));
                            alert("Restore complete! The application will now reload to reflect your changes.");
                            window.location.reload();
                        }}
                    />
                )}
                {view === 'admin' && (
                    <AdminPanel 
                        settings={adminSettings}
                        onSettingsChange={setAdminSettings}
                        checklistItems={checklistItems}
                        onChecklistChange={setChecklistItems}
                    />
                )}

            </div>
        </main>
    </div>
  );
};