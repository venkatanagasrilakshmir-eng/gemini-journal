import React from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  LogOut, 
  Plus, 
  User as UserIcon,
  RefreshCw
} from 'lucide-react';
import type { AuthUserProfile } from '../types';

interface HeaderProps {
  user: AuthUserProfile;
  onSignOut: () => void;
  onNewEntry: () => void;
  isSaving?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  user, 
  onSignOut, 
  onNewEntry, 
  isSaving,
}) => {
  return (
    <header id="app-header" className="border-b border-slate-800/80 bg-[#0b0f19]/90 backdrop-blur-xl sticky top-0 z-30 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Security Badge */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 text-amber-400 flex items-center justify-center shadow-sm">
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-semibold text-slate-100 tracking-tight">
                ReflectAI
              </h1>
              <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-950/50 text-emerald-400 border border-emerald-800/50">
                <ShieldCheck className="w-3 h-3" />
                Enterprise Firestore Vault
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Executive Cognitive Sanctuary &bull; Gemini 3.6 Flash
            </p>
          </div>
        </div>

        {/* Right Actions / Sync Indicator / User */}
        <div className="flex items-center gap-2.5">
          {isSaving ? (
            <span className="text-xs text-slate-400 flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800">
              <RefreshCw className="w-3 h-3 text-amber-400 animate-spin" />
              <span className="hidden md:inline text-[11px]">Syncing...</span>
            </span>
          ) : (
            <span className="hidden lg:inline-flex items-center gap-1.5 text-[11px] text-emerald-400/80 bg-emerald-950/30 px-2 py-0.5 rounded-full border border-emerald-900/40">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Vault Synced
            </span>
          )}

          <button
            id="new-reflection-button"
            onClick={onNewEntry}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 text-xs font-semibold shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Reflection</span>
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || "User"}
                className="w-7 h-7 rounded-full ring-1 ring-slate-700 object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center text-xs font-medium">
                <UserIcon className="w-3.5 h-3.5" />
              </div>
            )}
            <div className="hidden xl:block text-left">
              <p className="text-xs font-medium text-slate-200 leading-tight max-w-[120px] truncate">
                {user.displayName || "Client User"}
              </p>
              <p className="text-[10px] text-slate-400 max-w-[120px] truncate">
                {user.email || (user.isAnonymous ? "Guest Client Session" : "Protected")}
              </p>
            </div>
          </div>

          <button
            id="sign-out-button"
            onClick={onSignOut}
            title="Sign Out"
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
