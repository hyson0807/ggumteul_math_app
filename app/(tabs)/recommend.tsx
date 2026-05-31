import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAttendance, useDiagnosticProfile, useStages } from "@/hooks/useLearning";
import { useRecommendationHistory } from "@/hooks/useRecommendation";
import { useAuthStore } from "@/stores/useAuthStore";
import { ProgressBar } from "@/components/common/ProgressBar";
import { CollapsibleCard } from "@/components/common/CollapsibleCard";
import { Colors } from "@/constants/colors";
import type {
  AttendanceResponse,
  DiagnosticProfileItem,
  StagesResponse,
} from "@/types/learning";
import type { RecommendationHistoryItem } from "@/types/recommendation";

// ISO 시각 → 로컬 YYYY-MM-DD (날짜 그룹 키)
function localDateKey(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// 날짜 키 → 사람이 읽는 라벨 (오늘 / 어제 / YYYY.MM.DD)
function formatDateLabel(key: string): string {
  const todayKey = localDateKey(new Date().toISOString());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = localDateKey(yesterday.toISOString());
  if (key === todayKey) return "오늘";
  if (key === yesterdayKey) return "어제";
  return key.replace(/-/g, ".");
}

// ISO 시각 → 로컬 HH:mm
function formatSessionTime(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes(),
  ).padStart(2, "0")}`;
}

// 세션 목록(startedAt desc 정렬)을 로컬 날짜별로 묶는다. 입력 순서를 유지한다.
function groupSessionsByDate(
  items: RecommendationHistoryItem[],
): { dateKey: string; sessions: RecommendationHistoryItem[] }[] {
  const groups: { dateKey: string; sessions: RecommendationHistoryItem[] }[] =
    [];
  for (const item of items) {
    const dateKey = localDateKey(item.startedAt);
    const last = groups[groups.length - 1];
    if (last && last.dateKey === dateKey) {
      last.sessions.push(item);
    } else {
      groups.push({ dateKey, sessions: [item] });
    }
  }
  return groups;
}

export default function AnalysisScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const hasDiagnostic = !!user?.diagnosticCompletedAt;
  const { data: profile, isLoading: profileLoading } = useDiagnosticProfile();
  const { data: stagesData, isLoading: stagesLoading } = useStages();
  const { data: attendanceData, isLoading: attendanceLoading } = useAttendance();
  const { data: historyData, isLoading: historyLoading } = useRecommendationHistory();

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
            />
            <View style={{ height: 14 }} />
            <HistoryCard data={historyData ?? []} isLoading={historyLoading} />
            <View style={{ height: 14 }} />
            <StageSection data={stagesData} isLoading={stagesLoading} />
          </>
        )}
      </ScrollView>
    </View>
  );
}

function DiagnosticGate() {
  return (
    <View
      style={{
        backgroundColor: Colors.surface,
        borderRadius: 20,
        padding: 32,
        alignItems: "center",
        marginTop: 16,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
      }}
    >
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

function DktSection({
  weak,
  strong,
  isLoading,
}: {
  weak: DiagnosticProfileItem[];
  strong: DiagnosticProfileItem[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <View
        style={{
          backgroundColor: Colors.surface,
          borderRadius: 20,
          padding: 32,
          alignItems: "center",
          ...CARD_SHADOW,
        }}
      >
        <ActivityIndicator color={Colors.primary} />
        <Text
          style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 10 }}
        >
          AI 분석 중...
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{
        backgroundColor: Colors.surface,
        borderRadius: 20,
        padding: 20,
        ...CARD_SHADOW,
      }}
    >
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 3 }}
      >
        <MaterialCommunityIcons
          name="lightbulb-on-outline"
          size={20}
          color={Colors.secondary}
        />
        <Text
          style={{
            fontSize: 15,
            fontWeight: "700",
            color: Colors.text,
            marginLeft: 6,
          }}
        >
          개념 분석
        </Text>
      </View>
      <Text
        style={{ fontSize: 12, color: Colors.textSecondary, marginBottom: 18 }}
      >
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

// 별 개수(1~3)별 라벨. index = stars - 1
const STAR_LABELS: Record<ConceptKind, [string, string, string]> = {
  weak: ["조금 더", "필요해요", "꼭 필요"],
  strong: ["좋아요", "훌륭해요", "최고예요"],
};

// 숙련도(probability)를 별 개수 + 라벨로 매핑.
// 약점은 숙련도가 낮을수록, 강점은 높을수록 별이 많다.
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
}: {
  title: string;
  icon: string;
  iconColor: string;
  items: DiagnosticProfileItem[];
  starColor: string;
  kind: ConceptKind;
  emptyText: string;
}) {
  return (
    <View>
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}
      >
        <MaterialCommunityIcons name={icon as any} size={16} color={iconColor} />
        <Text
          style={{
            fontSize: 13,
            fontWeight: "700",
            color: Colors.text,
            marginLeft: 5,
          }}
        >
          {title}
        </Text>
      </View>

      {items.length === 0 ? (
        <Text
          style={{ fontSize: 13, color: Colors.inactive, paddingVertical: 8 }}
        >
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
}: {
  item: DiagnosticProfileItem;
  starColor: string;
  kind: ConceptKind;
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
      <Text
        style={{ fontSize: 14, fontWeight: "700", color: Colors.text }}
        numberOfLines={1}
      >
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
      <Text style={{ fontSize: 12, fontWeight: "700", color: starColor }}>
        {label}
      </Text>
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
    <View
      style={{
        backgroundColor: Colors.surface,
        borderRadius: 20,
        padding: 20,
        ...CARD_SHADOW,
      }}
    >
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 3 }}
      >
        <MaterialCommunityIcons name="fire" size={20} color={Colors.cta} />
        <Text
          style={{
            fontSize: 15,
            fontWeight: "700",
            color: Colors.text,
            marginLeft: 6,
            flex: 1,
          }}
        >
          출석 현황
        </Text>
        {!isLoading && (
          <View
            style={{
              backgroundColor: Colors.cta,
              borderRadius: 12,
              paddingHorizontal: 10,
              paddingVertical: 3,
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: "700", color: "#fff" }}>
              {data?.currentStreak ?? 0}일 연속
            </Text>
          </View>
        )}
      </View>
      <Text
        style={{ fontSize: 12, color: Colors.textSecondary, marginBottom: 18 }}
      >
        최근 7일 출석 현황이에요
      </Text>

      {isLoading || !data ? (
        <ActivityIndicator color={Colors.primary} />
      ) : (
        <>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            {buildLast7().map((dateStr) => {
              const active = data.activeDates.includes(dateStr);
              const dayLabel =
                DAY_LABELS[new Date(dateStr + "T00:00:00").getDay()];
              return (
                <View
                  key={dateStr}
                  style={{ alignItems: "center", rowGap: 4 }}
                >
                  <Text style={{ fontSize: 11, color: Colors.textSecondary }}>
                    {dayLabel}
                  </Text>
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: active
                        ? Colors.primary
                        : Colors.surfaceBorder,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {active && (
                      <MaterialCommunityIcons
                        name="check"
                        size={16}
                        color="#fff"
                      />
                    )}
                  </View>
                </View>
              );
            })}
          </View>
          <Text
            style={{
              fontSize: 12,
              color: Colors.textSecondary,
              marginTop: 14,
              textAlign: "center",
            }}
          >
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

function HistoryCard({
  data,
  isLoading,
}: {
  data: RecommendationHistoryItem[];
  isLoading: boolean;
}) {
  const latest = data[0];
  const latestPct =
    latest && latest.totalProblems > 0
      ? Math.round((latest.correctCount / latest.totalProblems) * 100)
      : 0;

  const summary = isLoading ? (
    <Text style={{ fontSize: 12, color: Colors.textSecondary }}>
      불러오는 중...
    </Text>
  ) : data.length === 0 ? (
    <Text style={{ fontSize: 12, color: Colors.inactive }}>
      아직 추천 학습 기록이 없어요
    </Text>
  ) : (
    <Text style={{ fontSize: 12, color: Colors.textSecondary }}>
      최근 {formatDateLabel(localDateKey(latest.startedAt))} · 정답률{" "}
      <Text style={{ fontWeight: "700", color: Colors.secondary }}>
        {latestPct}%
      </Text>{" "}
      · 총 {data.length}회
    </Text>
  );

  return (
    <CollapsibleCard
      icon="history"
      iconColor={Colors.secondary}
      title="추천 과거 내역"
      subtitle="세션별 추천 학습 결과예요"
      summary={summary}
    >
      {isLoading ? (
        <ActivityIndicator color={Colors.primary} />
      ) : data.length === 0 ? (
        <Text
          style={{
            fontSize: 13,
            color: Colors.inactive,
            textAlign: "center",
            paddingVertical: 8,
          }}
        >
          아직 추천 학습 기록이 없어요
        </Text>
      ) : (
        groupSessionsByDate(data).map((group, gIdx) => (
          <View key={group.dateKey} style={{ marginTop: gIdx > 0 ? 18 : 0 }}>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "700",
                color: Colors.text,
                marginBottom: 10,
              }}
            >
              {formatDateLabel(group.dateKey)}
            </Text>
            {group.sessions.map((item, sIdx) => {
              const pct =
                item.totalProblems > 0
                  ? Math.round((item.correctCount / item.totalProblems) * 100)
                  : 0;
              return (
                <View
                  key={item.sessionId ?? `${group.dateKey}-${sIdx}`}
                  style={{ marginTop: sIdx > 0 ? 12 : 0 }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 6,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        columnGap: 6,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "600",
                          color: Colors.textSecondary,
                        }}
                      >
                        {formatSessionTime(item.startedAt)}
                      </Text>
                      <Text
                        style={{ fontSize: 12, color: Colors.inactive }}
                      >
                        세션
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        columnGap: 10,
                      }}
                    >
                      <Text
                        style={{ fontSize: 12, color: Colors.textSecondary }}
                      >
                        {item.correctCount}/{item.totalProblems}
                      </Text>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          columnGap: 3,
                        }}
                      >
                        <MaterialCommunityIcons
                          name="circle"
                          size={10}
                          color={Colors.coin}
                        />
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: "600",
                            color: Colors.coin,
                          }}
                        >
                          +{item.coinsEarned}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <ProgressBar percent={pct} height={4} />
                </View>
              );
            })}
          </View>
        ))
      )}
    </CollapsibleCard>
  );
}

function StageSection({
  data,
  isLoading,
}: {
  data: StagesResponse | undefined;
  isLoading: boolean;
}) {
  const current = data?.stages.find((s) => s.current);
  const currentPct =
    current && current.totalNodes > 0
      ? Math.round((current.clearedNodes / current.totalNodes) * 100)
      : 0;

  const summary = isLoading ? (
    <Text style={{ fontSize: 12, color: Colors.textSecondary }}>
      불러오는 중...
    </Text>
  ) : !current ? (
    <Text style={{ fontSize: 12, color: Colors.inactive }}>
      스테이지 정보가 없어요
    </Text>
  ) : (
    <View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 6,
        }}
      >
        <Text style={{ fontSize: 12, color: Colors.textSecondary }}>
          현재{" "}
          <Text style={{ fontWeight: "700", color: Colors.text }}>
            {current.grade}학년 {current.semester}학기
          </Text>
        </Text>
        <Text style={{ fontSize: 12, color: Colors.textSecondary }}>
          {current.clearedNodes}/{current.totalNodes}
        </Text>
      </View>
      <ProgressBar percent={currentPct} color={Colors.secondary} height={5} />
    </View>
  );

  return (
    <CollapsibleCard
      icon="map-marker-path"
      iconColor={Colors.primary}
      title="학습 진도"
      subtitle="스테이지별 진행 현황이에요"
      summary={summary}
    >
      {isLoading ? (
        <ActivityIndicator color={Colors.primary} />
      ) : !data ? null : (
        <>
          {data.stages.map((stage, idx) => {
            const pct =
              stage.totalNodes > 0
                ? Math.round((stage.clearedNodes / stage.totalNodes) * 100)
                : 0;
            const barColor = stage.cleared
              ? Colors.primary
              : stage.current
                ? Colors.secondary
                : Colors.inactive;

            return (
              <View key={stage.stage} style={{ marginTop: idx > 0 ? 14 : 0 }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 6,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    {stage.current && (
                      <View
                        style={{
                          backgroundColor: Colors.secondary,
                          borderRadius: 4,
                          paddingHorizontal: 5,
                          paddingVertical: 1,
                          marginRight: 6,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 10,
                            color: "#fff",
                            fontWeight: "700",
                          }}
                        >
                          현재
                        </Text>
                      </View>
                    )}
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: stage.current ? "700" : "500",
                        color: stage.locked ? Colors.inactive : Colors.text,
                      }}
                    >
                      {stage.grade}학년 {stage.semester}학기
                    </Text>
                  </View>
                  <Text style={{ fontSize: 12, color: Colors.textSecondary }}>
                    {stage.locked
                      ? "잠금"
                      : stage.cleared
                        ? "완료"
                        : `${stage.clearedNodes}/${stage.totalNodes}`}
                  </Text>
                </View>
                <View
                  style={{
                    height: 6,
                    backgroundColor: Colors.surfaceBorder,
                    borderRadius: 3,
                    overflow: "hidden",
                  }}
                >
                  <View
                    style={{
                      height: "100%",
                      width: `${stage.locked ? 0 : pct}%`,
                      backgroundColor: barColor,
                      borderRadius: 3,
                    }}
                  />
                </View>
              </View>
            );
          })}
        </>
      )}
    </CollapsibleCard>
  );
}
