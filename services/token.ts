import * as SecureStore from "expo-secure-store";

const REFRESH_TOKEN_KEY = "refresh_token";

let accessToken: string | null = null;

export const tokenService = {
  getAccessToken: () => accessToken,

  setAccessToken: (token: string | null) => {
    accessToken = token;
  },

  getRefreshToken: async (): Promise<string | null> => {
    return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  },

  setRefreshToken: async (token: string) => {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
  },

  clearAll: async () => {
    accessToken = null;
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  },
};
