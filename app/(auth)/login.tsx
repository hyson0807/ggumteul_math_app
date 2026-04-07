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
import Svg, { Path } from "react-native-svg";
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

const GoogleGLogo = ({ size = 26 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <Path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <Path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      fill="#FBBC05"
    />
    <Path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </Svg>
);

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

  const handleForgotPassword = () => {
    Alert.alert("알림", "비밀번호 찾기는 준비 중입니다.");
  };

  return (
    <View className="flex-1 bg-[#FFE2DE] px-6 justify-center">
      {/* 로고 */}
      <View className="items-center mb-2">
        <MaterialCommunityIcons name="home-group" size={56} color="#8B6914" />
      </View>
      <Text className="text-3xl font-bold text-center text-[#8B6914]">
        수학마을
      </Text>
      <Text className="text-base text-center text-[#8D6E63] mb-8">
        수학으로 마을을 꾸며보세요!
      </Text>

      {/* 헤더 */}
      <Text className="text-2xl font-bold text-center text-[#5D4037] mb-6">
        로그인
      </Text>

      {error && (
        <View className="bg-[#FDECEA] rounded-xl px-4 py-3 mb-3">
          <Text className="text-[#CD5C5C] text-sm text-center">{error}</Text>
        </View>
      )}

      {/* 입력 필드 */}
      <TextInput
        className="bg-[#FFF8F0] rounded-full px-5 py-4 mb-3 text-base border border-[#F0D5C8]"
        placeholder="이메일"
        placeholderTextColor="#CDAB8F"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!isLoading}
      />
      <TextInput
        className="bg-[#FFF8F0] rounded-full px-5 py-4 mb-5 text-base border border-[#F0D5C8]"
        placeholder="비밀번호"
        placeholderTextColor="#CDAB8F"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!isLoading}
      />

      {/* 메인 버튼 */}
      <TouchableOpacity
        className={`rounded-full py-4 items-center ${isLoading ? "bg-[#CDAB8F]" : "bg-[#A0522D]"}`}
        onPress={handleLogin}
        disabled={isLoading}
        activeOpacity={0.8}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white text-lg font-bold">로그인</Text>
        )}
      </TouchableOpacity>

      {/* 또는 구분선 */}
      <Text className="text-center text-sm text-[#8D6E63] mt-6 mb-3">또는</Text>

      {/* 원형 소셜 버튼 */}
      <View className="flex-row justify-center items-center gap-6 mb-5">
        {Platform.OS === "ios" && appleAvailable && (
          <TouchableOpacity
            className="w-14 h-14 rounded-full bg-black items-center justify-center"
            onPress={handleApple}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Ionicons name="logo-apple" size={28} color="#fff" />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          className="w-14 h-14 rounded-full bg-white border border-[#F0D5C8] items-center justify-center"
          onPress={handleGoogle}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          <GoogleGLogo size={26} />
        </TouchableOpacity>
      </View>

      {/* 회원가입 | 비밀번호 찾기 */}
      <View className="flex-row justify-center items-center mb-5">
        <TouchableOpacity
          onPress={() => router.push("/(auth)/register")}
          disabled={isLoading}
        >
          <Text className="text-[#5D4037] text-sm underline">회원가입</Text>
        </TouchableOpacity>
        <Text className="text-[#CDAB8F] mx-3">|</Text>
        <TouchableOpacity onPress={handleForgotPassword} disabled={isLoading}>
          <Text className="text-[#5D4037] text-sm underline">비밀번호 찾기</Text>
        </TouchableOpacity>
      </View>

      {/* 약관 안내 */}
      <View className="border-t border-[#F0D5C8] pt-4">
        <Text className="text-center text-xs text-[#8D6E63] leading-5">
          로그인 시 <Text className="underline">이용약관</Text>과{"\n"}
          <Text className="underline">개인정보처리방침</Text>에 동의한 것으로
          간주합니다.
        </Text>
      </View>
    </View>
  );
}
