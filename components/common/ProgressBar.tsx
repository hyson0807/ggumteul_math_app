import { View } from "react-native";
import { Colors } from "@/constants/colors";

interface Props {
  /** 0~100 사이 정수. 범위 밖 값은 자동으로 clamp */
  percent: number;
  color?: string;
  trackColor?: string;
  height?: number;
}

export function ProgressBar({
  percent,
  color = Colors.primary,
  trackColor = Colors.surfaceBorder,
  height = 6,
}: Props) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <View
      style={{
        height,
        borderRadius: 999,
        backgroundColor: trackColor,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          width: `${clamped}%`,
          height: "100%",
          backgroundColor: color,
          borderRadius: 999,
        }}
      />
    </View>
  );
}
