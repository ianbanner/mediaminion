import React, { useState, useEffect } from 'react';
import { AppSettings } from '../types.ts';
import Button from './Button.tsx';

interface SettingsPanelProps {
  settings: AppSettings;
  onSettingsChange: (newSettings: AppSettings) => Promise<boolean>;
  isAdmin: boolean;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onSettingsChange, isAdmin }) => {
  const [apiKey, setApiKey] = useState(settings.ayrshareApiKey);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    setApiKey(settings.ayrshareApiKey);
  }, [settings.ayrshareApiKey]);

  const handleSave = async () => {
    setSaveStatus('saving');
    setSaveMessage('');
    const success = await onSettingsChange({ ayrshareApiKey: apiKey });
    if (success) {
      setSaveStatus('saved');
      setSaveMessage('Connection successful and settings saved!');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } else {
      setSaveStatus('error');
      setSaveMessage('Failed to connect with that API key. Please check it and try again.');
    }
  };

  const buttonText = () => {
    switch (saveStatus) {
      case 'saving': return 'Testing & Saving...';
      case 'saved': return 'Saved!';
      default: return 'Save Settings';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-3xl font-bold">Settings</h1>
      
      <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg space-y-6">
        <h2 className="text-xl font-bold">Ayrshare API Configuration</h2>
        <p className="text-sm text-gray-400">
          Enter your Ayrshare API Key to enable automated posting to your social media accounts. You can get your key from the <a href="https://app.ayrshare.com/api" target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:underline">Ayrshare Dashboard</a>.
        </p>
        
        <div>
          <label htmlFor="ayrshare-api-key" className="block text-sm font-medium text-gray-300 mb-1">Ayrshare API Key</label>
          <input
            id="ayrshare-api-key"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full max-w-lg p-2 bg-gray-900 border border-slate-600 rounded-md focus:ring-2 focus:ring-teal-400 font-mono"
            placeholder="AYR-******************"
          />
        </div>

        <div className="pt-4 border-t border-slate-700/50 text-right flex items-center justify-end gap-4">
          {saveStatus === 'saved' && <p className="text-sm text-green-400">{saveMessage}</p>}
          {saveStatus === 'error' && <p className="text-sm text-red-400">{saveMessage}</p>}
          <Button onClick={handleSave} isLoading={saveStatus === 'saving'}>
            {buttonText()}
          </Button>
        </div>
      </div>
      
      {isAdmin && (
        <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold">Admin</h2>
            <p className="text-sm text-gray-400 mt-2">You have admin privileges. You can manage authorized users in the Admin Panel.</p>
        </div>
      )}
    </div>
  );
};

export default SettingsPanel;
