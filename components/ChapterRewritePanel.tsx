
import React, { useState, useMemo } from 'react';
import Button from './Button.tsx';
import MarkdownRenderer from './MarkdownRenderer.tsx';
import { ChapterRewriteResult } from '../types.ts';

interface ChapterRewritePanelProps {
  sourceText: string;
  onSourceTextChange: (text: string) => void;
  script: string;
  onScriptChange: (script: string) => void;
  onRewrite: () => void;
  isLoading: boolean;
  result: ChapterRewriteResult | null;
}

// --- Diff Utility Functions ---

type DiffPart = {
  value: string;
  added?: boolean;
  removed?: boolean;
};

// Iterative Longest Common Subsequence (LCS) to avoid recursion stack overflow
const getDiff = (text1: string, text2: string): DiffPart[] => {
    // Split by whitespace boundaries to preserve spaces and punctuation better for visual diff
    // This regex splits but keeps delimiters (words vs spaces)
    const splitRegex = /([^\s]+|\s+)/g;
    const words1 = text1.match(splitRegex) || [];
    const words2 = text2.match(splitRegex) || [];
    
    // 1. Common Prefix Optimization
    let start = 0;
    while (start < words1.length && start < words2.length && words1[start] === words2[start]) {
        start++;
    }
    
    // 2. Common Suffix Optimization
    let end1 = words1.length - 1;
    let end2 = words2.length - 1;
    while (end1 >= start && end2 >= start && words1[end1] === words2[end2]) {
        end1--;
        end2--;
    }
    
    const subWords1 = words1.slice(start, end1 + 1);
    const subWords2 = words2.slice(start, end2 + 1);
    
    const m = subWords1.length;
    const n = subWords2.length;

    // Safety check for very large diffs to prevent browser freeze
    if (m * n > 25000000) { // Approx limit (e.g. 5000 words * 5000 words)
        return [{ value: "Diff too complex to display. Please view clean text.", added: false, removed: false }];
    }

    // 3. Compute LCS Matrix
    // Use Int32Array for better memory usage with large grids
    const C = Array(m + 1).fill(0).map(() => new Int32Array(n + 1));
    
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (subWords1[i - 1] === subWords2[j - 1]) {
                C[i][j] = C[i - 1][j - 1] + 1;
            } else {
                C[i][j] = Math.max(C[i][j - 1], C[i - 1][j]);
            }
        }
    }

    // 4. Backtrack to find diff
    let i = m;
    let j = n;
    
    const backtrack: DiffPart[] = [];
    while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && subWords1[i - 1] === subWords2[j - 1]) {
            backtrack.unshift({ value: subWords1[i - 1] });
            i--; j--;
        } else if (j > 0 && (i === 0 || C[i][j - 1] >= C[i - 1][j])) {
            backtrack.unshift({ value: subWords2[j - 1], added: true });
            j--;
        } else if (i > 0 && (j === 0 || C[i][j - 1] < C[i - 1][j])) {
            backtrack.unshift({ value: subWords1[i - 1], removed: true });
            i--;
        }
    }

    // Combine: Prefix + Diff + Suffix
    const prefix = words1.slice(0, start).map(w => ({ value: w }));
    const suffix = words1.slice(end1 + 1).map(w => ({ value: w })); // Suffix from words1 matches words2

    return [...prefix, ...backtrack, ...suffix];
};

const ChapterRewritePanel: React.FC<ChapterRewritePanelProps> = ({
  sourceText,
  onSourceTextChange,
  script,
  onScriptChange,
  onRewrite,
  isLoading,
  result
}) => {
    const [viewMode, setViewMode] = useState<'clean' | 'diff' | 'summary'>('clean');

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        alert("Copied to clipboard!");
    };

    const diffParts = useMemo(() => {
        if (viewMode !== 'diff' || !result || !sourceText) return [];
        return getDiff(sourceText, result.rewrittenText);
    }, [viewMode, result, sourceText]);

    return (
        <div className="space-y-8 animate-fade-in">
            <h1 className="text-3xl font-bold">Chapter Rewrite</h1>
            <p className="text-gray-400">
                Tidy up English, fix grammar, and improve flow for book chapters written by non-native speakers. 
                The goal is to reach native-level professional fluency without changing the core story or voice.
            </p>

            <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Original Chapter Text</label>
                    <textarea 
                        value={sourceText} 
                        onChange={(e) => onSourceTextChange(e.target.value)} 
                        rows={10} 
                        placeholder="Paste the chapter text here..." 
                        className="w-full p-3 bg-gray-900 border border-slate-600 rounded-md focus:ring-2 focus:ring-teal-400 font-mono text-sm" 
                    />
                </div>

                <details className="pt-4 border-t border-slate-700/50">
                    <summary className="cursor-pointer font-semibold text-gray-300 hover:text-white">
                        Advanced: AI Editor Script
                    </summary>
                    <div className="mt-4">
                         <p className="text-xs text-gray-500 mb-2">Customize the instructions for the AI editor.</p>
                         <textarea 
                            value={script} 
                            onChange={(e) => onScriptChange(e.target.value)} 
                            rows={10} 
                            className="w-full p-3 bg-gray-900 rounded-md text-sm font-mono whitespace-pre-wrap text-gray-300 border border-slate-600 focus:ring-2 focus:ring-teal-400"
                        />
                    </div>
                </details>

                <div className="text-center pt-4 border-t border-slate-700/50">
                    <Button 
                        onClick={onRewrite} 
                        isLoading={isLoading} 
                        disabled={!sourceText.trim() || isLoading} 
                        className="bg-blue-600 hover:bg-blue-500 w-full max-w-md"
                    >
                        {isLoading ? 'Your Minion is editing...' : 'Adjust Text'}
                    </Button>
                </div>
            </div>

            {result && (
                <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg space-y-4 animate-fade-in">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-700 pb-4 mb-4">
                        <div className="flex flex-wrap gap-2">
                            <button 
                                onClick={() => setViewMode('clean')}
                                className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${viewMode === 'clean' ? 'bg-teal-600 text-white' : 'bg-slate-700 text-gray-300 hover:bg-slate-600'}`}
                            >
                                Clean Text
                            </button>
                            <button 
                                onClick={() => setViewMode('diff')}
                                className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${viewMode === 'diff' ? 'bg-teal-600 text-white' : 'bg-slate-700 text-gray-300 hover:bg-slate-600'}`}
                            >
                                Show Changes
                            </button>
                            <button 
                                onClick={() => setViewMode('summary')}
                                className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${viewMode === 'summary' ? 'bg-teal-600 text-white' : 'bg-slate-700 text-gray-300 hover:bg-slate-600'}`}
                            >
                                Change Summary
                            </button>
                        </div>
                        {viewMode !== 'diff' && (
                            <Button 
                                onClick={() => handleCopy(viewMode === 'clean' ? result.rewrittenText : result.changeSummary)} 
                                className="bg-gray-700 hover:bg-gray-600 px-4 py-2 text-sm"
                            >
                                Copy {viewMode === 'clean' ? 'Text' : 'Summary'}
                            </Button>
                        )}
                    </div>
                    
                    <div className="bg-gray-900 p-6 rounded-lg border border-slate-700 min-h-[400px]">
                        {viewMode === 'clean' && (
                            <div className="prose prose-invert max-w-none">
                                <MarkdownRenderer content={result.rewrittenText} />
                            </div>
                        )}
                        
                        {viewMode === 'diff' && (
                            <div className="whitespace-pre-wrap font-sans text-gray-300 leading-relaxed">
                                {diffParts.map((part, index) => {
                                    if (part.added) {
                                        return <span key={index} className="bg-green-900/50 text-green-200 decoration-clone px-0.5 rounded">{part.value}</span>;
                                    }
                                    if (part.removed) {
                                        return <span key={index} className="bg-red-900/50 text-red-300 line-through decoration-clone px-0.5 rounded opacity-70 select-none">{part.value}</span>;
                                    }
                                    return <span key={index}>{part.value}</span>;
                                })}
                            </div>
                        )}

                        {viewMode === 'summary' && (
                            <div className="prose prose-invert max-w-none">
                                <h3 className="text-lg font-bold text-gray-200 mb-4">Summary of Changes</h3>
                                <MarkdownRenderer content={result.changeSummary} />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChapterRewritePanel;
