import { View } from "react-native";
import Svg, {
  Circle,
  Ellipse,
  G,
  Path,
  Rect,
} from "react-native-svg";
import type { WormState } from "@/types/worm";

type Equipped = WormState["equipped"];

interface Props {
  equipped?: Equipped;
  size?: number;
}

function hatKindFor(equipped: Equipped | undefined): HatKind | null {
  if (!equipped?.hat) return null;
  const name = equipped.hat.name ?? "";
  if (name.includes("도토리")) return "acorn";
  if (name.includes("왕관") || name.includes("크라운")) return "crown";
  if (name.includes("비니") || name.includes("모자")) return "beanie";
  return "acorn";
}

function hasGlasses(equipped: Equipped | undefined): boolean {
  if (!equipped?.accessory) return false;
  const name = equipped.accessory.name ?? "";
  return name.includes("안경") || name.includes("이슬");
}

export function WormSprite({ equipped, size = 1 }: Props) {
  const hatKind = hatKindFor(equipped);
  const glasses = hasGlasses(equipped);
  return <Worm size={size} hatKind={hatKind} glasses={glasses} />;
}

function Worm({
  size,
  hatKind,
  glasses,
}: {
  size: number;
  hatKind: HatKind | null;
  glasses: boolean;
}) {
  const w = 120 * size;
  const h = 80 * size;
  const body = "#E89B7A";
  const shade = "#C87A5A";
  return (
    <View style={{ width: w, height: h, position: "relative" }}>
      <Svg width={w} height={h} viewBox="0 0 120 80">
        <Ellipse cx={60} cy={72} rx={40} ry={4} fill="rgba(0,0,0,0.18)" />
        {[28, 44, 60, 76, 90].map((cx) => (
          <G key={cx}>
            <Circle cx={cx} cy={50} r={14} fill={body} />
            <Circle cx={cx - 4} cy={48} r={10} fill={shade} opacity={0.35} />
          </G>
        ))}
        <Circle cx={94} cy={46} r={13.5} fill={body} />
        <Circle cx={88} cy={44} r={4} fill="#FFE6D3" opacity={0.8} />
        <Circle cx={100} cy={54} r={3} fill="#F19C8A" opacity={0.55} />
        <Circle cx={98} cy={46} r={2.4} fill="#2A1810" />
        <Circle cx={98.8} cy={45.4} r={0.8} fill="#fff" />
        <Path
          d="M96 52 Q99 54 102 52"
          stroke="#6B3A2A"
          strokeWidth={1.4}
          fill="none"
          strokeLinecap="round"
        />
      </Svg>
      {hatKind && (
        <View
          style={{ position: "absolute", left: 82 * size, top: 18 * size }}
        >
          <HatOverlay kind={hatKind} scale={size} />
        </View>
      )}
      {glasses && (
        <View
          style={{ position: "absolute", left: 78 * size, top: 50 * size }}
        >
          <Glasses scale={size} />
        </View>
      )}
    </View>
  );
}

type HatKind = "acorn" | "crown" | "beanie";

function HatOverlay({ kind, scale }: { kind: HatKind; scale: number }) {
  if (kind === "acorn") {
    return (
      <Svg width={32 * scale} height={28 * scale} viewBox="0 0 32 28">
        <Ellipse cx={16} cy={18} rx={10} ry={8} fill="#C88454" />
        <Path
          d="M6 14 Q16 4 26 14 Q22 18 16 18 Q10 18 6 14 Z"
          fill="#6B4226"
        />
        <Circle cx={16} cy={6} r={1.5} fill="#3A2410" />
      </Svg>
    );
  }
  if (kind === "crown") {
    return (
      <Svg width={34 * scale} height={22 * scale} viewBox="0 0 34 22">
        <Path
          d="M4 18 L4 8 L10 14 L17 4 L24 14 L30 8 L30 18 Z"
          fill="#E8C860"
          stroke="#B8942A"
          strokeWidth={1}
        />
        <Circle cx={17} cy={8} r={1.5} fill="#C0392B" />
      </Svg>
    );
  }
  return (
    <Svg width={30 * scale} height={22 * scale} viewBox="0 0 30 22">
      <Path d="M4 16 Q4 4 15 4 Q26 4 26 16 Z" fill="#6B8E23" />
      <Rect x={3} y={14} width={24} height={4} rx={2} fill="#4D6818" />
      <Circle cx={15} cy={2} r={2.5} fill="#C8D088" />
    </Svg>
  );
}

function Glasses({ scale }: { scale: number }) {
  return (
    <Svg width={34 * scale} height={14 * scale} viewBox="0 0 34 14">
      <Circle
        cx={8}
        cy={7}
        r={5}
        stroke="#2A1810"
        strokeWidth={1.6}
        fill="rgba(255,255,255,0.35)"
      />
      <Circle
        cx={26}
        cy={7}
        r={5}
        stroke="#2A1810"
        strokeWidth={1.6}
        fill="rgba(255,255,255,0.35)"
      />
      <Path d="M13 7 L21 7" stroke="#2A1810" strokeWidth={1.6} />
    </Svg>
  );
}
