import { View, Text, TouchableOpacity, Alert, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "@/stores/useAuthStore";
import { WORM_STAGE_LABELS, MAX_WORM_STAGE } from "@/constants/worm";
import { WormSprite } from "@/components/worm/WormSprite";
import { useWorm } from "@/hooks/useWorm";
import { Colors } from "@/constants/colors";

function formatJoinedDate(isoDate?: string) {
  if (!isoDate) return "-";
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return "-";
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout, deleteAccount } = useAuthStore();
  const { data: worm } = useWorm();

  const stage = Math.min(Math.max(user?.wormStage ?? 1, 1), MAX_WORM_STAGE);
  const stageLabel = WORM_STAGE_LABELS[stage];

  const handleLogout = async () => {
    await logout();
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "회원 탈퇴",
      "정말 탈퇴하시겠습니까? 모든 데이터가 삭제되며 복구할 수 없습니다.",
      [
        { text: "취소", style: "cancel" },
        {
          text: "탈퇴하기",
          style: "destructive",
          onPress: async () => {
            await deleteAccount();
          },
        },
      ],
    );
  };

  return (
    <ScrollView
      className="flex-1 bg-transparent"
      contentContainerStyle={{
        paddingTop: insets.top + 8,
        paddingBottom: insets.bottom + 120,
        paddingHorizontal: 24,
      }}
    >
      {/* 상단 아바타 */}
      <View className="items-center mt-4">
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
          <WormSprite
            equipped={worm?.equipped}
            size={0.7}
          />
        </View>

        <Text className="text-[20px] font-extrabold text-village-text mt-4">
          {user?.name ?? "이름 없음"}
        </Text>
        <Text className="text-sm text-village-text-secondary mt-1">
          {user?.grade ? `${user.grade}학년` : "학년 미설정"} · Lv.
          {user?.level ?? 1}
        </Text>
      </View>

      {/* 스탯 카드 */}
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

      {/* 로그아웃 */}
      <TouchableOpacity
        className="bg-village-surface mt-5 flex-row items-center justify-center"
        style={{
          borderRadius: 18,
          paddingVertical: 12,
          shadowColor: "#000",
          shadowOpacity: 0.04,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 2 },
          elevation: 1,
        }}
        onPress={handleLogout}
      >
        <MaterialCommunityIcons
          name="logout"
          size={18}
          color={Colors.textSecondary}
        />
        <Text className="text-village-text-secondary font-semibold ml-2 text-sm">
          로그아웃
        </Text>
      </TouchableOpacity>

      {/* 회원 탈퇴 */}
      <TouchableOpacity
        className="items-center mt-3 py-2"
        onPress={handleDeleteAccount}
      >
        <Text className="text-village-inactive text-xs">회원 탈퇴</Text>
      </TouchableOpacity>
    </ScrollView>
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
