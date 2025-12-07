
import React, { useState, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Components
import Sidebar from './components/Sidebar.tsx';
import LandingPage from './components/LandingPage.tsx';
import LoginScreen from './components/LoginScreen.tsx';
import FAQPage from './components/FAQPage.tsx';
import PricingPage from './components/PricingPage.tsx';
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
import GeneratePodcastPanel from './components/GeneratePodcastPanel.tsx';
import ArchivePanel from './components/ArchivePanel.tsx';
import PersonaPanel from './components/PersonaPanel.tsx';
import SettingsPanel from './components/SettingsPanel.tsx';
import BackupRestorePanel from './components/BackupRestorePanel.tsx';
import AdminPanel from './components/AdminPanel.tsx';
import AnalyticsPanel from './components/AnalyticsPanel.tsx';
import ChecklistGuide from './components/ChecklistGuide.tsx';
import NewUserGuide from './components/NewUserGuide.tsx';
import PostingGuides from './components/PostingGuides.tsx';
import CreateArticleTemplateModal from './components/CreateArticleTemplateModal.tsx';
import SelectArticleTemplateModal from './components/SelectArticleTemplateModal.tsx';
import HeadlineEditModal from './components/HeadlineEditModal.tsx';
import PodcastTitleModal from './components/PodcastTitleModal.tsx';
import QuickPostPanel from './components/QuickPostPanel.tsx';
import QuickArticlePanel from './components/QuickArticlePanel.tsx';
import BiblicalCheckPanel from './components/BiblicalCheckPanel.tsx';
import NicheFinderPanel from './components/NicheFinderPanel.tsx';

// Services
import { 
  generateAndEvaluatePosts, researchPopularPosts, parseSchedule, generateArticleIdeas, 
  generateArticle, enhanceArticle, polishArticle, createArticleTemplateFromText, 
  generateHeadlinesForArticle, recycleArticle, generatePodcastIdeas, 
  generateAdjacentPodcastIdeas, generatePodcastPlan, generateAudioScript,
  generatePodcastTitleSuggestions
} from './services/geminiService.ts';
import { postToAyrshare } from './services/ayrshareService.ts';
import { initialTemplates } from './services/templateData.ts';
import { initialArticleTemplates } from './services/articleTemplateData.ts';
import { 
  LINKEDIN_GENERATION_EVALUATION_SCRIPT,
  GENERATE_ARTICLE_SCRIPT,
  GENERATE_ARTICLE_IDEAS_SCRIPT,
  GENERATE_HEADLINES_FOR_ARTICLE_SCRIPT,
  RECYCLE_ARTICLE_SCRIPT,
  GENERATE_PODCAST_IDEAS_SCRIPT,
  GENERATE_ADJACENT_PODCAST_IDEAS_SCRIPT,
  GENERATE_PODCAST_PLAN_SCRIPT,
  GENERATE_AUDIO_SCRIPT_SCRIPT,
  LINKEDIN_ANALYSIS_SCRIPT,
  DESTINATION_GUIDELINES_MAP,
  DEFAULT_ARTICLE_EVAL_CRITERIA
} from './services/scriptService.ts';

// Types
import { 
  SavedTemplate, SavedArticleTemplate, QueuedPost, SentPost, AppSettings, AdminSettings, 
  BackupData, ArticleIdea, GeneratedArticle, GeneratedHeadline, Suggestion, PodcastIdea, 
  PodcastPlan, GeneratedAudioScript, ChecklistItem, ArticleDestination,
  UserActivity, AuthorizedUser
} from './types.ts';

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { id: '1', text: 'Define Persona & Professional Role', isCompleted: false },
  { id: '2', text: 'Fill out "Reference World" knowledge base', isCompleted: false },
  { id: '3', text: 'Review and customize Post Templates', isCompleted: false },
  { id: '4', text: 'Connect Ayrshare API Key', isCompleted: false },
];

const DEFAULT_ADMIN_SETTINGS: AdminSettings = {
  authorizedUsers: [],
  secretPassword: 'password123',
  userActivity: {}
};

export const App: React.FC = () => {
    // --- THEME ---
    const [theme, setTheme] = useState<'dark' | 'light'>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') === 'light' ? 'light' : 'dark';
        }
        return 'dark';
    });

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

    // --- AUTH ---
    const [view, setView] = useState('landing');
    const [currentUser, setCurrentUser] = useState<string | null>(null);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);

    // --- DATA STATE ---
    // Persona
    const [personaName, setPersonaName] = useState('');
    const [userRole, setUserRole] = useState('');
    const [targetAudience, setTargetAudience] = useState('');
    const [whatIWriteAbout, setWhatIWriteAbout] = useState('');
    const [referenceWorldContent, setReferenceWorldContent] = useState('');
    const [thisIsHowIWriteArticles, setThisIsHowIWriteArticles] = useState('');

    // Posts
    const [articleUrl, setArticleUrl] = useState('');
    const [articleText, setArticleText] = useState('');
    const [postSourceType, setPostSourceType] = useState<'url' | 'text'>('url');
    const [standardStarterText, setStandardStarterText] = useState('');
    const [standardSummaryText, setStandardSummaryText] = useState('');
    const [generationScript, setGenerationScript] = useState(LINKEDIN_GENERATION_EVALUATION_SCRIPT);
    const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>(initialTemplates);
    const [generationResults, setGenerationResults] = useState<any>(null); // Type strictly in real app
    const [researchScript, setResearchScript] = useState(LINKEDIN_ANALYSIS_SCRIPT);
    const [researchedPosts, setResearchedPosts] = useState<any[] | null>(null);

    // Queue
    const [ayrshareQueue, setAyrshareQueue] = useState<QueuedPost[]>([]);
    const [parsedSchedule, setParsedSchedule] = useState<string[]>([]);
    const [schedulingInstructions, setSchedulingInstructions] = useState('');
    const [ayrshareLog, setAyrshareLog] = useState<SentPost[]>([]);

    // Articles
    const [headlineSourceType, setHeadlineSourceType] = useState<'url' | 'text'>('url');
    const [headlineSourceUrl, setHeadlineSourceUrl] = useState('');
    const [headlineSourceText, setHeadlineSourceText] = useState('');
    const [generatedArticleIdeas, setGeneratedArticleIdeas] = useState<ArticleIdea[] | null>(null);
    const [generateArticleIdeasScript, setGenerateArticleIdeasScript] = useState(GENERATE_ARTICLE_IDEAS_SCRIPT);
    
    const [generateArticleWordCount, setGenerateArticleWordCount] = useState(1500);
    const [generateArticleSourceType, setGenerateArticleSourceType] = useState<'url' | 'text'>('url');
    const [generateArticleSourceUrl, setGenerateArticleSourceUrl] = useState('');
    const [generateArticleSourceText, setGenerateArticleSourceText] = useState('');
    const [generateArticleStyleRefs, setGenerateArticleStyleRefs] = useState('');
    const [generateArticleTitle, setGenerateArticleTitle] = useState('');
    const [generateArticleStarterText, setGenerateArticleStarterText] = useState('');
    const [generateArticleEndOfSummary, setGenerateArticleEndOfSummary] = useState('');
    const [generateArticleScript, setGenerateArticleScript] = useState(GENERATE_ARTICLE_SCRIPT);
    const [generateArticleDestination, setGenerateArticleDestination] = useState<ArticleDestination>('LinkedIn');
    
    const [generatedArticleHistory, setGeneratedArticleHistory] = useState<GeneratedArticle[]>([]);
    const [currentArticleIterationIndex, setCurrentArticleIterationIndex] = useState(0);
    const [savedArticleTemplates, setSavedArticleTemplates] = useState<SavedArticleTemplate[]>(initialArticleTemplates);
    const [generatedHeadlinesForArticle, setGeneratedHeadlinesForArticle] = useState<GeneratedHeadline[] | null>(null);
    const [generateHeadlinesForArticleScript, setGenerateHeadlinesForArticleScript] = useState(GENERATE_HEADLINES_FOR_ARTICLE_SCRIPT);

    const [recycleArticleText, setRecycleArticleText] = useState('');
    const [recycleArticleScript, setRecycleArticleScript] = useState(RECYCLE_ARTICLE_SCRIPT);

    // Audio
    const [podcastSourceType, setPodcastSourceType] = useState<'url' | 'text'>('url');
    const [podcastSourceUrl, setPodcastSourceUrl] = useState('');
    const [podcastSourceText, setPodcastSourceText] = useState('');
    const [generatedPodcastIdeas, setGeneratedPodcastIdeas] = useState<PodcastIdea[] | null>(null);
    const [selectedInitialPodcastIdea, setSelectedInitialPodcastIdea] = useState<PodcastIdea | null>(null);
    const [generatedAdjacentPodcastIdeas, setGeneratedAdjacentPodcastIdeas] = useState<PodcastIdea[] | null>(null);
    const [generatedPodcastPlan, setGeneratedPodcastPlan] = useState<PodcastPlan | null>(null);
    const [generatePodcastIdeasScript, setGeneratePodcastIdeasScript] = useState(GENERATE_PODCAST_IDEAS_SCRIPT);
    const [archivedPodcastPlans, setArchivedPodcastPlans] = useState<PodcastPlan[]>([]);
    
    const [audioScriptSourceText, setAudioScriptSourceText] = useState('');
    const [audioScriptDuration, setAudioScriptDuration] = useState(7);
    const [generateAudioScriptScript, setGenerateAudioScriptScript] = useState(GENERATE_AUDIO_SCRIPT_SCRIPT);
    const [generatedAudioScript, setGeneratedAudioScript] = useState<GeneratedAudioScript | null>(null);
    const [archivedAudioScripts, setArchivedAudioScripts] = useState<GeneratedAudioScript[]>([]);

    // Settings
    const [settings, setSettings] = useState<AppSettings>({ ayrshareApiKey: '' });
    const [adminSettings, setAdminSettings] = useState<AdminSettings>(DEFAULT_ADMIN_SETTINGS);
    const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>(DEFAULT_CHECKLIST);

    // UI
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showCreateArticleTemplateModal, setShowCreateArticleTemplateModal] = useState(false);
    const [showSelectArticleTemplateModal, setShowSelectArticleTemplateModal] = useState(false);
    const [selectedTemplateForGeneration, setSelectedTemplateForGeneration] = useState<SavedArticleTemplate | null>(null);
    const [headlineForEdit, setHeadlineForEdit] = useState<GeneratedHeadline | null>(null);
    
    // Derived
    const isAdmin = useMemo(() => {
        if (!currentUser) return false;
        const email = currentUser.toLowerCase();
        return email === 'admin@admin.com' || email === 'dave@bigagility.com';
    }, [currentUser]);

    const currentUserPermissions = useMemo(() => {
        if (!currentUser) return undefined;
        
        // Admins get all permissions automatically
        if (isAdmin) {
             return {
                canViewPosts: true,
                canViewArticles: true,
                canViewAudio: true,
                canViewBiblicalCheck: true,
                canViewNicheFinder: true
            };
        }

        const userObj = adminSettings.authorizedUsers.find(u => u.email.toLowerCase() === currentUser.toLowerCase());
        return userObj ? userObj.permissions : undefined;
    }, [currentUser, adminSettings.authorizedUsers, isAdmin]);

    // Data for backup
    const currentBackupData: BackupData = useMemo(() => ({
        userEmail: currentUser,
        userRole, personaName, targetAudience, whatIWriteAbout, referenceWorldContent, thisIsHowIWriteArticles,
        articleUrl, articleText, postSourceType, standardStarterText, standardSummaryText, generationScript,
        savedTemplates, savedArticleTemplates, ayrshareQueue, parsedSchedule, schedulingInstructions, ayrshareLog,
        settings, adminSettings, checklistItems,
        researchScript, researchedPosts,
        headlineSourceType, headlineSourceUrl, headlineSourceText, generatedArticleIdeas, generateArticleIdeasScript,
        generateArticleWordCount, generateArticleSourceType, generateArticleSourceUrl, generateArticleSourceText,
        generateArticleStyleRefs, generateArticleTitle, articleStarterText: generateArticleStarterText, 
        endOfArticleSummary: generateArticleEndOfSummary, generateArticleScript, generateArticleDestination,
        generatedArticleHistory, currentArticleIterationIndex, generatedHeadlines: generatedHeadlinesForArticle,
        generateHeadlinesForArticleScript, recycleArticleText, recycleArticleScript,
        podcastSourceType, podcastSourceUrl, podcastSourceText, generatedPodcastIdeas, selectedInitialPodcastIdea,
        generatedAdjacentPodcastIdeas, generatedPodcastPlan, generatePodcastIdeasScript, archivedPodcastPlans,
        audioScriptSourceText, audioScriptDuration, generateAudioScriptScript, generatedAudioScript, archivedAudioScripts
    }), [
        currentUser, userRole, personaName, targetAudience, whatIWriteAbout, referenceWorldContent, thisIsHowIWriteArticles,
        articleUrl, articleText, postSourceType, standardStarterText, standardSummaryText, generationScript,
        savedTemplates, savedArticleTemplates, ayrshareQueue, parsedSchedule, schedulingInstructions, ayrshareLog,
        settings, adminSettings, checklistItems,
        researchScript, researchedPosts,
        headlineSourceType, headlineSourceUrl, headlineSourceText, generatedArticleIdeas, generateArticleIdeasScript,
        generateArticleWordCount, generateArticleSourceType, generateArticleSourceUrl, generateArticleSourceText,
        generateArticleStyleRefs, generateArticleTitle, generateArticleStarterText, 
        generateArticleEndOfSummary, generateArticleScript, generateArticleDestination,
        generatedArticleHistory, currentArticleIterationIndex, generatedHeadlinesForArticle,
        generateHeadlinesForArticleScript, recycleArticleText, recycleArticleScript,
        podcastSourceType, podcastSourceUrl, podcastSourceText, generatedPodcastIdeas, selectedInitialPodcastIdea,
        generatedAdjacentPodcastIdeas, generatedPodcastPlan, generatePodcastIdeasScript, archivedPodcastPlans,
        audioScriptSourceText, audioScriptDuration, generateAudioScriptScript, generatedAudioScript, archivedAudioScripts
    ]);

    const handleRestore = (data: BackupData) => {
        if (data.personaName) setPersonaName(data.personaName);
        if (data.userRole) setUserRole(data.userRole);
        if (data.targetAudience) setTargetAudience(data.targetAudience);
        if (data.whatIWriteAbout) setWhatIWriteAbout(data.whatIWriteAbout);
        if (data.referenceWorldContent) setReferenceWorldContent(data.referenceWorldContent);
        if (data.thisIsHowIWriteArticles) setThisIsHowIWriteArticles(data.thisIsHowIWriteArticles);
        if (data.savedTemplates) setSavedTemplates(data.savedTemplates);
        if (data.savedArticleTemplates) setSavedArticleTemplates(data.savedArticleTemplates);
        if (data.ayrshareQueue) setAyrshareQueue(data.ayrshareQueue);
        if (data.settings) setSettings(data.settings);
        if (data.adminSettings) setAdminSettings(data.adminSettings);
        if (data.checklistItems) setChecklistItems(data.checklistItems);
        if (data.archivedAudioScripts) setArchivedAudioScripts(data.archivedAudioScripts);
        if (data.archivedPodcastPlans) setArchivedPodcastPlans(data.archivedPodcastPlans);
        // Restore other fields as needed
        if (data.articleUrl) setArticleUrl(data.articleUrl);
        if (data.articleText) setArticleText(data.articleText);
        if (data.standardStarterText) setStandardStarterText(data.standardStarterText);
        if (data.standardSummaryText) setStandardSummaryText(data.standardSummaryText);
    };

    // Persistence
    useEffect(() => {
        if (currentUser) {
            const key = `minion_data_${currentUser}`;
            const savedData = localStorage.getItem(key);
            if (savedData) {
                try {
                    const parsed: BackupData = JSON.parse(savedData);
                    handleRestore(parsed);
                } catch (e) {
                    console.error("Failed to load data", e);
                }
            }
        }
    }, [currentUser]);

    useEffect(() => {
        if (currentUser) {
            localStorage.setItem(`minion_data_${currentUser}`, JSON.stringify(currentBackupData));
        }
    }, [currentUser, currentBackupData]);

    const handleLogin = (email: string, password?: string) => {
        // Whitelist for password bypass
        if (password === adminSettings.secretPassword || email === 'admin@admin.com' || email === 'dave@bigagility.com') {
             setCurrentUser(email);
             setShowLoginModal(false);
             setView('queue');
             setAuthError(null);
        } else {
            setAuthError('Invalid password.');
        }
    };

    const handleSignOut = () => {
        setCurrentUser(null);
        setView('landing');
    };

    // --- HANDLERS ---
    const handleGeneratePosts = async () => {
        setIsLoading(true);
        setError(null);
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
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResearchPosts = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const results = await researchPopularPosts(researchScript);
            setResearchedPosts(results);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateArticleIdeas = async (script: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const ideas = await generateArticleIdeas({
                sourceArticle: headlineSourceType === 'url' ? headlineSourceUrl : headlineSourceText,
                userRole,
                targetAudience,
                script
            });
            setGeneratedArticleIdeas(ideas);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateArticle = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await generateArticle({
                script: generateArticleScript,
                wordCount: generateArticleWordCount,
                styleReferences: thisIsHowIWriteArticles,
                sourceContent: generateArticleSourceType === 'url' ? generateArticleSourceUrl : generateArticleSourceText,
                referenceWorld: referenceWorldContent,
                userRole,
                targetAudience,
                title: generateArticleTitle,
                articleStarterText: generateArticleStarterText,
                endOfArticleSummary: generateArticleEndOfSummary,
                evalCriteria: DEFAULT_ARTICLE_EVAL_CRITERIA,
                selectedTemplate: selectedTemplateForGeneration,
                allTemplates: savedArticleTemplates,
                finalDestination: generateArticleDestination,
                finalDestinationGuidelines: DESTINATION_GUIDELINES_MAP[generateArticleDestination]
            });
            setGeneratedArticleHistory(prev => [result, ...prev]);
            setCurrentArticleIterationIndex(0);
            setView('refine-article');
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEnhanceArticle = async (suggestions: Suggestion[]) => {
        if (!generatedArticleHistory[currentArticleIterationIndex]) return;
        setIsLoading(true);
        setError(null);
        try {
            const result = await enhanceArticle({
                originalTitle: generatedArticleHistory[currentArticleIterationIndex].title,
                originalContent: generatedArticleHistory[currentArticleIterationIndex].content,
                evalCriteria: DEFAULT_ARTICLE_EVAL_CRITERIA,
                suggestions
            });
            setGeneratedArticleHistory(prev => [result, ...prev]);
            setCurrentArticleIterationIndex(0);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePolishArticle = async (polishScript: string) => {
        if (!generatedArticleHistory[currentArticleIterationIndex]) return;
        setIsLoading(true);
        setError(null);
        try {
            const result = await polishArticle({
                originalTitle: generatedArticleHistory[currentArticleIterationIndex].title,
                originalContent: generatedArticleHistory[currentArticleIterationIndex].content,
                evalCriteria: DEFAULT_ARTICLE_EVAL_CRITERIA,
                styleReferences: thisIsHowIWriteArticles,
                polishScript
            });
            const polishedResult = { ...result, type: 'polished' as const };
            setGeneratedArticleHistory(prev => [polishedResult, ...prev]);
            setCurrentArticleIterationIndex(0);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateHeadlines = async (script: string) => {
        if (!generatedArticleHistory[currentArticleIterationIndex]) return;
        setIsLoading(true);
        setError(null);
        try {
            const headlines = await generateHeadlinesForArticle({
                articleContent: generatedArticleHistory[currentArticleIterationIndex].content,
                evalCriteria: DEFAULT_ARTICLE_EVAL_CRITERIA, // Using same criteria helper or separate one
                script
            });
            setGeneratedHeadlinesForArticle(headlines.map(h => ({ ...h, id: uuidv4() })));
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRecycleArticle = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await recycleArticle({
                script: recycleArticleScript,
                existingArticleText: recycleArticleText,
                styleReferences: thisIsHowIWriteArticles,
                userRole,
                targetAudience,
                endOfArticleSummary: generateArticleEndOfSummary,
                evalCriteria: DEFAULT_ARTICLE_EVAL_CRITERIA
            });
            setGeneratedArticleHistory(prev => [result, ...prev]);
            setCurrentArticleIterationIndex(0);
            setView('refine-article');
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateAudioScript = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await generateAudioScript({
                sourceText: audioScriptSourceText,
                duration: audioScriptDuration,
                wordCount: audioScriptDuration * 150, // approx
                script: generateAudioScriptScript,
                userRole,
                targetAudience
            });
            setGeneratedAudioScript(result);
            setArchivedAudioScripts(prev => [{...result, id: uuidv4(), dateCreated: new Date().toISOString()}, ...prev]);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGeneratePodcastIdeas = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const ideas = await generatePodcastIdeas({
                sourceArticle: podcastSourceType === 'url' ? podcastSourceUrl : podcastSourceText,
                userRole,
                targetAudience,
                script: generatePodcastIdeasScript
            });
            setGeneratedPodcastIdeas(ideas);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateAdjacentPodcastIdeas = async (idea: PodcastIdea) => {
        setIsLoading(true);
        setError(null);
        setSelectedInitialPodcastIdea(idea);
        try {
            const ideas = await generateAdjacentPodcastIdeas({
                initialIdea: idea,
                userRole,
                targetAudience,
                script: GENERATE_ADJACENT_PODCAST_IDEAS_SCRIPT
            });
            setGeneratedAdjacentPodcastIdeas(ideas);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGeneratePodcastPlan = async (idea: PodcastIdea) => {
        setIsLoading(true);
        setError(null);
        try {
            const plan = await generatePodcastPlan({
                idea,
                userRole,
                script: GENERATE_PODCAST_PLAN_SCRIPT
            });
            setGeneratedPodcastPlan(plan);
            setArchivedPodcastPlans(prev => [{...plan, id: uuidv4(), dateCreated: new Date().toISOString()}, ...prev]);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateArticleTemplate = async (text: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const template = await createArticleTemplateFromText({
                articleText: text,
                existingTemplates: savedArticleTemplates
            });
            setSavedArticleTemplates(prev => [{ ...template, id: uuidv4(), isNew: true }, ...prev]);
            return true;
        } catch (e: any) {
            setError(e.message);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const renderContent = () => {
        switch (view) {
            case 'landing':
            case 'home':
                return <LandingPage onLoginClick={() => setShowLoginModal(true)} onNavigate={setView} currentPage={view} theme={theme} toggleTheme={toggleTheme} />;
            case 'pricing':
                return <PricingPage onLoginClick={() => setShowLoginModal(true)} onNavigate={setView} currentPage={view} theme={theme} toggleTheme={toggleTheme} />;
            case 'questions':
                return <FAQPage onLoginClick={() => setShowLoginModal(true)} onNavigate={setView} currentPage={view} theme={theme} toggleTheme={toggleTheme} />;
            case 'generation':
                return <GenerationPanel 
                    articleUrl={articleUrl} onArticleUrlChange={setArticleUrl}
                    articleText={articleText} onArticleTextChange={setArticleText}
                    sourceType={postSourceType} onSourceTypeChange={setPostSourceType}
                    standardStarterText={standardStarterText} onStandardStarterTextChange={setStandardStarterText}
                    standardSummaryText={standardSummaryText} onStandardSummaryTextChange={setStandardSummaryText}
                    generationScript={generationScript} onGenerationScriptChange={setGenerationScript}
                    onGenerate={handleGeneratePosts} isLoading={isLoading} results={generationResults}
                    onSendToAyrshareQueue={(post, platforms) => {
                        const newPost: QueuedPost = { ...post, id: uuidv4(), platforms, status: 'scheduled', score: post.score };
                        setAyrshareQueue(prev => [...prev, newPost]);
                    }}
                />;
            case 'queue':
                return <QueuedPostsDisplay 
                    queuedPosts={ayrshareQueue} 
                    onDeletePost={(id) => setAyrshareQueue(prev => prev.filter(p => p.id !== id))}
                    onUpdatePost={(id, updates) => setAyrshareQueue(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))}
                />;
            case 'scheduler':
                return <Scheduler 
                    instructions={schedulingInstructions} onInstructionsChange={setSchedulingInstructions}
                    onUpdateSchedule={() => { /* stub */ }} isUpdating={isLoading}
                    parsedSchedule={parsedSchedule} queueCount={ayrshareQueue.length}
                    scheduledPosts={ayrshareQueue.filter(p => p.status === 'scheduled')}
                    historicalPosts={ayrshareLog}
                    onSendToAyrshare={() => { /* stub */ }} isSendingToAyrshare={isLoading}
                    error={error}
                />;
            case 'templates':
                return <PostsTemplateLibrary 
                    templates={savedTemplates} 
                    onSave={(id, updates) => setSavedTemplates(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))}
                    onDelete={(id) => setSavedTemplates(prev => prev.filter(t => t.id !== id))}
                    onAddNew={() => setSavedTemplates(prev => [{ id: uuidv4(), title: 'New Template', template: '', example: '', instructions: '', dateAdded: new Date().toLocaleDateString(), usageCount: 0, lastUsed: 'Never', isNew: true }, ...prev])}
                />;
            case 'researcher':
                return <PostResearcherPanel 
                    researchScript={researchScript} 
                    onResearchScriptChange={setResearchScript} 
                    onResearchPosts={handleResearchPosts} 
                    isLoading={isLoading} 
                    results={researchedPosts} 
                />;
            case 'headline-generator':
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
                    onStartArticleFromIdea={(idea) => {
                        setGenerateArticleTitle(idea.title);
                        setGenerateArticleSourceType('text');
                        setGenerateArticleSourceText(`Title: ${idea.title}\nSummary: ${idea.summary}\nKey Points:\n${idea.keyPoints.join('\n- ')}`);
                        setView('generate-articles-panel');
                    }}
                    generateArticleIdeasScript={generateArticleIdeasScript}
                    onGenerateArticleIdeasScriptChange={setGenerateArticleIdeasScript}
                />;
            case 'generate-articles-panel':
                return <ArticleGeneratorPanel 
                    wordCount={generateArticleWordCount}
                    onWordCountChange={setGenerateArticleWordCount}
                    sourceType={generateArticleSourceType}
                    onSourceTypeChange={setGenerateArticleSourceType}
                    sourceUrl={generateArticleSourceUrl}
                    onSourceUrlChange={setGenerateArticleSourceUrl}
                    sourceText={generateArticleSourceText}
                    onSourceTextChange={setGenerateArticleSourceText}
                    onGenerate={handleGenerateArticle}
                    isLoading={isLoading}
                    articleTitle={generateArticleTitle}
                    onArticleTitleChange={setGenerateArticleTitle}
                    generateArticleDestination={generateArticleDestination}
                    onGenerateArticleDestinationChange={setGenerateArticleDestination}
                    articleStarterText={generateArticleStarterText}
                    onArticleStarterTextChange={setGenerateArticleStarterText}
                    endOfArticleSummary={generateArticleEndOfSummary}
                    onEndOfArticleSummaryChange={setGenerateArticleEndOfSummary}
                    generateArticleScript={generateArticleScript}
                    onGenerateArticleScriptChange={setGenerateArticleScript}
                />;
            case 'refine-article':
                return <RefineArticlePanel 
                    isEnhancingArticle={isLoading}
                    isPolishingArticle={isLoading}
                    isGeneratingHeadlines={isLoading}
                    generatedArticleHistory={generatedArticleHistory}
                    currentArticleIterationIndex={currentArticleIterationIndex}
                    onRevertToIteration={setCurrentArticleIterationIndex}
                    onEnhanceArticle={handleEnhanceArticle}
                    onPolishArticle={handlePolishArticle}
                    onGenerateHeadlinesForArticle={handleGenerateHeadlines}
                    generatedHeadlinesForArticle={generatedHeadlinesForArticle}
                    onSelectHeadlineForEdit={(headline) => {
                        setHeadlineForEdit(headline);
                    }}
                    generateHeadlinesForArticleScript={generateHeadlinesForArticleScript}
                    onGenerateHeadlinesForArticleScriptChange={setGenerateHeadlinesForArticleScript}
                />;
            case 'article-templates':
                return <ArticleTemplateLibrary 
                    templates={savedArticleTemplates}
                    onSave={(id, updates) => setSavedArticleTemplates(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))}
                    onDelete={(id) => setSavedArticleTemplates(prev => prev.filter(t => t.id !== id))}
                    onAddNew={() => setShowCreateArticleTemplateModal(true)}
                />;
            case 'recycle-article':
                return <RecycleArticlePanel 
                    articleText={recycleArticleText}
                    onArticleTextChange={setRecycleArticleText}
                    script={recycleArticleScript}
                    onScriptChange={setRecycleArticleScript}
                    onRecycle={handleRecycleArticle}
                    isLoading={isLoading}
                />;
            case 'audio-script':
                return <AudioScriptGeneratorPanel 
                    sourceText={audioScriptSourceText}
                    onSourceTextChange={setAudioScriptSourceText}
                    duration={audioScriptDuration}
                    onDurationChange={setAudioScriptDuration}
                    script={generateAudioScriptScript}
                    onScriptChange={setGenerateAudioScriptScript}
                    onGenerate={handleGenerateAudioScript}
                    isLoading={isLoading}
                    result={generatedAudioScript}
                />;
            case 'audio-script-archive':
                return <ArchivePanel title="Audio Script Archive" type="audio" items={archivedAudioScripts} />;
            case 'podcast-plan':
                return <GeneratePodcastPanel 
                    sourceType={podcastSourceType}
                    onSourceTypeChange={setPodcastSourceType}
                    sourceUrl={podcastSourceUrl}
                    onSourceUrlChange={setPodcastSourceUrl}
                    sourceText={podcastSourceText}
                    onSourceTextChange={setPodcastSourceText}
                    script={generatePodcastIdeasScript}
                    onScriptChange={setGeneratePodcastIdeasScript}
                    onGenerateIdeas={handleGeneratePodcastIdeas}
                    isGeneratingIdeas={isLoading && !generatedPodcastIdeas}
                    generatedIdeas={generatedPodcastIdeas}
                    onGenerateAdjacentIdeas={handleGenerateAdjacentPodcastIdeas}
                    isGeneratingAdjacentIdeas={isLoading && !generatedAdjacentPodcastIdeas}
                    selectedInitialIdea={selectedInitialPodcastIdea}
                    generatedAdjacentIdeas={generatedAdjacentPodcastIdeas}
                    onGeneratePlan={handleGeneratePodcastPlan}
                    isGeneratingPlan={isLoading && !generatedPodcastPlan}
                    generatedPlan={generatedPodcastPlan}
                    onClearPlan={() => setGeneratedPodcastPlan(null)}
                />;
            case 'podcast-plan-archive':
                return <ArchivePanel title="Podcast Plan Archive" type="podcast" items={archivedPodcastPlans} />;
            case 'biblical-check':
                return <BiblicalCheckPanel />;
            case 'niche-finder':
                return <NicheFinderPanel />;
            case 'checklist':
                return <ChecklistGuide items={checklistItems} onToggleItem={(id) => setChecklistItems(prev => prev.map(i => i.id === id ? { ...i, isCompleted: !i.isCompleted } : i))} />;
            case 'new-user-guide':
                return <NewUserGuide />;
            case 'posting-guides':
                return <PostingGuides />;
            case 'admin':
                return <AdminPanel settings={adminSettings} onSettingsChange={setAdminSettings} checklistItems={checklistItems} onChecklistChange={setChecklistItems} />;
            case 'settings':
                return <SettingsPanel settings={settings} onSettingsChange={setSettings} isAdmin={isAdmin} />;
            case 'persona':
                return <PersonaPanel 
                    personaName={personaName} onPersonaNameChange={setPersonaName}
                    userRole={userRole} onUserRoleChange={setUserRole}
                    targetAudience={targetAudience} onTargetAudienceChange={setTargetAudience}
                    whatIWriteAbout={whatIWriteAbout} onWhatIWriteAboutChange={setWhatIWriteAbout}
                    referenceWorldContent={referenceWorldContent} onReferenceWorldContentChange={setReferenceWorldContent}
                    thisIsHowIWriteArticles={thisIsHowIWriteArticles} onThisIsHowIWriteArticlesChange={setThisIsHowIWriteArticles}
                    userEmail={currentUser}
                />;
            case 'backup-restore':
                return <BackupRestorePanel 
                    backupData={currentBackupData}
                    onRestore={handleRestore}
                    userEmail={currentUser || ''}
                />;
            default:
                return <LandingPage onLoginClick={() => setShowLoginModal(true)} onNavigate={setView} currentPage={view} theme={theme} toggleTheme={toggleTheme} />;
        }
    };

    return (
        <div className={`min-h-screen transition-colors duration-200 ${theme === 'dark' ? 'dark bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
             {showLoginModal && (
                <LoginScreen 
                    onSignIn={handleLogin} 
                    error={authError} 
                    superUsers={['admin@admin.com', 'dave@bigagility.com']} 
                    onClose={() => setShowLoginModal(false)}
                />
            )}
            
            {showCreateArticleTemplateModal && (
                <CreateArticleTemplateModal 
                    onCreateTemplate={handleCreateArticleTemplate}
                    onClose={() => setShowCreateArticleTemplateModal(false)}
                    isLoading={isLoading}
                    error={error}
                />
            )}
            
             {headlineForEdit && (
                <HeadlineEditModal 
                    isOpen={!!headlineForEdit}
                    headline={headlineForEdit}
                    onClose={() => setHeadlineForEdit(null)}
                    onSave={(edited) => {
                        if (generatedArticleHistory[currentArticleIterationIndex]) {
                             const updatedArticle = {
                                ...generatedArticleHistory[currentArticleIterationIndex],
                                title: edited.headline,
                                headlineApplied: true
                             };
                             setGeneratedArticleHistory(prev => [updatedArticle, ...prev]);
                             setCurrentArticleIterationIndex(0);
                        }
                        setHeadlineForEdit(null);
                    }}
                />
            )}

            {!currentUser ? (
                 renderContent()
            ) : (
                <div className="flex h-screen overflow-hidden">
                    <Sidebar 
                        view={view} setView={setView} 
                        onSignOut={handleSignOut} 
                        userEmail={currentUser} 
                        isAdmin={isAdmin}
                        templateCount={savedTemplates.length}
                        articleTemplateCount={savedArticleTemplates.length}
                        showMobileMenu={showMobileMenu}
                        onToggleMobileMenu={() => setShowMobileMenu(!showMobileMenu)}
                        setShowMobileMenu={setShowMobileMenu}
                        hasGeneratedArticle={generatedArticleHistory.length > 0}
                        theme={theme}
                        toggleTheme={toggleTheme}
                        permissions={currentUserPermissions}
                        personaName={personaName}
                    />
                    
                    <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900 relative transition-colors duration-200">
                         <div className="md:hidden p-4 border-b border-gray-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-gray-900 sticky top-0 z-30">
                            <span className="font-bold text-lg text-gray-900 dark:text-white">Social Media Minion</span>
                            <button onClick={() => setShowMobileMenu(true)} className="p-2 text-gray-600 dark:text-gray-300">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                            </button>
                        </div>
                        
                        <div className="p-6 md:p-12 max-w-7xl mx-auto">
                            {renderContent()}
                        </div>
                    </main>
                </div>
            )}
        </div>
    );
};
