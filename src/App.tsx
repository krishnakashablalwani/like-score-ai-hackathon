import { useState } from 'react';
import type { GameState } from './data';
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

function App() {
  const [gameState, setGameState] = useState<GameState>(initialState);

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

  return (
    <>
      {renderStep()}
    </>
  );
}

export default App;
