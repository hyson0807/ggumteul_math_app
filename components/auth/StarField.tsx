import { useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";

type StarSpec = {
  leftPct: number;
  topPct: number;
  gold: boolean;
  twinkleDur: number;
  delay: number;
};

const STARS: StarSpec[] = Array.from({ length: 14 }).map((_, i) => ({
  leftPct: (i * 37) % 100,
  topPct: 6 + ((i * 53) % 78),
  gold: i % 3 === 0,
  twinkleDur: 2000 + (i % 3) * 1000,
  delay: i * 200,
}));

function Star({ leftPct, topPct, gold, twinkleDur, delay }: StarSpec) {
  const opacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const animation = Animated.loop(
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
    );
    const t = setTimeout(() => animation.start(), delay);
    return () => {
      clearTimeout(t);
      animation.stop();
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

export function StarField() {
  return (
    <>
      {STARS.map((s, i) => (
        <Star key={i} {...s} />
      ))}
    </>
  );
}
