

import React, { useState, useCallback, useEffect } from 'react';
// FIX: Import missing types, functions, and constants ('SocialPost', 'ResearchedPost', 'researchPopularPosts', 'scanContentForTemplates', 'LINKEDIN_GENERATION_EVALUATION_SCRIPT') to resolve reference errors.
import { generateAndEvaluatePosts, GenerationResults, TopPostAssessment, SocialPost, ResearchedPost, researchPopularPosts, scanContentForTemplates } from './services/geminiService';
import { getCoreScriptsForDownload, getTemplatesForDownload, formatPageDataForDownload, LINKEDIN_GENERATION_EVALUATION_SCRIPT } from './services/scriptService';
import { postToAyrshare } from './services/ayrshareService';
import { initialTemplates } from './services/templateData';
import Button from './components/Button';
import Sidebar from './components/Sidebar';
import GenerationResultDisplay from './components/GenerationResultDisplay';
import Scheduler from './components/Scheduler';


export interface SavedTemplate {
  id: string;
  title: string;
  template: string;
  example: string;
  instructions: string;
  dateAdded: string;
  usageCount: number;
  lastUsed: string;
}

export interface QueuedPost extends TopPostAssessment {
  id: string;
}

export interface SentPost {
  id: string;
  title: string;
  content: string;
  sentAt: string;
}


export interface ScheduledTask {
  id: string;
  name: string;
  type: 'generate-posts' | 'ayrshare-api';
  scheduleTime: string; // "HH:MM"
  enabled: boolean;
  lastRun: string | null;
  nextRun: number | null; // timestamp
  status: 'idle' | 'running' | 'success' | 'error';
  statusMessage: string | null;
}

export interface AppSettings {
  ayrshareApiKey: string;
}

type SaveStatus = 'idle' | 'saving' | 'saved';

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
  const [linkedinExamples, setLinkedinExamples] = useState<string>('');
  const [rankedPosts, setRankedPosts] = useState<SocialPost[] | null>(null);
  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>([]);
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
  const [settings, setSettings] = useState<AppSettings>({ ayrshareApiKey: '' });
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSettingsStatus, setSaveSettingsStatus] = useState<SaveStatus>('idle');
  
  // "Post Now" Modal State
  const [isPostModalOpen, setIsPostModalOpen] = useState<boolean>(false);
  const [postToShare, setPostToShare] = useState<QueuedPost | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['linkedin']);
  const [postNowStatus, setPostNowStatus] = useState<{ status: 'idle' | 'loading' | 'error', message: string | null }>({ status: 'idle', message: null });


  // Load all state from localStorage on initial mount
  useEffect(() => {
    try {
      const savedResearchScript = localStorage.getItem('linkedinResearchScript');
      if (savedResearchScript) setResearchScript(savedResearchScript);
      const savedGenScript = localStorage.getItem('linkedinGenerationScript');
      if (savedGenScript) setGenerationScript(savedGenScript);
      const savedAudience = localStorage.getItem('targetAudience');
      if (savedAudience) setTargetAudience(savedAudience);
      const savedSummary = localStorage.getItem('standardSummaryText');
      if (savedSummary) setStandardSummaryText(savedSummary);
      const savedSettingsJson = localStorage.getItem('appSettings');
      if (savedSettingsJson) setSettings(JSON.parse(savedSettingsJson));
      
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
  }, []);

  // Persist all data to localStorage automatically on any change
  useEffect(() => { localStorage.setItem('linkedinResearchScript', researchScript); }, [researchScript]);
  useEffect(() => { localStorage.setItem('linkedinGenerationScript', generationScript); }, [generationScript]);
  useEffect(() => { localStorage.setItem('targetAudience', targetAudience); }, [targetAudience]);
  useEffect(() => { localStorage.setItem('standardSummaryText', standardSummaryText); }, [standardSummaryText]);
  useEffect(() => { if (savedTemplates.length > 0) localStorage.setItem('savedTemplates', JSON.stringify(savedTemplates)); }, [savedTemplates]);
  useEffect(() => { localStorage.setItem('scheduledTasks', JSON.stringify(scheduledTasks)); }, [scheduledTasks]);
  useEffect(() => { localStorage.setItem('ayrshareLog', JSON.stringify(ayrshareLog)); }, [ayrshareLog]);
  useEffect(() => { if(generationResults) localStorage.setItem('generationResults', JSON.stringify(generationResults)); }, [generationResults]);
  useEffect(() => { localStorage.setItem('ayrshareQueue', JSON.stringify(ayrshareQueue)); }, [ayrshareQueue]);
  
  // Special handling for URL collection text input to avoid saving on every keystroke
  useEffect(() => {
    const handler = setTimeout(() => {
      const urls = urlCollectionInput.split('\n').map(u => u.trim()).filter(Boolean);
      setUrlCollection(urls);
      localStorage.setItem('urlCollection', JSON.stringify(urls));
    }, 500); // Debounce saving
    return () => clearTimeout(handler);
  }, [urlCollectionInput]);


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
        const newQueuedPost: QueuedPost = { ...topPost, id: `queued-${Date.now()}` };
        setAyrshareQueue(prev => [newQueuedPost, ...prev]);
        
        const newUrlCollection = currentUrls.slice(1);
        setUrlCollectionInput(newUrlCollection.join('\n'));

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
    
    // Use a function callback with setAyrshareQueue to get the most up-to-date state
    let postsToProcess: QueuedPost[] = [];
    setAyrshareQueue(currentQueue => {
        postsToProcess = [...currentQueue];
        return currentQueue; // No change yet
    });

    if (postsToProcess.length === 0) {
      updateTask(taskId, { status: 'success', statusMessage: 'No posts were queued, nothing to do.', lastRun: new Date().toISOString(), nextRun: calculateNextRun(task.scheduleTime) });
      return;
    }

    updateTask(taskId, { status: 'running', statusMessage: `Starting to post ${postsToProcess.length} items...` });
    
    const successfulPosts: QueuedPost[] = [];
    let firstError: string | null = null;

    for (const post of postsToProcess) {
      try {
        // By default, the scheduler posts to LinkedIn only
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
      const justSent: SentPost[] = successfulPosts.map(p => ({
        id: p.id.replace('queued-', 'sent-'),
        title: p.title,
        content: p.content,
        sentAt: now
      }));
      setAyrshareLog(prev => [...justSent, ...prev]);
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
  }, [scheduledTasks, urlCollectionInput, ayrshareQueue, savedTemplates, generationScript, targetAudience, standardSummaryText, settings.ayrshareApiKey]);

  const handleSaveSettings = () => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
    setSaveSettingsStatus('saving');
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
      setSavedTemplates(prev => prev.map(t => ({...t, usageCount: t.usageCount + 1, lastUsed: now})));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [articleUrl, articleText, savedTemplates, generationScript, targetAudience, standardSummaryText]);
  
  const handleSendToAyrshareQueue = (post: TopPostAssessment) => {
    const newQueuedPost: QueuedPost = {
        ...post,
        id: `queued-${Date.now()}-${Math.random()}`
    };
    setAyrshareQueue(prev => [newQueuedPost, ...prev]);
  };

  const handleUpdateQueuedPost = (id: string, newContent: string) => {
    setAyrshareQueue(prev => prev.map(p => p.id === id ? { ...p, content: newContent } : p));
  };
  
  const handleDeleteQueuedPost = (id: string) => {
    if (window.confirm("Are you sure?")) setAyrshareQueue(prev => prev.filter(p => p.id !== id));
  };
  
  const handleClearAyrshareQueue = useCallback(() => {
      if (window.confirm("Clear all posts from the queue?")) {
          setAyrshareQueue([]);
      }
  }, []);
  
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
            const sentPost: SentPost = {
                id: postToShare.id.replace('queued-', 'sent-'),
                title: postToShare.title,
                content: postToShare.content,
                sentAt: now
            };
            setAyrshareLog(prev => [sentPost, ...prev]);
            setAyrshareQueue(prev => prev.filter(p => p.id !== postToShare.id));
            handleClosePostModal();
        } else {
            setPostNowStatus({ status: 'error', message: response.message || 'An unknown error occurred from Ayrshare.' });
        }
    } catch (e) {
        setPostNowStatus({ status: 'error', message: e instanceof Error ? e.message : 'An unknown network error occurred.' });
    }
  };


  // ... (other handlers remain the same)
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
    const selected = scannedTemplates.filter(t => selectedScannedTemplateIds.includes(t.id));
    setSavedTemplates(prev => [...selected, ...prev]);
    setScanContent(''); setScannedTemplates(null); setSelectedScannedTemplateIds([]);
    setView('linkedin-library');
  };
  const handleScannedTemplateSelection = (id: string) => { setSelectedScannedTemplateIds(prev => prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]); };
  const handleSelectAllScanned = () => { if (scannedTemplates) setSelectedScannedTemplateIds(selectedScannedTemplateIds.length === scannedTemplates.length ? [] : scannedTemplates.map(t => t.id)); };
  const handleAddPostToReference = (content: string) => {
    setView('linkedin-library');
    setSavedTemplates(prev => {
        const newTemplates = [...prev];
        const index = newTemplates.findIndex(t => t.title.toLowerCase().includes('example') || t.title.toLowerCase().includes('pro method')) || 0;
        if (newTemplates.length > 0) {
            const template = {...newTemplates[index]};
            template.template = template.template ? `${template.template}\n\n---\n\n${content}` : content;
            newTemplates[index] = template;
            return newTemplates;
        }
        return prev;
    });
  };
  const handleAddNewTemplate = () => { setSavedTemplates(prev => [{ id: `template-${Date.now()}`, title: 'New Untitled Template', template: '', example: '', instructions: '', dateAdded: new Date().toLocaleDateString(), usageCount: 0, lastUsed: 'Never' }, ...prev]); };
  const handleUpdateTemplate = (id: string, field: keyof Omit<SavedTemplate, 'usageCount'|'dateAdded'|'lastUsed'|'id'>, value: string) => { setSavedTemplates(prev => prev.map(t => (t.id === id ? { ...t, [field]: value } : t))); };
  const handleDeleteTemplate = (id: string) => { if (window.confirm("Delete this template?")) setSavedTemplates(prev => prev.filter(t => t.id !== id)); };

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
          setAyrshareQueue([]);
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
                  <label className="flex items-center space-x-3"><input type="checkbox" checked={true} disabled className="h-5 w-5" /><span className="text-gray-300">LinkedIn</span></label>
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
                <p className="text-gray-400">Paste URLs below (one per line). The scheduler will pick the top one to generate posts. Data is saved automatically.</p>
                <div>
                    <label htmlFor="url-collection" className="block text-sm font-medium text-gray-300 mb-2">URL List ({urlCollection.length} saved)</label>
                    <textarea 
                        id="url-collection" 
                        value={urlCollectionInput} 
                        onChange={(e) => setUrlCollectionInput(e.target.value)} 
                        rows={15} 
                        className="w-full p-4 bg-gray-900 border border-slate-600 rounded-md focus:ring-2 focus:ring-teal-400 font-mono text-sm" 
                        placeholder="https://example.com/article-1&#10;https://example.com/article-2"
                    />
                </div>
            </div>
          );
      case 'ayrshare-queue':
        return (
          <div className="w-full p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-200">Ayrshare Queue</h2>
                  {ayrshareQueue.length > 0 && <button onClick={handleClearAyrshareQueue} className="text-sm text-red-400 hover:text-red-300">Clear All</button>}
            </div>
            <div className="space-y-4">
                {ayrshareQueue.length > 0 ? ( ayrshareQueue.map(post => (
                       <div key={post.id} className={`p-5 space-y-4 relative group bg-slate-800/50 border rounded-xl shadow-lg border-slate-700`}>
                           <div className="flex-grow space-y-3">
                               <div className="flex justify-between items-center">
                                   <h4 className="font-semibold text-teal-300">{post.title}</h4>
                                   <button onClick={() => handleDeleteQueuedPost(post.id)} className="p-1.5 hover:text-red-400"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                               </div>
                               <textarea value={post.content} onChange={(e) => handleUpdateQueuedPost(post.id, e.target.value)} rows={8} className="w-full p-2 bg-gray-900 border border-slate-600 rounded-md text-sm font-mono focus:ring-2 focus:ring-teal-400" />
                           </div>
                           <div className="flex justify-end items-center mt-3">
                                <button 
                                    onClick={() => handleOpenPostModal(post)}
                                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-teal-600 rounded-md hover:bg-teal-500"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                    Post Now
                                </button>
                            </div>
                        </div>
                    )) ) : ( <div className="text-center py-8 text-gray-500"><p>No posts in the queue. Go to "Generate Posts" to add some.</p></div> )}
            </div>
          </div>
        );
      case 'ayrshare-log':
        return (
            <div className="w-full p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg space-y-6">
                <h2 className="text-2xl font-bold text-gray-200">Ayrshare Sent Log</h2>
                <p className="text-gray-400">A history of all posts successfully sent to Ayrshare via the scheduler.</p>
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    {ayrshareLog.length > 0 ? ( ayrshareLog.map(post => (
                           <div key={post.id} className={`p-4 space-y-2 bg-slate-900/60 border rounded-xl border-slate-700`}>
                               <div className="flex justify-between items-center text-xs text-gray-400">
                                   <h4 className="font-semibold text-teal-300">{post.title}</h4>
                                   <span className="font-mono">{new Date(post.sentAt).toLocaleString()}</span>
                               </div>
                               <pre className="p-3 bg-gray-900 rounded-md text-sm font-mono whitespace-pre-wrap text-gray-300">{post.content}</pre>
                            </div>
                        )) ) : ( <div className="text-center py-8 text-gray-500"><p>No posts have been sent yet.</p></div> )}
                </div>
            </div>
        );
      case 'scheduler':
        return <Scheduler 
                    tasks={scheduledTasks}
                    onAddTask={addTask}
                    onUpdateTask={updateTask}
                    onDeleteTask={deleteTask}
                    isGoogleConnected={isGoogleConnected}
                    googleUserEmail={googleUserEmail}
                    isConnecting={isConnecting}
                    onGoogleConnect={handleGoogleConnect}
                    onGoogleDisconnect={handleGoogleDisconnect}
               />;
      case 'settings':
        return (
            <div className="w-full p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg space-y-6">
                <h2 className="text-2xl font-bold text-gray-200">Settings</h2>
                <div className="space-y-4 pt-4 border-t border-slate-700/50">
                    <div>
                        <label htmlFor="ayrshare-key" className="block text-sm font-medium text-gray-300 mb-2">Ayrshare API Key</label>
                        <p className="text-xs text-gray-500 mb-2">You can get your API key from your <a href="https://app.ayrshare.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:underline">Ayrshare Dashboard</a>.</p>
                        <input 
                            id="ayrshare-key" 
                            type="password" 
                            value={settings.ayrshareApiKey} 
                            onChange={(e) => setSettings(prev => ({...prev, ayrshareApiKey: e.target.value}))} 
                            placeholder="AY-..."
                            className="w-full p-3 bg-gray-900 border border-slate-600 rounded-md focus:ring-2 focus:ring-teal-400" 
                        />
                    </div>
                </div>
                <div className="flex justify-end mt-6">
                    <button
                        onClick={handleSaveSettings}
                        disabled={saveSettingsStatus !== 'idle'}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {saveSettingsStatus === 'saved' ? (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                Saved!
                            </>
                        ) : 'Save Settings'}
                    </button>
                </div>
            </div>
        );
      // ... (other cases remain the same)
      case 'linkedin-inspirations':
        return (
          <div className="w-full p-6 bg-slate-800/50 border border-slate-700 rounded-xl space-y-6">
            <label className="block text-sm mb-2">Your Example LinkedIn Posts</label>
            <textarea value={linkedinExamples} onChange={(e) => setLinkedinExamples(e.target.value)} rows={10} className="w-full p-4 bg-gray-900 border-slate-600 rounded-md" />
          </div>
        );
      case 'linkedin-researcher':
        return (
          <div className="w-full p-6 bg-slate-800/50 border border-slate-700 rounded-xl space-y-6">
            <label className="block text-sm mb-2">Post Research Script</label>
            <textarea value={researchScript} onChange={(e) => setResearchScript(e.target.value)} rows={8} className="w-full p-4 bg-gray-900 border-slate-600 rounded-md" />
          </div>
        );
      case 'linkedin-library':
        return (
            <div className="w-full space-y-8">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold">LinkedIn Template Library</h2>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setView('linkedin-library-scan')} className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-indigo-600 rounded-md hover:bg-indigo-500"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" /><path d="M10.5 5.5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3h-3a1 1 0 110-2h3v-3a1 1 0 011-1z" /></svg>Scan Content</button>
                        <button onClick={handleAddNewTemplate} className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-teal-600 rounded-md hover:bg-teal-500"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" /></svg>Add New Template</button>
                    </div>
                </div>
                <div className="w-full p-6 bg-slate-800/50 border border-slate-700 rounded-xl space-y-4">
                    <h3 className="text-xl font-bold">Library Dashboard</h3>
                    <p>Total Templates: <span className="font-bold text-teal-400">{savedTemplates.length}</span></p>
                    <div className="overflow-x-auto rounded-lg border border-slate-700">
                        <table className="min-w-full divide-y divide-slate-700">
                            <thead className="bg-slate-800">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs uppercase">Title</th>
                                    <th className="px-4 py-3 text-left text-xs uppercase">Date Added</th>
                                    <th className="px-4 py-3 text-left text-xs uppercase">Last Used</th>
                                    <th className="px-4 py-3 text-center text-xs uppercase">Usage</th>
                                </tr>
                            </thead>
                            <tbody className="bg-slate-900/50 divide-y divide-slate-700">
                                {savedTemplates.map(t => (
                                    <tr key={t.id} className="hover:bg-slate-800/60">
                                        <td className="px-4 py-3">{t.title}</td>
                                        <td className="px-4 py-3">{t.dateAdded}</td>
                                        <td className="px-4 py-3">{t.lastUsed}</td>
                                        <td className="px-4 py-3 text-center">{t.usageCount}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="space-y-6">
                    {savedTemplates.map(t => (
                        <div key={t.id} className="p-5 bg-slate-800/50 border border-slate-700 rounded-xl relative group">
                            <button onClick={() => handleDeleteTemplate(t.id)} className="absolute top-4 right-4 p-1.5 hover:text-red-400 opacity-0 group-hover:opacity-100"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                            <input type="text" value={t.title} onChange={e => handleUpdateTemplate(t.id, 'title', e.target.value)} className="w-full text-lg font-bold bg-transparent border-0 border-b-2 border-slate-700 focus:border-teal-400 p-0" />
                            <div className="grid md:grid-cols-2 gap-6 mt-4">
                                <div><label className="block text-sm mb-1">Template</label><textarea value={t.template} onChange={e => handleUpdateTemplate(t.id, 'template', e.target.value)} rows={7} className="w-full p-2 bg-gray-900 rounded-md text-sm font-mono" /></div>
                                <div><label className="block text-sm mb-1">Example</label><textarea value={t.example} onChange={e => handleUpdateTemplate(t.id, 'example', e.target.value)} rows={7} className="w-full p-2 bg-gray-900 rounded-md text-sm font-mono" /></div>
                            </div>
                            <div className="mt-2"><label className="block text-sm mb-1">Special Instructions</label><textarea value={t.instructions} onChange={e => handleUpdateTemplate(t.id, 'instructions', e.target.value)} rows={2} className="w-full p-2 bg-gray-900 rounded-md text-sm font-mono" /></div>
                            <div className="flex justify-between items-center text-xs text-gray-500 pt-3 border-t border-slate-700/50 mt-4"><span>Added: {t.dateAdded}</span><span className="font-semibold text-teal-400">Used: {t.usageCount} time{t.usageCount !== 1 ? 's' : ''}</span></div>
                        </div>
                    ))}
                </div>
            </div>
        );
       case 'linkedin-library-scan':
         return (
             <div className="w-full p-6 bg-slate-800/50 border border-slate-700 rounded-xl space-y-6">
                 {!scannedTemplates ? (
                     <>
                         <h2 className="text-2xl font-bold">Scan Content for New Templates</h2>
                         <p>Paste content... The AI will find templates.</p>
                         <div>
                             <label className="block text-sm mb-2">Content to Scan</label>
                             <textarea value={scanContent} onChange={(e) => setScanContent(e.target.value)} rows={15} className="w-full p-4 bg-gray-900 rounded-md" />
                         </div>
                         <div className="flex items-center justify-end gap-4">
                             <button onClick={() => setView('linkedin-library')}>Cancel</button>
                             <Button onClick={handleScanContent} isLoading={isLoading}>{isLoading ? 'Scanning...' : 'Scan Content'}</Button>
                         </div>
                     </>
                 ) : (
                     <>
                         <h2 className="text-2xl font-bold">Review Scanned Templates</h2>
                         <p>Select templates to add to your library.</p>
                         {scannedTemplates.length > 0 ? (
                            <>
                             <div className="flex items-center justify-between py-2 border-y border-slate-700">
                                 <label className="flex items-center space-x-3"><input type="checkbox" checked={selectedScannedTemplateIds.length === scannedTemplates.length} onChange={handleSelectAllScanned} className="h-5 w-5" /><span>Select All</span></label>
                                 <span>{selectedScannedTemplateIds.length} of {scannedTemplates.length} selected</span>
                             </div>
                             <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                                 {scannedTemplates.map(t => (
                                     <div key={t.id} className={`p-4 bg-slate-800/70 border rounded-lg ${selectedScannedTemplateIds.includes(t.id) ? 'border-teal-500' : 'border-slate-700'}`}>
                                         <label className="flex items-start space-x-4 cursor-pointer">
                                             <input type="checkbox" checked={selectedScannedTemplateIds.includes(t.id)} onChange={() => handleScannedTemplateSelection(t.id)} className="h-5 w-5 mt-1" />
                                             <div className="flex-grow">
                                                 <h4 className="font-bold text-teal-300">{t.title}</h4>
                                                 <pre className="mt-1 p-2 bg-gray-900 rounded-md text-xs font-mono">{t.template}</pre>
                                             </div>
                                         </label>
                                     </div>
                                 ))}
                             </div>
                            </>
                         ) : ( <div className="text-center py-8"><p>No templates found.</p></div> )}
                         <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-700">
                             <button onClick={() => { setScannedTemplates(null); setSelectedScannedTemplateIds([]); }}>Back to Scan</button>
                             <Button onClick={handleAddSelectedToLibrary} disabled={selectedScannedTemplateIds.length === 0}>Add Selected to Library</Button>
                         </div>
                     </>
                 )}
             </div>
         );
      case 'x':
      case 'facebook':
        return <div className="w-full p-10 bg-slate-800/50 border-slate-700 rounded-xl text-center"><h2>Coming Soon!</h2></div>
      default:
        return null;
    }
  };
  
// FIX: The component was missing a return statement and was not exported.
// I have completed the component's structure, added a main layout,
// and provided a default export to fix the compilation errors.
  const getButtonProps = () => {
    switch (view) {
      case 'generate-posts':
        return { onClick: handleGeneratePosts, text: 'Generate & Evaluate Posts' };
      case 'linkedin-researcher':
        return { onClick: handleResearchPosts, text: 'Research Popular Posts' };
      default:
        return null;
    }
  };

  const buttonProps = getButtonProps();

  return (
    <div className="flex h-screen bg-slate-900 text-gray-200 font-sans overflow-hidden">
      <Sidebar view={view} setView={setView} onDownloadData={handleDownloadData} />
      
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            {error && (
              <div className="p-4 mb-4 text-sm text-red-400 bg-red-900/50 rounded-lg border border-red-800" role="alert">
                <span className="font-medium">Error:</span> {error}
              </div>
            )}
            {renderCurrentView()}
          </div>
        </main>
        
        <footer className="flex-shrink-0 p-6 lg:px-8 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between">
          <div className="text-sm text-gray-500">Social Media Minion v1.0</div>
          {buttonProps && (
            <Button onClick={buttonProps.onClick} isLoading={isLoading} disabled={isLoading}>
              {isLoading ? 'Processing...' : buttonProps.text}
            </Button>
          )}
        </footer>
      </div>

      {((generationResults && view === 'generate-posts') || (researchedPosts && view === 'linkedin-researcher')) && (
        <aside className="w-1/2 p-6 lg:p-8 overflow-y-auto bg-slate-900/60 border-l border-slate-800 flex-shrink-0">
          {generationResults && view === 'generate-posts' && (
            <GenerationResultDisplay 
              results={generationResults} 
              articleUrl={articleUrl} 
              onSendToAyrshareQueue={handleSendToAyrshareQueue} 
            />
          )}
          {researchedPosts && view === 'linkedin-researcher' && (
            <div className="w-full space-y-4">
              <h2 className="text-2xl font-bold text-gray-200">Research Results</h2>
              {researchedPosts.map((post, index) => (
                <div key={index} className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl">
                    <p className="font-bold text-teal-400">"{post.hook}"</p>
                    <p className="mt-2 text-sm text-gray-300">{post.analysis}</p>
                    <div className="mt-3 flex justify-between items-center text-xs text-gray-400">
                        <span>{post.platform} - {post.engagement}</span>
                        <a href={post.url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">View Post</a>
                    </div>
                </div>
              ))}
            </div>
          )}
        </aside>
      )}
      
      {isPostModalOpen && postToShare && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={handleClosePostModal}>
                <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-6 w-full max-w-lg space-y-4" onClick={e => e.stopPropagation()}>
                    <h3 className="text-xl font-bold text-teal-300">Post "{postToShare.title}" Now</h3>
                    
                    <div>
                        <label className="block text-sm mb-2 font-medium text-gray-300">Select platforms to post to:</label>
                        <div className="flex gap-4 p-4 bg-gray-900 rounded-md">
                            {['linkedin', 'twitter', 'facebook'].map(platform => (
                                <label key={platform} className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={selectedPlatforms.includes(platform)}
                                        onChange={() => handlePlatformToggle(platform)}
                                        className="h-5 w-5 rounded bg-gray-700 border-gray-600 text-teal-500 focus:ring-teal-500"
                                    />
                                    <span className="capitalize">{platform === 'twitter' ? 'X' : platform}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <pre className="p-3 bg-gray-900 rounded-md text-sm font-mono whitespace-pre-wrap text-gray-300 max-h-48 overflow-y-auto">{postToShare.content}</pre>
                    
                    {postNowStatus.status === 'error' && (
                        <div className="p-3 text-sm text-red-400 bg-red-900/50 rounded-lg border border-red-800">
                            {postNowStatus.message}
                        </div>
                    )}

                    <div className="flex justify-end gap-4 pt-4">
                        <button onClick={handleClosePostModal} className="px-4 py-2 rounded-md hover:bg-slate-700">Cancel</button>
                        <Button 
                            onClick={handlePostNow} 
                            isLoading={postNowStatus.status === 'loading'} 
                            disabled={selectedPlatforms.length === 0 || postNowStatus.status === 'loading'}
                        >
                            {postNowStatus.status === 'loading' ? 'Sending...' : 'Send Post'}
                        </Button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default App;
