/**
 * usePreferenceStore.ts — Session-based user preference learning
 *
 * Tracks which layout philosophies a user selects across sessions.
 * Uses localStorage to persist preferences across page reloads.
 *
 * HOW IT WORKS:
 *   1. Every time a user clicks a layout card, log-choice fires
 *   2. We ALSO store the choice locally in preferenceStore
 *   3. On next generation, we surface the user's top preferred philosophies
 *      first in the 12-layout gallery (reordering, not removing)
 *   4. When enough data is collected (1000+ choices), this feeds the
 *      server-side scoring model training
 *
 * DATA SHAPE (localStorage key: 'sw_preferences'):
 * {
 *   choices: [
 *     { philosophyId, roomWidth, roomLength, vibe, timestamp },
 *     ...
 *   ],
 *   topPhilosophies: { 'philosophy-cozy': 3, 'philosophy-cinema': 1, ... }
 * }
 */

import { useState, useEffect, useCallback } from 'react';

export interface ChoiceRecord {
  philosophyId: string;
  roomWidth: number;
  roomLength: number;
  vibe?: string;
  timestamp: string;
  prompt?: string;
}

export interface PreferenceStore {
  choices: ChoiceRecord[];
  topPhilosophies: Record<string, number>;  // philosophyId -> count
  totalChoices: number;
}

const STORAGE_KEY = 'sw_preferences';
const MAX_CHOICES = 200;  // keep last 200 choices in localStorage

function loadStore(): PreferenceStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { choices: [], topPhilosophies: {}, totalChoices: 0 };
    return JSON.parse(raw);
  } catch {
    return { choices: [], topPhilosophies: {}, totalChoices: 0 };
  }
}

function saveStore(store: PreferenceStore): void {
  try {
    // Trim to last MAX_CHOICES entries to avoid unbounded growth
    const trimmed: PreferenceStore = {
      ...store,
      choices: store.choices.slice(-MAX_CHOICES),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // localStorage full or blocked — silently ignore
  }
}

/**
 * usePreferenceStore — React hook for reading and writing user preferences.
 *
 * Usage:
 *   const { logChoice, getPreferredOrder, topPhilosophies } = usePreferenceStore();
 */
export function usePreferenceStore() {
  const [store, setStore] = useState<PreferenceStore>(() => loadStore());

  // Sync store to localStorage whenever it changes
  useEffect(() => {
    saveStore(store);
  }, [store]);

  /**
   * Log a layout choice. Call this when the user clicks a layout card.
   */
  const logChoice = useCallback((
    philosophyId: string,
    roomWidth: number,
    roomLength: number,
    vibe?: string,
    prompt?: string,
  ) => {
    setStore(prev => {
      const newChoice: ChoiceRecord = {
        philosophyId,
        roomWidth,
        roomLength,
        vibe,
        prompt,
        timestamp: new Date().toISOString(),
      };

      const updatedCounts = { ...prev.topPhilosophies };
      updatedCounts[philosophyId] = (updatedCounts[philosophyId] || 0) + 1;

      return {
        choices: [...prev.choices, newChoice],
        topPhilosophies: updatedCounts,
        totalChoices: prev.totalChoices + 1,
      };
    });
  }, []);

  /**
   * Reorder a list of philosophy options so that the user's most-chosen
   * philosophies appear first (personalised gallery order).
   *
   * Options with matching philosophyIds bubble to the top by frequency.
   * Unseen philosophies stay in their original order at the bottom.
   */
  const getPreferredOrder = useCallback(<T extends { id: string }>(options: T[]): T[] => {
    if (!store.topPhilosophies || Object.keys(store.topPhilosophies).length === 0) {
      return options;  // no preferences yet — original order
    }

    const counts = store.topPhilosophies;
    return [...options].sort((a, b) => {
      const countA = counts[a.id] || 0;
      const countB = counts[b.id] || 0;
      return countB - countA;  // higher count first
    });
  }, [store.topPhilosophies]);

  /**
   * Get personalisation summary for display:
   * "Based on your 5 previous choices, you tend to prefer Cinema and Cozy layouts."
   */
  const getPersonalisationNote = useCallback((): string | null => {
    const total = store.totalChoices;
    if (total < 3) return null;  // not enough data yet

    const top = Object.entries(store.topPhilosophies)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([id]) => id.replace('philosophy-', ''));

    if (top.length === 0) return null;

    const topNames = top.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(' & ');
    return `Based on your ${total} previous choice${total !== 1 ? 's' : ''}, we've put your preferred ${topNames} style${top.length > 1 ? 's' : ''} first.`;
  }, [store]);

  /**
   * Export choices as JSONL for server-side training.
   * Call this to get a blob the user (or backend) can upload.
   */
  const exportChoicesJSONL = useCallback((): string => {
    return store.choices.map(c => JSON.stringify(c)).join('\n');
  }, [store.choices]);

  /**
   * Clear all stored preferences (reset).
   */
  const clearPreferences = useCallback(() => {
    const empty: PreferenceStore = { choices: [], topPhilosophies: {}, totalChoices: 0 };
    setStore(empty);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    logChoice,
    getPreferredOrder,
    getPersonalisationNote,
    exportChoicesJSONL,
    clearPreferences,
    topPhilosophies: store.topPhilosophies,
    totalChoices: store.totalChoices,
  };
}
