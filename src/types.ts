export type Category = 'urgent' | 'long-term' | 'worry' | 'reminder' | 'outside-control';

export interface ActionPlan {
  nextStep: string;
  timeEstimate: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface ThoughtItem {
  id: string;
  text: string;
  category: Category;
  controllable: boolean;
  actionPlan?: ActionPlan;
  createdAt: number;
  completedAt?: number;
  isCompleted?: boolean;
}

export interface UserInsights {
  summary: string;
  dominantCategory: string;
  overwhelmTrend: 'improving' | 'stable' | 'increasing';
  lastUpdated: number;
}

export interface PersonalizationEntry {
  question: string;
  answer: string;
  timestamp: number;
}

export interface PersonalizationData {
  entries: PersonalizationEntry[];
  mainGoal?: string; // Keep for legacy/quick access
  stressTriggers?: string;
  preferredSupport?: string;
}

export interface TimerSession {
  id: string;
  task: string;
  duration: number; // in seconds
  timestamp: number;
}

export interface AppState {
  thoughts: ThoughtItem[];
  overwhelmScore: number;
  hasSeenTutorial: boolean;
  userInsights?: UserInsights;
  personalization?: PersonalizationData;
  timerSessions?: TimerSession[];
  moodHistory?: MoodEntry[];
}

export type BreathingTechnique = 'box' | '4-7-8' | 'calm' | 'focus';
export type GroundingTechnique = '5-4-3-2-1' | 'body-scan' | 'safe-place' | 'color-finding';

export type Mood = 'calm' | 'focused' | 'anxious' | 'overwhelmed' | 'energetic' | 'tired';

export interface MoodEntry {
  id: string;
  mood: Mood;
  note?: string;
  timestamp: number;
}
