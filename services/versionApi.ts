import axios from "axios";
import { Platform } from "react-native";
import { API_BASE_URL } from "./api";
import { getCurrentAppVersion } from "@/utils/version";
import type { VersionCheckResponse } from "@/types/version";

export const versionApi = {
  check: async (): Promise<VersionCheckResponse> => {
    const { data } = await axios.get<VersionCheckResponse>(
      `${API_BASE_URL}/app/version-check`,
      {
        params: {
          platform: Platform.OS === "ios" ? "ios" : "android",
          currentVersion: getCurrentAppVersion(),
        },
        timeout: 5_000,
      },
    );
    return data;
  },
};
