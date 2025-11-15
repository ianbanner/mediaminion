import React from 'react';
import Button from './Button.tsx';

interface RecycleArticlePanelProps {
  articleText: string;
  onArticleTextChange: (text: string) => void;
  script: string;
  onScriptChange: (script: string) => void;
  onRecycle: () => void;
  isLoading: boolean;
}

const RecycleArticlePanel: React.FC<RecycleArticlePanelProps> = ({
  articleText,
  onArticleTextChange,
  script,
  onScriptChange,
  onRecycle,
  isLoading,
}) => {
  if (isLoading) {
    return (
        <div className="flex flex-col items-center justify-center h-full animate-fade-in">
            <div className="p-12 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg text-center">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-teal-400 mb-6"></div>
                <h2 className="text-2xl font-bold text-gray-200">Your minion is recycling...</h2>
                <p className="mt-2 text-gray-400">Refreshing the article and preparing it for refinement.</p>
                <p className="mt-1 text-sm text-gray-500">You will be automatically taken to the refinement page when it's ready.</p>
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-3xl font-bold">Recycle Existing Article</h1>
      <p className="text-gray-400">Paste an existing article to refresh it and integrate it into the refinement workflow. The AI will make minimal changes and ensure it meets standard formatting, then generate an evaluation as if it were a new draft.</p>
      
      <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg space-y-6">
        <div>
          <label htmlFor="recycle-article-text" className="block text-sm font-medium text-gray-300 mb-2">
            Article Content to Recycle
          </label>
          <textarea
            id="recycle-article-text"
            value={articleText}
            onChange={(e) => onArticleTextChange(e.target.value)}
            rows={15}
            placeholder="Paste your full article content here..."
            className="w-full p-3 bg-gray-900 border border-slate-600 rounded-md focus:ring-2 focus:ring-teal-400"
          />
        </div>

        <div className="pt-4 border-t border-slate-700/50">
          <h3 className="text-lg font-semibold text-gray-300 mb-2">Advanced: AI Recycling Script</h3>
          <textarea 
              value={script} 
              onChange={(e) => onScriptChange(e.target.value)} 
              rows={15} 
              className="w-full p-3 bg-gray-900 rounded-md text-sm font-mono whitespace-pre-wrap text-gray-300 border border-slate-600 focus:ring-2 focus:ring-teal-400"
          />
        </div>

        <div className="text-center pt-4 border-t border-slate-700/50">
          <Button onClick={onRecycle} isLoading={isLoading} disabled={!articleText.trim()} className="bg-blue-600 hover:bg-blue-500">
            {isLoading ? 'Your Minion Is Working...' : 'Move to Refine Article'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RecycleArticlePanel;