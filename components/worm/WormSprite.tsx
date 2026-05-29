import { View } from "react-native";
import { Image } from "expo-image";
import Svg, { Circle, Ellipse, Path, Rect } from "react-native-svg";
import { Colors } from "@/constants/colors";
import type { WormState } from "@/types/worm";

type Equipped = WormState["equipped"];

interface Props {
  equipped?: Equipped;
  size?: number;
}

const SPRITE_WIDTH = 124;
const SPRITE_HEIGHT = 111;

function hatKindFor(equipped: Equipped | undefined): HatKind | null {
  if (!equipped?.hat) return null;
  const name = equipped.hat.name ?? "";
  if (name.includes("풀잎")) return "leaf";
  if (name.includes("리본")) return "ribbon";
  if (name.includes("마법") || name.includes("고깔")) return "wizard";
  if (name.includes("꽃") || name.includes("화관")) return "flower";
  if (name.includes("왕관") || name.includes("크라운")) return "crown";
  if (name.includes("비니")) return "beanie";
  if (name.includes("도토리")) return "acorn";
  if (name.includes("모자")) return "leaf";
  return "leaf";
}

function bodyKindFor(equipped: Equipped | undefined): BodyKind | null {
  if (!equipped?.body) return null;
  const name = equipped.body.name ?? "";
  if (name.includes("도토리") || name.includes("갑옷")) return "acornArmor";
  if (name.includes("꽃")) return "floral";
  if (name.includes("망토") || name.includes("별빛")) return "starCloak";
  return "floral";
}

function accessoryKindFor(
  equipped: Equipped | undefined,
): AccessoryKind | null {
  if (!equipped?.accessory) return null;
  const name = equipped.accessory.name ?? "";
  if (name.includes("안경") || name.includes("이슬")) return "glasses";
  if (name.includes("가방")) return "leafBag";
  if (name.includes("목걸이") || name.includes("반딧불")) return "necklace";
  return "glasses";
}

export function WormSprite({ equipped, size = 1 }: Props) {
  const hatKind = hatKindFor(equipped);
  const bodyKind = bodyKindFor(equipped);
  const accessoryKind = accessoryKindFor(equipped);
  const width = SPRITE_WIDTH * size;
  const height = SPRITE_HEIGHT * size;

  return (
    <View style={{ width, height, position: "relative" }}>
      <Image
        source={require("@/assets/images/worm-green.png")}
        style={{ width: "100%", height: "100%" }}
        contentFit="contain"
      />
      {bodyKind && (
        <View
          pointerEvents="none"
          style={{ position: "absolute", left: 35 * size, top: 62 * size }}
        >
          <BodyOverlay kind={bodyKind} scale={size} />
        </View>
      )}
      {hatKind && (
        <View
          pointerEvents="none"
          style={{ position: "absolute", left: 39 * size, top: 21 * size }}
        >
          <HatOverlay kind={hatKind} scale={size} />
        </View>
      )}
      {accessoryKind && (
        <View
          pointerEvents="none"
          style={{ position: "absolute", left: 19 * size, top: 40 * size }}
        >
          <AccessoryOverlay kind={accessoryKind} scale={size} />
        </View>
      )}
    </View>
  );
}

type HatKind =
  | "acorn"
  | "beanie"
  | "crown"
  | "flower"
  | "leaf"
  | "ribbon"
  | "wizard";

function HatOverlay({ kind, scale }: { kind: HatKind; scale: number }) {
  if (kind === "leaf") {
    return (
      <Svg width={38 * scale} height={23 * scale} viewBox="0 0 38 23">
        <Path
          d="M5 16 C9 5 22 2 33 8 C25 11 20 18 7 19 Z"
          fill={Colors.primary}
        />
        <Path
          d="M7 17 C15 13 22 10 32 8"
          stroke={Colors.primaryLight}
          strokeWidth={2}
          strokeLinecap="round"
        />
      </Svg>
    );
  }
  if (kind === "ribbon") {
    return (
      <Svg width={38 * scale} height={22 * scale} viewBox="0 0 38 22">
        <Path d="M18 11 L4 4 L5 18 Z" fill={Colors.secondaryLight} />
        <Path d="M20 11 L34 4 L33 18 Z" fill={Colors.secondaryLight} />
        <Circle cx={19} cy={11} r={5} fill={Colors.secondary} />
      </Svg>
    );
  }
  if (kind === "wizard") {
    return (
      <Svg width={36 * scale} height={35 * scale} viewBox="0 0 36 35">
        <Path
          d="M18 2 L29 28 H7 Z"
          fill={Colors.skyLight}
          stroke={Colors.primary}
          strokeWidth={1.4}
        />
        <Path
          d="M5 28 H31"
          stroke={Colors.primary}
          strokeWidth={4}
          strokeLinecap="round"
        />
        <Circle cx={18} cy={14} r={2} fill={Colors.star} />
      </Svg>
    );
  }
  if (kind === "flower") {
    return (
      <Svg width={44 * scale} height={22 * scale} viewBox="0 0 44 22">
        {[8, 16, 24, 32].map((cx) => (
          <Circle key={cx} cx={cx} cy={12} r={6} fill={Colors.cta} />
        ))}
        {[8, 16, 24, 32].map((cx) => (
          <Circle key={cx} cx={cx} cy={12} r={2} fill={Colors.secondaryLight} />
        ))}
        <Path
          d="M5 17 C15 20 29 20 39 17"
          stroke={Colors.primary}
          strokeWidth={3}
          strokeLinecap="round"
        />
      </Svg>
    );
  }
  if (kind === "acorn") {
    return (
      <Svg width={32 * scale} height={28 * scale} viewBox="0 0 32 28">
        <Ellipse cx={16} cy={18} rx={10} ry={8} fill={Colors.primaryLight} />
        <Path
          d="M6 14 Q16 4 26 14 Q22 18 16 18 Q10 18 6 14 Z"
          fill={Colors.undergroundShallow}
        />
        <Circle cx={16} cy={6} r={1.5} fill={Colors.undergroundDeep} />
      </Svg>
    );
  }
  if (kind === "crown") {
    return (
      <Svg width={34 * scale} height={22 * scale} viewBox="0 0 34 22">
        <Path
          d="M4 18 L4 8 L10 14 L17 4 L24 14 L30 8 L30 18 Z"
          fill={Colors.secondaryLight}
          stroke={Colors.secondary}
          strokeWidth={1}
        />
        <Circle cx={17} cy={8} r={1.5} fill={Colors.cta} />
      </Svg>
    );
  }
  return (
    <Svg width={30 * scale} height={22 * scale} viewBox="0 0 30 22">
      <Path d="M4 16 Q4 4 15 4 Q26 4 26 16 Z" fill={Colors.primary} />
      <Rect x={3} y={14} width={24} height={4} rx={2} fill={Colors.text} />
      <Circle cx={15} cy={2} r={2.5} fill={Colors.primaryLight} />
    </Svg>
  );
}

type BodyKind = "acornArmor" | "floral" | "starCloak";

function BodyOverlay({ kind, scale }: { kind: BodyKind; scale: number }) {
  if (kind === "acornArmor") {
    return (
      <Svg width={52 * scale} height={34 * scale} viewBox="0 0 52 34">
        <Path
          d="M5 9 C17 2 37 3 47 12 C44 25 34 32 18 31 C10 28 5 21 5 9 Z"
          fill={Colors.undergroundShallow}
          opacity={0.72}
        />
        <Path
          d="M12 15 C21 10 32 10 41 16"
          stroke={Colors.secondary}
          strokeWidth={2}
          strokeLinecap="round"
        />
      </Svg>
    );
  }
  if (kind === "starCloak") {
    return (
      <Svg width={58 * scale} height={38 * scale} viewBox="0 0 58 38">
        <Path
          d="M6 9 C21 3 42 5 53 18 C43 34 20 36 8 27 Z"
          fill={Colors.spaceDark}
          opacity={0.68}
        />
        <Circle cx={22} cy={16} r={2} fill={Colors.star} />
        <Circle cx={36} cy={13} r={1.5} fill={Colors.star} />
        <Circle cx={42} cy={24} r={1.8} fill={Colors.star} />
      </Svg>
    );
  }
  return (
    <Svg width={54 * scale} height={34 * scale} viewBox="0 0 54 34">
      <Path
        d="M5 10 C18 3 38 4 49 15 C44 28 29 33 12 28 C7 23 5 17 5 10 Z"
        fill={Colors.surface}
        opacity={0.72}
      />
      {[16, 27, 38].map((cx) => (
        <Circle key={cx} cx={cx} cy={17} r={4} fill={Colors.cta} />
      ))}
      {[16, 27, 38].map((cx) => (
        <Circle key={cx} cx={cx} cy={17} r={1.5} fill={Colors.secondaryLight} />
      ))}
    </Svg>
  );
}

type AccessoryKind = "glasses" | "leafBag" | "necklace";

function AccessoryOverlay({
  kind,
  scale,
}: {
  kind: AccessoryKind;
  scale: number;
}) {
  if (kind === "leafBag") {
    return (
      <Svg width={88 * scale} height={48 * scale} viewBox="0 0 88 48">
        <Path
          d="M61 19 C70 9 81 11 84 23 C79 24 73 30 62 34 Z"
          fill={Colors.primary}
        />
        <Path
          d="M64 27 C70 23 75 20 83 22"
          stroke={Colors.primaryLight}
          strokeWidth={2}
          strokeLinecap="round"
        />
      </Svg>
    );
  }
  if (kind === "necklace") {
    return (
      <Svg width={54 * scale} height={34 * scale} viewBox="0 0 54 34">
        <Path
          d="M12 8 C18 24 36 24 42 8"
          stroke={Colors.secondary}
          strokeWidth={2.5}
          fill="none"
          strokeLinecap="round"
        />
        <Circle cx={27} cy={23} r={4} fill={Colors.star} />
      </Svg>
    );
  }
  return (
    <Svg width={43 * scale} height={18 * scale} viewBox="0 0 43 18">
      <Circle
        cx={9}
        cy={9}
        r={6}
        stroke={Colors.text}
        strokeWidth={1.8}
        fill={Colors.surface}
        opacity={0.72}
      />
      <Circle
        cx={34}
        cy={9}
        r={6}
        stroke={Colors.text}
        strokeWidth={1.8}
        fill={Colors.surface}
        opacity={0.72}
      />
      <Path d="M15 9 L28 9" stroke={Colors.text} strokeWidth={1.8} />
    </Svg>
  );
}
