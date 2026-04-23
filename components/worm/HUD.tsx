import { TouchableOpacity, Text, View } from "react-native";
import Svg, { Circle, Path, Text as SvgText } from "react-native-svg";
import type { UnitId } from "@/constants/units";
import { UNIT_META } from "@/constants/units";

interface Props {
  coins: number;
  unit: UnitId;
  progress: number;
  total: number;
  topInset: number;
  onMapPress: () => void;
}

export function HUD({
  coins,
  unit,
  progress,
  total,
  topInset,
  onMapPress,
}: Props) {
  const meta = UNIT_META[unit];
  const pct =
    total > 0 ? Math.min(100, Math.round((progress / total) * 100)) : 0;
  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        top: topInset + 8,
        left: 12,
        right: 12,
        gap: 8,
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8 }}>
        {/* Map button — dark glass pill */}
        <TouchableOpacity
          accessibilityLabel="지도 열기"
          onPress={onMapPress}
          activeOpacity={0.8}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            paddingLeft: 10,
            paddingRight: 14,
            paddingVertical: 8,
            borderRadius: 16,
            backgroundColor: "rgba(11,14,42,0.55)",
            borderWidth: 0.5,
            borderColor: "rgba(255,255,255,0.15)",
          }}
        >
          <Svg width={22} height={22} viewBox="0 0 24 24">
            <Path
              d="M3 6 L9 4 L15 6 L21 4 L21 18 L15 20 L9 18 L3 20 Z"
              fill="#FFE8C2"
              stroke="#8A5A3A"
              strokeWidth={1.4}
              strokeLinejoin="round"
            />
            <Path d="M9 4 L9 18" stroke="#8A5A3A" strokeWidth={1} />
            <Path d="M15 6 L15 20" stroke="#8A5A3A" strokeWidth={1} />
            <Circle cx={12} cy={11} r={1.8} fill="#C0392B" />
          </Svg>
          <Text style={{ fontSize: 13, fontWeight: "800", color: "#fff" }}>
            지도
          </Text>
        </TouchableOpacity>

        {/* Coin pill */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            paddingVertical: 8,
            paddingLeft: 8,
            paddingRight: 12,
            borderRadius: 999,
            backgroundColor: "rgba(11,14,42,0.55)",
            borderWidth: 0.5,
            borderColor: "rgba(255,255,255,0.15)",
          }}
        >
          <Svg width={22} height={22} viewBox="0 0 22 22">
            <Circle cx={11} cy={11} r={9} fill="#DAA520" stroke="#B8842A" strokeWidth={1.2} />
            <Circle cx={11} cy={11} r={6.5} fill="#FFD36A" />
            <SvgText
              x={11}
              y={14}
              fontSize={8}
              fontWeight="900"
              fill="#8A5A1A"
              textAnchor="middle"
            >
              ₩
            </SvgText>
          </Svg>
          <Text style={{ fontSize: 14, fontWeight: "900", color: "#fff" }}>
            {coins.toLocaleString()}
          </Text>
        </View>
      </View>

      <View
        pointerEvents="none"
        style={{
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 14,
          backgroundColor: "rgba(11,14,42,0.55)",
          borderWidth: 0.5,
          borderColor: "rgba(255,255,255,0.15)",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: 6,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "baseline" }}>
            <Text style={{ fontSize: 13, fontWeight: "900", color: "#fff" }}>{unit}</Text>
            <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", marginLeft: 6 }}>
              {meta.region}
            </Text>
          </View>
          <Text style={{ fontSize: 10, color: "rgba(255,255,255,0.8)", fontWeight: "600" }}>
            {progress}/{total}
          </Text>
        </View>
        <View
          style={{
            height: 5,
            backgroundColor: "rgba(255,255,255,0.18)",
            borderRadius: 999,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              height: "100%",
              width: `${pct}%`,
              backgroundColor: "#FFD36A",
              borderRadius: 999,
            }}
          />
        </View>
      </View>
    </View>
  );
}
