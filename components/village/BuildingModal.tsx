import { useEffect, useMemo, useRef, useState } from "react";
import { Image, Modal, Pressable, Text, View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Colors } from "@/constants/colors";
import { useAuthStore } from "@/stores/useAuthStore";
import { useBuildingStore } from "@/stores/useBuildingStore";
import { useToastStore } from "@/stores/useToastStore";
import {
  BUILDING_LABELS,
  BuildingType,
  COIN_COST_PER_TAP,
  MAX_LEVEL,
  MAX_PROGRESS,
} from "@/types/building";

const BUILDING_IMAGES: Record<BuildingType, number> = {
  house: require("@/assets/images/buildings/house.png"),
  school: require("@/assets/images/buildings/school.png"),
  park: require("@/assets/images/buildings/park.png"),
  shop: require("@/assets/images/buildings/shop.png"),
};

interface Props {
  type: BuildingType | null;
  onClose: () => void;
}

export function BuildingModal({ type, onClose }: Props) {
  const visible = type !== null;

  const buildings = useBuildingStore((s) => s.buildings);
  const upgrade = useBuildingStore((s) => s.upgrade);
  const coins = useAuthStore((s) => s.user?.coins ?? 0);
  const showToast = useToastStore((s) => s.show);

  const building = useMemo(
    () => (type && buildings ? buildings[type] : null),
    [type, buildings],
  );

  const isMaxedOut =
    building != null &&
    building.level >= MAX_LEVEL &&
    building.progress >= MAX_PROGRESS;
  const notEnoughCoins = coins < COIN_COST_PER_TAP;
  const disabled = isMaxedOut || notEnoughCoins;

  const handleUpgrade = async () => {
    if (!type || disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const { leveledUp } = await upgrade(type);
      if (leveledUp) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showToast(`${BUILDING_LABELS[type]} 레벨 업! 🎉`, "success");
      } else {
        showToast(`+10 진행도 · -${COIN_COST_PER_TAP} 코인`, "info");
      }
    } catch (e) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const message = e instanceof Error ? e.message : "업그레이드에 실패했어요.";
      showToast(message, "error");
    }
  };

  const buttonLabel = isMaxedOut
    ? "최대 레벨 달성"
    : notEnoughCoins
      ? "코인이 부족해요"
      : `코인 ${COIN_COST_PER_TAP}개로 진행도 올리기 (+10)`;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable
        onPress={onClose}
        className="flex-1 items-center justify-center bg-black/50 px-6"
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="w-full bg-village-surface rounded-3xl border border-village-border p-6"
          style={{ maxWidth: 360 }}
        >
          {/* 닫기 버튼 */}
          <Pressable
            onPress={onClose}
            hitSlop={12}
            className="absolute right-3 top-3 w-8 h-8 items-center justify-center rounded-full bg-black/5"
          >
            <MaterialCommunityIcons name="close" size={18} color={Colors.text} />
          </Pressable>

          {type && building && (
            <>
              {/* 건물 이미지 */}
              <View className="items-center">
                <Image
                  source={BUILDING_IMAGES[type]}
                  style={{ width: 120, height: 120 }}
                  resizeMode="contain"
                />
              </View>

              {/* 이름 + 레벨 */}
              <View className="items-center mt-2">
                <Text className="text-xl font-bold text-village-text">
                  {BUILDING_LABELS[type]}
                </Text>
                <LevelBadge level={building.level} />
              </View>

              {/* 진행도 바 (애니메이션) */}
              <ProgressBar progress={building.progress} level={building.level} />

              {/* 보유 코인 */}
              <View className="flex-row items-center justify-center mt-5">
                <Text className="text-xs text-village-textSecondary">
                  보유 코인
                </Text>
                <Text className="text-sm font-bold text-village-text ml-2">
                  {coins}
                </Text>
                <MaterialCommunityIcons
                  name="circle"
                  size={14}
                  color={Colors.coin}
                  style={{ marginLeft: 4 }}
                />
              </View>

              {/* 업그레이드 버튼 (옵티미스틱이라 로딩 없음) */}
              <Pressable
                onPress={handleUpgrade}
                disabled={disabled}
                className="mt-5 rounded-2xl py-4 items-center"
                style={{
                  backgroundColor: disabled ? Colors.inactive : Colors.cta,
                }}
              >
                <Text className="text-base font-bold text-white">
                  {buttonLabel}
                </Text>
              </Pressable>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function LevelBadge({ level }: { level: number }) {
  const scale = useSharedValue(1);
  const prevLevelRef = useSharedValue(level);

  useEffect(() => {
    if (prevLevelRef.value !== level) {
      // 레벨업 시 뱃지 살짝 펑!
      scale.value = withSequence(
        withTiming(1.35, { duration: 150, easing: Easing.out(Easing.cubic) }),
        withSpring(1, { damping: 6, stiffness: 180 }),
      );
      prevLevelRef.value = level;
    }
  }, [level, scale, prevLevelRef]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={animatedStyle}
      className="bg-village-primary rounded-full px-3 py-0.5 mt-1"
    >
      <Text className="text-xs text-white font-bold">
        Lv. {level} / {MAX_LEVEL}
      </Text>
    </Animated.View>
  );
}

function ProgressBar({ progress, level }: { progress: number; level: number }) {
  // 0~100 → 0~1
  const animProgress = useSharedValue(progress / MAX_PROGRESS);
  const shimmer = useSharedValue(0);
  const flash = useSharedValue(0);
  const prevLevel = useSharedValue(level);
  const isFirst = useRef(true);
  const [burst, setBurst] = useState<{ key: number; leveledUp: boolean }>({
    key: 0,
    leveledUp: false,
  });

  useEffect(() => {
    // 무한 shimmer 루프 (배경 위에서 빛이 흐르는 효과)
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1600, easing: Easing.linear }),
      -1,
      false,
    );
  }, [shimmer]);

  useEffect(() => {
    const leveledUp = level !== prevLevel.value;
    const target = progress / MAX_PROGRESS;

    if (leveledUp) {
      // 레벨업: 일단 100%까지 채우고, 짧게 깜빡 후 0으로
      animProgress.value = withSequence(
        withTiming(1, { duration: 280, easing: Easing.out(Easing.cubic) }),
        withTiming(1, { duration: 220 }),
        withTiming(target, { duration: 360, easing: Easing.out(Easing.cubic) }),
      );
      flash.value = withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(0, { duration: 600 }),
      );
    } else {
      animProgress.value = withSpring(target, {
        damping: 14,
        stiffness: 140,
        mass: 0.6,
      });
      // 진행 시 살짝 반짝
      flash.value = withSequence(
        withTiming(0.6, { duration: 120 }),
        withTiming(0, { duration: 360 }),
      );
    }
    prevLevel.value = level;

    // 첫 마운트 시 별 효과 스킵
    if (isFirst.current) {
      isFirst.current = false;
    } else {
      setBurst((b) => ({ key: b.key + 1, leveledUp }));
    }
  }, [progress, level, animProgress, flash, prevLevel]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${animProgress.value * 100}%`,
  }));

  // shimmer는 fill 안에서 좌→우로 흐르는 밝은 띠
  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(shimmer.value, [0, 1], [-60, 220]),
      },
    ],
  }));

  // 진행 시 잠깐 fill 위에 흰 오버레이가 깜빡
  const flashStyle = useAnimatedStyle(() => ({
    opacity: flash.value,
  }));

  return (
    <View className="mt-5">
      <View className="flex-row justify-between mb-1">
        <Text className="text-xs text-village-textSecondary">
          다음 레벨까지
        </Text>
        <Text className="text-xs font-bold text-village-text">
          {progress} / {MAX_PROGRESS}
        </Text>
      </View>
      {/* 트랙 + 별 오버레이 컨테이너 (overflow: visible) */}
      <View style={{ position: "relative", height: 12, justifyContent: "center" }}>
        <View className="h-3 w-full bg-village-border rounded-full overflow-hidden">
          <Animated.View
            style={[
              {
                height: "100%",
                backgroundColor: Colors.secondary,
                borderRadius: 999,
                overflow: "hidden",
              },
              fillStyle,
            ]}
          >
            {/* shimmer 띠 */}
            <Animated.View
              pointerEvents="none"
              style={[
                {
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  width: 50,
                  backgroundColor: "rgba(255,255,255,0.5)",
                  transform: [{ skewX: "-20deg" }],
                },
                shimmerStyle,
              ]}
            />
            {/* flash 오버레이 */}
            <Animated.View
              pointerEvents="none"
              style={[
                {
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "white",
                },
                flashStyle,
              ]}
            />
          </Animated.View>
        </View>
        {/* 별 파티클 — 트랙 위에 absolute 오버레이로 떠 있음 */}
        {burst.key > 0 && (
          <StarBurst
            key={burst.key}
            leveledUp={burst.leveledUp}
            anchor={animProgress}
          />
        )}
      </View>
    </View>
  );
}

function StarBurst({
  leveledUp,
  anchor,
}: {
  leveledUp: boolean;
  anchor: SharedValue<number>;
}) {
  // 채워진 영역의 끝(= fill의 우측 모서리)에 anchor를 위치시킴
  const anchorStyle = useAnimatedStyle(() => ({
    left: `${anchor.value * 100}%`,
  }));

  const count = leveledUp ? 14 : 8;
  const indices = Array.from({ length: count }, (_, i) => i);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          top: "50%",
          width: 0,
          height: 0,
        },
        anchorStyle,
      ]}
    >
      {indices.map((i) => (
        <StarParticle key={i} index={i} count={count} leveledUp={leveledUp} />
      ))}
    </Animated.View>
  );
}

function StarParticle({
  index,
  count,
  leveledUp,
}: {
  index: number;
  count: number;
  leveledUp: boolean;
}) {
  const t = useSharedValue(0);

  // 360도 균등 분포 + 약간의 랜덤 흔들림
  const baseAngle = (index / count) * Math.PI * 2;
  const jitter = (Math.random() - 0.5) * 0.4;
  const angle = baseAngle + jitter;
  const distance = (leveledUp ? 56 : 36) + Math.random() * 14;
  const dx = Math.cos(angle) * distance;
  const dy = Math.sin(angle) * distance;
  const size = leveledUp ? 16 + Math.random() * 6 : 12 + Math.random() * 4;
  const duration = leveledUp ? 900 : 700;
  const startDelay = Math.random() * 60;

  useEffect(() => {
    t.value = withTiming(1, {
      duration,
      easing: Easing.out(Easing.cubic),
    });
    // 약간의 시작 딜레이 (자연스러운 산개)
    if (startDelay > 0) {
      t.value = 0;
      setTimeout(() => {
        t.value = withTiming(1, {
          duration,
          easing: Easing.out(Easing.cubic),
        });
      }, startDelay);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const style = useAnimatedStyle(() => {
    const p = t.value;
    // scale: 0 → 1.1 (peak at p=0.25) → 0
    const scale =
      p < 0.25 ? (p / 0.25) * 1.1 : Math.max(0, 1.1 * (1 - (p - 0.25) / 0.75));
    return {
      opacity: 1 - p * p,
      transform: [
        { translateX: dx * p },
        { translateY: dy * p },
        { scale },
        { rotate: `${p * 360}deg` },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: -size / 2,
          top: -size / 2,
        },
        style,
      ]}
    >
      <MaterialCommunityIcons
        name="star"
        size={size}
        color={Colors.star}
      />
    </Animated.View>
  );
}
