
import React, { useState, useMemo, useCallback } from 'react';
import { AdminSettings, UserActivity, ChecklistItem } from '../types.ts';
import Button from './Button.tsx';
import { v4 as uuidv4 } from 'uuid';

interface AdminPanelProps {
  settings: AdminSettings;
  onSettingsChange: (newSettings: AdminSettings) => void;
  checklistItems: ChecklistItem[];
  onChecklistChange: (items: ChecklistItem[]) => void;
}

interface ActivityStats {
    user: string;
    totalPosts: number;
    postsLastDay: number;
    postsLastWeek: number;
    postsLastMonth: number;
    totalArticles: number;
    articlesLastDay: number;
    articlesLastWeek: number;
    articlesLastMonth: number;
}

const UserActivityTable: React.FC<{ activityData: Record<string, UserActivity> }> = ({ activityData }) => {
    
    const calculatedStats: ActivityStats[] = useMemo(() => {
        const now = Date.now();
        const lastDay = now - 24 * 60 * 60 * 1000;
        const lastWeek = now - 7 * 24 * 60 * 60 * 1000;
        const lastMonth = now - 30 * 24 * 60 * 60 * 1000;

        return Object.entries(activityData).map(([user, activity]) => {
            const posts = (activity as UserActivity).posts || [];
            const articles = (activity as UserActivity).articles || [];

            return {
                user,
                totalPosts: posts.length,
                postsLastDay: posts.filter(ts => ts > lastDay).length,
                postsLastWeek: posts.filter(ts => ts > lastWeek).length,
                postsLastMonth: posts.filter(ts => ts > lastMonth).length,
                totalArticles: articles.length,
                articlesLastDay: articles.filter(ts => ts > lastDay).length,
                articlesLastWeek: articles.filter(ts => ts > lastWeek).length,
                articlesLastMonth: articles.filter(ts => ts > lastMonth).length,
            };
        });
    }, [activityData]);

    const handleDownload = useCallback(() => {
        const headers = [
            'User', 'Total Posts', 'Posts (Day)', 'Posts (Week)', 'Posts (Month)',
            'Total Articles', 'Articles (Day)', 'Articles (Week)', 'Articles (Month)'
        ];
        const rows = calculatedStats.map(stats => [
            stats.user, stats.totalPosts, stats.postsLastDay, stats.postsLastWeek, stats.postsLastMonth,
            stats.totalArticles, stats.articlesLastDay, stats.articlesLastWeek, stats.articlesLastMonth
        ].join(','));

        const csvContent = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            const dateTime = new Date().toISOString().replace('T', '_').replace(/:/g, '-').slice(0, 19);
            link.setAttribute("href", url);
            link.setAttribute("download", `minion-activity-report_${dateTime}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }, [calculatedStats]);

    if (calculatedStats.length === 0) {
        return <p className="text-gray-400">No user activity recorded yet.</p>;
    }

    return (
        <div className="space-y-4">
             <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">User Activity</h3>
                <Button onClick={handleDownload} className="px-4 py-2 text-sm">Download CSV</Button>
            </div>
            <div className="overflow-x-auto rounded-lg border border-slate-700">
                <table className="min-w-full divide-y divide-slate-700">
                    <thead className="bg-slate-800">
                        <tr>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
                            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Total Posts</th>
                            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Day</th>
                            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Week</th>
                            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Month</th>
                            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Total Articles</th>
                            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Day</th>
                            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Week</th>
                            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Month</th>
                        </tr>
                    </thead>
                    <tbody className="bg-slate-900/50 divide-y divide-slate-700">
                        {calculatedStats.map(stats => (
                            <tr key={stats.user}>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-200">{stats.user}</td>
                                <td className="px-4 py-3 text-center text-sm text-gray-300 font-bold">{stats.totalPosts}</td>
                                <td className="px-4 py-3 text-center text-sm text-gray-300">{stats.postsLastDay}</td>
                                <td className="px-4 py-3 text-center text-sm text-gray-300">{stats.postsLastWeek}</td>
                                <td className="px-4 py-3 text-center text-sm text-gray-300">{stats.postsLastMonth}</td>
                                <td className="px-4 py-3 text-center text-sm text-gray-300 font-bold">{stats.totalArticles}</td>
                                <td className="px-4 py-3 text-center text-sm text-gray-300">{stats.articlesLastDay}</td>
                                <td className="px-4 py-3 text-center text-sm text-gray-300">{stats.articlesLastWeek}</td>
                                <td className="px-4 py-3 text-center text-sm text-gray-300">{stats.articlesLastMonth}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const ChecklistManager: React.FC<{ checklistItems: ChecklistItem[], onChecklistChange: (items: ChecklistItem[]) => void }> = ({ checklistItems, onChecklistChange }) => {
  const [newItemText, setNewItemText] = useState('');
  const [newItemUrl, setNewItemUrl] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editUrl, setEditUrl] = useState('');

  const handleAdd = () => {
    if (!newItemText.trim()) return;
    const newItem: ChecklistItem = {
      id: uuidv4(),
      text: newItemText,
      url: newItemUrl.trim() || undefined,
      isCompleted: false
    };
    onChecklistChange([...checklistItems, newItem]);
    setNewItemText('');
    setNewItemUrl('');
  };

  const handleDelete = (id: string) => {
    onChecklistChange(checklistItems.filter(i => i.id !== id));
  };

  const startEditing = (item: ChecklistItem) => {
    setEditingId(item.id);
    setEditText(item.text);
    setEditUrl(item.url || '');
  };

  const saveEdit = () => {
    onChecklistChange(checklistItems.map(i => i.id === editingId ? { ...i, text: editText, url: editUrl.trim() || undefined } : i));
    setEditingId(null);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">Manage Set Up Actions</h3>
      <p className="text-sm text-gray-400">Define the checklist items that appear in the "Set Up Actions" guide.</p>
      
      {/* Add New Item */}
      <div className="flex flex-col md:flex-row gap-3 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
        <input 
          type="text" 
          placeholder="Checklist Task Description" 
          value={newItemText} 
          onChange={(e) => setNewItemText(e.target.value)}
          className="flex-grow p-2 bg-gray-800 border border-slate-600 rounded-md text-sm focus:ring-2 focus:ring-teal-400"
        />
        <input 
          type="text" 
          placeholder="Training URL (Optional)" 
          value={newItemUrl} 
          onChange={(e) => setNewItemUrl(e.target.value)}
          className="flex-grow md:w-1/3 p-2 bg-gray-800 border border-slate-600 rounded-md text-sm focus:ring-2 focus:ring-teal-400"
        />
        <button onClick={handleAdd} className="px-4 py-2 bg-teal-600 hover:bg-teal-500 rounded-md text-sm font-bold text-white">Add Item</button>
      </div>

      {/* List Items */}
      <div className="space-y-2">
        {checklistItems.map((item, index) => (
          <div key={item.id} className="p-3 bg-slate-800/30 border border-slate-700 rounded-lg flex flex-col md:flex-row items-start md:items-center gap-3">
             {editingId === item.id ? (
                <>
                   <input 
                      type="text" 
                      value={editText} 
                      onChange={(e) => setEditText(e.target.value)}
                      className="flex-grow p-2 bg-gray-800 border border-slate-600 rounded-md text-sm"
                    />
                    <input 
                      type="text" 
                      value={editUrl} 
                      onChange={(e) => setEditUrl(e.target.value)}
                      placeholder="URL"
                      className="flex-grow md:w-1/3 p-2 bg-gray-800 border border-slate-600 rounded-md text-sm"
                    />
                    <div className="flex gap-2">
                      <button onClick={saveEdit} className="text-green-400 hover:text-green-300 font-bold text-sm">Save</button>
                      <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-gray-300 text-sm">Cancel</button>
                    </div>
                </>
             ) : (
                <>
                   <span className="text-gray-500 font-mono text-xs w-6">{index + 1}.</span>
                   <div className="flex-grow">
                      <p className="text-gray-200 text-sm font-medium">{item.text}</p>
                      {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline truncate block max-w-xs">{item.url}</a>}
                   </div>
                   <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => startEditing(item)} className="text-gray-400 hover:text-teal-300 text-sm px-2">Edit</button>
                      <button onClick={() => handleDelete(item.id)} className="text-gray-400 hover:text-red-400 text-sm px-2">Delete</button>
                   </div>
                </>
             )}
          </div>
        ))}
        {checklistItems.length === 0 && <p className="text-gray-500 italic text-sm text-center py-4">No checklist items defined yet.</p>}
      </div>
    </div>
  );
};


const AdminPanel: React.FC<AdminPanelProps> = ({ settings, onSettingsChange, checklistItems, onChecklistChange }) => {
  const [password, setPassword] = useState(settings.secretPassword);
  const [emails, setEmails] = useState(settings.authorizedEmails.join('\n'));
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const handleSave = () => {
    setSaveStatus('saving');
    const emailList = emails.split('\n').map(e => e.trim()).filter(Boolean);
    onSettingsChange({
      ...settings,
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
      
       <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg space-y-6">
         <UserActivityTable activityData={settings.userActivity || {}} />
       </div>

      <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg space-y-6">
        <ChecklistManager checklistItems={checklistItems} onChecklistChange={onChecklistChange} />
      </div>

      <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg space-y-6">
        <h3 className="text-xl font-bold">Access Management</h3>
        <p className="text-gray-400 text-sm">Manage access for other users of the Social Media Minion.</p>
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
