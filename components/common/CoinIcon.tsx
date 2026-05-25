import Svg, { Circle, Text as SvgText } from "react-native-svg";
import { Colors } from "@/constants/colors";

interface Props {
  size?: number;
}

export function CoinIcon({ size = 18 }: Props) {
  const c = size / 2;
  const outerR = c - 1;
  const innerR = outerR * 0.72;
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Circle
        cx={c}
        cy={c}
        r={outerR}
        fill={Colors.coin}
        stroke="#A07F25"
        strokeWidth={1}
      />
      <Circle cx={c} cy={c} r={innerR} fill="#FFD36A" />
      <SvgText
        x={c}
        y={c + size * 0.18}
        fontSize={size * 0.42}
        fontWeight="900"
        fill="#8A5A1A"
        textAnchor="middle"
      >
        ₩
      </SvgText>
    </Svg>
  );
}
