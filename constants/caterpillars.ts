import type { ImageSourcePropType } from "react-native";

// 애벌레 레벨(1~10) → 이미지. require 는 정적 경로만 허용하므로 명시적으로 나열한다.
export const CATERPILLAR_IMAGES: Record<number, ImageSourcePropType> = {
  1: require("@/assets/images/caterpillars/level-01-basic-caterpillar.png"),
  2: require("@/assets/images/caterpillars/level-02-sprout-caterpillar.png"),
  3: require("@/assets/images/caterpillars/level-03-dewdrop-caterpillar.png"),
  4: require("@/assets/images/caterpillars/level-04-soil-caterpillar.png"),
  5: require("@/assets/images/caterpillars/level-05-leaf-caterpillar.png"),
  6: require("@/assets/images/caterpillars/level-06-flower-petal-caterpillar.png"),
  7: require("@/assets/images/caterpillars/level-07-acorn-caterpillar.png"),
  8: require("@/assets/images/caterpillars/level-08-tree-spirit.png"),
  9: require("@/assets/images/caterpillars/level-09-forest-guide.png"),
  10: require("@/assets/images/caterpillars/level-10-tree-guardian-angel.png"),
};

export const CATERPILLAR_MAX_LEVEL = 10;

export function caterpillarImage(level: number): ImageSourcePropType {
  const clamped = Math.max(1, Math.min(CATERPILLAR_MAX_LEVEL, Math.round(level)));
  return CATERPILLAR_IMAGES[clamped];
}
