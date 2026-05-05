export interface Question {
  id: number;
  text: string;
  options: string[]; // If options are empty or not enough, we will inject member names
}

export const questions: Question[] = [
  {
    id: 1,
    text: "Who is the most likely to bring snacks to a meeting?",
    options: [] // Will be populated with team member names
  },
  {
    id: 2,
    text: "What's the team's go-to lunch order?",
    options: ["Pizza 🍕", "Sushi 🍣", "Burgers 🍔", "Salad / Healthy 🥗"]
  },
  {
    id: 3,
    text: "How does the team handle stressful deadlines?",
    options: ["Panic and chaos 😱", "Quiet focus 🤫", "Lots of coffee ☕", "Dividing and conquering 🤝"]
  },
  {
    id: 4,
    text: "Who is the designated note-taker?",
    options: []
  },
  {
    id: 5,
    text: "What kind of environment does the team work best in?",
    options: ["Total silence 🎧", "Background music 🎵", "Chaotic coffee shop ☕", "Office chatter 🗣️"]
  },
  {
    id: 6,
    text: "How does the team prefer to communicate?",
    options: ["Slack / Teams 💬", "Emails 📧", "In-person meetings 🤝", "Carrier Pigeon 🕊️"]
  },
  {
    id: 7,
    text: "What is the team's preferred way to celebrate a win?",
    options: ["Going out for drinks/dinner 🍻", "A simple high-five ✋", "Taking a half-day off 🏖️", "Shouting from the rooftops 🗣️"]
  },
  {
    id: 8,
    text: "Who is the early bird of the team?",
    options: []
  },
  {
    id: 9,
    text: "If the team had a mascot, what would it be?",
    options: ["A wise owl 🦉", "A loyal dog 🐕", "A busy bee 🐝", "A sleepy sloth 🦥"]
  },
  {
    id: 10,
    text: "If your team was stranded on a desert island, who would survive the longest?",
    options: []
  }
];

export type TeamSize = 2 | 3;

export interface TeamData {
  id: string;
  name: string;
  members: string[]; // 2 or 3 members
}

export const teamsDatabase: TeamData[] = [
  { id: '1', name: 'The Dream Team', members: ['Alice', 'Bob'] },
  { id: '2', name: 'Code Ninjas', members: ['Charlie', 'Dave', 'Eve'] },
  { id: '3', name: 'Design Gurus', members: ['Fiona', 'George'] },
  { id: '4', name: 'Marketing Wizards', members: ['Hannah', 'Ian', 'Jane'] },
  { id: '5', name: 'QA Squad', members: ['Kevin', 'Laura'] },
];

export type Step = 'welcome' | 'team_select' | 'identity_select' | 'questionnaire' | 'live_results' | 'admin';

export interface GameState {
  step: Step;
  teamId: string | null;
  currentMember: string | null; // Who is currently taking the test
  currentQuestionIndex: number;
  currentSessionAnswers: number[]; // Answers for the current member in this session
}
