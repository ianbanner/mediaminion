
import React, { useState, useEffect, useRef } from 'react';
import { PodcastIdea, PodcastPlan } from '../types.ts';
import Button from './Button.tsx';
import PodcastPlanDisplay from './PodcastPlanDisplay.tsx';

// Simple beep sound generator using Web Audio API
const playStageCompleteSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    oscillator.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1); // A5
    
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.3);
  } catch (e) {
    console.error("Audio play failed", e);
  }
};

const PodcastIdeaCard: React.FC<{
    idea: PodcastIdea;
    onSelect: (idea: PodcastIdea) => void;
    buttonText: string;
    isLoading: boolean;
    isSelected: boolean;
    isDisabled: boolean;
}> = ({ idea, onSelect, buttonText, isLoading, isSelected, isDisabled }) => {
    return (
        <div className={`p-6 border rounded-lg flex flex-col gap-4 transition-all duration-300 ${
            isSelected 
            ? 'bg-teal-900/20 border-teal-500 shadow-lg shadow-teal-500/10 ring-1 ring-teal-500' 
            : 'bg-slate-900/50 border-slate-700 hover:border-slate-600'
        } ${isDisabled ? 'opacity-50 grayscale' : ''}`}>
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
                <Button 
                    onClick={() => onSelect(idea)} 
                    isLoading={isLoading} 
                    disabled={isDisabled}
                    className={`w-full ${isSelected ? 'bg-teal-600 hover:bg-teal-500' : 'bg-blue-600 hover:bg-blue-500'}`}
                >
                    {isLoading ? 'Working...' : isSelected ? 'Selected' : buttonText}
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
  
  // Generation Handlers
  onGenerateIdeas: () => Promise<void>; // Promisified for internal await
  isGeneratingIdeas: boolean;
  generatedIdeas: PodcastIdea[] | null;
  
  onGenerateAdjacentIdeas: (idea: PodcastIdea) => Promise<void>; // Promisified
  isGeneratingAdjacentIdeas: boolean;
  selectedInitialIdea: PodcastIdea | null;
  generatedAdjacentIdeas: PodcastIdea[] | null;
  
  onGeneratePlan: (idea: PodcastIdea) => Promise<void>; // Promisified
  isGeneratingPlan: boolean;
  generatedPlan: PodcastPlan | null;
}

const GeneratePodcastPanel: React.FC<GeneratePodcastPanelProps> = ({
  sourceType, onSourceTypeChange, sourceUrl, onSourceUrlChange, sourceText, onSourceTextChange,
  script, onScriptChange, 
  onGenerateIdeas, isGeneratingIdeas, generatedIdeas,
  onGenerateAdjacentIdeas, isGeneratingAdjacentIdeas, selectedInitialIdea, generatedAdjacentIdeas,
  onGeneratePlan, isGeneratingPlan, generatedPlan,
}) => {
    const isSourceProvided = sourceType === 'url' ? sourceUrl.trim() !== '' : sourceText.trim() !== '';
    
    // Local state for Step 3 -> 4 transition
    const [selectedFinalIdea, setSelectedFinalIdea] = useState<PodcastIdea | null>(null);
    const [finalTitle, setFinalTitle] = useState('');
    const [titleError, setTitleError] = useState<string | null>(null);

    // Refs for scrolling to new sections
    const step2Ref = useRef<HTMLDivElement>(null);
    const step3Ref = useRef<HTMLDivElement>(null);
    const step4Ref = useRef<HTMLDivElement>(null);
    const resultRef = useRef<HTMLDivElement>(null);

    // --- Auto-Scroll Effects ---
    useEffect(() => {
        if (generatedIdeas && !isGeneratingIdeas) {
            playStageCompleteSound();
            setTimeout(() => step2Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
        }
    }, [generatedIdeas, isGeneratingIdeas]);

    useEffect(() => {
        if (generatedAdjacentIdeas && !isGeneratingAdjacentIdeas) {
            playStageCompleteSound();
            setTimeout(() => step3Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
        }
    }, [generatedAdjacentIdeas, isGeneratingAdjacentIdeas]);

    useEffect(() => {
        if (selectedFinalIdea) {
            setTimeout(() => step4Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
        }
    }, [selectedFinalIdea]);

    useEffect(() => {
        if (generatedPlan && !isGeneratingPlan) {
            playStageCompleteSound();
            setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
        }
    }, [generatedPlan, isGeneratingPlan]);


    // --- Handlers with State Reset Logic ---

    const handleStep1Generate = async () => {
        // Reset downstream steps
        // Note: The parent component holds the data state, but these calls trigger updates
        // We need to ensure we don't show old data while generating new
        await onGenerateIdeas();
        // Implicitly, the parent should handle clearing downstream data if we re-run step 1, 
        // but since state is lifted, we rely on the props updating.
    };

    const handleStep2Select = async (idea: PodcastIdea) => {
        setSelectedFinalIdea(null); // Clear step 3 selection
        setFinalTitle(''); 
        // Step 4 plan is cleared via parent logic usually, or we just won't show it because `generatedPlan` will be replaced
        await onGenerateAdjacentIdeas(idea);
    };

    const handleStep3Select = (idea: PodcastIdea) => {
        setSelectedFinalIdea(idea);
        setFinalTitle(idea.title);
        setTitleError(null);
        // We don't auto-generate plan here, we wait for user confirmation in Step 4
    };

    const handleStep4Generate = async () => {
        const trimmedTitle = finalTitle.trim();
        if (trimmedTitle === '') {
            setTitleError('Podcast title cannot be empty.');
            return;
        }
        setTitleError(null);
        if (selectedFinalIdea) {
            await onGeneratePlan({ ...selectedFinalIdea, title: trimmedTitle });
        }
    };

    return (
        <div className="space-y-12 animate-fade-in pb-24">
            <h1 className="text-3xl font-bold">Generate Podcast Plan</h1>

            {/* --- STEP 1: SOURCE --- */}
            <section className={`transition-opacity duration-500 ${isGeneratingIdeas ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold">1</div>
                    <h2 className="text-xl font-bold text-teal-300">Source Content for Ideas</h2>
                </div>
                
                <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg space-y-6">
                     <div>
                        <div className="flex items-center space-x-4 mb-3">
                            <button onClick={() => onSourceTypeChange('url')} className={`px-4 py-2 rounded-md font-semibold ${sourceType === 'url' ? 'bg-teal-600 text-white' : 'bg-gray-700 text-gray-300'}`}>URL</button>
                            <button onClick={() => onSourceTypeChange('text')} className={`px-4 py-2 rounded-md font-semibold ${sourceType === 'text' ? 'bg-teal-600 text-white' : 'bg-gray-700 text-gray-300'}`}>Text</button>
                        </div>
                        {sourceType === 'url' ? (
                            <input type="text" value={sourceUrl} onChange={(e) => onSourceUrlChange(e.target.value)} placeholder="Enter URL for the source article..." className="w-full p-3 bg-gray-900 border border-slate-600 rounded-md focus:ring-2 focus:ring-teal-400" />
                        ) : (
                            <textarea value={sourceText} onChange={(e) => onSourceTextChange(e.target.value)} rows={6} placeholder="Paste the source text here..." className="w-full p-3 bg-gray-900 border border-slate-600 rounded-md focus:ring-2 focus:ring-teal-400" />
                        )}
                    </div>
                    
                    <details className="pt-2 border-t border-slate-700/50">
                        <summary className="cursor-pointer text-xs font-semibold text-gray-400 hover:text-white">
                            Advanced: AI Idea Generation Script
                        </summary>
                        <div className="mt-2">
                          <textarea value={script} onChange={(e) => onScriptChange(e.target.value)} rows={10} className="w-full p-3 bg-gray-900 rounded-md text-xs font-mono whitespace-pre-wrap text-gray-300 border border-slate-600 focus:ring-2 focus:ring-teal-400"/>
                        </div>
                    </details>

                    <div className="text-center">
                         <Button onClick={handleStep1Generate} isLoading={isGeneratingIdeas} disabled={!isSourceProvided} className="bg-blue-600 hover:bg-blue-500 w-full md:w-auto">
                            {isGeneratingIdeas ? 'Your Minion is brainstorming...' : 'Generate Episode Ideas'}
                         </Button>
                    </div>
                </div>
            </section>

            {/* --- STEP 2: BROAD IDEA --- */}
            {(generatedIdeas || isGeneratingIdeas) && (
                <section ref={step2Ref} className={`animate-fade-in transition-opacity duration-500 ${isGeneratingAdjacentIdeas ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold">2</div>
                        <h2 className="text-xl font-bold text-teal-300">Select a Broad Idea</h2>
                    </div>

                    <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg space-y-4">
                        <p className="text-gray-400">Select one of these initial ideas to explore related, more specific episode concepts.</p>
                        {isGeneratingIdeas && !generatedIdeas ? (
                            <div className="text-center py-12">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-400 mb-4"></div>
                                <p className="text-gray-400">Brainstorming ideas...</p>
                            </div>
                        ) : (
                             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {generatedIdeas?.map((idea, index) => (
                                    <PodcastIdeaCard 
                                        key={index} 
                                        idea={idea} 
                                        onSelect={handleStep2Select}
                                        buttonText="Explore This Idea"
                                        isLoading={isGeneratingAdjacentIdeas && selectedInitialIdea?.title === idea.title}
                                        isSelected={selectedInitialIdea?.title === idea.title}
                                        isDisabled={isGeneratingAdjacentIdeas && selectedInitialIdea?.title !== idea.title}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            )}
            
            {/* --- STEP 3: FINAL TOPIC --- */}
            {(generatedAdjacentIdeas || isGeneratingAdjacentIdeas) && selectedInitialIdea && (
                 <section ref={step3Ref} className="animate-fade-in">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold">3</div>
                        <h2 className="text-xl font-bold text-teal-300">Select a Final Topic</h2>
                    </div>

                    <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg space-y-4">
                        <p className="text-gray-400">These are specific angles based on: <strong className="text-white">"{selectedInitialIdea.title}"</strong>.</p>
                        {isGeneratingAdjacentIdeas && !generatedAdjacentIdeas ? (
                             <div className="text-center py-12">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-400 mb-4"></div>
                                <p className="text-gray-400">Exploring specific angles...</p>
                            </div>
                        ) : (
                             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {generatedAdjacentIdeas?.map((idea, index) => (
                                    <PodcastIdeaCard 
                                        key={index} 
                                        idea={idea} 
                                        onSelect={handleStep3Select}
                                        buttonText="Select This Topic"
                                        isLoading={false}
                                        isSelected={selectedFinalIdea?.title === idea.title}
                                        isDisabled={false}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* --- STEP 4: FINALIZE --- */}
            {selectedFinalIdea && (
                <section ref={step4Ref} className={`animate-fade-in transition-opacity duration-500 ${isGeneratingPlan ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold">4</div>
                        <h2 className="text-xl font-bold text-teal-300">Finalize & Generate Plan</h2>
                    </div>

                    <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg space-y-4">
                        <p className="text-gray-400">Review the title for your selected topic: <strong className="text-white">"{selectedFinalIdea.title}"</strong>.</p>
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
                                onClick={handleStep4Generate}
                                isLoading={isGeneratingPlan}
                                disabled={!finalTitle.trim()}
                                className="bg-blue-600 hover:bg-blue-500 w-full md:w-auto"
                            >
                                {isGeneratingPlan ? 'Your Minion is writing the plan...' : 'Generate Full Podcast Plan'}
                            </Button>
                        </div>
                    </div>
                </section>
            )}

            {/* --- RESULT --- */}
            {generatedPlan && (
                <section ref={resultRef} className="animate-fade-in pt-8 border-t border-slate-700">
                    <PodcastPlanDisplay plan={generatedPlan} />
                </section>
            )}
        </div>
    );
};

export default GeneratePodcastPanel;
