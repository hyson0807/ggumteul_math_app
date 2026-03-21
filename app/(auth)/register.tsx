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
import { useAuthStore } from "@/stores/useAuthStore";

const GRADES = [1, 2, 3];

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedGrade, setSelectedGrade] = useState<number>(1);
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();

  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert("알림", "이메일과 비밀번호를 입력해주세요.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("알림", "비밀번호는 6자 이상이어야 합니다.");
      return;
    }
    clearError();
    try {
      await register(email, password, selectedGrade);
    } catch {}
  };

  return (
    <View className="flex-1 bg-[#FFE2DE] px-6 justify-center">
      <Text className="text-2xl font-bold text-center text-[#8B6914] mb-8">
        회원가입
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
        className="bg-[#FFF8F0] rounded-xl px-4 py-3 mb-4 text-base border border-[#F0D5C8]"
        placeholder="비밀번호를 입력하세요 (6자 이상)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!isLoading}
      />

      <Text className="text-sm font-semibold text-[#5D4037] mb-2">
        학년 선택
      </Text>
      <View className="flex-row gap-3 mb-8">
        {GRADES.map((grade) => (
          <TouchableOpacity
            key={grade}
            className={`flex-1 py-3 rounded-xl items-center border-2 ${
              selectedGrade === grade
                ? "bg-[#A0522D] border-[#A0522D]"
                : "bg-[#FFF8F0] border-[#F0D5C8]"
            }`}
            onPress={() => setSelectedGrade(grade)}
            disabled={isLoading}
          >
            <Text
              className={`text-lg font-bold ${
                selectedGrade === grade ? "text-white" : "text-[#5D4037]"
              }`}
            >
              {grade}학년
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        className={`rounded-xl py-4 items-center mb-4 ${isLoading ? "bg-[#CDAB8F]" : "bg-[#A0522D]"}`}
        onPress={handleRegister}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white text-lg font-bold">가입하기</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        className="items-center py-2"
        onPress={() => router.push("/(auth)/login")}
        disabled={isLoading}
      >
        <Text className="text-[#A0522D] text-base">
          이미 계정이 있으신가요? <Text className="font-bold">로그인</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}
