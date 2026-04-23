import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { Colors } from "@/constants/colors";
import { API_BASE_URL } from "@/services/api";
import { useConceptProblems, useSubmitAnswer } from "@/hooks/useLearning";
import { ErrorState } from "@/components/common/ErrorState";
import type { ConceptProblem, SubmitAnswerResponse } from "@/types/learning";

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
  const startedAtRef = useRef<number>(Date.now());

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
    <View style={{ flex: 1, backgroundColor: Colors.background, paddingTop: insets.top }}>
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
        contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: insets.bottom + 100 }}
        keyboardShouldPersistTaps="handled"
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
            />
          </View>
        )}
      </ScrollView>

      {/* Submit CTA */}
      <View
        style={{
          position: "absolute",
          left: 18, right: 18, bottom: insets.bottom + 18,
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
    </View>
  );
}

function MCQChoices({
  problem,
  selected,
  onSelect,
}: {
  problem: ConceptProblem;
  selected: string | null;
  onSelect: (v: string) => void;
}) {
  const choices = [problem.choice1, problem.choice2, problem.choice3, problem.choice4].filter(
    (c): c is string => !!c,
  );
  return (
    <View style={{ gap: 10 }}>
      {choices.map((c, i) => {
        const active = selected === c;
        return (
          <TouchableOpacity
            key={`${i}-${c}`}
            onPress={() => onSelect(c)}
            activeOpacity={0.8}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              paddingVertical: 14,
              paddingHorizontal: 14,
              borderRadius: 14,
              backgroundColor: active ? Colors.primary : Colors.surface,
              borderWidth: 2,
              borderColor: active ? Colors.primary : Colors.surfaceBorder,
            }}
          >
            <View
              style={{
                width: 28, height: 28, borderRadius: 999,
                backgroundColor: active ? "#fff" : Colors.surfaceBorder,
                alignItems: "center", justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: "900", color: active ? Colors.primary : Colors.text }}>
                {i + 1}
              </Text>
            </View>
            <Text
              style={{
                flex: 1,
                fontSize: 16,
                fontWeight: "700",
                color: active ? "#fff" : Colors.text,
              }}
            >
              {c}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function ResultSheet({
  result,
  isLast,
  onNext,
}: {
  result: SubmitAnswerResponse;
  isLast: boolean;
  onNext: () => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end" }}>
      <View
        style={{
          backgroundColor: Colors.surface,
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: insets.bottom + 18,
          borderTopLeftRadius: 22,
          borderTopRightRadius: 22,
          gap: 14,
        }}
      >
        <View style={{ alignItems: "center", gap: 8 }}>
          <View
            style={{
              width: 64, height: 64, borderRadius: 999,
              backgroundColor: result.correct ? Colors.success : Colors.error,
              alignItems: "center", justifyContent: "center",
            }}
          >
            <Svg width={34} height={34} viewBox="0 0 34 34">
              {result.correct ? (
                <Path
                  d="M8 17 L14 23 L26 11"
                  stroke="#fff"
                  strokeWidth={3}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : (
                <Path
                  d="M10 10 L24 24 M24 10 L10 24"
                  stroke="#fff"
                  strokeWidth={3}
                  strokeLinecap="round"
                />
              )}
            </Svg>
          </View>
          <Text style={{ fontSize: 22, fontWeight: "900", color: Colors.text }}>
            {result.correct ? "정답이에요!" : "아쉽지만 오답"}
          </Text>
        </View>

        {result.correct && (
          <View style={{ flexDirection: "row", justifyContent: "center", gap: 14 }}>
            <StatChip label="코인" value={`+${result.coinsEarned}`} tint={Colors.coin} />
            {result.starsEarned > 0 && (
              <StatChip label="별" value={`+${result.starsEarned}`} tint={Colors.star} />
            )}
          </View>
        )}

        {!result.correct && (
          <View style={{ backgroundColor: Colors.background, padding: 12, borderRadius: 10 }}>
            <Text style={{ fontSize: 11, color: Colors.textSecondary, fontWeight: "800" }}>정답</Text>
            <Text style={{ fontSize: 16, color: Colors.text, fontWeight: "800", marginTop: 4 }}>
              {result.correctAnswer}
            </Text>
          </View>
        )}

        {result.explanation && (
          <View style={{ backgroundColor: "#fff", padding: 12, borderRadius: 10, borderWidth: 1, borderColor: Colors.surfaceBorder }}>
            <Text style={{ fontSize: 11, color: Colors.textSecondary, fontWeight: "800" }}>풀이</Text>
            <Text style={{ fontSize: 14, color: Colors.text, marginTop: 4, lineHeight: 20 }}>
              {result.explanation}
            </Text>
          </View>
        )}

        {(result.nodeNewlyCleared || result.stageNewlyCleared) && (
          <View
            style={{
              backgroundColor: Colors.secondary,
              paddingVertical: 10, paddingHorizontal: 14,
              borderRadius: 12,
              flexDirection: "row", gap: 8, alignItems: "center", justifyContent: "center",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "900", fontSize: 14 }}>
              🎉 {result.stageNewlyCleared ? "스테이지 클리어! 다음 땅이 열렸어요" : "개념 클리어! 지렁이가 전진했어요"}
            </Text>
          </View>
        )}

        <TouchableOpacity
          onPress={onNext}
          activeOpacity={0.9}
          style={{
            height: 52,
            borderRadius: 16,
            backgroundColor: Colors.cta,
            alignItems: "center", justifyContent: "center",
          }}
        >
          <Text style={{ color: "#fff", fontSize: 17, fontWeight: "900" }}>
            {isLast ? "마치기" : "다음 문제"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function StatChip({ label, value, tint }: { label: string; value: string; tint: string }) {
  return (
    <View
      style={{
        flexDirection: "row", alignItems: "center", gap: 6,
        paddingHorizontal: 14, paddingVertical: 8,
        borderRadius: 999,
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: tint,
      }}
    >
      <View style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: tint }} />
      <Text style={{ fontSize: 13, color: Colors.text, fontWeight: "800" }}>{label}</Text>
      <Text style={{ fontSize: 14, color: tint, fontWeight: "900" }}>{value}</Text>
    </View>
  );
}

function formatDifficulty(d: number): string {
  if (d <= -2) return "아주 쉬움";
  if (d < 0) return "쉬움";
  if (d === 0) return "보통";
  if (d < 3) return "어려움";
  return "아주 어려움";
}

function resolveImageUrl(url: string): string {
  if (/^https?:\/\//.test(url)) return url;
  const trimmed = url.startsWith("/") ? url : `/${url}`;
  return `${API_BASE_URL}${trimmed}`;
}
