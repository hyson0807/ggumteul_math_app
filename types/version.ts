export interface VersionCheckResponse {
  minimumVersion: string;
  storeUrl: {
    ios: string;
    android: string;
  };
}
