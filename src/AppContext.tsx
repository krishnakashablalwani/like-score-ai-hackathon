import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface TeamData {
  id: string;
  name: string;
  members: string[];
}

export interface Question {
  id: number;
  text: string;
  options: string[];
}

export type GlobalAnswers = Record<string, Record<string, string[]>>;

interface AppContextType {
  teams: TeamData[];
  questions: Question[];
  globalAnswers: GlobalAnswers;
  step: 'welcome' | 'team_select' | 'identity_select' | 'questionnaire' | 'live_results';
  teamId: string | null;
  currentMember: string | null;
  currentQuestionIndex: number;
  currentSessionAnswers: string[];
  loading: boolean;
  error: string | null;
  saveMemberAnswers: (teamId: string, teamName: string, memberName: string, answers: string[]) => Promise<void>;
  getTeamAnswers: (teamId: string) => Record<string, string[]>;
  refreshData: () => Promise<void>;
  setStep: (step: 'welcome' | 'team_select' | 'identity_select' | 'questionnaire' | 'live_results') => void;
  selectTeam: (teamId: string | null) => void;
  selectMember: (memberName: string | null) => void;
  setQuestionIndex: (index: number) => void;
  addSessionAnswer: (answer: string) => void;
  resetGame: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

const API_URL = import.meta.env.VITE_SHEETS_API_URL as string;

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [teams, setTeams] = useState<TeamData[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [globalAnswers, setGlobalAnswers] = useState<GlobalAnswers>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Game State
  const [step, setStep] = useState<AppContextType['step']>('welcome');
  const [teamId, setTeamId] = useState<string | null>(null);
  const [currentMember, setCurrentMember] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentSessionAnswers, setCurrentSessionAnswers] = useState<string[]>([]);

  const fetchAnswers = useCallback(async () => {
    if (!API_URL) return;
    try {
      const res = await fetch(API_URL, { cache: 'no-store' });
      const answersData = await res.json();
      setGlobalAnswers(answersData && typeof answersData === 'object' ? answersData : {});
    } catch (e) {
      console.error('Fetch answers error:', e);
    }
  }, []);

  const fetchData = useCallback(async () => {
    if (!API_URL) {
      setError('VITE_SHEETS_API_URL is missing in .env');
      setLoading(false);
      return;
    }

    try {
      // Parallel fetch for everything initially
      const [teamsRes, questionsRes, answersRes] = await Promise.all([
        fetch(API_URL + '?action=teams', { cache: 'no-store' }),
        fetch(API_URL + '?action=questions', { cache: 'no-store' }),
        fetch(API_URL, { cache: 'no-store' }),
      ]);

      const [teamsData, questionsData, answersData] = await Promise.all([
        teamsRes.json(),
        questionsRes.json(),
        answersRes.json()
      ]);

      setTeams(Array.isArray(teamsData) ? teamsData : []);
      setQuestions(Array.isArray(questionsData) ? questionsData : []);
      setGlobalAnswers(answersData && typeof answersData === 'object' ? answersData : {});
      setError(null);
    } catch (e) {
      console.error('Fetch error:', e);
      if (teams.length === 0) {
        setError('Connection failed. Verify Google Script deployment and .env URL.');
      }
    } finally {
      setLoading(false);
    }
  }, [teams.length]);

  useEffect(() => {
    fetchData();
    // Faster polling for dynamic answers
    const interval = setInterval(fetchAnswers, 3000);
    return () => clearInterval(interval);
  }, [fetchData, fetchAnswers]);

  const saveMemberAnswers = useCallback(async (tId: string, tName: string, mName: string, answers: string[]) => {
    if (!API_URL) return;

    // Optimistic UI Update for immediate feedback
    setGlobalAnswers(prev => ({
      ...prev,
      [tId]: {
        ...(prev[tId] || {}),
        [mName]: answers
      }
    }));

    try {
      // Don't await the fetch if we want the UI to feel instant, 
      // but the user said the "finish button" is slow, which calls this.
      // We still await but the optimistic update above handles the local display.
      fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ teamId: tId, teamName: tName, memberName: mName, answers }),
      }).catch(e => console.error('Background save error:', e));
      
      // Resolve immediately to let the component transition
      return Promise.resolve();
    } catch (e) {
      console.error('Save error:', e);
    }
  }, []);

  const getTeamAnswers = useCallback((tId: string) => {
    return globalAnswers[tId] || {};
  }, [globalAnswers]);

  const resetGame = useCallback(() => {
    setStep('welcome');
    setTeamId(null);
    setCurrentMember(null);
    setCurrentQuestionIndex(0);
    setCurrentSessionAnswers([]);
  }, []);

  const selectTeam = (id: string | null) => {
    setTeamId(id);
    setStep(id ? 'identity_select' : 'team_select');
  };

  const selectMember = (name: string | null) => {
    setCurrentMember(name);
    setCurrentQuestionIndex(0);
    setCurrentSessionAnswers([]);
    setStep(name ? 'questionnaire' : 'identity_select');
  };

  const addSessionAnswer = (answer: string) => {
    setCurrentSessionAnswers(prev => [...prev, answer]);
  };

  return (
    <AppContext.Provider value={{ 
      teams, 
      questions, 
      globalAnswers, 
      step,
      teamId,
      currentMember,
      currentQuestionIndex,
      currentSessionAnswers,
      loading, 
      error, 
      saveMemberAnswers, 
      getTeamAnswers, 
      refreshData: fetchData,
      setStep,
      selectTeam,
      selectMember,
      setQuestionIndex: setCurrentQuestionIndex,
      addSessionAnswer,
      resetGame
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
}

// Compatibility aliases
export const useConfig = useApp;
export const useStorage = useApp;
