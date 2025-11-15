import React, { useState, useEffect, useMemo, useRef } from 'react';
import { GeneratedArticle, Suggestion, GeneratedHeadline } from '../types.ts';
import Button from './Button.tsx';
import MarkdownRenderer from './MarkdownRenderer.tsx';
import { POLISH_ARTICLE_SCRIPT } from '../services/scriptService.ts';

interface RefineArticlePanelProps {
  isEnhancingArticle: boolean;
  isPolishingArticle: boolean;
  isGeneratingHeadlines: boolean;
  generatedArticleHistory: GeneratedArticle[];
  currentArticleIterationIndex: number;
  onRevertToIteration: (index: number) => void;
  onEnhanceArticle: (selectedSuggestions: Suggestion[]) => void;
  onPolishArticle: (polishScript: string) => void;
  onGenerateHeadlinesForArticle: (script: string) => void;
  generatedHeadlinesForArticle: GeneratedHeadline[] | null;
  onSelectHeadlineForEdit: (headline: GeneratedHeadline) => void;
  generateHeadlinesForArticleScript: string;
  onGenerateHeadlinesForArticleScriptChange: (script: string) => void;
}

const RefineArticlePanel: React.FC<RefineArticlePanelProps> = ({
  isEnhancingArticle,
  isPolishingArticle,
  isGeneratingHeadlines,
  generatedArticleHistory,
  currentArticleIterationIndex,
  onRevertToIteration,
  onEnhanceArticle,
  onPolishArticle,
  onGenerateHeadlinesForArticle,
  generatedHeadlinesForArticle,
  onSelectHeadlineForEdit,
  generateHeadlinesForArticleScript,
  onGenerateHeadlinesForArticleScriptChange,
}) => {
    
    const [copiedType, setCopiedType] = useState<'none' | 'html' | 'md'>('none');
    const [selectedSuggestions, setSelectedSuggestions] = useState<Suggestion[]>([]);
    const [editorNote, setEditorNote] = useState('');
    const [polishScript, setPolishScript] = useState(POLISH_ARTICLE_SCRIPT);

    const articleContentRef = useRef<HTMLDivElement>(null);

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

    const handleCopyHTML = () => {
        if (articleContentRef.current) {
            const html = articleContentRef.current.innerHTML;
            const plainText = fullArticleMarkdown; // Use markdown source for a cleaner plain text representation

            const listener = (e: ClipboardEvent) => {
                e.preventDefault();
                if (e.clipboardData) {
                    e.clipboardData.setData('text/html', html);
                    e.clipboardData.setData('text/plain', plainText);
                }
            };

            document.addEventListener('copy', listener);
            document.execCommand('copy');
            document.removeEventListener('copy', listener);

            setCopiedType('html');
            setTimeout(() => setCopiedType('none'), 2000);
        }
    };

    const handleCopyMarkdown = () => {
        if (!fullArticleMarkdown) return;
        navigator.clipboard.writeText(fullArticleMarkdown).then(() => {
            setCopiedType('md');
            setTimeout(() => setCopiedType('none'), 2000);
        }).catch(err => {
            console.error('Failed to copy markdown text: ', err);
            alert('Failed to copy markdown. Please try again.');
        });
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
    
    const getArticleTypeDisplayName = (type: GeneratedArticle['type']) => {
        switch (type) {
            case 'initial': return 'Initial Draft';
            case 'enhanced': return 'Enhanced';
            case 'polished': return 'Polished';
            default: return 'Draft';
        }
    };

    if (!currentArticle) {
         return (
            <div className="space-y-8 animate-fade-in text-center">
                <h1 className="text-3xl font-bold">Refine Article</h1>
                <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg">
                    <p className="text-gray-400">No article has been generated yet. Please go to the "Generate Article" page to start.</p>
                </div>
            </div>
        );
    }

    return (
    <div className="space-y-8 animate-fade-in">
        <h1 className="text-3xl font-bold">Refine Article</h1>

        <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold text-gray-200 mb-4">Version History</h3>
            <div className="overflow-x-auto rounded-lg border border-slate-700">
                <table className="min-w-full divide-y divide-slate-700">
                    <thead className="bg-slate-800">
                        <tr>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Version</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Score</th>
                        </tr>
                    </thead>
                    <tbody className="bg-slate-900/50 divide-y divide-slate-700">
                        {generatedArticleHistory.map((article, index) => (
                            <tr
                                key={index}
                                onClick={() => onRevertToIteration(index)}
                                className={`cursor-pointer transition-colors ${
                                    index === currentArticleIterationIndex
                                        ? 'bg-teal-600/20 hover:bg-teal-600/30'
                                        : 'hover:bg-slate-800/60'
                                }`}
                            >
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-200">Version {index + 1}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{getArticleTypeDisplayName(article.type)}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-teal-400 text-center">{article.score}/100</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        <div className="p-6 bg-slate-900/50 border border-slate-700 rounded-xl shadow-lg space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-200">Generated Article (Version {currentArticleIterationIndex + 1})</h2>
            </div>
            
            <div className="prose prose-invert max-w-none bg-gray-900 p-6 rounded-lg border border-slate-700" ref={articleContentRef}>
                <MarkdownRenderer content={fullArticleMarkdown} />
            </div>
            <div className="flex justify-end gap-3">
                <Button onClick={handleCopyMarkdown} className="bg-gray-700 hover:bg-gray-600 px-6 py-2 text-sm">{copiedType === 'md' ? 'Copied MD!' : 'Copy as Markdown'}</Button>
                <Button onClick={handleCopyHTML} className="bg-gray-700 hover:bg-gray-600 px-6 py-2 text-sm">{copiedType === 'html' ? 'Copied HTML!' : 'Copy for Paste (HTML)'}</Button>
                <Button onClick={handleDownload} className="bg-gray-700 hover:bg-gray-600 px-6 py-2 text-sm">Download Markdown</Button>
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
                
                <div className="flex justify-center mt-4" title={currentArticle?.headlineApplied ? "Enhancement is disabled after a headline has been applied to maintain content consistency." : ""}>
                    <Button 
                        onClick={handleEnhanceClick}
                        isLoading={isEnhancingArticle}
                        disabled={isGeneratingHeadlines || isPolishingArticle || !!currentArticle?.headlineApplied}
                        className="bg-blue-600 hover:bg-blue-500"
                    >
                        {isEnhancingArticle ? 'Minion is working on Enhancing...' : 'Enhance Article'}
                    </Button>
                </div>
            </div>
            
             <div className="pt-6 border-t border-slate-700/50">
                <h3 className="text-xl font-bold text-gray-200 mb-4">Final Polish</h3>
                 <p className="text-sm text-gray-400 mb-4">This step performs an aggressive, stylistic rewrite of the current version to inject personality and a direct, no-nonsense tone without changing the core arguments.</p>
                 
                 <label className="block text-sm font-medium text-gray-300 mb-1">Final Polish AI Script</label>
                 <p className="text-xs text-gray-500 mb-2">You can edit the script below to customize the polishing process.</p>
                 <textarea 
                    value={polishScript}
                    onChange={(e) => setPolishScript(e.target.value)} 
                    rows={10}
                    className="w-full p-3 bg-gray-900 rounded-md text-sm font-mono whitespace-pre-wrap text-gray-300 border border-slate-600 focus:ring-2 focus:ring-teal-400" 
                />
                 <div className="flex justify-center mt-4">
                    <Button
                        onClick={() => onPolishArticle(polishScript)}
                        isLoading={isPolishingArticle}
                        disabled={isEnhancingArticle || isGeneratingHeadlines || !!currentArticle.headlineApplied}
                        className="bg-blue-600 hover:bg-blue-500"
                    >
                       {isPolishingArticle ? 'Minion is working on Polishing...' : 'Apply Final Polish'}
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
                <div className="pt-6 border-t border-slate-700/50 text-center space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">AI Script for Headline Generation</label>
                        <p className="text-xs text-gray-500 mb-2">This script instructs the AI on how to generate and evaluate headlines for the current article.</p>
                        <textarea
                            value={generateHeadlinesForArticleScript}
                            onChange={(e) => onGenerateHeadlinesForArticleScriptChange(e.target.value)}
                            rows={12}
                            className="w-full p-3 bg-gray-900 rounded-md text-sm font-mono whitespace-pre-wrap text-gray-300 border border-slate-600 focus:ring-2 focus:ring-teal-400"
                        />
                    </div>
                    <Button 
                        onClick={() => onGenerateHeadlinesForArticle(generateHeadlinesForArticleScript)}
                        isLoading={isGeneratingHeadlines}
                        disabled={isEnhancingArticle || isPolishingArticle}
                        className="bg-blue-600 hover:bg-blue-500"
                    >
                        {isGeneratingHeadlines ? 'Minion is working on Generating Headlines...' : 'Generate Headlines for this Article'}
                    </Button>
                </div>
            ) : (
                 <div className="pt-6 border-t border-slate-700/50 text-center">
                    <div className="p-4 bg-green-900/30 border border-green-700 rounded-lg">
                        <h3 className="text-xl font-bold text-green-300">Article Ready</h3>
                        <p className="text-sm text-green-400 mt-2">Your headline has been applied. You can now copy or download the final article.</p>
                    </div>
                </div>
            )}
        </div>
    </div>
    );
};

export default RefineArticlePanel;