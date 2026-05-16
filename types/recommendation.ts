import type { User } from "@/services/auth";
import type { ProblemType } from "./learning";

export type RecommendationSource = "recommended" | "random_grade";

export interface RecommendationProblem {
  id: number;
  conceptId: number;
  conceptName: string;
  problemType: ProblemType;
  difficulty: number;
  content: string;
  imageUrl: string | null;
  choice1: string | null;
  choice2: string | null;
  choice3: string | null;
  choice4: string | null;
  source: RecommendationSource;
  rank?: number;
}

export interface StartRecommendationSessionResponse {
  sessionId: string;
  generatedAt: string;
  problems: RecommendationProblem[];
}

export interface SubmitRecommendationAnswerPayload {
  problemId: number;
  answer: string;
  timeSpent: number;
}

export interface SubmitRecommendationAnswerResponse {
  correct: boolean;
  coinsEarned: number;
  starsEarned: number;
  correctAnswer: string;
  explanation: string | null;
  user: User;
}
