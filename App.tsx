
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Firebase Imports (Namespaced SDK)
import { auth, db } from "./firebase.ts";

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
import MediaSummaryPanel from './components/MediaSummaryPanel.tsx';
import AddPostModal from './components/AddPostModal.tsx';
import MobileCompanionPanel from './components/MobileCompanionPanel.tsx';
import MobileViewToggleDialog from './components/MobileViewToggleDialog.tsx';
import ChapterRewritePanel from './components/ChapterRewritePanel.tsx';
import FirestoreMigrationPanel from './components/FirestoreMigrationPanel.tsx';

// Services
import { 
  generateAndEvaluatePosts, researchPopularPosts, parseSchedule, generateArticleIdeas, 
  generateArticle, enhanceArticle, polishArticle, createArticleTemplateFromText, 
  generateHeadlinesForArticle, recycleArticle, generatePodcastIdeas, 
  generateAdjacentPodcastIdeas, generatePodcastPlan, generateAudioScript,
  generatePodcastTitleSuggestions, summarizeMedia, rewriteChapter
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
  DEFAULT_ARTICLE_EVAL_CRITERIA,
  MEDIA_SUMMARY_SCRIPT,
  CHAPTER_REWRITE_SCRIPT
} from './services/scriptService.ts';

// Types
import { 
  SavedTemplate, SavedArticleTemplate, QueuedPost, SentPost, AppSettings, AdminSettings, 
  BackupData, ArticleIdea, GeneratedArticle, GeneratedHeadline, Suggestion, PodcastIdea, 
  PodcastPlan, GeneratedAudioScript, ChecklistItem, ArticleDestination,
  UserActivity, AuthorizedUser, PersonaProfile, ChapterRewriteResult
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

// --- PRE-LOADED PROPHET PERSONA ---
const PROPHET_PERSONA: PersonaProfile = {
  id: 'prophet-persona-v2',
  name: 'Prophet',
  role: `Christian educator and content creator specializing in prophetic ministry training.
Founder and host of the School of Safe and Humble Prophets.

I teach and mentor emerging prophetic ministers and church leaders on healthy, biblically-grounded prophetic practice.
I address a specific gap in church teaching: helping Christians understand the fundamental differences between Old Testament prophetic models and New Testament prophetic ministry.
I equip church leaders to cultivate prophetic gifts in their congregations without swinging to extremes of either shutting prophecy down entirely or allowing it to operate without accountability.`,
  targetAudience: `Two Primary Audiences:
1. Young or emerging Christians with prophetic gifts — people who are discovering prophetic sensitivity and need guidance on how to operate in it healthily, without defaulting to Old Testament "lone prophet" models.
2. Church leaders and pastors — those responsible for cultivating (or currently suppressing) prophetic ministry in their congregations, who need frameworks for allowing prophecy to flourish with proper accountability.

Expanded Reach:
- General spiritual seekers and philosophers questioning life's meaning.
- Non-Christians who are curious about prophetic gifts (using biblical cautionary tales like Simon Magus from Acts 8 as entry points).

Common Thread: People confused about prophetic ministry or dealing with fallout (burnout, spiritual bullying, fear-based suppression).`,
  whatIWriteAbout: `Healthy, biblically-grounded prophetic practice.
The School of Safe and Humble Prophets.
The shift from Old Testament (authoritative) to New Testament (collaborative) prophetic ministry.
Avoidance of "lone wolf" Elijah-style prophecy in favor of community-based gifting.
Recovering from spiritual abuse or bad prophetic modeling.
Discernment and accountability in the church.`,
  referenceWorldContent: `Core Message:
The fundamental shift Jesus brought—from individual prophetic authority demanding obedience to community-based gifting that invites discernment. 
New Testament Model: We prophesy in part (1 Cor 13). Prophecy must be judged/weighed by the community (1 Cor 14).
The Goal: To build up, encourage, and console (1 Cor 14:3).

Key Concepts:
- "Safe and Humble Prophets": The antithesis of the arrogant, unaccountable "Man of God" model.
- Collaborative Gifting: Prophecy is a team sport in the New Covenant.
- Cautionary Tales: Simon Magus (Acts 8) represents the danger of seeking power for self-glory rather than service.

Problem Areas Addressed:
- Burnout from trying to carry the "word of the Lord" alone.
- Spiritual bullying disguised as "God told me."
- Churches acting out of fear by shutting down the Spirit.`,
  thisIsHowIWriteArticles: `Core Approach:
- Marty Cagan's direct, no-nonsense, experience-based style applied to leadership/ministry.
- Dickie Bush & Nicolas Cole's "Reader-First" methodology: seamless transitions, compelling headlines, scannable formatting.

Tone & Energy:
- High personality, high-energy.
- Story-based and engaging.
- Fun and interesting without sacrificing professional credibility.
- Warm but authoritative.
- Persuasive without being salesy.

Structural Elements:
- Opens with concrete scenarios that resonate (e.g., "The 9 AM exec meeting deadlock" or a tense church service moment).
- Varied sentence length for readability.
- Strong use of analogies and metaphors (e.g., "varifocal vision" or "navigating with compass vs GPS satellite imagery").
- Real-world examples and practitioner stories.
- Avoids redundancy.
- Always ties back to actionable takeaways.`,
  lastModified: new Date().toISOString()
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
    const [isMigrating, setIsMigrating] = useState(false);

    // --- DATA STATE ---
    // Persona - Initialized with Prophet Data
    const [personaName, setPersonaName] = useState(PROPHET_PERSONA.name);
    const [userRole, setUserRole] = useState(PROPHET_PERSONA.role);
    const [targetAudience, setTargetAudience] = useState(PROPHET_PERSONA.targetAudience);
    const [whatIWriteAbout, setWhatIWriteAbout] = useState(PROPHET_PERSONA.whatIWriteAbout);
    const [referenceWorldContent, setReferenceWorldContent] = useState(PROPHET_PERSONA.referenceWorldContent);
    const [thisIsHowIWriteArticles, setThisIsHowIWriteArticles] = useState(PROPHET_PERSONA.thisIsHowIWriteArticles);
    
    // Multi-Persona State - Pre-load Prophet
    const [savedPersonas, setSavedPersonas] = useState<PersonaProfile[]>([PROPHET_PERSONA]);
    const [activePersonaId, setActivePersonaId] = useState<string | null>(PROPHET_PERSONA.id);

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

    // Media Summary
    const [mediaSummaryUrl, setMediaSummaryUrl] = useState('');
    const [mediaSummaryScript, setMediaSummaryScript] = useState(MEDIA_SUMMARY_SCRIPT);
    const [mediaSummaryResult, setMediaSummaryResult] = useState<string | null>(null);

    // Chapter Rewrite
    const [chapterRewriteSourceText, setChapterRewriteSourceText] = useState('');
    const [chapterRewriteScript, setChapterRewriteScript] = useState(CHAPTER_REWRITE_SCRIPT);
    const [chapterRewriteResult, setChapterRewriteResult] = useState<ChapterRewriteResult | null>(null);

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
    const [showAddPostModal, setShowAddPostModal] = useState(false);
    const [isMobileCompanionMode, setIsMobileCompanionMode] = useState(false);
    const [showMobileTogglePrompt, setShowMobileTogglePrompt] = useState(false);
    
    // Check for mobile on load
    useEffect(() => {
      const checkMobile = () => {
        if (window.innerWidth < 768 && currentUser && !isMobileCompanionMode && !sessionStorage.getItem('mobilePromptDismissed')) {
          setShowMobileTogglePrompt(true);
        }
      };
      // Short delay to allow auth state to settle
      const timeout = setTimeout(checkMobile, 2000);
      return () => clearTimeout(timeout);
    }, [currentUser, isMobileCompanionMode]);

    // --- AUTO-SAVE HELPER (DEBOUNCE) ---
    const saveUserDocField = useCallback((field: string, value: any) => {
        if (auth.currentUser) {
            db.collection("users").doc(auth.currentUser.uid).set({ [field]: value }, { merge: true })
                .catch(err => console.error(`Error auto-saving ${field}:`, err));
        }
    }, []);

    // Custom hook for auto-saving state
    const useDebouncedSave = (value: any, field: string, delay = 2000) => {
        useEffect(() => {
            if (!auth.currentUser) return;
            // Only save if value is defined/not empty (to prevent overwriting with initial state on load)
            // But we might want to save empty strings if user deleted text. 
            // The initial load logic below prevents initial state overwrite issues.
            const handler = setTimeout(() => {
                saveUserDocField(field, value);
            }, delay);
            return () => clearTimeout(handler);
        }, [value, field, delay, saveUserDocField]);
    };

    // Apply auto-save to scripts and active session config
    useDebouncedSave(generationScript, 'generationScript');
    useDebouncedSave(standardStarterText, 'standardStarterText');
    useDebouncedSave(standardSummaryText, 'standardSummaryText');
    useDebouncedSave(researchScript, 'researchScript');
    
    useDebouncedSave(generateArticleIdeasScript, 'generateArticleIdeasScript');
    useDebouncedSave(generateArticleScript, 'generateArticleScript');
    useDebouncedSave(generateHeadlinesForArticleScript, 'generateHeadlinesForArticleScript');
    useDebouncedSave(recycleArticleScript, 'recycleArticleScript');
    
    useDebouncedSave(generatePodcastIdeasScript, 'generatePodcastIdeasScript');
    useDebouncedSave(generateAudioScriptScript, 'generateAudioScriptScript');
    
    useDebouncedSave(mediaSummaryScript, 'mediaSummaryScript');
    useDebouncedSave(chapterRewriteScript, 'chapterRewriteScript');
    
    useDebouncedSave(thisIsHowIWriteArticles, 'thisIsHowIWriteArticles');
    useDebouncedSave(referenceWorldContent, 'referenceWorldContent');
    useDebouncedSave(targetAudience, 'targetAudience');
    useDebouncedSave(userRole, 'userRole');
    // personaName is mostly display, but good to save the 'active' name too
    useDebouncedSave(personaName, 'personaName');

    // --- FIREBASE LISTENERS ---
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                console.log("User logged in:", user.uid, user.email);
                setCurrentUser(user.email);
                setShowLoginModal(false);
                if (view === 'landing') setView('queue');

                // STEP A: Try to migrate local data (only runs once ever per email)
                setIsMigrating(true);
                await migrateLocalToFirestore(user);
                
                // STEP B: Fetch Initial Config (Scripts, Active Context)
                await loadInitialUserConfig(user);
                
                setIsMigrating(false);

                // STEP C: Turn on the live data stream
                startLiveDataListener(user);
            } else {
                console.log("User logged out");
                setCurrentUser(null);
                setView('landing');
            }
        });
        return () => unsubscribe();
    }, []);

    // Helper: Load initial config (Scripts etc)
    const loadInitialUserConfig = async (user: any) => {
        try {
            const doc = await db.collection("users").doc(user.uid).get();
            if (doc.exists) {
                const data = doc.data();
                if (!data) return;
                
                // Scripts
                if (data.generationScript) setGenerationScript(data.generationScript);
                if (data.researchScript) setResearchScript(data.researchScript);
                if (data.generateArticleIdeasScript) setGenerateArticleIdeasScript(data.generateArticleIdeasScript);
                if (data.generateArticleScript) setGenerateArticleScript(data.generateArticleScript);
                if (data.generateHeadlinesForArticleScript) setGenerateHeadlinesForArticleScript(data.generateHeadlinesForArticleScript);
                if (data.recycleArticleScript) setRecycleArticleScript(data.recycleArticleScript);
                if (data.generatePodcastIdeasScript) setGeneratePodcastIdeasScript(data.generatePodcastIdeasScript);
                if (data.generateAudioScriptScript) setGenerateAudioScriptScript(data.generateAudioScriptScript);
                if (data.mediaSummaryScript) setMediaSummaryScript(data.mediaSummaryScript);
                if (data.chapterRewriteScript) setChapterRewriteScript(data.chapterRewriteScript);
                
                // Admin Settings & Checklist
                if (data.adminSettings) setAdminSettings(data.adminSettings);
                if (data.checklist) setChecklistItems(data.checklist);

                // Active Context (if not overridden by a loaded persona later)
                if (data.userRole) setUserRole(data.userRole);
                if (data.targetAudience) setTargetAudience(data.targetAudience);
                if (data.referenceWorldContent) setReferenceWorldContent(data.referenceWorldContent);
                if (data.thisIsHowIWriteArticles) setThisIsHowIWriteArticles(data.thisIsHowIWriteArticles);
                if (data.personaName) setPersonaName(data.personaName);
                
                // Texts
                if (data.standardStarterText) setStandardStarterText(data.standardStarterText);
                if (data.standardSummaryText) setStandardSummaryText(data.standardSummaryText);
            }
        } catch (e) {
            console.error("Error loading initial config:", e);
        }
    };

    // Helper: Migration Logic
    const migrateLocalToFirestore = async (user: any) => {
        const migrationKey = `minion_migrated_${user.email}`;
        const alreadyMigrated = localStorage.getItem(migrationKey);
        
        if (alreadyMigrated) return;

        const legacyKey = `minion_data_${user.email}`;
        const localDataString = localStorage.getItem(legacyKey);
        
        if (!localDataString) {
            // No local data for this user, mark migrated anyway to skip next time
            localStorage.setItem(migrationKey, 'true');
            return;
        }

        console.log("Migrating local data to cloud for:", user.email);
        
        try {
            const data: BackupData = JSON.parse(localDataString);
            const batch = db.batch();
            const userRef = db.collection("users").doc(user.uid);

            // 1. User Profile & Settings
            batch.set(userRef, {
                email: user.email,
                displayName: user.displayName || '',
                settings: data.settings || {},
                checklist: data.checklistItems || [],
                adminSettings: data.adminSettings || {},
                activePersonaId: data.activePersonaId || null,
                lastMigrated: new Date().toISOString(),
                // Migrate scripts too
                generationScript: data.generationScript,
                // ... add other scripts if present in backup ...
            }, { merge: true });

            // 2. Personas
            if (data.savedPersonas) {
                data.savedPersonas.forEach(p => {
                    const ref = userRef.collection("personas").doc(p.id);
                    batch.set(ref, p);
                });
            }

            // 3. Post Templates
            if (data.savedTemplates) {
                data.savedTemplates.forEach(t => {
                    const ref = userRef.collection("postTemplates").doc(t.id);
                    batch.set(ref, t);
                });
            }

            // 4. Article Templates
            if (data.savedArticleTemplates) {
                data.savedArticleTemplates.forEach(t => {
                    const ref = userRef.collection("articleTemplates").doc(t.id);
                    batch.set(ref, t);
                });
            }

            // 5. Posts Queue & History
            if (data.ayrshareQueue) {
                data.ayrshareQueue.forEach(p => {
                    const ref = userRef.collection("posts").doc(p.id);
                    batch.set(ref, { ...p, status: 'queued' }); // Ensure mapped correctly
                });
            }
            if (data.ayrshareLog) {
                data.ayrshareLog.forEach(p => {
                    const ref = userRef.collection("posts").doc(p.id);
                    batch.set(ref, { ...p, status: 'posted' });
                });
            }

            await batch.commit();
            localStorage.setItem(migrationKey, 'true');
            console.log("Migration finished successfully!");

        } catch (e) {
            console.error("Migration failed:", e);
        }
    };

    // Helper: Live Listeners
    const startLiveDataListener = (user: any) => {
        // Listen to User Doc (Settings, Active Persona, etc)
        db.collection("users").doc(user.uid).onSnapshot((docSnapshot) => {
            if (docSnapshot.exists) {
                const data = docSnapshot.data();
                if (data && data.settings) setSettings(data.settings);
                if (data && data.checklist) setChecklistItems(data.checklist);
                if (data && data.adminSettings) setAdminSettings(data.adminSettings);
                if (data && data.activePersonaId) setActivePersonaId(data.activePersonaId);
            }
        });

        // Listen to Personas
        db.collection("users").doc(user.uid).collection("personas").onSnapshot((snapshot) => {
            const personas: PersonaProfile[] = [];
            snapshot.forEach(doc => personas.push(doc.data() as PersonaProfile));
            if (personas.length > 0) {
                setSavedPersonas(personas);
            }
        });

        // Listen to Post Templates
        db.collection("users").doc(user.uid).collection("postTemplates").onSnapshot((snapshot) => {
            const templates: SavedTemplate[] = [];
            snapshot.forEach(doc => templates.push(doc.data() as SavedTemplate));
            // Merge with initial if empty? Or just replace. 
            // For now, replacing allows cloud sync.
            if (templates.length > 0) setSavedTemplates(templates);
        });

        // Listen to Posts (Queue & Log)
        const postsQuery = db.collection("users").doc(user.uid).collection("posts");
        postsQuery.onSnapshot((snapshot) => {
            const queue: QueuedPost[] = [];
            const log: SentPost[] = [];
            snapshot.forEach(doc => {
                const p = doc.data();
                if (p.status === 'posted') log.push(p as SentPost);
                else queue.push(p as QueuedPost);
            });
            setAyrshareQueue(queue);
            setAyrshareLog(log);
        });
        
        // Listen to Article Templates
        db.collection("users").doc(user.uid).collection("articleTemplates").onSnapshot((snapshot) => {
             const templates: SavedArticleTemplate[] = [];
             snapshot.forEach(doc => templates.push(doc.data() as SavedArticleTemplate));
             if (templates.length > 0) setSavedArticleTemplates(templates);
        });
    };

    // --- END FIREBASE LISTENERS ---

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
                canViewNicheFinder: true,
                canViewMediaSummary: true,
                canViewChapterRewrite: true
            };
        }

        const userObj = adminSettings.authorizedUsers.find(u => u.email.toLowerCase() === currentUser.toLowerCase());
        return userObj ? userObj.permissions : undefined;
    }, [currentUser, adminSettings.authorizedUsers, isAdmin]);

    // Data for backup
    const currentBackupData: BackupData = useMemo(() => ({
        userEmail: currentUser,
        userRole, personaName, targetAudience, whatIWriteAbout, referenceWorldContent, thisIsHowIWriteArticles,
        savedPersonas, activePersonaId,
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
        audioScriptSourceText, audioScriptDuration, generateAudioScriptScript, generatedAudioScript, archivedAudioScripts,
        mediaSummaryUrl, mediaSummaryScript,
        chapterRewriteScript
    }), [
        currentUser, userRole, personaName, targetAudience, whatIWriteAbout, referenceWorldContent, thisIsHowIWriteArticles,
        savedPersonas, activePersonaId,
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
        audioScriptSourceText, audioScriptDuration, generateAudioScriptScript, generatedAudioScript, archivedAudioScripts,
        mediaSummaryUrl, mediaSummaryScript,
        chapterRewriteScript
    ]);

    const handleRestore = (data: BackupData) => {
        if (data.personaName) setPersonaName(data.personaName);
        if (data.userRole) setUserRole(data.userRole);
        if (data.targetAudience) setTargetAudience(data.targetAudience);
        if (data.whatIWriteAbout) setWhatIWriteAbout(data.whatIWriteAbout);
        if (data.referenceWorldContent) setReferenceWorldContent(data.referenceWorldContent);
        if (data.thisIsHowIWriteArticles) setThisIsHowIWriteArticles(data.thisIsHowIWriteArticles);
        if (data.savedPersonas) setSavedPersonas(data.savedPersonas);
        if (data.activePersonaId) setActivePersonaId(data.activePersonaId);
        
        if (data.savedTemplates) setSavedTemplates(data.savedTemplates);
        if (data.savedArticleTemplates) setSavedArticleTemplates(data.savedArticleTemplates);
        if (data.ayrshareQueue) setAyrshareQueue(data.ayrshareQueue);
        if (data.settings) setSettings(data.settings);
        if (data.adminSettings) setAdminSettings(data.adminSettings);
        if (data.checklistItems) setChecklistItems(data.checklistItems);
        if (data.archivedAudioScripts) setArchivedAudioScripts(data.archivedAudioScripts);
        if (data.archivedPodcastPlans) setArchivedPodcastPlans(data.archivedPodcastPlans);
        if (data.mediaSummaryScript) setMediaSummaryScript(data.mediaSummaryScript);
        if (data.chapterRewriteScript) setChapterRewriteScript(data.chapterRewriteScript);
        // Restore other fields as needed
        if (data.articleUrl) setArticleUrl(data.articleUrl);
        if (data.articleText) setArticleText(data.articleText);
        if (data.standardStarterText) setStandardStarterText(data.standardStarterText);
        if (data.standardSummaryText) setStandardSummaryText(data.standardSummaryText);
    };

    // Note: Removed LocalStorage loading effect as it is replaced by Firebase listener
    // Persistence to LocalStorage is kept for now as a fallback/cache mechanism
    useEffect(() => {
        if (currentUser) {
            localStorage.setItem(`minion_data_${currentUser}`, JSON.stringify(currentBackupData));
        }
    }, [currentUser, currentBackupData]);

    const handleLogin = (email: string, password?: string) => {
        // Whitelist for password bypass (Legacy)
        if (password === adminSettings.secretPassword || email === 'admin@admin.com' || email === 'dave@bigagility.com') {
             setCurrentUser(email);
             setShowLoginModal(false);
             setView('queue');
             setAuthError(null);
        } else {
            setAuthError('Invalid password.');
        }
    };

    const handleSignOut = async () => {
        await auth.signOut();
        setCurrentUser(null);
        setView('landing');
    };

    // --- PERSONA MANAGEMENT HANDLERS ---
    const handleSavePersonaProfile = async (profile: PersonaProfile) => {
        // optimistic update
        setSavedPersonas(prev => {
            const existingIndex = prev.findIndex(p => p.id === profile.id);
            if (existingIndex >= 0) {
                const updated = [...prev];
                updated[existingIndex] = profile;
                return updated;
            } else {
                return [...prev, profile];
            }
        });
        setActivePersonaId(profile.id);
        
        // Also update the active state variables
        setPersonaName(profile.name);
        setUserRole(profile.role);
        setTargetAudience(profile.targetAudience);
        setWhatIWriteAbout(profile.whatIWriteAbout);
        setReferenceWorldContent(profile.referenceWorldContent);
        setThisIsHowIWriteArticles(profile.thisIsHowIWriteArticles);

        // Save to Firebase
        if (auth.currentUser) {
            try {
                const ref = db.collection("users").doc(auth.currentUser.uid).collection("personas").doc(profile.id);
                await ref.set(profile, { merge: true });
                
                // Update active state in User doc
                const userRef = db.collection("users").doc(auth.currentUser.uid);
                await userRef.set({ activePersonaId: profile.id }, { merge: true });
            } catch (error) {
                console.error("Error saving persona:", error);
            }
        }
    };

    const handleLoadPersona = async (id: string) => {
        const profile = savedPersonas.find(p => p.id === id);
        if (profile) {
            setActivePersonaId(profile.id);
            setPersonaName(profile.name);
            setUserRole(profile.role);
            setTargetAudience(profile.targetAudience);
            setWhatIWriteAbout(profile.whatIWriteAbout);
            setReferenceWorldContent(profile.referenceWorldContent);
            setThisIsHowIWriteArticles(profile.thisIsHowIWriteArticles);
            
            // Sync active state to Firebase
            if (auth.currentUser) {
                try {
                    const userRef = db.collection("users").doc(auth.currentUser.uid);
                    await userRef.set({ activePersonaId: profile.id }, { merge: true });
                } catch (error) {
                    console.error("Error updating active persona:", error);
                }
            }
        }
    };

    const handleDeletePersona = async (id: string) => {
        setSavedPersonas(prev => prev.filter(p => p.id !== id));
        if (activePersonaId === id) {
            setActivePersonaId(null);
        }
        
        if (auth.currentUser) {
            try {
                await db.collection("users").doc(auth.currentUser.uid).collection("personas").doc(id).delete();
            } catch (error) {
                console.error("Error deleting persona:", error);
            }
        }
    };

    const handleCreateNewPersona = () => {
        setActivePersonaId(null);
        setPersonaName('');
        setUserRole('');
        setTargetAudience('');
        setWhatIWriteAbout('');
        setReferenceWorldContent('');
        setThisIsHowIWriteArticles('');
    };

    // --- TEMPLATE HANDLERS (With Cloud Sync) ---
    const handleSavePostTemplate = async (id: string, updates: Partial<SavedTemplate>) => {
        // Optimistic update
        setSavedTemplates(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
        if (auth.currentUser) {
             await db.collection('users').doc(auth.currentUser.uid).collection('postTemplates').doc(id).set(updates, { merge: true });
        }
    };

    const handleDeletePostTemplate = async (id: string) => {
        if (auth.currentUser) {
            await db.collection("users").doc(auth.currentUser.uid).collection("postTemplates").doc(id).delete();
        } else {
            setSavedTemplates(prev => prev.filter(t => t.id !== id));
        }
    };

    const handleAddPostTemplate = async () => {
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
        
        if (auth.currentUser) {
            await db.collection("users").doc(auth.currentUser.uid).collection("postTemplates").doc(newTemplate.id).set(newTemplate);
        } else {
            setSavedTemplates(prev => [newTemplate, ...prev]);
        }
    };

    const handleSaveArticleTemplate = async (id: string, updates: Partial<SavedArticleTemplate>) => {
        setSavedArticleTemplates(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
        if (auth.currentUser) {
             await db.collection('users').doc(auth.currentUser.uid).collection('articleTemplates').doc(id).set(updates, { merge: true });
        }
    };

    const handleDeleteArticleTemplate = async (id: string) => {
        if (auth.currentUser) {
            await db.collection("users").doc(auth.currentUser.uid).collection("articleTemplates").doc(id).delete();
        } else {
            setSavedArticleTemplates(prev => prev.filter(t => t.id !== id));
        }
    };

    const handleAddArticleTemplate = async () => {
        const newTemplate: SavedArticleTemplate = {
            id: uuidv4(),
            title: 'New Article Template',
            description: '',
            structure: '',
            specialInstructions: '',
            isNew: true
        };
        
        if (auth.currentUser) {
            await db.collection("users").doc(auth.currentUser.uid).collection("articleTemplates").doc(newTemplate.id).set(newTemplate);
        } else {
            setSavedArticleTemplates(prev => [newTemplate, ...prev]);
        }
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

    const handleGenerateMediaSummary = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await summarizeMedia({
                url: mediaSummaryUrl,
                script: mediaSummaryScript,
                userRole,
                targetAudience
            });
            setMediaSummaryResult(result);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChapterRewrite = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await rewriteChapter({
                sourceText: chapterRewriteSourceText,
                script: chapterRewriteScript
            });
            setChapterRewriteResult(result);
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
            
            const newTemplateWithId = { ...template, id: uuidv4(), isNew: true };
            
            if (auth.currentUser) {
                 await db.collection("users").doc(auth.currentUser.uid).collection("articleTemplates").doc(newTemplateWithId.id).set(newTemplateWithId);
            } else {
                setSavedArticleTemplates(prev => [newTemplateWithId, ...prev]);
            }
            
            return true;
        } catch (e: any) {
            setError(e.message);
            return false;
        } finally {
            setIsLoading(false);
        }
    };
    
    // Add Manual Post Handler
    const handleAddManualPost = async (post: QueuedPost) => {
        setAyrshareQueue(prev => [post, ...prev]);
        
        // Sync to Firebase
        if (auth.currentUser) {
            try {
                const ref = db.collection("users").doc(auth.currentUser.uid).collection("posts").doc(post.id);
                await ref.set(post);
            } catch (e) {
                console.error("Error saving manual post:", e);
            }
        }
    };

    // --- Persist Admin Settings & Checklist Changes ---
    const handleAdminSettingsChange = (newSettings: AdminSettings) => {
        setAdminSettings(newSettings);
        if (auth.currentUser) {
            db.collection("users").doc(auth.currentUser.uid).set({ adminSettings: newSettings }, { merge: true })
                .catch(err => console.error("Error saving admin settings:", err));
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
                    onSendToAyrshareQueue={async (post, platforms) => {
                        const newPost: QueuedPost = { ...post, id: uuidv4(), platforms, status: 'scheduled', score: post.score };
                        setAyrshareQueue(prev => [...prev, newPost]);
                        // Firebase Update
                        if(auth.currentUser) {
                            try {
                                const ref = db.collection("users").doc(auth.currentUser.uid).collection("posts").doc(newPost.id);
                                await ref.set(newPost);
                            } catch (e) {
                                console.error("Error saving post to queue:", e);
                            }
                        }
                    }}
                />;
            case 'queue':
                return <QueuedPostsDisplay 
                    queuedPosts={ayrshareQueue} 
                    onDeletePost={(id) => {
                        setAyrshareQueue(prev => prev.filter(p => p.id !== id));
                        if(auth.currentUser) db.collection("users").doc(auth.currentUser.uid).collection("posts").doc(id).delete();
                    }}
                    onUpdatePost={(id, updates) => {
                        setAyrshareQueue(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
                        if(auth.currentUser) db.collection("users").doc(auth.currentUser.uid).collection("posts").doc(id).set(updates, { merge: true });
                    }}
                    onAddPostClick={() => setShowAddPostModal(true)}
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
                    onSave={handleSavePostTemplate}
                    onDelete={handleDeletePostTemplate}
                    onAddNew={handleAddPostTemplate}
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
                    onSave={handleSaveArticleTemplate}
                    onDelete={handleDeleteArticleTemplate}
                    onAddNew={handleAddArticleTemplate}
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
            case 'media-summary':
                return <MediaSummaryPanel />;
            case 'chapter-rewrite':
                return <ChapterRewritePanel 
                    sourceText={chapterRewriteSourceText}
                    onSourceTextChange={setChapterRewriteSourceText}
                    script={chapterRewriteScript}
                    onScriptChange={setChapterRewriteScript}
                    onRewrite={handleChapterRewrite}
                    isLoading={isLoading}
                    result={chapterRewriteResult}
                />;
            case 'checklist':
                return <ChecklistGuide items={checklistItems} onToggleItem={(id) => setChecklistItems(prev => prev.map(i => i.id === id ? { ...i, isCompleted: !i.isCompleted } : i))} />;
            case 'new-user-guide':
                return <NewUserGuide />;
            case 'posting-guides':
                return <PostingGuides />;
            case 'admin':
                return <AdminPanel 
                    settings={adminSettings} 
                    onSettingsChange={handleAdminSettingsChange} 
                    checklistItems={checklistItems} 
                    onChecklistChange={(items) => {
                        setChecklistItems(items);
                        if(auth.currentUser) {
                            db.collection("users").doc(auth.currentUser.uid).set({ checklist: items }, { merge: true })
                                .catch(err => console.error("Error saving checklist:", err));
                        }
                    }} 
                />;
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
                    savedPersonas={savedPersonas}
                    activePersonaId={activePersonaId}
                    onSavePersonaProfile={handleSavePersonaProfile}
                    onLoadPersona={handleLoadPersona}
                    onDeletePersona={handleDeletePersona}
                    onCreateNewPersona={handleCreateNewPersona}
                />;
            case 'backup-restore':
                return <BackupRestorePanel 
                    backupData={currentBackupData}
                    onRestore={handleRestore}
                    userEmail={currentUser || ''}
                />;
            case 'firestore-migration':
                return <FirestoreMigrationPanel 
                    backupData={currentBackupData}
                    onRestore={handleRestore}
                    userEmail={currentUser}
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
            
            {showAddPostModal && (
                <AddPostModal 
                    onClose={() => setShowAddPostModal(false)}
                    onAddPost={handleAddManualPost}
                />
            )}
            
            {showMobileTogglePrompt && (
                <MobileViewToggleDialog 
                    onConfirm={() => {
                        setIsMobileCompanionMode(true);
                        setShowMobileTogglePrompt(false);
                    }}
                    onCancel={() => {
                        setShowMobileTogglePrompt(false);
                        sessionStorage.setItem('mobilePromptDismissed', 'true');
                    }}
                />
            )}
            
            {isMobileCompanionMode && currentUser ? (
                <MobileCompanionPanel 
                    queue={ayrshareQueue}
                    ideas={generatedArticleIdeas}
                    onAddDraftPost={handleAddManualPost}
                    onExitMobileMode={() => setIsMobileCompanionMode(false)}
                />
            ) : (
                <>
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
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => setIsMobileCompanionMode(true)} className="p-2 text-teal-500 hover:text-teal-400" title="Switch to Mobile Companion">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                        </button>
                                        <button onClick={() => setShowMobileMenu(true)} className="p-2 text-gray-600 dark:text-gray-300">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="p-6 md:p-12 max-w-7xl mx-auto">
                                    {isMigrating ? (
                                        <div className="flex flex-col items-center justify-center h-full">
                                            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-teal-400 mb-4"></div>
                                            <p className="text-xl text-gray-300">Migrating your data to the cloud...</p>
                                        </div>
                                    ) : (
                                        renderContent()
                                    )}
                                </div>
                            </main>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
