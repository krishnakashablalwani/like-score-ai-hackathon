import { useState } from 'react';
import type { GameState } from './data';
import { Welcome } from './components/Welcome';
import { TeamSelect } from './components/TeamSelect';
import { IdentitySelect } from './components/IdentitySelect';
import { Questionnaire } from './components/Questionnaire';
import { LiveResults } from './components/LiveResults';
import { Admin } from './components/Admin';

const initialState: GameState = {
  step: window.location.pathname === '/admin' ? 'admin' : 'welcome',
  teamId: null,
  currentMember: null,
  currentQuestionIndex: 0,
  currentSessionAnswers: []
};

function App() {
  const [gameState, setGameState] = useState<GameState>(initialState);

  // Sync browser URL if step changes to admin (or from admin to welcome)
  // This is a minimal router.
  if (gameState.step === 'admin' && window.location.pathname !== '/admin') {
    window.history.pushState({}, '', '/admin');
  } else if (gameState.step === 'welcome' && window.location.pathname === '/admin') {
    window.history.pushState({}, '', '/');
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
      case 'admin':
        return <Admin setGameState={setGameState} />;
      default:
        return <Welcome setGameState={setGameState} />;
    }
  };

  return (
    <>
      {renderStep()}
    </>
  );
}

export default App;
