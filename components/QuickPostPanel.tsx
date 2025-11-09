import React, { useState } from 'react';
import Button from './Button.tsx';
import { TopPostAssessment } from '../types.ts';

interface QuickPostPanelProps {
    onSendToQueue: (post: TopPostAssessment) => void;
}

const QuickPostPanel: React.FC<QuickPostPanelProps> = ({ onSendToQueue }) => {
    const [generatedPost, setGeneratedPost] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isQueued, setIsQueued] = useState(false);

    const handleGenerate = () => {
        setIsGenerating(true);
        setGeneratedPost(null);
        setIsQueued(false);
        setTimeout(() => {
            setGeneratedPost(`This is a simulated quick post generated from the top article idea in your queue.

It uses a random high-performing template to create engaging content on the fly.

#AI #Leadership #Productivity`);
            setIsGenerating(false);
        }, 1500);
    };
    
    const handleSend = () => {
        if (generatedPost) {
            onSendToQueue({
                title: 'Quick Post',
                content: generatedPost,
                assessment: 'Generated via Quick Post feature.',
                score: 0 // Score is not relevant here
            });
            setIsQueued(true);
        }
    };
    
    return (
        <div className="space-y-8 animate-fade-in">
            <h1 className="text-3xl font-bold">Quick Post</h1>
            <p className="text-gray-400">Generate a single, high-quality post based on your persona and templates without the full analysis workflow.</p>

            <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg space-y-6 max-w-2xl mx-auto">
                <div className="text-center">
                    <Button onClick={handleGenerate} isLoading={isGenerating} disabled={isGenerating || !!generatedPost}>
                        {isGenerating ? 'Your Minion Is Working' : 'Generate New Post'}
                    </Button>
                </div>
                
                {generatedPost && (
                    <div className="pt-6 border-t border-slate-700/50 space-y-4 animate-fade-in-fast">
                        <h3 className="text-lg font-semibold text-gray-300">Generated Post</h3>
                         <textarea
                            value={generatedPost}
                            readOnly
                            rows={8}
                            className="w-full p-3 bg-gray-900 rounded-md text-sm font-mono whitespace-pre-wrap text-gray-300 border border-slate-600"
                        />
                        <div className="flex justify-center gap-4">
                            <Button onClick={handleSend} className="bg-green-600 hover:bg-green-500" disabled={isQueued}>
                                {isQueued ? 'Sent to Queue!' : 'Sent to Queue'}
                            </Button>
                             <Button onClick={handleGenerate} className="bg-gray-600 hover:bg-gray-500" disabled={isGenerating || isQueued}>
                                Discard & Try Again
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
export default QuickPostPanel;