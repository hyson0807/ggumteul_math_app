import { View, Text, ImageBackground } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuthStore } from "@/stores/useAuthStore";

const BUILDINGS = [
  { name: "집", icon: "home" as const, color: "#A0522D" },
  { name: "학교", icon: "school" as const, color: "#6B8E23" },
  { name: "공원", icon: "tree" as const, color: "#DAA520" },
  { name: "상점", icon: "store" as const, color: "#CD5C5C" },
];

export default function VillageScreen() {
  const user = useAuthStore((s) => s.user);

  return (
    <View className="flex-1 p-2">
      <ImageBackground
        source={require("@/assets/images/village.png")}
        className="flex-1"
        imageStyle={{ borderRadius: 16 }}
        resizeMode="cover"
      >
      <View className="flex-1 bg-transparent px-4 pt-4">
      {/* 유저 정보 바 */}
      <View className="flex-row items-center bg-white/90 rounded-2xl px-4 py-2 mb-4 border border-[#E8D5C4]">
        {/* 아바타 */}
        <View className="w-8 h-8 rounded-full bg-[#FFE0B2] items-center justify-center">
          <MaterialCommunityIcons name="account" size={20} color="#8D6E63" />
        </View>
        {/* 이름 */}
        <Text className="text-sm font-bold text-[#5D4037] ml-2">
          {user?.name ?? "마을"}
        </Text>
        {/* 구분선 */}
        <View className="w-[1px] h-4 bg-[#D4C4B0] mx-3" />
        {/* 별 */}
        <Text className="text-xs text-[#8D6E63]">별 획득: </Text>
        <Text className="text-xs font-bold text-[#5D4037]">{user?.stars ?? 0}</Text>
        <MaterialCommunityIcons name="star" size={16} color="#FFD700" style={{ marginLeft: 2 }} />
        {/* 코인 */}
        <Text className="text-xs text-[#8D6E63] ml-3">코인: </Text>
        <Text className="text-xs font-bold text-[#5D4037]">{user?.coins ?? 0}</Text>
        <MaterialCommunityIcons name="circle" size={14} color="#DAA520" style={{ marginLeft: 2 }} />
      </View>

      {/* 마을 맵 - 2x2 건물 그리드 */}
      <View className="flex-1 mb-4 mt-20">
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

      </View>
      </ImageBackground>
    </View>
  );
}
