import { useQuery } from "@tanstack/react-query";
import { shopApi } from "@/services/shop";

export const useInventory = () =>
  useQuery({
    queryKey: ["inventory"],
    queryFn: shopApi.listInventory,
  });
