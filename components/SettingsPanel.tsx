import React, { useState, useEffect } from 'react';
import { AppSettings } from '../types.ts';
import Button from './Button.tsx';
import { testAyrshareConnection } from '../services/ayrshareService.ts';

interface SettingsPanelProps {
  settings: AppSettings;
  onSettingsChange: (newSettings: AppSettings) => void;
  isAdmin: boolean;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onSettingsChange, isAdmin }) => {
  const [apiKey, setApiKey] = useState(settings.ayrshareApiKey);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  useEffect(() => {
    setApiKey(settings.ayrshareApiKey);
  }, [settings.ayrshareApiKey]);

  const handleTestConnection = async () => {
    if (!apiKey) {
        setTestStatus('error');
        setTestMessage('API Key cannot be empty.');
        return;
    }
    setTestStatus('testing');
    setTestMessage('');
    const result = await testAyrshareConnection(apiKey);
    
    if (result.success) {
        setTestStatus('success');
        setTestMessage(result.message);
    } else {
        setTestStatus('error');
        setTestMessage(result.message);
    }
  };

  const handleSave = () => {
    setSaveStatus('saving');
    onSettingsChange({ ayrshareApiKey: apiKey });
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const saveButtonText = () => {
    switch (saveStatus) {
      case 'saving': return 'Your Minion Is Working';
      case 'saved': return 'Saved!';
      default: return 'Save Settings';
    }
  };
  
  const testButtonText = () => {
    switch (testStatus) {
      case 'testing': return 'Testing...';
      case 'success': return 'Success!';
      case 'error': return 'Failed!';
      default: return 'Test Connection';
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
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3">
              <input
                id="ayrshare-api-key"
                type="password"
                value={apiKey}
                onChange={(e) => {
                    setApiKey(e.target.value);
                    setTestStatus('idle'); // Reset test status on change
                    setTestMessage('');
                }}
                className="w-full max-w-lg p-2 bg-gray-900 border border-slate-600 rounded-md focus:ring-2 focus:ring-teal-400 font-mono"
                placeholder="AYR-******************"
              />
               <Button 
                onClick={handleTestConnection} 
                isLoading={testStatus === 'testing'}
                className="px-4 py-2 text-sm whitespace-nowrap"
              >
                {testButtonText()}
              </Button>
          </div>
           {testMessage && (
              <p className={`mt-2 text-sm ${testStatus === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                {testMessage}
              </p>
           )}
        </div>

        <div className="pt-4 border-t border-slate-700/50 text-right">
          <Button onClick={handleSave} isLoading={saveStatus === 'saving'}>
            {saveButtonText()}
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