import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuthStore } from "@/stores/useAuthStore";

export default function SetNameScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const [name, setName] = useState(user?.name ?? "");
  const [isLoading, setIsLoading] = useState(false);

  const tutorType = user?.tutorType;
  const icon = tutorType === "cat" ? "cat" : "rabbit";
  const color = tutorType === "cat" ? "#DAA520" : "#6B8E23";

  const handleComplete = async () => {
    if (!name.trim()) return;
    setIsLoading(true);
    try {
      await updateProfile({ name: name.trim() });
      router.replace("/(tabs)/home");
    } catch {
      Alert.alert("오류", "저장에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#FFE2DE] px-6 justify-center items-center">
      <MaterialCommunityIcons name={icon} size={80} color={color} />
      <Text className="text-2xl font-bold text-[#5D4037] mt-4 mb-2">
        이름을 알려주세요!
      </Text>
      <Text className="text-base text-[#8D6E63] mb-8">
        지렁이 친구에게 불러줄 이름을 입력해주세요
      </Text>

      <TextInput
        className="w-full bg-[#FFF8F0] rounded-xl px-4 py-3 mb-8 text-lg text-center border border-[#F0D5C8]"
        placeholder="이름을 입력하세요"
        value={name}
        onChangeText={setName}
        maxLength={10}
        editable={!isLoading}
      />

      <TouchableOpacity
        className={`w-full py-4 rounded-xl items-center ${
          name.trim() && !isLoading ? "bg-[#A0522D]" : "bg-[#CDAB8F]"
        }`}
        onPress={handleComplete}
        disabled={!name.trim() || isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white text-lg font-bold">
            완료! 모험 시작하기
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
