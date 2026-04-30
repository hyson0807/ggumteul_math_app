import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { learningApi } from "@/services/learning";
import { useAuthStore } from "@/stores/useAuthStore";
import type {
  CompleteDiagnosticPayload,
  SubmitAnswerPayload,
} from "@/types/learning";

export const LEARNING_QUERY_KEYS = {
  all: ["learning"] as const,
  stages: () => [...LEARNING_QUERY_KEYS.all, "stages"] as const,
  stageNodes: (stage: number) =>
    [...LEARNING_QUERY_KEYS.all, "stage", stage, "nodes"] as const,
  conceptProblems: (conceptId: number) =>
    [...LEARNING_QUERY_KEYS.all, "concept", conceptId, "problems"] as const,
  diagnosticProblems: (grade: number) =>
    [...LEARNING_QUERY_KEYS.all, "diagnostic", "problems", grade] as const,
  diagnosticResult: () =>
    [...LEARNING_QUERY_KEYS.all, "diagnostic", "result"] as const,
};

const WORM_QUERY_KEY = ["worm"] as const;

export const useStages = () =>
  useQuery({
    queryKey: LEARNING_QUERY_KEYS.stages(),
    queryFn: learningApi.getStages,
  });

export const useStageNodes = (stage: number) =>
  useQuery({
    queryKey: LEARNING_QUERY_KEYS.stageNodes(stage),
    queryFn: () => learningApi.getStageNodes(stage),
    enabled: Number.isFinite(stage) && stage > 0,
  });

export const useConceptProblems = (conceptId: number | null) =>
  useQuery({
    queryKey: LEARNING_QUERY_KEYS.conceptProblems(conceptId ?? -1),
    queryFn: () => learningApi.getConceptProblems(conceptId as number),
    enabled: conceptId != null && conceptId > 0,
  });

export const useDiagnosticProblems = (grade: number | null) =>
  useQuery({
    queryKey: LEARNING_QUERY_KEYS.diagnosticProblems(grade ?? -1),
    queryFn: () => learningApi.getDiagnostic(grade as number),
    enabled: grade != null && grade >= 1 && grade <= 3,
    staleTime: Infinity,
  });

export const useCompleteDiagnostic = () => {
  const queryClient = useQueryClient();
  const syncUser = useAuthStore((s) => s.syncUser);
  return useMutation({
    mutationFn: (payload: CompleteDiagnosticPayload) =>
      learningApi.completeDiagnostic(payload),
    onSuccess: (data) => {
      syncUser(data.user);
      queryClient.invalidateQueries({
        queryKey: LEARNING_QUERY_KEYS.diagnosticResult(),
      });
    },
  });
};

export const useDiagnosticResult = () => {
  const completedAt = useAuthStore((s) => s.user?.diagnosticCompletedAt);
  return useQuery({
    queryKey: LEARNING_QUERY_KEYS.diagnosticResult(),
    queryFn: learningApi.getDiagnosticResult,
    enabled: !!completedAt,
    staleTime: Infinity,
  });
};

export const useSubmitAnswer = () => {
  const queryClient = useQueryClient();
  const syncUser = useAuthStore((s) => s.syncUser);
  return useMutation({
    mutationFn: (payload: SubmitAnswerPayload) => learningApi.submit(payload),
    onSuccess: (data) => {
      syncUser(data.user);
      // 푼 문제의 solved 플래그가 바뀌므로 concept problems 쿼리는 항상 갱신.
      queryClient.invalidateQueries({
        queryKey: [...LEARNING_QUERY_KEYS.all, "concept"],
      });
      // stages/stageNodes/worm 상태는 클리어 변화가 있을 때만 갱신.
      if (data.nodeNewlyCleared || data.stageNewlyCleared) {
        queryClient.invalidateQueries({ queryKey: LEARNING_QUERY_KEYS.stages() });
        queryClient.invalidateQueries({
          queryKey: [...LEARNING_QUERY_KEYS.all, "stage"],
        });
        queryClient.invalidateQueries({ queryKey: WORM_QUERY_KEY });
      }
    },
  });
};
