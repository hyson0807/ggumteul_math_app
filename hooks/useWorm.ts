import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { wormApi } from "@/services/worm";
import { SHOP_ITEMS_QUERY_KEY, WORM_QUERY_KEY } from "@/hooks/queryKeys";
import { useAuthStore } from "@/stores/useAuthStore";
import type { EquipSlot } from "@/types/worm";

export const useWorm = () =>
  useQuery({
    queryKey: WORM_QUERY_KEY,
    queryFn: wormApi.getState,
  });

// 애벌레에게 먹이 1개 먹이기 — feed -1, 레벨/이미지 갱신
export const useFeedWorm = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => wormApi.feed(),
    onSuccess: (data) => {
      queryClient.setQueryData(WORM_QUERY_KEY, data);
      // auth 스토어의 user.feed/wormLevel 도 동기화 (홈 헤더/프로필 일관성)
      const { user, syncUser } = useAuthStore.getState();
      if (user) {
        syncUser({
          ...user,
          feed: data.feed,
          feedConsumed: data.feedConsumed,
          wormLevel: data.level,
        });
      }
    },
  });
};

export const useEquipItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ slot, shopItemId }: { slot: EquipSlot; shopItemId: string }) =>
      wormApi.equip(slot, shopItemId),
    onSuccess: (data) => {
      queryClient.setQueryData(WORM_QUERY_KEY, data);
      queryClient.invalidateQueries({ queryKey: SHOP_ITEMS_QUERY_KEY });
    },
  });
};

export const useUnequipItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ slot }: { slot: EquipSlot }) => wormApi.unequip(slot),
    onSuccess: (data) => {
      queryClient.setQueryData(WORM_QUERY_KEY, data);
      queryClient.invalidateQueries({ queryKey: SHOP_ITEMS_QUERY_KEY });
    },
  });
};
