import React, { useState } from 'react';
import { AdminSettings } from '../types.ts';
import Button from './Button.tsx';

interface AdminPanelProps {
  settings: AdminSettings;
  onSettingsChange: (newSettings: AdminSettings) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ settings, onSettingsChange }) => {
  const [password, setPassword] = useState(settings.secretPassword);
  const [emails, setEmails] = useState(settings.authorizedEmails.join('\n'));
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const handleSave = () => {
    setSaveStatus('saving');
    const emailList = emails.split('\n').map(e => e.trim()).filter(Boolean);
    onSettingsChange({
      authorizedEmails: emailList,
      secretPassword: password,
    });
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const buttonText = () => {
      switch (saveStatus) {
          case 'saving': return 'Your Minion Is Working';
          case 'saved': return 'Saved!';
          default: return 'Save Admin Settings';
      }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-3xl font-bold">Admin Panel</h1>
      <p className="text-gray-400">Manage access for other users of the Social Media Minion.</p>

      <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg space-y-6">
        <div>
          <label htmlFor="secretPassword" className="block text-sm font-medium text-gray-300">Secret Password</label>
          <p className="text-xs text-gray-500 mb-1">All non-admin users will need this password to sign in.</p>
          <input
            id="secretPassword"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full max-w-sm p-2 bg-gray-900 border border-slate-600 rounded-md focus:ring-2 focus:ring-teal-400"
          />
        </div>

        <div>
          <label htmlFor="authorizedEmails" className="block text-sm font-medium text-gray-300">Authorized Email Addresses</label>
          <p className="text-xs text-gray-500 mb-1">Enter one email address per line. Only these users will be able to sign in.</p>
          <textarea
            id="authorizedEmails"
            value={emails}
            onChange={(e) => setEmails(e.target.value)}
            rows={10}
            className="mt-1 w-full p-2 bg-gray-900 border border-slate-600 rounded-md focus:ring-2 focus:ring-teal-400 font-mono text-sm"
            placeholder="user1@example.com&#10;user2@example.com"
          />
        </div>

        <div className="pt-4 border-t border-slate-700/50 text-right">
          <Button onClick={handleSave} isLoading={saveStatus === 'saving'}>
            {buttonText()}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;