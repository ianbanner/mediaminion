import React from 'react';
import Button from './Button.tsx';
import { QueuedPost } from '../types.ts';

interface SchedulerProps {
    instructions: string;
    onInstructionsChange: (newInstructions: string) => void;
    onUpdateSchedule: () => void;
    isUpdating: boolean;
    parsedSchedule: string[];
    queueCount: number;
    scheduledPosts: QueuedPost[];
    historicalPosts: QueuedPost[];
    onSendToAyrshare: () => void;
    isSendingToAyrshare: boolean;
    error: React.ReactNode | null;
}

const KpiCard: React.FC<{ title: string; value: string; description: string; }> = ({ title, value, description }) => (
    <div className="p-4 bg-slate-900/70 border border-slate-700 rounded-lg text-center">
        <h3 className="text-sm font-medium text-gray-400">{title}</h3>
        <p className="mt-1 text-3xl font-bold text-teal-300">{value}</p>
        <p className="mt-1 text-xs text-gray-500">{description}</p>
    </div>
);

const formatDate = (isoString?: string) => {
    if (!isoString) return 'Not Scheduled';
    try {
        const date = new Date(isoString);
        return date.toLocaleString('en-GB', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    } catch (e) {
        return 'Invalid Date';
    }
};

const renderStatusBadge = (status?: QueuedPost['status']) => {
    const statusMap = {
        scheduled: { text: 'Scheduled', color: 'bg-blue-900/50 text-blue-300 border-blue-700' },
        'sent-to-ayrshare': { text: 'With Ayrshare', color: 'bg-yellow-900/50 text-yellow-300 border-yellow-700' },
        posted: { text: 'Posted', color: 'bg-green-900/50 text-green-300 border-green-700' },
        error: { text: 'Error', color: 'bg-red-900/50 text-red-300 border-red-700' },
    };
    if (!status) return null;
    const { text, color } = statusMap[status];
    return (
        <span className={`px-2 py-0.5 text-xs font-bold rounded-full border ${color}`}>
            {text}
        </span>
    );
};

const Scheduler: React.FC<SchedulerProps> = ({
    instructions,
    onInstructionsChange,
    onUpdateSchedule,
    isUpdating,
    parsedSchedule,
    queueCount,
    scheduledPosts,
    historicalPosts,
    onSendToAyrshare,
    isSendingToAyrshare,
    error,
}) => {
    const hasScheduledButNotSentPosts = scheduledPosts.some(p => p.status === 'scheduled');
    return (
        <div className="space-y-8 animate-fade-in">
            <h1 className="text-3xl font-bold">Scheduler Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <KpiCard title="Posts in Queue" value={queueCount.toString()} description="Ready to be scheduled" />
                <KpiCard title="Scheduled Posts" value={scheduledPosts.length.toString()} description="Lined up for posting" />
                <KpiCard title="Daily Time Slots" value={parsedSchedule.length.toString()} description="Based on your instructions" />
            </div>

            <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg space-y-4">
                <h2 className="text-xl font-bold">Scheduling Instructions</h2>
                <p className="text-sm text-gray-400">
                    Use natural language to set your posting schedule. For example: "Post once at 8am and again at 5pm UK time on weekdays".
                    When you update the schedule, all posts currently in the queue will be moved and scheduled accordingly.
                </p>
                <textarea
                    value={instructions}
                    onChange={(e) => onInstructionsChange(e.target.value)}
                    rows={4}
                    className="w-full p-3 bg-gray-900 border border-slate-600 rounded-md focus:ring-2 focus:ring-teal-400"
                />
                <div className="text-center">
                    <Button onClick={onUpdateSchedule} isLoading={isUpdating}>
                        {isUpdating ? 'Your Minion Is Working...' : 'Update Schedule & Move Queued Posts'}
                    </Button>
                </div>
            </div>

            <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg space-y-4">
                <h2 className="text-xl font-bold">Send to Ayrshare</h2>
                <p className="text-sm text-gray-400">
                    This will send all posts with a "Scheduled" status to Ayrshare to be posted at their specified times. Posts already sent will not be sent again.
                </p>
                {error && <div className="p-3 bg-red-900/50 text-red-300 border border-red-700 rounded-md text-sm">{error}</div>}
                <div className="text-center">
                    <Button 
                        onClick={onSendToAyrshare} 
                        isLoading={isSendingToAyrshare}
                        disabled={!hasScheduledButNotSentPosts || isSendingToAyrshare}
                        className="bg-teal-600 hover:bg-teal-500"
                    >
                        {isSendingToAyrshare ? 'Sending to Ayrshare...' : 'Send Schedule to Ayrshare'}
                    </Button>
                </div>
            </div>

            <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg space-y-4">
                <h2 className="text-2xl font-bold text-gray-200">Scheduled Posts</h2>
                {scheduledPosts.length > 0 ? (
                    <div className="space-y-4">
                        {scheduledPosts.map(post => (
                            <div key={post.id} className="p-4 bg-slate-900/50 border border-slate-700 rounded-lg space-y-2">
                                <div className="flex justify-between items-start gap-2">
                                    <p className="text-sm text-teal-400 font-semibold">{formatDate(post.scheduledTime)}</p>
                                    {renderStatusBadge(post.status)}
                                </div>
                                <h4 className="font-semibold text-gray-200">{post.title}</h4>
                                <p className="text-sm text-gray-400 line-clamp-2">{post.content}</p>
                                <p className="text-xs text-gray-500">Platforms: {(post.platforms || []).join(', ') || 'None'}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500 py-8">
                        No posts have been scheduled yet. Add posts to the queue and update the schedule to see them here.
                    </p>
                )}
            </div>

            <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg space-y-4">
                <h2 className="text-2xl font-bold text-gray-200">Historical Posts</h2>
                {historicalPosts.length > 0 ? (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                        {historicalPosts.map(post => (
                            <div key={post.id} className="p-4 bg-slate-900/50 border border-slate-800 rounded-lg space-y-2 opacity-70">
                                <div className="flex justify-between items-start gap-2">
                                    <p className="text-sm text-gray-400 font-semibold">{formatDate(post.scheduledTime)}</p>
                                    {renderStatusBadge(post.status)}
                                </div>
                                <h4 className="font-semibold text-gray-300">{post.title}</h4>
                                <p className="text-sm text-gray-500 line-clamp-2">{post.content}</p>
                                <p className="text-xs text-gray-500">Platforms: {(post.platforms || []).join(', ') || 'None'}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500 py-8">
                        No posts have been published yet.
                    </p>
                )}
            </div>
        </div>
    );
};

export default Scheduler;