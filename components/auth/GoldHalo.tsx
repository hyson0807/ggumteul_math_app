import { useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";

export function GoldHalo({ top }: { top: number }) {
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
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
    );
    animation.start();
    return () => animation.stop();
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
