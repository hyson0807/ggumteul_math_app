import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
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
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { useConceptProblems, useSubmitAnswer } from "@/hooks/useLearning";
import { ErrorState } from "@/components/common/ErrorState";
import { MCQChoices } from "@/components/learning/MCQChoices";
import { ResultSheet } from "@/components/learning/ResultSheet";
import { resolveImageUrl } from "@/utils/imageUrl";
import { formatDifficulty } from "@/utils/difficulty";
import type { SubmitAnswerResponse } from "@/types/learning";

const MAX_TIME_SPENT_SECONDS = 3600;

export default function ConceptScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { conceptId: conceptIdParam } = useLocalSearchParams<{ conceptId: string }>();
  const conceptId = Number.parseInt(conceptIdParam ?? "", 10);
  const safeConceptId = Number.isFinite(conceptId) ? conceptId : null;

  const { data, isLoading, isError, refetch } = useConceptProblems(safeConceptId);
  const submitMutation = useSubmitAnswer();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answerText, setAnswerText] = useState("");
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [resultModal, setResultModal] = useState<SubmitAnswerResponse | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const startedAtRef = useRef<number>(Date.now());
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const showSub = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));
    const didShowSub = Keyboard.addListener("keyboardDidShow", () => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    });
    return () => {
      showSub.remove();
      hideSub.remove();
      didShowSub.remove();
    };
  }, []);

  const problems = data?.problems ?? [];
  const currentProblem = problems[currentIndex];
  const isMCQ = currentProblem?.problemType === "MCQ";
  const isLast = currentIndex === problems.length - 1;

  const canSubmit = currentProblem
    ? isMCQ
      ? !!selectedChoice
      : answerText.trim().length > 0
    : false;

  const handleSubmit = () => {
    if (!currentProblem || submitMutation.isPending) return;
    const answer = isMCQ ? (selectedChoice ?? "") : answerText.trim();
    if (!answer) return;

    const timeSpent = Math.min(
      MAX_TIME_SPENT_SECONDS,
      Math.max(0, Math.round((Date.now() - startedAtRef.current) / 1000)),
    );

    submitMutation.mutate(
      { problemId: currentProblem.id, answer, timeSpent },
      {
        onSuccess: (res) => setResultModal(res),
      },
    );
  };

  const handleNext = () => {
    setResultModal(null);
    setAnswerText("");
    setSelectedChoice(null);
    startedAtRef.current = Date.now();

    if (isLast) {
      router.back();
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background }}>
        <ErrorState message="문제를 불러오지 못했습니다." onRetry={refetch} />
      </View>
    );
  }

  if (!currentProblem) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, alignItems: "center", justifyContent: "center", paddingHorizontal: 30 }}>
        <Text style={{ color: Colors.textSecondary, textAlign: "center" }}>
          이 개념에는 아직 준비된 문제가 없어요.
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: Colors.background, paddingTop: insets.top }}
    >
      {/* Header */}
      <View style={{ paddingHorizontal: 18, paddingVertical: 14, flexDirection: "row", alignItems: "center", gap: 12 }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 36, height: 36, borderRadius: 999,
            backgroundColor: Colors.surface, alignItems: "center", justifyContent: "center",
            borderWidth: 1, borderColor: Colors.surfaceBorder,
          }}
        >
          <Text style={{ fontSize: 16, color: Colors.text }}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 10, color: Colors.textSecondary, fontWeight: "700", letterSpacing: 2 }}>
            {data.concept.grade}-{data.concept.semester}학기
          </Text>
          <Text numberOfLines={1} style={{ fontSize: 17, fontWeight: "900", color: Colors.text }}>
            {data.concept.name}
          </Text>
        </View>
        <View
          style={{
            paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999,
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
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
            <Text style={{ fontSize: 11, color: Colors.textSecondary, fontWeight: "800", letterSpacing: 1 }}>
              문제 {currentIndex + 1} · 난이도 {formatDifficulty(currentProblem.difficulty)}
            </Text>
            {currentProblem.solved && (
              <Text style={{ fontSize: 11, color: Colors.success, fontWeight: "800" }}>✓ 이미 맞춘 문제</Text>
            )}
          </View>
          <Text style={{ fontSize: 19, fontWeight: "800", color: Colors.text, lineHeight: 28 }}>
            {currentProblem.content}
          </Text>

          {currentProblem.imageUrl && (
            <Image
              source={{ uri: resolveImageUrl(currentProblem.imageUrl) }}
              style={{ width: "100%", height: 180, marginTop: 14, borderRadius: 10 }}
              resizeMode="contain"
            />
          )}
        </View>

        {isMCQ ? (
          <MCQChoices problem={currentProblem} selected={selectedChoice} onSelect={setSelectedChoice} />
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
            <Text style={{ fontSize: 11, color: Colors.textSecondary, fontWeight: "800", marginBottom: 6 }}>
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

      {/* Submit CTA */}
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
            alignItems: "center", justifyContent: "center",
            flexDirection: "row", gap: 8,
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

      {/* Result modal */}
      <Modal visible={!!resultModal} transparent animationType="fade" onRequestClose={() => {}}>
        {resultModal && (
          <ResultSheet
            result={resultModal}
            isLast={isLast}
            onNext={handleNext}
          />
        )}
      </Modal>
    </KeyboardAvoidingView>
  );
}

