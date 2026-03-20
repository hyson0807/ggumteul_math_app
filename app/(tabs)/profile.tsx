import { View, Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/stores/useAuthStore";

export default function ProfileScreen() {
  const router = useRouter();
  const { userEmail, userGrade, tutorName, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.replace("/");
  };

  return (
    <View className="flex-1 bg-transparent px-6 pt-4">
      <Text className="text-xl font-bold text-[#5D4037] mb-6">프로필</Text>

      {/* 사용자 정보 카드 */}
      <View className="bg-[#FFF8F0] rounded-2xl p-5 mb-4 items-center border border-[#F0D5C8]">
        <View className="w-20 h-20 rounded-full bg-transparent items-center justify-center mb-3">
          <MaterialCommunityIcons name="account-circle" size={40} color="#A0522D" />
        </View>
        <Text className="text-lg font-bold text-[#5D4037]">{userEmail}</Text>
        <Text className="text-sm text-[#8D6E63] mt-1">
          {userGrade}학년 · 튜터: {tutorName}
        </Text>
      </View>

      {/* 학습 통계 */}
      <View className="bg-[#FFF8F0] rounded-2xl p-5 mb-4 border border-[#F0D5C8]">
        <Text className="text-base font-semibold text-[#5D4037] mb-3">
          학습 통계
        </Text>
        <View className="flex-row justify-around">
          <View className="items-center">
            <Text className="text-2xl font-bold text-[#A0522D]">0</Text>
            <Text className="text-xs text-[#8D6E63]">풀이 수</Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-[#6B8E23]">0%</Text>
            <Text className="text-xs text-[#8D6E63]">정답률</Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-[#DAA520]">0일</Text>
            <Text className="text-xs text-[#8D6E63]">연속 학습</Text>
          </View>
        </View>
      </View>

      {/* 로그아웃 */}
      <TouchableOpacity
        className="bg-[#FFF8F0] rounded-2xl p-4 flex-row items-center justify-center border border-[#CD5C5C]"
        onPress={handleLogout}
      >
        <MaterialCommunityIcons name="logout" size={20} color="#CD5C5C" />
        <Text className="text-[#CD5C5C] font-semibold ml-2">로그아웃</Text>
      </TouchableOpacity>
    </View>
  );
}
