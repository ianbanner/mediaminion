
import React, { useState, useRef } from 'react';
import { PodcastPlan } from '../types.ts';
import Button from './Button.tsx';
import MarkdownRenderer from './MarkdownRenderer.tsx';

interface PodcastPlanDisplayProps {
  plan: PodcastPlan;
}

const PodcastPlanDisplay: React.FC<PodcastPlanDisplayProps> = ({ plan }) => {
    const [copiedStates, setCopiedStates] = useState({
        md: false,
        html: false
    });

    const contentRef = useRef<HTMLDivElement>(null);

    const handleCopy = (format: 'md' | 'html') => {
        if (format === 'md') {
            const combinedMarkdown = `# Podcast Outline\n\n${plan.outline}\n\n---\n\n# Full Episode Script\n\n${plan.fullPlan}`;
            navigator.clipboard.writeText(combinedMarkdown).then(() => {
                setCopiedStates(prev => ({ ...prev, md: true }));
                setTimeout(() => setCopiedStates(prev => ({ ...prev, md: false })), 2000);
            });
        } else {
            // HTML Copy
            if (contentRef.current) {
                const htmlContent = contentRef.current.innerHTML;
                
                const listener = (e: ClipboardEvent) => {
                    e.preventDefault();
                    if (e.clipboardData) {
                        e.clipboardData.setData('text/html', htmlContent);
                        // Fallback to markdown for plain text paste
                        const combinedMarkdown = `# Podcast Outline\n\n${plan.outline}\n\n---\n\n# Full Episode Script\n\n${plan.fullPlan}`;
                        e.clipboardData.setData('text/plain', combinedMarkdown);
                    }
                };
                document.addEventListener('copy', listener);
                document.execCommand('copy');
                document.removeEventListener('copy', listener);

                setCopiedStates(prev => ({ ...prev, html: true }));
                setTimeout(() => setCopiedStates(prev => ({ ...prev, html: false })), 2000);
            }
        }
    };

    return (
        <div className="space-y-4 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-200">Podcast Plan: {plan.title}</h2>
            </div>

            {/* Unified Toolbar */}
            <div className="bg-slate-800/80 border border-slate-700 rounded-t-xl p-4 flex items-center justify-end gap-4">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-2">Export Full Plan:</span>
                <div className="flex items-center gap-2">
                    <Button 
                        onClick={() => handleCopy('md')}
                        className="bg-slate-700 hover:bg-slate-600 px-4 py-2 text-xs h-9 min-w-[100px]"
                    >
                        {copiedStates.md ? 'Copied All!' : 'Copy All (MD)'}
                    </Button>
                    <Button 
                        onClick={() => handleCopy('html')}
                        className="bg-slate-700 hover:bg-slate-600 px-4 py-2 text-xs h-9 min-w-[100px]"
                    >
                        {copiedStates.html ? 'Copied All!' : 'Copy All (HTML)'}
                    </Button>
                </div>
            </div>

            {/* Single Text Box Content */}
            <div ref={contentRef} className="bg-slate-900/80 border border-slate-700 border-t-0 rounded-b-xl p-8 h-[700px] overflow-y-auto custom-scrollbar shadow-inner">
                
                {/* Outline Section */}
                <div className="mb-12">
                    <h3 className="text-xl font-bold text-teal-300 mb-6 border-b border-teal-900/50 pb-2">Podcast Outline</h3>
                    <div className="prose prose-invert max-w-none">
                        <MarkdownRenderer content={plan.outline} />
                    </div>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-4 my-12 opacity-50">
                    <div className="h-px bg-slate-600 flex-grow"></div>
                    <span className="text-slate-500 text-sm uppercase font-semibold tracking-widest">Full Script Below</span>
                    <div className="h-px bg-slate-600 flex-grow"></div>
                </div>

                {/* Full Plan Section */}
                <div>
                    <h3 className="text-xl font-bold text-teal-300 mb-6 border-b border-teal-900/50 pb-2">Full Episode Script</h3>
                    <div className="prose prose-invert max-w-none">
                        <MarkdownRenderer content={plan.fullPlan} />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default PodcastPlanDisplay;
