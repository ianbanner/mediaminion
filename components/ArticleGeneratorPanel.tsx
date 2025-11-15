import React from 'react';
import { ArticleDestination } from '../types.ts';
import Button from './Button.tsx';

interface ArticleGeneratorPanelProps {
  wordCount: number;
  onWordCountChange: (count: number) => void;
  sourceType: 'url' | 'text';
  onSourceTypeChange: (type: 'url' | 'text') => void;
  sourceUrl: string;
  onSourceUrlChange: (url: string) => void;
  sourceText: string;
  onSourceTextChange: (text: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
  articleTitle: string;
  onArticleTitleChange: (title: string) => void;
  generateArticleDestination: ArticleDestination;
  onGenerateArticleDestinationChange: (destination: ArticleDestination) => void;
  articleStarterText: string;
  onArticleStarterTextChange: (text: string) => void;
  endOfArticleSummary: string;
  onEndOfArticleSummaryChange: (text: string) => void;
  generateArticleScript: string;
  onGenerateArticleScriptChange: (script: string) => void;
}

const ArticleGeneratorPanel: React.FC<ArticleGeneratorPanelProps> = ({
  wordCount,
  onWordCountChange,
  sourceType,
  onSourceTypeChange,
  sourceUrl,
  onSourceUrlChange,
  sourceText,
  onSourceTextChange,
  onGenerate,
  isLoading,
  articleTitle,
  onArticleTitleChange,
  generateArticleDestination,
  onGenerateArticleDestinationChange,
  articleStarterText,
  onArticleStarterTextChange,
  endOfArticleSummary,
  onEndOfArticleSummaryChange,
  generateArticleScript,
  onGenerateArticleScriptChange,
}) => {
    
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full animate-fade-in">
                <div className="p-12 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg text-center">
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-teal-400 mb-6"></div>
                    <h2 className="text-2xl font-bold text-gray-200">Your minion is working...</h2>
                    <p className="mt-2 text-gray-400">Generating your new article draft. This can take a minute.</p>
                    <p className="mt-1 text-sm text-gray-500">You will be automatically taken to the refinement page when it's ready.</p>
                </div>
            </div>
        );
    }
    
    const destinations: ArticleDestination[] = ['LinkedIn', 'Medium', 'Substack', 'Facebook', 'Non Fiction Book', 'Fiction Book'];

    return (
    <div className="space-y-8 animate-fade-in">
        <h1 className="text-3xl font-bold">Generate Article</h1>

        <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg space-y-6">
            
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Final Destination</label>
                <div className="flex flex-wrap items-center gap-2">
                    {destinations.map(dest => (
                        <button 
                            key={dest}
                            onClick={() => onGenerateArticleDestinationChange(dest)} 
                            className={`px-4 py-2 rounded-md font-semibold text-sm ${generateArticleDestination === dest ? 'bg-teal-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                        >
                            {dest}
                        </button>
                    ))}
                </div>
            </div>

            <div className="pt-4 border-t border-slate-700/50">
                <label className="block text-sm font-medium text-gray-300 mb-2">Approximate Word Count</label>
                <div className="flex items-center space-x-4">
                    {[1000, 2000, 3000].map(count => (
                        <button 
                            key={count}
                            onClick={() => onWordCountChange(count)} 
                            className={`px-4 py-2 rounded-md font-semibold ${wordCount === count ? 'bg-teal-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                        >
                            {count} words
                        </button>
                    ))}
                </div>
            </div>

            <div className="pt-4 border-t border-slate-700/50">
                <label htmlFor="article-title" className="block text-sm font-medium text-gray-300 mb-1">
                    Working Title (Optional)
                </label>
                <p className="text-xs text-gray-500 mb-2">Provide a title to guide the AI, or leave it blank to have one generated. This is pre-filled if you start from the Headline Generator.</p>
                <input 
                    id="article-title"
                    type="text" 
                    value={articleTitle} 
                    onChange={(e) => onArticleTitleChange(e.target.value)} 
                    placeholder="Enter a working title..." 
                    className="w-full p-3 bg-gray-900 border border-slate-600 rounded-md focus:ring-2 focus:ring-teal-400" 
                />
            </div>

            <div className="pt-4 border-t border-slate-700/50">
                 <label className="block text-sm font-medium text-gray-300 mb-2">Primary Source (Main thought or content)</label>
                <div className="flex items-center space-x-4 mb-3">
                    <button onClick={() => onSourceTypeChange('url')} className={`px-4 py-2 rounded-md font-semibold ${sourceType === 'url' ? 'bg-teal-600 text-white' : 'bg-gray-700 text-gray-300'}`}>URL</button>
                    <button onClick={() => onSourceTypeChange('text')} className={`px-4 py-2 rounded-md font-semibold ${sourceType === 'text' ? 'bg-teal-600 text-white' : 'bg-gray-700 text-gray-300'}`}>Text</button>
                </div>
                {sourceType === 'url' ? (
                    <input 
                        type="text" 
                        value={sourceUrl} 
                        onChange={(e) => onSourceUrlChange(e.target.value)} 
                        placeholder="Enter URL for the source article..." 
                        className="w-full p-3 bg-gray-900 border border-slate-600 rounded-md focus:ring-2 focus:ring-teal-400" 
                    />
                ) : (
                    <textarea 
                        value={sourceText} 
                        onChange={(e) => onSourceTextChange(e.target.value)} 
                        rows={8}
                        placeholder="Paste the source text here..."
                        className="w-full p-3 bg-gray-900 border border-slate-600 rounded-md focus:ring-2 focus:ring-teal-400" 
                    />
                )}
            </div>

            <div className="pt-4 border-t border-slate-700/50">
                <label htmlFor="article-starter" className="block text-sm font-medium text-gray-300 mb-1">
                    Article Starter Text (Optional)
                </label>
                <p className="text-xs text-gray-500 mb-2">This text will be prepended to the beginning of your generated article.</p>
                <textarea 
                    id="article-starter"
                    value={articleStarterText} 
                    onChange={(e) => onArticleStarterTextChange(e.target.value)} 
                    rows={4}
                    placeholder="e.g., I had a fascinating conversation the other day..."
                    className="w-full p-3 bg-gray-900 border border-slate-600 rounded-md focus:ring-2 focus:ring-teal-400" 
                />
            </div>
            
            <div className="pt-4 border-t border-slate-700/50">
                <label htmlFor="end-of-article" className="block text-sm font-medium text-gray-300 mb-1">
                    End of Article Summary Template
                </label>
                <p className="text-xs text-gray-500 mb-2">This template will be appended to your article. The AI will replace the placeholder question with a relevant one.</p>
                <textarea 
                    id="end-of-article"
                    value={endOfArticleSummary} 
                    onChange={(e) => onEndOfArticleSummaryChange(e.target.value)} 
                    rows={10}
                    className="w-full p-3 bg-gray-900 border border-slate-600 rounded-md focus:ring-2 focus:ring-teal-400 font-mono text-sm" 
                />
            </div>

            <details className="pt-4 border-t border-slate-700/50">
                <summary className="cursor-pointer font-semibold text-gray-300 hover:text-white">
                    Advanced: AI Generation Script
                </summary>
                <div className="mt-4">
                    <textarea 
                        value={generateArticleScript} 
                        onChange={(e) => onGenerateArticleScriptChange(e.target.value)} 
                        rows={15}
                        className="w-full p-3 bg-gray-900 rounded-md text-sm font-mono whitespace-pre-wrap text-gray-300 border border-slate-600 focus:ring-2 focus:ring-teal-400"
                    />
                </div>
            </details>

            <div className="text-center pt-4 border-t border-slate-700/50">
                <Button onClick={onGenerate} isLoading={isLoading} className="bg-blue-600 hover:bg-blue-500">
                    {isLoading ? 'Minion is working...' : 'Generate Article'}
                </Button>
            </div>
        </div>
    </div>
    );
};

export default ArticleGeneratorPanel;
