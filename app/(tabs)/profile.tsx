import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useAuthStore } from "@/stores/useAuthStore";
import { WORM_STAGE_LABELS, MAX_WORM_STAGE } from "@/constants/worm";
import { WormSprite } from "@/components/worm/WormSprite";
import { useWorm } from "@/hooks/useWorm";
import { Colors } from "@/constants/colors";
import { formatJoinedDate } from "@/utils/dateFormat";

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
          {user?.diagnosticCompletedAt && (
            <>
              <Divider />
              <LinkRow
                label="진단평가"
                value={`${user.diagnosticScore ?? 0} / 10`}
                onPress={() => router.push("/diagnostic-result")}
              />
            </>
          )}
        </View>
      </ScrollView>
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

function LinkRow({
  label,
  value,
  onPress,
}: {
  label: string;
  value: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center justify-between py-3.5"
    >
      <Text className="text-sm text-village-text-secondary">{label}</Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
        <Text className="text-base font-bold text-village-text">{value}</Text>
        <MaterialCommunityIcons
          name="chevron-right"
          size={18}
          color={Colors.textSecondary}
        />
      </View>
    </TouchableOpacity>
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
