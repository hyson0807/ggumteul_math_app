import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { useAuthStore } from "@/stores/useAuthStore";
import { useStartRecommendationSession } from "@/hooks/useRecommendation";
import { getApiErrorMessage } from "@/services/api";

export default function RecommendIntroScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const diagnosticDone = !!user?.diagnosticCompletedAt;

  const startMutation = useStartRecommendationSession();

  const goDiagnostic = () => {
    router.push("/(onboarding)/diagnostic");
  };

  const startSession = () => {
    if (startMutation.isPending) return;
    startMutation.mutate(undefined, {
      onSuccess: () => {
        router.push("/recommend-session");
      },
      onError: (err) => {
        Alert.alert(
          "추천 시작 실패",
          getApiErrorMessage(err, "추천을 시작하지 못했어요."),
        );
      },
    });
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.background,
        paddingTop: insets.top,
      }}
    >
      <View style={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: 8, flexDirection: "row", alignItems: "center", gap: 8 }}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.text} />
        </TouchableOpacity>
        <View>
          <Text
            style={{
              fontSize: 11,
              color: Colors.textSecondary,
              fontWeight: "800",
              letterSpacing: 2,
            }}
          >
            DAILY · AI 추천
          </Text>
          <Text
            style={{ fontSize: 26, fontWeight: "900", color: Colors.text, marginTop: 2 }}
          >
            오늘의 맞춤 학습
          </Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        {!diagnosticDone ? (
          <View
            style={{
              backgroundColor: Colors.surface,
              borderRadius: 20,
              padding: 22,
              borderWidth: 1,
              borderColor: Colors.surfaceBorder,
              alignItems: "center",
              marginTop: 12,
              gap: 14,
            }}
          >
            <MaterialCommunityIcons
              name="clipboard-text-search-outline"
              size={56}
              color={Colors.primary}
            />
            <Text
              style={{
                fontSize: 18,
                fontWeight: "900",
                color: Colors.text,
                textAlign: "center",
              }}
            >
              먼저 진단평가가 필요해요
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: Colors.textSecondary,
                textAlign: "center",
                lineHeight: 22,
              }}
            >
              진단평가로 강·약점을 파악해야{"\n"}오늘의 맞춤 문제를 추천할 수 있어요.
            </Text>
            <TouchableOpacity
              onPress={goDiagnostic}
              activeOpacity={0.9}
              style={{
                marginTop: 4,
                height: 50,
                width: "100%",
                borderRadius: 14,
                backgroundColor: Colors.cta,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "900" }}>
                진단평가 풀러 가기
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View
            style={{
              backgroundColor: Colors.surface,
              borderRadius: 20,
              padding: 20,
              borderWidth: 1,
              borderColor: Colors.surfaceBorder,
              marginTop: 12,
              gap: 14,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  backgroundColor: Colors.primary,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MaterialCommunityIcons
                  name="lightbulb-on"
                  size={26}
                  color="#fff"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 17,
                    fontWeight: "900",
                    color: Colors.text,
                  }}
                >
                  약점 보강 5문제
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: Colors.textSecondary,
                    marginTop: 2,
                  }}
                >
                  AI 추천 2문제 + 복습 랜덤 3문제
                </Text>
              </View>
            </View>

            <View style={{ gap: 8 }}>
              <BulletLine text="진단평가 + 학습 누적을 분석해 약점을 찾아요" />
              <BulletLine text="맞춘 문제는 추천에서 빠져요" />
              <BulletLine text="홈 탭과 동일한 코인을 받아요" />
            </View>
          </View>
        )}
      </ScrollView>

      {diagnosticDone && (
        <View
          style={{
            position: "absolute",
            left: 20,
            right: 20,
            bottom: insets.bottom + 20,
          }}
        >
          <TouchableOpacity
            onPress={startSession}
            disabled={startMutation.isPending}
            activeOpacity={0.9}
            style={{
              height: 58,
              borderRadius: 18,
              backgroundColor: Colors.cta,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              gap: 8,
              shadowColor: "#000",
              shadowOpacity: 0.15,
              shadowOffset: { width: 0, height: 4 },
              shadowRadius: 10,
              elevation: 6,
            }}
          >
            {startMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <MaterialCommunityIcons name="play" size={20} color="#fff" />
                <Text style={{ color: "#fff", fontSize: 17, fontWeight: "900" }}>
                  오늘의 추천 시작
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function BulletLine({ text }: { text: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 8 }}>
      <View
        style={{
          width: 5,
          height: 5,
          borderRadius: 999,
          backgroundColor: Colors.primary,
          marginTop: 7,
        }}
      />
      <Text
        style={{
          flex: 1,
          fontSize: 13,
          color: Colors.text,
          lineHeight: 20,
        }}
      >
        {text}
      </Text>
    </View>
  );
}
