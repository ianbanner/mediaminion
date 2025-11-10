import React from 'react';
import { ArticleIdea } from '../types.ts';
import Button from './Button.tsx';

const ArticleIdeaCard: React.FC<{
    idea: ArticleIdea;
    onSelect: (idea: ArticleIdea) => void;
}> = ({ idea, onSelect }) => {
    return (
        <div className="p-6 bg-slate-900/50 border border-slate-700 rounded-lg flex flex-col gap-4 transition-shadow hover:shadow-lg hover:shadow-teal-500/10">
            <h3 className="font-bold text-lg text-teal-300">{idea.title}</h3>
            <div>
                <h4 className="text-sm font-semibold text-gray-400 mb-1">Main Point</h4>
                <p className="text-sm text-gray-300">{idea.summary}</p>
            </div>
            <div>
                <h4 className="text-sm font-semibold text-gray-400 mb-2">Key Points to Develop</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
                    {idea.keyPoints.map((point, index) => (
                        <li key={index}>{point}</li>
                    ))}
                </ul>
            </div>
            <div className="mt-auto pt-4 text-center">
                <Button onClick={() => onSelect(idea)} className="w-full bg-blue-600 hover:bg-blue-500">
                    Move This Idea to the Generate Article Page
                </Button>
            </div>
        </div>
    );
};


interface HeadlineGeneratorPanelProps {
  isLoading: boolean;
  sourceType: 'url' | 'text';
  onSourceTypeChange: (type: 'url' | 'text') => void;
  sourceUrl: string;
  onSourceUrlChange: (url: string) => void;
  sourceText: string;
  onSourceTextChange: (text: string) => void;
  onGenerateIdeas: (script: string) => void;
  articleIdeas: ArticleIdea[] | null;
  onStartArticleFromIdea: (idea: ArticleIdea) => void;
  generateArticleIdeasScript: string;
  onGenerateArticleIdeasScriptChange: (script: string) => void;
}

const HeadlineGeneratorPanel: React.FC<HeadlineGeneratorPanelProps> = ({
  isLoading,
  sourceType,
  onSourceTypeChange,
  sourceUrl,
  onSourceUrlChange,
  sourceText,
  onSourceTextChange,
  onGenerateIdeas,
  articleIdeas,
  onStartArticleFromIdea,
  generateArticleIdeasScript,
  onGenerateArticleIdeasScriptChange,
}) => {
    const isSourceProvided = sourceType === 'url' ? sourceUrl.trim() !== '' : sourceText.trim() !== '';

    return (
    <div className="space-y-8 animate-fade-in">
        <h1 className="text-3xl font-bold">Generate Ideas</h1>

        <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg space-y-6">
            <h2 className="text-xl font-bold text-teal-300">Generate Article Ideas</h2>
            <p className="text-sm text-gray-400">Start by providing a source article (URL or text). The AI will analyze it and generate several new, related article ideas for you to choose from. Each idea will include a title, a summary, and key points to develop.</p>
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
            <div className="pt-4 border-t border-slate-700/50">
              <h3 className="text-lg font-semibold text-gray-300 mb-2">Advanced: AI Idea Generation Script</h3>
              <textarea 
                  value={generateArticleIdeasScript} 
                  onChange={(e) => onGenerateArticleIdeasScriptChange(e.target.value)} 
                  rows={15} 
                  className="w-full p-3 bg-gray-900 rounded-md text-sm font-mono whitespace-pre-wrap text-gray-300 border border-slate-600 focus:ring-2 focus:ring-teal-400"
              />
            </div>
            <div className="text-center">
                 <Button onClick={() => onGenerateIdeas(generateArticleIdeasScript)} isLoading={isLoading && !articleIdeas} disabled={!isSourceProvided} className="bg-blue-600 hover:bg-blue-500">
                    {isLoading && !articleIdeas ? 'Your Minion Is Working' : 'Generate Article Ideas'}
                 </Button>
            </div>
        </div>

        {isLoading && !articleIdeas && (
            <div className="text-center p-8 text-gray-400">
                <p>Your minion is thinking up some brilliant ideas...</p>
            </div>
        )}
        
        {articleIdeas && (
             <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg space-y-4">
                <h2 className="text-2xl font-bold text-gray-200">Generated Ideas</h2>
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {articleIdeas.map((idea, index) => (
                        <ArticleIdeaCard key={index} idea={idea} onSelect={onStartArticleFromIdea} />
                    ))}
                </div>
            </div>
        )}
    </div>
    );
};

export default HeadlineGeneratorPanel;