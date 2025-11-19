import React, { useState } from 'react';
import { PodcastPlan } from '../types.ts';
import Button from './Button.tsx';
import MarkdownRenderer from './MarkdownRenderer.tsx';

interface PodcastPlanDisplayProps {
  plan: PodcastPlan;
}

const CopyButton: React.FC<{ onCopy: () => void, isCopied: boolean }> = ({ onCopy, isCopied }) => (
    <Button onClick={onCopy} className="bg-gray-700 hover:bg-gray-600 px-4 py-1.5 text-sm">
        {isCopied ? 'Copied!' : 'Copy'}
    </Button>
);

const PodcastPlanDisplay: React.FC<PodcastPlanDisplayProps> = ({ plan }) => {
    const [copiedBox, setCopiedBox] = useState<'none' | 'plan' | 'outline'>('none');

    const handleCopy = (content: string, type: 'plan' | 'outline') => {
        navigator.clipboard.writeText(content).then(() => {
            setCopiedBox(type);
            setTimeout(() => setCopiedBox('none'), 2000);
        });
    };

    return (
        <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg space-y-4 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-200">Podcast Plan: {plan.title}</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Full Plan Box */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-teal-300">Full Plan</h3>
                        <CopyButton onCopy={() => handleCopy(plan.fullPlan, 'plan')} isCopied={copiedBox === 'plan'} />
                    </div>
                    <div className="prose prose-invert max-w-none bg-gray-900 p-4 rounded-lg border border-slate-700 h-96 overflow-y-auto">
                        <MarkdownRenderer content={plan.fullPlan} />
                    </div>
                </div>
                {/* Outline Box */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-teal-300">Outline</h3>
                         <CopyButton onCopy={() => handleCopy(plan.outline, 'outline')} isCopied={copiedBox === 'outline'} />
                    </div>
                     <div className="prose prose-invert max-w-none bg-gray-900 p-4 rounded-lg border border-slate-700 h-96 overflow-y-auto">
                        <MarkdownRenderer content={plan.outline} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PodcastPlanDisplay;
