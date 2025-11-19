
import React, { useState, useMemo } from 'react';
import Button from './Button.tsx';
import MarkdownRenderer from './MarkdownRenderer.tsx';
import { GeneratedAudioScript } from '../types.ts';

interface AudioScriptGeneratorPanelProps {
  sourceText: string;
  onSourceTextChange: (text: string) => void;
  duration: number;
  onDurationChange: (duration: number) => void;
  script: string;
  onScriptChange: (script: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
  result: GeneratedAudioScript | null;
}

const AudioScriptGeneratorPanel: React.FC<AudioScriptGeneratorPanelProps> = ({
  sourceText, onSourceTextChange, duration, onDurationChange,
  script, onScriptChange, onGenerate, isLoading, result
}) => {
    const WORDS_PER_MINUTE = 150;
    
    const projectedWordCount = useMemo(() => {
        return duration * WORDS_PER_MINUTE;
    }, [duration]);

    const handleCopyScript = () => {
        if (result) {
            navigator.clipboard.writeText(result.scriptContent);
            alert("Script copied to clipboard!");
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <h1 className="text-3xl font-bold">Generate Audio Script</h1>
            <p className="text-gray-400">Transform articles or text into a spoken-word script with modern, rhythmic sentence structures (Nicholas Cole style) and authoritative tone (Marty Cagan style).</p>

            <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Source Content</label>
                    <textarea 
                        value={sourceText} 
                        onChange={(e) => onSourceTextChange(e.target.value)} 
                        rows={10} 
                        placeholder="Paste your article or media content here..." 
                        className="w-full p-3 bg-gray-900 border border-slate-600 rounded-md focus:ring-2 focus:ring-teal-400" 
                    />
                </div>

                <div className="pt-4 border-t border-slate-700/50">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Script Duration</label>
                    <div className="flex flex-wrap gap-4 items-center">
                        {[7, 10, 20].map(min => (
                            <button
                                key={min}
                                onClick={() => onDurationChange(min)}
                                className={`px-6 py-3 rounded-md font-bold text-lg transition-all ${duration === min ? 'bg-teal-600 text-white ring-2 ring-teal-400 ring-offset-2 ring-offset-slate-900' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                            >
                                {min} Minutes
                            </button>
                        ))}
                        <div className="ml-auto text-right">
                             <p className="text-sm text-gray-400">Projected Word Count</p>
                             <p className="text-2xl font-bold text-teal-300">~{projectedWordCount} words</p>
                        </div>
                    </div>
                </div>

                <details className="pt-4 border-t border-slate-700/50">
                    <summary className="cursor-pointer font-semibold text-gray-300 hover:text-white">
                        Advanced: AI Script Instructions
                    </summary>
                    <div className="mt-4">
                         <p className="text-xs text-gray-500 mb-2">You can adjust the prompt below to further customize the tone or style.</p>
                         <textarea 
                            value={script} 
                            onChange={(e) => onScriptChange(e.target.value)} 
                            rows={10} 
                            className="w-full p-3 bg-gray-900 rounded-md text-sm font-mono whitespace-pre-wrap text-gray-300 border border-slate-600 focus:ring-2 focus:ring-teal-400"
                        />
                    </div>
                </details>

                <div className="text-center pt-4 border-t border-slate-700/50">
                    <Button onClick={onGenerate} isLoading={isLoading} disabled={!sourceText.trim() || isLoading} className="bg-blue-600 hover:bg-blue-500 w-full max-w-md">
                        {isLoading ? 'Your Minion is generating...' : 'Generate Audio Script'}
                    </Button>
                </div>
            </div>

            {result && (
                <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg space-y-4 animate-fade-in">
                    <div className="flex justify-between items-start border-b border-slate-700 pb-4 mb-4">
                        <div>
                            <h2 className="text-2xl font-bold text-white">{result.title}</h2>
                            <div className="flex gap-4 mt-1 text-sm text-gray-400">
                                <span>Est. Duration: {result.estimatedDuration}</span>
                                <span>Word Count: {result.wordCount}</span>
                            </div>
                        </div>
                        <Button onClick={handleCopyScript} className="bg-gray-700 hover:bg-gray-600 px-4 py-2 text-sm">
                            Copy Script
                        </Button>
                    </div>
                    
                    <div className="prose prose-invert max-w-none bg-gray-900 p-6 rounded-lg border border-slate-700">
                        <MarkdownRenderer content={result.scriptContent} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default AudioScriptGeneratorPanel;
