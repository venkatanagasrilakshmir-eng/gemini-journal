import React from 'react';
import { AlertTriangle, RefreshCw, X } from 'lucide-react';

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  retryLabel?: string;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({
  message,
  onRetry,
  onDismiss,
  retryLabel = "Retry"
}) => {
  return (
    <div className="p-3.5 mb-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-200 text-xs flex items-start gap-3 shadow-lg">
      <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
      <div className="flex-1 leading-relaxed">
        <p className="font-semibold text-red-100">Notice</p>
        <p className="text-red-300 mt-0.5">{message}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-900/60 hover:bg-red-800 text-red-100 font-medium transition-colors cursor-pointer border border-red-700/50"
          >
            <RefreshCw className="w-3 h-3" />
            <span>{retryLabel}</span>
          </button>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="p-1 rounded-lg text-red-400 hover:text-red-200 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
