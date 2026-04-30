import { Text, TouchableOpacity, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { Colors } from "@/constants/colors";
import { UNIT_META, type UnitId } from "@/constants/units";
import { ProgressBar } from "@/components/common/ProgressBar";

interface Props {
  unit: UnitId;
  activeConceptName: string | null;
  clearedNodes: number;
  totalNodes: number;
  stageCleared: boolean;
  bottomOffset: number;
  onClose: () => void;
  onStartSolve: () => void;
  onViewStage: () => void;
}

export function FocusCard({
  unit,
  activeConceptName,
  clearedNodes,
  totalNodes,
  stageCleared,
  bottomOffset,
  onClose,
  onStartSolve,
  onViewStage,
}: Props) {
  const meta = UNIT_META[unit];
  const pct =
    totalNodes > 0 ? Math.min(100, Math.round((clearedNodes / totalNodes) * 100)) : 0;

  const hasActive = !!activeConceptName && !stageCleared;
  const primaryLabel = stageCleared
    ? "다음 스테이지로 이동"
    : hasActive
      ? "이 문제 풀기"
      : "스테이지 노드 보기";
  const primaryAction = stageCleared || !hasActive ? onViewStage : onStartSolve;

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
          width: 340,
          maxWidth: "92%",
          borderRadius: 22,
          padding: 18,
          backgroundColor: "rgba(255,248,240,0.97)",
          borderWidth: 1,
          borderColor: "rgba(160,82,45,0.2)",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 20 },
          shadowOpacity: 0.25,
          shadowRadius: 40,
          elevation: 12,
          gap: 12,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View>
            <Text
              style={{
                fontSize: 10,
                color: Colors.textSecondary,
                fontWeight: "800",
                letterSpacing: 2,
              }}
            >
              {meta.grade}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8, marginTop: 2 }}>
              <Text style={{ fontSize: 22, fontWeight: "900", color: Colors.primary }}>
                {unit}
              </Text>
              <Text style={{ fontSize: 13, color: Colors.text, fontWeight: "700" }}>
                {meta.region}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={onClose}
            hitSlop={10}
            style={{
              width: 28,
              height: 28,
              borderRadius: 999,
              backgroundColor: Colors.surfaceBorder,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: "800", color: Colors.text }}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={{ gap: 6 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
            <Text style={{ fontSize: 11, color: Colors.textSecondary, fontWeight: "700" }}>
              스테이지 진행
            </Text>
            <Text style={{ fontSize: 12, color: Colors.text, fontWeight: "900" }}>
              {clearedNodes} / {totalNodes}
            </Text>
          </View>
          <ProgressBar percent={pct} color={Colors.secondary} />
        </View>

        <View
          style={{
            padding: 14,
            borderRadius: 14,
            backgroundColor: stageCleared
              ? "rgba(107,142,35,0.12)"
              : hasActive
                ? "rgba(192,57,43,0.08)"
                : Colors.background,
            borderWidth: 1,
            borderColor: stageCleared
              ? Colors.success
              : hasActive
                ? "rgba(192,57,43,0.25)"
                : Colors.surfaceBorder,
            gap: 4,
          }}
        >
          <Text
            style={{
              fontSize: 10,
              fontWeight: "800",
              letterSpacing: 1,
              color: stageCleared
                ? Colors.success
                : hasActive
                  ? Colors.cta
                  : Colors.textSecondary,
            }}
          >
            {stageCleared ? "스테이지 완료" : hasActive ? "다음 도전 개념" : "상태"}
          </Text>
          <Text
            numberOfLines={2}
            style={{ fontSize: 16, fontWeight: "900", color: Colors.text, lineHeight: 22 }}
          >
            {stageCleared
              ? "모든 개념을 클리어했어요!"
              : activeNodeText(activeConceptName, totalNodes)}
          </Text>
        </View>

        <View style={{ flexDirection: "row", gap: 8 }}>
          <TouchableOpacity
            onPress={onViewStage}
            activeOpacity={0.85}
            style={{
              flex: 1,
              height: 46,
              borderRadius: 14,
              backgroundColor: Colors.surface,
              borderWidth: 1,
              borderColor: Colors.surfaceBorder,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: Colors.text, fontSize: 13, fontWeight: "800" }}>
              목록
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={primaryAction}
            activeOpacity={0.85}
            style={{
              flex: 1.4,
              height: 46,
              borderRadius: 14,
              backgroundColor: Colors.cta,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              shadowColor: Colors.cta,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.35,
              shadowRadius: 16,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 14, fontWeight: "900" }}>
              {primaryLabel}
            </Text>
            <Svg width={14} height={14} viewBox="0 0 14 14">
              <Path
                d="M3 7 L10 7 M7 3 L11 7 L7 11"
                stroke="#fff"
                strokeWidth={2}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function activeNodeText(name: string | null, totalNodes: number): string {
  if (name) return name;
  if (totalNodes === 0) return "아직 준비된 개념이 없어요";
  return "지도에서 다음 개념을 골라주세요";
}
