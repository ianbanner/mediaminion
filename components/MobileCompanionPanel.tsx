
import React, { useState } from 'react';
import { QueuedPost, ArticleIdea } from '../types.ts';
import { v4 as uuidv4 } from 'uuid';

interface MobileCompanionPanelProps {
  queue: QueuedPost[];
  ideas: ArticleIdea[] | null;
  onAddDraftPost: (post: QueuedPost) => void;
  onExitMobileMode: () => void;
}

const MobileCompanionPanel: React.FC<MobileCompanionPanelProps> = ({ queue, ideas, onAddDraftPost, onExitMobileMode }) => {
  const [activeTab, setActiveTab] = useState<'capture' | 'queue' | 'ideas'>('capture');
  const [draftContent, setDraftContent] = useState('');
  const [draftTitle, setDraftTitle] = useState('');

  const handleSaveDraft = () => {
    if (!draftContent.trim()) return;
    
    const newPost: QueuedPost = {
        id: uuidv4(),
        title: draftTitle.trim() || `Idea: ${draftContent.slice(0, 20)}...`,
        content: draftContent,
        assessment: 'Mobile Capture',
        score: 0,
        status: 'draft',
        platforms: ['linkedin']
    };
    
    onAddDraftPost(newPost);
    setDraftContent('');
    setDraftTitle('');
    alert('Saved to Queue as Draft!');
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 text-white flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-slate-800 border-b border-slate-700">
            <h1 className="font-bold text-lg text-teal-400">Minion Mobile</h1>
            <button onClick={onExitMobileMode} className="text-xs text-gray-400 border border-gray-600 px-2 py-1 rounded">Exit Companion</button>
        </div>

        {/* Content Area */}
        <div className="flex-grow overflow-y-auto p-4 bg-gray-900">
            {activeTab === 'capture' && (
                <div className="space-y-4 animate-fade-in">
                    <h2 className="text-xl font-bold text-gray-200">Quick Capture</h2>
                    <input 
                        type="text" 
                        placeholder="Title (Optional)" 
                        value={draftTitle}
                        onChange={(e) => setDraftTitle(e.target.value)}
                        className="w-full p-3 bg-gray-800 border border-slate-700 rounded-lg focus:outline-none focus:border-teal-500"
                    />
                    <textarea 
                        placeholder="What's on your mind? Capture it now, refine later." 
                        value={draftContent}
                        onChange={(e) => setDraftContent(e.target.value)}
                        rows={8}
                        className="w-full p-3 bg-gray-800 border border-slate-700 rounded-lg focus:outline-none focus:border-teal-500 text-lg"
                    />
                    <button 
                        onClick={handleSaveDraft}
                        disabled={!draftContent.trim()}
                        className="w-full py-4 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg shadow-lg disabled:opacity-50 disabled:bg-gray-700"
                    >
                        Save to Drafts
                    </button>
                </div>
            )}

            {activeTab === 'queue' && (
                <div className="space-y-4 animate-fade-in">
                    <h2 className="text-xl font-bold text-gray-200">Your Queue</h2>
                    {queue.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">Queue is empty.</p>
                    ) : (
                        queue.map(post => (
                            <div key={post.id} className="p-3 bg-slate-800 border border-slate-700 rounded-lg">
                                <div className="flex justify-between mb-1">
                                    <span className="font-bold text-teal-300 text-sm">{post.title}</span>
                                    <span className="text-xs text-gray-500 uppercase">{post.status || 'scheduled'}</span>
                                </div>
                                <p className="text-sm text-gray-300 line-clamp-3">{post.content}</p>
                            </div>
                        ))
                    )}
                </div>
            )}

            {activeTab === 'ideas' && (
                <div className="space-y-4 animate-fade-in">
                    <h2 className="text-xl font-bold text-gray-200">Saved Ideas</h2>
                    {!ideas || ideas.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No generated ideas available.</p>
                    ) : (
                        ideas.map((idea, idx) => (
                            <div key={idx} className="p-3 bg-slate-800 border border-slate-700 rounded-lg">
                                <h3 className="font-bold text-white text-sm">{idea.title}</h3>
                                <p className="text-xs text-gray-400 mt-1">{idea.summary}</p>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>

        {/* Bottom Nav */}
        <div className="flex justify-around items-center p-2 bg-slate-800 border-t border-slate-700 pb-safe">
            <button 
                onClick={() => setActiveTab('capture')}
                className={`flex flex-col items-center p-2 ${activeTab === 'capture' ? 'text-teal-400' : 'text-gray-500'}`}
            >
                <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                <span className="text-xs font-medium">Capture</span>
            </button>
            <button 
                onClick={() => setActiveTab('queue')}
                className={`flex flex-col items-center p-2 ${activeTab === 'queue' ? 'text-teal-400' : 'text-gray-500'}`}
            >
                <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                <span className="text-xs font-medium">Queue</span>
            </button>
            <button 
                onClick={() => setActiveTab('ideas')}
                className={`flex flex-col items-center p-2 ${activeTab === 'ideas' ? 'text-teal-400' : 'text-gray-500'}`}
            >
                <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                <span className="text-xs font-medium">Ideas</span>
            </button>
        </div>
    </div>
  );
};

export default MobileCompanionPanel;
