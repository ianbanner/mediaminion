
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { GeneratedArticle, Suggestion, GeneratedHeadline } from '../types.ts';
import Button from './Button.tsx';
import MarkdownRenderer from './MarkdownRenderer.tsx';

interface ArticleGeneratorPanelProps {
  wordCount: number;
  onWordCountChange: (count: number) => void;
  sourceType: 'url' | 'text';
  onSourceTypeChange: (type: 'url' | 'text') => void;
  sourceUrl: string;
  onSourceUrlChange: (url: string) => void;
  sourceText: string;
  onSourceTextChange: (text: string) => void;
  generationScript: string;
  onGenerationScriptChange: (script: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
  generatedArticleHistory: GeneratedArticle[];
  currentArticleIterationIndex: number;
  onRevertToIteration: (index: number) => void;
  articleTitle: string;
  onArticleTitleChange: (title: string) => void;
  endOfArticleSummary: string;
  onEndOfArticleSummaryChange: (value: string) => void;
  articleEvalCriteria: string;
  onArticleEvalCriteriaChange: (value: string) => void;
  onEnhanceArticle: (selectedSuggestions: Suggestion[]) => void;
  headlineEvalCriteriaForArticle: string;
  onHeadlineEvalCriteriaForArticleChange: (value: string) => void;
  onGenerateHeadlinesForArticle: () => void;
  generatedHeadlinesForArticle: GeneratedHeadline[] | null;
  onSelectHeadlineForEdit: (headline: GeneratedHeadline) => void;
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
  generationScript,
  onGenerationScriptChange,
  onGenerate,
  isLoading,
  generatedArticleHistory,
  currentArticleIterationIndex,
  onRevertToIteration,
  articleTitle,
  onArticleTitleChange,
  endOfArticleSummary,
  onEndOfArticleSummaryChange,
  articleEvalCriteria,
  onArticleEvalCriteriaChange,
  onEnhanceArticle,
  headlineEvalCriteriaForArticle,
  onHeadlineEvalCriteriaForArticleChange,
  onGenerateHeadlinesForArticle,
  generatedHeadlinesForArticle,
  onSelectHeadlineForEdit,
}) => {
    
    const [copied, setCopied] = useState(false);
    const [selectedSuggestions, setSelectedSuggestions] = useState<Suggestion[]>([]);
    const articleContentRef = useRef<HTMLDivElement>(null);

    const currentArticle = useMemo(() => {
        return generatedArticleHistory[currentArticleIterationIndex] || null;
    }, [generatedArticleHistory, currentArticleIterationIndex]);

    useEffect(() => {
        if (currentArticle) {
            setSelectedSuggestions(currentArticle.suggestions || []);
        }
    }, [currentArticle]);

    const handleSuggestionToggle = (suggestion: Suggestion) => {
        setSelectedSuggestions(prev => {
            const isSelected = prev.some(s => s.text === suggestion.text);
            if (isSelected) {
                return prev.filter(s => s.text !== suggestion.text);
            } else {
                return [...prev, suggestion];
            }
        });
    };

    const fullArticleMarkdown = useMemo(() => {
        if (!currentArticle) return '';
        if (currentArticle.headlineApplied) {
            return `# ${currentArticle.title}\n\n${currentArticle.content}`;
        }
        const contentStartsWithTitle = currentArticle.content.trim().startsWith(`# ${currentArticle.title}`) || currentArticle.content.trim().startsWith(`# `);
        if (contentStartsWithTitle) {
            return currentArticle.content;
        }
        return `# ${currentArticle.title}\n\n${currentArticle.content}`;
    }, [currentArticle]);

    const handleCopy = () => {
        if (articleContentRef.current) {
            const html = articleContentRef.current.innerHTML;
            const blob = new Blob([html], { type: 'text/html' });
            const item = new ClipboardItem({ 'text/html': blob });
            
            navigator.clipboard.write([item]).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }).catch(err => {
                console.error('Failed to copy rich text:', err);
                navigator.clipboard.writeText(fullArticleMarkdown); // Fallback to raw markdown
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            });
        }
    };
    
    const handleDownload = () => {
        if (!currentArticle) return;
        const blob = new Blob([fullArticleMarkdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const safeTitle = currentArticle.title.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 50);
        a.download = `${safeTitle}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
    <div className="space-y-8 animate-fade-in">
        <h1 className="text-3xl font-bold">Generate Article</h1>

        <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg space-y-6">
            
            <div>
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
                <label className="block text-sm font-medium text-gray-300 mb-1">End of Article Summary</label>
                <p className="text-xs text-gray-500 mb-2">This text will be appended to the end of the generated article.</p>
                <textarea 
                    value={endOfArticleSummary} 
                    onChange={(e) => onEndOfArticleSummaryChange(e.target.value)} 
                    rows={4}
                    placeholder="Enter a standard summary or call to action..."
                    className="w-full p-3 bg-gray-900 border border-slate-600 rounded-md focus:ring-2 focus:ring-teal-400" 
                />
            </div>

            <div className="pt-4 border-t border-slate-700/50">
                <label className="block text-sm font-medium text-gray-300 mb-1">Article Evaluation Criteria</label>
                <p className="text-xs text-gray-500 mb-2">The AI will use these instructions to evaluate the generated article and suggest improvements.</p>
                <textarea 
                    value={articleEvalCriteria} 
                    onChange={(e) => onArticleEvalCriteriaChange(e.target.value)} 
                    rows={10}
                    className="w-full p-3 bg-gray-900 rounded-md text-sm font-mono whitespace-pre-wrap text-gray-300 border border-slate-600 focus:ring-2 focus:ring-teal-400" 
                />
            </div>
            
            <div className="pt-4 border-t border-slate-700/50">
                <label className="block text-sm font-medium text-gray-300 mb-1">Headline Evaluation Criteria</label>
                <p className="text-xs text-gray-500 mb-2">The AI uses these criteria to generate and score the 10 headline options for your article.</p>
                <textarea 
                    value={headlineEvalCriteriaForArticle} 
                    onChange={(e) => onHeadlineEvalCriteriaForArticleChange(e.target.value)} 
                    rows={10}
                    className="w-full p-3 bg-gray-900 rounded-md text-sm font-mono whitespace-pre-wrap text-gray-300 border border-slate-600 focus:ring-2 focus:ring-teal-400" 
                />
            </div>

            <div className="pt-4 border-t border-slate-700/50">
                <h3 className="text-lg font-semibold text-gray-300 mb-2">Advanced: AI Generation Script</h3>
                <div className="bg-yellow-900/50 p-3 rounded-lg border border-yellow-700 text-sm text-yellow-300 mb-3">
                    <strong>Warning:</strong> Modifying this script can break the article generation process. Only edit if you understand the AI's instructions.
                </div>
                <textarea value={generationScript} onChange={(e) => onGenerationScriptChange(e.target.value)} rows={15} className="w-full p-3 bg-gray-900 rounded-md text-sm font-mono whitespace-pre-wrap text-gray-300 border border-slate-600 focus:ring-2 focus:ring-teal-400"/>
            </div>

             <div className="text-center pt-4">
                <Button onClick={onGenerate} isLoading={isLoading && generatedArticleHistory.length === 0}>
                  {isLoading && generatedArticleHistory.length === 0 ? 'Your Minion Is Working' : 'Generate Article'}
                </Button>
            </div>
        </div>
        
        {generatedArticleHistory.length > 0 && (
             <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg space-y-4">
                <h2 className="text-2xl font-bold text-gray-200">Iteration History</h2>
                <div className="flex flex-col space-y-2">
                    {generatedArticleHistory.map((iteration, index) => (
                        <button
                            key={index}
                            onClick={() => onRevertToIteration(index)}
                            className={`p-3 rounded-md text-left transition-colors ${index === currentArticleIterationIndex ? 'bg-teal-600/30 border-teal-500 border' : 'bg-gray-900/50 hover:bg-slate-700/50 border border-slate-700'}`}
                        >
                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-gray-200">Iteration {index + 1}</span>
                                <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${index === currentArticleIterationIndex ? 'bg-teal-500 text-white' : 'bg-slate-700 text-teal-300'}`}>
                                    Score: {iteration.score}/100
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        )}

        {currentArticle && (
            <div className="mt-8 p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-slate-700/50">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-200">Generated Article</h2>
                         <div className="flex items-center gap-4 mt-1">
                            <span className="text-sm font-semibold text-gray-400">Viewing Iteration: {currentArticleIterationIndex + 1}</span>
                            <span className="px-3 py-1 text-sm font-bold text-teal-300 bg-teal-900/50 border border-teal-700 rounded-full">{currentArticle.score}/100</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {currentArticle.headlineApplied ? (
                             <>
                                <button onClick={handleCopy} className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white">
                                    {copied ? 'Copied!' : 'Copy Formatted Article'}
                                </button>
                                <button onClick={handleDownload} className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors bg-green-600 text-white hover:bg-green-500">
                                    Download .md
                                </button>
                            </>
                        ) : (
                            <Button 
                                onClick={onGenerateHeadlinesForArticle} 
                                isLoading={isLoading && !generatedHeadlinesForArticle}
                                className="bg-indigo-600 hover:bg-indigo-500 text-xs px-3 py-1.5"
                            >
                                {isLoading && !generatedHeadlinesForArticle ? 'Generating...' : 'Generate Headlines & Subs'}
                            </Button>
                        )}
                    </div>
                </div>
                
                <div ref={articleContentRef} className="prose prose-invert max-w-none p-4 bg-gray-900/50 rounded-lg border border-slate-700">
                    <MarkdownRenderer content={fullArticleMarkdown} />
                </div>
                
                <div className="pt-4 border-t border-slate-700/50 space-y-3">
                    <h3 className="text-xl font-semibold text-gray-200">AI Evaluation</h3>
                    <pre className="text-sm text-gray-400 whitespace-pre-wrap font-sans p-3 bg-gray-900/50 rounded-md">{currentArticle.evaluation}</pre>
                </div>

                <div className="pt-4 border-t border-slate-700/50 space-y-3">
                    <h3 className="text-xl font-semibold text-gray-200">Suggested Changes</h3>
                    <div className="space-y-3">
                        {(currentArticle.suggestions || []).map((suggestion, index) => (
                            <div key={index} className="flex items-start gap-3 p-3 bg-gray-900/50 rounded-md border border-slate-700">
                                <input
                                    type="checkbox"
                                    id={`suggestion-${index}`}
                                    checked={selectedSuggestions.some(s => s.text === suggestion.text)}
                                    onChange={() => handleSuggestionToggle(suggestion)}
                                    className="mt-1 h-4 w-4 flex-shrink-0 rounded border-gray-600 bg-gray-700 text-teal-600 focus:ring-teal-500"
                                />
                                <label htmlFor={`suggestion-${index}`} className="flex-1 text-sm text-gray-300">
                                    {suggestion.text}
                                    <span className="ml-2 px-2 py-0.5 text-xs font-semibold text-indigo-300 bg-indigo-900/50 rounded-full">{suggestion.area}</span>
                                </label>
                            </div>
                        ))}
                    </div>
                    <div className="text-center pt-4">
                        <Button onClick={() => onEnhanceArticle(selectedSuggestions)} isLoading={isLoading && !generatedHeadlinesForArticle} disabled={selectedSuggestions.length === 0}>
                            {isLoading && !generatedHeadlinesForArticle ? 'Your Minion Is Working' : `Enhance Article (${selectedSuggestions.length} selected)`}
                        </Button>
                    </div>
                </div>

                {generatedHeadlinesForArticle && (
                    <div className="pt-4 border-t border-slate-700/50 space-y-3">
                        <h3 className="text-xl font-semibold text-gray-200">Choose a Headline</h3>
                        <p className="text-sm text-gray-400">Select one of the AI-generated options below to edit and apply to your article.</p>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {generatedHeadlinesForArticle.map((headline) => (
                                <div 
                                    key={headline.id} 
                                    onClick={() => onSelectHeadlineForEdit(headline)} 
                                    className="p-4 bg-slate-900/50 border border-slate-700 rounded-lg cursor-pointer transition-all hover:border-teal-500 hover:bg-slate-700/50"
                                >
                                    <div className="flex justify-between items-start gap-2">
                                        <h4 className="font-bold text-teal-300">{headline.headline}</h4>
                                        <span className="flex-shrink-0 px-2 py-0.5 text-xs font-bold text-teal-300 bg-teal-900/50 border border-teal-700 rounded-full">{headline.score}/100</span>
                                    </div>
                                    <p className="mt-1 text-sm text-gray-300">{headline.subheadline}</p>
                                    <p className="mt-2 text-xs text-gray-400 italic">"{headline.reasoning}"</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        )}
    </div>
    );
};

export default ArticleGeneratorPanel;
