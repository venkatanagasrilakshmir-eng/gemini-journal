import React, { useState } from 'react';
import { 
  Search, 
  Trash2, 
  Pin, 
  Calendar, 
  Sparkles, 
  Lightbulb, 
  FileText, 
  Compass, 
  X 
} from 'lucide-react';
import type { JournalInteraction, ReflectionMode } from '../types';

interface HistorySidebarProps {
  interactions: JournalInteraction[];
  activeId: string | null;
  onSelectInteraction: (id: string) => void;
  onDeleteInteraction: (id: string) => void;
  onTogglePin: (id: string, currentPin: boolean) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({
  interactions,
  activeId,
  onSelectInteraction,
  onDeleteInteraction,
  onTogglePin,
  isOpen,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const filteredInteractions = interactions.filter(item => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.messages.some(m => m.text.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (!matchesSearch) return false;
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'pinned') return item.isPinned;
    return item.mode === selectedFilter;
  });

  const getModeIcon = (mode: ReflectionMode) => {
    switch (mode) {
      case 'reflect': return <Sparkles className="w-3.5 h-3.5 text-amber-400" />;
      case 'brainstorm': return <Lightbulb className="w-3.5 h-3.5 text-sky-400" />;
      case 'summarize': return <FileText className="w-3.5 h-3.5 text-emerald-400" />;
      case 'converse': return <Compass className="w-3.5 h-3.5 text-purple-400" />;
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        id="journal-history-sidebar"
        className={`fixed lg:static top-16 bottom-0 left-0 z-40 w-80 bg-[#0c101c]/85 backdrop-blur-xl border-r border-slate-800/80 flex flex-col transition-transform duration-200 ease-in-out select-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Header & Quick 3D Launcher */}
        <div className="p-4 border-b border-slate-800/80 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-300">Journal Vault</h2>
              <span className="text-[11px] text-amber-400 font-mono bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700">
                {interactions.length}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={onClose}
                className="lg:hidden p-1 text-slate-400 hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search entries or insights..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-900 border border-slate-800 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 text-slate-100 placeholder:text-slate-500 transition-colors"
            />
          </div>

          {/* Quick Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] scrollbar-none">
            {[
              { id: 'all', label: 'All' },
              { id: 'pinned', label: 'Pinned' },
              { id: 'reflect', label: 'Reflect' },
              { id: 'brainstorm', label: 'Ideas' },
              { id: 'summarize', label: 'Summary' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedFilter(tab.id)}
                className={`px-2 py-1 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                  selectedFilter === tab.id
                    ? 'bg-amber-500/20 text-amber-300 font-medium border border-amber-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Entries List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5 divide-y-0">
          {filteredInteractions.length === 0 ? (
            <div className="text-center py-12 px-4">
              <p className="text-xs text-slate-500">
                {searchTerm ? 'No entries match your search.' : 'No reflections logged yet.'}
              </p>
              <p className="text-[11px] text-slate-600 mt-1">
                Start a reflection to record your thoughts.
              </p>
            </div>
          ) : (
            filteredInteractions.map((entry) => {
              const isSelected = entry.id === activeId;
              const previewText = entry.messages[0]?.text || "Empty draft...";

              return (
                <div
                  key={entry.id}
                  onClick={() => {
                    onSelectInteraction(entry.id);
                    onClose();
                  }}
                  className={`group relative p-3 rounded-xl transition-all cursor-pointer border text-left card-3d ${
                    isSelected
                      ? 'bg-slate-800/90 border-amber-500/40 shadow-lg shadow-black/20'
                      : 'bg-slate-900/40 border-slate-800/60 hover:bg-slate-800/50 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      {getModeIcon(entry.mode)}
                      <h3 className={`text-xs font-semibold truncate ${isSelected ? 'text-amber-200' : 'text-slate-200'}`}>
                        {entry.title || "Untitled Reflection"}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        title={entry.isPinned ? "Unpin" : "Pin"}
                        onClick={(e) => {
                          e.stopPropagation();
                          onTogglePin(entry.id, !entry.isPinned);
                        }}
                        className={`p-1 rounded hover:bg-slate-700 cursor-pointer ${
                          entry.isPinned ? 'text-amber-400' : 'text-slate-500'
                        }`}
                      >
                        <Pin className="w-3 h-3" />
                      </button>

                      <button
                        title="Delete entry"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm("Delete this reflection permanently?")) {
                            onDeleteInteraction(entry.id);
                          }
                        }}
                        className="p-1 rounded hover:bg-red-950 text-slate-500 hover:text-red-400 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-2">
                    {previewText}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>{formatDate(entry.updatedAt)}</span>
                    <span className="font-mono bg-slate-800/90 px-1.5 py-0.5 rounded text-slate-400 border border-slate-800">
                      {entry.messages.length} turns
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>
    </>
  );
};
