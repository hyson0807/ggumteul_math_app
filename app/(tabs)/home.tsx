import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { caterpillarImage } from "@/constants/caterpillars";
import { feedback } from "@/utils/feedback";
import { useAuthStore } from "@/stores/useAuthStore";
import { useWorm, useFeedWorm } from "@/hooks/useWorm";
import { HomeHeader } from "@/components/home/HomeHeader";
import { ActionCard } from "@/components/home/ActionCard";
import type { WormState } from "@/types/worm";

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const { data: worm } = useWorm();
  const feedMutation = useFeedWorm();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.background,
        paddingTop: insets.top,
      }}
    >
      <HomeHeader
        name={user?.name ?? "친구"}
        coins={user?.coins ?? 0}
        feed={worm?.feed ?? user?.feed ?? 0}
      />

      {/* 레벨업 진행도 — 헤더 바로 아래, 가로 꽉 차게 */}
      <LevelProgress worm={worm} />

      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 64,
          gap: 24,
        }}
      >
        <WormStage
          worm={worm}
          onFeed={() => feedMutation.mutate()}
          feeding={feedMutation.isPending}
        />

        <View style={{ flexDirection: "row", gap: 14, width: "100%" }}>
          <ActionCard
            title="개념 학습"
            subtitle="차근차근 배우기"
            icon="school-outline"
            accent={Colors.primary}
            onPress={() => router.push("/concept-learning")}
          />
          <ActionCard
            title="문제 추천"
            subtitle="약점 극복하기"
            icon="bullseye-arrow"
            accent={Colors.cta}
            onPress={() => router.push("/recommend-intro")}
          />
        </View>
      </View>
    </View>
  );
}

function LevelProgress({ worm }: { worm: WormState | undefined }) {
  const level = worm?.level ?? 1;
  const feed = worm?.feed ?? 0;
  const isMax = worm?.isMax ?? false;
  const progress = worm?.levelProgress ?? 1;

  const rightText = isMax
    ? null
    : feed > 0
      ? `먹이 ${feed}개 · 탭하여 주기`
      : `다음 레벨까지 ${worm?.feedToNextLevel ?? 0}개`;

  return (
    <View style={{ paddingHorizontal: 20, paddingTop: 2, paddingBottom: 8, gap: 7 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
          <MaterialCommunityIcons name="sprout" size={15} color={Colors.success} />
          <Text style={{ fontSize: 13, fontWeight: "800", color: Colors.text }}>
            꿈틀이 Lv.{level}
            {isMax ? " · 만렙!" : ""}
          </Text>
        </View>
        {rightText && (
          <Text style={{ fontSize: 11, color: Colors.textSecondary, fontWeight: "700" }}>
            {rightText}
          </Text>
        )}
      </View>

      <View
        style={{
          height: 10,
          backgroundColor: Colors.surfaceBorder,
          borderRadius: 999,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            height: "100%",
            width: `${Math.round(progress * 100)}%`,
            backgroundColor: Colors.success,
            borderRadius: 999,
          }}
        />
      </View>
    </View>
  );
}

function WormStage({
  worm,
  onFeed,
  feeding,
}: {
  worm: WormState | undefined;
  onFeed: () => void;
  feeding: boolean;
}) {
  const level = worm?.level ?? 1;
  const feed = worm?.feed ?? 0;

  const bob = useRef(new Animated.Value(0)).current;
  const tapScale = useRef(new Animated.Value(1)).current;
  const levelUpOpacity = useRef(new Animated.Value(0)).current;
  const prevLevel = useRef(level);
  const [showLevelUp, setShowLevelUp] = useState(false);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, {
          toValue: -6,
          duration: 1600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(bob, {
          toValue: 0,
          duration: 1600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [bob]);

  // 레벨 상승 감지 → 축하 팝 + "레벨 업!" 플래시
  useEffect(() => {
    if (level > prevLevel.current) {
      setShowLevelUp(true);
      Animated.sequence([
        Animated.spring(tapScale, {
          toValue: 1.18,
          useNativeDriver: true,
          speed: 20,
          bounciness: 14,
        }),
        Animated.spring(tapScale, { toValue: 1, useNativeDriver: true, speed: 14 }),
      ]).start();
      Animated.sequence([
        Animated.timing(levelUpOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.delay(900),
        Animated.timing(levelUpOpacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start(() => setShowLevelUp(false));
    }
    prevLevel.current = level;
  }, [level, tapScale, levelUpOpacity]);

  const onPressIn = () => {
    Animated.spring(tapScale, {
      toValue: 0.94,
      useNativeDriver: true,
      speed: 50,
      bounciness: 8,
    }).start();
  };
  const onPressOut = () => {
    Animated.spring(tapScale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 10,
    }).start();
  };

  const canFeed = feed > 0 && !feeding;
  const onPress = () => {
    feedback.wormTap();
    if (canFeed) onFeed();
  };

  return (
    <View style={{ alignItems: "center" }}>
      <Pressable
        accessibilityLabel="애벌레 꿈틀이에게 먹이 주기"
        hitSlop={16}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
      >
        <Animated.View
          style={{ transform: [{ translateY: bob }, { scale: tapScale }] }}
        >
          <Image
            source={caterpillarImage(level)}
            style={{ width: 220, height: 220 }}
            contentFit="contain"
            transition={200}
          />
        </Animated.View>
      </Pressable>
      {showLevelUp && (
        <Animated.View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: -6,
            opacity: levelUpOpacity,
            backgroundColor: Colors.secondary,
            borderRadius: 999,
            paddingHorizontal: 12,
            paddingVertical: 4,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "900", fontSize: 13 }}>
            ✨ 레벨 업!
          </Text>
        </Animated.View>
      )}
    </View>
  );
}
