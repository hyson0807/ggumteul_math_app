import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuthStore } from "@/stores/useAuthStore";

const GRADES: { value: 1 | 2 | 3; label: string }[] = [
  { value: 1, label: "1학년" },
  { value: 2, label: "2학년" },
  { value: 3, label: "3학년" },
];

export default function SelectGradeScreen() {
  const router = useRouter();
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const [selected, setSelected] = useState<1 | 2 | 3 | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = async () => {
    if (!selected) return;
    setIsLoading(true);
    try {
      await updateProfile({ grade: selected });
      router.push("/(onboarding)/set-name");
    } catch {
      Alert.alert("오류", "저장에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#FFE2DE] px-6 justify-center items-center">
      <Text className="text-2xl font-bold text-[#5D4037] mb-2">
        몇 학년인가요?
      </Text>
      <Text className="text-base text-[#8D6E63] mb-10">
        학년에 맞는 문제를 풀 수 있어요
      </Text>

      <View className="w-full mb-12">
        {GRADES.map((g) => {
          const isSelected = selected === g.value;
          return (
            <TouchableOpacity
              key={g.value}
              className={`w-full h-20 rounded-2xl items-center justify-center mb-4 border-2 ${
                isSelected
                  ? "bg-[#FFF8F0] border-[#DAA520]"
                  : "bg-[#FFF8F0] border-[#F0D5C8]"
              }`}
              onPress={() => setSelected(g.value)}
              disabled={isLoading}
            >
              <View className="flex-row items-center">
                <MaterialCommunityIcons
                  name="school"
                  size={32}
                  color={isSelected ? "#DAA520" : "#CDAB8F"}
                />
                <Text
                  className={`text-xl font-bold ml-3 ${
                    isSelected ? "text-[#DAA520]" : "text-[#8D6E63]"
                  }`}
                >
                  {g.label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
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
