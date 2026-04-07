import { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { useToastStore } from "@/stores/useToastStore";

const ICON_BY_TYPE = {
  success: { name: "check-circle" as const, color: Colors.success },
  error: { name: "close-circle" as const, color: Colors.error },
  info: { name: "information" as const, color: Colors.primary },
};

export function Toast() {
  const insets = useSafeAreaInsets();
  const visible = useToastStore((s) => s.visible);
  const message = useToastStore((s) => s.message);
  const type = useToastStore((s) => s.type);

  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, {
        duration: 280,
        easing: Easing.out(Easing.cubic),
      });
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      translateY.value = withTiming(-100, {
        duration: 220,
        easing: Easing.in(Easing.cubic),
      });
      opacity.value = withTiming(0, { duration: 180 });
    }
  }, [visible, translateY, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const icon = ICON_BY_TYPE[type];

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          top: insets.top + 8,
          left: 0,
          right: 0,
          alignItems: "center",
          zIndex: 9999,
        },
        animatedStyle,
      ]}
    >
      <View
        className="flex-row items-center bg-white rounded-full px-4 py-3 border border-village-border"
        style={{
          shadowColor: "#000",
          shadowOpacity: 0.15,
          shadowOffset: { width: 0, height: 4 },
          shadowRadius: 12,
          elevation: 6,
          maxWidth: "90%",
        }}
      >
        <MaterialCommunityIcons name={icon.name} size={20} color={icon.color} />
        <Text
          className="ml-2 text-sm font-semibold text-village-text"
          numberOfLines={2}
        >
          {message}
        </Text>
      </View>
    </Animated.View>
  );
}
