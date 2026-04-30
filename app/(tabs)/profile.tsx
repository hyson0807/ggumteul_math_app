import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useAuthStore } from "@/stores/useAuthStore";
import { WORM_STAGE_LABELS, MAX_WORM_STAGE } from "@/constants/worm";
import { WormSprite } from "@/components/worm/WormSprite";
import { useWorm } from "@/hooks/useWorm";
import { Colors } from "@/constants/colors";
import { formatJoinedDate, formatShortDate } from "@/utils/dateFormat";
import { ProgressBar } from "@/components/common/ProgressBar";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const { data: worm } = useWorm();

  const stage = Math.min(Math.max(user?.wormStage ?? 1, 1), MAX_WORM_STAGE);
  const stageLabel = WORM_STAGE_LABELS[stage];

  return (
    <View className="flex-1 bg-transparent">
      <View
        className="flex-row items-center justify-end px-5 pb-2"
        style={{ paddingTop: insets.top + 8 }}
      >
        <TouchableOpacity
          onPress={() => router.push("/settings")}
          className="w-10 h-10 items-center justify-center rounded-full bg-white/80 border border-village-border"
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="cog-outline"
            size={22}
            color={Colors.text}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingBottom: insets.bottom + 120,
          paddingHorizontal: 24,
        }}
      >
        <View className="items-center mt-2">
          <View
            className="rounded-full bg-village-surface items-center justify-center"
            style={{
              width: 120,
              height: 120,
              borderWidth: 4,
              borderColor: "#FFFFFF",
              shadowColor: "#000",
              shadowOpacity: 0.08,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 3 },
              elevation: 3,
            }}
          >
            <WormSprite equipped={worm?.equipped} size={0.7} />
          </View>

          <Text className="text-[20px] font-extrabold text-village-text mt-4">
            {user?.name ?? "이름 없음"}
          </Text>
          <Text className="text-sm text-village-text-secondary mt-1">
            {user?.grade ? `${user.grade}학년` : "학년 미설정"} · Lv.
            {user?.level ?? 1}
          </Text>
        </View>

        <View
          className="bg-village-surface mt-6"
          style={{
            borderRadius: 24,
            paddingHorizontal: 20,
            paddingVertical: 4,
            shadowColor: "#000",
            shadowOpacity: 0.05,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 2 },
            elevation: 2,
          }}
        >
          <StatRow label="단계" value={stageLabel} />
          <Divider />
          <StatRow label="모은 별" value={`${user?.stars ?? 0}`} />
          <Divider />
          <StatRow label="모은 코인" value={`${user?.coins ?? 0}`} />
          <Divider />
          <StatRow label="가입일" value={formatJoinedDate(user?.createdAt)} />
        </View>

        {user?.diagnosticCompletedAt && (
          <DiagnosticCard
            score={user.diagnosticScore ?? 0}
            grade={user.diagnosticGrade ?? null}
            completedAt={user.diagnosticCompletedAt}
            onPress={() => router.push("/diagnostic-result")}
          />
        )}
      </ScrollView>
    </View>
  );
}

const DIAGNOSTIC_TOTAL = 10;

function DiagnosticCard({
  score,
  grade,
  completedAt,
  onPress,
}: {
  score: number;
  grade: number | null;
  completedAt: string;
  onPress: () => void;
}) {
  const percent = Math.round((score / DIAGNOSTIC_TOTAL) * 100);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{
        marginTop: 16,
        borderRadius: 24,
        backgroundColor: Colors.surface,
        paddingHorizontal: 20,
        paddingVertical: 18,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 999,
              backgroundColor: Colors.primary,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MaterialCommunityIcons
              name="clipboard-check-outline"
              size={16}
              color="#fff"
            />
          </View>
          <Text
            style={{ fontSize: 15, fontWeight: "900", color: Colors.text }}
          >
            진단평가 결과
          </Text>
        </View>
        <MaterialCommunityIcons
          name="chevron-right"
          size={22}
          color={Colors.textSecondary}
        />
      </View>

      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-end",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "baseline", gap: 4 }}>
          <Text
            style={{ fontSize: 36, fontWeight: "900", color: Colors.primary }}
          >
            {score}
          </Text>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "800",
              color: Colors.textSecondary,
            }}
          >
            / {DIAGNOSTIC_TOTAL}
          </Text>
        </View>
        <Text
          style={{ fontSize: 13, fontWeight: "800", color: Colors.primary }}
        >
          정답률 {percent}%
        </Text>
      </View>

      <View style={{ marginBottom: 12 }}>
        <ProgressBar percent={percent} />
      </View>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
        }}
      >
        {grade != null && (
          <DiagnosticMeta
            icon="school-outline"
            text={`${grade}학년 응시`}
          />
        )}
        <DiagnosticMeta
          icon="calendar-blank-outline"
          text={formatShortDate(completedAt)}
        />
      </View>
    </TouchableOpacity>
  );
}

function DiagnosticMeta({
  icon,
  text,
}: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  text: string;
}) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
      <MaterialCommunityIcons
        name={icon}
        size={14}
        color={Colors.textSecondary}
      />
      <Text
        style={{
          fontSize: 12,
          fontWeight: "700",
          color: Colors.textSecondary,
        }}
      >
        {text}
      </Text>
    </View>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between py-3.5">
      <Text className="text-sm text-village-text-secondary">{label}</Text>
      <Text className="text-base font-bold text-village-text">{value}</Text>
    </View>
  );
}

function Divider() {
  return (
    <View
      style={{
        height: 1,
        backgroundColor: Colors.surfaceBorder,
        opacity: 0.6,
      }}
    />
  );
}
