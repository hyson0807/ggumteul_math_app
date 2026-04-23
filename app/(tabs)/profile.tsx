import { View, Text, TouchableOpacity, Alert, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "@/stores/useAuthStore";
import { WORM_STAGE_LABELS } from "@/constants/worm";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout, deleteAccount } = useAuthStore();

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
      className="flex-1 bg-transparent px-6"
      contentContainerStyle={{
        paddingTop: insets.top + 16,
        paddingBottom: insets.bottom + 96,
      }}
    >
      <Text className="text-xl font-bold text-[#5D4037] mb-6">프로필</Text>

      {/* 사용자 정보 카드 */}
      <View className="bg-[#FFF8F0] rounded-2xl p-5 mb-4 items-center border border-[#F0D5C8]">
        <View className="w-20 h-20 rounded-full bg-transparent items-center justify-center mb-3">
          <MaterialCommunityIcons
            name="account-circle"
            size={40}
            color="#A0522D"
          />
        </View>
        <Text className="text-lg font-bold text-[#5D4037]">
          {user?.name ?? user?.email}
        </Text>
        <Text className="text-sm text-[#8D6E63] mt-1">
          {user?.grade}학년 · Lv.{user?.level}
        </Text>
      </View>

      {/* 지렁이 진행도 */}
      <View className="bg-[#FFF8F0] rounded-2xl p-5 mb-4 border border-[#F0D5C8]">
        <Text className="text-base font-semibold text-[#5D4037] mb-3">
          지렁이 진행도
        </Text>
        <View className="flex-row justify-around">
          <View className="items-center">
            <Text className="text-2xl font-bold text-[#A0522D]">
              Lv.{user?.wormStage ?? 1}
            </Text>
            <Text className="text-xs text-[#8D6E63]">
              {WORM_STAGE_LABELS[user?.wormStage ?? 1]}
            </Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-[#6B8E23]">
              {user?.wormProgress ?? 0}
            </Text>
            <Text className="text-xs text-[#8D6E63]">이번 단계 진행</Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-[#DAA520]">
              {user?.coins ?? 0}
            </Text>
            <Text className="text-xs text-[#8D6E63]">보유 코인</Text>
          </View>
        </View>
      </View>

      {/* 로그아웃 */}
      <TouchableOpacity
        className="bg-[#FFF8F0] rounded-2xl p-4 flex-row items-center justify-center border border-[#F0D5C8] mb-3"
        onPress={handleLogout}
      >
        <MaterialCommunityIcons name="logout" size={20} color="#8D6E63" />
        <Text className="text-[#8D6E63] font-semibold ml-2">로그아웃</Text>
      </TouchableOpacity>

      {/* 회원 탈퇴 */}
      <TouchableOpacity
        className="rounded-2xl p-4 flex-row items-center justify-center"
        onPress={handleDeleteAccount}
      >
        <Text className="text-[#CDAB8F] text-sm">회원 탈퇴</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
