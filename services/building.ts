import api from "./api";
import type { User } from "./auth";
import type { BuildingProgress, BuildingType } from "@/types/building";

export const buildingApi = {
  list: async (): Promise<BuildingProgress[]> => {
    const { data } = await api.get<BuildingProgress[]>("/buildings");
    return data;
  },

  upgrade: async (
    type: BuildingType,
  ): Promise<{ user: User; building: BuildingProgress }> => {
    const { data } = await api.post<{ user: User; building: BuildingProgress }>(
      `/buildings/${type}/upgrade`,
    );
    return data;
  },
};
