import type { User } from "@/services/auth";

export const isUserOnboarded = (user: User | null | undefined): boolean =>
  !!(user?.tutorType && user?.name && user?.grade);
