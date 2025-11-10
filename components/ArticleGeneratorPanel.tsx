import React, { useState, useEffect, useMemo, useRef } from 'react';
import { GeneratedArticle, Suggestion, GeneratedHeadline, ArticleDestination } from '../types.ts';
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
  isEnhancingArticle: boolean;
  isPolishingArticle: boolean;
  isGeneratingHeadlines: boolean;
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
  onPolishArticle: () => void;
  headlineEvalCriteriaForArticle: string;
  onHeadlineEvalCriteriaForArticleChange: (value: string) => void;
  onGenerateHeadlinesForArticle: () => void;
  generatedHeadlinesForArticle: GeneratedHeadline[] | null;
  onSelectHeadlineForEdit: (headline: GeneratedHeadline) => void;
  generateArticleDestination: ArticleDestination;
  onGenerateArticleDestinationChange: (destination: ArticleDestination) => void;
  finalDestinationGuidelines: string;
  onFinalDestinationGuidelinesChange: (guidelines: string) => void;
  onResetFinalDestinationGuidelines: () => void;
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
  isEnhancingArticle,
  isPolishingArticle,
  isGeneratingHeadlines,
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
  onPolishArticle,
  headlineEvalCriteriaForArticle,
  onHeadlineEvalCriteriaForArticleChange,
  onGenerateHeadlinesForArticle,
  generatedHeadlinesForArticle,
  onSelectHeadlineForEdit,
  generateArticleDestination,
  onGenerateArticleDestinationChange,
  finalDestinationGuidelines,
  onFinalDestinationGuidelinesChange,
  onResetFinalDestinationGuidelines,
}) => {
    
    const [copied, setCopied] = useState(false);
    const [selectedSuggestions, setSelectedSuggestions] = useState<Suggestion[]>([]);
    const [editorNote, setEditorNote] = useState('');
    const articleContentRef = useRef<HTMLDivElement>(null);
    const destinations: ArticleDestination[] = ['LinkedIn', 'Medium', 'Substack', 'Facebook', 'Non Fiction Book', 'Fiction Book'];

    const currentArticle = useMemo(() => {
        return generatedArticleHistory[currentArticleIterationIndex] || null;
    }, [generatedArticleHistory, currentArticleIterationIndex]);

    useEffect(() => {
        if (currentArticle) {
            setSelectedSuggestions(currentArticle.suggestions || []);
            setEditorNote(''); // Reset editor note when iteration changes
        }
    }, [currentArticle]);
    
    const handleEnhanceClick = () => {
        const suggestionsToPass = [...selectedSuggestions];
        if (editorNote.trim() !== '') {
            suggestionsToPass.push({ text: editorNote, area: "Editor's Note" });
        }
        onEnhanceArticle(suggestionsToPass);
    };

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
            navigator.clipboard.writeText(fullArticleMarkdown).then(() => {
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
                <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-gray-300">Final Destination Guidelines</label>
                    <button onClick={onResetFinalDestinationGuidelines} className="text-xs text-gray-400 hover:text-white hover:underline">Reset to default</button>
                </div>
                <p className="text-xs text-gray-500 mb-2">These guidelines are automatically selected based on your chosen destination and will be used by the AI. You can edit them for this specific article.</p>
                <textarea 
                    value={finalDestinationGuidelines} 
                    onChange={(e) => onFinalDestinationGuidelinesChange(e.target.value)} 
                    rows={10}
                    className="w-full p-3 bg-gray-900 rounded-md text-sm font-mono whitespace-pre-wrap text-gray-300 border border-slate-600 focus:ring-2 focus:ring-teal-400" 
                />
            </div>

            <div className="pt-4 border-t border-slate-700/50">
                <h3 className="text-lg font-semibold text-gray-300 mb-2">Advanced: AI Generation Script</h3>
                <div className="bg-yellow-900/50 p-3 rounded-lg border border-yellow-700 text-sm text-yellow-300 mb-3">
                    <strong>Warning:</strong> Modifying this script can break the article generation process. Only edit if you understand the AI's instructions.
                </div>
                <textarea value={generationScript} onChange={(e) => onGenerationScriptChange(e.target.value)} rows={15} className="w-full p-3 bg-gray-900 rounded-md text-sm font-mono whitespace-pre-wrap text-gray-300 border border-slate-600 focus:ring-2 focus:ring-teal-400" />
            </div>

            <div className="text-center pt-4 border-t border-slate-700/50">
                <Button onClick={onGenerate} isLoading={isLoading}>
                    {isLoading ? 'Your Minion Is Working' : 'Generate Article'}
                </Button>
            </div>
        </div>

        {currentArticle && (
            <div className="mt-8 p-6 bg-slate-900/50 border border-slate-700 rounded-xl shadow-lg space-y-6">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <h2 className="text-2xl font-bold text-gray-200">Generated Article</h2>
                    {generatedArticleHistory.length > 1 && (
                        <div className="flex items-center gap-4">
                            <label htmlFor="iteration-slider" className="text-sm font-medium text-gray-400 whitespace-nowrap">Version History:</label>
                            <input
                                id="iteration-slider"
                                type="range"
                                min="0"
                                max={generatedArticleHistory.length - 1}
                                value={currentArticleIterationIndex}
                                onChange={(e) => onRevertToIteration(parseInt(e.target.value))}
                                className="w-full"
                            />
                            <span className="text-sm font-semibold text-gray-300">{currentArticleIterationIndex + 1} / {generatedArticleHistory.length}</span>
                        </div>
                    )}
                </div>
                
                <div className="prose prose-invert max-w-none bg-gray-900 p-6 rounded-lg border border-slate-700" ref={articleContentRef}>
                    <MarkdownRenderer content={fullArticleMarkdown} />
                </div>
                <div className="flex justify-end gap-3">
                    <Button onClick={handleCopy} className="bg-gray-700 hover:bg-gray-600">{copied ? 'Copied!' : 'Copy Markdown'}</Button>
                    <Button onClick={handleDownload} className="bg-gray-700 hover:bg-gray-600">Download .md</Button>
                </div>

                <div className="pt-6 border-t border-slate-700/50">
                    <h3 className="text-xl font-bold text-gray-200">AI Evaluation & Suggestions</h3>
                    <div className="mt-2 flex items-baseline gap-4">
                         <span className="px-3 py-1 text-lg font-bold text-teal-300 bg-teal-900/50 border border-teal-700 rounded-full">{currentArticle.score}/100</span>
                        <p className="text-sm text-gray-400 italic">"{currentArticle.evaluation}"</p>
                    </div>

                    <div className="mt-4 space-y-2">
                        <h4 className="text-md font-semibold text-gray-300">Suggestions for Enhancement:</h4>
                        {currentArticle.suggestions.map((suggestion, index) => (
                            <label key={index} className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-md cursor-pointer hover:bg-slate-700/50">
                                <input 
                                    type="checkbox" 
                                    checked={selectedSuggestions.some(s => s.text === suggestion.text)}
                                    onChange={() => handleSuggestionToggle(suggestion)}
                                    className="mt-1 h-4 w-4 rounded border-gray-600 bg-gray-700 text-teal-600 focus:ring-teal-500"
                                />
                                <div>
                                    <span className="font-semibold text-teal-400 text-xs uppercase">{suggestion.area}</span>
                                    <p className="text-sm text-gray-300">{suggestion.text}</p>
                                </div>
                            </label>
                        ))}
                    </div>
                    
                     <div className="mt-4">
                        <h4 className="text-md font-semibold text-gray-300 mb-2">Additional Editor's Note:</h4>
                         <textarea 
                            value={editorNote}
                            onChange={(e) => setEditorNote(e.target.value)}
                            rows={3}
                            placeholder="Add a custom instruction for the next enhancement..."
                            className="w-full p-3 bg-gray-900 border border-slate-600 rounded-md focus:ring-2 focus:ring-teal-400" 
                        />
                    </div>
                    
                    <div className="flex justify-end items-center gap-3 mt-4 flex-wrap" title={currentArticle?.headlineApplied ? "Enhancement is disabled after a headline has been applied to maintain content consistency." : ""}>
                        <Button 
                            onClick={handleEnhanceClick}
                            isLoading={isEnhancingArticle}
                            disabled={!currentArticle || isLoading || isGeneratingHeadlines || isPolishingArticle || !!currentArticle?.headlineApplied}
                            className="bg-blue-600 hover:bg-blue-500"
                        >
                            {isEnhancingArticle ? 'Enhancing...' : 'Enhance Article'}
                        </Button>
                    </div>
                </div>

                {generatedHeadlinesForArticle ? (
                    <div className="pt-6 border-t border-slate-700/50 space-y-4">
                        <h3 className="text-xl font-bold text-gray-200">Generated Headlines</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {generatedHeadlinesForArticle.map(headline => (
                                <div key={headline.id} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start">
                                            <p className="font-bold text-teal-300 pr-4">{headline.headline}</p>
                                            <span className="flex-shrink-0 px-2 py-0.5 text-xs font-bold text-teal-300 bg-teal-900/50 border border-teal-700 rounded-full">{headline.score}/100</span>
                                        </div>
                                        {headline.subheadline && <p className="mt-1 text-sm text-gray-400">{headline.subheadline}</p>}
                                        <p className="mt-2 text-xs text-gray-500 italic">"{headline.reasoning}"</p>
                                    </div>
                                    <div className="text-right mt-3">
                                        <Button onClick={() => onSelectHeadlineForEdit(headline)} className="px-4 py-1.5 text-sm">
                                            Edit & Apply
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : !currentArticle.headlineApplied ? (
                    <div className="pt-6 border-t border-slate-700/50 text-center">
                        <Button 
                            onClick={onGenerateHeadlinesForArticle}
                            isLoading={isGeneratingHeadlines}
                            disabled={isEnhancingArticle || isLoading || isPolishingArticle}
                        >
                            {isGeneratingHeadlines ? 'Generating Headlines...' : 'Generate Headlines for this Article'}
                        </Button>
                    </div>
                ) : (
                    <div className="pt-6 border-t border-slate-700/50 text-center">
                        <h3 className="text-xl font-bold text-gray-200">Final Polish</h3>
                        <p className="text-sm text-gray-400 my-4">Your article's content and headline are set. The final step is to apply a stylistic polish to match your brand voice.</p>
                        <Button
                            onClick={onPolishArticle}
                            isLoading={isPolishingArticle}
                            disabled={!currentArticle || isLoading || isEnhancingArticle || isGeneratingHeadlines}
                            className="bg-purple-600 hover:bg-purple-500"
                        >
                            {isPolishingArticle ? 'Polishing...' : 'Apply Final Polish'}
                        </Button>
                    </div>
                )}

            </div>
        )}
    </div>
    );
};

export default ArticleGeneratorPanel;
