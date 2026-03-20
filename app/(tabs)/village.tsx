import { View, Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuthStore } from "@/stores/useAuthStore";

const BUILDINGS = [
  { name: "집", icon: "home" as const, color: "#A0522D" },
  { name: "학교", icon: "school" as const, color: "#6B8E23" },
  { name: "공원", icon: "tree" as const, color: "#DAA520" },
  { name: "상점", icon: "store" as const, color: "#CD5C5C" },
];

export default function VillageScreen() {
  const { tutorName } = useAuthStore();

  return (
    <View className="flex-1 bg-transparent px-6 pt-4">
      {/* 유저 정보 바 */}
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg font-bold text-[#5D4037]">
          {tutorName}의 마을
        </Text>
        <View className="flex-row gap-3">
          <View className="flex-row items-center bg-[#FFF8F0] rounded-full px-3 py-1">
            <MaterialCommunityIcons name="star" size={18} color="#FFD700" />
            <Text className="text-sm font-semibold text-[#5D4037] ml-1">0</Text>
          </View>
          <View className="flex-row items-center bg-[#FFF8F0] rounded-full px-3 py-1">
            <MaterialCommunityIcons name="circle" size={14} color="#DAA520" />
            <Text className="text-sm font-semibold text-[#5D4037] ml-1">0</Text>
          </View>
        </View>
      </View>

      {/* 마을 맵 - 2x2 건물 그리드 */}
      <View className="flex-1 mb-4">
        <View className="flex-row flex-wrap gap-3 justify-between">
          {BUILDINGS.map((building) => (
            <View
              key={building.name}
              className="w-[48%] bg-[#FFF8F0] rounded-2xl p-4 items-center border border-[#F0D5C8]"
            >
              <View className="w-16 h-16 rounded-full bg-transparent items-center justify-center mb-2">
                <MaterialCommunityIcons
                  name={building.icon}
                  size={36}
                  color={building.color}
                />
              </View>
              <Text className="text-base font-semibold text-[#5D4037]">
                {building.name}
              </Text>
              <View className="bg-[#A0522D] rounded-full px-2 py-0.5 mt-1">
                <Text className="text-xs text-white font-bold">Lv.1</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* 하단: 학습 진행도 + CTA */}
      <View className="bg-[#FFF8F0] rounded-2xl p-4 mb-3 border border-[#F0D5C8]">
        <Text className="text-sm text-[#8D6E63] mb-2">오늘의 학습</Text>
        <View className="bg-[#F0D5C8] rounded-full h-3 mb-2">
          <View className="bg-[#6B8E23] rounded-full h-3 w-0" />
        </View>
        <Text className="text-xs text-[#CDAB8F]">0 / 5 문제 완료</Text>
      </View>

      <TouchableOpacity className="bg-[#C0392B] rounded-2xl py-4 items-center mb-6">
        <Text className="text-white text-lg font-bold">문제 풀러 가기!</Text>
      </TouchableOpacity>
    </View>
  );
}
