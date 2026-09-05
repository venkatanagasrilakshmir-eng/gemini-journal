import React from 'react';
import { Sparkles, Lightbulb, FileText, Compass } from 'lucide-react';
import type { ReflectionMode } from '../types';

interface PromptSuggestionsProps {
  mode: ReflectionMode;
  onSelectPrompt: (prompt: string) => void;
}

const PROMPTS: Record<ReflectionMode, { label: string; text: string }[]> = {
  reflect: [
    {
      label: "Energy Audit",
      text: "Looking back on today, what single interaction energized me the most, and what felt surprisingly draining?"
    },
    {
      label: "Uncertainty Check",
      text: "What is an important decision I am currently putting off, and what fear might be underneath the hesitation?"
    },
    {
      label: "Gratitude & Growth",
      text: "What is an unexpected challenge I encountered this week that actually taught me something valuable about myself?"
    }
  ],
  brainstorm: [
    {
      label: "Creative Angles",
      text: "I am working on solving [describe your challenge]. What are 3 non-obvious ways to approach this from first principles?"
    },
    {
      label: "Overcoming Roadblocks",
      text: "If I had zero fear of failure and abundant resources, how would I tackle this roadblock?"
    },
    {
      label: "Perspective Shift",
      text: "How would an empathetic mentor or seasoned advisor view my current situation?"
    }
  ],
  summarize: [
    {
      label: "Key Takeaways",
      text: "Synthesize my recent reflections into 3 core insights, emotional tone, and 2 concrete action steps for tomorrow."
    },
    {
      label: "Pattern Recognition",
      text: "What recurring behavioral or mindset themes appear in the thoughts I just shared?"
    }
  ],
  converse: [
    {
      label: "Freeform Journal",
      text: "Here is what has been on my mind lately without filtering: "
    },
    {
      label: "Midday Check-In",
      text: "Taking a quick 5-minute pause to check in with myself: my body feels, my mind is currently focused on..."
    }
  ]
};

export const PromptSuggestions: React.FC<PromptSuggestionsProps> = ({ mode, onSelectPrompt }) => {
  const list = PROMPTS[mode] || PROMPTS.reflect;

  return (
    <div className="py-2 select-none">
      <p className="text-[11px] font-semibold text-slate-500 mb-2 uppercase tracking-wider">
        Inspiration Prompts
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {list.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onSelectPrompt(item.text)}
            className="text-left text-xs p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:border-amber-500/50 hover:bg-slate-800/80 transition-all cursor-pointer shadow-sm group card-3d"
          >
            <span className="font-semibold text-slate-200 block text-[11px] mb-1 group-hover:text-amber-300 transition-colors">
              {item.label}
            </span>
            <span className="text-slate-400 line-clamp-2 text-[11px] leading-relaxed">
              {item.text}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
