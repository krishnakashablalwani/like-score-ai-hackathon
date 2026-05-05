import { useState, useEffect, useCallback } from 'react';

// teamId -> memberName -> array of answer texts
export type GlobalAnswers = Record<string, Record<string, string[]>>;

const API_URL = import.meta.env.VITE_SHEETS_API_URL as string;

export function useStorage() {
  const [globalAnswers, setGlobalAnswers] = useState<GlobalAnswers>({});
  const [loading, setLoading] = useState(true);

  const fetchAnswers = useCallback(async () => {
    if (!API_URL) {
      console.error('VITE_SHEETS_API_URL is not set');
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setGlobalAnswers(prev => {
        const prevStr = JSON.stringify(prev);
        const newStr = JSON.stringify(data);
        return prevStr === newStr ? prev : data;
      });
    } catch (e) {
      console.error('Failed to fetch answers from Google Sheets', e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load on mount and poll every 3 seconds
  useEffect(() => {
    fetchAnswers();
    const interval = setInterval(fetchAnswers, 3000);
    return () => clearInterval(interval);
  }, [fetchAnswers]);

  const saveMemberAnswers = async (teamId: string, teamName: string, memberName: string, answers: string[]) => {
    if (!API_URL) {
      console.error('VITE_SHEETS_API_URL is not set');
      return;
    }

    // Optimistic local update
    setGlobalAnswers(prev => {
      const updated = { ...prev };
      if (!updated[teamId]) {
        updated[teamId] = {};
      }
      updated[teamId][memberName] = answers;
      return updated;
    });

    try {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ teamId, teamName, memberName, answers }),
      });
    } catch (e) {
      console.error('Failed to save answers to Google Sheets', e);
    }
  };

  const getTeamAnswers = (teamId: string) => {
    return globalAnswers[teamId] || {};
  };

  return {
    globalAnswers,
    saveMemberAnswers,
    getTeamAnswers,
    loading,
    refreshData: fetchAnswers
  };
}
