import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";

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
    const animation = Animated.loop(
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
    );
    const t = setTimeout(() => animation.start(), item.delay);
    return () => {
      clearTimeout(t);
      animation.stop();
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

export function FloatingMathBackground() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {FLOATING_ITEMS.map((item, idx) => (
        <FloatingMathItem key={idx} item={item} />
      ))}
    </View>
  );
}
