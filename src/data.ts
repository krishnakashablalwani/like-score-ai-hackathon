export type Step = 'welcome' | 'team_select' | 'identity_select' | 'questionnaire' | 'live_results';

export interface GameState {
  step: Step;
  teamId: string | null;
  currentMember: string | null;
  currentQuestionIndex: number;
  currentSessionAnswers: number[];
}
