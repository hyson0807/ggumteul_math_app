import { View, Text } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function BagScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View
      className="flex-1 bg-transparent px-6"
      style={{
        paddingTop: insets.top + 16,
        paddingBottom: insets.bottom + 96,
      }}
    >
      <Text className="text-xl font-bold text-[#5D4037] mb-6">내 가방</Text>

      <View className="flex-1 items-center justify-center">
        <MaterialCommunityIcons name="treasure-chest-outline" size={80} color="#CDAB8F" />
        <Text className="text-lg text-[#8D6E63] mt-4">
          아직 아이템이 없어요
        </Text>
        <Text className="text-sm text-[#CDAB8F] mt-1">
          상점에서 건물과 장식을 구매해보세요
        </Text>
      </View>
    </View>
  );
}
