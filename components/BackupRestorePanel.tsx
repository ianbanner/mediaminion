import React, { useState, useCallback } from 'react';
import { BackupData } from '../types.ts';
import Button from './Button.tsx';

interface BackupRestorePanelProps {
  backupData: BackupData;
  onRestore: (data: BackupData) => void;
  userEmail: string;
}

const BackupRestorePanel: React.FC<BackupRestorePanelProps> = ({ backupData, onRestore, userEmail }) => {
    const [restoreMessage, setRestoreMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    
    const handleDownload = useCallback(() => {
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(backupData, null, 2))}`;
        const link = document.createElement("a");
        link.href = jsonString;
        const safeUserEmail = userEmail.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const dateTime = new Date().toISOString().replace('T', '_').replace(/:/g, '-').slice(0, 19);
        link.download = `minion-backup-${safeUserEmail}_${dateTime}.json`;
        link.click();
    }, [backupData, userEmail]);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setRestoreMessage(null);
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') {
                    throw new Error("Failed to read file content.");
                }
                const data = JSON.parse(text);
                if (!data.savedTemplates || !data.userRole) {
                    throw new Error("This does not appear to be a valid backup file.");
                }
                onRestore(data);
                setRestoreMessage({ type: 'success', text: 'Data restored successfully!' });
            } catch (error: any) {
                console.error("Restore failed:", error);
                setRestoreMessage({ type: 'error', text: `Restore failed: ${error.message}` });
            } finally {
                event.target.value = '';
            }
        };
        reader.onerror = () => {
            setRestoreMessage({ type: 'error', text: 'Error reading the backup file.' });
        }
        reader.readAsText(file);
    };
    
    return (
        <div className="space-y-8 animate-fade-in">
            <h1 className="text-3xl font-bold">Backup & Restore</h1>
            <p className="text-gray-400">Save all your settings, templates, and queues to a file on your computer, or restore from a previous backup.</p>

            {/* Backup Section */}
            <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg space-y-4">
                <h2 className="text-xl font-bold">Download Backup File</h2>
                <p className="text-sm text-gray-400">Click the button below to download a JSON file containing all your application data. Keep this file in a safe place.</p>
                <div>
                    <Button onClick={handleDownload}>
                        Download Backup
                    </Button>
                </div>
            </div>

            {/* Restore Section */}
            <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg space-y-4">
                <h2 className="text-xl font-bold">Load from Backup File</h2>
                <p className="text-sm text-gray-400">
                    Select a previously saved <code>.json</code> backup file. This will <strong className="text-yellow-400">overwrite all current data</strong> in the application. This action cannot be undone.
                </p>
                <div>
                    <input
                        type="file"
                        accept=".json"
                        onChange={handleFileUpload}
                        className="block w-full text-sm text-gray-400
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-teal-600/20 file:text-teal-300
                            hover:file:bg-teal-600/40"
                    />
                </div>
                {restoreMessage && (
                    <div className={`p-3 rounded-lg text-sm ${restoreMessage.type === 'success' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
                        {restoreMessage.text}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BackupRestorePanel;