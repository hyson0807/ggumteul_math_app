import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Application from "expo-application";
import { useAuthStore } from "@/stores/useAuthStore";
import { Colors } from "@/constants/colors";
import { LINKS } from "@/constants/links";

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const logout = useAuthStore((s) => s.logout);
  const deleteAccount = useAuthStore((s) => s.deleteAccount);

  const openUrl = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert("열 수 없어요", "잠시 후 다시 시도해주세요.");
    });
  };

  const handleLogout = () => {
    Alert.alert("로그아웃", "정말 로그아웃 하시겠어요?", [
      { text: "취소", style: "cancel" },
      {
        text: "로그아웃",
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "회원 탈퇴",
      "정말 탈퇴하시겠습니까? 모든 데이터가 삭제되며 복구할 수 없습니다.",
      [
        { text: "취소", style: "cancel" },
        {
          text: "탈퇴하기",
          style: "destructive",
          onPress: async () => {
            await deleteAccount();
          },
        },
      ],
    );
  };

  const appVersion =
    Application.nativeApplicationVersion ?? "1.0.1";

  return (
    <View
      className="flex-1 bg-village-bg"
      style={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom }}
    >
      <View className="flex-row items-center justify-between px-5 mb-2">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-full bg-white/80 border border-village-border"
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="chevron-left"
            size={24}
            color={Colors.text}
          />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-village-text">설정</Text>
        <View className="w-10" />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <SectionLabel>정보</SectionLabel>
        <Card>
          <Row
            icon="file-document-outline"
            label="이용약관"
            onPress={() => openUrl(LINKS.terms)}
          />
          <Divider />
          <Row
            icon="shield-lock-outline"
            label="개인정보처리방침"
            onPress={() => openUrl(LINKS.privacy)}
          />
          <Divider />
          <Row
            icon="account-remove-outline"
            label="계정 삭제 안내"
            onPress={() => openUrl(LINKS.deleteAccount)}
          />
          <Divider />
          <Row
            icon="code-tags"
            label="오픈소스 라이선스"
            onPress={() => openUrl(LINKS.licenses)}
          />
        </Card>

        <SectionLabel>계정</SectionLabel>
        <Card>
          <Row icon="logout" label="로그아웃" onPress={handleLogout} />
          <Divider />
          <Row
            icon="account-cancel-outline"
            label="회원 탈퇴"
            onPress={handleDeleteAccount}
            destructive
          />
        </Card>

        <Text className="text-center text-village-inactive text-xs mt-8">
          꿈틀매쓰 v{appVersion}
        </Text>
      </ScrollView>
    </View>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text className="text-xs font-semibold text-village-text-secondary mt-6 mb-2 ml-2">
      {children}
    </Text>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <View
      className="bg-village-surface"
      style={{
        borderRadius: 18,
        paddingHorizontal: 4,
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 1,
      }}
    >
      {children}
    </View>
  );
}

function Row({
  icon,
  label,
  onPress,
  destructive = false,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
  destructive?: boolean;
}) {
  const labelColor = destructive ? Colors.error : Colors.text;
  const iconColor = destructive ? Colors.error : Colors.textSecondary;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center px-4 py-4"
    >
      <MaterialCommunityIcons name={icon} size={20} color={iconColor} />
      <Text
        className="flex-1 ml-3 text-base font-medium"
        style={{ color: labelColor }}
      >
        {label}
      </Text>
      {!destructive && (
        <MaterialCommunityIcons
          name="chevron-right"
          size={20}
          color={Colors.inactive}
        />
      )}
    </TouchableOpacity>
  );
}

function Divider() {
  return (
    <View
      style={{
        height: 1,
        marginHorizontal: 12,
        backgroundColor: Colors.surfaceBorder,
        opacity: 0.5,
      }}
    />
  );
}
