import { QueryClient } from "@tanstack/react-query";

// 앱 전역 단일 QueryClient. React context 밖(Zustand 스토어 등)에서도
// import 하여 인증 경계에서 캐시를 비울 수 있도록 모듈 싱글톤으로 둔다.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
});
