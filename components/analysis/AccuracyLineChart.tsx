import { View } from "react-native";
import Svg, { Circle, Line, Polyline, Text as SvgText } from "react-native-svg";
import { Colors } from "@/constants/colors";

// points: 정답률(%) 배열 — 오래된 세션 → 최신 세션 순. 최대 약 12개만 표시 권장.
export function AccuracyLineChart({ points }: { points: number[] }) {
  const W = 320;
  const H = 140;
  const PAD_X = 18;
  const PAD_TOP = 14;
  const PAD_BOTTOM = 20;
  const innerW = W - PAD_X * 2;
  const innerH = H - PAD_TOP - PAD_BOTTOM;

  const n = points.length;
  const x = (i: number) => (n <= 1 ? W / 2 : PAD_X + (i / (n - 1)) * innerW);
  const y = (v: number) => PAD_TOP + (1 - v / 100) * innerH;

  const polyPoints = points.map((v, i) => `${x(i)},${y(v)}`).join(" ");

  return (
    <View style={{ width: "100%", aspectRatio: W / H }}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`}>
        {/* 가이드 라인: 0 / 50 / 100% */}
        {[0, 50, 100].map((g) => (
          <Line
            key={g}
            x1={PAD_X}
            y1={y(g)}
            x2={W - PAD_X}
            y2={y(g)}
            stroke={Colors.surfaceBorder}
            strokeWidth={1}
            strokeDasharray={g === 0 || g === 100 ? undefined : "3 4"}
          />
        ))}
        {[0, 50, 100].map((g) => (
          <SvgText
            key={`l-${g}`}
            x={4}
            y={y(g) + 3}
            fontSize={8}
            fill={Colors.textSecondary}
          >
            {g}
          </SvgText>
        ))}

        {n > 1 && (
          <Polyline
            points={polyPoints}
            fill="none"
            stroke={Colors.secondary}
            strokeWidth={2.5}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}

        {points.map((v, i) => (
          <Circle
            key={i}
            cx={x(i)}
            cy={y(v)}
            r={i === n - 1 ? 5 : 3.5}
            fill={i === n - 1 ? Colors.cta : Colors.secondary}
            stroke="#fff"
            strokeWidth={1.5}
          />
        ))}
      </Svg>
    </View>
  );
}
