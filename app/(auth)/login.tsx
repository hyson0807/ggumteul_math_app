import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import * as AppleAuthentication from "expo-apple-authentication";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { useAuthStore } from "@/stores/useAuthStore";

GoogleSignin.configure({
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
});

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { login, googleSignIn, appleSignIn, isLoading, error, clearError } =
    useAuthStore();
  const [appleAvailable, setAppleAvailable] = useState(false);

  useEffect(() => {
    if (Platform.OS === "ios") {
      AppleAuthentication.isAvailableAsync().then(setAppleAvailable);
    }
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("알림", "이메일과 비밀번호를 입력해주세요.");
      return;
    }
    clearError();
    try {
      await login(email, password);
    } catch {}
  };

  const handleGoogle = async () => {
    clearError();
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      const idToken = response.data?.idToken;
      if (!idToken) {
        Alert.alert("알림", "Google 인증에 실패했습니다.");
        return;
      }
      await googleSignIn(idToken);
    } catch (e: unknown) {
      if (
        typeof e === "object" &&
        e !== null &&
        "code" in e &&
        (e as { code: string }).code === statusCodes.SIGN_IN_CANCELLED
      ) {
        return;
      }
    }
  };

  const handleApple = async () => {
    clearError();
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (!credential.identityToken) {
        Alert.alert("알림", "Apple 인증에 실패했습니다.");
        return;
      }
      const fullName =
        [credential.fullName?.givenName, credential.fullName?.familyName]
          .filter(Boolean)
          .join(" ") || undefined;
      await appleSignIn({
        identityToken: credential.identityToken,
        fullName,
        email: credential.email ?? undefined,
      });
    } catch (e: unknown) {
      if (
        typeof e === "object" &&
        e !== null &&
        "code" in e &&
        (e as { code: string }).code === "ERR_REQUEST_CANCELED"
      ) {
        return;
      }
    }
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

      <View className="flex-row items-center my-5">
        <View className="flex-1 h-px bg-[#F0D5C8]" />
        <Text className="mx-3 text-xs text-[#8D6E63]">또는</Text>
        <View className="flex-1 h-px bg-[#F0D5C8]" />
      </View>

      <TouchableOpacity
        className="bg-white border border-[#F0D5C8] rounded-xl py-3 flex-row items-center justify-center mb-3"
        onPress={handleGoogle}
        disabled={isLoading}
        activeOpacity={0.8}
      >
        <Ionicons name="logo-google" size={18} color="#5D4037" />
        <Text className="ml-2 text-[#5D4037] text-base font-semibold">
          Google로 계속하기
        </Text>
      </TouchableOpacity>

      {Platform.OS === "ios" && appleAvailable && (
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={
            AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN
          }
          buttonStyle={
            AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
          }
          cornerRadius={12}
          style={{ height: 48 }}
          onPress={handleApple}
        />
      )}
    </View>
  );
}
