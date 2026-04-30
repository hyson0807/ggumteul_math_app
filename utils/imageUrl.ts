import { API_BASE_URL } from "@/services/api";

export const resolveImageUrl = (url: string): string => {
  if (/^https?:\/\//.test(url)) return url;
  const trimmed = url.startsWith("/") ? url : `/${url}`;
  return `${API_BASE_URL}${trimmed}`;
};
