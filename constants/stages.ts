import type { MaterialCommunityIcons } from "@expo/vector-icons";
import type { UnitId } from "./units";

export type StageId = 1 | 2 | 3 | 4 | 5 | 6;
export const ALL_STAGES: StageId[] = [1, 2, 3, 4, 5, 6];
export const MIN_STAGE: StageId = 1;
export const MAX_STAGE: StageId = 6;

export type StageDecorKind =
  | "deep-bottom"
  | "deep-top"
  | "shallow-bottom"
  | "shallow-top"
  | "sky"
  | "space";

export interface StageSceneConfig {
  stage: StageId;
  unitId: UnitId;
  grade: string;
  region: string;
  decor: StageDecorKind;
  gradient: [string, string, ...string[]];
  locations?: [number, number, ...number[]];
  wormX: number;
  wormY: number;
}

export const STAGE_SCENES: Record<StageId, StageSceneConfig> = {
  1: {
    stage: 1,
    unitId: "1-1",
    grade: "1학년 1학기",
    region: "깊은 땅 깊숙이",
    decor: "deep-bottom",
    gradient: ["#2A1810", "#1A0F08", "#0A0604"],
    locations: [0, 0.5, 1],
    wormX: 0.5,
    wormY: 0.38,
  },
  2: {
    stage: 2,
    unitId: "1-2",
    grade: "1학년 2학기",
    region: "깊은 땅 위쪽",
    decor: "deep-top",
    gradient: ["#4A2A18", "#2E1A10", "#1A0F08"],
    locations: [0, 0.5, 1],
    wormX: 0.5,
    wormY: 0.38,
  },
  3: {
    stage: 3,
    unitId: "2-1",
    grade: "2학년 1학기",
    region: "얕은 땅 아래",
    decor: "shallow-bottom",
    gradient: ["#7A4A2E", "#6B4226", "#4A2A18"],
    locations: [0, 0.5, 1],
    wormX: 0.5,
    wormY: 0.38,
  },
  4: {
    stage: 4,
    unitId: "2-2",
    grade: "2학년 2학기",
    region: "얕은 땅 위",
    decor: "shallow-top",
    gradient: ["#A67450", "#8A5A3A", "#6B4226"],
    locations: [0, 0.5, 1],
    wormX: 0.5,
    wormY: 0.38,
  },
  5: {
    stage: 5,
    unitId: "3-1",
    grade: "3학년 1학기",
    region: "하늘",
    decor: "sky",
    gradient: ["#6FB4F0", "#8FC9F9", "#BFE0FF"],
    locations: [0, 0.5, 1],
    wormX: 0.5,
    wormY: 0.38,
  },
  6: {
    stage: 6,
    unitId: "3-2",
    grade: "3학년 2학기",
    region: "우주",
    decor: "space",
    gradient: ["#05051A", "#0B0E2A", "#1A1040"],
    locations: [0, 0.5, 1],
    wormX: 0.5,
    wormY: 0.38,
  },
};

/**
 * 개념 학습 화면의 학기 카드 테마 (밝은 톤).
 * STAGE_SCENES.gradient 는 스테이지 맵 배경(어두운 톤)용이라 카드와 분리한다.
 * 지하 → 지상 → 하늘 → 우주 순으로 accent 색을 흙빛에서 하늘빛으로 전개.
 */
export interface StageCardTheme {
  /** 카드 테두리/포인트 색 */
  accent: string;
  /** 아이콘 칩 배경 (accent 의 옅은 틴트) */
  tint: string;
  /** MaterialCommunityIcons glyph 이름 */
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}

export const STAGE_CARD_THEMES: Record<StageId, StageCardTheme> = {
  1: { accent: "#3F8F6B", tint: "#E5F1EC", icon: "sprout" },
  2: { accent: "#2E9E8F", tint: "#E2F2F0", icon: "leaf" },
  3: { accent: "#7BA23F", tint: "#EEF3E2", icon: "grass" },
  4: { accent: "#C99A2E", tint: "#F7EFDC", icon: "flower" },
  5: { accent: "#4A9FD4", tint: "#E4F0F8", icon: "weather-partly-cloudy" },
  6: { accent: "#7C6BC4", tint: "#ECE9F6", icon: "rocket-launch" },
};

export function isStageId(n: number): n is StageId {
  return Number.isInteger(n) && n >= MIN_STAGE && n <= MAX_STAGE;
}

export function clampStage(n: number): StageId {
  if (!Number.isFinite(n)) return MIN_STAGE;
  const rounded = Math.round(n);
  if (rounded < MIN_STAGE) return MIN_STAGE;
  if (rounded > MAX_STAGE) return MAX_STAGE;
  return rounded as StageId;
}
