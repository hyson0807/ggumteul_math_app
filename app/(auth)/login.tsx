import { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  Animated,
  Easing,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Svg, {
  Circle,
  Defs,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";
import * as AppleAuthentication from "expo-apple-authentication";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { useAuthStore } from "@/stores/useAuthStore";
import { feedback } from "@/utils/feedback";

GoogleSignin.configure({
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
});

const COLORS = {
  gradTop: "#2A1810",
  gradMid: "#1A0F08",
  gradBottom: "#0A0604",
  cream: "#F5E6DD",
  creamAccent: "#FFE2DE",
  subCopy: "#C8AA9C",
  mute: "#A68C80",
  placeholder: "#8A7066",
  cardBg: "rgba(42,24,16,0.72)",
  cardBorder: "rgba(218,165,32,0.35)",
  inputBg: "rgba(0,0,0,0.35)",
  inputBorder: "rgba(255,226,222,0.2)",
  tabTrack: "rgba(0,0,0,0.35)",
  tabTrackBorder: "rgba(218,165,32,0.2)",
  divider: "rgba(218,165,32,0.25)",
  dark: "#2A1810",
  shadowDark: "rgba(122,62,32,0.6)",
  shadowSocial: "rgba(122,62,32,0.55)",
  gold: "#DAA520",
  errorBg: "rgba(205,92,92,0.18)",
  errorBorder: "rgba(205,92,92,0.5)",
  errorText: "#FFD6D2",
};

type Mode = "login" | "signup";

// ───────────────────────────────────────────────────────────
// Floating math background (cool palette — worm / underground)
// ───────────────────────────────────────────────────────────
type FloatingItem = {
  char: string;
  left: string;
  top: string;
  size: number;
  color: string;
  duration: number;
  delay: number;
  range: number;
};

const FLOATING_ITEMS: FloatingItem[] = [
  { char: "+", left: "6%", top: "7%", size: 44, color: "#FFFFFF", duration: 4200, delay: 0, range: 14 },
  { char: "3", left: "84%", top: "9%", size: 48, color: "#E8C860", duration: 5200, delay: 600, range: 18 },
  { char: "×", left: "70%", top: "26%", size: 34, color: "#FFFFFF", duration: 4600, delay: 1200, range: 14 },
  { char: "7", left: "4%", top: "32%", size: 40, color: "#E8C860", duration: 5000, delay: 300, range: 16 },
  { char: "−", left: "88%", top: "44%", size: 42, color: "#FFFFFF", duration: 4400, delay: 900, range: 16 },
  { char: "5", left: "10%", top: "54%", size: 36, color: "#E8C860", duration: 5400, delay: 200, range: 18 },
  { char: "÷", left: "80%", top: "66%", size: 38, color: "#FFFFFF", duration: 4800, delay: 1500, range: 14 },
  { char: "9", left: "3%", top: "76%", size: 44, color: "#E8C860", duration: 5200, delay: 700, range: 16 },
  { char: "=", left: "84%", top: "85%", size: 32, color: "#FFFFFF", duration: 4500, delay: 1100, range: 12 },
  { char: "2", left: "22%", top: "92%", size: 38, color: "#E8C860", duration: 5100, delay: 400, range: 16 },
];

function FloatingMathItem({ item }: { item: FloatingItem }) {
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let mounted = true;
    const start = () => {
      if (!mounted) return;
      Animated.loop(
        Animated.sequence([
          Animated.timing(translateY, {
            toValue: -item.range,
            duration: item.duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: item.range,
            duration: item.duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ).start();
    };
    const t = setTimeout(start, item.delay);
    return () => {
      mounted = false;
      clearTimeout(t);
    };
  }, [translateY, item.duration, item.delay, item.range]);

  return (
    <Animated.Text
      style={{
        position: "absolute",
        left: item.left as `${number}%`,
        top: item.top as `${number}%`,
        fontSize: item.size,
        color: item.color,
        opacity: 0.16,
        fontWeight: "900",
        transform: [{ translateY }],
      }}
    >
      {item.char}
    </Animated.Text>
  );
}

function FloatingMathBackground() {
  return (
    <View
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
    >
      {FLOATING_ITEMS.map((item, idx) => (
        <FloatingMathItem key={idx} item={item} />
      ))}
    </View>
  );
}

// ───────────────────────────────────────────────────────────
// Twinkling stars
// ───────────────────────────────────────────────────────────
const STARS = Array.from({ length: 14 }).map((_, i) => ({
  leftPct: (i * 37) % 100,
  topPct: 6 + ((i * 53) % 78),
  gold: i % 3 === 0,
  twinkleDur: 2000 + (i % 3) * 1000,
  delay: i * 200,
}));

function Star({
  leftPct,
  topPct,
  gold,
  twinkleDur,
  delay,
}: (typeof STARS)[number]) {
  const opacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    let mounted = true;
    const start = () => {
      if (!mounted) return;
      Animated.loop(
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 1,
            duration: twinkleDur / 2,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.35,
            duration: twinkleDur / 2,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ).start();
    };
    const t = setTimeout(start, delay);
    return () => {
      mounted = false;
      clearTimeout(t);
    };
  }, [opacity, twinkleDur, delay]);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: `${leftPct}%`,
        top: `${topPct}%`,
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: gold ? "#DAA520" : "#F5E6DD",
        opacity,
        shadowColor: gold ? "#DAA520" : "#FFFFFF",
        shadowOpacity: 0.9,
        shadowRadius: gold ? 6 : 4,
        shadowOffset: { width: 0, height: 0 },
      }}
    />
  );
}

// ───────────────────────────────────────────────────────────
// Gold halo (radial) with slow floaty motion
// ───────────────────────────────────────────────────────────
function GoldHalo({ top }: { top: number }) {
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: -8,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [translateY]);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        top,
        left: 0,
        right: 0,
        alignItems: "center",
        transform: [{ translateY }],
      }}
    >
      <Svg width={360} height={360}>
        <Defs>
          <RadialGradient id="halo" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <Stop offset="0%" stopColor="#DAA520" stopOpacity={0.27} />
            <Stop offset="65%" stopColor="#DAA520" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={180} cy={180} r={180} fill="url(#halo)" />
      </Svg>
    </Animated.View>
  );
}

// ───────────────────────────────────────────────────────────
// Social logos
// ───────────────────────────────────────────────────────────
const GoogleGLogo = ({ size = 18 }: { size?: number }) => (
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

// ───────────────────────────────────────────────────────────
// Field icons
// ───────────────────────────────────────────────────────────
function MailIcon({ color = COLORS.placeholder }: { color?: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Rect
        x={3}
        y={5}
        width={18}
        height={14}
        rx={2}
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <Path
        d="m3 7 9 6 9-6"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function LockIcon({ color = COLORS.placeholder }: { color?: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Rect
        x={4}
        y={11}
        width={16}
        height={10}
        rx={2}
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <Path
        d="M8 11V7a4 4 0 0 1 8 0v4"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ───────────────────────────────────────────────────────────
// Screen
// ───────────────────────────────────────────────────────────
export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [focus, setFocus] = useState<"email" | "pw" | null>(null);
  const [mode, setMode] = useState<Mode>("login");
  const {
    login,
    register,
    googleSignIn,
    appleSignIn,
    isLoading,
    error,
    clearError,
  } = useAuthStore();
  const [appleAvailable, setAppleAvailable] = useState(false);

  useEffect(() => {
    if (Platform.OS === "ios") {
      AppleAuthentication.isAvailableAsync().then(setAppleAvailable);
    }
  }, []);

  const switchMode = (next: Mode) => {
    if (next === mode) return;
    feedback.tabPress();
    setMode(next);
    clearError();
  };

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert("알림", "이메일과 비밀번호를 입력해주세요.");
      return;
    }
    if (mode === "signup" && password.length < 8) {
      Alert.alert("알림", "비밀번호는 8자 이상이어야 합니다.");
      return;
    }
    clearError();
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(email, password);
      }
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

  const headlineTop = useMemo(
    () => Math.max(insets.top + 72, 120),
    [insets.top],
  );
  const haloTop = useMemo(
    () => Math.max(insets.top - 10, 40),
    [insets.top],
  );

  const ctaLabel =
    mode === "login" ? "꿈틀꿈틀 시작하기" : "꿈틀매쓰 가입하기";

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.gradBottom }}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[COLORS.gradTop, COLORS.gradMid, COLORS.gradBottom]}
        style={StyleSheet.absoluteFill}
      />

      <GoldHalo top={haloTop} />
      <FloatingMathBackground />
      {STARS.map((s, i) => (
        <Star key={i} {...s} />
      ))}

      {/* Content — moves as one block when keyboard opens (hero + card) */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "position" : "height"}
        style={{ flex: 1 }}
        contentContainerStyle={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View
            style={{
              flex: 1,
              paddingHorizontal: 16,
              paddingTop: headlineTop,
              paddingBottom: Math.max(insets.bottom + 12, 24),
            }}
          >
            {/* Headline */}
            <View style={{ alignItems: "center" }}>
              <Text
                style={{
                  fontFamily: "Jua",
                  fontSize: 38,
                  letterSpacing: 0.2,
                  color: COLORS.cream,
                  textShadowColor: "rgba(0,0,0,0.5)",
                  textShadowOffset: { width: 0, height: 2 },
                  textShadowRadius: 0,
                }}
              >
                <Text style={{ color: COLORS.creamAccent }}>꿈틀</Text>매쓰
              </Text>
              <Text
                style={{
                  marginTop: 8,
                  fontFamily: "GowunDodum",
                  fontSize: 13.5,
                  color: COLORS.subCopy,
                }}
              >
                지렁이 친구와 함께 수학을 꿈틀꿈틀
              </Text>
            </View>

            {/* Spacer pushes card to the bottom */}
            <View style={{ flex: 1 }} />

            {/* Glass login card */}
            <View
              style={{
                padding: 20,
                borderRadius: 28,
                backgroundColor: COLORS.cardBg,
                borderWidth: 1.5,
                borderColor: COLORS.cardBorder,
                shadowColor: "#000",
                shadowOpacity: 0.45,
                shadowRadius: 20,
                shadowOffset: { width: 0, height: 20 },
                elevation: 18,
              }}
            >
        {/* Error banner */}
        {error ? (
          <View
            style={{
              marginBottom: 12,
              paddingHorizontal: 14,
              paddingVertical: 10,
              borderRadius: 14,
              backgroundColor: COLORS.errorBg,
              borderWidth: 1,
              borderColor: COLORS.errorBorder,
            }}
          >
            <Text
              style={{
                textAlign: "center",
                color: COLORS.errorText,
                fontFamily: "GowunDodum",
                fontSize: 13,
              }}
            >
              {error}
            </Text>
          </View>
        ) : null}

        {/* Tab toggle */}
        <View
          style={{
            flexDirection: "row",
            padding: 4,
            marginBottom: 14,
            backgroundColor: COLORS.tabTrack,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: COLORS.tabTrackBorder,
          }}
        >
          {(["login", "signup"] as Mode[]).map((t) => {
            const active = mode === t;
            return (
              <TouchableOpacity
                key={t}
                onPress={() => switchMode(t)}
                activeOpacity={0.85}
                disabled={isLoading}
                style={{
                  flex: 1,
                  paddingVertical: 9,
                  borderRadius: 999,
                  alignItems: "center",
                  backgroundColor: active ? COLORS.cream : "transparent",
                  shadowColor: "#000",
                  shadowOpacity: active ? 0.4 : 0,
                  shadowRadius: active ? 6 : 0,
                  shadowOffset: { width: 0, height: 2 },
                }}
              >
                <Text
                  style={{
                    fontFamily: "Jua",
                    fontSize: 14,
                    color: active ? COLORS.dark : COLORS.subCopy,
                  }}
                >
                  {t === "login" ? "로그인" : "회원가입"}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Email field */}
        <FieldRow
          icon="mail"
          focused={focus === "email"}
          value={email}
          placeholder="이메일"
          onChangeText={setEmail}
          onFocus={() => setFocus("email")}
          onBlur={() => setFocus(null)}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!isLoading}
        />
        <View style={{ height: 10 }} />
        <FieldRow
          icon="lock"
          focused={focus === "pw"}
          value={password}
          placeholder="비밀번호"
          onChangeText={setPassword}
          onFocus={() => setFocus("pw")}
          onBlur={() => setFocus(null)}
          secureTextEntry
          editable={!isLoading}
        />

        {/* Primary CTA */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isLoading}
          activeOpacity={0.85}
          style={{
            marginTop: 14,
            paddingVertical: 14,
            paddingHorizontal: 18,
            borderRadius: 999,
            backgroundColor: COLORS.cream,
            alignItems: "center",
            shadowColor: COLORS.shadowDark,
            shadowOpacity: 1,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 4 },
            elevation: 10,
          }}
        >
          {isLoading ? (
            <ActivityIndicator color={COLORS.dark} />
          ) : (
            <Text
              style={{
                fontFamily: "Jua",
                fontSize: 16.5,
                letterSpacing: 0.4,
                color: COLORS.dark,
              }}
            >
              {ctaLabel}
            </Text>
          )}
        </TouchableOpacity>

        {/* Divider */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 14,
            marginBottom: 10,
          }}
        >
          <View
            style={{ flex: 1, height: 1, backgroundColor: COLORS.divider }}
          />
          <Text
            style={{
              marginHorizontal: 8,
              fontSize: 11.5,
              color: COLORS.subCopy,
              fontFamily: "GowunDodum",
            }}
          >
            간편 로그인
          </Text>
          <View
            style={{ flex: 1, height: 1, backgroundColor: COLORS.divider }}
          />
        </View>

        {/* Social buttons */}
        <View style={{ flexDirection: "row", gap: 10 }}>
          {Platform.OS === "ios" && appleAvailable && (
            <SocialButton
              onPress={handleApple}
              disabled={isLoading}
              icon={<Ionicons name="logo-apple" size={18} color={COLORS.dark} />}
              label="Apple"
            />
          )}
          <SocialButton
            onPress={handleGoogle}
            disabled={isLoading}
            icon={<GoogleGLogo size={18} />}
            label="Google"
          />
        </View>

        {/* Forgot password link (login mode only) */}
        {mode === "login" ? (
          <TouchableOpacity
            onPress={handleForgotPassword}
            disabled={isLoading}
            style={{ marginTop: 12, alignItems: "center" }}
          >
            <Text
              style={{
                fontSize: 12,
                color: COLORS.subCopy,
                fontFamily: "GowunDodum",
                textDecorationLine: "underline",
              }}
            >
              비밀번호를 잊으셨나요?
            </Text>
          </TouchableOpacity>
        ) : null}

        {/* Terms */}
        <Text
          style={{
            marginTop: 12,
            fontSize: 11,
            color: COLORS.mute,
            textAlign: "center",
            lineHeight: 17,
            fontFamily: "GowunDodum",
          }}
        >
          계속하면{" "}
          <Text style={{ textDecorationLine: "underline" }}>이용약관</Text>과{" "}
          <Text style={{ textDecorationLine: "underline" }}>
            개인정보처리방침
          </Text>
          에 동의합니다
        </Text>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
}

// ───────────────────────────────────────────────────────────
// Field row (input with left icon)
// ───────────────────────────────────────────────────────────
interface FieldRowProps {
  icon: "mail" | "lock";
  focused: boolean;
  value: string;
  placeholder: string;
  onChangeText: (v: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address";
  autoCapitalize?: "none" | "sentences";
  editable?: boolean;
}

function FieldRow({
  icon,
  focused,
  value,
  placeholder,
  onChangeText,
  onFocus,
  onBlur,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  editable,
}: FieldRowProps) {
  const iconColor = focused ? COLORS.creamAccent : COLORS.placeholder;
  return (
    <View style={{ position: "relative", justifyContent: "center" }}>
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: 14,
          top: 0,
          bottom: 0,
          width: 22,
          alignItems: "center",
          justifyContent: "center",
          zIndex: 2,
        }}
      >
        {icon === "mail" ? (
          <MailIcon color={iconColor} />
        ) : (
          <LockIcon color={iconColor} />
        )}
      </View>
      <TextInput
        value={value}
        placeholder={placeholder}
        placeholderTextColor={COLORS.placeholder}
        onChangeText={onChangeText}
        onFocus={onFocus}
        onBlur={onBlur}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        editable={editable}
        keyboardAppearance="dark"
        autoCorrect={false}
        autoComplete="off"
        spellCheck={false}
        textContentType="none"
        importantForAutofill="no"
        style={{
          width: "100%",
          paddingVertical: 13,
          paddingLeft: 44,
          paddingRight: 16,
          fontSize: 15,
          fontFamily: "GowunDodum",
          color: COLORS.cream,
          backgroundColor: COLORS.inputBg,
          borderWidth: 1.5,
          borderColor: focused ? COLORS.creamAccent : COLORS.inputBorder,
          borderRadius: 999,
          shadowColor: focused ? COLORS.creamAccent : "transparent",
          shadowOpacity: focused ? 0.25 : 0,
          shadowRadius: focused ? 8 : 0,
          shadowOffset: { width: 0, height: 0 },
        }}
      />
    </View>
  );
}

// ───────────────────────────────────────────────────────────
// Social button (pill with icon + label)
// ───────────────────────────────────────────────────────────
interface SocialButtonProps {
  onPress: () => void;
  disabled?: boolean;
  icon: React.ReactNode;
  label: string;
}

function SocialButton({ onPress, disabled, icon, label }: SocialButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
      style={{
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderRadius: 14,
        backgroundColor: COLORS.cream,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 8,
        shadowColor: COLORS.shadowSocial,
        shadowOpacity: 1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 3 },
        elevation: 6,
      }}
    >
      {icon}
      <Text
        style={{
          fontFamily: "Jua",
          fontSize: 13.5,
          color: COLORS.dark,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
