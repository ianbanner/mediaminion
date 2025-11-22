
import React, { useState, useRef } from 'react';
import { PodcastPlan } from '../types.ts';
import Button from './Button.tsx';
import MarkdownRenderer from './MarkdownRenderer.tsx';

interface PodcastPlanDisplayProps {
  plan: PodcastPlan;
}

const PodcastPlanDisplay: React.FC<PodcastPlanDisplayProps> = ({ plan }) => {
    const [copiedStates, setCopiedStates] = useState({
        planMd: false,
        planHtml: false,
        outlineMd: false,
        outlineHtml: false
    });

    const fullPlanRef = useRef<HTMLDivElement>(null);
    const outlineRef = useRef<HTMLDivElement>(null);

    const handleCopy = (type: 'plan' | 'outline', format: 'md' | 'html') => {
        const markdownContent = type === 'plan' ? plan.fullPlan : plan.outline;
        const key = `${type}${format.charAt(0).toUpperCase() + format.slice(1)}` as keyof typeof copiedStates;

        if (format === 'md') {
            navigator.clipboard.writeText(markdownContent).then(() => {
                setCopiedStates(prev => ({ ...prev, [key]: true }));
                setTimeout(() => setCopiedStates(prev => ({ ...prev, [key]: false })), 2000);
            });
        } else {
            // HTML Copy
            const ref = type === 'plan' ? fullPlanRef : outlineRef;
            if (ref.current) {
                const htmlContent = ref.current.innerHTML;
                
                const listener = (e: ClipboardEvent) => {
                    e.preventDefault();
                    if (e.clipboardData) {
                        e.clipboardData.setData('text/html', htmlContent);
                        // Fallback to markdown for plain text paste
                        e.clipboardData.setData('text/plain', markdownContent);
                    }
                };
                document.addEventListener('copy', listener);
                document.execCommand('copy');
                document.removeEventListener('copy', listener);

                setCopiedStates(prev => ({ ...prev, [key]: true }));
                setTimeout(() => setCopiedStates(prev => ({ ...prev, [key]: false })), 2000);
            }
        }
    };

    return (
        <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg space-y-4 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-200">Podcast Plan: {plan.title}</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Full Plan Box */}
                <div className="space-y-3 flex flex-col h-full">
                    <div className="flex justify-between items-center flex-wrap gap-2">
                        <h3 className="text-lg font-semibold text-teal-300">Full Plan</h3>
                        <div className="flex gap-2">
                             <Button 
                                onClick={() => handleCopy('plan', 'md')}
                                className="bg-gray-700 hover:bg-gray-600 px-3 py-1 text-xs"
                             >
                                {copiedStates.planMd ? 'Copied MD!' : 'Copy MD'}
                             </Button>
                             <Button 
                                onClick={() => handleCopy('plan', 'html')}
                                className="bg-gray-700 hover:bg-gray-600 px-3 py-1 text-xs"
                             >
                                {copiedStates.planHtml ? 'Copied HTML!' : 'Copy HTML'}
                             </Button>
                        </div>
                    </div>
                    <div 
                        className="prose prose-invert max-w-none bg-gray-900 p-4 rounded-lg border border-slate-700 h-96 overflow-y-auto"
                        ref={fullPlanRef}
                    >
                        <MarkdownRenderer content={plan.fullPlan} />
                    </div>
                </div>
                {/* Outline Box */}
                <div className="space-y-3 flex flex-col h-full">
                    <div className="flex justify-between items-center flex-wrap gap-2">
                        <h3 className="text-lg font-semibold text-teal-300">Outline</h3>
                        <div className="flex gap-2">
                             <Button 
                                onClick={() => handleCopy('outline', 'md')}
                                className="bg-gray-700 hover:bg-gray-600 px-3 py-1 text-xs"
                             >
                                {copiedStates.outlineMd ? 'Copied MD!' : 'Copy MD'}
                             </Button>
                             <Button 
                                onClick={() => handleCopy('outline', 'html')}
                                className="bg-gray-700 hover:bg-gray-600 px-3 py-1 text-xs"
                             >
                                {copiedStates.outlineHtml ? 'Copied HTML!' : 'Copy HTML'}
                             </Button>
                        </div>
                    </div>
                     <div 
                        className="prose prose-invert max-w-none bg-gray-900 p-4 rounded-lg border border-slate-700 h-96 overflow-y-auto"
                        ref={outlineRef}
                    >
                        <MarkdownRenderer content={plan.outline} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PodcastPlanDisplay;
