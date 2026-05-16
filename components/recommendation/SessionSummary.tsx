import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { useRecommendationSession } from "@/stores/useRecommendationSession";
import { useStartRecommendationSession } from "@/hooks/useRecommendation";
import { getApiErrorMessage } from "@/services/api";

export function SessionSummary({
  onClose,
  onRestart,
}: {
  onClose: () => void;
  onRestart: () => void;
}) {
  const insets = useSafeAreaInsets();
  // mount 시점의 store 값을 스냅샷으로 잠금 — "한 번 더" 가 store 를 갱신해도
  // 닫히는 동안 새 세션 데이터가 모달에 새어나오지 않게 한다.
  const [problems] = useState(
    () => useRecommendationSession.getState().problems,
  );
  const [results] = useState(
    () => useRecommendationSession.getState().results,
  );
  const [totalCoinsEarned] = useState(
    () => useRecommendationSession.getState().totalCoinsEarned,
  );

  const correctCount = results.filter((r) => r.correct).length;
  const total = problems.length;

  const startMutation = useStartRecommendationSession();

  const handleAgain = () => {
    if (startMutation.isPending) return;
    // mutation 의 onSuccess 콜백을 기다리지 않고 클릭 즉시 모달 닫음.
    // 옛 코드에선 onSuccess 콜백이 어떤 이유로 fire 되지 않아 모달이 stuck 되는
    // 버그가 있었음. 동기적으로 닫아서 race 자체를 제거한다.
    onRestart();
    startMutation.mutate(undefined, {
      onError: (err) => {
        Alert.alert(
          "추천 시작 실패",
          getApiErrorMessage(err, "새 추천을 시작하지 못했어요."),
        );
      },
    });
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.45)",
        justifyContent: "flex-end",
      }}
    >
      <View
        style={{
          backgroundColor: Colors.surface,
          paddingTop: 22,
          paddingHorizontal: 22,
          paddingBottom: insets.bottom + 22,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          maxHeight: "85%",
        }}
      >
        <View style={{ alignItems: "center", gap: 6 }}>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 999,
              backgroundColor: Colors.secondary,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MaterialCommunityIcons
              name="trophy"
              size={34}
              color="#fff"
            />
          </View>
          <Text style={{ fontSize: 22, fontWeight: "900", color: Colors.text }}>
            오늘의 추천 완료!
          </Text>
          <Text
            style={{ fontSize: 14, color: Colors.textSecondary, marginTop: 2 }}
          >
            {correctCount} / {total} 정답
          </Text>
        </View>

        <View
          style={{
            marginTop: 18,
            flexDirection: "row",
            justifyContent: "center",
            gap: 14,
          }}
        >
          <SummaryStat
            icon="circle-multiple"
            label="획득 코인"
            value={`+${totalCoinsEarned}`}
            tint={Colors.coin}
          />
          <SummaryStat
            icon="check-circle"
            label="정답률"
            value={total > 0 ? `${Math.round((correctCount / total) * 100)}%` : "0%"}
            tint={Colors.success}
          />
        </View>

        <ScrollView
          style={{ marginTop: 18 }}
          contentContainerStyle={{ gap: 8 }}
          showsVerticalScrollIndicator={false}
        >
          {problems.map((p, i) => {
            const r = results[i];
            const isRecommended = p.source === "recommended";
            return (
              <View
                key={p.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                  backgroundColor: "#fff",
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: Colors.surfaceBorder,
                }}
              >
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 999,
                    backgroundColor: r
                      ? r.correct
                        ? Colors.success
                        : Colors.error
                      : Colors.inactive,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{ color: "#fff", fontWeight: "900", fontSize: 12 }}
                  >
                    {i + 1}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    numberOfLines={1}
                    style={{
                      fontSize: 13,
                      fontWeight: "800",
                      color: Colors.text,
                    }}
                  >
                    {p.conceptName}
                  </Text>
                  <Text
                    style={{
                      fontSize: 11,
                      color: Colors.textSecondary,
                      marginTop: 1,
                    }}
                  >
                    {isRecommended ? "약점 보강" : "복습"}
                  </Text>
                </View>
                {r && (
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "800",
                      color: r.correct ? Colors.success : Colors.error,
                    }}
                  >
                    {r.correct ? "정답" : "오답"}
                  </Text>
                )}
              </View>
            );
          })}
        </ScrollView>

        <View style={{ flexDirection: "row", gap: 10, marginTop: 18 }}>
          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.9}
            style={{
              flex: 1,
              height: 52,
              borderRadius: 16,
              backgroundColor: Colors.surface,
              borderWidth: 1.5,
              borderColor: Colors.surfaceBorder,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: Colors.text, fontSize: 15, fontWeight: "900" }}>
              닫기
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleAgain}
            disabled={startMutation.isPending}
            activeOpacity={0.9}
            style={{
              flex: 1.4,
              height: 52,
              borderRadius: 16,
              backgroundColor: Colors.cta,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              gap: 6,
            }}
          >
            {startMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <MaterialCommunityIcons name="refresh" size={18} color="#fff" />
                <Text style={{ color: "#fff", fontSize: 15, fontWeight: "900" }}>
                  한 번 더
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function SummaryStat({
  icon,
  label,
  value,
  tint,
}: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  label: string;
  value: string;
  tint: string;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 14,
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: tint,
      }}
    >
      <MaterialCommunityIcons name={icon} size={20} color={tint} />
      <View>
        <Text style={{ fontSize: 10, color: Colors.textSecondary, fontWeight: "800" }}>
          {label}
        </Text>
        <Text style={{ fontSize: 16, color: tint, fontWeight: "900" }}>
          {value}
        </Text>
      </View>
    </View>
  );
}
