import React from 'react';
import Button from './Button.tsx';
import { QueuedPost } from '../types.ts';

interface QuickPostPanelProps {
    topPost: QueuedPost | undefined;
    onQuickPost: () => void;
    isLoading: boolean;
    error: React.ReactNode | null;
    successMessage: string | null;
}

const QuickPostPanel: React.FC<QuickPostPanelProps> = ({
    topPost,
    onQuickPost,
    isLoading,
    error,
    successMessage
}) => {
    return (
        <div className="space-y-8 animate-fade-in">
            <h1 className="text-3xl font-bold">Quick Post</h1>
            <p className="text-gray-400">Instantly post the top item from your "Posts Queue".</p>

            <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg space-y-6 max-w-2xl mx-auto">
                {error && (
                    <div className="bg-red-900/50 p-4 rounded-lg border border-red-700 text-sm text-red-300">
                        {error}
                    </div>
                )}
                {successMessage && (
                    <div className="bg-green-900/50 p-4 rounded-lg border border-green-700 text-sm text-green-300 space-y-2">
                        <p className="font-bold">Successfully Posted:</p>
                        <pre className="whitespace-pre-wrap font-sans">{successMessage}</pre>
                    </div>
                )}
                
                {!successMessage && (
                    <>
                        <h2 className="text-lg font-semibold text-gray-300">Next Post in Queue</h2>
                        {topPost ? (
                            <div className="p-4 bg-gray-900/50 border border-slate-700 rounded-lg space-y-3">
                                <h4 className="font-semibold text-teal-300">{topPost.title}</h4>
                                <pre className="text-sm text-gray-300 whitespace-pre-wrap font-sans p-2 bg-gray-800/50 rounded-md max-h-48 overflow-y-auto">
                                    {topPost.content}
                                </pre>
                                <div className="flex items-center gap-2 pt-2 border-t border-slate-700/50">
                                    <span className="text-xs font-semibold text-gray-400">Platforms:</span>
                                    <span className="text-xs text-gray-300">{(topPost.platforms && topPost.platforms.length > 0) ? topPost.platforms.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', ') : 'Not specified'}</span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 py-8">The posts queue is empty.</p>
                        )}
                        
                        <div className="text-center pt-4 border-t border-slate-700/50">
                            <Button onClick={onQuickPost} isLoading={isLoading} disabled={!topPost || isLoading}>
                                {isLoading ? 'Your Minion Is Working' : 'Quick Post Top Item'}
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
export default QuickPostPanel;
