import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { shopApi } from "@/services/shop";
import { useAuthStore } from "@/stores/useAuthStore";
import { SHOP_ITEMS_QUERY_KEY } from "@/hooks/queryKeys";

export const useShopItems = () =>
  useQuery({
    queryKey: SHOP_ITEMS_QUERY_KEY,
    queryFn: shopApi.listItems,
  });

export const usePurchaseItem = () => {
  const queryClient = useQueryClient();
  const syncUser = useAuthStore((s) => s.syncUser);
  return useMutation({
    mutationFn: (shopItemId: string) => shopApi.purchase(shopItemId),
    onSuccess: ({ user }) => {
      syncUser(user);
      queryClient.invalidateQueries({ queryKey: SHOP_ITEMS_QUERY_KEY });
    },
  });
};
