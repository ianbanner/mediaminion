
import React, { useState, useCallback, useEffect } from 'react';
import { generateAndEvaluatePosts, generateAndRankLinkedinPosts, researchPopularPosts, scanContentForTemplates, SocialPost, ResearchedPost, GenerationResults, TopPostAssessment } from './services/geminiService';
import { getCoreScriptsForDownload, getTemplatesForDownload, LINKEDIN_GENERATION_EVALUATION_SCRIPT, formatPageDataForDownload } from './services/scriptService';
import { initialTemplates } from './services/templateData';
import Button from './components/Button';
import Sidebar from './components/Sidebar';
import GenerationResultDisplay from './components/GenerationResultDisplay';


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

export interface PlannedPost extends TopPostAssessment {
  id: string;
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
  
  // "Working copy" state
  const [articleUrl, setArticleUrl] = useState<string>('');
  const [articleText, setArticleText] = useState<string>('');
  const [generationScript, setGenerationScript] = useState<string>(LINKEDIN_GENERATION_EVALUATION_SCRIPT);
  const [targetAudience, setTargetAudience] = useState<string>(DEFAULT_AUDIENCE);
  const [standardSummaryText, setStandardSummaryText] = useState<string>(DEFAULT_SUMMARY_TEXT);
  const [generationResults, setGenerationResults] = useState<GenerationResults | null>(null);
  const [selectedGeneratedPosts, setSelectedGeneratedPosts] = useState<TopPostAssessment[]>([]);
  const [plannedPosts, setPlannedPosts] = useState<PlannedPost[]>([]);
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
  
  // "Stored" state for permanent page data
  const [storedGenerationResults, setStoredGenerationResults] = useState<GenerationResults | null>(null);
  const [storedPlannedPosts, setStoredPlannedPosts] = useState<PlannedPost[]>([]);
  
  // Common state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  // Load state from localStorage on initial mount
  useEffect(() => {
    // Load non-page data (scripts, settings, etc.)
    const savedResearchScript = localStorage.getItem('linkedinResearchScript');
    if (savedResearchScript) setResearchScript(savedResearchScript);
    const savedGenScript = localStorage.getItem('linkedinGenerationScript');
    if (savedGenScript) setGenerationScript(savedGenScript);
    const savedAudience = localStorage.getItem('targetAudience');
    if (savedAudience) setTargetAudience(savedAudience);
    const savedSummary = localStorage.getItem('standardSummaryText');
    if (savedSummary) setStandardSummaryText(savedSummary);
    
    // Google Connection status
    const savedGoogleConnection = localStorage.getItem('isGoogleConnected');
    const savedGoogleUser = localStorage.getItem('googleUserEmail');
    if (savedGoogleConnection === 'true' && savedGoogleUser) {
        setIsGoogleConnected(true);
        setGoogleUserEmail(savedGoogleUser);
    }

    // Load stored page data and initialize working copies
    try {
      const savedTemplatesJson = localStorage.getItem('savedTemplates');
      setSavedTemplates(savedTemplatesJson ? JSON.parse(savedTemplatesJson) : initialTemplates);

      const storedGenResultsJson = localStorage.getItem('storedGenerationResults');
      if (storedGenResultsJson) {
        const parsed = JSON.parse(storedGenResultsJson);
        setStoredGenerationResults(parsed);
        setGenerationResults(parsed); // Initialize working copy
      }
      
      const storedPlannedPostsJson = localStorage.getItem('storedPlannedPosts');
      if (storedPlannedPostsJson) {
        const parsed = JSON.parse(storedPlannedPostsJson);
        setStoredPlannedPosts(parsed);
        setPlannedPosts(parsed); // Initialize working copy
      }

    } catch (e) {
      console.error("Failed to parse saved data from localStorage", e);
      setSavedTemplates(initialTemplates);
    }
  }, []);

  // Persist non-page data to localStorage automatically
  useEffect(() => { localStorage.setItem('linkedinResearchScript', researchScript); }, [researchScript]);
  useEffect(() => { localStorage.setItem('linkedinGenerationScript', generationScript); }, [generationScript]);
  useEffect(() => { localStorage.setItem('targetAudience', targetAudience); }, [targetAudience]);
  useEffect(() => { localStorage.setItem('standardSummaryText', standardSummaryText); }, [standardSummaryText]);
  useEffect(() => { if (savedTemplates.length > 0) localStorage.setItem('savedTemplates', JSON.stringify(savedTemplates)); }, [savedTemplates]);
  
  const showSaveConfirmation = () => {
    setSaveStatus('saving');
    setTimeout(() => {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
    }, 200);
  };
  
  const handleStoreGenerationResults = () => {
    localStorage.setItem('storedGenerationResults', JSON.stringify(generationResults));
    setStoredGenerationResults(generationResults);
    showSaveConfirmation();
  };
  const handleStorePlannedPosts = () => {
    localStorage.setItem('storedPlannedPosts', JSON.stringify(plannedPosts));
    setStoredPlannedPosts(plannedPosts);
    showSaveConfirmation();
  };

  const handleGeneratePosts = useCallback(async () => {
    if (!articleUrl.trim() && !articleText.trim()) {
      setError('Please provide an article URL or paste the article text.');
      return;
    }
    setError(null);
    setGenerationResults(null);
    setSelectedGeneratedPosts([]);
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
  
  const handleMoveToPlannedPosts = () => {
    const newPlannedPosts: PlannedPost[] = selectedGeneratedPosts.map(post => ({
        ...post, id: `planned-${Date.now()}-${Math.random()}`
    }));
    setPlannedPosts(prev => [...prev, ...newPlannedPosts]);
    setSelectedGeneratedPosts([]);
    setView('planned-posts');
  };

  const handleUpdatePlannedPost = (id: string, newContent: string) => {
    setPlannedPosts(prev => prev.map(p => p.id === id ? { ...p, content: newContent } : p));
  };
  
  const handleDeletePlannedPost = (id: string) => {
    if (window.confirm("Are you sure?")) setPlannedPosts(prev => prev.filter(p => p.id !== id));
  };
  
  const handleClearAllPlannedPosts = useCallback(() => {
      if (window.confirm("Clear all planned posts?")) {
          setPlannedPosts([]);
      }
  }, []);

  const handleGenerateFromInspirations = useCallback(async () => {
    if (!linkedinExamples.trim()) { setError('Please paste examples.'); return; }
    setError(null); setRankedPosts(null); setIsLoading(true);
    try {
      setRankedPosts(await generateAndRankLinkedinPosts(linkedinExamples));
    } catch (e) { setError(e instanceof Error ? e.message : 'An error occurred.'); } 
    finally { setIsLoading(false); }
  }, [linkedinExamples]);

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

  const handleScannedTemplateSelection = (id: string) => {
      setSelectedScannedTemplateIds(prev => prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]);
  };

  const handleSelectAllScanned = () => {
    if (scannedTemplates) setSelectedScannedTemplateIds(selectedScannedTemplateIds.length === scannedTemplates.length ? [] : scannedTemplates.map(t => t.id));
  };

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
  
  const handleAddNewTemplate = () => {
    const newTemplate: SavedTemplate = { id: `template-${Date.now()}`, title: 'New Untitled Template', template: '', example: '', instructions: '', dateAdded: new Date().toLocaleDateString(), usageCount: 0, lastUsed: 'Never' };
    setSavedTemplates(prev => [newTemplate, ...prev]);
  };
  
  const handleUpdateTemplate = (id: string, field: keyof Omit<SavedTemplate, 'usageCount'|'dateAdded'|'lastUsed'|'id'>, value: string) => {
    setSavedTemplates(prev => prev.map(t => (t.id === id ? { ...t, [field]: value } : t)));
  };

  const handleDeleteTemplate = (id: string) => {
    if (window.confirm("Delete this template?")) setSavedTemplates(prev => prev.filter(t => t.id !== id));
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

  const handleGoogleDisconnect = () => {
      setIsGoogleConnected(false);
      setGoogleUserEmail('');
      localStorage.removeItem('isGoogleConnected');
      localStorage.removeItem('googleUserEmail');
  };

  const handleScheduleWithGoogle = () => {
      if (window.confirm(`This will schedule ${plannedPosts.length} posts to your Google Calendar and clear the planner. Continue?`)) {
          // In a real app, this would make API calls to Google Calendar.
          // Here, we'll just log it and clear the posts.
          console.log("Scheduling posts:", plannedPosts);
          alert(`${plannedPosts.length} posts have been scheduled to Google Calendar.`);
          setPlannedPosts([]);
          setStoredPlannedPosts([]);
          localStorage.removeItem('storedPlannedPosts');
      }
  };


  const handleDownloadData = () => {
    const coreScripts = getCoreScriptsForDownload(generationScript);
    const templateScripts = getTemplatesForDownload(savedTemplates);
    const pageData = formatPageDataForDownload(storedGenerationResults, storedPlannedPosts);
    const content = `${coreScripts}\n\n// ===== LinkedIn Template Library =====\n\n${templateScripts}\n\n${pageData}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'social-media-minion-data.txt';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderCurrentView = () => {
    const storeButton = (handler: () => void) => (
      <div className="flex justify-end mt-6">
        <button
          onClick={handler}
          disabled={saveStatus !== 'idle'}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {saveStatus === 'saved' ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                Content Stored!
              </>
          ) : 'Store Current Content'}
        </button>
      </div>
    );

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
            {generationResults && storeButton(handleStoreGenerationResults)}
          </div>
        );
      case 'planned-posts':
        return (
          <div className="w-full p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-200">Planned Posts</h2>
                <div className="flex items-center gap-4">
                   {isGoogleConnected && plannedPosts.length > 0 && (
                        <Button onClick={handleScheduleWithGoogle}>Schedule with Google Calendar</Button>
                   )}
                  {plannedPosts.length > 0 && <button onClick={handleClearAllPlannedPosts} className="text-sm text-red-400 hover:text-red-300">Clear All</button>}
                </div>
            </div>
            {!isGoogleConnected && plannedPosts.length > 0 && (
                <div className="p-4 bg-yellow-900/50 border border-yellow-700 rounded-lg text-center">
                    <p className="text-yellow-300">Connect to Google Calendar in the <button onClick={() => setView('scheduler')} className="font-bold underline">Scheduler</button> to schedule these posts.</p>
                </div>
            )}
            <div className="space-y-4">
                {plannedPosts.length > 0 ? ( plannedPosts.map(post => (
                       <div key={post.id} className={`p-5 space-y-4 relative group bg-slate-800/50 border rounded-xl shadow-lg border-slate-700`}>
                           <div className="flex-grow space-y-3">
                               <div className="flex justify-between items-center">
                                   <h4 className="font-semibold text-teal-300">{post.title}</h4>
                                   <button onClick={() => handleDeletePlannedPost(post.id)} className="p-1.5 hover:text-red-400"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                               </div>
                               <textarea value={post.content} onChange={(e) => handleUpdatePlannedPost(post.id, e.target.value)} rows={8} className="w-full p-2 bg-gray-900 border border-slate-600 rounded-md text-sm font-mono focus:ring-2 focus:ring-teal-400" />
                           </div>
                        </div>
                    )) ) : ( <div className="text-center py-8 text-gray-500"><p>No posts planned yet. Generate some posts and move them here to begin scheduling.</p></div> )}
            </div>
            {plannedPosts.length > 0 && storeButton(handleStorePlannedPosts)}
          </div>
        );
      case 'scheduler':
        return (
            <div className="w-full p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg space-y-6 text-center">
                <h2 className="text-2xl font-bold text-gray-200">Scheduler</h2>
                <p className="text-gray-400">Connect to your Google Calendar to schedule posts directly.</p>
                <div className="pt-6">
                    {isGoogleConnected ? (
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-3 p-3 bg-green-900/50 border border-green-700 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <span className="text-green-300">Connected as {googleUserEmail}</span>
                            </div>
                             <p className="text-gray-400 text-sm">You can now schedule posts from the "Planned Posts" page.</p>
                             <button onClick={handleGoogleDisconnect} className="text-sm text-red-400 hover:text-red-300">Disconnect</button>
                        </div>
                    ) : (
                         <Button onClick={handleGoogleConnect} isLoading={isConnecting}>
                            {isConnecting ? 'Connecting...' : 'Connect to Google Calendar'}
                         </Button>
                    )}
                </div>
            </div>
        );
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
      case 'stored-data':
        return (
          <div className="w-full p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg space-y-6">
            <h2 className="text-2xl font-bold text-gray-200">Stored Page Data</h2>
            <p className="text-gray-400">This is a read-only view of your last saved content for each main page. Use the "Store Current Content" button on each page to update this data.</p>
            <details className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
              <summary className="cursor-pointer font-semibold text-lg text-teal-300">Stored Generation Results</summary>
              <pre className="text-xs font-mono whitespace-pre-wrap mt-4 bg-gray-900 p-3 rounded-md overflow-x-auto">
                {storedGenerationResults ? JSON.stringify(storedGenerationResults, null, 2) : 'No generation results stored.'}
              </pre>
            </details>
            <details className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
              <summary className="cursor-pointer font-semibold text-lg text-teal-300">Stored Planned Posts</summary>
              <pre className="text-xs font-mono whitespace-pre-wrap mt-4 bg-gray-900 p-3 rounded-md overflow-x-auto">
                {storedPlannedPosts.length > 0 ? JSON.stringify(storedPlannedPosts, null, 2) : 'No planned posts stored.'}
              </pre>
            </details>
          </div>
        );
      case 'x':
      case 'facebook':
        return <div className="w-full p-10 bg-slate-800/50 border-slate-700 rounded-xl text-center"><h2>Coming Soon!</h2></div>
      default:
        return null;
    }
  };
  
  const getButtonProps = () => {
      switch (view) {
          case 'generate-posts': return { onClick: handleGeneratePosts, text: 'Generate & Evaluate Posts' };
          case 'linkedin-inspirations': return { onClick: handleGenerateFromInspirations, text: 'Generate & Rank Ideas' };
          case 'linkedin-researcher': return { onClick: handleResearchPosts, text: 'Research Posts' };
          default: return { onClick: () => {}, text: 'Generate', disabled: true };
      }
  };

  const { onClick: handleGenerate, text: buttonText, disabled: isButtonDisabled } = getButtonProps();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-slate-800 flex text-white font-sans">
      <Sidebar view={view} setView={setView} onDownloadData={handleDownloadData} />
      <div className="flex-1 flex flex-col items-center justify-start p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-4xl mx-auto">
          <header className="text-center mb-8 md:mb-12">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-teal-300 to-blue-500">Social Media Minion</h1>
              <p className="text-lg sm:text-xl text-gray-400">Your AI assistant for powerful social media content creation.</p>
          </header>
          <main className="flex flex-col items-center gap-8">
            {renderCurrentView()}
            {!isButtonDisabled && <Button onClick={handleGenerate} isLoading={isLoading}>{isLoading ? 'Generating...' : buttonText}</Button>}
            <div className="mt-4 w-full min-h-[200px]">
              {error && <div className="w-full p-4 bg-red-900/50 border border-red-700 rounded-lg text-center"><p>{error}</p></div>}
              {isLoading && <div className="text-center text-gray-400">The minion is hard at work... Please wait.</div>}
              {generationResults && !isLoading && view === 'generate-posts' && <GenerationResultDisplay results={generationResults} articleUrl={articleUrl} selectedPosts={selectedGeneratedPosts} onSelectionChange={setSelectedGeneratedPosts} onMoveToPlanned={handleMoveToPlannedPosts} />}
              {rankedPosts && !isLoading && view === 'linkedin-inspirations' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {rankedPosts.map((post, index) => <GenerationResultDisplay.PostCard key={index} platform={post.platform} content={post.content} rank={index + 1} />)}
                </div>
              )}
              {researchedPosts && !isLoading && view === 'linkedin-researcher' && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-center mb-4">Research Results</h3>
                  {researchedPosts.map((post, index) => (
                    <div key={index} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-5 space-y-4">
                      <div className="flex justify-between items-center text-xs font-mono"><span>{post.platform}</span><span className="font-semibold text-teal-400">{post.engagement}</span></div>
                      <blockquote className="border-l-4 border-slate-600 pl-4">{post.hook}</blockquote>
                      <div>
                          <p className="text-sm font-semibold mb-1">Why it worked:</p>
                          <p className="italic">{post.analysis}</p>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-700/50 mt-4">
                        <button onClick={() => handleAddPostToReference(post.hook)} className="text-sm font-semibold text-teal-400 hover:text-teal-300">+ Add to Template Reference</button>
                        <a href={post.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300">View Original Post<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg></a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>
          <footer className="text-center mt-12 text-gray-600 text-sm">Powered by Google Gemini</footer>
        </div>
      </div>
    </div>
  );
};
export default App;
