
import React, { useState } from 'react';
import { GeneratedAudioScript, PodcastPlan } from '../types.ts';
import MarkdownRenderer from './MarkdownRenderer.tsx';
import PodcastPlanDisplay from './PodcastPlanDisplay.tsx';

interface ArchivePanelProps {
  title: string;
  type: 'audio' | 'podcast';
  items: (GeneratedAudioScript | PodcastPlan)[];
}

const ArchiveItem: React.FC<{ item: GeneratedAudioScript | PodcastPlan; type: 'audio' | 'podcast' }> = ({ item, type }) => {
    const [isOpen, setIsOpen] = useState(false);

    const dateStr = item.dateCreated ? new Date(item.dateCreated).toLocaleString() : 'Unknown Date';

    return (
        <div className="border border-slate-700 rounded-lg bg-slate-800/30 overflow-hidden transition-all duration-200">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex flex-col sm:flex-row sm:items-center justify-between p-4 text-left transition-colors ${isOpen ? 'bg-slate-800' : 'hover:bg-slate-800/50'}`}
            >
                <div className="flex-grow">
                    <h3 className="font-bold text-teal-300 text-lg">{item.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">{dateStr}</p>
                </div>
                <div className="mt-2 sm:mt-0 flex items-center gap-4 text-sm text-gray-400">
                    {type === 'audio' && (
                        <>
                            <span>{(item as GeneratedAudioScript).estimatedDuration}</span>
                            <span className="hidden sm:inline">•</span>
                            <span>{(item as GeneratedAudioScript).wordCount} words</span>
                        </>
                    )}
                    <svg 
                        className={`w-5 h-5 text-gray-500 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>
            
            {isOpen && (
                <div className="p-6 border-t border-slate-700 bg-slate-900/50 animate-fade-in">
                    {type === 'audio' ? (
                        <div className="prose prose-invert max-w-none">
                            <MarkdownRenderer content={(item as GeneratedAudioScript).scriptContent} />
                        </div>
                    ) : (
                        <PodcastPlanDisplay plan={item as PodcastPlan} />
                    )}
                </div>
            )}
        </div>
    );
};

const ArchivePanel: React.FC<ArchivePanelProps> = ({ title, type, items }) => {
    return (
        <div className="space-y-8 animate-fade-in">
            <h1 className="text-3xl font-bold">{title}</h1>
            {items.length === 0 ? (
                <div className="p-12 bg-slate-800/50 border border-slate-700 rounded-xl text-center text-gray-500">
                    <p>No items in the archive yet. Generate some {type === 'audio' ? 'scripts' : 'plans'} to see them here.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {items.map((item) => (
                        <ArchiveItem key={item.id} item={item} type={type} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ArchivePanel;
