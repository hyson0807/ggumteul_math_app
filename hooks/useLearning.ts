import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { learningApi } from "@/services/learning";
import { useAuthStore } from "@/stores/useAuthStore";
import { LEARNING_QUERY_KEYS, WORM_QUERY_KEY } from "@/hooks/queryKeys";
import type {
  CompleteDiagnosticPayload,
  SubmitAnswerPayload,
} from "@/types/learning";

const isValidId = (id: number) => Number.isFinite(id) && id > 0;

// 훅과 prefetch 헬퍼가 동일한 queryKey/queryFn/staleTime 을 공유하도록 설정을
// 한 곳에서 만든다 (single source of truth).
const stageNodesQuery = (stage: number) => ({
  queryKey: LEARNING_QUERY_KEYS.stageNodes(stage),
  queryFn: () => learningApi.getStageNodes(stage),
  staleTime: 5 * 60_000,
});

const conceptProblemsQuery = (conceptId: number) => ({
  queryKey: LEARNING_QUERY_KEYS.conceptProblems(conceptId),
  queryFn: () => learningApi.getConceptProblems(conceptId),
});

export const useStages = () =>
  useQuery({
    queryKey: LEARNING_QUERY_KEYS.stages(),
    queryFn: learningApi.getStages,
  });

export const useStageNodes = (stage: number) =>
  useQuery({ ...stageNodesQuery(stage), enabled: isValidId(stage) });

export const useConceptProblems = (conceptId: number | null) =>
  useQuery({
    ...conceptProblemsQuery(conceptId ?? -1),
    enabled: conceptId != null && conceptId > 0,
  });

// 네비게이션 직전(카드/노드 onPressIn)에 다음 화면 데이터를 선제 로드한다.
export const prefetchStageNodes = (qc: QueryClient, stage: number) => {
  if (isValidId(stage)) qc.prefetchQuery(stageNodesQuery(stage));
};

export const prefetchConceptProblems = (qc: QueryClient, conceptId: number) => {
  if (isValidId(conceptId)) qc.prefetchQuery(conceptProblemsQuery(conceptId));
};

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

export const useDiagnosticProfile = () => {
  const completedAt = useAuthStore((s) => s.user?.diagnosticCompletedAt);
  return useQuery({
    queryKey: LEARNING_QUERY_KEYS.diagnosticProfile(),
    queryFn: learningApi.getDiagnosticProfile,
    enabled: !!completedAt,
    staleTime: Infinity,
    retry: 1,
  });
};

export const useConceptStatus = () => {
  const completedAt = useAuthStore((s) => s.user?.diagnosticCompletedAt);
  return useQuery({
    queryKey: LEARNING_QUERY_KEYS.conceptStatus(),
    queryFn: learningApi.getConceptStatus,
    enabled: !!completedAt,
    staleTime: 5 * 60_000,
  });
};

export const useAttendance = () => {
  const completedAt = useAuthStore((s) => s.user?.diagnosticCompletedAt);
  return useQuery({
    queryKey: LEARNING_QUERY_KEYS.attendance(),
    queryFn: learningApi.getAttendance,
    enabled: !!completedAt,
    staleTime: 5 * 60_000,
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
      // 학습 기록이 추가됐으므로 개념 상태(성장중/연속오답) 갱신
      queryClient.invalidateQueries({
        queryKey: LEARNING_QUERY_KEYS.conceptStatus(),
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
