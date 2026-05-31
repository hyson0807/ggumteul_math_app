import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { recommendationApi } from "@/services/recommendation";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRecommendationSession } from "@/stores/useRecommendationSession";
import { LEARNING_QUERY_KEYS } from "@/hooks/queryKeys";
import type { SubmitRecommendationAnswerPayload } from "@/types/recommendation";

export const RECOMMENDATION_QUERY_KEYS = {
  all: ["recommendation"] as const,
  history: () => [...RECOMMENDATION_QUERY_KEYS.all, "history"] as const,
};

export const useRecommendationHistory = () => {
  // 추천 학습 기록은 진단평가 완료 후에만 생길 수 있으므로 동일 게이트 적용
  const completedAt = useAuthStore((s) => s.user?.diagnosticCompletedAt);
  return useQuery({
    queryKey: RECOMMENDATION_QUERY_KEYS.history(),
    queryFn: recommendationApi.getHistory,
    enabled: !!completedAt,
    staleTime: 5 * 60_000,
  });
};

export const useStartRecommendationSession = () => {
  const startStore = useRecommendationSession((s) => s.start);
  return useMutation({
    mutationFn: () => recommendationApi.startSession(),
    onSuccess: (data) => {
      // start() 가 problems/currentIndex/results/totalCoins 를 모두 reset 하므로
      // mutation 전에 별도 reset 불필요.
      startStore(data);
    },
  });
};

export const useSubmitRecommendationAnswer = () => {
  const queryClient = useQueryClient();
  const syncUser = useAuthStore((s) => s.syncUser);
  const recordAnswer = useRecommendationSession((s) => s.recordAnswer);
  return useMutation({
    mutationFn: (payload: SubmitRecommendationAnswerPayload) =>
      recommendationApi.submit(payload),
    onSuccess: (data) => {
      syncUser(data.user);
      recordAnswer(data);
      // recordAnswer 후 getState()는 동기적으로 갱신된 상태를 반환
      const { results, problems } = useRecommendationSession.getState();
      if (problems.length > 0 && results.length >= problems.length) {
        queryClient.invalidateQueries({
          queryKey: LEARNING_QUERY_KEYS.diagnosticProfile(),
        });
        queryClient.invalidateQueries({
          queryKey: RECOMMENDATION_QUERY_KEYS.history(),
        });
        queryClient.invalidateQueries({
          queryKey: LEARNING_QUERY_KEYS.attendance(),
        });
      }
    },
  });
};
