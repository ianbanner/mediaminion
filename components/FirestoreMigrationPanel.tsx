
import React, { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { BackupData, PersonaProfile, SavedTemplate, SavedArticleTemplate, QueuedPost, SentPost } from '../types.ts';
import Button from './Button.tsx';
import { auth as defaultAuth, db as defaultDb } from '../firebase.ts';

interface FirestoreMigrationPanelProps {
  backupData: BackupData;
  onRestore: (data: BackupData) => void;
  userEmail: string | null;
}

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  targetUserId: string; // New: Explicitly control which document to write to
}

const FirestoreMigrationPanel: React.FC<FirestoreMigrationPanelProps> = ({ backupData, onRestore, userEmail }) => {
  // Config State
  const [config, setConfig] = useState<FirebaseConfig>({
    apiKey: process.env.FIREBASE_API_KEY || "AIzaSyC1xAe4CYOVIaW60HtJvV_0hQAkmmXJTBU",
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || "gen-lang-client-0891844007.firebaseapp.com",
    projectId: process.env.FIREBASE_PROJECT_ID || "gen-lang-client-0891844007",
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "gen-lang-client-0891844007.firebasestorage.app",
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "185017446343",
    appId: process.env.FIREBASE_APP_ID || "1:185017446343:web:9fc46eb7dcb6f9751933e2",
    targetUserId: "default-user" // Default bucket if no auth
  });

  // UI State
  const [isConnected, setIsConnected] = useState(true);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [cloudStats, setCloudStats] = useState<any>(null);
  
  // Custom App State
  const [customApp, setCustomApp] = useState<firebase.app.App | null>(null);
  
  // Auth State (Optional now)
  const [firebaseUser, setFirebaseUser] = useState<firebase.User | null>(null);

  // Initialize
  useEffect(() => {
      addLog("Page mounted. Checking configuration...");
      
      // Listen for Firebase Auth status to auto-fill ID if available
      const unsubscribe = defaultAuth.onAuthStateChanged(user => {
          setFirebaseUser(user);
          if (user) {
              addLog(`Authenticated as: ${user.email}`);
              // Auto-update target ID to the authenticated user if currently default
              setConfig(prev => prev.targetUserId === 'default-user' ? { ...prev, targetUserId: user.uid } : prev);
          } else {
              addLog("Running in Unauthenticated Mode (using manual Target User ID).");
          }
      });
      
      return () => unsubscribe();
  }, []);

  // Helper: Logging
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString('en-GB', { hour12: false });
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev]);
  };

  // Helper: Get DB Instance
  const getDbInstance = () => {
    // If a custom app is initialized, use its Firestore
    if (customApp) {
        return customApp.firestore();
    }
    // Otherwise use default
    return defaultDb;
  };

  // CRITICAL CHANGE: Use config.targetUserId instead of auth user
  const getUserRef = () => {
    const uid = config.targetUserId.trim();
    if (!uid) {
        throw new Error("Target User ID is empty. Please check configuration.");
    }
    return getDbInstance().collection('users').doc(uid);
  };

  const handleConnect = async () => {
      const CUSTOM_APP_NAME = 'migration-secondary';
      
      addLog(`Applying configuration...`);
      
      try {
          // 1. Cleanup existing custom app if it exists
          const existingApp = firebase.apps.find(app => app.name === CUSTOM_APP_NAME);
          if (existingApp) {
              await existingApp.delete();
          }

          // 2. Initialize new custom app with current config form values
          const newApp = firebase.initializeApp({
              apiKey: config.apiKey,
              authDomain: config.authDomain,
              projectId: config.projectId,
              storageBucket: config.storageBucket,
              messagingSenderId: config.messagingSenderId,
              appId: config.appId
          }, CUSTOM_APP_NAME);

          setCustomApp(newApp);
          addLog(`Initialized custom Firebase App connection to project: ${config.projectId}`);
          addLog(`Targeting User ID: ${config.targetUserId}`);

          setIsConnected(true);
          setShowSuccessMessage(true);
          setTimeout(() => setShowSuccessMessage(false), 5000);

      } catch (error: any) {
          addLog(`❌ Connection Error: ${error.message}`);
          console.error("Failed to initialize custom firebase app", error);
      }
  };
  
  // --- ACTIONS ---

  const handleUpload = async () => {
    setIsLoading(true);
    addLog(`--- Uploading to users/${config.targetUserId} ---`);
    
    try {
      const userRef = getUserRef();
      const batch = getDbInstance().batch();
      
      // 1. Root User Doc
      addLog("Preparing User Settings & Profile...");
      const userDocData = {
        email: firebaseUser?.email || userEmail || "anonymous@minion",
        lastUpdated: new Date().toISOString(),
        settings: backupData.settings || {},
        adminSettings: backupData.adminSettings || {}, 
        checklist: backupData.checklistItems || [],
        activePersonaId: backupData.activePersonaId || null,
        
        // Flattened Active Context
        userRole: backupData.userRole,
        targetAudience: backupData.targetAudience,
        referenceWorldContent: backupData.referenceWorldContent,
        thisIsHowIWriteArticles: backupData.thisIsHowIWriteArticles,
      };
      batch.set(userRef, userDocData, { merge: true });

      // 2. Subcollections
      
      // Personas
      if (backupData.savedPersonas) {
        addLog(`Queueing ${backupData.savedPersonas.length} Personas...`);
        backupData.savedPersonas.forEach(p => {
          const ref = userRef.collection('personas').doc(p.id);
          batch.set(ref, p);
        });
      }

      // Post Templates
      if (backupData.savedTemplates) {
        addLog(`Queueing ${backupData.savedTemplates.length} Post Templates...`);
        backupData.savedTemplates.forEach(t => {
          const ref = userRef.collection('postTemplates').doc(t.id);
          batch.set(ref, t);
        });
      }

      // Article Templates
      if (backupData.savedArticleTemplates) {
        addLog(`Queueing ${backupData.savedArticleTemplates.length} Article Templates...`);
        backupData.savedArticleTemplates.forEach(t => {
          const ref = userRef.collection('articleTemplates').doc(t.id);
          batch.set(ref, t);
        });
      }

      // Posts (Queue & Log combined)
      let postCount = 0;
      if (backupData.ayrshareQueue) {
        backupData.ayrshareQueue.forEach(p => {
          const ref = userRef.collection('posts').doc(p.id);
          batch.set(ref, { ...p, status: p.status || 'queued' }); 
          postCount++;
        });
      }
      if (backupData.ayrshareLog) {
        backupData.ayrshareLog.forEach(p => {
          const ref = userRef.collection('posts').doc(p.id);
          batch.set(ref, { ...p, status: 'posted' });
          postCount++;
        });
      }
      addLog(`Queueing ${postCount} Posts (Queue + History)...`);

      // Podcast Plans
      if (backupData.archivedPodcastPlans) {
         addLog(`Queueing ${backupData.archivedPodcastPlans.length} Podcast Plans...`);
         backupData.archivedPodcastPlans.forEach(p => {
             const pid = p.id || Math.random().toString(36).substring(7);
             const ref = userRef.collection('podcasts').doc(pid);
             batch.set(ref, { ...p, id: pid });
         });
      }

      // Audio Scripts
      if (backupData.archivedAudioScripts) {
         addLog(`Queueing ${backupData.archivedAudioScripts.length} Audio Scripts...`);
         backupData.archivedAudioScripts.forEach(s => {
             const sid = s.id || Math.random().toString(36).substring(7);
             const ref = userRef.collection('audioScripts').doc(sid);
             batch.set(ref, { ...s, id: sid });
         });
      }

      // Commit
      addLog("Committing Batch Write...");
      await batch.commit();
      addLog("✅ Upload Successful!");

    } catch (e: any) {
      addLog(`❌ Error: ${e.message}`);
      if (e.code === 'permission-denied') {
          addLog("⚠️ Permission Denied: Check your Firestore Security Rules. If not logged in, rules must allow public read/write.");
      }
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    setIsLoading(true);
    addLog(`--- Downloading from users/${config.targetUserId} ---`);

    try {
        const userRef = getUserRef();
        
        // 1. Fetch Root Doc
        addLog("Fetching User Profile...");
        const userDoc = await userRef.get();
        
        let userData: any = {};
        if (userDoc.exists) {
            userData = userDoc.data();
        } else {
            addLog("⚠️ User document not found. Attempting to fetch subcollections anyway...");
        }

        // 2. Fetch Subcollections
        const fetchData = async (colName: string) => {
            const snap = await userRef.collection(colName).get();
            return snap.docs.map(d => d.data());
        };

        addLog("Fetching Personas...");
        const personas = await fetchData('personas') as PersonaProfile[];
        
        addLog("Fetching Templates...");
        const postTemplates = await fetchData('postTemplates') as SavedTemplate[];
        const articleTemplates = await fetchData('articleTemplates') as SavedArticleTemplate[];
        
        addLog("Fetching Posts...");
        const allPosts = await fetchData('posts') as (QueuedPost & SentPost)[];
        const queue = allPosts.filter(p => p.status !== 'posted');
        const log = allPosts.filter(p => p.status === 'posted');

        addLog("Fetching Archives...");
        const podcasts = await fetchData('podcasts');
        const audioScripts = await fetchData('audioScripts');

        // 3. Reconstruct State
        const restoredData: BackupData = {
            userEmail: userData.email || userEmail,
            // Settings
            settings: userData.settings || {},
            adminSettings: userData.adminSettings || { authorizedUsers: [], secretPassword: 'password123' },
            checklistItems: userData.checklist || [],
            
            // Active Context
            userRole: userData.userRole || '',
            targetAudience: userData.targetAudience || '',
            referenceWorldContent: userData.referenceWorldContent || '',
            thisIsHowIWriteArticles: userData.thisIsHowIWriteArticles || '',
            activePersonaId: userData.activePersonaId || null,
            personaName: userData.activePersonaId ? personas.find(p => p.id === userData.activePersonaId)?.name : '',

            // Lists
            savedPersonas: personas,
            savedTemplates: postTemplates,
            savedArticleTemplates: articleTemplates,
            ayrshareQueue: queue,
            ayrshareLog: log,
            archivedPodcastPlans: podcasts as any,
            archivedAudioScripts: audioScripts as any,

            // Defaults for transient state
            articleUrl: '',
            articleText: '',
            postSourceType: 'url',
            standardStarterText: '',
            standardSummaryText: '',
            generationScript: '',
            parsedSchedule: [],
            schedulingInstructions: '',
            researchScript: '',
            researchedPosts: null,
            generatedArticleHistory: [],
            currentArticleIterationIndex: 0
        };

        addLog("Restoring Application State...");
        onRestore(restoredData);
        addLog("✅ Download & Restore Successful!");

    } catch (e: any) {
        addLog(`❌ Error: ${e.message}`);
        console.error(e);
    } finally {
        setIsLoading(false);
    }
  };

  const handleInspect = async () => {
      setIsLoading(true);
      addLog(`Inspecting users/${config.targetUserId}...`);
      try {
          const userRef = getUserRef();
          
          const countCollection = async (colName: string) => {
              const snap = await userRef.collection(colName).get();
              return snap.size;
          };

          const stats = {
              personas: await countCollection('personas'),
              postTemplates: await countCollection('postTemplates'),
              articleTemplates: await countCollection('articleTemplates'),
              posts: await countCollection('posts'),
              podcasts: await countCollection('podcasts'),
              audioScripts: await countCollection('audioScripts'),
          };
          
          setCloudStats(stats);
          addLog("Inspection Complete.");
      } catch (e: any) {
          addLog(`❌ Error: ${e.message}`);
      } finally {
          setIsLoading(false);
      }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <h1 className="text-3xl font-bold">Cloud Synchronization</h1>
      
      {/* 1. Configuration Section */}
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
            <h2 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">1. Firebase Configuration</h2>
            {isConnected && (
                <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-bold uppercase rounded-full">
                    Active
                </span>
            )}
        </div>
        
        <div className="p-6">
            {isConnected ? (
                // --- CONNECTED STATE ---
                <div className="animate-fade-in space-y-4">
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1 bg-gray-100 dark:bg-slate-900 p-4 rounded-lg border border-gray-200 dark:border-slate-700">
                            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Target Project</p>
                            <p className="text-gray-900 dark:text-white font-mono text-sm">{config.projectId}</p>
                        </div>
                        <div className="flex-1 bg-gray-100 dark:bg-slate-900 p-4 rounded-lg border border-gray-200 dark:border-slate-700">
                            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Target User ID (Path)</p>
                            <p className="text-teal-600 dark:text-teal-400 font-mono text-sm font-bold">{config.targetUserId}</p>
                        </div>
                    </div>
                    
                    {!firebaseUser && (
                        <div className="flex items-center gap-2 text-xs text-yellow-600 dark:text-yellow-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            Not signed in. Ensure your Firestore Security Rules allow unauthenticated read/write to the above User ID.
                        </div>
                    )}

                    <div className="flex items-center gap-3">
                        <Button 
                            onClick={() => setIsConnected(false)} 
                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-gray-200 text-sm px-4 py-2"
                        >
                            Edit Connection
                        </Button>
                    </div>
                </div>
            ) : (
                // --- EDIT STATE ---
                <div className="animate-fade-in">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Override the default configuration to connect to a specific Firebase project.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-teal-500 uppercase mb-1">Target User ID (Bucket Name)</label>
                            <input type="text" value={config.targetUserId} onChange={e => setConfig({...config, targetUserId: e.target.value})} className="w-full p-2 bg-slate-100 dark:bg-slate-900 border border-teal-500 rounded text-sm font-mono" placeholder="default-user" />
                            <p className="text-xs text-gray-500 mt-1">This is the document ID in the 'users' collection where data will be saved.</p>
                        </div>
                        
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">API Key</label>
                            <input type="text" value={config.apiKey} onChange={e => setConfig({...config, apiKey: e.target.value})} className="w-full p-2 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded text-sm font-mono" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Project ID</label>
                            <input type="text" value={config.projectId} onChange={e => setConfig({...config, projectId: e.target.value})} className="w-full p-2 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded text-sm font-mono" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Auth Domain</label>
                            <input type="text" value={config.authDomain} onChange={e => setConfig({...config, authDomain: e.target.value})} className="w-full p-2 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded text-sm font-mono" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Storage Bucket</label>
                            <input type="text" value={config.storageBucket} onChange={e => setConfig({...config, storageBucket: e.target.value})} className="w-full p-2 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded text-sm font-mono" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Messaging Sender ID</label>
                            <input type="text" value={config.messagingSenderId} onChange={e => setConfig({...config, messagingSenderId: e.target.value})} className="w-full p-2 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded text-sm font-mono" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">App ID</label>
                            <input type="text" value={config.appId} onChange={e => setConfig({...config, appId: e.target.value})} className="w-full p-2 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded text-sm font-mono" />
                        </div>
                    </div>
                    <div className="mt-6 flex gap-3">
                        <Button onClick={handleConnect} className="w-full bg-indigo-600 hover:bg-indigo-500">Save & Connect</Button>
                        <button onClick={() => setIsConnected(true)} className="text-gray-500 hover:text-gray-300 underline text-sm px-4">Cancel</button>
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* 2. Synchronization Section */}
      <div className={`transition-opacity duration-300 ${isConnected ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
        <div className="p-6 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl">
            <h2 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mb-6">2. Data Synchronization</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Push */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-200 dark:border-slate-700 text-center shadow-sm hover:shadow-md transition-shadow">
                    <div className="mx-auto w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-4 text-indigo-600 dark:text-indigo-400">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3 3m0 0l-3 3m3-3v12" /></svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Push to Cloud</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 mb-6">
                        Take all data currently in this browser and <strong className="text-indigo-400">overwrite</strong> the database at <code>users/{config.targetUserId}</code>.
                    </p>
                    <Button 
                        onClick={handleUpload} 
                        isLoading={isLoading} 
                        className="w-full bg-indigo-500 hover:bg-indigo-400"
                    >
                        Upload Data to Firestore
                    </Button>
                </div>

                {/* Pull */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-200 dark:border-slate-700 text-center shadow-sm hover:shadow-md transition-shadow">
                    <div className="mx-auto w-16 h-16 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center mb-4 text-teal-600 dark:text-teal-400">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3 3m0 0l-3 3m3-3v12" transform="rotate(180 12 12)" /></svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Pull from Cloud</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 mb-6">
                        Fetch data from <code>users/{config.targetUserId}</code> and <strong className="text-teal-400">replace</strong> the data in this browser.
                    </p>
                    <Button 
                        onClick={handleDownload} 
                        isLoading={isLoading} 
                        className="w-full bg-teal-500 hover:bg-teal-400"
                    >
                        Download Data from Firestore
                    </Button>
                </div>
            </div>
        </div>
      </div>

      {/* 3. Cloud Inspector */}
      <div className={`p-6 bg-blue-50 dark:bg-slate-800/30 border border-blue-100 dark:border-slate-700 rounded-xl transition-opacity duration-300 ${isConnected ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
         <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                3. Cloud Inspector
            </h2>
         </div>
         <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            View the summary of data currently stored in <code>users/{config.targetUserId}</code> without modifying your local application.
         </p>
         
         {!cloudStats ? (
             <Button onClick={handleInspect} isLoading={isLoading} className="bg-teal-600 hover:bg-teal-500 py-2 text-sm">
                 View Cloud Data Summary
             </Button>
         ) : (
             <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-700 grid grid-cols-2 md:grid-cols-3 gap-4 animate-fade-in">
                 {Object.entries(cloudStats).map(([key, val]) => (
                     <div key={key} className="text-center p-2">
                         <div className="text-2xl font-bold text-indigo-400">{val as number}</div>
                         <div className="text-xs text-gray-500 uppercase font-bold">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                     </div>
                 ))}
                 <div className="col-span-full pt-2">
                     <button onClick={() => setCloudStats(null)} className="text-xs text-gray-400 hover:text-white underline">Refresh / Close</button>
                 </div>
             </div>
         )}
      </div>

      {/* Debug Console */}
      <div className="bg-black rounded-lg p-4 font-mono text-xs text-green-400 h-48 overflow-y-auto border border-gray-800 shadow-2xl">
          <div className="flex justify-between items-center mb-2 border-b border-gray-800 pb-2">
              <span className="font-bold text-gray-500 uppercase tracking-wider">Debug Console</span>
              <button onClick={() => setLogs([])} className="text-gray-600 hover:text-gray-400">CLEAR</button>
          </div>
          <div className="space-y-1">
              {logs.length === 0 && <span className="text-gray-700 italic">Ready...</span>}
              {logs.map((log, i) => (
                  <div key={i}>{log}</div>
              ))}
          </div>
      </div>

      {/* Success Toast */}
      {showSuccessMessage && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 animate-fade-in-fast z-50 min-w-[400px]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              <div>
                  <p className="font-bold">SUCCESS:</p>
                  <p className="text-sm">Firebase configuration saved.</p>
              </div>
          </div>
      )}

    </div>
  );
};

export default FirestoreMigrationPanel;
