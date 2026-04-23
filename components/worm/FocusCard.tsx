import { View, Text, TouchableOpacity } from "react-native";
import Svg, { Path } from "react-native-svg";
import { UNIT_META, type UnitId } from "@/constants/units";

interface Props {
  unit: UnitId;
  bottomOffset: number;
  onClose: () => void;
  onStartSolve: () => void;
}

export function FocusCard({ unit, bottomOffset, onClose, onStartSolve }: Props) {
  const meta = UNIT_META[unit];

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: bottomOffset,
        alignItems: "center",
      }}
    >
      <View
        style={{
          width: 320,
          maxWidth: "92%",
          borderRadius: 22,
          padding: 16,
          backgroundColor: "rgba(255,248,240,0.97)",
          borderWidth: 1,
          borderColor: "rgba(160,82,45,0.2)",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 20 },
          shadowOpacity: 0.25,
          shadowRadius: 40,
          elevation: 12,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "baseline" }}>
            <Text
              style={{
                fontSize: 22,
                fontWeight: "900",
                color: "#A0522D",
                marginRight: 8,
              }}
            >
              {unit}
            </Text>
            <Text style={{ fontSize: 12, color: "#8D6E63", fontWeight: "600" }}>
              {meta.grade}
            </Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            style={{
              width: 24,
              height: 24,
              borderRadius: 999,
              backgroundColor: "#F0D5C8",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: "700", color: "#5D4037" }}>
              ✕
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={{ fontSize: 12, color: "#5D4037", marginBottom: 12, opacity: 0.8 }}>
          <Text style={{ fontWeight: "700" }}>{meta.region}</Text>
          <Text> · 세 가지 개념을 이어서 풀어요</Text>
        </Text>

        <View style={{ gap: 6, marginBottom: 12 }}>
          {meta.concepts.map((c, i) => (
            <View
              key={c}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                paddingHorizontal: 10,
                paddingVertical: 8,
                borderRadius: 10,
                backgroundColor: i === 0 ? "#FFF0E0" : "#FCF3E7",
                borderWidth: 1,
                borderColor: i === 0 ? "#F0C8A0" : "rgba(160,82,45,0.1)",
              }}
            >
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 999,
                  backgroundColor: i === 0 ? "#A0522D" : "#E8D0B8",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: "800", color: "#fff" }}>
                  {i + 1}
                </Text>
              </View>
              <Text
                style={{
                  flex: 1,
                  fontSize: 13,
                  fontWeight: "600",
                  color: "#5D4037",
                }}
              >
                {c}
              </Text>
              <View style={{ flexDirection: "row" }}>
                {[0, 1, 2].map((s) => (
                  <Svg key={s} width={10} height={10} viewBox="0 0 12 12">
                    <Path
                      d="M6 1 L7.5 4.5 L11 5 L8.5 7.5 L9 11 L6 9 L3 11 L3.5 7.5 L1 5 L4.5 4.5 Z"
                      fill={i === 0 && s === 0 ? "#DAA520" : "rgba(160,82,45,0.15)"}
                    />
                  </Svg>
                ))}
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity
          onPress={onStartSolve}
          activeOpacity={0.85}
          style={{
            height: 44,
            borderRadius: 12,
            backgroundColor: "#C0392B",
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#C0392B",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.35,
            shadowRadius: 16,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 14, fontWeight: "800" }}>
            여기서부터 풀기 →
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
