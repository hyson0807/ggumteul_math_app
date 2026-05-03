import api from "./api";
import type {
  CompleteDiagnosticPayload,
  CompleteDiagnosticResponse,
  ConceptProblemsResponse,
  DiagnosticProblem,
  DiagnosticProfileResponse,
  DiagnosticResultResponse,
  StageNodesResponse,
  StagesResponse,
  SubmitAnswerPayload,
  SubmitAnswerResponse,
} from "@/types/learning";

export const learningApi = {
  getStages: async () => {
    const { data } = await api.get<StagesResponse>("/learning/stages");
    return data;
  },

  getStageNodes: async (stage: number) => {
    const { data } = await api.get<StageNodesResponse>(
      `/learning/stage/${stage}/nodes`,
    );
    return data;
  },

  getConceptProblems: async (conceptId: number) => {
    const { data } = await api.get<ConceptProblemsResponse>(
      `/learning/concept/${conceptId}/problems`,
    );
    return data;
  },

  submit: async (payload: SubmitAnswerPayload) => {
    const { data } = await api.post<SubmitAnswerResponse>(
      "/learning/submit",
      payload,
    );
    return data;
  },

  getDiagnostic: async (grade: number) => {
    const { data } = await api.get<DiagnosticProblem[]>(
      `/learning/diagnostic/${grade}`,
    );
    return data;
  },

  completeDiagnostic: async (payload: CompleteDiagnosticPayload) => {
    const { data } = await api.post<CompleteDiagnosticResponse>(
      "/learning/diagnostic/complete",
      payload,
    );
    return data;
  },

  getDiagnosticResult: async () => {
    const { data } = await api.get<DiagnosticResultResponse>(
      "/learning/diagnostic/result",
    );
    return data;
  },

  getDiagnosticProfile: async () => {
    const { data } = await api.get<DiagnosticProfileResponse>(
      "/learning/diagnostic/profile",
    );
    return data;
  },
};
