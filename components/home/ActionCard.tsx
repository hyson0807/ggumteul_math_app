import { useRef } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { feedback } from "@/utils/feedback";

interface Props {
  title: string;
  subtitle: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  accent?: string;
  onPress: () => void;
}

export function ActionCard({
  title,
  subtitle,
  icon,
  accent = Colors.primary,
  onPress,
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (value: number) => {
    Animated.spring(scale, {
      toValue: value,
      useNativeDriver: true,
      speed: 40,
      bounciness: 6,
    }).start();
  };

  const handlePress = () => {
    feedback.tabPress();
    onPress();
  };

  return (
    <Animated.View style={{ flex: 1, transform: [{ scale }] }}>
      <Pressable
        onPress={handlePress}
        onPressIn={() => animateTo(0.96)}
        onPressOut={() => animateTo(1)}
        accessibilityRole="button"
        accessibilityLabel={title}
        style={{
          backgroundColor: Colors.surface,
          borderRadius: 24,
          paddingVertical: 22,
          paddingHorizontal: 16,
          borderWidth: 2,
          borderColor: accent,
          alignItems: "center",
          shadowColor: accent,
          shadowOpacity: 0.22,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 6 },
          elevation: 5,
          minHeight: 158,
        }}
      >
        <View
          style={{
            width: 60,
            height: 60,
            borderRadius: 20,
            backgroundColor: `${accent}1F`,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 14,
            shadowColor: accent,
            shadowOpacity: 0.18,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 3 },
          }}
        >
          <View
            style={{
              position: "absolute",
              top: 6,
              left: 10,
              width: 14,
              height: 6,
              borderRadius: 999,
              backgroundColor: "#FFFFFF",
              opacity: 0.55,
            }}
          />
          <MaterialCommunityIcons name={icon} size={30} color={accent} />
        </View>

        <Text
          numberOfLines={1}
          style={{
            fontFamily: "Jua",
            fontSize: 18,
            color: accent,
            letterSpacing: 0.2,
          }}
        >
          {title}
        </Text>
        <Text
          numberOfLines={1}
          style={{
            marginTop: 4,
            fontFamily: "GowunDodum",
            fontSize: 12,
            color: Colors.textSecondary,
          }}
        >
          {subtitle}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
