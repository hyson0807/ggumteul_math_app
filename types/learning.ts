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
  /** 개념을 새로 클리어해 받은 먹이 수 (클리어 시 1, 그 외 0). */
  feedEarned: number;
  nodeNewlyCleared: boolean;
  stageNewlyCleared: boolean;
  /** 개념을 새로 클리어했을 때, 곧장 이어서 풀 다음 미클리어 개념 id (없으면 null). */
  nextConceptId: number | null;
  correctAnswer: string;
  explanation: string | null;
  user: User;
}

export interface DiagnosticProblem {
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
}

export interface DiagnosticAnswerPayload {
  problemId: number;
  answer: string;
  timeSpent?: number;
}

export interface CompleteDiagnosticPayload {
  grade: 1 | 2 | 3;
  answers: DiagnosticAnswerPayload[];
}

export interface CompleteDiagnosticResponse {
  user: User;
  score: number;
}

export interface DiagnosticResultItem {
  problemId: number;
  problemType: ProblemType;
  content: string;
  imageUrl: string | null;
  choice1: string | null;
  choice2: string | null;
  choice3: string | null;
  choice4: string | null;
  conceptName: string;
  myAnswer: string;
  correctAnswer: string;
  correct: boolean;
  explanation: string | null;
}

export interface DiagnosticResultResponse {
  score: number;
  grade: number;
  completedAt: string;
  items: DiagnosticResultItem[];
}

export interface DiagnosticProfileItem {
  conceptId: number;
  conceptName: string;
  grade: number;
  semester: number;
  knowledgeTag: number;
  probability: number;
}

export interface DiagnosticProfileResponse {
  strong: DiagnosticProfileItem[];
  weak: DiagnosticProfileItem[];
  fetchedAt: string;
}

export interface ConceptStatusItem {
  conceptId: number;
  conceptName: string;
  grade: number;
  semester: number;
}

export interface ConceptStatusResponse {
  growing: ConceptStatusItem[]; // 🌱 성장중
  struggling: ConceptStatusItem[]; // 🔥 연속 오답
}

export interface AttendanceResponse {
  currentStreak: number;
  totalActiveDays: number;
  activeDates: string[]; // YYYY-MM-DD[], desc
}
