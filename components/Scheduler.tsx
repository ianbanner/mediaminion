import React from 'react';
import Button from './Button.tsx';

interface SchedulerProps {
    instructions: string;
    onInstructionsChange: (newInstructions: string) => void;
    onParseSchedule: () => void;
    isParsing: boolean;
    parsedSchedule: string[];
}

const Scheduler: React.FC<SchedulerProps> = ({ instructions, onInstructionsChange, onParseSchedule, isParsing, parsedSchedule }) => {
    
    return (
        <div className="w-full space-y-8">
            <div className="w-full p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-200">Ayrshare Queue Scheduler</h2>
                </div>
                <p className="text-gray-400 text-sm">
                    Automate posting from your Ayrshare Queue. Write your desired daily posting times in the box below using natural language. The scheduler will post the top item from the queue at the specified times within a 5-minute random window.
                </p>
                <div>
                    <label htmlFor="schedule-instructions" className="block text-sm font-medium text-gray-300 mb-2">Posting Schedule Instructions</label>
                    <textarea 
                        id="schedule-instructions"
                        value={instructions}
                        onChange={(e) => onInstructionsChange(e.target.value)}
                        rows={4}
                        className="w-full p-4 bg-gray-900 border border-slate-600 rounded-md focus:ring-2 focus:ring-teal-400 font-mono text-sm"
                        placeholder="e.g., Post one at 8am, one at 1:30pm, and one at 5pm."
                    />
                </div>
                <div className="text-center">
                    <Button onClick={onParseSchedule} isLoading={isParsing}>
                        {isParsing ? 'Your Minion Is Working' : 'Update Schedule with AI'}
                    </Button>
                </div>
                 <div className="pt-4 border-t border-slate-700">
                    <h3 className="text-lg font-semibold text-gray-300">Current Active Schedule</h3>
                    {parsedSchedule.length > 0 ? (
                        <div className="mt-2 flex flex-wrap gap-3">
                            {parsedSchedule.sort().map(time => (
                                <span key={time} className="px-3 py-1 text-sm font-bold text-teal-300 bg-teal-900/50 border border-teal-700 rounded-full font-mono">
                                    {time}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 mt-2">
                            No schedule is active. Enter instructions and click "Update Schedule" to start.
                        </p>
                    )}
                    <p className="text-xs text-gray-500 mt-4">
                        Note: The scheduler checks the time every minute and requires this browser tab to be open to function. Desktop notifications will be used to announce successful posts (you may need to grant permission).
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Scheduler;