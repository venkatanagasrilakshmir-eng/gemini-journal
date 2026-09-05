import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  Lightbulb, 
  FileText, 
  Compass, 
  Download, 
  Menu, 
  RotateCcw,
  Wand2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { MessageItem } from './MessageItem';
import { PromptSuggestions } from './PromptSuggestions';
import { ErrorBanner } from './ErrorBanner';
import type { JournalInteraction, ReflectionMode, ChatMessage } from '../types';

interface ReflectionWorkspaceProps {
  interaction: JournalInteraction | null;
  onSaveInteraction: (interaction: JournalInteraction) => Promise<{ success: boolean; error?: string }>;
  onToggleSidebar: () => void;
  userId: string;
}

export const ReflectionWorkspace: React.FC<ReflectionWorkspaceProps> = ({
  interaction,
  onSaveInteraction,
  onToggleSidebar,
  userId,
}) => {
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSuggestingTitle, setIsSuggestingTitle] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [failedPendingInteraction, setFailedPendingInteraction] = useState<JournalInteraction | null>(null);

  // Local state for current interaction draft
  const [currentInteraction, setCurrentInteraction] = useState<JournalInteraction>(() => {
    return interaction || createDefaultInteraction(userId, 'reflect');
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync when selected interaction changes from sidebar
  useEffect(() => {
    if (interaction) {
      setCurrentInteraction(interaction);
      setErrorMsg(null);
      setFailedPendingInteraction(null);
    } else {
      setCurrentInteraction(createDefaultInteraction(userId, 'reflect'));
    }
  }, [interaction?.id]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentInteraction.messages, isGenerating]);

  function createDefaultInteraction(uid: string, mode: ReflectionMode): JournalInteraction {
    return {
      id: 'entry_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      userId: uid,
      title: 'New Reflection',
      mode,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: [],
    };
  }

  const handleModeChange = (mode: ReflectionMode) => {
    setCurrentInteraction(prev => ({
      ...prev,
      mode
    }));
  };

  const handleTitleChange = (newTitle: string) => {
    const updated = {
      ...currentInteraction,
      title: newTitle
    };
    setCurrentInteraction(updated);
    onSaveInteraction(updated);
  };

  const handleSuggestTitle = async () => {
    if (currentInteraction.messages.length === 0) return;
    try {
      setIsSuggestingTitle(true);
      const userText = currentInteraction.messages.map(m => m.text).join('\n');
      const res = await fetch('/api/suggest-title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: userText })
      });
      const data = await res.json();
      if (data.success && data.title) {
        handleTitleChange(data.title);
      }
    } catch (err) {
      console.warn("Title generation failed:", err);
    } finally {
      setIsSuggestingTitle(false);
    }
  };

  const handleSendMessage = async (overrideText?: string) => {
    const textToSend = (overrideText || inputText).trim();
    if (!textToSend || isGenerating) return;

    setErrorMsg(null);
    setIsGenerating(true);
    setSaveStatus('saving');

    const userMessage: ChatMessage = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...currentInteraction.messages, userMessage];

    // Optimistically show user message in workspace
    const optimisticState: JournalInteraction = {
      ...currentInteraction,
      messages: updatedMessages,
      updatedAt: new Date().toISOString(),
    };
    setCurrentInteraction(optimisticState);

    const pendingInputBackup = textToSend;
    if (!overrideText) {
      setInputText('');
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          mode: currentInteraction.mode,
          history: currentInteraction.messages.map(m => ({
            sender: m.sender,
            text: m.text
          }))
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || `Gemini API returned status ${response.status}`);
      }

      const geminiMessage: ChatMessage = {
        id: 'msg_gemini_' + Date.now(),
        sender: 'gemini',
        text: data.reply,
        timestamp: new Date().toISOString(),
        modelUsed: data.modelUsed,
      };

      const finalMessages = [...updatedMessages, geminiMessage];

      let finalTitle = currentInteraction.title;
      if (finalTitle === 'New Reflection' || finalTitle === 'Untitled Reflection') {
        const words = textToSend.split(/\s+/).slice(0, 5).join(' ');
        finalTitle = words.length > 0 ? (words + (words.length < textToSend.length ? '...' : '')) : 'Reflection Session';
      }

      const finalInteraction: JournalInteraction = {
        ...currentInteraction,
        title: finalTitle,
        messages: finalMessages,
        updatedAt: new Date().toISOString(),
      };

      setCurrentInteraction(finalInteraction);

      // Save to Firestore
      const saveRes = await onSaveInteraction(finalInteraction);
      if (!saveRes.success) {
        setFailedPendingInteraction(finalInteraction);
        setSaveStatus('error');
        setErrorMsg(saveRes.error || "Failed to persist reflection to Firestore. You can retry immediately.");
      } else {
        setSaveStatus('saved');
        setFailedPendingInteraction(null);
        setTimeout(() => setSaveStatus('idle'), 2500);
      }
    } catch (err: any) {
      console.error("Interaction failed:", err);
      if (!overrideText) {
        setInputText(pendingInputBackup);
      }
      setErrorMsg(err?.message || "Failed to generate reflection with Gemini. Please try again.");
      setSaveStatus('error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRetrySave = async () => {
    if (!failedPendingInteraction) return;
    setSaveStatus('saving');
    setErrorMsg(null);
    const res = await onSaveInteraction(failedPendingInteraction);
    if (res.success) {
      setSaveStatus('saved');
      setFailedPendingInteraction(null);
      setTimeout(() => setSaveStatus('idle'), 2500);
    } else {
      setSaveStatus('error');
      setErrorMsg(res.error || "Retry save failed. Please verify your connection.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleExportMarkdown = () => {
    const mdContent = `# ${currentInteraction.title}
Mode: ${currentInteraction.mode}
Date: ${new Date(currentInteraction.createdAt).toLocaleString()}

${currentInteraction.messages
  .map(m => `### ${m.sender === 'user' ? 'Reflection Entry' : 'Gemini Response (' + (m.modelUsed || 'AI') + ')'}
*${new Date(m.timestamp).toLocaleTimeString()}*

${m.text}
`)
  .join('\n---\n\n')}`;

    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentInteraction.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'reflection'}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const modeButtons: { mode: ReflectionMode; label: string; icon: React.ReactNode; desc: string }[] = [
    { 
      mode: 'reflect', 
      label: 'Deep Reflection', 
      icon: <Sparkles className="w-3.5 h-3.5 text-amber-400" />,
      desc: 'Self-inquiry & clarity'
    },
    { 
      mode: 'brainstorm', 
      label: 'Brainstorm Ideas', 
      icon: <Lightbulb className="w-3.5 h-3.5 text-sky-400" />,
      desc: 'Creative possibilities'
    },
    { 
      mode: 'summarize', 
      label: 'Insights & Summary', 
      icon: <FileText className="w-3.5 h-3.5 text-emerald-400" />,
      desc: 'Key themes & action steps'
    },
    { 
      mode: 'converse', 
      label: 'Open Dialogue', 
      icon: <Compass className="w-3.5 h-3.5 text-purple-400" />,
      desc: 'Mindful conversation'
    },
  ];

  return (
    <main className="flex-1 flex flex-col h-[calc(100vh-4rem)] bg-[#090d16]/75 backdrop-blur-md text-slate-100 overflow-hidden relative font-sans">
      {/* Top Workspace Header Bar */}
      <div className="bg-[#0c101c]/85 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 select-none">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 cursor-pointer"
            title="Toggle Vault Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Editable Title */}
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <input
              type="text"
              value={currentInteraction.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="font-semibold text-slate-100 text-sm sm:text-base bg-transparent hover:bg-slate-900 focus:bg-slate-900 px-2 py-1 -ml-2 rounded-lg border border-transparent focus:border-slate-700 focus:outline-none transition-all truncate max-w-sm"
              placeholder="Title this reflection..."
            />
            {currentInteraction.messages.length > 0 && (
              <button
                onClick={handleSuggestTitle}
                disabled={isSuggestingTitle}
                title="Auto-suggest title with Gemini"
                className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Wand2 className={`w-3.5 h-3.5 ${isSuggestingTitle ? 'animate-spin text-amber-400' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* Right Action Icons & Save Status */}
        <div className="flex items-center gap-2">
          {saveStatus === 'saved' && (
            <span className="text-[11px] font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              Saved to Firestore
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="text-[11px] font-medium text-red-400 bg-red-950/40 border border-red-800/50 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              <AlertCircle className="w-3 h-3 text-red-400" />
              Save Pending
            </span>
          )}

          {currentInteraction.messages.length > 0 && (
            <button
              onClick={handleExportMarkdown}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-all cursor-pointer"
              title="Download Markdown"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}
        </div>
      </div>

      {/* Mode Selector Strip */}
      <div className="bg-[#0b0f19] border-b border-slate-800/80 px-4 sm:px-6 py-2 flex items-center gap-2 overflow-x-auto scrollbar-none select-none">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mr-1 hidden sm:inline">
          Intent:
        </span>
        {modeButtons.map(item => (
          <button
            key={item.mode}
            onClick={() => handleModeChange(item.mode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer whitespace-nowrap ${
              currentInteraction.mode === item.mode
                ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 bg-slate-900/50 border border-slate-800/60'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Main Conversation Stream */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 max-w-4xl w-full mx-auto">
        {errorMsg && (
          <ErrorBanner
            message={errorMsg}
            onRetry={failedPendingInteraction ? handleRetrySave : () => handleSendMessage()}
            retryLabel={failedPendingInteraction ? "Retry Save" : "Retry"}
            onDismiss={() => setErrorMsg(null)}
          />
        )}

        {currentInteraction.messages.length === 0 ? (
          <div className="py-8 sm:py-12 text-center max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 text-amber-400 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Sparkles className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-100">
              Start your reflection
            </h3>
            <p className="text-xs text-slate-400 mt-1 mb-6 leading-relaxed">
              Write whatever is on your mind. Gemini 3.6 Flash will explore your thoughts, generate insights, and securely save your session to your personal Firestore vault.
            </p>

            <PromptSuggestions
              mode={currentInteraction.mode}
              onSelectPrompt={(text) => {
                setInputText(text);
                textareaRef.current?.focus();
              }}
            />
          </div>
        ) : (
          <div className="space-y-1">
            {currentInteraction.messages.map((message) => (
              <MessageItem key={message.id} message={message} />
            ))}

            {isGenerating && (
              <div className="flex items-center gap-3 py-4 text-slate-400 text-xs">
                <div className="w-8 h-8 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400 flex items-center justify-center flex-shrink-0 animate-pulse">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-2.5 bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-2xl rounded-tl-xs shadow-lg">
                  <div className="flex gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                  <span className="text-slate-300 text-xs font-medium">Reflecting with Gemini 3.6 Flash...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Composer Dock */}
      <div className="bg-[#0c101c]/85 backdrop-blur-xl border-t border-slate-800/80 p-4 sm:p-5">
        <div className="max-w-4xl mx-auto">
          <div className="relative border border-slate-800 focus-within:border-amber-500/60 focus-within:ring-1 focus-within:ring-amber-500/20 rounded-2xl bg-slate-900/90 shadow-xl transition-all">
            <textarea
              id="reflection-input"
              ref={textareaRef}
              rows={3}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Write your thoughts or ask a question (${currentInteraction.mode} mode)... [Cmd+Enter to send]`}
              className="w-full px-4 pt-3.5 pb-12 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none resize-none bg-transparent"
              disabled={isGenerating}
            />

            <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between pointer-events-none select-none">
              <span className="text-[11px] text-slate-500 hidden sm:inline">
                Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[10px]">⌘</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[10px]">Enter</kbd> to submit
              </span>
              <div className="flex items-center gap-2 ml-auto pointer-events-auto">
                <button
                  id="send-reflection-button"
                  onClick={() => handleSendMessage()}
                  disabled={!inputText.trim() || isGenerating}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-semibold text-xs hover:bg-amber-400 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-md"
                >
                  <span>Reflect</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
