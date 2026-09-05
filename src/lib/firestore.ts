import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  orderBy,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';
import type { JournalInteraction } from '../types';

/**
 * Strict Undefined-Stripping utility to prevent Firestore payload crashes.
 * Recursively deletes undefined values and normalizes objects.
 */
export function sanitizePayload<T>(input: T): T {
  if (input === null || input === undefined) {
    return null as unknown as T;
  }
  if (Array.isArray(input)) {
    return input.map(item => sanitizePayload(item)) as unknown as T;
  }
  if (typeof input === 'object' && !(input instanceof Date)) {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(input)) {
      if (value !== undefined) {
        cleaned[key] = sanitizePayload(value);
      }
    }
    return cleaned as T;
  }
  return input;
}

/**
 * Save or update a journal interaction document isolated to `users/{userId}/interactions/{interactionId}`.
 */
export async function saveUserInteraction(
  userId: string, 
  interaction: JournalInteraction
): Promise<{ success: boolean; error?: string }> {
  if (!userId) {
    return { success: false, error: "Authentication required: Missing user ID." };
  }
  if (!interaction.id) {
    return { success: false, error: "Invalid interaction document identifier." };
  }

  try {
    const docRef = doc(db, 'users', userId, 'interactions', interaction.id);
    const sanitizedData = sanitizePayload({
      ...interaction,
      userId, // guarantee owner bound
      updatedAt: new Date().toISOString(),
      _serverSyncedAt: serverTimestamp()
    });

    await setDoc(docRef, sanitizedData, { merge: true });
    return { success: true };
  } catch (err: any) {
    console.error("Firestore persistence error:", err);
    return { 
      success: false, 
      error: err?.message || "Failed to persist interaction to Firestore. Please retry." 
    };
  }
}

/**
 * Retrieve all journal interactions for the authenticated user, ordered by update time descending.
 */
export async function getUserInteractions(userId: string): Promise<JournalInteraction[]> {
  if (!userId) return [];

  try {
    const colRef = collection(db, 'users', userId, 'interactions');
    const q = query(colRef, orderBy('updatedAt', 'desc'));
    const snapshot = await getDocs(q);

    const interactions: JournalInteraction[] = [];
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      interactions.push({
        id: docSnap.id,
        userId: data.userId || userId,
        title: data.title || "Untitled Reflection",
        mode: data.mode || 'reflect',
        messages: Array.isArray(data.messages) ? data.messages : [],
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
        summary: data.summary || undefined,
        tags: Array.isArray(data.tags) ? data.tags : [],
        isPinned: !!data.isPinned
      });
    });

    return interactions;
  } catch (err: any) {
    console.error("Failed to query interactions from Firestore:", err);
    // Fallback: try querying without order by if index building
    try {
      const colRef = collection(db, 'users', userId, 'interactions');
      const snapshot = await getDocs(colRef);
      const items: JournalInteraction[] = [];
      snapshot.forEach(d => {
        const data = d.data();
        items.push({
          id: d.id,
          userId: data.userId || userId,
          title: data.title || "Untitled Reflection",
          mode: data.mode || 'reflect',
          messages: Array.isArray(data.messages) ? data.messages : [],
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
          summary: data.summary || undefined,
          tags: Array.isArray(data.tags) ? data.tags : [],
          isPinned: !!data.isPinned
        });
      });
      return items.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    } catch (fallbackErr) {
      console.error("Fallback query error:", fallbackErr);
      return [];
    }
  }
}

/**
 * Delete an interaction permanently.
 */
export async function deleteUserInteraction(
  userId: string, 
  interactionId: string
): Promise<{ success: boolean; error?: string }> {
  if (!userId || !interactionId) {
    return { success: false, error: "Missing required parameters." };
  }

  try {
    const docRef = doc(db, 'users', userId, 'interactions', interactionId);
    await deleteDoc(docRef);
    return { success: true };
  } catch (err: any) {
    console.error("Failed to delete interaction:", err);
    return { success: false, error: err?.message || "Failed to delete interaction." };
  }
}

/**
 * Update interaction title, summary, or pinned status.
 */
export async function updateUserInteractionMeta(
  userId: string,
  interactionId: string,
  updates: Partial<Pick<JournalInteraction, 'title' | 'summary' | 'isPinned' | 'tags'>>
): Promise<{ success: boolean; error?: string }> {
  if (!userId || !interactionId) {
    return { success: false, error: "Missing required parameters." };
  }

  try {
    const docRef = doc(db, 'users', userId, 'interactions', interactionId);
    const sanitized = sanitizePayload({
      ...updates,
      updatedAt: new Date().toISOString()
    });
    await updateDoc(docRef, sanitized);
    return { success: true };
  } catch (err: any) {
    console.error("Failed to update interaction metadata:", err);
    return { success: false, error: err?.message || "Failed to update reflection." };
  }
}
