import { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuthStore } from "@/stores/useAuthStore";
import { HOME_ROUTE, nextOnboardingRoute } from "@/utils/onboarding";

export default function SelectTutorScreen() {
  const router = useRouter();
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const [selected, setSelected] = useState<"cat" | "rabbit" | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = async () => {
    if (!selected) return;
    setIsLoading(true);
    try {
      const updated = await updateProfile({ tutorType: selected });
      router.replace(nextOnboardingRoute(updated) ?? HOME_ROUTE);
    } catch {
      Alert.alert("오류", "저장에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#FFE2DE] px-6 justify-center items-center">
      <Text className="text-2xl font-bold text-[#5D4037] mb-2">
        나의 튜터를 골라주세요!
      </Text>
      <Text className="text-base text-[#8D6E63] mb-10">
        함께 수학 공부할 친구를 선택하세요
      </Text>

      <View className="flex-row gap-6 mb-12">
        <TouchableOpacity
          className={`w-36 h-44 rounded-2xl items-center justify-center border-3 ${
            selected === "cat"
              ? "bg-[#FFF8F0] border-[#DAA520]"
              : "bg-[#FFF8F0] border-[#F0D5C8]"
          }`}
          onPress={() => setSelected("cat")}
          disabled={isLoading}
        >
          <MaterialCommunityIcons
            name="cat"
            size={60}
            color={selected === "cat" ? "#DAA520" : "#CDAB8F"}
          />
          <Text
            className={`text-lg font-bold mt-3 ${
              selected === "cat" ? "text-[#DAA520]" : "text-[#8D6E63]"
            }`}
          >
            고양이
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`w-36 h-44 rounded-2xl items-center justify-center border-3 ${
            selected === "rabbit"
              ? "bg-[#FFF8F0] border-[#6B8E23]"
              : "bg-[#FFF8F0] border-[#F0D5C8]"
          }`}
          onPress={() => setSelected("rabbit")}
          disabled={isLoading}
        >
          <MaterialCommunityIcons
            name="rabbit"
            size={60}
            color={selected === "rabbit" ? "#6B8E23" : "#CDAB8F"}
          />
          <Text
            className={`text-lg font-bold mt-3 ${
              selected === "rabbit" ? "text-[#6B8E23]" : "text-[#8D6E63]"
            }`}
          >
            토끼
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        className={`w-full py-4 rounded-xl items-center ${
          selected && !isLoading ? "bg-[#A0522D]" : "bg-[#CDAB8F]"
        }`}
        onPress={handleNext}
        disabled={!selected || isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white text-lg font-bold">다음</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
