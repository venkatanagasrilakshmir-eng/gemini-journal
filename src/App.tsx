import React, { useState, useEffect, useCallback } from 'react';
import { onAuthChanged, signOutUser } from './lib/firebase';
import { 
  getUserInteractions, 
  saveUserInteraction, 
  deleteUserInteraction, 
  updateUserInteractionMeta 
} from './lib/firestore';
import { Header } from './components/Header';
import { LandingView } from './components/LandingView';
import { HistorySidebar } from './components/HistorySidebar';
import { ReflectionWorkspace } from './components/ReflectionWorkspace';
import type { AuthUserProfile, JournalInteraction } from './types';

export default function App() {
  const [user, setUser] = useState<AuthUserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [interactions, setInteractions] = useState<JournalInteraction[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthChanged((firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
          isAnonymous: firebaseUser.isAnonymous,
        });
      } else {
        setUser(null);
        setInteractions([]);
        setActiveId(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch interactions when authenticated
  const loadInteractions = useCallback(async (uid: string) => {
    try {
      const items = await getUserInteractions(uid);
      setInteractions(items);
      if (items.length > 0 && !activeId) {
        setActiveId(items[0].id);
      }
    } catch (err) {
      console.error("Failed to fetch interactions:", err);
    }
  }, [activeId]);

  useEffect(() => {
    if (user?.uid) {
      loadInteractions(user.uid);
    }
  }, [user?.uid, loadInteractions]);

  // Persist interaction to Firestore
  const handleSaveInteraction = async (item: JournalInteraction): Promise<{ success: boolean; error?: string }> => {
    if (!user?.uid) return { success: false, error: "Not authenticated" };

    setIsSaving(true);
    try {
      const res = await saveUserInteraction(user.uid, item);
      if (res.success) {
        setInteractions(prev => {
          const index = prev.findIndex(p => p.id === item.id);
          if (index >= 0) {
            const updated = [...prev];
            updated[index] = item;
            return updated;
          } else {
            return [item, ...prev];
          }
        });
        setActiveId(item.id);
      }
      return res;
    } finally {
      setIsSaving(false);
    }
  };

  // Delete an interaction
  const handleDeleteInteraction = async (id: string) => {
    if (!user?.uid) return;
    const res = await deleteUserInteraction(user.uid, id);
    if (res.success) {
      setInteractions(prev => prev.filter(item => item.id !== id));
      if (activeId === id) {
        const remaining = interactions.filter(item => item.id !== id);
        setActiveId(remaining.length > 0 ? remaining[0].id : null);
      }
    }
  };

  // Pin/unpin an interaction
  const handleTogglePin = async (id: string, currentPin: boolean) => {
    if (!user?.uid) return;
    const res = await updateUserInteractionMeta(user.uid, id, { isPinned: currentPin });
    if (res.success) {
      setInteractions(prev => prev.map(item => item.id === id ? { ...item, isPinned: currentPin } : item));
    }
  };

  // Create fresh entry
  const handleNewEntry = () => {
    setActiveId(null);
    setIsSidebarOpen(false);
  };

  // Sign out
  const handleSignOut = async () => {
    await signOutUser();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#090d16] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-slate-700 border-t-amber-400 animate-spin" />
          <p className="text-xs text-slate-400 font-medium">Securing session...</p>
        </div>
      </div>
    );
  }

  // Not authenticated: Render Landing & Sign-in Page
  if (!user) {
    return <LandingView onAuthenticated={() => {}} />;
  }

  // Find currently active interaction object
  const activeInteraction = interactions.find(item => item.id === activeId) || null;

  return (
    <div className="min-h-screen bg-[#090d16] flex flex-col antialiased text-slate-100 font-sans selection:bg-amber-400/20 selection:text-amber-200 relative overflow-hidden">
      {/* Subtle Ambient Radial Light Overlays */}
      <div className="fixed top-1/4 left-1/3 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[160px] pointer-events-none z-0" />
      <div className="fixed bottom-1/4 right-1/4 w-[600px] h-[600px] bg-sky-500/5 rounded-full blur-[160px] pointer-events-none z-0" />

      {/* Persistent Navigation Header */}
      <Header
        user={user}
        onSignOut={handleSignOut}
        onNewEntry={handleNewEntry}
        isSaving={isSaving}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        <HistorySidebar
          interactions={interactions}
          activeId={activeId}
          onSelectInteraction={(id) => setActiveId(id)}
          onDeleteInteraction={handleDeleteInteraction}
          onTogglePin={handleTogglePin}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <ReflectionWorkspace
          key={activeId || 'new_draft'}
          interaction={activeInteraction}
          onSaveInteraction={handleSaveInteraction}
          onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
          userId={user.uid}
        />
      </div>
    </div>
  );
}
