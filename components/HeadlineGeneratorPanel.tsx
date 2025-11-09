import React, { useState, useEffect } from 'react';
import { GeneratedHeadline } from '../types.ts';
import Button from './Button.tsx';

interface HeadlineGeneratorPanelProps {
  evalCriteria: string;
  onEvalCriteriaChange: (criteria: string) => void;
  onGenerateHeadlines: () => void;
  isLoading: boolean;
  headlines: GeneratedHeadline[] | null;
  onReevaluate: (id: string, newText: string) => void;
  onGenerateArticle: (headline: GeneratedHeadline) => void;
  sourceType: 'url' | 'text';
  onSourceTypeChange: (type: 'url' | 'text') => void;
  sourceUrl: string;
  onSourceUrlChange: (url: string) => void;
  sourceText: string;
  onSourceTextChange: (text: string) => void;
  generationScript: string;
  onGenerationScriptChange: (script: string) => void;
  onGenerateIdeas: () => void;
  articleIdeas: string[] | null;
  selectedArticleIdea: string | null;
  onSelectArticleIdea: (idea: string) => void;
}

const HeadlineCard: React.FC<{
  headline: GeneratedHeadline;
  onReevaluate: (id: string, newText: string) => void;
  onGenerateArticle: (headline: GeneratedHeadline) => void;
}> = ({ headline, onReevaluate, onGenerateArticle }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedText, setEditedText] = useState(headline.headline);
    
    useEffect(() => {
        setEditedText(headline.headline);
    }, [headline.headline]);

    const handleSave = () => {
        onReevaluate(headline.id, editedText);
        setIsEditing(false);
    };
    
    return (
        <div className="p-4 bg-slate-900/50 border border-slate-700 rounded-lg flex flex-col gap-3 transition-shadow hover:shadow-lg hover:shadow-teal-500/10">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                    {isEditing ? (
                        <textarea 
                            value={editedText}
                            onChange={(e) => setEditedText(e.target.value)}
                            rows={2}
                            className="w-full p-2 bg-gray-800 rounded-md text-sm text-white"
                            autoFocus
                        />
                    ) : (
                        <p className="font-semibold text-gray-200 text-lg">{headline.headline}</p>
                    )}
                     <p className="text-xs text-gray-400 italic">"{headline.reasoning}"</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-2xl font-bold text-teal-400 w-20 text-center">{headline.score}/100</span>
                    <div className="flex flex-col gap-2">
                        {isEditing ? (
                            <>
                                <button onClick={handleSave} className="px-3 py-1 text-xs font-semibold rounded-md bg-green-600 text-white hover:bg-green-500">Save & Re-evaluate</button>
                                <button onClick={() => { setIsEditing(false); setEditedText(headline.headline); }} className="px-3 py-1 text-xs font-semibold rounded-md bg-gray-600 text-white hover:bg-gray-500">Cancel</button>
                            </>
                        ) : (
                            <>
                                <button onClick={() => setIsEditing(true)} className="px-3 py-1 text-xs font-semibold rounded-md bg-slate-600 text-white hover:bg-slate-500">Edit</button>
                                <button onClick={() => onGenerateArticle(headline)} className="px-3 py-1 text-xs font-semibold rounded-md bg-indigo-600 text-white hover:bg-indigo-500">Generate Article</button>
                            </>
                        )}
                    </div>
                </div>
            </div>
           
        </div>
    );
};

const HeadlineGeneratorPanel: React.FC<HeadlineGeneratorPanelProps> = ({
  evalCriteria,
  onEvalCriteriaChange,
  onGenerateHeadlines,
  isLoading,
  headlines,
  onReevaluate,
  onGenerateArticle,
  sourceType,
  onSourceTypeChange,
  sourceUrl,
  onSourceUrlChange,
  sourceText,
  onSourceTextChange,
  generationScript,
  onGenerationScriptChange,
  onGenerateIdeas,
  articleIdeas,
  selectedArticleIdea,
  onSelectArticleIdea
}) => {
    const isSourceProvided = sourceType === 'url' ? sourceUrl.trim() !== '' : sourceText.trim() !== '';

    return (
    <div className="space-y-8 animate-fade-in">
        <h1 className="text-3xl font-bold">Article Idea & Headline Generator</h1>

        {/* --- Step 1: Idea Generation --- */}
        <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg space-y-6">
            <h2 className="text-xl font-bold text-teal-300">Step 1: Generate Article Ideas</h2>
            <p className="text-sm text-gray-400">Start by providing a source article (URL or text). The AI will analyze it and generate 10 new, related article ideas for you to choose from.</p>
             <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Source Article</label>
                <div className="flex items-center space-x-4 mb-3">
                    <button onClick={() => onSourceTypeChange('url')} className={`px-4 py-2 rounded-md font-semibold ${sourceType === 'url' ? 'bg-teal-600 text-white' : 'bg-gray-700 text-gray-300'}`}>URL</button>
                    <button onClick={() => onSourceTypeChange('text')} className={`px-4 py-2 rounded-md font-semibold ${sourceType === 'text' ? 'bg-teal-600 text-white' : 'bg-gray-700 text-gray-300'}`}>Text</button>
                </div>
                {sourceType === 'url' ? (
                    <input type="text" value={sourceUrl} onChange={(e) => onSourceUrlChange(e.target.value)} placeholder="Enter URL for the source article..." className="w-full p-3 bg-gray-900 border border-slate-600 rounded-md focus:ring-2 focus:ring-teal-400" />
                ) : (
                    <textarea value={sourceText} onChange={(e) => onSourceTextChange(e.target.value)} rows={8} placeholder="Paste the source text here..." className="w-full p-3 bg-gray-900 border border-slate-600 rounded-md focus:ring-2 focus:ring-teal-400" />
                )}
            </div>
            <div className="text-center">
                 <Button onClick={onGenerateIdeas} isLoading={isLoading && !articleIdeas} disabled={!isSourceProvided}>
                    {isLoading && !articleIdeas ? 'Your Minion Is Working' : 'Generate 10 Article Ideas'}
                 </Button>
            </div>
            
            {articleIdeas && (
                <div className="pt-4 border-t border-slate-700/50 space-y-3">
                    <h3 className="text-lg font-semibold text-gray-300">Select an Idea to Develop</h3>
                    <div className="space-y-2">
                        {articleIdeas.map((idea, index) => (
                            <button key={index} onClick={() => onSelectArticleIdea(idea)} className={`w-full text-left p-3 border rounded-lg transition-colors ${selectedArticleIdea === idea ? 'bg-teal-600/20 border-teal-500' : 'bg-slate-800 hover:bg-slate-700/50 border-slate-700'}`}>
                                {idea}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
        
        {/* --- Step 2: Headline Generation (conditional) --- */}
        {selectedArticleIdea && (
            <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg space-y-6 animate-fade-in">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-teal-300">Step 2: Generate Headlines for Your Chosen Idea</h2>
                    <button onClick={() => onSelectArticleIdea('')} className="text-sm text-gray-400 hover:text-white">&larr; Choose a different idea</button>
                </div>

                 <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Your Chosen Article Idea</label>
                    <p className="p-3 bg-gray-900 border border-slate-600 rounded-md text-gray-200">{selectedArticleIdea}</p>
                </div>
                
                <div>
                    <h3 className="text-lg font-semibold text-gray-300 mb-2">Advanced: AI Headline Evaluation Criteria</h3>
                    <textarea value={evalCriteria} onChange={(e) => onEvalCriteriaChange(e.target.value)} rows={15} className="w-full p-3 bg-gray-900 rounded-md text-sm font-mono whitespace-pre-wrap text-gray-300 border border-slate-600 focus:ring-2 focus:ring-teal-400"/>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-gray-300 mb-2">Advanced: AI Headline Generation Instructions</h3>
                    <textarea value={generationScript} onChange={(e) => onGenerationScriptChange(e.target.value)} rows={15} className="w-full p-3 bg-gray-900 rounded-md text-sm font-mono whitespace-pre-wrap text-gray-300 border border-slate-600 focus:ring-2 focus:ring-teal-400"/>
                </div>
                
                <div className="text-center pt-4 border-t border-slate-700/50">
                    <Button onClick={onGenerateHeadlines} isLoading={isLoading && !!selectedArticleIdea && !headlines}>
                        {isLoading && !!selectedArticleIdea && !headlines ? 'Your Minion Is Working' : 'Generate 20 Headlines'}
                    </Button>
                </div>
            </div>
        )}

        {/* --- Results --- */}
        {headlines && (
            <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg space-y-4">
                <h2 className="text-2xl font-bold text-gray-200">Generated Headlines</h2>
                 <div className="space-y-4">
                    {headlines.map(headline => (
                        <HeadlineCard key={headline.id} headline={headline} onReevaluate={onReevaluate} onGenerateArticle={onGenerateArticle} />
                    ))}
                </div>
            </div>
        )}
    </div>
    );
};

export default HeadlineGeneratorPanel;