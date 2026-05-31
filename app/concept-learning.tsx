import { useRef } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { feedback } from "@/utils/feedback";
import {
  ALL_STAGES,
  STAGE_CARD_THEMES,
  STAGE_SCENES,
  type StageId,
} from "@/constants/stages";
import { useStages } from "@/hooks/useLearning";
import type { StageSummary } from "@/types/learning";

// 6개 → 3행 2열
const STAGE_ROWS: StageId[][] = [
  [ALL_STAGES[0], ALL_STAGES[1]],
  [ALL_STAGES[2], ALL_STAGES[3]],
  [ALL_STAGES[4], ALL_STAGES[5]],
];

export default function ConceptLearningScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data, isLoading } = useStages();

  const summaryByStage = new Map<number, StageSummary>(
    (data?.stages ?? []).map((s) => [s.stage, s]),
  );

  const handlePress = (stage: StageId, locked: boolean) => {
    feedback.tabPress();
    if (locked) return;
    router.push(`/stage/${stage}`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: insets.top + 8,
          paddingBottom: 8,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          accessibilityLabel="뒤로 가기"
          hitSlop={10}
          style={{
            width: 36,
            height: 36,
            borderRadius: 999,
            backgroundColor: Colors.surface,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: Colors.surfaceBorder,
          }}
        >
          <MaterialCommunityIcons
            name="chevron-left"
            size={22}
            color={Colors.text}
          />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontFamily: "Jua",
              fontSize: 10,
              letterSpacing: 2,
              color: Colors.textSecondary,
            }}
          >
            CONCEPT LEARNING
          </Text>
          <Text style={{ fontFamily: "Jua", fontSize: 22, color: Colors.text }}>
            개념 학습
          </Text>
        </View>
      </View>

      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 4,
          paddingBottom: 12,
        }}
      >
        <Text
          style={{
            fontFamily: "GowunDodum",
            fontSize: 13,
            color: Colors.textSecondary,
          }}
        >
          학기를 골라 개념을 풀어볼까요?
        </Text>
      </View>

      <View
        style={{
          flex: 1,
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 16,
          gap: 12,
        }}
      >
        {STAGE_ROWS.map((row, rowIdx) => (
          <View
            key={rowIdx}
            style={{ flex: 1, flexDirection: "row", gap: 12 }}
          >
            {row.map((stage) => (
              <StageCard
                key={stage}
                stage={stage}
                summary={summaryByStage.get(stage)}
                loading={isLoading}
                onPress={handlePress}
              />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

function StageCard({
  stage,
  summary,
  loading,
  onPress,
}: {
  stage: StageId;
  summary: StageSummary | undefined;
  loading: boolean;
  onPress: (stage: StageId, locked: boolean) => void;
}) {
  const scene = STAGE_SCENES[stage];
  const theme = STAGE_CARD_THEMES[stage];
  const scale = useRef(new Animated.Value(1)).current;

  const locked = summary?.locked ?? false;
  const current = summary?.current ?? false;
  const done = summary?.cleared ?? false;
  const cleared = summary?.clearedNodes ?? 0;
  const total = summary?.totalNodes ?? 0;
  const showProgress = !loading && !locked && total > 0;
  const percent = showProgress ? Math.min(100, (cleared / total) * 100) : 0;

  const animateTo = (value: number) =>
    Animated.spring(scale, {
      toValue: value,
      useNativeDriver: true,
      speed: 40,
      bounciness: 6,
    }).start();

  const borderColor = locked
    ? Colors.surfaceBorder
    : current
      ? Colors.secondary
      : theme.accent;

  return (
    <Animated.View style={{ flex: 1, transform: [{ scale }] }}>
      <Pressable
        onPress={() => onPress(stage, locked)}
        onPressIn={() => !locked && animateTo(0.96)}
        onPressOut={() => !locked && animateTo(1)}
        accessibilityRole="button"
        accessibilityLabel={`${scene.grade}${locked ? " 잠김" : ""}`}
        style={{
          flex: 1,
          backgroundColor: Colors.surface,
          borderRadius: 24,
          padding: 16,
          borderWidth: 2,
          borderColor,
          justifyContent: "space-between",
          shadowColor: locked ? "#000" : theme.accent,
          shadowOpacity: locked ? 0.05 : 0.18,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: 6 },
          elevation: 4,
          opacity: locked ? 0.55 : 1,
        }}
      >
        {/* 상단: 아이콘 칩 + 학기 배지 */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 16,
              backgroundColor: locked ? Colors.surfaceBorder : theme.tint,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <View
              style={{
                position: "absolute",
                top: 5,
                left: 8,
                width: 12,
                height: 5,
                borderRadius: 999,
                backgroundColor: "#FFFFFF",
                opacity: 0.6,
              }}
            />
            <MaterialCommunityIcons
              name={theme.icon}
              size={26}
              color={locked ? Colors.inactive : theme.accent}
            />
          </View>

          {current ? (
            <View
              style={{
                paddingHorizontal: 9,
                paddingVertical: 4,
                borderRadius: 999,
                backgroundColor: Colors.secondary,
              }}
            >
              <Text style={{ fontFamily: "Jua", fontSize: 10, color: "#fff" }}>
                진행중
              </Text>
            </View>
          ) : done ? (
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 999,
                backgroundColor: `${theme.accent}1F`,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MaterialCommunityIcons
                name="check-bold"
                size={14}
                color={theme.accent}
              />
            </View>
          ) : (
            <Text
              style={{
                fontFamily: "Jua",
                fontSize: 18,
                color: locked ? Colors.inactive : `${theme.accent}80`,
                letterSpacing: 0.5,
              }}
            >
              {scene.unitId}
            </Text>
          )}
        </View>

        {/* 하단: 제목 · 진행도 */}
        <View>
          <Text
            numberOfLines={1}
            style={{
              fontFamily: "Jua",
              fontSize: 17,
              color: locked ? Colors.textSecondary : Colors.text,
            }}
          >
            {scene.grade}
          </Text>
          <Text
            numberOfLines={1}
            style={{
              fontFamily: "GowunDodum",
              fontSize: 11,
              color: Colors.textSecondary,
              marginTop: 2,
              marginBottom: 10,
            }}
          >
            {locked ? "잠겨 있어요" : total > 0 ? `개념 ${total}개` : " "}
          </Text>

          {showProgress ? (
            <View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: 5,
                }}
              >
                <Text
                  style={{
                    fontFamily: "GowunDodum",
                    fontSize: 10,
                    color: Colors.textSecondary,
                  }}
                >
                  진행도
                </Text>
                <Text
                  style={{
                    fontFamily: "Jua",
                    fontSize: 12,
                    color: theme.accent,
                  }}
                >
                  {cleared}
                  <Text style={{ color: Colors.textSecondary }}>
                    {" / "}
                    {total}
                  </Text>
                </Text>
              </View>
              <View
                style={{
                  height: 6,
                  borderRadius: 999,
                  backgroundColor: Colors.surfaceBorder,
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    width: `${percent}%`,
                    height: "100%",
                    backgroundColor: theme.accent,
                    borderRadius: 999,
                  }}
                />
              </View>
            </View>
          ) : locked ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <MaterialCommunityIcons
                name="lock"
                size={13}
                color={Colors.inactive}
              />
              <Text
                style={{
                  fontFamily: "GowunDodum",
                  fontSize: 11,
                  color: Colors.inactive,
                }}
              >
                이전 학기 완료 시 열려요
              </Text>
            </View>
          ) : (
            <View
              style={{
                height: 6,
                borderRadius: 999,
                backgroundColor: Colors.surfaceBorder,
                opacity: 0.5,
              }}
            />
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}
