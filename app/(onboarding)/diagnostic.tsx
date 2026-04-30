import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  useCompleteDiagnostic,
  useDiagnosticProblems,
} from "@/hooks/useLearning";
import { ErrorState } from "@/components/common/ErrorState";
import { MCQChoices } from "@/components/learning/MCQChoices";
import { HOME_ROUTE, nextOnboardingRoute } from "@/utils/onboarding";
import { resolveImageUrl } from "@/utils/imageUrl";

const MAX_TIME_SPENT_SECONDS = 3600;

type CollectedAnswer = { answer: string; timeSpent: number };

export default function DiagnosticScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const grade = useAuthStore((s) => s.user?.grade ?? null);

  const { data: problems, isLoading, isError, refetch } =
    useDiagnosticProblems(grade);
  const completeMutation = useCompleteDiagnostic();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answerText, setAnswerText] = useState("");
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const collectedRef = useRef<Record<number, CollectedAnswer>>({});
  const startedAtRef = useRef<number>(Date.now());
  const scrollViewRef = useRef<ScrollView>(null);

  // 진단평가 풀이 중 실수로 빠져나와 처음부터 다시 풀게 되는 것을 막는다.
  // Android hardware back 은 여기서, iOS swipe-back 은 Stack.Screen gestureEnabled 에서 차단.
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => true);
    return () => sub.remove();
  }, []);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const showSub = Keyboard.addListener(showEvent, () =>
      setKeyboardVisible(true),
    );
    const hideSub = Keyboard.addListener(hideEvent, () =>
      setKeyboardVisible(false),
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const total = problems?.length ?? 0;
  const currentProblem = problems?.[currentIndex];
  const isMCQ = currentProblem?.problemType === "MCQ";
  const isLast = total > 0 && currentIndex === total - 1;

  const canProceed = currentProblem
    ? isMCQ
      ? !!selectedChoice
      : answerText.trim().length > 0
    : false;

  const handleNext = () => {
    if (!currentProblem || !problems || completeMutation.isPending) return;
    const answer = isMCQ ? (selectedChoice ?? "") : answerText.trim();
    if (!answer) return;

    const timeSpent = Math.min(
      MAX_TIME_SPENT_SECONDS,
      Math.max(0, Math.round((Date.now() - startedAtRef.current) / 1000)),
    );
    collectedRef.current[currentProblem.id] = { answer, timeSpent };

    if (!isLast) {
      setCurrentIndex((i) => i + 1);
      setAnswerText("");
      setSelectedChoice(null);
      startedAtRef.current = Date.now();
      return;
    }

    // 마지막 문제 → bulk 제출
    if (grade !== 1 && grade !== 2 && grade !== 3) return;
    const payload = {
      grade: grade as 1 | 2 | 3,
      answers: problems.map((p) => ({
        problemId: p.id,
        answer: collectedRef.current[p.id]?.answer ?? "",
        timeSpent: collectedRef.current[p.id]?.timeSpent ?? 0,
      })),
    };

    completeMutation.mutate(payload, {
      onSuccess: (data) => {
        router.replace(nextOnboardingRoute(data.user) ?? HOME_ROUTE);
      },
      onError: () => {
        Alert.alert("제출 실패", "잠시 후 다시 시도해주세요.");
      },
    });
  };

  if (grade == null) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.background,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 30,
        }}
      >
        <Text style={{ color: Colors.textSecondary, textAlign: "center" }}>
          학년 정보를 불러올 수 없습니다.
        </Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.background,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (isError || !problems || problems.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background }}>
        <ErrorState
          message="진단평가 문제를 불러오지 못했습니다."
          onRetry={refetch}
        />
      </View>
    );
  }

  if (!currentProblem) return null;

  return (
    <>
      <Stack.Screen options={{ gestureEnabled: false }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{
          flex: 1,
          backgroundColor: Colors.background,
          paddingTop: insets.top,
        }}
      >
        {/* Header */}
        <View
          style={{
            paddingHorizontal: 18,
            paddingVertical: 14,
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 10,
                color: Colors.textSecondary,
                fontWeight: "700",
                letterSpacing: 2,
              }}
            >
              {grade}학년 진단평가
            </Text>
            <Text
              style={{ fontSize: 17, fontWeight: "900", color: Colors.text }}
            >
              나의 학습 출발점 알아보기
            </Text>
          </View>
          <View
            style={{
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 999,
              backgroundColor: Colors.primary,
            }}
          >
            <Text
              style={{ color: "#fff", fontSize: 12, fontWeight: "900" }}
            >
              {currentIndex + 1} / {total}
            </Text>
          </View>
        </View>

        {/* Progress bar */}
        <View
          style={{
            marginHorizontal: 18,
            height: 6,
            borderRadius: 999,
            backgroundColor: Colors.surfaceBorder,
            overflow: "hidden",
            marginBottom: 8,
          }}
        >
          <View
            style={{
              width: `${((currentIndex + 1) / total) * 100}%`,
              height: "100%",
              backgroundColor: Colors.primary,
            }}
          />
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 20 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          <View
            style={{
              backgroundColor: Colors.surface,
              borderRadius: 18,
              padding: 18,
              marginBottom: 14,
              borderWidth: 1,
              borderColor: Colors.surfaceBorder,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                color: Colors.textSecondary,
                fontWeight: "800",
                letterSpacing: 1,
                marginBottom: 10,
              }}
            >
              문제 {currentIndex + 1}
            </Text>
            {currentProblem.content ? (
              <Text
                style={{
                  fontSize: 19,
                  fontWeight: "800",
                  color: Colors.text,
                  lineHeight: 28,
                }}
              >
                {currentProblem.content}
              </Text>
            ) : null}

            {currentProblem.imageUrl && (
              <Image
                source={{ uri: resolveImageUrl(currentProblem.imageUrl) }}
                style={{
                  width: "100%",
                  height: 200,
                  marginTop: 14,
                  borderRadius: 10,
                }}
                resizeMode="contain"
              />
            )}
          </View>

          {isMCQ ? (
            <MCQChoices
              problem={currentProblem}
              selected={selectedChoice}
              onSelect={setSelectedChoice}
            />
          ) : (
            <View
              style={{
                backgroundColor: Colors.surface,
                borderRadius: 16,
                padding: 14,
                borderWidth: 1,
                borderColor: Colors.surfaceBorder,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  color: Colors.textSecondary,
                  fontWeight: "800",
                  marginBottom: 6,
                }}
              >
                답을 입력하세요
              </Text>
              <TextInput
                value={answerText}
                onChangeText={setAnswerText}
                placeholder="정답"
                placeholderTextColor={Colors.inactive}
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  color: Colors.text,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  backgroundColor: "#fff",
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: Colors.surfaceBorder,
                }}
                returnKeyType="done"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="off"
                spellCheck={false}
                keyboardAppearance="dark"
              />
            </View>
          )}
        </ScrollView>

        {/* CTA */}
        <View
          style={{
            paddingHorizontal: 18,
            paddingTop: 8,
            paddingBottom: keyboardVisible ? 8 : insets.bottom + 18,
          }}
        >
          <TouchableOpacity
            onPress={handleNext}
            disabled={!canProceed || completeMutation.isPending}
            activeOpacity={0.9}
            style={{
              height: 54,
              borderRadius: 18,
              backgroundColor: canProceed ? Colors.cta : Colors.inactive,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              gap: 8,
            }}
          >
            {completeMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text
                style={{ color: "#fff", fontSize: 17, fontWeight: "900" }}
              >
                {isLast ? "제출하기" : "다음 문제"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

