import { useState } from "react";
import {
  LayoutChangeEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  Path,
  Pattern,
  Polygon,
  Rect,
  Text as SvgText,
} from "react-native-svg";
import { useWorm } from "@/hooks/useWorm";
import { useStages } from "@/hooks/useLearning";
import {
  UNIT_META,
  UNIT_TO_STAGE,
  unitFromWorm,
  type UnitId,
} from "@/constants/units";

const NODES: { id: UnitId; x: number; y: number }[] = [
  { id: "1-1", x: 40, y: 520 },
  { id: "1-2", x: 110, y: 480 },
  { id: "2-1", x: 170, y: 400 },
  { id: "2-2", x: 220, y: 320 },
  { id: "3-1", x: 280, y: 220 },
  { id: "3-2", x: 330, y: 100 },
];

const MAP_VIEWBOX_W = 360;
const MAP_VIEWBOX_H = 560;
const MAP_BODY_PADDING = 8;

export default function MapScreen() {
  const router = useRouter();
  const { data: worm } = useWorm();
  const { data: stagesData } = useStages();
  const [bodySize, setBodySize] = useState({ w: 0, h: 0 });

  const currentUnit: UnitId = worm ? unitFromWorm(worm.stage) : "1-1";
  const meta = UNIT_META[currentUnit];

  const stageByNum = new Map(
    stagesData?.stages.map((s) => [s.stage, s]) ?? [],
  );
  const currentStageInfo = stagesData?.stages.find((s) => s.current);
  const currentTotal = currentStageInfo?.totalNodes ?? 0;
  const currentCleared = currentStageInfo?.clearedNodes ?? 0;

  const onBodyLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setBodySize({ w: width, h: height });
  };

  const svgW = Math.max(0, bodySize.w - MAP_BODY_PADDING * 2);
  const svgH = Math.max(0, bodySize.h - MAP_BODY_PADDING * 2);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#FFF6E8" }}
      edges={["top", "bottom"]}
    >
      {/* Paper texture background */}
      <View
        pointerEvents="none"
        style={[StyleSheet.absoluteFillObject, { opacity: 0.25 }]}
      >
        <Svg width="100%" height="100%">
          <Defs>
            <Pattern
              id="paper"
              width={20}
              height={20}
              patternUnits="userSpaceOnUse"
            >
              <Circle cx={2} cy={4} r={0.6} fill="#C8A878" />
              <Circle cx={14} cy={12} r={0.5} fill="#C8A878" />
              <Circle cx={8} cy={18} r={0.6} fill="#C8A878" />
            </Pattern>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#paper)" />
        </Svg>
      </View>

      {/* Header */}
      <View
        style={{
          paddingHorizontal: 18,
          paddingTop: 12,
          paddingBottom: 4,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View>
          <Text
            style={{
              fontSize: 10,
              color: "#8A6244",
              fontWeight: "700",
              letterSpacing: 3,
            }}
          >
            수학마을 지도
          </Text>
          <Text style={{ fontSize: 22, fontWeight: "900", color: "#5D4037" }}>
            모험의 현재
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={10}
          style={{
            width: 36,
            height: 36,
            borderRadius: 999,
            backgroundColor: "#fff",
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: "rgba(0,0,0,0.08)",
          }}
        >
          <Text style={{ fontSize: 16, color: "#5D4037" }}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* "You are here" callout */}
      <View
        style={{
          marginHorizontal: 18,
          marginTop: 8,
          padding: 12,
          borderRadius: 16,
          backgroundColor: "rgba(192,57,43,0.95)",
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          shadowColor: "#C0392B",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 18,
          elevation: 6,
        }}
      >
        <Svg width={38} height={38} viewBox="0 0 38 38">
          <Path
            d="M19 4 Q8 4 8 15 Q8 24 19 34 Q30 24 30 15 Q30 4 19 4 Z"
            fill="#fff"
            stroke="rgba(0,0,0,0.1)"
            strokeWidth={1}
          />
          <Circle cx={19} cy={15} r={5} fill="#C0392B" />
        </Svg>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 11,
              color: "#fff",
              opacity: 0.85,
              fontWeight: "700",
              letterSpacing: 1,
            }}
          >
            내가 있는 곳
          </Text>
          <Text style={{ fontSize: 15, color: "#fff", fontWeight: "900" }}>
            {currentUnit} · {meta.region}
          </Text>
        </View>
        <View
          style={{
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 999,
            backgroundColor: "rgba(255,255,255,0.22)",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.35)",
          }}
        >
          <Text style={{ fontSize: 11, color: "#fff", fontWeight: "800" }}>
            {currentCleared}/{currentTotal}
          </Text>
        </View>
      </View>

      {/* Treasure map body — fills remaining space */}
      <View
        onLayout={onBodyLayout}
        style={{
          flex: 1,
          marginHorizontal: 14,
          marginVertical: 10,
          borderRadius: 20,
          backgroundColor: "#FFEEC2",
          borderWidth: 2,
          borderColor: "rgba(138,90,58,0.35)",
          borderStyle: "dashed",
          overflow: "hidden",
          padding: MAP_BODY_PADDING,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {svgW > 0 && svgH > 0 && (
          <Svg
            width={svgW}
            height={svgH}
            viewBox={`0 0 ${MAP_VIEWBOX_W} ${MAP_VIEWBOX_H}`}
            preserveAspectRatio="xMidYMid meet"
          >
            {/* compass */}
            <G transform="translate(310, 42)" opacity={0.5}>
              <Circle r={22} fill="none" stroke="#8A5A3A" strokeWidth={1} />
              <Polygon points="0,-18 4,0 0,18 -4,0" fill="#8A5A3A" />
              <SvgText
                x={0}
                y={-24}
                fontSize={9}
                fontWeight="800"
                fill="#8A5A3A"
                textAnchor="middle"
              >
                N
              </SvgText>
            </G>

            {/* Biome labels */}
            <G>
              <SvgText
                x={40}
                y={490}
                fontSize={10}
                fontWeight="700"
                fill="#8A5A3A"
                opacity={0.7}
              >
                깊은 땅
              </SvgText>
              <SvgText
                x={170}
                y={450}
                fontSize={10}
                fontWeight="700"
                fill="#8A5A3A"
                opacity={0.7}
              >
                얕은 땅
              </SvgText>
              <SvgText
                x={240}
                y={300}
                fontSize={10}
                fontWeight="700"
                fill="#8A5A3A"
                opacity={0.7}
              >
                하늘
              </SvgText>
              <SvgText
                x={300}
                y={130}
                fontSize={10}
                fontWeight="700"
                fill="#8A5A3A"
                opacity={0.7}
              >
                우주
              </SvgText>
            </G>

            {/* biome icons */}
            <G transform="translate(50, 510)">
              <Polygon points="0,-10 -6,0 0,8 6,0" fill="#9AD0F0" />
              <Polygon points="10,-4 4,-12 -2,-4 4,0" fill="#F29ACB" />
            </G>
            <G transform="translate(170, 420)">
              <Rect x={-3} y={0} width={6} height={8} fill="#8A5A3A" />
              <Circle cx={0} cy={-2} r={10} fill="#7FB83D" />
            </G>
            <G transform="translate(260, 270)">
              <Ellipse rx={16} ry={6} fill="#fff" opacity={0.8} />
              <Ellipse cx={-8} cy={-3} rx={8} ry={6} fill="#fff" opacity={0.8} />
              <Ellipse cx={8} cy={-2} rx={9} ry={6} fill="#fff" opacity={0.8} />
            </G>
            <G transform="translate(320, 100)">
              <Circle r={14} fill="#E8B084" />
              <Ellipse
                rx={20}
                ry={4}
                fill="none"
                stroke="#8A5A3A"
                strokeWidth={1}
                transform="rotate(-18)"
              />
            </G>

            {/* path */}
            <Path
              d="M40 520 Q110 480 130 430 Q150 380 200 360 Q260 340 240 270 Q220 200 300 170 Q360 150 330 100"
              stroke="#8A5A3A"
              strokeWidth={3}
              strokeDasharray="5 6"
              fill="none"
              strokeLinecap="round"
              opacity={0.7}
            />

            {/* nodes */}
            {NODES.map((n) => {
              const stageNum = UNIT_TO_STAGE[n.id];
              const info = stageByNum.get(stageNum);
              const isCurrent = n.id === currentUnit;
              const done = info?.cleared ?? false;
              const locked = info?.locked ?? false;
              return (
                <G
                  key={n.id}
                  transform={`translate(${n.x}, ${n.y})`}
                  onPress={
                    locked
                      ? undefined
                      : () => router.push(`/stage/${UNIT_TO_STAGE[n.id]}`)
                  }
                >
                  {isCurrent && (
                    <Circle
                      r={28}
                      fill="none"
                      stroke="#C0392B"
                      strokeWidth={2}
                      opacity={0.5}
                    />
                  )}
                  <Circle
                    r={20}
                    fill={isCurrent ? "#C0392B" : done ? "#DAA520" : "#FFF8F0"}
                    stroke="#5A3822"
                    strokeWidth={2}
                  />
                  <SvgText
                    y={4}
                    fontSize={11}
                    fontWeight="900"
                    fill={isCurrent || done ? "#fff" : "#5D4037"}
                    textAnchor="middle"
                  >
                    {n.id}
                  </SvgText>
                  {locked && (
                    <G transform="translate(12, -12)">
                      <Rect x={-6} y={-4} width={12} height={10} rx={2} fill="#5A3822" />
                      <Path
                        d="M-3 -4 V -7 Q0 -10 3 -7 V -4"
                        stroke="#5A3822"
                        strokeWidth={1.5}
                        fill="none"
                      />
                    </G>
                  )}
                  {done && (
                    <Path
                      transform="translate(12, -12)"
                      d="M-4 0 L-1 3 L4 -3"
                      stroke="#fff"
                      strokeWidth={2.2}
                      fill="none"
                      strokeLinecap="round"
                    />
                  )}
                  <SvgText
                    y={36}
                    fontSize={9}
                    fill="#5D4037"
                    textAnchor="middle"
                    fontWeight="700"
                    opacity={0.8}
                  >
                    {UNIT_META[n.id].region}
                  </SvgText>
                </G>
              );
            })}
          </Svg>
        )}
      </View>

      {/* Legend */}
      <View
        style={{
          marginHorizontal: 18,
          marginBottom: 12,
          padding: 12,
          borderRadius: 14,
          backgroundColor: "rgba(255,255,255,0.7)",
          borderWidth: 1,
          borderColor: "rgba(138,90,58,0.15)",
          flexDirection: "row",
          gap: 14,
        }}
      >
        <LegendDot color="#DAA520" label="완료" />
        <LegendDot color="#C0392B" label="지금" />
        <LegendDot color="#FFF8F0" label="잠김" bordered />
      </View>
    </SafeAreaView>
  );
}

function LegendDot({
  color,
  label,
  bordered,
}: {
  color: string;
  label: string;
  bordered?: boolean;
}) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      <View
        style={{
          width: 12,
          height: 12,
          borderRadius: 999,
          backgroundColor: color,
          borderWidth: bordered ? 1 : 0,
          borderColor: "#8A5A3A",
        }}
      />
      <Text style={{ fontSize: 11, fontWeight: "700", color: "#5D4037" }}>
        {label}
      </Text>
    </View>
  );
}
