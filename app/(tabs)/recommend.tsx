import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useDiagnosticProfile, useStages } from "@/hooks/useLearning";
import { useAuthStore } from "@/stores/useAuthStore";
import { Colors } from "@/constants/colors";
import type { DiagnosticProfileItem, StagesResponse } from "@/types/learning";

export default function AnalysisScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const hasDiagnostic = !!user?.diagnosticCompletedAt;
  const { data: profile, isLoading: profileLoading } = useDiagnosticProfile();
  const { data: stagesData, isLoading: stagesLoading } = useStages();

  return (
    <View className="flex-1 bg-transparent">
      <View className="px-5 pb-2" style={{ paddingTop: insets.top + 8 }}>
        <Text style={{ fontSize: 24, fontWeight: "800", color: Colors.text }}>
          분석
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 120,
          paddingHorizontal: 20,
        }}
      >
        {!hasDiagnostic ? (
          <DiagnosticGate />
        ) : (
          <>
            <DktSection
              weak={profile?.weak ?? []}
              strong={profile?.strong ?? []}
              isLoading={profileLoading}
            />
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
          marginTop: 16,
          shadowColor: "#000",
          shadowOpacity: 0.05,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 2 },
          elevation: 2,
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
    <>
      <ConceptCard
        title="더 연습이 필요한 개념"
        subtitle="AI가 분석한 약점 개념이에요"
        icon="alert-circle-outline"
        iconColor={Colors.error}
        items={weak}
        barColor={Colors.error}
        emptyText="약점 개념이 없어요! 잘 하고 있어요 🎉"
      />
      <View style={{ height: 14 }} />
      <ConceptCard
        title="잘 하고 있는 개념"
        subtitle="AI가 분석한 강점 개념이에요"
        icon="star-circle-outline"
        iconColor={Colors.secondary}
        items={strong}
        barColor={Colors.primary}
        emptyText="학습 기록이 쌓이면 강점을 분석해 드릴게요"
      />
    </>
  );
}

function ConceptCard({
  title,
  subtitle,
  icon,
  iconColor,
  items,
  barColor,
  emptyText,
}: {
  title: string;
  subtitle: string;
  icon: string;
  iconColor: string;
  items: DiagnosticProfileItem[];
  barColor: string;
  emptyText: string;
}) {
  return (
    <View
      style={{
        backgroundColor: Colors.surface,
        borderRadius: 20,
        padding: 20,
        marginTop: 16,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
      }}
    >
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 3 }}
      >
        <MaterialCommunityIcons name={icon as any} size={20} color={iconColor} />
        <Text
          style={{
            fontSize: 15,
            fontWeight: "700",
            color: Colors.text,
            marginLeft: 6,
          }}
        >
          {title}
        </Text>
      </View>
      <Text
        style={{ fontSize: 12, color: Colors.textSecondary, marginBottom: 18 }}
      >
        {subtitle}
      </Text>

      {items.length === 0 ? (
        <Text
          style={{
            fontSize: 13,
            color: Colors.inactive,
            textAlign: "center",
            paddingVertical: 8,
          }}
        >
          {emptyText}
        </Text>
      ) : (
        <>
          {items.map((item, idx) => (
            <View key={item.conceptId} style={{ marginTop: idx > 0 ? 14 : 0 }}>
              <ConceptRow item={item} barColor={barColor} />
            </View>
          ))}
        </>
      )}
    </View>
  );
}

function ConceptRow({
  item,
  barColor,
}: {
  item: DiagnosticProfileItem;
  barColor: string;
}) {
  const pct = Math.round(item.probability * 100);
  return (
    <View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: 6,
        }}
      >
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text
            style={{ fontSize: 14, fontWeight: "600", color: Colors.text }}
            numberOfLines={1}
          >
            {item.conceptName}
          </Text>
          <Text
            style={{ fontSize: 11, color: Colors.textSecondary, marginTop: 1 }}
          >
            {item.grade}학년 {item.semester}학기
          </Text>
        </View>
        <Text style={{ fontSize: 13, fontWeight: "700", color: barColor }}>
          {pct}%
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
            width: `${pct}%`,
            backgroundColor: barColor,
            borderRadius: 3,
          }}
        />
      </View>
    </View>
  );
}

function StageSection({
  data,
  isLoading,
}: {
  data: StagesResponse | undefined;
  isLoading: boolean;
}) {
  return (
    <View
      style={{
        backgroundColor: Colors.surface,
        borderRadius: 20,
        padding: 20,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
      }}
    >
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 3 }}
      >
        <MaterialCommunityIcons
          name="map-marker-path"
          size={20}
          color={Colors.primary}
        />
        <Text
          style={{
            fontSize: 15,
            fontWeight: "700",
            color: Colors.text,
            marginLeft: 6,
          }}
        >
          학습 진도
        </Text>
      </View>
      <Text
        style={{ fontSize: 12, color: Colors.textSecondary, marginBottom: 18 }}
      >
        스테이지별 진행 현황이에요
      </Text>

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
    </View>
  );
}
