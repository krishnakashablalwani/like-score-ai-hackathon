import { useState } from 'react';
import type { GameState } from './data';
import { ConfigProvider, useConfig } from './ConfigContext';
import { Welcome } from './components/Welcome';
import { TeamSelect } from './components/TeamSelect';
import { IdentitySelect } from './components/IdentitySelect';
import { Questionnaire } from './components/Questionnaire';
import { LiveResults } from './components/LiveResults';

const initialState: GameState = {
  step: 'welcome',
  teamId: null,
  currentMember: null,
  currentQuestionIndex: 0,
  currentSessionAnswers: []
};

function AppContent() {
  const [gameState, setGameState] = useState<GameState>(initialState);
  const { loading, error } = useConfig();

  if (loading) {
    return (
      <div className="glass-panel text-center pulse-container" style={{ width: '100%' }}>
        <h2>Loading...</h2>
        <p className="subtitle-small">Fetching quiz data</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel text-center" style={{ width: '100%' }}>
        <h2>⚠️ Configuration Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  const renderStep = () => {
    switch (gameState.step) {
      case 'welcome':
        return <Welcome setGameState={setGameState} />;
      case 'team_select':
        return <TeamSelect gameState={gameState} setGameState={setGameState} />;
      case 'identity_select':
        return <IdentitySelect gameState={gameState} setGameState={setGameState} />;
      case 'questionnaire':
        return <Questionnaire gameState={gameState} setGameState={setGameState} />;
      case 'live_results':
        return <LiveResults gameState={gameState} setGameState={setGameState} />;
      default:
        return <Welcome setGameState={setGameState} />;
    }
  };

  return <>{renderStep()}</>;
}

function App() {
  return (
    <ConfigProvider>
      <AppContent />
    </ConfigProvider>
  );
}

export default App;
