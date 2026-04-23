import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { shopApi } from "@/services/shop";
import { useAuthStore } from "@/stores/useAuthStore";

export const useShopItems = () =>
  useQuery({
    queryKey: ["shop", "items"],
    queryFn: shopApi.listItems,
  });

export const usePurchaseItem = () => {
  const queryClient = useQueryClient();
  const syncUser = useAuthStore((s) => s.syncUser);
  return useMutation({
    mutationFn: (shopItemId: string) => shopApi.purchase(shopItemId),
    onSuccess: ({ user }) => {
      syncUser(user);
      queryClient.invalidateQueries({ queryKey: ["shop"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
};
