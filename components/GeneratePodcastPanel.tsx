

import React, { useState, useEffect } from 'react';
import { PodcastIdea, PodcastPlan } from '../types.ts';
import Button from './Button.tsx';
import PodcastPlanDisplay from './PodcastPlanDisplay.tsx';

const PodcastIdeaCard: React.FC<{
    idea: PodcastIdea;
    onSelect: (idea: PodcastIdea) => void;
    buttonText: string;
    isLoading: boolean;
}> = ({ idea, onSelect, buttonText, isLoading }) => {
    return (
        <div className="p-6 bg-slate-900/50 border border-slate-700 rounded-lg flex flex-col gap-4 transition-shadow hover:shadow-lg hover:shadow-teal-500/10">
            <h3 className="font-bold text-lg text-teal-300">{idea.title}</h3>
            <div>
                <h4 className="text-sm font-semibold text-gray-400 mb-1">Premise</h4>
                <p className="text-sm text-gray-300">{idea.summary}</p>
            </div>
            <div>
                <h4 className="text-sm font-semibold text-gray-400 mb-2">Key Segments</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
                    {idea.keyPoints.map((point, index) => (
                        <li key={index}>{point}</li>
                    ))}
                </ul>
            </div>
            <div className="mt-auto pt-4 text-center">
                <Button onClick={() => onSelect(idea)} isLoading={isLoading} className="w-full bg-blue-600 hover:bg-blue-500">
                    {isLoading ? 'Your Minion is working...' : buttonText}
                </Button>
            </div>
        </div>
    );
};

interface GeneratePodcastPanelProps {
  sourceType: 'url' | 'text';
  onSourceTypeChange: (type: 'url' | 'text') => void;
  sourceUrl: string;
  onSourceUrlChange: (url: string) => void;
  sourceText: string;
  onSourceTextChange: (text: string) => void;
  script: string;
  onScriptChange: (script: string) => void;
  onGenerateIdeas: () => void;
  isGeneratingIdeas: boolean;
  generatedIdeas: PodcastIdea[] | null;
  onGenerateAdjacentIdeas: (idea: PodcastIdea) => void;
  isGeneratingAdjacentIdeas: boolean;
  selectedInitialIdea: PodcastIdea | null;
  generatedAdjacentIdeas: PodcastIdea[] | null;
  onGeneratePlan: (idea: PodcastIdea) => void;
  isGeneratingPlan: boolean;
  generatedPlan: PodcastPlan | null;
}

const GeneratePodcastPanel: React.FC<GeneratePodcastPanelProps> = ({
  sourceType, onSourceTypeChange, sourceUrl, onSourceUrlChange, sourceText, onSourceTextChange,
  script, onScriptChange, onGenerateIdeas, isGeneratingIdeas, generatedIdeas,
  onGenerateAdjacentIdeas, isGeneratingAdjacentIdeas, selectedInitialIdea, generatedAdjacentIdeas,
  onGeneratePlan, isGeneratingPlan, generatedPlan,
}) => {
    const isSourceProvided = sourceType === 'url' ? sourceUrl.trim() !== '' : sourceText.trim() !== '';
    const [selectedFinalIdea, setSelectedFinalIdea] = useState<PodcastIdea | null>(null);
    const [finalTitle, setFinalTitle] = useState('');
    const [titleError, setTitleError] = useState<string | null>(null);

    useEffect(() => {
        if(selectedFinalIdea) {
            setFinalTitle(selectedFinalIdea.title);
            setTitleError(null);
        } else {
            setFinalTitle('');
            setTitleError(null);
        }
    }, [selectedFinalIdea]);
    
    const handleSelectFinalIdea = (idea: PodcastIdea) => {
        setSelectedFinalIdea(idea);
    };

    const handleGeneratePlanClick = () => {
        const trimmedTitle = finalTitle.trim();
        if (trimmedTitle === '') {
            setTitleError('Podcast title cannot be empty.');
            return;
        }
        if (trimmedTitle !== finalTitle) {
            setTitleError('Title cannot have leading or trailing spaces.');
            return;
        }
        setTitleError(null);
        if (selectedFinalIdea) {
            onGeneratePlan({ ...selectedFinalIdea, title: trimmedTitle });
        }
    };


    if (generatedPlan) {
        return <PodcastPlanDisplay plan={generatedPlan} />;
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <h1 className="text-3xl font-bold">Generate Podcast Plan</h1>

            {/* Step 1: Source Input */}
            <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg space-y-6">
                <h2 className="text-xl font-bold text-teal-300">1. Source Content for Ideas</h2>
                 <div>
                    <div className="flex items-center space-x-4 mb-3">
                        <button onClick={() => onSourceTypeChange('url')} className={`px-4 py-2 rounded-md font-semibold ${sourceType === 'url' ? 'bg-teal-600 text-white' : 'bg-gray-700 text-gray-300'}`}>URL</button>
                        <button onClick={() => onSourceTypeChange('text')} className={`px-4 py-2 rounded-md font-semibold ${sourceType === 'text' ? 'bg-teal-600 text-white' : 'bg-gray-700 text-gray-300'}`}>Text</button>
                    </div>
                    {sourceType === 'url' ? (
                        <input type="text" value={sourceUrl} onChange={(e) => onSourceUrlChange(e.target.value)} placeholder="Enter URL for the source article..." className="w-full p-3 bg-gray-900 border border-slate-600 rounded-md focus:ring-2 focus:ring-teal-400" />
                    ) : (
                        <textarea value={sourceText} onChange={(e) => onSourceTextChange(e.target.value)} rows={8} placeholder="Paste the source text here..." className="w-full p-3 bg-gray-900 border border-slate-600 rounded-md focus:ring-2 focus:ring-teal-400" />
                    )}
                </div>
                
                <details className="pt-4 border-t border-slate-700/50">
                    <summary className="cursor-pointer font-semibold text-gray-300 hover:text-white">
                        Advanced: AI Idea Generation Script
                    </summary>
                    <div className="mt-4">
                      <textarea value={script} onChange={(e) => onScriptChange(e.target.value)} rows={15} className="w-full p-3 bg-gray-900 rounded-md text-sm font-mono whitespace-pre-wrap text-gray-300 border border-slate-600 focus:ring-2 focus:ring-teal-400"/>
                    </div>
                </details>

                <div className="text-center">
                     <Button onClick={onGenerateIdeas} isLoading={isGeneratingIdeas} disabled={!isSourceProvided || isGeneratingAdjacentIdeas} className="bg-blue-600 hover:bg-blue-500">
                        {isGeneratingIdeas ? 'Your Minion is brainstorming...' : 'Generate Episode Ideas'}
                     </Button>
                </div>
            </div>

            {/* Step 2: Initial Ideas */}
            {(isGeneratingIdeas || generatedIdeas) && (
                 <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg space-y-4">
                    <h2 className="text-2xl font-bold text-gray-200">2. Select a Broad Idea</h2>
                    <p className="text-gray-400">Select one of these initial ideas to explore related, more specific episode concepts.</p>
                    {isGeneratingIdeas ? (
                        <p className="text-center text-gray-400 py-8">Your Minion is brainstorming brilliant podcast ideas...</p>
                    ) : (
                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {generatedIdeas?.map((idea, index) => (
                                <PodcastIdeaCard 
                                    key={index} 
                                    idea={idea} 
                                    onSelect={onGenerateAdjacentIdeas}
                                    buttonText="Explore This Idea"
                                    isLoading={isGeneratingAdjacentIdeas && selectedInitialIdea?.title === idea.title}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
            
            {/* Step 3: Adjacent Ideas */}
            {(isGeneratingAdjacentIdeas || generatedAdjacentIdeas) && selectedInitialIdea && (
                 <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg space-y-4">
                    <h2 className="text-2xl font-bold text-gray-200">3. Select a Final Idea</h2>
                    <p className="text-gray-400">These are adjacent ideas based on: <strong className="text-teal-300">"{selectedInitialIdea.title}"</strong>. Select one to generate a full episode plan.</p>
                    {isGeneratingAdjacentIdeas ? (
                         <p className="text-center text-gray-400 py-8">Your Minion is exploring related ideas...</p>
                    ) : (
                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {generatedAdjacentIdeas?.map((idea, index) => (
                                <PodcastIdeaCard 
                                    key={index} 
                                    idea={idea} 
                                    onSelect={handleSelectFinalIdea}
                                    buttonText="Select This Topic"
                                    isLoading={false}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Step 4: Finalize Title & Generate */}
            {selectedFinalIdea && !generatedPlan && (
                <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg space-y-4 animate-fade-in">
                    <h2 className="text-2xl font-bold text-teal-300">4. Finalize Title & Generate Plan</h2>
                    <p className="text-gray-400">Review or edit the title for your selected topic: <strong className="text-gray-200">"{selectedFinalIdea.title}"</strong>.</p>
                    <div>
                        <label htmlFor="final-podcast-title" className="block text-sm font-medium text-gray-300 mb-2">Podcast Episode Title</label>
                        <input 
                            id="final-podcast-title"
                            type="text"
                            value={finalTitle}
                            onChange={(e) => setFinalTitle(e.target.value)}
                            className={`w-full p-3 bg-gray-900 border rounded-md focus:ring-2 ${titleError ? 'border-red-500 ring-red-500' : 'border-slate-600 focus:ring-teal-400'}`}
                        />
                        {titleError && <p className="mt-2 text-sm text-red-400">{titleError}</p>}
                    </div>
                    <div className="text-center pt-4 border-t border-slate-700/50">
                        <Button
                            onClick={handleGeneratePlanClick}
                            isLoading={isGeneratingPlan}
                            disabled={!finalTitle.trim() || isGeneratingPlan}
                            className="bg-blue-600 hover:bg-blue-500"
                        >
                            {isGeneratingPlan ? 'Your Minion is working...' : 'Generate Plan'}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GeneratePodcastPanel;