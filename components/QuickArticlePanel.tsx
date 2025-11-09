import React, { useState } from 'react';
import Button from './Button.tsx';

const QuickArticlePanel: React.FC = () => {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = () => {
        setIsGenerating(true);
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <h1 className="text-3xl font-bold">Quick Article</h1>
            <p className="text-gray-400">Start the AI article generation process in the background. The new article will appear in the "Generate Articles" panel when ready.</p>
            
            <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg space-y-6 max-w-2xl mx-auto text-center">
                 {!isGenerating ? (
                    <Button onClick={handleGenerate} className="w-full max-w-xs">Start New Article Generation</Button>
                 ) : (
                    <div className="p-4 text-green-400 animate-fade-in-fast">
                        <p className="font-semibold">Article generation started!</p>
                        <p className="text-sm text-gray-400 mt-1">"Why Most Digital Transformations Fail Before They Start" is being generated. It will be available in the main app shortly.</p>
                         <button onClick={() => setIsGenerating(false)} className="mt-4 text-sm text-gray-400 hover:text-white underline">Start Another</button>
                    </div>
                 )}
                 <p className="text-xs text-gray-500 pt-4 border-t border-slate-700/50">This is a simulated action. In a real implementation, this would trigger a background job to create a new article draft.</p>
            </div>
        </div>
    );
};
export default QuickArticlePanel;