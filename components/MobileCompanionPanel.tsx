import React, { useState } from 'react';
import Button from './Button.tsx';

const MobileCompanionPanel: React.FC = () => {
    const [generatedPost, setGeneratedPost] = useState<string | null>(null);
    const [isGeneratingPost, setIsGeneratingPost] = useState(false);
    const [isGeneratingArticle, setIsGeneratingArticle] = useState(false);
    const [postQueued, setPostQueued] = useState(false);

    const handleGeneratePost = () => {
        setIsGeneratingPost(true);
        setGeneratedPost(null);
        setPostQueued(false);
        setTimeout(() => {
            setGeneratedPost(`This is a simulated post generated from the top article idea in your queue.

It uses a random high-performing template to create engaging content on the fly.

#AI #Leadership #Productivity`);
            setIsGeneratingPost(false);
        }, 1500);
    };

    const handleSendToQueue = () => {
        setPostQueued(true);
        setTimeout(() => {
            setGeneratedPost(null);
            setPostQueued(false);
        }, 2000);
    };

    const handleStartArticle = () => {
        setIsGeneratingArticle(true);
    };

    return (
        <div className="flex flex-col items-center animate-fade-in">
             <h1 className="text-3xl font-bold mb-2">Mobile Companion Mockup</h1>
             <p className="text-gray-400 mb-8 max-w-2xl text-center">This is a visual concept of a streamlined mobile app for quick actions. The functionality here is simulated and does not affect your actual data.</p>
            
            <div className="w-full max-w-sm mx-auto bg-black border-8 border-gray-800 rounded-3xl shadow-2xl p-4 space-y-6">
                <div className="text-center mb-4">
                    <h2 className="text-xl font-bold text-white">Mobile Quick Actions</h2>
                </div>

                {/* Quick Post Section */}
                <div className="p-4 bg-slate-800/50 rounded-xl space-y-4">
                    <h3 className="font-semibold text-teal-300">Quick Post</h3>
                    {!generatedPost && !isGeneratingPost && (
                        <Button onClick={handleGeneratePost} className="w-full">Generate New Post</Button>
                    )}

                    {isGeneratingPost && (
                        <div className="text-center text-gray-400 p-4">
                            <svg className="animate-spin mx-auto h-6 w-6 text-white mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Generating...
                        </div>
                    )}
                    
                    {generatedPost && (
                        <div className="space-y-3 animate-fade-in-fast">
                            <textarea
                                value={generatedPost}
                                readOnly
                                rows={8}
                                className="w-full p-3 bg-gray-900 rounded-md text-sm font-mono whitespace-pre-wrap text-gray-300 border border-slate-600"
                            />
                            <div className="flex gap-2">
                                <Button onClick={handleSendToQueue} className="flex-1 bg-green-600 hover:bg-green-500" disabled={postQueued}>
                                    {postQueued ? 'Sent!' : 'Send to Queue'}
                                </Button>
                                <Button onClick={handleGeneratePost} className="flex-1 bg-gray-600 hover:bg-gray-500" disabled={postQueued}>
                                    Discard & Try Again
                                </Button>
                            </div>
                            {postQueued && <p className="text-green-400 text-center text-sm">Post sent to main queue!</p>}
                        </div>
                    )}
                </div>

                {/* Quick Article Section */}
                <div className="p-4 bg-slate-800/50 rounded-xl space-y-4">
                     <h3 className="font-semibold text-teal-300">Quick Article</h3>
                     {!isGeneratingArticle ? (
                        <Button onClick={handleStartArticle} className="w-full">Start New Article</Button>
                     ) : (
                        <div className="text-center p-4 text-green-400 animate-fade-in-fast">
                            <p className="font-semibold">Article generation started!</p>
                            <p className="text-sm text-gray-400 mt-1">"Why Most Digital Transformations Fail Before They Start" is being generated. It will be available in the main app shortly.</p>
                             <button onClick={() => setIsGeneratingArticle(false)} className="mt-4 text-sm text-gray-400 hover:text-white">Start Another</button>
                        </div>
                     )}
                </div>
            </div>
             <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out forwards;
                }
                 @keyframes fade-in-fast {
                    from { opacity: 0; transform: translateY(5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-fast {
                    animation: fade-in-fast 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default MobileCompanionPanel;