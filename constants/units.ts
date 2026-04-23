import { Colors } from "./colors";

export type UnitId = "1-1" | "1-2" | "2-1" | "2-2" | "3-1" | "3-2";
export const ALL_UNITS: UnitId[] = ["1-1", "1-2", "2-1", "2-2", "3-1", "3-2"];

export type RegionKey = "deep" | "shallow" | "ground" | "sky" | "space";

export interface UnitMeta {
  id: UnitId;
  grade: string;
  region: string;
  band: RegionKey;
  concepts: [string, string, string];
}

export const UNIT_X: Record<UnitId, number> = {
  "1-1": 0.05,
  "1-2": 0.22,
  "2-1": 0.4,
  "2-2": 0.58,
  "3-1": 0.76,
  "3-2": 0.93,
};

export const UNIT_META: Record<UnitId, UnitMeta> = {
  "1-1": {
    id: "1-1",
    grade: "1학년 1학기",
    region: "깊은 땅 깊숙이",
    band: "deep",
    concepts: ["9까지의 수", "여러 가지 모양", "덧셈과 뺄셈"],
  },
  "1-2": {
    id: "1-2",
    grade: "1학년 2학기",
    region: "깊은 땅 위쪽",
    band: "deep",
    concepts: ["100까지의 수", "덧셈과 뺄셈", "모양과 시각"],
  },
  "2-1": {
    id: "2-1",
    grade: "2학년 1학기",
    region: "얕은 땅 아래",
    band: "shallow",
    concepts: ["세 자리 수", "여러 가지 도형", "덧셈과 뺄셈"],
  },
  "2-2": {
    id: "2-2",
    grade: "2학년 2학기",
    region: "얕은 땅 위",
    band: "shallow",
    concepts: ["네 자리 수", "곱셈구구", "길이 재기"],
  },
  "3-1": {
    id: "3-1",
    grade: "3학년 1학기",
    region: "하늘",
    band: "sky",
    concepts: ["덧셈과 뺄셈", "평면도형", "길이와 시간"],
  },
  "3-2": {
    id: "3-2",
    grade: "3학년 2학기",
    region: "우주",
    band: "space",
    concepts: ["분수", "들이와 무게", "자료의 정리"],
  },
};

export interface Region {
  key: RegionKey;
  name: string;
  ratio: number;
  color: string;
}

export const REGIONS: Region[] = [
  { key: "deep", name: "깊은 땅", ratio: 2.4, color: Colors.undergroundDeep },
  { key: "shallow", name: "얕은 땅", ratio: 2.2, color: Colors.undergroundShallow },
  { key: "ground", name: "지상", ratio: 0.4, color: Colors.groundGrass },
  { key: "sky", name: "하늘", ratio: 1.6, color: Colors.skyLight },
  { key: "space", name: "우주", ratio: 1.4, color: Colors.spaceDark },
];

export const TOTAL_REGION_RATIO = REGIONS.reduce((a, r) => a + r.ratio, 0);
export const SCENE_WIDTH_MULTIPLIER = 7; // scene width = frame width × 7

// Stage(1~6) ↔ Unit(1-1 ~ 3-2) 1:1 매핑 (백엔드 worm.ts와 동일)
export const STAGE_TO_UNIT: Record<number, UnitId> = {
  1: "1-1",
  2: "1-2",
  3: "2-1",
  4: "2-2",
  5: "3-1",
  6: "3-2",
};

export const UNIT_TO_STAGE: Record<UnitId, number> = {
  "1-1": 1,
  "1-2": 2,
  "2-1": 3,
  "2-2": 4,
  "3-1": 5,
  "3-2": 6,
};

// 현재 wormStage → 학기 단위.
export function unitFromWorm(stage: number): UnitId {
  return STAGE_TO_UNIT[stage] ?? "1-1";
}

// 현재 스테이지 내 진행도 0~1. totalNodes=0 이면 0.
export function progressWithinStage(
  progress: number,
  totalNodes: number,
): number {
  if (totalNodes <= 0) return 0;
  return Math.min(1, Math.max(0, progress / totalNodes));
}
