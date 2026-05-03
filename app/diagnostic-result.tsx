import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { useDiagnosticResult } from "@/hooks/useLearning";
import { ErrorState } from "@/components/common/ErrorState";
import { DiagnosticProfileSection } from "@/components/learning/DiagnosticProfileSection";
import { resolveImageUrl } from "@/utils/imageUrl";
import { formatJoinedDate } from "@/utils/dateFormat";
import type { DiagnosticResultItem } from "@/types/learning";

export default function DiagnosticResultScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data, isLoading, isError, refetch } = useDiagnosticResult();

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.background,
          alignItems: "center",
          justifyContent: "center",
          paddingTop: insets.top,
        }}
      >
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.background,
          paddingTop: insets.top,
        }}
      >
        <ErrorState
          message="진단평가 결과를 불러오지 못했습니다."
          onRetry={refetch}
        />
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.background,
        paddingTop: insets.top,
      }}
    >
      <View
        style={{
          paddingHorizontal: 18,
          paddingVertical: 12,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
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
        <Text style={{ fontSize: 17, fontWeight: "900", color: Colors.text }}>
          진단평가 결과
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 18,
          paddingBottom: insets.bottom + 24,
        }}
      >
        {/* Summary card */}
        <View
          style={{
            backgroundColor: Colors.surface,
            borderRadius: 22,
            padding: 22,
            borderWidth: 1,
            borderColor: Colors.surfaceBorder,
            alignItems: "center",
            marginBottom: 18,
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
            {data.grade}학년 진단평가
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "baseline",
              gap: 6,
              marginTop: 8,
            }}
          >
            <Text
              style={{
                fontSize: 56,
                fontWeight: "900",
                color: Colors.primary,
                lineHeight: 60,
              }}
            >
              {data.score}
            </Text>
            <Text
              style={{
                fontSize: 22,
                fontWeight: "800",
                color: Colors.textSecondary,
              }}
            >
              / {data.items.length}
            </Text>
          </View>
          <Text
            style={{
              marginTop: 8,
              fontSize: 12,
              color: Colors.textSecondary,
            }}
          >
            응시일 · {formatJoinedDate(data.completedAt)}
          </Text>
        </View>

        {/* AI 분석 결과 (강·약점 프로파일) */}
        <DiagnosticProfileSection />

        {/* Per-item review */}
        {data.items.map((item, idx) => (
          <ResultItemCard key={item.problemId} item={item} index={idx + 1} />
        ))}
      </ScrollView>
    </View>
  );
}

function ResultItemCard({
  item,
  index,
}: {
  item: DiagnosticResultItem;
  index: number;
}) {
  const isMCQ = item.problemType === "MCQ";
  const choices = [item.choice1, item.choice2, item.choice3, item.choice4]
    .map((c, i) => ({ index: i + 1, text: c }))
    .filter((c): c is { index: number; text: string } => !!c.text);

  return (
    <View
      style={{
        backgroundColor: Colors.surface,
        borderRadius: 18,
        padding: 16,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: item.correct ? Colors.success : Colors.error,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          marginBottom: 10,
        }}
      >
        <View
          style={{
            width: 26,
            height: 26,
            borderRadius: 999,
            backgroundColor: item.correct ? Colors.success : Colors.error,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MaterialCommunityIcons
            name={item.correct ? "check" : "close"}
            size={16}
            color="#fff"
          />
        </View>
        <Text
          style={{
            fontSize: 14,
            fontWeight: "900",
            color: Colors.text,
          }}
        >
          문제 {index}
        </Text>
        <Text
          style={{
            fontSize: 11,
            color: Colors.textSecondary,
            fontWeight: "700",
            marginLeft: "auto",
          }}
        >
          {item.conceptName}
        </Text>
      </View>

      {item.content ? (
        <Text
          style={{
            fontSize: 16,
            color: Colors.text,
            fontWeight: "700",
            lineHeight: 24,
          }}
        >
          {item.content}
        </Text>
      ) : null}

      {item.imageUrl && (
        <Image
          source={{ uri: resolveImageUrl(item.imageUrl) }}
          style={{
            width: "100%",
            height: 160,
            marginTop: 10,
            borderRadius: 8,
          }}
          resizeMode="contain"
        />
      )}

      {isMCQ && choices.length > 0 && (
        <View style={{ marginTop: 10, gap: 6 }}>
          {choices.map((c) => {
            const isMine = item.myAnswer === c.text;
            const isCorrectChoice = item.correctAnswer === c.text;
            const tint = isCorrectChoice
              ? Colors.success
              : isMine
                ? Colors.error
                : null;
            return (
              <View
                key={c.index}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  paddingVertical: 6,
                  paddingHorizontal: 10,
                  borderRadius: 8,
                  backgroundColor: tint ? `${tint}1A` : "transparent",
                  borderWidth: tint ? 1 : 0,
                  borderColor: tint ?? "transparent",
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "900",
                    color: tint ?? Colors.textSecondary,
                  }}
                >
                  {c.index}
                </Text>
                <Text
                  style={{
                    flex: 1,
                    fontSize: 14,
                    color: Colors.text,
                    fontWeight: tint ? "800" : "600",
                  }}
                >
                  {c.text}
                </Text>
                {isCorrectChoice && (
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: "900",
                      color: Colors.success,
                    }}
                  >
                    정답
                  </Text>
                )}
                {isMine && !isCorrectChoice && (
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: "900",
                      color: Colors.error,
                    }}
                  >
                    내 답
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      )}

      {!isMCQ && (
        <View style={{ marginTop: 10, gap: 6 }}>
          <AnswerLine label="내 답" value={item.myAnswer} tint={
            item.correct ? Colors.success : Colors.error
          } />
          {!item.correct && (
            <AnswerLine
              label="정답"
              value={item.correctAnswer}
              tint={Colors.success}
            />
          )}
        </View>
      )}

      {item.explanation ? (
        <View
          style={{
            marginTop: 12,
            backgroundColor: "#fff",
            padding: 10,
            borderRadius: 8,
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
              fontSize: 13,
              color: Colors.text,
              marginTop: 4,
              lineHeight: 19,
            }}
          >
            {item.explanation}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function AnswerLine({
  label,
  value,
  tint,
}: {
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
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 8,
        backgroundColor: `${tint}1A`,
        borderWidth: 1,
        borderColor: tint,
      }}
    >
      <Text style={{ fontSize: 11, fontWeight: "900", color: tint }}>
        {label}
      </Text>
      <Text
        style={{
          flex: 1,
          fontSize: 14,
          color: Colors.text,
          fontWeight: "800",
        }}
      >
        {value}
      </Text>
    </View>
  );
}
