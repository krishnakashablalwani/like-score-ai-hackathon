import './index.css';
import { AppProvider, useApp } from './AppContext';
import Welcome from './components/Welcome';
import TeamSelect from './components/TeamSelect';
import IdentitySelect from './components/IdentitySelect';
import Questionnaire from './components/Questionnaire';
import LiveResults from './components/LiveResults';

function AppContent() {
  const { step, loading, teams, error } = useApp();


  if (loading && teams.length === 0) {
    return (
      <div className="glass-panel text-center" style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
        <div className="avatar heartbeat">👾</div>
        <h2>LOADING...</h2>
        <p className="subtitle-small">Booting system</p>
      </div>
    );
  }

  if (error && teams.length === 0) {
    return (
      <div className="glass-panel text-center" style={{ width: '100%', maxWidth: '400px', margin: '0 auto', border: '2px solid var(--error-color)' }}>
        <h2 style={{ color: 'var(--error-color)' }}>ERROR</h2>
        <p>{error}</p>
        <button className="btn-primary" onClick={() => window.location.reload()} style={{ marginTop: '1.5rem' }}>RETRY</button>
      </div>
    );
  }

  const renderStep = () => {
    switch (step) {
      case 'welcome':
        return <Welcome />;
      case 'team_select':
        return <TeamSelect />;
      case 'identity_select':
        return <IdentitySelect />;
      case 'questionnaire':
        return <Questionnaire />;
      case 'live_results':
        return <LiveResults />;
      default:
        return <Welcome />;
    }
  };

  return (
    <div id="app-container" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      {renderStep()}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
