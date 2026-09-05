import React, { useState } from 'react';
import Markdown from 'react-markdown';
import { Sparkles, User, Copy, Check } from 'lucide-react';
import type { ChatMessage } from '../types';

interface MessageItemProps {
  message: ChatMessage;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.sender === 'user';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const formatTime = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className={`flex gap-3 sm:gap-4 py-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {/* Avatar for AI */}
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
          <Sparkles className="w-4 h-4" />
        </div>
      )}

      {/* Message Body */}
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[90%] sm:max-w-[82%]`}>
        {/* Header line for AI: model name and copy button */}
        {!isUser && (
          <div className="flex items-center gap-2 mb-1.5 text-[11px] text-slate-400">
            <span className="font-semibold text-slate-200">Gemini</span>
            {message.modelUsed && (
              <span className="px-1.5 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-amber-300 font-mono text-[10px]">
                {message.modelUsed}
              </span>
            )}
            <span>•</span>
            <span>{formatTime(message.timestamp)}</span>
            <button
              onClick={handleCopy}
              title="Copy response"
              className="ml-1 text-slate-400 hover:text-slate-200 p-0.5 rounded transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        )}

        {/* Content Box */}
        <div
          className={`rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
            isUser
              ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-xs shadow-md selection:bg-slate-900 selection:text-white'
              : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-xs shadow-lg'
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.text}</p>
          ) : (
            <div className="markdown-body prose prose-invert prose-sm max-w-none text-slate-200 prose-p:leading-relaxed prose-headings:font-semibold prose-headings:text-slate-100 prose-strong:text-amber-300 prose-ul:my-1.5 prose-li:my-0.5 prose-code:text-amber-300 prose-code:bg-slate-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-slate-950 prose-pre:border prose-pre:border-slate-800">
              <Markdown>{message.text}</Markdown>
            </div>
          )}
        </div>

        {/* Timestamp for user */}
        {isUser && (
          <span className="text-[10px] text-slate-500 mt-1 mr-1">
            {formatTime(message.timestamp)}
          </span>
        )}
      </div>

      {/* Avatar for User */}
      {isUser && (
        <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
};
