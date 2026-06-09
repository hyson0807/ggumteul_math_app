import { View, Text, ScrollView, ActivityIndicator, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  useAttendance,
  useConceptStatus,
  useDiagnosticProfile,
} from "@/hooks/useLearning";
import { useRecommendationHistory } from "@/hooks/useRecommendation";
import { useAuthStore } from "@/stores/useAuthStore";
import { AccuracyLineChart } from "@/components/analysis/AccuracyLineChart";
import { Colors } from "@/constants/colors";
import type {
  AttendanceResponse,
  ConceptStatusItem,
  ConceptStatusResponse,
  DiagnosticProfileItem,
} from "@/types/learning";
import type { RecommendationHistoryItem } from "@/types/recommendation";

// 추천 한 세션의 문제 수 (백엔드 SESSION_SIZE 와 동일) — 완료 세션 판정에 사용
const RECOMMENDATION_SESSION_SIZE = 5;

export default function AnalysisScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const hasDiagnostic = !!user?.diagnosticCompletedAt;
  const { data: profile, isLoading: profileLoading } = useDiagnosticProfile();
  const { data: attendanceData, isLoading: attendanceLoading } = useAttendance();
  const { data: historyData, isLoading: historyLoading } = useRecommendationHistory();
  const { data: conceptStatus, isLoading: statusLoading } = useConceptStatus();

  const goConcept = (conceptId: number) => router.push(`/concept/${conceptId}`);

  return (
    <View className="flex-1 bg-transparent">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom + 120,
          paddingHorizontal: 20,
        }}
      >
        {!hasDiagnostic ? (
          <DiagnosticGate />
        ) : (
          <>
            <AttendanceCard data={attendanceData} isLoading={attendanceLoading} />
            <View style={{ height: 14 }} />
            <DktSection
              weak={profile?.weak ?? []}
              strong={profile?.strong ?? []}
              isLoading={profileLoading}
              onRetry={goConcept}
            />
            <View style={{ height: 14 }} />
            <AccuracyCard data={historyData ?? []} isLoading={historyLoading} />
            <View style={{ height: 14 }} />
            <ConceptStatusSection
              data={conceptStatus}
              isLoading={statusLoading}
              onRetry={goConcept}
            />
          </>
        )}
      </ScrollView>
    </View>
  );
}

function DiagnosticGate() {
  return (
    <View style={{ ...cardStyle(32), alignItems: "center", marginTop: 16 }}>
      <MaterialCommunityIcons name="chart-bar" size={48} color={Colors.inactive} />
      <Text
        style={{
          fontSize: 16,
          fontWeight: "700",
          color: Colors.text,
          marginTop: 14,
          textAlign: "center",
          lineHeight: 24,
        }}
      >
        진단평가를 완료하면{"\n"}분석 결과를 볼 수 있어요
      </Text>
      <Text
        style={{
          fontSize: 13,
          color: Colors.textSecondary,
          marginTop: 6,
          textAlign: "center",
        }}
      >
        홈 화면에서 진단평가를 시작해 보세요
      </Text>
    </View>
  );
}

// ──────────────────────────────────
// 정답률 추이 (5문제 추천 세션 단위)
// ──────────────────────────────────
function AccuracyCard({
  data,
  isLoading,
}: {
  data: RecommendationHistoryItem[];
  isLoading: boolean;
}) {
  // history 는 최신 → 오래된 순. 그래프는 오래된 → 최신.
  // 완료된 세션(5문제)만 한 점으로 — 중단/진행 중 부분 세션은 추이를 왜곡하므로 제외.
  const sessions = [...data]
    .reverse()
    .filter((s) => s.totalProblems >= RECOMMENDATION_SESSION_SIZE);
  const points = sessions
    .map((s) => Math.round((s.correctCount / s.totalProblems) * 100))
    .slice(-12);

  const comment = (() => {
    if (points.length < 2) return null;
    const delta = points[points.length - 1] - points[points.length - 2];
    if (delta > 0)
      return { text: `정답률이 ${delta}% 올랐어요!`, color: Colors.success };
    if (delta < 0)
      return {
        text: `정답률이 ${Math.abs(delta)}% 내렸어요. 다시 도전해봐요!`,
        color: Colors.error,
      };
    return { text: "정답률을 꾸준히 유지하고 있어요!", color: Colors.secondary };
  })();

  return (
    <View style={cardStyle()}>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 3 }}>
        <MaterialCommunityIcons name="chart-line" size={20} color={Colors.secondary} />
        <Text style={{ fontSize: 15, fontWeight: "700", color: Colors.text, marginLeft: 6 }}>
          정답률 추이
        </Text>
      </View>
      <Text style={{ fontSize: 12, color: Colors.textSecondary, marginBottom: 16 }}>
        추천 학습 5문제마다 정답률을 기록해요
      </Text>

      {isLoading ? (
        <ActivityIndicator color={Colors.primary} />
      ) : points.length === 0 ? (
        <Text style={{ fontSize: 13, color: Colors.inactive, paddingVertical: 8 }}>
          추천 학습을 풀면 정답률 추이가 표시돼요
        </Text>
      ) : (
        <>
          <AccuracyLineChart points={points} />
          {comment ? (
            <View
              style={{
                marginTop: 12,
                backgroundColor: Colors.background,
                borderRadius: 12,
                paddingVertical: 10,
                paddingHorizontal: 14,
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: "800", color: comment.color }}>
                {comment.text}
              </Text>
            </View>
          ) : (
            <Text
              style={{
                marginTop: 12,
                fontSize: 12,
                color: Colors.textSecondary,
                textAlign: "center",
              }}
            >
              세션을 더 풀면 정답률 추이를 보여드릴게요
            </Text>
          )}
        </>
      )}
    </View>
  );
}

// ──────────────────────────────────
// 개념 분석 (DKT 강·약점 2개씩)
// ──────────────────────────────────
function DktSection({
  weak,
  strong,
  isLoading,
  onRetry,
}: {
  weak: DiagnosticProfileItem[];
  strong: DiagnosticProfileItem[];
  isLoading: boolean;
  onRetry: (conceptId: number) => void;
}) {
  if (isLoading) {
    return (
      <View style={{ ...cardStyle(32), alignItems: "center" }}>
        <ActivityIndicator color={Colors.primary} />
        <Text style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 10 }}>
          AI 분석 중...
        </Text>
      </View>
    );
  }

  return (
    <View style={cardStyle()}>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 3 }}>
        <MaterialCommunityIcons name="lightbulb-on-outline" size={20} color={Colors.secondary} />
        <Text style={{ fontSize: 15, fontWeight: "700", color: Colors.text, marginLeft: 6 }}>
          개념 분석
        </Text>
      </View>
      <Text style={{ fontSize: 12, color: Colors.textSecondary, marginBottom: 18 }}>
        AI가 분석한 개념별 학습 포인트예요
      </Text>

      <ConceptCarousel
        title="더 연습이 필요한 개념"
        icon="alert-circle-outline"
        iconColor={Colors.error}
        items={weak}
        starColor={Colors.error}
        kind="weak"
        emptyText="약점 개념이 없어요! 잘 하고 있어요 🎉"
        onRetry={onRetry}
      />
      <View style={{ height: 18 }} />
      <ConceptCarousel
        title="잘 하고 있는 개념"
        icon="star-circle-outline"
        iconColor={Colors.secondary}
        items={strong}
        starColor={Colors.secondary}
        kind="strong"
        emptyText="학습 기록이 쌓이면 강점을 분석해 드릴게요"
      />
    </View>
  );
}

type ConceptKind = "weak" | "strong";

const STAR_LABELS: Record<ConceptKind, [string, string, string]> = {
  weak: ["조금 더", "필요해요", "꼭 필요"],
  strong: ["좋아요", "훌륭해요", "최고예요"],
};

function conceptStars(probability: number, kind: ConceptKind) {
  const score = kind === "weak" ? 1 - probability : probability;
  const stars = score >= 0.66 ? 3 : score >= 0.33 ? 2 : 1;
  return { stars, label: STAR_LABELS[kind][stars - 1] };
}

function ConceptCarousel({
  title,
  icon,
  iconColor,
  items,
  starColor,
  kind,
  emptyText,
  onRetry,
}: {
  title: string;
  icon: string;
  iconColor: string;
  items: DiagnosticProfileItem[];
  starColor: string;
  kind: ConceptKind;
  emptyText: string;
  onRetry?: (conceptId: number) => void;
}) {
  return (
    <View>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
        <MaterialCommunityIcons name={icon as any} size={16} color={iconColor} />
        <Text style={{ fontSize: 13, fontWeight: "700", color: Colors.text, marginLeft: 5 }}>
          {title}
        </Text>
      </View>

      {items.length === 0 ? (
        <Text style={{ fontSize: 13, color: Colors.inactive, paddingVertical: 8 }}>
          {emptyText}
        </Text>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 2, paddingRight: 4 }}
        >
          {items.map((item) => (
            <ConceptChip
              key={item.conceptId}
              item={item}
              starColor={starColor}
              kind={kind}
              onRetry={onRetry}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

function ConceptChip({
  item,
  starColor,
  kind,
  onRetry,
}: {
  item: DiagnosticProfileItem;
  starColor: string;
  kind: ConceptKind;
  onRetry?: (conceptId: number) => void;
}) {
  const { stars, label } = conceptStars(item.probability, kind);
  return (
    <View
      style={{
        width: 138,
        backgroundColor: Colors.background,
        borderWidth: 1,
        borderColor: Colors.surfaceBorder,
        borderRadius: 16,
        padding: 14,
        marginRight: 10,
      }}
    >
      <Text style={{ fontSize: 14, fontWeight: "700", color: Colors.text }} numberOfLines={1}>
        {item.conceptName}
      </Text>
      <Text style={{ fontSize: 11, color: Colors.textSecondary, marginTop: 2 }}>
        {item.grade}학년 {item.semester}학기
      </Text>
      <View style={{ flexDirection: "row", marginTop: 12, marginBottom: 4 }}>
        {[0, 1, 2].map((i) => (
          <MaterialCommunityIcons
            key={i}
            name={i < stars ? "star" : "star-outline"}
            size={18}
            color={i < stars ? starColor : Colors.inactive}
          />
        ))}
      </View>
      <Text style={{ fontSize: 12, fontWeight: "700", color: starColor }}>{label}</Text>

      {onRetry && (
        <Pressable
          onPress={() => onRetry(item.conceptId)}
          style={{
            marginTop: 10,
            backgroundColor: Colors.cta,
            borderRadius: 10,
            paddingVertical: 7,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
          }}
        >
          <MaterialCommunityIcons name="refresh" size={13} color="#fff" />
          <Text style={{ color: "#fff", fontSize: 12, fontWeight: "800" }}>다시 도전</Text>
        </Pressable>
      )}
    </View>
  );
}

// ──────────────────────────────────
// 개념 상태 (성장중 / 연속 오답)
// ──────────────────────────────────
function ConceptStatusSection({
  data,
  isLoading,
  onRetry,
}: {
  data: ConceptStatusResponse | undefined;
  isLoading: boolean;
  onRetry: (conceptId: number) => void;
}) {
  const growing = data?.growing ?? [];
  const struggling = data?.struggling ?? [];
  const isEmpty = growing.length === 0 && struggling.length === 0;

  return (
    <View style={cardStyle()}>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 3 }}>
        <MaterialCommunityIcons name="leaf" size={20} color={Colors.success} />
        <Text style={{ fontSize: 15, fontWeight: "700", color: Colors.text, marginLeft: 6 }}>
          개념 상태
        </Text>
      </View>
      <Text style={{ fontSize: 12, color: Colors.textSecondary, marginBottom: 16 }}>
        최근 일주일 추천 학습에서 성장한 개념과 더 챙겨야 할 개념이에요
      </Text>

      {isLoading ? (
        <ActivityIndicator color={Colors.primary} />
      ) : isEmpty ? (
        <Text style={{ fontSize: 13, color: Colors.inactive, paddingVertical: 8 }}>
          학습 기록이 쌓이면 개념 상태를 보여드릴게요
        </Text>
      ) : (
        <View style={{ gap: 16 }}>
          {growing.length > 0 && (
            <StatusGroup
              emoji="🌱"
              title="성장중"
              caption="이전엔 틀렸지만 이번에 맞췄어요"
              items={growing}
              tint={Colors.success}
              onRetry={onRetry}
            />
          )}
          {struggling.length > 0 && (
            <StatusGroup
              emoji="🔥"
              title="연속 틀린 개념"
              caption="최근 연속으로 틀리고 있어요 — 다시 도전해봐요"
              items={struggling}
              tint={Colors.error}
              onRetry={onRetry}
            />
          )}
        </View>
      )}
    </View>
  );
}

function StatusGroup({
  emoji,
  title,
  caption,
  items,
  tint,
  onRetry,
}: {
  emoji: string;
  title: string;
  caption: string;
  items: ConceptStatusItem[];
  tint: string;
  onRetry: (conceptId: number) => void;
}) {
  return (
    <View>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
        <Text style={{ fontSize: 14 }}>{emoji}</Text>
        <Text style={{ fontSize: 13, fontWeight: "800", color: tint, marginLeft: 5 }}>
          {title}
        </Text>
      </View>
      <Text style={{ fontSize: 11, color: Colors.textSecondary, marginBottom: 10 }}>
        {caption}
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {items.map((item) => (
          <Pressable
            key={item.conceptId}
            onPress={() => onRetry(item.conceptId)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
              backgroundColor: Colors.background,
              borderWidth: 1,
              borderColor: tint,
              borderRadius: 999,
              paddingVertical: 7,
              paddingHorizontal: 12,
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: "700", color: Colors.text }} numberOfLines={1}>
              {item.conceptName}
            </Text>
            <MaterialCommunityIcons name="chevron-right" size={14} color={tint} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const CARD_SHADOW = {
  shadowColor: "#000",
  shadowOpacity: 0.05,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 2 },
  elevation: 2,
} as const;

// 분석탭 카드 공통 컨테이너 스타일
const cardStyle = (padding = 20) =>
  ({
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding,
    ...CARD_SHADOW,
  }) as const;

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

// 오늘 포함 최근 7일을 YYYY-MM-DD 오름차순으로 반환 (UTC 기준, 서버 activeDates 와 동일)
function buildLast7() {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });
}

function AttendanceCard({
  data,
  isLoading,
}: {
  data: AttendanceResponse | undefined;
  isLoading: boolean;
}) {
  return (
    <View style={cardStyle()}>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 3 }}>
        <MaterialCommunityIcons name="fire" size={20} color={Colors.cta} />
        <Text style={{ fontSize: 15, fontWeight: "700", color: Colors.text, marginLeft: 6, flex: 1 }}>
          출석 현황
        </Text>
        {!isLoading && (
          <View style={{ backgroundColor: Colors.cta, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 }}>
            <Text style={{ fontSize: 13, fontWeight: "700", color: "#fff" }}>
              {data?.currentStreak ?? 0}일 연속
            </Text>
          </View>
        )}
      </View>
      <Text style={{ fontSize: 12, color: Colors.textSecondary, marginBottom: 18 }}>
        최근 7일 출석 현황이에요
      </Text>

      {isLoading || !data ? (
        <ActivityIndicator color={Colors.primary} />
      ) : (
        <>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            {buildLast7().map((dateStr) => {
              const active = data.activeDates.includes(dateStr);
              const dayLabel = DAY_LABELS[new Date(dateStr + "T00:00:00").getDay()];
              return (
                <View key={dateStr} style={{ alignItems: "center", rowGap: 4 }}>
                  <Text style={{ fontSize: 11, color: Colors.textSecondary }}>{dayLabel}</Text>
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: active ? Colors.primary : Colors.surfaceBorder,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {active && <MaterialCommunityIcons name="check" size={16} color="#fff" />}
                  </View>
                </View>
              );
            })}
          </View>
          <Text style={{ fontSize: 12, color: Colors.textSecondary, marginTop: 14, textAlign: "center" }}>
            총{" "}
            <Text style={{ fontWeight: "700", color: Colors.primary }}>
              {data?.totalActiveDays ?? 0}일
            </Text>{" "}
            학습했어요
          </Text>
        </>
      )}
    </View>
  );
}
