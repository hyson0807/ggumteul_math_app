import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { useRecommendationSession } from "@/stores/useRecommendationSession";
import { useSubmitRecommendationAnswer } from "@/hooks/useRecommendation";
import { ErrorState } from "@/components/common/ErrorState";
import { MCQChoices } from "@/components/learning/MCQChoices";
import { ResultSheet } from "@/components/learning/ResultSheet";
import { SessionSummary } from "@/components/recommendation/SessionSummary";
import { resolveImageUrl } from "@/utils/imageUrl";
import { formatDifficulty } from "@/utils/difficulty";
import { getApiErrorMessage } from "@/services/api";
import type {
  RecommendationProblem,
  SubmitRecommendationAnswerResponse,
} from "@/types/recommendation";

const MAX_TIME_SPENT_SECONDS = 3600;

export default function RecommendSessionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const sessionId = useRecommendationSession((s) => s.sessionId);
  const problems = useRecommendationSession((s) => s.problems);
  const currentIndex = useRecommendationSession((s) => s.currentIndex);
  const advance = useRecommendationSession((s) => s.advance);
  const reset = useRecommendationSession((s) => s.reset);

  const submitMutation = useSubmitRecommendationAnswer();

  const [answerText, setAnswerText] = useState("");
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [resultModal, setResultModal] =
    useState<SubmitRecommendationAnswerResponse | null>(null);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const startedAtRef = useRef<number>(Date.now());
  const scrollViewRef = useRef<ScrollView>(null);

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
    const didShowSub = Keyboard.addListener("keyboardDidShow", () => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    });
    return () => {
      showSub.remove();
      hideSub.remove();
      didShowSub.remove();
    };
  }, []);

  const confirmExit = useCallback(() => {
    Alert.alert("추천 세션 종료", "지금까지 푼 문제는 저장돼요. 계속할까요?", [
      { text: "계속 풀기", style: "cancel" },
      {
        text: "그만하기",
        style: "destructive",
        onPress: () => {
          reset();
          router.back();
        },
      },
    ]);
  }, [reset, router]);

  useFocusEffect(
    useCallback(() => {
      const onBack = () => {
        if (summaryOpen) return false;
        confirmExit();
        return true;
      };
      const sub = BackHandler.addEventListener("hardwareBackPress", onBack);
      return () => sub.remove();
    }, [summaryOpen, confirmExit]),
  );

  const currentProblem = problems[currentIndex];
  const isMCQ = currentProblem?.problemType === "MCQ";
  const isLast = currentIndex === problems.length - 1;

  const canSubmit = (() => {
    if (!currentProblem) return false;
    return isMCQ ? !!selectedChoice : answerText.trim().length > 0;
  })();

  const handleSubmit = () => {
    if (!currentProblem || submitMutation.isPending) return;
    const answer = isMCQ ? selectedChoice ?? "" : answerText.trim();
    if (!answer) return;

    const timeSpent = Math.min(
      MAX_TIME_SPENT_SECONDS,
      Math.max(0, Math.round((Date.now() - startedAtRef.current) / 1000)),
    );

    submitMutation.mutate(
      {
        problemId: currentProblem.id,
        answer,
        timeSpent,
        ...(sessionId ? { sessionId } : {}),
      },
      {
        onSuccess: (res) => setResultModal(res),
        onError: (err) => {
          Alert.alert(
            "제출 실패",
            getApiErrorMessage(err, "답안을 제출하지 못했어요."),
          );
        },
      },
    );
  };

  const handleNext = () => {
    setResultModal(null);
    setAnswerText("");
    setSelectedChoice(null);
    startedAtRef.current = Date.now();

    if (isLast) {
      setSummaryOpen(true);
    } else {
      advance();
    }
  };

  const handleCloseSummary = () => {
    setSummaryOpen(false);
    reset();
    router.back();
  };

  const handleRestart = () => {
    setSummaryOpen(false);
    setResultModal(null);
    setAnswerText("");
    setSelectedChoice(null);
    startedAtRef.current = Date.now();
  };

  if (problems.length === 0) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.background,
          paddingTop: insets.top,
        }}
      >
        <ErrorState
          message="진행 중인 추천 세션이 없어요."
          onRetry={() => router.back()}
        />
      </View>
    );
  }

  if (!currentProblem) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.background,
          paddingTop: insets.top,
        }}
      />
    );
  }

  return (
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
        <TouchableOpacity
          onPress={confirmExit}
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
          <Text style={{ fontSize: 16, color: Colors.text }}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 10,
              color: Colors.textSecondary,
              fontWeight: "700",
              letterSpacing: 2,
            }}
          >
            오늘의 추천
          </Text>
          <Text
            numberOfLines={1}
            style={{ fontSize: 17, fontWeight: "900", color: Colors.text }}
          >
            {currentProblem.conceptName}
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
          <Text style={{ color: "#fff", fontSize: 12, fontWeight: "900" }}>
            {currentIndex + 1} / {problems.length}
          </Text>
        </View>
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
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                color: Colors.textSecondary,
                fontWeight: "800",
                letterSpacing: 1,
              }}
            >
              문제 {currentIndex + 1} · 난이도{" "}
              {formatDifficulty(currentProblem.difficulty)}
            </Text>
            <SourceBadge source={currentProblem.source} />
          </View>
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

          {currentProblem.imageUrl && (
            <Image
              source={{ uri: resolveImageUrl(currentProblem.imageUrl) }}
              style={{
                width: "100%",
                height: 180,
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
              textContentType="none"
              importantForAutofill="no"
              keyboardAppearance="dark"
            />
          </View>
        )}
      </ScrollView>

      <View
        style={{
          paddingHorizontal: 18,
          paddingTop: 8,
          paddingBottom: keyboardVisible ? 8 : insets.bottom + 18,
        }}
      >
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!canSubmit || submitMutation.isPending}
          activeOpacity={0.9}
          style={{
            height: 54,
            borderRadius: 18,
            backgroundColor: canSubmit ? Colors.cta : Colors.inactive,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
            gap: 8,
          }}
        >
          {submitMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: "#fff", fontSize: 17, fontWeight: "900" }}>
              제출하기
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <Modal
        visible={!!resultModal}
        transparent
        animationType="fade"
        onRequestClose={() => {}}
      >
        {resultModal && (
          <ResultSheet
            result={resultModal}
            isLast={isLast}
            onNext={handleNext}
          />
        )}
      </Modal>

      <Modal
        visible={summaryOpen}
        transparent
        animationType="fade"
        onRequestClose={() => {}}
      >
        {summaryOpen && (
          <SessionSummary
            onClose={handleCloseSummary}
            onRestart={handleRestart}
          />
        )}
      </Modal>
    </KeyboardAvoidingView>
  );
}

function SourceBadge({
  source,
}: {
  source: RecommendationProblem["source"];
}) {
  const isRecommended = source === "recommended";
  const label = isRecommended ? "약점 보강" : "복습";
  const tint = isRecommended ? Colors.secondary : Colors.primaryLight;
  return (
    <View
      style={{
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
        backgroundColor: tint,
      }}
    >
      <Text style={{ color: "#fff", fontSize: 11, fontWeight: "900" }}>
        {label}
      </Text>
    </View>
  );
}
