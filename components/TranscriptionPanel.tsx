
import React, { useState } from 'react';
import Button from './Button.tsx';
import MarkdownRenderer from './MarkdownRenderer.tsx';
import { GroundingSource } from '../types.ts';

interface TranscriptionPanelProps {
  url: string;
  onUrlChange: (url: string) => void;
  script: string;
  onScriptChange: (script: string) => void;
  onTranscribe: () => void;
  isLoading: boolean;
  result: string | null;
  sources: GroundingSource[];
}

const TranscriptionPanel: React.FC<TranscriptionPanelProps> = ({
  url, onUrlChange, script, onScriptChange, onTranscribe, isLoading, result, sources
}) => {
    const handleCopy = () => {
        if (result) {
            navigator.clipboard.writeText(result);
            alert("Transcription copied to clipboard!");
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <h1 className="text-3xl font-bold">Transcribe Podcast or Video</h1>
            <p className="text-gray-400">
                Provide a URL to a podcast episode or video. Your Minion will use Google Search to find existing transcript data and detailed breakdowns.
            </p>

            <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg space-y-6">
                <div>
                    <label htmlFor="media-url" className="block text-sm font-medium text-gray-300 mb-2">Media URL</label>
                    <input 
                        id="media-url"
                        type="text" 
                        value={url} 
                        onChange={(e) => onUrlChange(e.target.value)} 
                        placeholder="e.g., https://www.youtube.com/watch?v=... or Podcast URL" 
                        className="w-full p-3 bg-gray-900 border border-slate-600 rounded-md focus:ring-2 focus:ring-teal-400" 
                    />
                </div>

                <details className="pt-4 border-t border-slate-700/50">
                    <summary className="cursor-pointer font-semibold text-gray-300 hover:text-white">
                        Advanced: AI Transcription Instructions
                    </summary>
                    <div className="mt-4">
                         <p className="text-xs text-gray-500 mb-2">Adjust the instructions the AI uses to process the media content.</p>
                         <textarea 
                            value={script} 
                            onChange={(e) => onScriptChange(e.target.value)} 
                            rows={10} 
                            className="w-full p-3 bg-gray-900 rounded-md text-sm font-mono whitespace-pre-wrap text-gray-300 border border-slate-600 focus:ring-2 focus:ring-teal-400"
                        />
                    </div>
                </details>

                <div className="text-center pt-4 border-t border-slate-700/50">
                    <Button onClick={onTranscribe} isLoading={isLoading} disabled={!url.trim() || isLoading} className="bg-blue-600 hover:bg-blue-500 w-full max-w-md">
                        {isLoading ? 'Your Minion is searching...' : 'Get Timestamped Script'}
                    </Button>
                </div>
            </div>

            {result && (
                <div className="space-y-6 animate-fade-in">
                    {/* Transcription Sources (Grounding) */}
                    {sources.length > 0 && (
                        <div className="p-4 bg-teal-900/20 border border-teal-700/50 rounded-xl">
                            <h3 className="text-sm font-bold text-teal-300 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                                Sources Found via Google Search
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {sources.map((source, idx) => (
                                    <a 
                                        key={idx} 
                                        href={source.uri} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-xs text-gray-300 hover:text-white hover:border-teal-500 transition-all truncate max-w-xs"
                                        title={source.title}
                                    >
                                        {source.title}
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-700 pb-4 mb-4">
                            <h2 className="text-2xl font-bold text-white">Transcript & Media Breakdown</h2>
                            <Button onClick={handleCopy} className="bg-gray-700 hover:bg-gray-600 px-4 py-2 text-sm">
                                Copy Content
                            </Button>
                        </div>
                        
                        <div className="prose prose-invert max-w-none bg-gray-900 p-8 rounded-lg border border-slate-700 min-h-[500px]">
                            <MarkdownRenderer content={result} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TranscriptionPanel;
