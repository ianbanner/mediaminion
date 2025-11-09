
import React from 'react';
import Button from './Button.tsx';
import GenerationResultDisplay from './GenerationResultDisplay.tsx';
// Fix: TopPostAssessment is not exported from geminiService.ts, it should be imported from types.ts
import { GenerationResults } from '../services/geminiService.ts';
import { TopPostAssessment } from '../types.ts';

interface GenerationPanelProps {
  articleUrl: string;
  onArticleUrlChange: (url: string) => void;
  articleText: string;
  onArticleTextChange: (text: string) => void;
  sourceType: 'url' | 'text';
  onSourceTypeChange: (type: 'url' | 'text') => void;
  standardStarterText: string;
  onStandardStarterTextChange: (text: string) => void;
  standardSummaryText: string;
  onStandardSummaryTextChange: (text: string) => void;
  generationScript: string;
  onGenerationScriptChange: (script: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
  results: GenerationResults | null;
  onSendToAyrshareQueue: (post: TopPostAssessment) => void;
}

const GenerationPanel: React.FC<GenerationPanelProps> = ({
  articleUrl,
  onArticleUrlChange,
  articleText,
  onArticleTextChange,
  sourceType,
  onSourceTypeChange,
  standardStarterText,
  onStandardStarterTextChange,
  standardSummaryText,
  onStandardSummaryTextChange,
  generationScript,
  onGenerationScriptChange,
  onGenerate,
  isLoading,
  results,
  onSendToAyrshareQueue,
}) => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg space-y-6">
        <h1 className="text-3xl font-bold">Generate Posts</h1>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Source Content</label>
          <div className="flex items-center space-x-4 mb-3">
            <button onClick={() => onSourceTypeChange('url')} className={`px-4 py-2 rounded-md font-semibold ${sourceType === 'url' ? 'bg-teal-600 text-white' : 'bg-gray-700 text-gray-300'}`}>URL</button>
            <button onClick={() => onSourceTypeChange('text')} className={`px-4 py-2 rounded-md font-semibold ${sourceType === 'text' ? 'bg-teal-600 text-white' : 'bg-gray-700 text-gray-300'}`}>Text</button>
          </div>
          {sourceType === 'url' ? (
            <input type="text" value={articleUrl} onChange={(e) => onArticleUrlChange(e.target.value)} placeholder="Enter URL for the source article..." className="w-full p-3 bg-gray-900 border border-slate-600 rounded-md focus:ring-2 focus:ring-teal-400" />
          ) : (
            <textarea value={articleText} onChange={(e) => onArticleTextChange(e.target.value)} rows={8} placeholder="Paste the source text here..." className="w-full p-3 bg-gray-900 border border-slate-600 rounded-md focus:ring-2 focus:ring-teal-400" />
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-700/50">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Standard Post Starter Text (Optional)</label>
            <textarea value={standardStarterText} onChange={(e) => onStandardStarterTextChange(e.target.value)} rows={3} placeholder="e.g., I just read a great article..." className="w-full p-3 bg-gray-900 border border-slate-600 rounded-md focus:ring-2 focus:ring-teal-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Standard Post Summary Text (Optional)</label>
            <textarea value={standardSummaryText} onChange={(e) => onStandardSummaryTextChange(e.target.value)} rows={3} placeholder="e.g., Read the full article here: [ARTICLE_URL]" className="w-full p-3 bg-gray-900 border border-slate-600 rounded-md focus:ring-2 focus:ring-teal-400" />
          </div>
        </div>
        
        <div className="pt-4 border-t border-slate-700/50">
          <h3 className="text-lg font-semibold text-gray-300 mb-2">Advanced: AI Generation & Evaluation Script</h3>
          <textarea value={generationScript} onChange={(e) => onGenerationScriptChange(e.target.value)} rows={15} className="w-full p-3 bg-gray-900 rounded-md text-sm font-mono whitespace-pre-wrap text-gray-300 border border-slate-600 focus:ring-2 focus:ring-teal-400"/>
        </div>

        <div className="text-center pt-4">
          <Button onClick={onGenerate} isLoading={isLoading}>
            {isLoading ? 'Your Minion Is Working' : 'Generate & Evaluate Posts'}
          </Button>
        </div>
      </div>
      
      {results && (
        <GenerationResultDisplay 
          results={results}
          articleUrl={articleUrl}
          onSendToAyrshareQueue={onSendToAyrshareQueue}
        />
      )}
    </div>
  );
};

export default GenerationPanel;