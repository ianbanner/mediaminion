import React, { useState, useCallback } from 'react';
import { generateSocialPosts, generateAndRankLinkedinPosts, generatePostsFromTemplates, SocialPost, TemplateGenerationResponse } from './services/geminiService';
import Button from './components/Button';
import PostCard from './components/PostCard';
import Sidebar, { View } from './components/Sidebar';

interface SavedTemplate {
  id: string;
  title: string;
  templateContent: string;
  generationInstructions: string;
}

const App: React.FC = () => {
  const [view, setView] = useState<View>('transcript');
  
  // State for 'transcript' view
  const [transcript, setTranscript] = useState<string>('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['LinkedIn', 'X', 'Facebook']);

  // State for 'inspirations' view
  const [linkedinExamples, setLinkedinExamples] = useState<string>('');
  
  // State for 'templates' view
  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<SavedTemplate | null>(null);
  const [templateContent, setTemplateContent] = useState<string>('');
  const [generationInstructions, setGenerationInstructions] = useState<string>('');
  const [currentGenerationTitle, setCurrentGenerationTitle] = useState<string | null>(null);


  // Common state
  const [posts, setPosts] = useState<SocialPost[] | null>(null);
  const [rankedPosts, setRankedPosts] = useState<SocialPost[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handlePlatformChange = (platform: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };
  
  const resetState = () => {
    setError(null);
    setPosts(null);
    setRankedPosts(null);
    setCurrentGenerationTitle(null);
    setIsLoading(true);
  }

  const handleGenerateFromTranscript = useCallback(async () => {
    if (!transcript.trim()) {
      setError('Please paste a transcript first.');
      return;
    }
    if (selectedPlatforms.length === 0) {
      setError('Please select at least one social media platform.');
      return;
    }

    resetState();
    try {
      const newPosts = await generateSocialPosts(transcript, selectedPlatforms);
      setPosts(newPosts);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred.';
      setError(errorMessage);
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [transcript, selectedPlatforms]);

  const handleGenerateFromInspirations = useCallback(async () => {
    if (!linkedinExamples.trim()) {
      setError('Please paste your LinkedIn examples first.');
      return;
    }
    
    resetState();
    try {
      const newPosts = await generateAndRankLinkedinPosts(linkedinExamples);
      setRankedPosts(newPosts);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred.';
      setError(errorMessage);
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [linkedinExamples]);

  const handleTemplateContentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSelectedTemplate(null); // Editing content means it's a new template
    setTemplateContent(event.target.value);
  }

  const handleInstructionsChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setSelectedTemplate(null); // Editing instructions means it's a new template
      setGenerationInstructions(event.target.value);
  }

  const handleSelectTemplate = (template: SavedTemplate) => {
      setSelectedTemplate(template);
      setTemplateContent(template.templateContent);
      setGenerationInstructions(template.generationInstructions);
  }

  const handleGenerateFromTemplates = useCallback(async () => {
    if (!templateContent.trim()) {
      setError('Please provide reference templates.');
      return;
    }
    if (!generationInstructions.trim()) {
      setError('Please provide generation instructions.');
      return;
    }
    
    resetState();
    try {
      const { title, posts: newPosts } = await generatePostsFromTemplates(templateContent, generationInstructions);
      setPosts(newPosts);
      setCurrentGenerationTitle(title);

      // If this was a new template (not a selected one), save it.
      if (!selectedTemplate) {
        const newTemplate: SavedTemplate = {
          id: `template-${Date.now()}`,
          title,
          templateContent,
          generationInstructions,
        };
        setSavedTemplates(prev => [...prev, newTemplate]);
      }

    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred.';
      setError(errorMessage);
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [templateContent, generationInstructions, selectedTemplate]);

  const renderCurrentView = () => {
    switch (view) {
      case 'transcript':
        return (
          <div className="w-full p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg space-y-6">
            <div>
              <label htmlFor="transcript" className="block text-sm font-medium text-gray-300 mb-2">
                Podcast Transcript
              </label>
              <textarea
                id="transcript"
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Paste your podcast transcript here..."
                rows={10}
                className="w-full p-4 bg-gray-900 border border-slate-600 rounded-md focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition text-gray-200 placeholder-gray-500"
                aria-label="Podcast Transcript Input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Select Platforms
              </label>
              <div className="flex flex-wrap gap-4">
                {['LinkedIn', 'X', 'Facebook'].map(platform => (
                  <div key={platform} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`platform-${platform}`}
                      checked={selectedPlatforms.includes(platform)}
                      onChange={() => handlePlatformChange(platform)}
                      className="h-4 w-4 rounded border-gray-500 bg-gray-700 text-teal-500 focus:ring-teal-600"
                    />
                    <label htmlFor={`platform-${platform}`} className="ml-2 text-gray-200">
                      {platform}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'inspirations':
        return (
          <div className="w-full p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg space-y-6">
            <div>
              <label htmlFor="inspirations" className="block text-sm font-medium text-gray-300 mb-2">
                Your Example LinkedIn Posts
              </label>
              <textarea
                id="inspirations"
                value={linkedinExamples}
                onChange={(e) => setLinkedinExamples(e.target.value)}
                placeholder="Paste your examples of great LinkedIn posts here, one per line..."
                rows={10}
                className="w-full p-4 bg-gray-900 border border-slate-600 rounded-md focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition text-gray-200 placeholder-gray-500"
                aria-label="LinkedIn Example Posts Input"
              />
            </div>
          </div>
        );
      case 'templates':
        return (
            <div className="w-full p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg space-y-6">
                <div>
                    <h4 className="text-lg font-semibold text-gray-300 mb-3">Saved Templates</h4>
                    {savedTemplates.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mb-6">
                        {savedTemplates.map(t => (
                            <button
                            key={t.id}
                            onClick={() => handleSelectTemplate(t)}
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${selectedTemplate?.id === t.id ? 'bg-teal-500 text-white shadow-md' : 'bg-slate-700 text-gray-300 hover:bg-slate-600'}`}
                            >
                            {t.title}
                            </button>
                        ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 mb-6 italic">Your saved templates will appear here once you create them.</p>
                    )}
                </div>

                <div className="border-t border-slate-700 pt-6 space-y-6">
                    <h4 className="text-lg font-semibold text-gray-300 -mt-2">
                        {selectedTemplate ? `Using Template: ${selectedTemplate.title}` : 'Create New Template'}
                    </h4>
                    <div>
                        <label htmlFor="templateContent" className="block text-sm font-medium text-gray-300 mb-2">
                          Reference Templates
                        </label>
                        <textarea
                            id="templateContent"
                            value={templateContent}
                            onChange={handleTemplateContentChange}
                            placeholder="Paste your reference posts here, one per line..."
                            rows={8}
                            className="w-full p-4 bg-gray-900 border border-slate-600 rounded-md focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition text-gray-200 placeholder-gray-500"
                            aria-label="Reference Templates Input"
                        />
                    </div>
                    <div>
                        <label htmlFor="instructions" className="block text-sm font-medium text-gray-300 mb-2">
                            Generation Instructions
                        </label>
                        <textarea
                            id="instructions"
                            value={generationInstructions}
                            onChange={handleInstructionsChange}
                            placeholder="e.g., 'Use the templates to create a post about the future of AI. Make the tone more casual and add a question at the end.'"
                            rows={6}
                            className="w-full p-4 bg-gray-900 border border-slate-600 rounded-md focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition text-gray-200 placeholder-gray-500"
                            aria-label="Generation Instructions Input"
                        />
                    </div>
                </div>
            </div>
        );
      default:
        return null;
    }
  };
  
  const getButtonProps = () => {
      switch (view) {
          case 'transcript': return { onClick: handleGenerateFromTranscript, text: 'Generate Posts' };
          case 'inspirations': return { onClick: handleGenerateFromInspirations, text: 'Generate & Rank Ideas' };
          case 'templates': return { onClick: handleGenerateFromTemplates, text: 'Generate from Templates' };
          default: return { onClick: () => {}, text: 'Generate' };
      }
  };

  const { onClick: handleGenerate, text: buttonText } = getButtonProps();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-slate-800 flex text-white font-sans">
      <Sidebar view={view} setView={setView} />
      <div className="flex-1 flex flex-col items-center justify-start p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-4xl mx-auto">
          <header className="text-center mb-8 md:mb-12">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-3 bg-clip-text text-transparent bg-gradient-to-r from-teal-300 to-blue-500">
                  Social Media Minion
              </h1>
              <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto">
                  Your AI assistant for powerful social media content creation.
              </p>
          </header>

          <main className="flex flex-col items-center gap-8">
            {renderCurrentView()}
            
            <Button onClick={handleGenerate} isLoading={isLoading}>
              {isLoading ? 'Generating...' : buttonText}
            </Button>

            <div className="mt-4 w-full min-h-[200px]">
              {error && (
                <div className="w-full p-4 bg-red-900/50 border border-red-700 rounded-lg text-center">
                  <p className="text-red-300">{error}</p>
                </div>
              )}

              {isLoading && (
                   <div className="text-center text-gray-400">The minion is hard at work... Please wait.</div>
              )}
              
              {posts && !isLoading && (view === 'transcript' || view === 'templates') && (
                <>
                  {currentGenerationTitle && <h2 className="text-2xl font-bold text-center mb-6 text-gray-200">Results for: <span className="text-teal-400">{currentGenerationTitle}</span></h2>}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {posts.map(post => (
                        <PostCard key={post.platform} platform={post.platform} content={post.content} />
                    ))}
                  </div>
                </>
              )}
              
              {rankedPosts && !isLoading && view === 'inspirations' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {rankedPosts.map((post, index) => (
                      <PostCard key={index} platform={post.platform} content={post.content} rank={index + 1} />
                  ))}
                </div>
              )}

              {!posts && !rankedPosts && !error && !isLoading && (
                   <div className="text-center text-gray-500">Your generated posts will appear here.</div>
              )}
            </div>
          </main>
          
          <footer className="text-center mt-12 text-gray-600 text-sm">
              Powered by Google Gemini
          </footer>
        </div>
      </div>
    </div>
  );
};

export default App;