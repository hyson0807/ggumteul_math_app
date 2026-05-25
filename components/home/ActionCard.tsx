import { useRef } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { feedback } from "@/utils/feedback";

interface Props {
  title: string;
  subtitle: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  onPress: () => void;
}

export function ActionCard({ title, subtitle, icon, onPress }: Props) {
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
        onPressIn={() => animateTo(0.97)}
        onPressOut={() => animateTo(1)}
        accessibilityRole="button"
        accessibilityLabel={title}
        style={({ pressed }) => ({
          backgroundColor: Colors.surface,
          borderRadius: 24,
          padding: 16,
          borderWidth: pressed ? 1.5 : 1,
          borderColor: pressed ? Colors.primary : Colors.surfaceBorder,
          shadowColor: "#000",
          shadowOpacity: 0.06,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
          elevation: 3,
          minHeight: 132,
          justifyContent: "space-between",
        })}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            backgroundColor: "rgba(63,143,107,0.10)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MaterialCommunityIcons name={icon} size={24} color={Colors.primary} />
        </View>

        <View style={{ marginTop: 12 }}>
          <Text
            numberOfLines={1}
            style={{
              fontFamily: "Jua",
              fontSize: 17,
              color: Colors.text,
              letterSpacing: 0.1,
            }}
          >
            {title}
          </Text>
          <Text
            numberOfLines={1}
            style={{
              marginTop: 3,
              fontFamily: "GowunDodum",
              fontSize: 12,
              color: Colors.textSecondary,
            }}
          >
            {subtitle}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}
