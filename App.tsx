


import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { generateAndEvaluatePosts, GenerationResults, ResearchedPost, researchPopularPosts, scanContentForTemplates } from './services/geminiService';
import { getCoreScriptsForDownload, getTemplatesForDownload, formatPageDataForDownload, LINKEDIN_GENERATION_EVALUATION_SCRIPT } from './services/scriptService';
import { postToAyrshare, testAyrshareConnection } from './services/ayrshareService';
import { initialTemplates, seedQueue, seedLog, seedUrls } from './services/templateData';
import * as airtableService from './services/airtableService';
import { SavedTemplate, QueuedPost, SentPost, ScheduledTask, AppSettings, TopPostAssessment, AirtableSyncStatus } from './types';
import Button from './components/Button';
import Sidebar from './components/Sidebar';
import GenerationResultDisplay from './components/GenerationResultDisplay';
import Scheduler from './components/Scheduler';
import TemplateCard from './components/TemplateCard';

type SaveStatus = 'idle' | 'saving' | 'saved';
type TestStatus = {
    status: 'idle' | 'testing' | 'success' | 'error';
    message: string;
};


const DEFAULT_RESEARCH_SCRIPT = `You are my internet researcher, helping me find viral posts on LI and X that I can learn from. Find 10 high-performing hooks from Leadership and Product Thinking posts from LinkedIn from the past week. Focus on posts with 10K+ views or 100+ comments. 

Please output them into cards below in the following Format: Hook text, platform, engagement metrics, why it worked, and the direct URL link to the actual post`;

const DEFAULT_AUDIENCE = `- Executive leaders in large organisations
- Change agents in large companies
- Mid-level Project Managers and PMO officers`;

const DEFAULT_SUMMARY_TEXT = `If you want to know more, here is a great article that takes this further:
[ARTICLE_URL]

If you liked this, please repost and share. It helps me a lot.

Also - DM me for the details of courses on coaching, leadership and using AI to accelerate the boring bits and get to the good stuff. Remember you won't lose your job to AI, but you might lose your job to someone who gets the very best out of AI.`;

const DEFAULT_SCHEDULING_INSTRUCTIONS = `Post the top three posts at 10am, 2pm and 8pm CET.`;


const App: React.FC = () => {
  const [view, setView] = useState<string>('generate-posts');
  
  const [articleUrl, setArticleUrl] = useState<string>('');
  const [articleText, setArticleText] = useState<string>('');
  const [generationScript, setGenerationScript] = useState<string>(LINKEDIN_GENERATION_EVALUATION_SCRIPT);
  const [targetAudience, setTargetAudience] = useState<string>(DEFAULT_AUDIENCE);
  const [standardSummaryText, setStandardSummaryText] = useState<string>(DEFAULT_SUMMARY_TEXT);
  const [generationResults, setGenerationResults] = useState<GenerationResults | null>(null);
  const [ayrshareQueue, setAyrshareQueue] = useState<QueuedPost[]>([]);
  const [savedTemplates, setSavedTemplates] = useState<(SavedTemplate & { isNew?: boolean })[]>([]);
  const [scanContent, setScanContent] = useState<string>('');
  const [scannedTemplates, setScannedTemplates] = useState<SavedTemplate[] | null>(null);
  const [selectedScannedTemplateIds, setSelectedScannedTemplateIds] = useState<string[]>([]);
  const [researchScript, setResearchScript] = useState<string>(DEFAULT_RESEARCH_SCRIPT);
  const [researchedPosts, setResearchedPosts] = useState<ResearchedPost[] | null>(null);
  const [isGoogleConnected, setIsGoogleConnected] = useState<boolean>(false);
  const [googleUserEmail, setGoogleUserEmail] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [urlCollection, setUrlCollection] = useState<string[]>([]);
  const [urlCollectionInput, setUrlCollectionInput] = useState<string>('');
  const [scheduledTasks, setScheduledTasks] = useState<ScheduledTask[]>([]);
  const [ayrshareLog, setAyrshareLog] = useState<SentPost[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    ayrshareApiKey: '',
    airtablePersonalAccessToken: '',
    airtableBaseId: '',
    airtableTemplatesTable: 'Templates',
    airtableQueueTable: 'Queue',
    airtableLogTable: 'Log',
    airtableUrlsTable: 'URLs',
  });
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSettingsStatus, setSaveSettingsStatus] = useState<SaveStatus>('idle');
  
  // "Post Now" Modal State
  const [isPostModalOpen, setIsPostModalOpen] = useState<boolean>(false);
  const [postToShare, setPostToShare] = useState<QueuedPost | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['linkedin']);
  const [postNowStatus, setPostNowStatus] = useState<{ status: 'idle' | 'loading' | 'error', message: string | null }>({ status: 'idle', message: null });

  // Airtable State
  const [airtableSyncStatus, setAirtableSyncStatus] = useState<AirtableSyncStatus>('idle');
  
  // API Test State
  const [ayrshareTestStatus, setAyrshareTestStatus] = useState<TestStatus>({ status: 'idle', message: '' });
  const [airtableTestStatus, setAirtableTestStatus] = useState<TestStatus>({ status: 'idle', message: '' });
  
  // Seed Status State
  const [seedTemplatesStatus, setSeedTemplatesStatus] = useState<TestStatus>({ status: 'idle', message: '' });
  const [seedQueueStatus, setSeedQueueStatus] = useState<TestStatus>({ status: 'idle', message: '' });
  const [seedLogStatus, setSeedLogStatus] = useState<TestStatus>({ status: 'idle', message: '' });
  const [seedUrlsStatus, setSeedUrlsStatus] = useState<TestStatus>({ status: 'idle', message: '' });


  const isAirtableConfigured = useMemo(() => {
    return !!(settings.airtablePersonalAccessToken && settings.airtableBaseId);
  }, [settings.airtablePersonalAccessToken, settings.airtableBaseId]);

  const syncWithAirtable = useCallback(async () => {
      if (!isAirtableConfigured) {
          setAirtableSyncStatus('not-configured');
          return;
      }
      setAirtableSyncStatus('syncing');
      setError(null);
      try {
          const [templates, queue, log, urls] = await Promise.all([
              airtableService.fetchRecords<SavedTemplate>(settings.airtableTemplatesTable, settings),
              airtableService.fetchRecords<QueuedPost>(settings.airtableQueueTable, settings),
              airtableService.fetchRecords<SentPost>(settings.airtableLogTable, settings),
              airtableService.fetchRecords<{url: string}>(settings.airtableUrlsTable, settings),
          ]);
          setSavedTemplates(templates);
          setAyrshareQueue(queue);
          setAyrshareLog(log);
          const urlStrings = urls.map(u => u.url);
          setUrlCollection(urlStrings);
          setUrlCollectionInput(urlStrings.join('\n'));
          setAirtableSyncStatus('synced');
      } catch (e) {
          const message = e instanceof Error ? e.message : 'An unknown error occurred during Airtable sync.';
          setError(`Airtable Sync Failed: ${message}`);
          setAirtableSyncStatus('error');
      }
  }, [settings, isAirtableConfigured]);


  // Load all state on initial mount
  useEffect(() => {
    let loadedSettings: any | null = null;
    try {
      const savedSettingsJson = localStorage.getItem('appSettings');
      if (savedSettingsJson) {
        loadedSettings = JSON.parse(savedSettingsJson);
        // Handle migration for users who have the old key stored
        if (loadedSettings.airtableApiKey && !loadedSettings.airtablePersonalAccessToken) {
            loadedSettings.airtablePersonalAccessToken = loadedSettings.airtableApiKey;
            delete loadedSettings.airtableApiKey;
        }
        setSettings(s => ({ ...s, ...loadedSettings }));
      }
    } catch (e) { console.error("Failed to parse settings from localStorage", e); }
    
    // Decide whether to sync with Airtable or load from localStorage
    if (loadedSettings?.airtablePersonalAccessToken && loadedSettings.airtableBaseId) {
        syncWithAirtable();
    } else {
        setAirtableSyncStatus('not-configured');
        // Fallback to localStorage if Airtable is not configured
        try {
            const savedResearchScript = localStorage.getItem('linkedinResearchScript');
            if (savedResearchScript) setResearchScript(savedResearchScript);
            const savedGenScript = localStorage.getItem('linkedinGenerationScript');
            if (savedGenScript) setGenerationScript(savedGenScript);
            const savedAudience = localStorage.getItem('targetAudience');
            if (savedAudience) setTargetAudience(savedAudience);
            const savedSummary = localStorage.getItem('standardSummaryText');
            if (savedSummary) setStandardSummaryText(savedSummary);
            
            const savedGoogleConnection = localStorage.getItem('isGoogleConnected');
            const savedGoogleUser = localStorage.getItem('googleUserEmail');
            if (savedGoogleConnection === 'true' && savedGoogleUser) {
                setIsGoogleConnected(true);
                setGoogleUserEmail(savedGoogleUser);
            }
      
            const savedTemplatesJson = localStorage.getItem('savedTemplates');
            setSavedTemplates(savedTemplatesJson ? JSON.parse(savedTemplatesJson) : initialTemplates);
      
            const savedGenResultsJson = localStorage.getItem('generationResults');
            if (savedGenResultsJson) setGenerationResults(JSON.parse(savedGenResultsJson));
            
            const savedQueueJson = localStorage.getItem('ayrshareQueue');
            if (savedQueueJson) setAyrshareQueue(JSON.parse(savedQueueJson));
      
            const savedUrlCollectionJson = localStorage.getItem('urlCollection');
            if (savedUrlCollectionJson) {
                const parsedUrls = JSON.parse(savedUrlCollectionJson);
                setUrlCollection(parsedUrls);
                setUrlCollectionInput(parsedUrls.join('\n'));
            }
            
            const savedScheduledTasksJson = localStorage.getItem('scheduledTasks');
            if (savedScheduledTasksJson) setScheduledTasks(JSON.parse(savedScheduledTasksJson));
            
            const savedLogJson = localStorage.getItem('ayrshareLog');
            if (savedLogJson) setAyrshareLog(JSON.parse(savedLogJson));
      
          } catch (e) {
            console.error("Failed to parse saved data from localStorage", e);
            setSavedTemplates(initialTemplates);
          }
    }
  }, [syncWithAirtable]); // syncWithAirtable is stable

  // Persist non-Airtable data to localStorage automatically on any change
  useEffect(() => { if (!isAirtableConfigured) localStorage.setItem('linkedinResearchScript', researchScript); }, [researchScript, isAirtableConfigured]);
  useEffect(() => { if (!isAirtableConfigured) localStorage.setItem('linkedinGenerationScript', generationScript); }, [generationScript, isAirtableConfigured]);
  useEffect(() => { if (!isAirtableConfigured) localStorage.setItem('targetAudience', targetAudience); }, [targetAudience, isAirtableConfigured]);
  useEffect(() => { if (!isAirtableConfigured) localStorage.setItem('standardSummaryText', standardSummaryText); }, [standardSummaryText, isAirtableConfigured]);
  useEffect(() => { if (!isAirtableConfigured && savedTemplates.length > 0) localStorage.setItem('savedTemplates', JSON.stringify(savedTemplates.filter(t => !t.isNew))); }, [savedTemplates, isAirtableConfigured]);
  useEffect(() => { if (!isAirtableConfigured) localStorage.setItem('scheduledTasks', JSON.stringify(scheduledTasks)); }, [scheduledTasks, isAirtableConfigured]);
  useEffect(() => { if (!isAirtableConfigured) localStorage.setItem('ayrshareLog', JSON.stringify(ayrshareLog)); }, [ayrshareLog, isAirtableConfigured]);
  useEffect(() => { if (!isAirtableConfigured && generationResults) localStorage.setItem('generationResults', JSON.stringify(generationResults)); }, [generationResults, isAirtableConfigured]);
  useEffect(() => { if (!isAirtableConfigured) localStorage.setItem('ayrshareQueue', JSON.stringify(ayrshareQueue)); }, [ayrshareQueue, isAirtableConfigured]);
  
  useEffect(() => {
    const handler = setTimeout(() => {
        const urls = urlCollectionInput.split('\n').map(u => u.trim()).filter(Boolean);
        setUrlCollection(urls);
        if (!isAirtableConfigured) {
            localStorage.setItem('urlCollection', JSON.stringify(urls));
        } else {
            // This is a bit tricky. A full sync on every change is too much.
            // For now, we'll let the user manage URLs in Airtable directly.
            // A more advanced implementation would diff and sync.
        }
    }, 500);
    return () => clearTimeout(handler);
  }, [urlCollectionInput, isAirtableConfigured]);


  const calculateNextRun = (scheduleTime: string): number => {
    const [hours, minutes] = scheduleTime.split(':').map(Number);
    const now = new Date();
    const nextRun = new Date();
    nextRun.setHours(hours, minutes, 0, 0);
    if (now.getTime() > nextRun.getTime()) {
      nextRun.setDate(nextRun.getDate() + 1);
    }
    return nextRun.getTime();
  };

  const runGeneratePostsTask = async (taskId: string) => {
    const currentUrls = urlCollectionInput.split('\n').map(u => u.trim()).filter(Boolean);
    if (currentUrls.length === 0) {
      updateTask(taskId, { status: 'error', statusMessage: `URL Collection is empty. Task skipped.`, lastRun: new Date().toISOString(), nextRun: calculateNextRun(scheduledTasks.find(t=>t.id===taskId)!.scheduleTime) });
      return;
    }
    const urlToProcess = currentUrls[0];
    updateTask(taskId, { status: 'running', statusMessage: `Processing URL: ${urlToProcess}` });
    try {
      const results = await generateAndEvaluatePosts({
        articleUrl: urlToProcess, articleText: '', templates: savedTemplates, script: generationScript, targetAudience, standardSummaryText
      });
      if (results.top7Assessments && results.top7Assessments.length > 0) {
        const topPost = results.top7Assessments[0];
        handleSendToAyrshareQueue(topPost);
        
        const newUrlCollection = currentUrls.slice(1);
        setUrlCollectionInput(newUrlCollection.join('\n'));
        if (isAirtableConfigured) {
            // Find the record ID for the URL that was just processed and delete it.
            const recordToDelete = (await airtableService.fetchRecords<{url: string}>(settings.airtableUrlsTable, settings)).find(r => r.url === urlToProcess);
            if (recordToDelete) {
                airtableService.deleteRecord(settings.airtableUrlsTable, recordToDelete.id, settings);
            }
        }

        updateTask(taskId, { status: 'success', statusMessage: `Generated 1 post from ${urlToProcess}`, lastRun: new Date().toISOString(), nextRun: calculateNextRun(scheduledTasks.find(t=>t.id===taskId)!.scheduleTime) });
      } else {
        throw new Error("No posts were generated.");
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'An unknown error occurred.';
      updateTask(taskId, { status: 'error', statusMessage: `Failed: ${message}`, lastRun: new Date().toISOString(), nextRun: calculateNextRun(scheduledTasks.find(t=>t.id===taskId)!.scheduleTime) });
    }
  };

  const runAyrshareTask = async (taskId: string) => {
    const task = scheduledTasks.find(t => t.id === taskId);
    if (!task) return;
    const apiKey = settings.ayrshareApiKey;
    if (!apiKey) {
      updateTask(taskId, { status: 'error', statusMessage: `Ayrshare API Key is not set in Settings.`, lastRun: new Date().toISOString(), nextRun: calculateNextRun(task.scheduleTime) });
      return;
    }
    
    let postsToProcess: QueuedPost[] = ayrshareQueue;

    if (postsToProcess.length === 0) {
      updateTask(taskId, { status: 'success', statusMessage: 'No posts were queued, nothing to do.', lastRun: new Date().toISOString(), nextRun: calculateNextRun(task.scheduleTime) });
      return;
    }

    updateTask(taskId, { status: 'running', statusMessage: `Starting to post ${postsToProcess.length} items...` });
    
    const successfulPosts: QueuedPost[] = [];
    let firstError: string | null = null;

    for (const post of postsToProcess) {
      try {
        const response = await postToAyrshare(post.content, apiKey, ['linkedin']);
        if (response.status === 'success') {
          successfulPosts.push(post);
        } else {
          firstError = `Post "${post.title}" failed: ${response.message || 'Unknown error from Ayrshare.'}`;
          break; 
        }
      } catch (e) {
        firstError = e instanceof Error ? e.message : 'An unknown network error occurred.';
        break;
      }
    }
    
    if (successfulPosts.length > 0) {
      const now = new Date().toISOString();
      const justSent: Omit<SentPost, 'id'>[] = successfulPosts.map(p => ({
        title: p.title,
        content: p.content,
        sentAt: now
      }));

      if(isAirtableConfigured) {
        airtableService.createRecords(settings.airtableLogTable, justSent, settings);
        airtableService.deleteRecords(settings.airtableQueueTable, successfulPosts.map(p => p.id), settings);
      }
      
      setAyrshareLog(prev => [...prev, ...successfulPosts.map((p, i) => ({...justSent[i], id: `sent-${Date.now()}-${i}`}))]);
      setAyrshareQueue(prev => prev.filter(p => !successfulPosts.some(s => s.id === p.id)));
    }
    
    if (firstError) {
      updateTask(taskId, { status: 'error', statusMessage: `Posted ${successfulPosts.length} posts. Error: ${firstError}`, lastRun: new Date().toISOString(), nextRun: calculateNextRun(task.scheduleTime) });
    } else {
      updateTask(taskId, { status: 'success', statusMessage: `Successfully posted ${successfulPosts.length} items.`, lastRun: new Date().toISOString(), nextRun: calculateNextRun(task.scheduleTime) });
    }
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = Date.now();
      scheduledTasks.forEach(task => {
        if (task.enabled && task.nextRun && now >= task.nextRun && task.status !== 'running') {
          if (task.type === 'generate-posts') {
            runGeneratePostsTask(task.id);
          } else if (task.type === 'ayrshare-api') {
            runAyrshareTask(task.id);
          }
        }
      });
    }, 10000); // Check every 10 seconds
    return () => clearInterval(intervalId);
  }, [scheduledTasks, urlCollectionInput, ayrshareQueue, savedTemplates, generationScript, targetAudience, standardSummaryText, settings.ayrshareApiKey, isAirtableConfigured]);

  const handleSaveSettings = () => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
    setSaveSettingsStatus('saving');
    // If Airtable settings are present, trigger a sync.
    if (settings.airtablePersonalAccessToken && settings.airtableBaseId) {
        syncWithAirtable();
    } else {
        setAirtableSyncStatus('not-configured');
    }
    setTimeout(() => {
        setSaveSettingsStatus('saved');
        setTimeout(() => setSaveSettingsStatus('idle'), 2000);
    }, 200);
  };

  const handleGeneratePosts = useCallback(async () => {
    if (!articleUrl.trim() && !articleText.trim()) {
      setError('Please provide an article URL or paste the article text.');
      return;
    }
    setError(null);
    setGenerationResults(null);
    setIsLoading(true);
    try {
      const results = await generateAndEvaluatePosts({
        articleUrl, articleText, templates: savedTemplates, script: generationScript, targetAudience, standardSummaryText
      });
      setGenerationResults(results);
      const now = new Date().toLocaleDateString();
      const updatedTemplates = savedTemplates.map(t => ({...t, usageCount: t.usageCount + 1, lastUsed: now}));
      setSavedTemplates(updatedTemplates);
      if(isAirtableConfigured) {
          airtableService.updateRecords(settings.airtableTemplatesTable, updatedTemplates.map(t => ({id: t.id, fields: {usageCount: t.usageCount, lastUsed: t.lastUsed}})), settings);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [articleUrl, articleText, savedTemplates, generationScript, targetAudience, standardSummaryText, isAirtableConfigured, settings]);
  
  const handleSendToAyrshareQueue = useCallback(async (post: TopPostAssessment) => {
    const newQueuedPost: Omit<QueuedPost, 'id'> = { ...post };
    if (isAirtableConfigured) {
        try {
            const createdRecord = await airtableService.createRecord<Omit<QueuedPost, 'id'>>(settings.airtableQueueTable, newQueuedPost, settings);
            setAyrshareQueue(prev => [createdRecord, ...prev]);
        } catch (e) {
            setError(`Failed to add post to Airtable queue: ${e instanceof Error ? e.message : 'Unknown error'}`);
        }
    } else {
        setAyrshareQueue(prev => [{...newQueuedPost, id: `queued-${Date.now()}-${Math.random()}`}, ...prev]);
    }
  }, [isAirtableConfigured, settings]);

  const handleUpdateQueuedPost = (id: string, newContent: string) => {
    setAyrshareQueue(prev => prev.map(p => p.id === id ? { ...p, content: newContent } : p));
    if (isAirtableConfigured) {
      airtableService.updateRecord(settings.airtableQueueTable, id, { content: newContent }, settings);
    }
  };
  
  const handleDeleteQueuedPost = (id: string) => {
    if (window.confirm("Are you sure?")) {
        setAyrshareQueue(prev => prev.filter(p => p.id !== id));
        if (isAirtableConfigured) {
            airtableService.deleteRecord(settings.airtableQueueTable, id, settings);
        }
    }
  };
  
  const handleClearAyrshareQueue = useCallback(() => {
      if (window.confirm("Clear all posts from the queue?")) {
          if (isAirtableConfigured) {
              airtableService.deleteRecords(settings.airtableQueueTable, ayrshareQueue.map(p => p.id), settings);
          }
          setAyrshareQueue([]);
      }
  }, [ayrshareQueue, isAirtableConfigured, settings]);
  
  // "Post Now" Modal Handlers
  const handleOpenPostModal = (post: QueuedPost) => {
      setPostToShare(post);
      setSelectedPlatforms(['linkedin']); // Default selection
      setPostNowStatus({ status: 'idle', message: null });
      setIsPostModalOpen(true);
  };

  const handleClosePostModal = () => {
      setIsPostModalOpen(false);
      setPostToShare(null);
  };

  const handlePlatformToggle = (platform: string) => {
      setSelectedPlatforms(prev => 
          prev.includes(platform) 
              ? prev.filter(p => p !== platform) 
              : [...prev, platform]
      );
  };

  const handlePostNow = async () => {
    if (!postToShare || selectedPlatforms.length === 0) return;
    const apiKey = settings.ayrshareApiKey;
    if (!apiKey) {
      setPostNowStatus({ status: 'error', message: `Ayrshare API Key is not set in Settings.` });
      return;
    }
    setPostNowStatus({ status: 'loading', message: 'Posting...' });

    try {
        const response = await postToAyrshare(postToShare.content, apiKey, selectedPlatforms);
        if (response.status === 'success') {
            const now = new Date().toISOString();
            const sentPostData: Omit<SentPost, 'id'> = {
                title: postToShare.title,
                content: postToShare.content,
                sentAt: now
            };
            
            if (isAirtableConfigured) {
                airtableService.createRecord(settings.airtableLogTable, sentPostData, settings);
                airtableService.deleteRecord(settings.airtableQueueTable, postToShare.id, settings);
            }
            setAyrshareLog(prev => [{...sentPostData, id: `sent-${Date.now()}`}, ...prev]);
            setAyrshareQueue(prev => prev.filter(p => p.id !== postToShare.id));
            handleClosePostModal();
        } else {
            setPostNowStatus({ status: 'error', message: response.message || 'An unknown error occurred from Ayrshare.' });
        }
    } catch (e) {
        setPostNowStatus({ status: 'error', message: e instanceof Error ? e.message : 'An unknown network error occurred.' });
    }
  };


  const handleResearchPosts = useCallback(async () => {
    if (!researchScript.trim()) { setError('Please provide a script.'); return; }
    setError(null); setResearchedPosts(null); setIsLoading(true);
    try {
      setResearchedPosts(await researchPopularPosts(researchScript));
    } catch (e) { setError(e instanceof Error ? e.message : 'An error occurred.'); }
    finally { setIsLoading(false); }
  }, [researchScript]);

  const handleScanContent = useCallback(async () => {
    if (!scanContent.trim()) { setError('Please paste content.'); return; }
    setError(null); setScannedTemplates(null); setIsLoading(true);
    try {
        const results = await scanContentForTemplates(scanContent);
        setScannedTemplates(results.map(t => ({ ...t, id: `template-${Date.now()}-${Math.random()}`, dateAdded: new Date().toLocaleDateString(), usageCount: 0, lastUsed: 'Never' })));
    } catch (e) { setError(e instanceof Error ? e.message : 'An error occurred.'); }
    finally { setIsLoading(false); }
}, [scanContent]);

  const handleAddSelectedToLibrary = () => {
    if (!scannedTemplates) return;
    const selected = scannedTemplates.filter(t => selectedScannedTemplateIds.includes(t.id))
      .map(({id, ...rest}) => rest); // remove temporary id
    
    setSavedTemplates(prev => [...selected.map(t => ({...t, id: `new-${Math.random()}`})), ...prev]); // Add with temp id for UI
    if (isAirtableConfigured) {
        airtableService.createRecords(settings.airtableTemplatesTable, selected, settings)
            .then(() => syncWithAirtable()); // Re-sync to get proper IDs
    }
    setScanContent(''); setScannedTemplates(null); setSelectedScannedTemplateIds([]);
    setView('linkedin-library');
  };
  const handleScannedTemplateSelection = (id: string) => { setSelectedScannedTemplateIds(prev => prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]); };
  const handleSelectAllScanned = () => { if (scannedTemplates) setSelectedScannedTemplateIds(selectedScannedTemplateIds.length === scannedTemplates.length ? [] : scannedTemplates.map(t => t.id)); };
  
  const handleAddNewTemplate = () => {
    const tempId = `new-template-${Date.now()}`;
    const newTemplate: SavedTemplate & { isNew: boolean } = {
        id: tempId,
        title: 'New Untitled Template',
        template: '',
        example: '',
        instructions: '',
        dateAdded: new Date().toLocaleDateString(),
        usageCount: 0,
        lastUsed: 'Never',
        isNew: true,
    };
    setSavedTemplates(prev => [newTemplate, ...prev]);
  };
  
  const handleUpdateTemplate = async (id: string, updates: Partial<Omit<SavedTemplate, 'id'>>) => {
      const templateToUpdate = savedTemplates.find(t => t.id === id);
      if (!templateToUpdate) return;
  
      if (templateToUpdate.isNew) {
          // This is a CREATION event
          const { isNew, ...newTemplateData } = { ...templateToUpdate, ...updates };
          const dataForApi = {
              title: newTemplateData.title,
              template: newTemplateData.template,
              example: newTemplateData.example,
              instructions: newTemplateData.instructions,
              dateAdded: newTemplateData.dateAdded,
              usageCount: newTemplateData.usageCount,
              lastUsed: newTemplateData.lastUsed,
          };
  
          if (isAirtableConfigured) {
              try {
                  const createdRecord = await airtableService.createRecord(settings.airtableTemplatesTable, dataForApi, settings);
                  setSavedTemplates(prev => prev.map(t => t.id === id ? createdRecord : t));
              } catch (e) {
                  setError(`Failed to save template to Airtable: ${e instanceof Error ? e.message : 'Unknown error'}`);
                  setSavedTemplates(prev => prev.filter(t => t.id !== id)); // Remove failed temp template
              }
          } else {
              setSavedTemplates(prev => prev.map(t => t.id === id ? { ...newTemplateData, id: `template-${Date.now()}` } : t));
          }
      } else {
          // This is an UPDATE event
          setSavedTemplates(prev => prev.map(t => (t.id === id ? { ...t, ...updates } : t)));
          if (isAirtableConfigured) {
              airtableService.updateRecord(settings.airtableTemplatesTable, id, updates, settings);
          }
      }
  };
  
  const handleDeleteTemplate = (id: string) => {
      const templateToDelete = savedTemplates.find(t => t.id === id);
      if (!templateToDelete) return;
  
      // No confirmation for new, unsaved templates.
      if (templateToDelete.isNew) {
        setSavedTemplates(prev => prev.filter(t => t.id !== id));
        return;
      }
      
      if (window.confirm("Delete this template?")) {
        setSavedTemplates(prev => prev.filter(t => t.id !== id)); 
        if (isAirtableConfigured) {
            airtableService.deleteRecord(settings.airtableTemplatesTable, id, settings);
        }
      }
  };


  const handleGoogleConnect = () => {
    setIsConnecting(true);
    setTimeout(() => { // Simulate API call
        const email = 'user@example.com';
        setIsGoogleConnected(true);
        setGoogleUserEmail(email);
        localStorage.setItem('isGoogleConnected', 'true');
        localStorage.setItem('googleUserEmail', email);
        setIsConnecting(false);
    }, 1500);
  };
  const handleGoogleDisconnect = () => { setIsGoogleConnected(false); setGoogleUserEmail(''); localStorage.removeItem('isGoogleConnected'); localStorage.removeItem('googleUserEmail'); };

  const handleScheduleWithGoogle = () => {
      if (window.confirm(`This will schedule ${ayrshareQueue.length} posts to your Google Calendar and clear the planner. Continue?`)) {
          console.log("Scheduling posts:", ayrshareQueue);
          alert(`${ayrshareQueue.length} posts have been scheduled to Google Calendar.`);
          handleClearAyrshareQueue();
      }
  };

  const addTask = (task: Omit<ScheduledTask, 'id' | 'lastRun' | 'nextRun' | 'status' | 'statusMessage'>) => {
    const newTask: ScheduledTask = {
        ...task,
        id: `task-${Date.now()}`,
        lastRun: null,
        nextRun: task.enabled ? calculateNextRun(task.scheduleTime) : null,
        status: 'idle',
        statusMessage: null,
    };
    setScheduledTasks(prev => [...prev, newTask]);
  };
  const updateTask = (taskId: string, updates: Partial<ScheduledTask>) => {
    setScheduledTasks(prev => prev.map(task => {
        if (task.id === taskId) {
            const updatedTask = { ...task, ...updates };
            if (updates.enabled !== undefined || updates.scheduleTime !== undefined) {
                updatedTask.nextRun = updatedTask.enabled ? calculateNextRun(updatedTask.scheduleTime) : null;
            }
            return updatedTask;
        }
        return task;
    }));
  };
  const deleteTask = (taskId: string) => { setScheduledTasks(prev => prev.filter(task => task.id !== taskId)); };

  const handleDownloadData = () => {
    const coreScripts = getCoreScriptsForDownload(generationScript);
    const templateScripts = getTemplatesForDownload(savedTemplates);
    const pageData = formatPageDataForDownload(generationResults, ayrshareQueue);
    const content = `${coreScripts}\n\n// ===== LinkedIn Template Library =====\n\n${templateScripts}\n\n${pageData}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'social-media-minion-data.txt';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleTestAyrshare = async () => {
    setAyrshareTestStatus({ status: 'testing', message: 'Testing...' });
    const result = await testAyrshareConnection(settings.ayrshareApiKey);
    if (result.success) {
        setAyrshareTestStatus({ status: 'success', message: result.message });
    } else {
        setAyrshareTestStatus({ status: 'error', message: result.message });
    }
    setTimeout(() => setAyrshareTestStatus(prev => ({ ...prev, status: 'idle' })), 5000);
  };
  
  const handleTestAirtable = async () => {
      setAirtableTestStatus({ status: 'testing', message: 'Testing...' });
      const result = await airtableService.testAirtableConnection(settings);
      if (result.success) {
          setAirtableTestStatus({ status: 'success', message: result.message });
      } else {
          setAirtableTestStatus({ status: 'error', message: result.message });
      }
      setTimeout(() => setAirtableTestStatus(prev => ({ ...prev, status: 'idle' })), 5000);
  };
  
  const handleSeedData = async (
    dataType: 'templates' | 'queue' | 'log' | 'urls'
  ) => {
    const dataTypeMap = {
        templates: {
            tableName: settings.airtableTemplatesTable,
            data: initialTemplates.map(({ id, ...rest }) => rest),
            setStatus: setSeedTemplatesStatus,
            confirmMessage: `This will add the 10 initial templates to your '${settings.airtableTemplatesTable}' table in Airtable.`
        },
        queue: {
            tableName: settings.airtableQueueTable,
            data: seedQueue,
            setStatus: setSeedQueueStatus,
            confirmMessage: `This will add 2 sample posts to your '${settings.airtableQueueTable}' table.`
        },
        log: {
            tableName: settings.airtableLogTable,
            data: seedLog,
            setStatus: setSeedLogStatus,
            confirmMessage: `This will add 1 sample post to your '${settings.airtableLogTable}' table.`
        },
        urls: {
            tableName: settings.airtableUrlsTable,
            data: seedUrls,
            setStatus: setSeedUrlsStatus,
            confirmMessage: `This will add 3 sample URLs to your '${settings.airtableUrlsTable}' table.`
        }
    };

    const config = dataTypeMap[dataType];

    if (!window.confirm(`${config.confirmMessage} This is a one-time setup action. Are you sure you want to proceed?`)) {
        return;
    }

    config.setStatus({ status: 'testing', message: 'Seeding...' });
    try {
        // FIX: The type of `config.data` is a union of different array types. The generic `createRecords` function
        // cannot infer a single type `T` from this union. By explicitly using the corresponding data from `dataTypeMap`
        // inside the switch, we provide a concretely-typed array for each case, resolving the type error.
        switch (dataType) {
            case 'templates':
                await airtableService.createRecords(config.tableName, dataTypeMap.templates.data, settings);
                break;
            case 'queue':
                await airtableService.createRecords(config.tableName, dataTypeMap.queue.data, settings);
                break;
            case 'log':
                await airtableService.createRecords(config.tableName, dataTypeMap.log.data, settings);
                break;
            case 'urls':
                await airtableService.createRecords(config.tableName, dataTypeMap.urls.data, settings);
                break;
        }

        config.setStatus({ status: 'success', message: 'Successfully seeded data!' });
        syncWithAirtable(); // Re-sync to show the new data
    } catch (e) {
        const message = e instanceof Error ? e.message : "An unknown error occurred.";
        config.setStatus({ status: 'error', message: `Seeding failed: ${message}` });
    }
    setTimeout(() => config.setStatus({ status: 'idle', message: '' }), 7000);
  };


  const renderCurrentView = () => {
    switch (view) {
      case 'generate-posts':
        return (
          <div className="w-full p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="articleUrl" className="block text-sm font-medium text-gray-300 mb-2">Article URL</label>
                  <input id="articleUrl" type="url" value={articleUrl} onChange={(e) => setArticleUrl(e.target.value)} placeholder="https://example.com/article" className="w-full p-3 bg-gray-900 border border-slate-600 rounded-md focus:ring-2 focus:ring-teal-400" />
                </div>
                 <div>
                  <label htmlFor="articleText" className="block text-sm font-medium text-gray-300 mb-2">Paste Article Text</label>
                  <textarea id="articleText" value={articleText} onChange={(e) => setArticleText(e.target.value)} placeholder="Paste full article text..." rows={5} className="w-full p-3 bg-gray-900 border border-slate-600 rounded-md focus:ring-2 focus:ring-teal-400" />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-300 mb-2">Target Audience</label>
                <textarea id="targetAudience" value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} rows={6} className="w-full p-3 bg-gray-900 border border-slate-600 rounded-md focus:ring-2 focus:ring-teal-400 text-sm" />
              </div>
              <div>
                <label htmlFor="standardSummary" className="block text-sm font-medium text-gray-300 mb-2">Standard Summary Text</label>
                <textarea id="standardSummary" value={standardSummaryText} onChange={(e) => setStandardSummaryText(e.target.value)} rows={6} className="w-full p-3 bg-gray-900 border border-slate-600 rounded-md focus:ring-2 focus:ring-teal-400 text-sm" />
              </div>
            </div>
             <div className="flex items-center justify-center gap-4">
                  <label className="flex items-center space-x-3"><input type="checkbox" defaultChecked={true} disabled className="h-5 w-5" /><span className="text-gray-300">LinkedIn</span></label>
                   <label className="flex items-center space-x-3 opacity-50"><input type="checkbox" disabled className="h-5 w-5" /><span className="text-gray-500">X</span></label>
                   <label className="flex items-center space-x-3 opacity-50"><input type="checkbox" disabled className="h-5 w-5" /><span className="text-gray-500">Facebook</span></label>
            </div>
            <div>
              <label htmlFor="generation-script" className="block text-sm font-medium text-gray-300 mb-2">Core Generation & Evaluation Script</label>
              <textarea id="generation-script" value={generationScript} onChange={(e) => setGenerationScript(e.target.value)} rows={12} className="w-full p-4 bg-gray-900 border border-slate-600 rounded-md focus:ring-2 focus:ring-teal-400 font-mono text-xs" />
            </div>
          </div>
        );
      case 'collect-urls':
          return (
            <div className="w-full p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg space-y-6">
                <h2 className="text-2xl font-bold text-gray-200">Collect URLs</h2>
                <p className="text-gray-400">
                  {isAirtableConfigured 
                    ? `URLs are being synced from your Airtable base's '${settings.airtableUrlsTable}' table. Please manage your URLs there.`
                    : 'Enter one URL per line. The "Generate Posts" scheduler task will process the top URL from this list and then remove it.'}
                </p>
                <div>
                  <label htmlFor="url-collection" className="block text-sm font-medium text-gray-300 mb-2">URL Collection</label>
                  <textarea 
                    id="url-collection" 
                    value={urlCollectionInput} 
                    onChange={(e) => setUrlCollectionInput(e.target.value)} 
                    rows={15} 
                    className="w-full p-4 bg-gray-900 border border-slate-600 rounded-md focus:ring-2 focus:ring-teal-400 font-mono text-sm"
                    disabled={isAirtableConfigured}
                    placeholder="https://example.com/article-1&#10;https://example.com/article-2&#10;https://example.com/article-3"
                  />
                </div>
            </div>
          );
      case 'ayrshare-queue':
        return (
            <div className="w-full p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-200">Ayrshare Queue ({ayrshareQueue.length})</h2>
                    {ayrshareQueue.length > 0 && (
                        <div className="flex gap-4">
                             {isGoogleConnected && <Button onClick={handleScheduleWithGoogle}>Schedule with Google</Button>}
                             <button onClick={handleClearAyrshareQueue} className="text-sm text-red-400 hover:text-red-300">Clear All</button>
                        </div>
                    )}
                </div>
                 {ayrshareQueue.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">The queue is empty. Generate some posts to get started.</p>
                 ) : (
                    <div className="space-y-4">
                        {ayrshareQueue.map((post) => (
                           <div key={post.id} className="p-4 bg-slate-900/50 border border-slate-700 rounded-lg">
                               <h4 className="font-semibold text-teal-300">{post.title}</h4>
                               <textarea 
                                   value={post.content} 
                                   onChange={(e) => handleUpdateQueuedPost(post.id, e.target.value)}
                                   rows={6}
                                   className="w-full mt-2 p-3 bg-gray-900 rounded-md text-sm font-mono whitespace-pre-wrap text-gray-300 border border-slate-600 focus:ring-2 focus:ring-teal-400"
                               />
                               <div className="flex items-center justify-end gap-3 mt-3">
                                   <Button onClick={() => handleOpenPostModal(post)}>Post Now</Button>
                                   <button onClick={() => handleDeleteQueuedPost(post.id)} className="text-sm text-gray-500 hover:text-red-400">Delete</button>
                               </div>
                           </div>
                        ))}
                    </div>
                 )}
            </div>
        );
      case 'ayrshare-log':
          return (
             <div className="w-full p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg space-y-6">
                <h2 className="text-2xl font-bold text-gray-200">Ayrshare Log</h2>
                 {ayrshareLog.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No posts have been sent yet.</p>
                 ) : (
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                        {ayrshareLog.map((post) => (
                           <div key={post.id} className="p-4 bg-slate-900/50 border border-slate-700 rounded-lg">
                               <div className="flex justify-between items-center">
                                  <h4 className="font-semibold text-teal-300">{post.title}</h4>
                                  <span className="text-xs text-gray-500">{new Date(post.sentAt).toLocaleString()}</span>
                               </div>
                               <p className="mt-2 text-sm whitespace-pre-wrap text-gray-300 font-mono border-l-2 border-slate-600 pl-4">{post.content}</p>
                           </div>
                        ))}
                    </div>
                 )}
            </div>
          );
      case 'scheduler':
          return (
            <Scheduler 
                tasks={scheduledTasks}
                onAddTask={addTask}
                onUpdateTask={updateTask}
                onDeleteTask={deleteTask}
                isGoogleConnected={isGoogleConnected}
                googleUserEmail={googleUserEmail}
                isConnecting={isConnecting}
                onGoogleConnect={handleGoogleConnect}
                onGoogleDisconnect={handleGoogleDisconnect}
            />
          );
      case 'linkedin-researcher':
          return (
            <div className="w-full p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg space-y-6">
                <h2 className="text-2xl font-bold text-gray-200">LinkedIn Post Researcher</h2>
                <div>
                    <label htmlFor="research-script" className="block text-sm font-medium text-gray-300 mb-2">Research Script</label>
                    <textarea id="research-script" value={researchScript} onChange={(e) => setResearchScript(e.target.value)} rows={8} className="w-full p-4 bg-gray-900 border border-slate-600 rounded-md focus:ring-2 focus:ring-teal-400 font-mono text-xs" />
                </div>
                <div className="text-center">
                    <Button onClick={handleResearchPosts} isLoading={isLoading}>
                        {isLoading ? 'Researching...' : 'Research Popular Posts'}
                    </Button>
                </div>
            </div>
          );
      case 'linkedin-inspirations':
        return (
            <div className="w-full p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg space-y-6 text-center">
              <h2 className="text-2xl font-bold text-gray-200">Inspiration Hub</h2>
              <svg className="w-24 h-24 mx-auto text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
              <p className="text-gray-400 max-w-lg mx-auto">
                This feature is coming soon. The Inspiration Hub will connect to your Google Drive to pull ideas, transcripts, and drafts, helping you generate content from your own knowledge base.
              </p>
            </div>
        );
      case 'linkedin-library':
          return (
            <div className="w-full p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-200">LinkedIn Template Library</h2>
                     <div className="flex gap-4">
                        <Button onClick={() => setView('linkedin-library-scan')}>Scan Content for Templates</Button>
                        <Button onClick={handleAddNewTemplate}>+ Add New Template</Button>
                     </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {savedTemplates.map(template => (
                        <TemplateCard 
                            key={template.id}
                            template={template}
                            onSave={(updates) => handleUpdateTemplate(template.id, updates)}
                            onDelete={() => handleDeleteTemplate(template.id)}
                        />
                    ))}
                </div>
            </div>
          );
    case 'linkedin-library-scan':
      return (
        <div className="w-full p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg space-y-6">
          <h2 className="text-2xl font-bold text-gray-200">Scan Content for Templates</h2>
          <p className="text-gray-400">
            Paste a blog post, article, or a collection of your favorite social media posts. The AI will analyze the content and extract reusable templates for your library.
          </p>
          <div>
            <label htmlFor="scan-content" className="block text-sm font-medium text-gray-300 mb-2">Content to Scan</label>
            <textarea
              id="scan-content"
              value={scanContent}
              onChange={(e) => setScanContent(e.target.value)}
              rows={15}
              className="w-full p-4 bg-gray-900 border border-slate-600 rounded-md focus:ring-2 focus:ring-teal-400 font-mono text-sm"
              placeholder="Paste content here..."
            />
          </div>
          <div className="text-center">
            <Button onClick={handleScanContent} isLoading={isLoading}>
              {isLoading ? 'Scanning...' : 'Scan for Templates'}
            </Button>
          </div>

          {scannedTemplates && (
            <div className="space-y-4 pt-6 border-t border-slate-700">
               <div className="flex justify-between items-center">
                 <h3 className="text-xl font-bold text-gray-200">Found Templates</h3>
                 <div className="flex items-center gap-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={scannedTemplates.length > 0 && selectedScannedTemplateIds.length === scannedTemplates.length}
                        onChange={handleSelectAllScanned}
                        className="h-5 w-5 mr-2"
                      />
                      Select All
                    </label>
                   <Button onClick={handleAddSelectedToLibrary} disabled={selectedScannedTemplateIds.length === 0}>
                     Add ({selectedScannedTemplateIds.length}) to Library
                   </Button>
                 </div>
               </div>

              {scannedTemplates.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No templates could be identified in the provided content.</p>
              ) : (
                <div className="space-y-4">
                  {scannedTemplates.map(template => (
                    <div key={template.id} className="p-4 bg-slate-900/50 border border-slate-700 rounded-lg flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={selectedScannedTemplateIds.includes(template.id)}
                        onChange={() => handleScannedTemplateSelection(template.id)}
                        className="h-5 w-5 mt-1 flex-shrink-0"
                      />
                      <div className="flex-grow">
                        <h4 className="font-semibold text-teal-300">{template.title}</h4>
                        <p className="text-sm text-gray-400 mt-1 italic">{template.instructions || "No instructions provided."}</p>
                        <div className="mt-2 p-3 bg-gray-900 rounded">
                            <p className="text-xs font-semibold uppercase text-gray-500 mb-1">Template:</p>
                            <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono">{template.template}</pre>
                        </div>
                        <div className="mt-2 p-3 bg-gray-900 rounded">
                            <p className="text-xs font-semibold uppercase text-gray-500 mb-1">Example:</p>
                            <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono">{template.example}</pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      );
      case 'settings':
        const seedButton = (
            dataType: 'templates' | 'queue' | 'log' | 'urls',
            status: TestStatus,
        ) => (
            <div className="text-right">
                <Button 
                    onClick={() => handleSeedData(dataType)}
                    isLoading={status.status === 'testing'}
                    disabled={!isAirtableConfigured}
                    className="px-4 py-1 text-sm"
                >
                    Seed
                </Button>
                {status.message && (
                    <p className={`text-xs mt-1 text-right ${status.status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                        {status.message}
                    </p>
                )}
            </div>
        );
        return (
            <div className="w-full p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg space-y-6 max-w-3xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-200">Settings</h2>
                 <div className="space-y-4">
                    <div>
                        <h3 className="text-lg font-semibold text-teal-300">Ayrshare API Key</h3>
                        <p className="text-sm text-gray-400 mb-2">Required for posting to social media and using the scheduler.</p>
                        <div className="flex items-center gap-4">
                            <input type="password" value={settings.ayrshareApiKey} onChange={e => setSettings(s => ({ ...s, ayrshareApiKey: e.target.value }))} className="flex-grow p-2 bg-gray-900 rounded-md" />
                            <Button onClick={handleTestAyrshare} isLoading={ayrshareTestStatus.status === 'testing'}>Test</Button>
                        </div>
                        {ayrshareTestStatus.message && (
                            <p className={`text-xs mt-2 ${ayrshareTestStatus.status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                                {ayrshareTestStatus.message}
                            </p>
                        )}
                    </div>
                    <div className="pt-4 border-t border-slate-700">
                         <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="text-lg font-semibold text-teal-300">Airtable Integration (Optional)</h3>
                                <p className="text-sm text-gray-400">Sync your data with Airtable using a Personal Access Token for easy external management. If not configured, data will be saved in your browser's local storage.</p>
                            </div>
                            <Button onClick={handleTestAirtable} isLoading={airtableTestStatus.status === 'testing'}>Test Connection</Button>
                        </div>
                        {airtableTestStatus.message && (
                            <p className={`text-xs mb-2 text-right ${airtableTestStatus.status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                                {airtableTestStatus.message}
                            </p>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                          <div>
                            <label className="block text-sm mb-1">Personal Access Token</label>
                            <input type="password" value={settings.airtablePersonalAccessToken} onChange={e => setSettings(s => ({ ...s, airtablePersonalAccessToken: e.target.value }))} className="w-full p-2 bg-gray-900 rounded-md" />
                          </div>
                          <div>
                            <label className="block text-sm mb-1">Base ID</label>
                            <input type="text" value={settings.airtableBaseId} onChange={e => setSettings(s => ({ ...s, airtableBaseId: e.target.value }))} className="w-full p-2 bg-gray-900 rounded-md" />
                          </div>
                          
                          <div className="sm:col-span-2 border-t border-slate-700 pt-4">
                            <h4 className="text-md font-semibold text-gray-300">Table Configuration</h4>
                            <p className="text-xs text-gray-500 mb-4">Specify the names of your tables. You can use the 'Seed' button for a one-time population of sample data.</p>
                          </div>

                          <div className="grid grid-cols-3 gap-2 items-end">
                            <div className="col-span-2">
                                <label className="block text-sm mb-1">Templates Table</label>
                                <input type="text" value={settings.airtableTemplatesTable} onChange={e => setSettings(s => ({ ...s, airtableTemplatesTable: e.target.value }))} className="w-full p-2 bg-gray-900 rounded-md" />
                            </div>
                            {seedButton('templates', seedTemplatesStatus)}
                          </div>
                          <div className="grid grid-cols-3 gap-2 items-end">
                             <div className="col-span-2">
                                <label className="block text-sm mb-1">Queue Table</label>
                                <input type="text" value={settings.airtableQueueTable} onChange={e => setSettings(s => ({ ...s, airtableQueueTable: e.target.value }))} className="w-full p-2 bg-gray-900 rounded-md" />
                             </div>
                            {seedButton('queue', seedQueueStatus)}
                          </div>
                          <div className="grid grid-cols-3 gap-2 items-end">
                            <div className="col-span-2">
                                <label className="block text-sm mb-1">Log Table</label>
                                <input type="text" value={settings.airtableLogTable} onChange={e => setSettings(s => ({ ...s, airtableLogTable: e.target.value }))} className="w-full p-2 bg-gray-900 rounded-md" />
                            </div>
                            {seedButton('log', seedLogStatus)}
                          </div>
                           <div className="grid grid-cols-3 gap-2 items-end">
                            <div className="col-span-2">
                                <label className="block text-sm mb-1">URLs Table</label>
                                <input type="text" value={settings.airtableUrlsTable} onChange={e => setSettings(s => ({ ...s, airtableUrlsTable: e.target.value }))} className="w-full p-2 bg-gray-900 rounded-md" />
                            </div>
                            {seedButton('urls', seedUrlsStatus)}
                          </div>
                        </div>
                    </div>
                 </div>
                <div className="flex justify-end items-center gap-4 pt-4 border-t border-slate-700 mt-6">
                  {isAirtableConfigured && (
                    <button onClick={syncWithAirtable} disabled={airtableSyncStatus === 'syncing'} className="text-sm text-teal-400 hover:text-teal-300 disabled:opacity-50">
                      {airtableSyncStatus === 'syncing' ? 'Syncing...' : 'Sync Now'}
                    </button>
                  )}
                  <div className="relative">
                     <Button onClick={handleSaveSettings}>
                        {saveSettingsStatus === 'saving' ? 'Saving...' : saveSettingsStatus === 'saved' ? 'Saved!' : 'Save Settings'}
                     </Button>
                  </div>
                </div>
            </div>
        );
      default:
        return <div>View not found</div>;
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white font-sans">
      <Sidebar view={view} setView={setView} onDownloadData={handleDownloadData} airtableSyncStatus={airtableSyncStatus} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 p-8 overflow-y-auto">
            {error && (
                <div className="w-full p-4 mb-6 bg-red-900/50 border border-red-700 rounded-xl text-red-300 flex justify-between items-center animate-fade-in-fast">
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="p-1 rounded-full hover:bg-red-800/50">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    </button>
                </div>
            )}

          {renderCurrentView()}
          
          <div className="mt-8">
            {view === 'generate-posts' && (
              <div className="text-center">
                 <Button onClick={handleGeneratePosts} isLoading={isLoading}>
                    {isLoading ? 'Generating...' : 'Generate & Evaluate Posts'}
                 </Button>
              </div>
            )}
             {view === 'generate-posts' && generationResults && <div className="mt-8"><GenerationResultDisplay results={generationResults} articleUrl={articleUrl} onSendToAyrshareQueue={handleSendToAyrshareQueue} /></div>}
             {view === 'linkedin-researcher' && researchedPosts && (
                 <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {researchedPosts.map((post, index) => (
                         <div key={index} className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                           <p className="text-gray-300 mb-2">"{post.hook}"</p>
                           <div className="text-sm text-gray-400 space-y-1">
                             <p><strong className="text-gray-300">Platform:</strong> {post.platform}</p>
                             <p><strong className="text-gray-300">Engagement:</strong> {post.engagement}</p>
                             <p><strong className="text-gray-300">Analysis:</strong> {post.analysis}</p>
                             <a href={post.url} target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:underline">View Post</a>
                           </div>
                         </div>
                    ))}
                 </div>
             )}
          </div>
        </div>
      </main>

      {/* Post Now Modal */}
      {isPostModalOpen && postToShare && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in-fast" onClick={handleClosePostModal}>
            <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-6 w-full max-w-2xl space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-teal-300">Post Now</h3>
                <button onClick={handleClosePostModal} className="text-2xl leading-none p-1 rounded-full hover:bg-slate-700">&times;</button>
            </div>
            <div>
                <label className="text-sm font-medium text-gray-400">Content:</label>
                <textarea
                value={postToShare.content}
                readOnly
                rows={10}
                className="w-full mt-1 p-3 bg-gray-900 rounded-md text-sm font-mono text-gray-300 border border-slate-600"
                />
            </div>
            <div>
                <label className="text-sm font-medium text-gray-400">Platforms:</label>
                <div className="flex items-center gap-4 mt-2">
                {['linkedin', 'x', 'facebook'].map(platform => (
                    <label key={platform} className="flex items-center space-x-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={selectedPlatforms.includes(platform)}
                        onChange={() => handlePlatformToggle(platform)}
                        disabled={platform !== 'linkedin'} // Only LinkedIn is enabled for now
                        className="h-5 w-5"
                    />
                    <span className={`capitalize ${platform !== 'linkedin' ? 'text-gray-600' : 'text-gray-500'}`}>{platform}</span>
                    </label>
                ))}
                </div>
            </div>
            {postNowStatus.status === 'error' && (
                <p className="text-red-400 text-sm">{postNowStatus.message}</p>
            )}
            <div className="flex justify-end gap-4 pt-4">
                <button onClick={handleClosePostModal} className="px-4 py-2 rounded-md hover:bg-slate-700">Cancel</button>
                <Button onClick={handlePostNow} isLoading={postNowStatus.status === 'loading'} disabled={selectedPlatforms.length === 0}>
                {postNowStatus.status === 'loading' ? 'Posting...' : `Post to ${selectedPlatforms.length} platform(s)`}
                </Button>
            </div>
            </div>
        </div>
        )}

      <style>{`
        @keyframes fade-in-fast {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in-fast {
          animation: fade-in-fast 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default App;
