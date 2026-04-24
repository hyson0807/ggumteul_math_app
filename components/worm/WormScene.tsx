import { useEffect, useRef } from "react";
import { Animated, Pressable, View, useWindowDimensions } from "react-native";
import Svg, {
  Circle,
  Defs,
  RadialGradient,
  Stop,
} from "react-native-svg";
import { STAGE_SCENES, clampStage } from "@/constants/stages";
import { WormSprite } from "./WormSprite";
import { StageBackdrop } from "./StageBackdrop";
import { feedback } from "@/utils/feedback";
import type { WormState } from "@/types/worm";

interface Props {
  worm: WormState;
  displayStage: number;
  onWormPress?: () => void;
}

export function WormScene({ worm, displayStage, onWormPress }: Props) {
  const { width: frameW, height: frameH } = useWindowDimensions();
  const stage = clampStage(displayStage);
  const config = STAGE_SCENES[stage];
  const bobAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bobAnim, {
          toValue: -4,
          duration: 1600,
          useNativeDriver: true,
        }),
        Animated.timing(bobAnim, {
          toValue: 0,
          duration: 1600,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [bobAnim]);

  const wormX = config.wormX * frameW;
  const wormY = config.wormY * frameH;

  return (
    <View style={{ flex: 1 }}>
      <StageBackdrop config={config} width={frameW} height={frameH} />

      {/* spotlight halo behind the worm */}
      <Svg
        pointerEvents="none"
        width={320}
        height={320}
        style={{
          position: "absolute",
          left: wormX - 160,
          top: wormY - 160,
        }}
      >
        <Defs>
          <RadialGradient
            id="wormSpot"
            cx="50%"
            cy="50%"
            r="50%"
            fx="50%"
            fy="50%"
          >
            <Stop offset="0%" stopColor="#FFF3D0" stopOpacity={0.28} />
            <Stop offset="45%" stopColor="#FFF3D0" stopOpacity={0.12} />
            <Stop offset="75%" stopColor="#FFF3D0" stopOpacity={0} />
            <Stop offset="100%" stopColor="#FFF3D0" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={160} cy={160} r={160} fill="url(#wormSpot)" />
      </Svg>

      <Animated.View
        style={{
          position: "absolute",
          left: wormX,
          top: wormY,
          transform: [
            { translateX: -60 },
            { translateY: -40 },
            { translateY: bobAnim },
          ],
        }}
      >
        <Pressable
          onPress={() => {
            feedback.wormTap();
            onWormPress?.();
          }}
          hitSlop={16}
        >
          <WormSprite equipped={worm.equipped} />
        </Pressable>
      </Animated.View>
    </View>
  );
}
