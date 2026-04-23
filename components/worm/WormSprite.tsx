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
  stage: number;
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

export function WormSprite({ stage, equipped, size = 1 }: Props) {
  const hatKind = hatKindFor(equipped);
  const glasses = hasGlasses(equipped);
  if (stage >= 5) return <Butterfly size={size} />;
  if (stage === 4) return <Cocoon size={size} />;
  if (stage === 3)
    return <Caterpillar size={size} hatKind={hatKind} glasses={glasses} />;
  return (
    <Worm stage={stage} size={size} hatKind={hatKind} glasses={glasses} />
  );
}

function Worm({
  stage,
  size,
  hatKind,
  glasses,
}: {
  stage: number;
  size: number;
  hatKind: HatKind | null;
  glasses: boolean;
}) {
  const w = 120 * size;
  const h = 80 * size;
  const body = stage === 1 ? "#E89B7A" : "#F0B090";
  const shade = stage === 1 ? "#C87A5A" : "#D48B6A";
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

function Caterpillar({
  size,
  hatKind,
  glasses,
}: {
  size: number;
  hatKind: HatKind | null;
  glasses: boolean;
}) {
  const w = 130 * size;
  const h = 80 * size;
  const body = "#C8E080";
  const shade = "#9DBB5A";
  return (
    <View style={{ width: w, height: h, position: "relative" }}>
      <Svg width={w} height={h} viewBox="0 0 130 80">
        <Ellipse cx={65} cy={72} rx={44} ry={4} fill="rgba(0,0,0,0.15)" />
        {[22, 40, 58, 76, 94].map((cx) => (
          <G key={cx}>
            <Circle cx={cx} cy={48} r={15} fill={body} />
            <Circle cx={cx - 4} cy={46} r={10} fill={shade} opacity={0.3} />
          </G>
        ))}
        <Circle cx={102} cy={44} r={14} fill={body} />
        <Circle cx={96} cy={42} r={4} fill="#E8F5C0" opacity={0.8} />
        <Path
          d="M104 32 Q106 24 110 22"
          stroke={shade}
          strokeWidth={1.6}
          fill="none"
          strokeLinecap="round"
        />
        <Circle cx={110.5} cy={22} r={1.8} fill={shade} />
        <Path
          d="M100 32 Q100 24 96 22"
          stroke={shade}
          strokeWidth={1.6}
          fill="none"
          strokeLinecap="round"
        />
        <Circle cx={95.5} cy={22} r={1.8} fill={shade} />
        <Circle cx={108} cy={52} r={3} fill="#F19C8A" opacity={0.55} />
        <Circle cx={106} cy={44} r={2.4} fill="#2A1810" />
        <Circle cx={106.8} cy={43.4} r={0.8} fill="#fff" />
        <Path
          d="M104 50 Q107 52 110 50"
          stroke="#6B3A2A"
          strokeWidth={1.4}
          fill="none"
          strokeLinecap="round"
        />
      </Svg>
      {hatKind && (
        <View
          style={{ position: "absolute", left: 92 * size, top: 14 * size }}
        >
          <HatOverlay kind={hatKind} scale={size} />
        </View>
      )}
      {glasses && (
        <View
          style={{ position: "absolute", left: 88 * size, top: 40 * size }}
        >
          <Glasses scale={size} />
        </View>
      )}
    </View>
  );
}

function Cocoon({ size }: { size: number }) {
  const w = 100 * size;
  const h = 120 * size;
  return (
    <View style={{ width: w, height: h }}>
      <Svg width={w} height={h} viewBox="0 0 100 120">
        <Path
          d="M50 4 L50 24"
          stroke="#B8A880"
          strokeWidth={1.2}
          strokeDasharray="2 2"
        />
        <Ellipse cx={50} cy={64} rx={26} ry={38} fill="#D9C8A8" />
        <Ellipse cx={42} cy={50} rx={8} ry={16} fill="#EEDDBB" opacity={0.7} />
        {[32, 46, 60, 74, 88].map((y) => (
          <Path
            key={y}
            d={`M26 ${y} Q50 ${y + 3} 74 ${y}`}
            stroke="#B8A880"
            strokeWidth={1}
            fill="none"
            opacity={0.6}
          />
        ))}
        <Path
          d="M40 62 Q43 60 46 62"
          stroke="#6B5A3A"
          strokeWidth={1.4}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M54 62 Q57 60 60 62"
          stroke="#6B5A3A"
          strokeWidth={1.4}
          fill="none"
          strokeLinecap="round"
        />
        <Circle cx={50} cy={70} r={2.5} fill="#C88A6A" opacity={0.5} />
      </Svg>
    </View>
  );
}

function Butterfly({ size }: { size: number }) {
  const w = 140 * size;
  const h = 120 * size;
  return (
    <View style={{ width: w, height: h }}>
      <Svg width={w} height={h} viewBox="0 0 140 120">
        <Path d="M70 60 Q28 22 18 50 Q10 76 40 84 Q60 84 70 70 Z" fill="#F5B9D0" />
        <Path d="M70 60 Q112 22 122 50 Q130 76 100 84 Q80 84 70 70 Z" fill="#F5B9D0" />
        <Path d="M70 62 Q46 92 34 100 Q56 110 70 86 Z" fill="#FFD9CF" />
        <Path d="M70 62 Q94 92 106 100 Q84 110 70 86 Z" fill="#FFD9CF" />
        <Circle cx={36} cy={54} r={3} fill="#C0628A" />
        <Circle cx={104} cy={54} r={3} fill="#C0628A" />
        <Circle cx={46} cy={98} r={2} fill="#E0856A" />
        <Circle cx={94} cy={98} r={2} fill="#E0856A" />
        <Ellipse cx={70} cy={68} rx={5} ry={22} fill="#5D4037" />
        <Circle cx={70} cy={48} r={6} fill="#5D4037" />
        <Path
          d="M68 44 Q64 36 60 34"
          stroke="#5D4037"
          strokeWidth={1.6}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M72 44 Q76 36 80 34"
          stroke="#5D4037"
          strokeWidth={1.6}
          fill="none"
          strokeLinecap="round"
        />
        <Circle cx={60} cy={34} r={1.6} fill="#5D4037" />
        <Circle cx={80} cy={34} r={1.6} fill="#5D4037" />
        <Circle cx={68} cy={48} r={1.4} fill="#fff" />
        <Circle cx={72} cy={48} r={1.4} fill="#fff" />
      </Svg>
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
