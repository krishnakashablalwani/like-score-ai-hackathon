import React, { createContext, useContext, useEffect, useState } from 'react';

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

interface ConfigContextType {
  teams: TeamData[];
  questions: Question[];
  loading: boolean;
  error: string | null;
}

const ConfigContext = createContext<ConfigContextType>({
  teams: [],
  questions: [],
  loading: true,
  error: null
});

const API_URL = import.meta.env.VITE_SHEETS_API_URL as string;

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const [teams, setTeams] = useState<TeamData[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!API_URL) {
      setError('API URL is not configured');
      setLoading(false);
      return;
    }

    Promise.all([
      fetch(API_URL + '?action=teams').then(r => r.json()),
      fetch(API_URL + '?action=questions').then(r => r.json()),
    ])
      .then(([teamsData, questionsData]) => {
        setTeams(teamsData);
        setQuestions(questionsData);
        setLoading(false);
      })
      .catch(e => {
        console.error('Failed to load config', e);
        setError('Failed to load configuration from Google Sheets');
        setLoading(false);
      });
  }, []);

  return (
    <ConfigContext.Provider value={{ teams, questions, loading, error }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  return useContext(ConfigContext);
}
