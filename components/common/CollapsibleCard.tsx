import { ReactNode, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Colors } from "@/constants/colors";

const CARD_SHADOW = {
  shadowColor: "#000",
  shadowOpacity: 0.05,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 2 },
  elevation: 2,
} as const;

interface Props {
  icon: string;
  iconColor: string;
  title: string;
  subtitle?: string;
  /** 접힌 상태에서 헤더 아래 노출되는 압축 요약 */
  summary?: ReactNode;
  defaultExpanded?: boolean;
  children: ReactNode;
}

export function CollapsibleCard({
  icon,
  iconColor,
  title,
  subtitle,
  summary,
  defaultExpanded = false,
  children,
}: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const rotation = useSharedValue(defaultExpanded ? 180 : 0);

  const toggle = () => {
    const next = !expanded;
    setExpanded(next);
    rotation.value = withTiming(next ? 180 : 0, { duration: 200 });
  };

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View
      layout={LinearTransition.duration(200)}
      style={{
        backgroundColor: Colors.surface,
        borderRadius: 20,
        padding: 20,
        ...CARD_SHADOW,
      }}
    >
      <Pressable onPress={toggle}>
        <View
          style={{ flexDirection: "row", alignItems: "center", marginBottom: 3 }}
        >
          <MaterialCommunityIcons name={icon as any} size={20} color={iconColor} />
          <Text
            style={{
              fontSize: 15,
              fontWeight: "700",
              color: Colors.text,
              marginLeft: 6,
              flex: 1,
            }}
          >
            {title}
          </Text>
          <Animated.View style={chevronStyle}>
            <MaterialCommunityIcons
              name="chevron-down"
              size={22}
              color={Colors.textSecondary}
            />
          </Animated.View>
        </View>
        {subtitle ? (
          <Text style={{ fontSize: 12, color: Colors.textSecondary }}>
            {subtitle}
          </Text>
        ) : null}
        {!expanded && summary ? (
          <View style={{ marginTop: 12 }}>{summary}</View>
        ) : null}
      </Pressable>

      {expanded ? (
        <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)}>
          <View style={{ marginTop: 18 }}>{children}</View>
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}
