import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuthStore } from "@/stores/useAuthStore";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("알림", "이메일과 비밀번호를 입력해주세요.");
      return;
    }
    clearError();
    try {
      await login(email, password);
      router.replace("/");
    } catch {}
  };

  return (
    <View className="flex-1 bg-[#FFE2DE] px-6 justify-center">
      <View className="items-center mb-2">
        <MaterialCommunityIcons name="home-group" size={48} color="#8B6914" />
      </View>
      <Text className="text-3xl font-bold text-center text-[#8B6914] mb-2">
        수학마을
      </Text>
      <Text className="text-base text-center text-[#8D6E63] mb-10">
        수학으로 마을을 꾸며보세요!
      </Text>

      {error && (
        <View className="bg-[#FDECEA] rounded-xl px-4 py-3 mb-4">
          <Text className="text-[#CD5C5C] text-sm text-center">{error}</Text>
        </View>
      )}

      <Text className="text-sm font-semibold text-[#5D4037] mb-1">이메일</Text>
      <TextInput
        className="bg-[#FFF8F0] rounded-xl px-4 py-3 mb-4 text-base border border-[#F0D5C8]"
        placeholder="이메일을 입력하세요"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!isLoading}
      />

      <Text className="text-sm font-semibold text-[#5D4037] mb-1">
        비밀번호
      </Text>
      <TextInput
        className="bg-[#FFF8F0] rounded-xl px-4 py-3 mb-6 text-base border border-[#F0D5C8]"
        placeholder="비밀번호를 입력하세요"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!isLoading}
      />

      <TouchableOpacity
        className={`rounded-xl py-4 items-center mb-4 ${isLoading ? "bg-[#CDAB8F]" : "bg-[#A0522D]"}`}
        onPress={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white text-lg font-bold">로그인</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        className="items-center py-2"
        onPress={() => router.push("/(auth)/register")}
        disabled={isLoading}
      >
        <Text className="text-[#A0522D] text-base">
          계정이 없으신가요? <Text className="font-bold">회원가입</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}
