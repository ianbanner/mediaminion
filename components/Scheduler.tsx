import React, { useState, useEffect } from 'react';
import { ScheduledTask } from '../App';
import Button from './Button';

interface SchedulerProps {
    tasks: ScheduledTask[];
    onAddTask: (task: Omit<ScheduledTask, 'id' | 'lastRun' | 'nextRun' | 'status' | 'statusMessage'>) => void;
    onUpdateTask: (taskId: string, updates: Partial<ScheduledTask>) => void;
    onDeleteTask: (taskId: string) => void;
    isGoogleConnected: boolean;
    googleUserEmail: string;
    isConnecting: boolean;
    onGoogleConnect: () => void;
    onGoogleDisconnect: () => void;
}

const TaskModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (taskData: Omit<ScheduledTask, 'id' | 'lastRun' | 'nextRun' | 'status' | 'statusMessage'>) => void;
    task?: ScheduledTask | null;
}> = ({ isOpen, onClose, onSave, task }) => {
    const [name, setName] = useState('');
    const [type, setType] = useState<'generate-posts' | 'ayrshare-api'>('generate-posts');
    const [scheduleTime, setScheduleTime] = useState('09:00');

    useEffect(() => {
        if (task) {
            setName(task.name);
            setType(task.type);
            setScheduleTime(task.scheduleTime);
        } else {
            setName('');
            setType('generate-posts');
            setScheduleTime('09:00');
        }
    }, [task, isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        if (!name.trim()) return;
        onSave({ name, type, scheduleTime, enabled: task ? task.enabled : true });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-6 w-full max-w-md space-y-4" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold">{task ? 'Edit Task' : 'Add New Task'}</h3>
                <div>
                    <label htmlFor="task-name" className="block text-sm mb-1">Task Name</label>
                    <input id="task-name" type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 bg-gray-900 rounded-md" />
                </div>
                <div>
                    <label htmlFor="task-type" className="block text-sm mb-1">Task Type</label>
                    <select id="task-type" value={type} onChange={e => setType(e.target.value as any)} className="w-full p-2 bg-gray-900 rounded-md">
                        <option value="generate-posts">Generate Posts from URL Collection</option>
                        <option value="ayrshare-api">Post to Social Media (Ayrshare)</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="task-time" className="block text-sm mb-1">Run Daily At (local time)</label>
                    <input id="task-time" type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} className="w-full p-2 bg-gray-900 rounded-md" />
                </div>
                <div className="flex justify-end gap-4 pt-4">
                    <button onClick={onClose} className="px-4 py-2 rounded-md hover:bg-slate-700">Cancel</button>
                    <Button onClick={handleSave}>Save Task</Button>
                </div>
            </div>
        </div>
    );
};


const Scheduler: React.FC<SchedulerProps> = ({ tasks, onAddTask, onUpdateTask, onDeleteTask, isGoogleConnected, googleUserEmail, isConnecting, onGoogleConnect, onGoogleDisconnect }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const getStatusColor = (status: ScheduledTask['status']) => {
        switch (status) {
            case 'success': return 'text-green-400';
            case 'error': return 'text-red-400';
            case 'running': return 'text-yellow-400 animate-pulse';
            default: return 'text-gray-500';
        }
    };
    
    return (
        <div className="w-full space-y-8">
            <div className="w-full p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-200">Task Automation</h2>
                    <Button onClick={() => setIsModalOpen(true)}>+ Add New Task</Button>
                </div>
                <p className="text-gray-400 text-sm">Automate your content pipeline. Tasks run daily at your specified local time while the app is open.</p>
                <div className="space-y-4">
                    {tasks.length > 0 ? tasks.map(task => (
                        <div key={task.id} className="p-4 bg-slate-900/50 border border-slate-700 rounded-lg flex items-center justify-between">
                           <div className="flex items-center gap-4">
                                <label className="flex items-center cursor-pointer">
                                    <div className="relative">
                                        <input type="checkbox" checked={task.enabled} onChange={e => onUpdateTask(task.id, { enabled: e.target.checked })} className="sr-only" />
                                        <div className={`block w-12 h-6 rounded-full transition ${task.enabled ? 'bg-teal-500' : 'bg-gray-600'}`}></div>
                                        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${task.enabled ? 'transform translate-x-6' : ''}`}></div>
                                    </div>
                                </label>
                                <div>
                                    <h4 className="font-semibold">{task.name}</h4>
                                    <p className="text-sm text-gray-400">
                                        {task.type === 'generate-posts' ? 'Generate Posts' : 'Post to Socials'} @ {task.scheduleTime}
                                    </p>
                                    <div className="text-xs mt-1">
                                        <span className={`font-mono ${getStatusColor(task.status)}`}>{task.status.toUpperCase()}</span>
                                        <span className="text-gray-500"> - {task.statusMessage || `Last run: ${task.lastRun ? new Date(task.lastRun).toLocaleString() : 'Never'}`}</span>
                                    </div>
                                </div>
                           </div>
                           <div className="flex items-center gap-2">
                                <button onClick={() => onDeleteTask(task.id)} className="p-2 hover:text-red-400 text-gray-500"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                           </div>
                        </div>
                    )) : (
                        <div className="text-center py-8 text-gray-500">
                            <p>No automated tasks yet. Click "Add New Task" to get started.</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="w-full p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg space-y-6 text-center">
                <h2 className="text-2xl font-bold text-gray-200">Manual Scheduling</h2>
                <p className="text-gray-400">Connect to your Google Calendar to schedule posts directly from the "Planned Posts" page.</p>
                <div className="pt-6">
                    {isGoogleConnected ? (
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-3 p-3 bg-green-900/50 border border-green-700 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <span className="text-green-300">Connected as {googleUserEmail}</span>
                            </div>
                             <p className="text-gray-400 text-sm">You can now schedule posts from the "Planned Posts" page.</p>
                             <button onClick={onGoogleDisconnect} className="text-sm text-red-400 hover:text-red-300">Disconnect</button>
                        </div>
                    ) : (
                         <Button onClick={onGoogleConnect} isLoading={isConnecting}>
                            {isConnecting ? 'Connecting...' : 'Connect to Google Calendar'}
                         </Button>
                    )}
                </div>
            </div>
            
            <TaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={onAddTask} />
        </div>
    );
};

export default Scheduler;
