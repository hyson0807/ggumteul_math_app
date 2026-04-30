import type { User } from "@/services/auth";

export const ONBOARDING_ROUTES = {
  selectTutor: "/(onboarding)/select-tutor",
  selectGrade: "/(onboarding)/select-grade",
  diagnostic: "/(onboarding)/diagnostic",
  setName: "/(onboarding)/set-name",
} as const;

export const HOME_ROUTE = "/(tabs)/home" as const;

export type OnboardingRoute =
  (typeof ONBOARDING_ROUTES)[keyof typeof ONBOARDING_ROUTES];

export const isUserOnboarded = (user: User | null | undefined): boolean =>
  !!(
    user?.tutorType &&
    user?.name &&
    user?.grade &&
    user?.diagnosticCompletedAt
  );

/**
 * 온보딩 흐름의 단일 진실 공급원 — 비어있는 첫 필드의 화면을 반환,
 * 모두 채워졌으면 null. 신규/기존 유저 동일 로직으로 처리하기 위해
 * 모든 라우팅 게이트가 이 결과로 다음 화면을 결정한다.
 */
export const nextOnboardingRoute = (
  user: User | null | undefined,
): OnboardingRoute | null => {
  if (!user?.tutorType) return ONBOARDING_ROUTES.selectTutor;
  if (!user?.grade) return ONBOARDING_ROUTES.selectGrade;
  if (!user?.diagnosticCompletedAt) return ONBOARDING_ROUTES.diagnostic;
  if (!user?.name) return ONBOARDING_ROUTES.setName;
  return null;
};
