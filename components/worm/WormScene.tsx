import { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  View,
  useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, {
  Circle,
  Defs,
  Path,
  RadialGradient,
  Rect,
  Stop,
  Text as SvgText,
} from "react-native-svg";
import {
  ALL_UNITS,
  REGIONS,
  SCENE_WIDTH_MULTIPLIER,
  TOTAL_REGION_RATIO,
  UNIT_META,
  UNIT_X,
  type UnitId,
} from "@/constants/units";
import { WormSprite } from "./WormSprite";
import {
  DeepDecor,
  GroundDecor,
  ShallowDecor,
  SkyDecor,
  SpaceDecor,
} from "./SceneDecor";
import type { WormState } from "@/types/worm";

interface Props {
  worm: WormState;
  currentUnit: UnitId;
  scrollToUnitRef?: React.MutableRefObject<((unit: UnitId) => void) | null>;
  onWormPress?: () => void;
}

function buildHorizontalGradient() {
  const total = TOTAL_REGION_RATIO;
  const BLEND = 0.3;
  const colors: string[] = [];
  const locations: number[] = [];
  let x = 0;
  REGIONS.forEach((r, i) => {
    const w = r.ratio / total;
    const solidStart = i === 0 ? x : x + w * BLEND;
    const solidEnd = i === REGIONS.length - 1 ? 1 : x + w * (1 - BLEND);
    colors.push(r.color, r.color);
    locations.push(solidStart, solidEnd);
    x += w;
  });
  return { colors, locations };
}

const WORM_Y_BY_BAND: Record<string, number> = {
  deep: 0.3,
  shallow: 0.28,
  ground: 0.28,
  sky: 0.28,
  space: 0.28,
};
const SIGN_Y_BY_BAND: Record<string, number> = {
  deep: 0.8,
  shallow: 0.78,
  ground: 0.78,
  sky: 0.78,
  space: 0.76,
};

export function WormScene({
  worm,
  currentUnit,
  scrollToUnitRef,
  onWormPress,
}: Props) {
  const { width: frameW, height: frameH } = useWindowDimensions();
  const sceneW = frameW * SCENE_WIDTH_MULTIPLIER;
  const sceneH = frameH;
  const gradient = useMemo(buildHorizontalGradient, []);
  const scrollRef = useRef<ScrollView>(null);
  const bobAnim = useRef(new Animated.Value(0)).current;

  const regionRanges = useMemo(() => {
    const map: Record<string, { left: number; width: number }> = {};
    let acc = 0;
    for (const r of REGIONS) {
      const w = (r.ratio / TOTAL_REGION_RATIO) * sceneW;
      map[r.key] = { left: acc, width: w };
      acc += w;
    }
    return map;
  }, [sceneW]);

  const wormX = UNIT_X[currentUnit] * sceneW;
  const meta = UNIT_META[currentUnit];
  const wormY = (WORM_Y_BY_BAND[meta.band] ?? 0.3) * sceneH;

  const scrollToUnit = (unit: UnitId, centered = false) => {
    const el = scrollRef.current;
    if (!el) return;
    const x = UNIT_X[unit] * sceneW;
    const offset = centered ? frameW * 0.5 : frameW * 0.45;
    const target = Math.max(0, Math.min(sceneW - frameW, x - offset));
    el.scrollTo({ x: target, animated: true });
  };

  useEffect(() => {
    if (scrollToUnitRef) scrollToUnitRef.current = scrollToUnit;
  });

  useEffect(() => {
    const t = setTimeout(() => scrollToUnit(currentUnit, false), 200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUnit, sceneW]);

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

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      decelerationRate="fast"
    >
      <View style={{ width: sceneW, height: sceneH }}>
        <LinearGradient
          colors={gradient.colors as [string, string, ...string[]]}
          locations={gradient.locations as [number, number, ...number[]]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{ position: "absolute", top: 0, left: 0, width: sceneW, height: sceneH }}
        />

        <Svg
          width={sceneW}
          height={sceneH}
          style={{ position: "absolute", top: 0, left: 0 }}
        >
          <DeepDecor
            width={regionRanges.deep.width}
            height={sceneH}
            x0={regionRanges.deep.left}
          />
          <ShallowDecor
            width={regionRanges.shallow.width}
            height={sceneH}
            x0={regionRanges.shallow.left}
          />
          <GroundDecor
            width={regionRanges.ground.width}
            height={sceneH}
            x0={regionRanges.ground.left}
          />
          <SkyDecor
            width={regionRanges.sky.width}
            height={sceneH}
            x0={regionRanges.sky.left}
          />
          <SpaceDecor
            width={regionRanges.space.width}
            height={sceneH}
            x0={regionRanges.space.left}
          />
        </Svg>

        {/* Unit signposts */}
        {ALL_UNITS.map((uid) => {
          const x = UNIT_X[uid] * sceneW;
          const umeta = UNIT_META[uid];
          const isCurrent = uid === currentUnit;
          const y = (SIGN_Y_BY_BAND[umeta.band] ?? 0.78) * sceneH;
          return (
            <View
              key={uid}
              pointerEvents="none"
              style={{
                position: "absolute",
                left: x - 60,
                top: y,
                width: 120,
                alignItems: "center",
              }}
            >
              <Svg width={120} height={64} viewBox="0 0 120 64">
                <Rect x={58} y={22} width={4} height={40} fill="#6B4226" />
                <Rect x={58} y={22} width={1.5} height={40} fill="#A87050" />
                <Path
                  d="M10 4 L108 4 L114 18 L108 32 L10 32 L4 18 Z"
                  fill={isCurrent ? "#C0392B" : "#8A5A3A"}
                  stroke="#5A3822"
                  strokeWidth={1}
                />
                <SvgText
                  x={60}
                  y={16}
                  fontSize={10}
                  fontWeight="800"
                  fill="#FFF3D0"
                  textAnchor="middle"
                >
                  {uid}
                </SvgText>
                <SvgText
                  x={60}
                  y={27}
                  fontSize={8}
                  fill="#F5E0B0"
                  textAnchor="middle"
                >
                  {umeta.region}
                </SvgText>
                {isCurrent && <Circle cx={60} cy={18} r={3} fill="#FFD166" />}
              </Svg>
            </View>
          );
        })}

        {/* spotlight — soft radial halo behind the worm, fades to transparent at 70% */}
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

        {/* Worm character — renders above the halo */}
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
          <Pressable onPress={onWormPress} hitSlop={16}>
            <WormSprite stage={worm.stage} equipped={worm.equipped} />
          </Pressable>
        </Animated.View>
      </View>
    </ScrollView>
  );
}
