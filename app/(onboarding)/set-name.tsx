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
import { useAuthStore } from "@/stores/useAuthStore";
import { WormSprite } from "@/components/worm/WormSprite";
import { HOME_ROUTE, nextOnboardingRoute } from "@/utils/onboarding";

export default function SetNameScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const [name, setName] = useState(user?.name ?? "");
  const [isLoading, setIsLoading] = useState(false);

  const handleComplete = async () => {
    if (!name.trim()) return;
    setIsLoading(true);
    try {
      const updated = await updateProfile({ name: name.trim() });
      router.replace(nextOnboardingRoute(updated) ?? HOME_ROUTE);
    } catch {
      Alert.alert("오류", "저장에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#F6FAF8] px-6 justify-center items-center">
      <WormSprite size={0.7} />
      <Text className="text-2xl font-bold text-[#1F2A26] mt-4 mb-2">
        이름을 알려주세요!
      </Text>
      <Text className="text-base text-[#5F6E68] mb-8">
        지렁이 친구에게 불러줄 이름을 입력해주세요
      </Text>

      <TextInput
        className="w-full bg-white rounded-xl px-4 py-3 mb-8 text-lg text-center border border-[#E2EBE6]"
        placeholder="이름을 입력하세요"
        value={name}
        onChangeText={setName}
        maxLength={10}
        editable={!isLoading}
      />

      <TouchableOpacity
        className={`w-full py-4 rounded-xl items-center ${
          name.trim() && !isLoading ? "bg-[#3F8F6B]" : "bg-[#9FB2AA]"
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
