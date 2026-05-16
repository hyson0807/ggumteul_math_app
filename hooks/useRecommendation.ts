import { useMutation } from "@tanstack/react-query";
import { recommendationApi } from "@/services/recommendation";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRecommendationSession } from "@/stores/useRecommendationSession";
import type { SubmitRecommendationAnswerPayload } from "@/types/recommendation";

export const useStartRecommendationSession = () => {
  const startStore = useRecommendationSession((s) => s.start);
  const resetStore = useRecommendationSession((s) => s.reset);
  return useMutation({
    mutationFn: async () => {
      // 동시 시작 누수 방지 — 새 세션 시작 전 이전 상태 폐기
      resetStore();
      return recommendationApi.startSession();
    },
    onSuccess: (data) => {
      startStore(data);
    },
  });
};

export const useSubmitRecommendationAnswer = () => {
  const syncUser = useAuthStore((s) => s.syncUser);
  const recordAnswer = useRecommendationSession((s) => s.recordAnswer);
  return useMutation({
    mutationFn: (payload: SubmitRecommendationAnswerPayload) =>
      recommendationApi.submit(payload),
    onSuccess: (data) => {
      syncUser(data.user);
      recordAnswer(data);
    },
  });
};
