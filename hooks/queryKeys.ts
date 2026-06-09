// 모든 React Query 키를 한 곳에서 정의한다. 훅끼리 키를 cross-import 하지 않도록
// (useWorm←useShop 등) 중앙 모듈로 모아 import 그래프를 star 형태로 유지한다.
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
  diagnosticProfile: () =>
    [...LEARNING_QUERY_KEYS.all, "diagnostic", "profile"] as const,
  conceptStatus: () => [...LEARNING_QUERY_KEYS.all, "concept-status"] as const,
  attendance: () => [...LEARNING_QUERY_KEYS.all, "attendance"] as const,
};

export const WORM_QUERY_KEY = ["worm"] as const;
export const ROOM_QUERY_KEY = ["room"] as const;
export const SHOP_ITEMS_QUERY_KEY = ["shop", "items"] as const;
