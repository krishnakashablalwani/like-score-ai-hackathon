import { useState, useEffect } from 'react';

// teamId -> memberName -> array of answer indices
export type GlobalAnswers = Record<string, Record<string, number[]>>;

const STORAGE_KEY = 'team_compatibility_answers';

export function useStorage() {
  const [globalAnswers, setGlobalAnswers] = useState<GlobalAnswers>({});

  // Load from local storage on mount and when it changes in other tabs
  useEffect(() => {
    const loadFromStorage = () => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          setGlobalAnswers(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse storage", e);
        }
      } else {
        setGlobalAnswers({});
      }
    };

    loadFromStorage();

    window.addEventListener('storage', loadFromStorage);
    return () => window.removeEventListener('storage', loadFromStorage);
  }, []);

  const saveMemberAnswers = (teamId: string, memberName: string, answers: number[]) => {
    setGlobalAnswers(prev => {
      const updated = { ...prev };
      if (!updated[teamId]) {
        updated[teamId] = {};
      }
      updated[teamId][memberName] = answers;
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const getTeamAnswers = (teamId: string) => {
    return globalAnswers[teamId] || {};
  };

  const clearAllData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setGlobalAnswers({});
  };

  return {
    globalAnswers,
    saveMemberAnswers,
    getTeamAnswers,
    clearAllData
  };
}
