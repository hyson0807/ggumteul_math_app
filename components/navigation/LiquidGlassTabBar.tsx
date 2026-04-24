import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  GlassView,
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
} from "expo-glass-effect";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Colors } from "@/constants/colors";
import { feedback } from "@/utils/feedback";

const ICON_SIZE = 26;
const BAR_HEIGHT = 64;
const HORIZONTAL_MARGIN = 16;

const useGlass = isLiquidGlassAvailable() && isGlassEffectAPIAvailable();

export function LiquidGlassTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottomOffset = Math.max(insets.bottom, 12);

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.wrapper,
        { bottom: bottomOffset, left: HORIZONTAL_MARGIN, right: HORIZONTAL_MARGIN },
      ]}
    >
      <View style={styles.shadow}>
        <View style={styles.clip}>
          {useGlass ? (
            <GlassView
              style={StyleSheet.absoluteFill}
              glassEffectStyle="regular"
              isInteractive
            />
          ) : (
            <View style={[StyleSheet.absoluteFill, styles.fallback]} />
          )}

          <View style={styles.row}>
            {state.routes.map((route, index) => {
              const { options } = descriptors[route.key];
              const label =
                typeof options.tabBarLabel === "string"
                  ? options.tabBarLabel
                  : options.title ?? route.name;

              const isFocused = state.index === index;
              const color = isFocused
                ? Colors.tabBarActive
                : Colors.tabBarInactive;

              const onPress = () => {
                feedback.tabPress();
                const event = navigation.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name, route.params);
                }
              };

              const onLongPress = () => {
                navigation.emit({
                  type: "tabLongPress",
                  target: route.key,
                });
              };

              return (
                <Pressable
                  key={route.key}
                  accessibilityRole="button"
                  accessibilityState={isFocused ? { selected: true } : {}}
                  accessibilityLabel={options.tabBarAccessibilityLabel}
                  onPress={onPress}
                  onLongPress={onLongPress}
                  style={styles.tab}
                  android_ripple={{ color: Colors.surfaceBorder, borderless: true }}
                >
                  {options.tabBarIcon?.({
                    focused: isFocused,
                    color,
                    size: ICON_SIZE,
                  })}
                  <Text
                    style={[
                      styles.label,
                      { color },
                      isFocused && styles.labelFocused,
                    ]}
                    numberOfLines={1}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
  },
  shadow: {
    borderRadius: 28,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  clip: {
    borderRadius: 28,
    overflow: "hidden",
  },
  fallback: {
    backgroundColor: "rgba(255,255,255,0.85)",
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderRadius: 28,
  },
  row: {
    flexDirection: "row",
    height: BAR_HEIGHT,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    paddingVertical: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: "500",
  },
  labelFocused: {
    fontWeight: "700",
  },
});
