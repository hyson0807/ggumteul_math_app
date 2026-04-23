import type { User } from "@/services/auth";

export type ProblemType = "SUBJ" | "MCQ";

export interface StageSummary {
  stage: number;
  slug: string;
  grade: number;
  semester: number;
  totalNodes: number;
  clearedNodes: number;
  locked: boolean;
  current: boolean;
  cleared: boolean;
}

export interface StagesResponse {
  currentStage: number;
  currentProgress: number;
  maxStage: number;
  stages: StageSummary[];
}

export interface ConceptNode {
  conceptId: number;
  name: string;
  order: number;
  knowledgeTag: number | null;
  problemCount: number;
  playable: boolean;
  cleared: boolean;
  locked: boolean;
}

export interface StageNodesResponse {
  stage: number;
  slug: string;
  grade: number;
  semester: number;
  stageLocked: boolean;
  totalNodes: number;
  clearedNodes: number;
  nodes: ConceptNode[];
}

export interface ConceptProblem {
  id: number;
  conceptId: number;
  problemType: ProblemType;
  difficulty: number;
  content: string;
  imageUrl: string | null;
  choice1: string | null;
  choice2: string | null;
  choice3: string | null;
  choice4: string | null;
  solved: boolean;
}

export interface ConceptProblemsResponse {
  concept: {
    id: number;
    name: string;
    grade: number;
    semester: number;
  };
  problems: ConceptProblem[];
  clearThreshold: number;
  cleared: boolean;
}

export interface SubmitAnswerPayload {
  problemId: number;
  answer: string;
  timeSpent: number;
}

export interface SubmitAnswerResponse {
  correct: boolean;
  coinsEarned: number;
  starsEarned: number;
  nodeNewlyCleared: boolean;
  stageNewlyCleared: boolean;
  correctAnswer: string;
  explanation: string | null;
  user: User;
}
