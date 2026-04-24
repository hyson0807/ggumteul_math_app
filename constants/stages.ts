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
