import api from "./api";
import type {
  ConceptProblemsResponse,
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
};
