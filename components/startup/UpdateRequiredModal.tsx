import { Linking, Platform, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import type { VersionCheckResponse } from "@/types/version";

interface Props {
  storeUrl: VersionCheckResponse["storeUrl"];
}

export const UpdateRequiredModal = ({ storeUrl }: Props) => {
  const url = Platform.OS === "ios" ? storeUrl.ios : storeUrl.android;

  const handlePress = () => {
    if (url) Linking.openURL(url);
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: Colors.background,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 32,
      }}
    >
      <View style={{ alignItems: "center", marginBottom: 40 }}>
        <Text
          style={{
            fontSize: 24,
            fontWeight: "700",
            color: Colors.text,
            marginBottom: 16,
          }}
        >
          업데이트 안내
        </Text>
        <Text
          style={{
            fontSize: 15,
            lineHeight: 22,
            color: Colors.textSecondary,
            textAlign: "center",
          }}
        >
          새로운 버전이 출시되었습니다.{"\n"}최신 버전으로 업데이트해주세요.
        </Text>
      </View>

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handlePress}
        disabled={!url}
        style={{
          backgroundColor: Colors.cta,
          paddingVertical: 14,
          paddingHorizontal: 48,
          borderRadius: 12,
          opacity: url ? 1 : 0.5,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: "600", color: "#FFFFFF" }}>
          업데이트
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};
