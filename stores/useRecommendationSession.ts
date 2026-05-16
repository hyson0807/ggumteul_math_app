import { create } from "zustand";
import type {
  RecommendationProblem,
  StartRecommendationSessionResponse,
  SubmitRecommendationAnswerResponse,
} from "@/types/recommendation";

interface RecommendationSessionState {
  sessionId: string | null;
  generatedAt: string | null;
  problems: RecommendationProblem[];
  currentIndex: number;
  results: SubmitRecommendationAnswerResponse[];
  totalCoinsEarned: number;
  startedAt: number | null;

  start: (response: StartRecommendationSessionResponse) => void;
  recordAnswer: (result: SubmitRecommendationAnswerResponse) => void;
  advance: () => void;
  reset: () => void;
}

const initialState = {
  sessionId: null,
  generatedAt: null,
  problems: [],
  currentIndex: 0,
  results: [],
  totalCoinsEarned: 0,
  startedAt: null,
};

export const useRecommendationSession = create<RecommendationSessionState>(
  (set) => ({
    ...initialState,

    start: (response) =>
      set({
        sessionId: response.sessionId,
        generatedAt: response.generatedAt,
        problems: response.problems,
        currentIndex: 0,
        results: [],
        totalCoinsEarned: 0,
        startedAt: Date.now(),
      }),

    recordAnswer: (result) =>
      set((s) => ({
        results: [...s.results, result],
        totalCoinsEarned: s.totalCoinsEarned + result.coinsEarned,
      })),

    advance: () =>
      set((s) => ({
        currentIndex: Math.min(s.currentIndex + 1, s.problems.length),
      })),

    reset: () => set(initialState),
  }),
);
