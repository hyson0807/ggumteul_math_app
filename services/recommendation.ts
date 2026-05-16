import api from "./api";
import type {
  StartRecommendationSessionResponse,
  SubmitRecommendationAnswerPayload,
  SubmitRecommendationAnswerResponse,
} from "@/types/recommendation";

export const recommendationApi = {
  startSession: async () => {
    const { data } = await api.post<StartRecommendationSessionResponse>(
      "/learning/recommendation/session/start",
    );
    return data;
  },

  submit: async (payload: SubmitRecommendationAnswerPayload) => {
    const { data } = await api.post<SubmitRecommendationAnswerResponse>(
      "/learning/recommendation/submit",
      payload,
    );
    return data;
  },
};
