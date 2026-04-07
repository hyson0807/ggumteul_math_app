import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CONCEPTS = [
  { id: "1", name: "덧셈", icon: "plus-circle" as const, color: "#6B8E23", progress: "0/10" },
  { id: "2", name: "뺄셈", icon: "minus-circle" as const, color: "#CD5C5C", progress: "0/10" },
  { id: "3", name: "곱셈", icon: "close-circle" as const, color: "#DAA520", progress: "0/10" },
  { id: "4", name: "나눗셈", icon: "division" as const, color: "#A0522D", progress: "0/10" },
];

export default function MathScreen() {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      className="flex-1 bg-transparent px-6"
      contentContainerStyle={{
        paddingTop: insets.top + 16,
        paddingBottom: insets.bottom + 96,
      }}
    >
      <Text className="text-xl font-bold text-[#5D4037] mb-6">
        개념별 문제
      </Text>

      {CONCEPTS.map((concept) => (
        <TouchableOpacity
          key={concept.id}
          className="bg-[#FFF8F0] rounded-2xl p-4 mb-3 flex-row items-center border border-[#F0D5C8]"
        >
          <View
            className="w-12 h-12 rounded-xl items-center justify-center mr-4"
            style={{ backgroundColor: concept.color + "20" }}
          >
            <MaterialCommunityIcons name={concept.icon} size={28} color={concept.color} />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-semibold text-[#5D4037]">
              {concept.name}
            </Text>
            <Text className="text-sm text-[#8D6E63]">
              진행률: {concept.progress}
            </Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={20} color="#CDAB8F" />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
