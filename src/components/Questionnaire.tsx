import React, { useState } from 'react';
import { useApp } from '../AppContext';

export const Questionnaire: React.FC = () => {
  const { 
    teams, 
    teamId, 
    currentMember, 
    questions, 
    currentQuestionIndex, 
    setQuestionIndex,
    addSessionAnswer,
    currentSessionAnswers,
    saveMemberAnswers,
    setStep 
  } = useApp();
  
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const team = teams.find(t => t.id === teamId);
  if (!team || !currentMember) return null;

  const question = questions[currentQuestionIndex];
  if (!question) return null;

  const totalQuestions = questions.length;
  
  // Logic from initial commit: options are either custom or team members
  const options = question.options && question.options.length > 0 
    ? question.options 
    : team.members;

  const handleNext = async () => {
    if (selectedOption === null) return;

    const answerValue = options[selectedOption];
    const newAnswers = [...currentSessionAnswers, answerValue];
    addSessionAnswer(answerValue);

    if (currentQuestionIndex < totalQuestions - 1) {
      setQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
    } else {
      // Finished!
      await saveMemberAnswers(team.id, team.name, currentMember, newAnswers);
      setStep('live_results');
    }
  };

  const progressPercentage = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  return (
    <div className="glass-panel slide-in" style={{ width: '100%' }}>
      <div className="hud">
        <span className="player-tag">PLAYER: {currentMember.toUpperCase()}</span>
        <span className="level-tag">Q {currentQuestionIndex + 1}/{totalQuestions}</span>
      </div>
      
      <div className="progress-container">
        <div className="progress-bar" style={{ width: `${progressPercentage}%` }}></div>
      </div>

      <h2 className="question-text">
        {question.text}
      </h2>

      <div className="options-grid">
        {options.map((opt, idx) => (
          <button
            key={idx}
            className={`game-btn option-btn ${selectedOption === idx ? 'selected' : ''}`}
            onClick={() => setSelectedOption(idx)}
          >
            {opt}
          </button>
        ))}
      </div>

      <button 
        className="btn-primary huge-btn" 
        onClick={handleNext} 
        disabled={selectedOption === null}
      >
        {currentQuestionIndex === totalQuestions - 1 ? 'FINISH' : 'NEXT'}
      </button>
    </div>
  );
};

export default Questionnaire;
