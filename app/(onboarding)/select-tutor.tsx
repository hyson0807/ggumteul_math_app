import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuthStore } from "@/stores/useAuthStore";

export default function SelectTutorScreen() {
  const router = useRouter();
  const { tutorType, selectTutor } = useAuthStore();

  const handleNext = () => {
    if (!tutorType) return;
    router.push("/(onboarding)/set-name");
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
            tutorType === "cat"
              ? "bg-[#FFF8F0] border-[#DAA520]"
              : "bg-[#FFF8F0] border-[#F0D5C8]"
          }`}
          onPress={() => selectTutor("cat")}
        >
          <MaterialCommunityIcons
            name="cat"
            size={60}
            color={tutorType === "cat" ? "#DAA520" : "#CDAB8F"}
          />
          <Text
            className={`text-lg font-bold mt-3 ${
              tutorType === "cat" ? "text-[#DAA520]" : "text-[#8D6E63]"
            }`}
          >
            고양이
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`w-36 h-44 rounded-2xl items-center justify-center border-3 ${
            tutorType === "rabbit"
              ? "bg-[#FFF8F0] border-[#6B8E23]"
              : "bg-[#FFF8F0] border-[#F0D5C8]"
          }`}
          onPress={() => selectTutor("rabbit")}
        >
          <MaterialCommunityIcons
            name="rabbit"
            size={60}
            color={tutorType === "rabbit" ? "#6B8E23" : "#CDAB8F"}
          />
          <Text
            className={`text-lg font-bold mt-3 ${
              tutorType === "rabbit" ? "text-[#6B8E23]" : "text-[#8D6E63]"
            }`}
          >
            토끼
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        className={`w-full py-4 rounded-xl items-center ${
          tutorType ? "bg-[#A0522D]" : "bg-[#CDAB8F]"
        }`}
        onPress={handleNext}
        disabled={!tutorType}
      >
        <Text className="text-white text-lg font-bold">다음</Text>
      </TouchableOpacity>
    </View>
  );
}
