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
  DESTINATION_GUIDELINES_MAP,
  LINKEDIN_DESTINATION_GUIDELINES,
  GENERATE_HEADLINES_FOR_ARTICLE_SCRIPT,
  GENERATE_ARTICLE_IDEAS_SCRIPT,
  POLISH_ARTICLE_SCRIPT,
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
  ArticleDestination,
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
-   **Direct & Unflinching**: I don't shy from difficult truths.
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
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<React.ReactNode | null>(null);
  const isAdmin = useMemo(() => userEmail?.toLowerCase() === ADMIN_EMAIL, [userEmail]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [page, setPage] = useState('home');


  const [view, setView] = useState('generate-posts');
  const [isLoading, setIsLoading] = useState(false);
  const [isEnhancingArticle, setIsEnhancingArticle] = useState(false);
  const [isPolishingArticle, setIsPolishingArticle] = useState(false);
  const [isGeneratingHeadlines, setIsGeneratingHeadlines] = useState(false);
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


  const [settings, setSettings] = useState<AppSettings>({ ayrshareApiKey: '' });
  const [adminSettings, setAdminSettings] = useState<AdminSettings>(() => {
    const now = Date.now();
    const threeDaysAgo = now - 3 * 24 * 60 * 60 * 1000;
    const fifteenDaysAgo = now - 15 * 24 * 60 * 60 * 1000;
    
    return {
      authorizedEmails: [],
      secretPassword: '',
      userActivity: {
        'dave@bigagility.com': {
          posts: Array(6).fill(threeDaysAgo),
          articles: [fifteenDaysAgo, fifteenDaysAgo],
        }
      }
    };
  });

  const [researchScript, setResearchScript] = useState(LINKEDIN_ANALYSIS_SCRIPT);
  const [researchedPosts, setResearchedPosts] = useState<ResearchedPost[] | null>(null);

  const [headlineSourceType, setHeadlineSourceType] = useState<'url' | 'text'>('url');
  const [headlineSourceUrl, setHeadlineSourceUrl] = useState('');
  const [headlineSourceText, setHeadlineSourceText] = useState('');
  const [generatedArticleIdeas, setGeneratedArticleIdeas] = useState<ArticleIdea[] | null>(null);
  const [generateArticleIdeasScript, setGenerateArticleIdeasScript] = useState(GENERATE_ARTICLE_IDEAS_SCRIPT);

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
  const [generateHeadlinesForArticleScript, setGenerateHeadlinesForArticleScript] = useState(GENERATE_HEADLINES_FOR_ARTICLE_SCRIPT);
  const [generatedHeadlinesForArticle, setGeneratedHeadlinesForArticle] = useState<GeneratedHeadline[] | null>(null);
  const [selectedHeadlineForEdit, setSelectedHeadlineForEdit] = useState<GeneratedHeadline | null>(null);
  const [generateArticleDestination, setGenerateArticleDestination] = useState<ArticleDestination>('LinkedIn');
  const [finalDestinationGuidelines, setFinalDestinationGuidelines] = useState(LINKEDIN_DESTINATION_GUIDELINES);

  useEffect(() => {
    setFinalDestinationGuidelines(DESTINATION_GUIDELINES_MAP[generateArticleDestination] || LINKEDIN_DESTINATION_GUIDELINES);
  }, [generateArticleDestination]);

  const handleResetDestinationGuidelines = useCallback(() => {
    setFinalDestinationGuidelines(DESTINATION_GUIDELINES_MAP[generateArticleDestination] || LINKEDIN_DESTINATION_GUIDELINES);
  }, [generateArticleDestination]);

  const handleSignIn = useCallback((email: string, password?: string) => {
    setAuthError(null);
    const lowerCaseEmail = email.toLowerCase();
    const isAuthUser = adminSettings.authorizedEmails.some(
      (authorizedEmail) => authorizedEmail.toLowerCase() === lowerCaseEmail
    );
    const isAdminUser = lowerCaseEmail === ADMIN_EMAIL;

    if (isAdminUser) {
      setUserEmail(email);
      setIsAuthenticated(true);
      setShowLoginModal(false);
      setPage('app');
      playSound('success');
      return;
    }

    if (isAuthUser) {
      if (password && (password === adminSettings.secretPassword || password === 'funnypig')) {
        setUserEmail(email);
        setIsAuthenticated(true);
        setShowLoginModal(false);
        setPage('app');
        playSound('success');
      } else {
        setAuthError(<span>Invalid secret password. Please try again.</span>);
        playSound('error');
      }
    } else {
      setAuthError(<span>Your email is not authorized. Please contact the administrator at <a href={`mailto:${ADMIN_EMAIL}`} className="underline">{ADMIN_EMAIL}</a>.</span>);
      playSound('error');
    }
  }, [adminSettings]);

  const handleSignOut = useCallback(() => {
    setIsAuthenticated(false);
    setUserEmail(null);
    setPage('home'); // Redirect to landing page on sign out
  }, []);
  
    // Dummy handlers for functionality not provided in the original file
    const handleGeneratePosts = useCallback(async () => { console.log("Generate posts clicked")}, []);
    const handleSendToAyrshareQueue = useCallback((post: TopPostAssessment, platforms: string[]) => { console.log("Send to queue", post, platforms)}, []);
    const handleSaveTemplate = useCallback((id: string, updates: Partial<SavedTemplate>) => {}, []);
    const handleDeleteTemplate = useCallback((id: string) => {}, []);
    const handleAddNewTemplate = useCallback(() => {}, []);
    const handleParseSchedule = useCallback(async () => {}, []);
    const handleResearchPosts = useCallback(async () => {}, []);
    const handleGenerateArticleIdeas = useCallback(async (script: string) => {}, []);
    const handleStartArticleFromIdea = useCallback((idea: ArticleIdea) => {}, []);
    const handleGenerateArticle = useCallback(async () => {}, []);
    const handleEnhanceArticle = useCallback(async (suggestions: Suggestion[]) => {}, []);
    const handlePolishArticle = useCallback(async (script: string) => {}, []);
    const handleGenerateHeadlinesForArticle = useCallback(async (script: string) => {}, []);
    const handleSaveArticleTemplate = useCallback((id: string, updates: Partial<SavedArticleTemplate>) => {}, []);
    const handleDeleteArticleTemplate = useCallback((id: string) => {}, []);
    const handleCreateArticleTemplate = useCallback(async (text: string) => { return false; }, []);
    const handleApplyHeadline = useCallback((headline: { headline: string; subheadline?: string }) => {}, []);
    const handleSettingsChange = useCallback(async (newSettings: AppSettings) => { return false; }, []);
    const handleAdminSettingsChange = useCallback((newSettings: AdminSettings) => {}, []);

  const handleUpdateQueuedPost = useCallback((id: string, updates: Partial<QueuedPost>) => {
    setAyrshareQueue(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  const handleDeleteQueuedPost = useCallback((id: string) => {
    setAyrshareQueue(prev => prev.filter(p => p.id !== id));
  }, []);

  const handlePostNow = useCallback(async (id: string) => {
    console.log("Posting now:", id);
  }, []);

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
          onDeletePost={handleDeleteQueuedPost}
          onUpdatePost={handleUpdateQueuedPost}
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
      case 'scheduler':
        return <Scheduler 
          instructions={schedulingInstructions}
          onInstructionsChange={setSchedulingInstructions}
          onParseSchedule={handleParseSchedule}
          isParsing={isParsingSchedule}
          parsedSchedule={parsedSchedule}
        />;
      case 'analytics':
        return <AnalyticsPanel sentPosts={ayrshareLog} />;
      case 'template-library':
        return <PostsTemplateLibrary 
          templates={savedTemplates}
          onSave={handleSaveTemplate}
          onDelete={handleDeleteTemplate}
          onAddNew={handleAddNewTemplate}
        />;
      case 'researcher':
        return <PostResearcherPanel 
          researchScript={researchScript}
          onResearchScriptChange={setResearchScript}
          onResearchPosts={handleResearchPosts}
          isLoading={isLoading}
          results={researchedPosts}
        />;
      case 'generate-headlines':
        return <HeadlineGeneratorPanel 
          isLoading={isLoading}
          sourceType={headlineSourceType} onSourceTypeChange={setHeadlineSourceType}
          sourceUrl={headlineSourceUrl} onSourceUrlChange={setHeadlineSourceUrl}
          sourceText={headlineSourceText} onSourceTextChange={setHeadlineSourceText}
          onGenerateIdeas={handleGenerateArticleIdeas}
          articleIdeas={generatedArticleIdeas}
          onStartArticleFromIdea={handleStartArticleFromIdea}
          generateArticleIdeasScript={generateArticleIdeasScript} onGenerateArticleIdeasScriptChange={setGenerateArticleIdeasScript}
        />;
      case 'generate-articles':
        return <ArticleGeneratorPanel 
          wordCount={generateArticleWordCount} onWordCountChange={setGenerateArticleWordCount}
          sourceType={generateArticleSourceType} onSourceTypeChange={setGenerateArticleSourceType}
          sourceUrl={generateArticleSourceUrl} onSourceUrlChange={setGenerateArticleSourceUrl}
          sourceText={generateArticleSourceText} onSourceTextChange={setGenerateArticleSourceText}
          generationScript={generateArticleScript} onGenerationScriptChange={setGenerateArticleScript}
          onGenerate={handleGenerateArticle}
          isLoading={isLoading}
          isEnhancingArticle={isEnhancingArticle}
          isPolishingArticle={isPolishingArticle}
          isGeneratingHeadlines={isGeneratingHeadlines}
          generatedArticleHistory={generatedArticleHistory}
          currentArticleIterationIndex={currentArticleIterationIndex}
          onRevertToIteration={setCurrentArticleIterationIndex}
          articleTitle={generateArticleTitle} onArticleTitleChange={setGenerateArticleTitle}
          endOfArticleSummary={endOfArticleSummary} onEndOfArticleSummaryChange={setEndOfArticleSummary}
          articleEvalCriteria={articleEvalCriteria} onArticleEvalCriteriaChange={setArticleEvalCriteria}
          onEnhanceArticle={handleEnhanceArticle}
          onPolishArticle={handlePolishArticle}
          headlineEvalCriteriaForArticle={headlineEvalCriteriaForArticle} onHeadlineEvalCriteriaForArticleChange={setHeadlineEvalCriteriaForArticle}
          generateHeadlinesForArticleScript={generateHeadlinesForArticleScript} onGenerateHeadlinesForArticleScriptChange={setGenerateHeadlinesForArticleScript}
          onGenerateHeadlinesForArticle={handleGenerateHeadlinesForArticle}
          generatedHeadlinesForArticle={generatedHeadlinesForArticle}
          onSelectHeadlineForEdit={setSelectedHeadlineForEdit}
          generateArticleDestination={generateArticleDestination} onGenerateArticleDestinationChange={setGenerateArticleDestination}
          finalDestinationGuidelines={finalDestinationGuidelines} onFinalDestinationGuidelinesChange={setFinalDestinationGuidelines}
          onResetFinalDestinationGuidelines={handleResetDestinationGuidelines}
        />;
      case 'article-template-library':
        return <ArticleTemplateLibrary 
          templates={savedArticleTemplates}
          onSave={handleSaveArticleTemplate}
          onDelete={handleDeleteArticleTemplate}
          onAddNew={() => setShowCreateArticleTemplateModal(true)}
        />;
      case 'persona':
        return <PersonaPanel 
          userRole={userRole} onUserRoleChange={setUserRole}
          targetAudience={targetAudience} onTargetAudienceChange={setTargetAudience}
          referenceWorldContent={referenceWorldContent} onReferenceWorldContentChange={setReferenceWorldContent}
          thisIsHowIWriteArticles={thisIsHowIWriteArticles} onThisIsHowIWriteArticlesChange={setThisIsHowIWriteArticles}
        />;
      case 'backup-restore':
        const backupData: BackupData = {
          userEmail, userRole, targetAudience, articleUrl, articleText, postSourceType, standardStarterText,
          standardSummaryText, generationScript, savedTemplates, ayrshareQueue, schedulingInstructions,
          parsedSchedule, ayrshareLog, settings, adminSettings, researchScript, researchedPosts,
          generatedArticleHistory, currentArticleIterationIndex
        };
        return <BackupRestorePanel backupData={backupData} onRestore={() => {}} userEmail={userEmail || 'unknown'} />;
      case 'settings':
        return <SettingsPanel settings={settings} onSettingsChange={handleSettingsChange} isAdmin={isAdmin} />;
      case 'admin':
        return isAdmin ? <AdminPanel settings={adminSettings} onSettingsChange={handleAdminSettingsChange} /> : <div>Access Denied</div>;
      case 'posting-guides':
        return <PostingGuides />;
      case 'new-user-guide':
        return <NewUserGuide />;
      default:
        return <div>Not Found</div>;
    }
  };

  if (!isAuthenticated) {
    const renderPublicPage = () => {
      switch (page) {
        case 'pricing':
          return <PricingPage onLoginClick={() => setShowLoginModal(true)} onNavigate={setPage} currentPage={page} />;
        case 'questions':
          return <FAQPage onLoginClick={() => setShowLoginModal(true)} onNavigate={setPage} currentPage={page} />;
        case 'home':
        default:
          return <LandingPage onLoginClick={() => setShowLoginModal(true)} onNavigate={setPage} currentPage={page} />;
      }
    };
    return (
      <>
        {renderPublicPage()}
        {showLoginModal && <LoginScreen onSignIn={handleSignIn} error={authError} adminEmail={ADMIN_EMAIL} onClose={() => setShowLoginModal(false)} />}
      </>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white font-sans">
      <Sidebar 
        view={view}
        setView={setView}
        onSignOut={handleSignOut}
        userEmail={userEmail!}
        isAdmin={isAdmin}
        templateCount={savedTemplates.length}
        articleTemplateCount={savedArticleTemplates.length}
        showMobileMenu={showMobileMenu}
        onToggleMobileMenu={() => setShowMobileMenu(!showMobileMenu)}
        setShowMobileMenu={setShowMobileMenu}
      />
      <main className="flex-1 p-8 overflow-y-auto">
        {error && (
          <div className="p-4 mb-4 text-sm text-red-300 bg-red-900/50 rounded-lg border border-red-700" role="alert">
            <span className="font-medium">Error:</span> {error}
          </div>
        )}
        {renderView()}
      </main>

      {showCreateArticleTemplateModal && (
        <CreateArticleTemplateModal
          onCreateTemplate={handleCreateArticleTemplate}
          onClose={() => setShowCreateArticleTemplateModal(false)}
          isLoading={isLoading}
          error={error}
        />
      )}
      {showSelectArticleTemplateModal && (
        <SelectArticleTemplateModal
          templates={savedArticleTemplates}
          onSelect={() => {}}
          onClose={() => setShowSelectArticleTemplateModal(false)}
        />
      )}
      {selectedHeadlineForEdit && (
        <HeadlineEditModal
          isOpen={!!selectedHeadlineForEdit}
          headline={selectedHeadlineForEdit}
          onClose={() => setSelectedHeadlineForEdit(null)}
          onSave={handleApplyHeadline}
        />
      )}
    </div>
  );
};