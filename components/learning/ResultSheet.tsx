import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { Colors } from "@/constants/colors";
import { StatChip } from "./StatChip";

export interface LearningResult {
  correct: boolean;
  coinsEarned: number;
  starsEarned: number;
  /** 개념 학습 클리어 보상. 추천 세션 응답에는 없으므로 optional. */
  feedEarned?: number;
  correctAnswer: string;
  explanation: string | null;
  nodeNewlyCleared?: boolean;
  stageNewlyCleared?: boolean;
  nextConceptId?: number | null;
}

export function ResultSheet({
  result,
  isLast,
  onNext,
}: {
  result: LearningResult;
  isLast: boolean;
  onNext: () => void;
}) {
  const insets = useSafeAreaInsets();
  const goNextConcept = !!result.nodeNewlyCleared && result.nextConceptId != null;
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.35)",
        justifyContent: "flex-end",
      }}
    >
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
              width: 64,
              height: 64,
              borderRadius: 999,
              backgroundColor: result.correct ? Colors.success : Colors.error,
              alignItems: "center",
              justifyContent: "center",
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

        {result.correct &&
          (result.coinsEarned > 0 ||
            (result.feedEarned ?? 0) > 0 ||
            result.starsEarned > 0) && (
            <View
              style={{ flexDirection: "row", justifyContent: "center", gap: 14 }}
            >
              {result.coinsEarned > 0 && (
                <StatChip
                  label="코인"
                  value={`+${result.coinsEarned}`}
                  tint={Colors.coin}
                />
              )}
              {(result.feedEarned ?? 0) > 0 && (
                <StatChip
                  label="먹이"
                  value={`+${result.feedEarned}`}
                  tint={Colors.cta}
                />
              )}
              {result.starsEarned > 0 && (
                <StatChip
                  label="별"
                  value={`+${result.starsEarned}`}
                  tint={Colors.star}
                />
              )}
            </View>
          )}

        {!result.correct && (
          <View
            style={{
              backgroundColor: Colors.background,
              padding: 12,
              borderRadius: 10,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                color: Colors.textSecondary,
                fontWeight: "800",
              }}
            >
              정답
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: Colors.text,
                fontWeight: "800",
                marginTop: 4,
              }}
            >
              {result.correctAnswer}
            </Text>
          </View>
        )}

        {result.explanation && (
          <View
            style={{
              backgroundColor: "#fff",
              padding: 12,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: Colors.surfaceBorder,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                color: Colors.textSecondary,
                fontWeight: "800",
              }}
            >
              풀이
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: Colors.text,
                marginTop: 4,
                lineHeight: 20,
              }}
            >
              {result.explanation}
            </Text>
          </View>
        )}

        {(result.nodeNewlyCleared || result.stageNewlyCleared) && (
          <View
            style={{
              backgroundColor: Colors.secondary,
              paddingVertical: 10,
              paddingHorizontal: 14,
              borderRadius: 12,
              flexDirection: "row",
              gap: 8,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "900", fontSize: 14 }}>
              🎉{" "}
              {result.stageNewlyCleared
                ? "스테이지 클리어! 다음 땅이 열렸어요"
                : "개념 클리어! 지렁이가 전진했어요"}
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
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#fff", fontSize: 17, fontWeight: "900" }}>
            {goNextConcept
              ? "다음 개념 풀기"
              : isLast
                ? "마치기"
                : "다음 문제"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
