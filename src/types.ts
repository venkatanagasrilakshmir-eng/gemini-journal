export type ReflectionMode = 'reflect' | 'brainstorm' | 'summarize' | 'converse';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'gemini';
  text: string;
  timestamp: string;
  modelUsed?: string;
}

export interface JournalInteraction {
  id: string;
  userId: string;
  title: string;
  mode: ReflectionMode;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  summary?: string;
  tags?: string[];
  isPinned?: boolean;
}

export interface AuthUserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  isAnonymous?: boolean;
}

export interface AIResponsePayload {
  reply: string;
  modelUsed: string;
  success: boolean;
  error?: string;
}
