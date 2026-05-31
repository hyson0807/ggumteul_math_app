import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { getCurrentAppVersion } from "@/utils/version";

// React Query 캐시를 AsyncStorage 에 영속화해 콜드스타트 시 즉시 렌더한다.
// buster=앱 버전: 버전이 바뀌면 이전 캐시를 자동 폐기.
export const queryPersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: "ggumteul-query-cache",
});

export const PERSIST_MAX_AGE = 24 * 60 * 60 * 1000; // 24h
export const PERSIST_BUSTER = getCurrentAppVersion();
