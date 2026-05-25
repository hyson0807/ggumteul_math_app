import { useEffect, useRef } from "react";
import { Animated, Easing, Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { feedback } from "@/utils/feedback";
import { useAuthStore } from "@/stores/useAuthStore";
import { useWorm } from "@/hooks/useWorm";
import { WormSprite } from "@/components/worm/WormSprite";
import { HomeHeader } from "@/components/home/HomeHeader";
import { ActionCard } from "@/components/home/ActionCard";

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const { data: worm } = useWorm();

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
      />

      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 64,
          gap: 28,
        }}
      >
        <WormStage equipped={worm?.equipped} />

        <View style={{ flexDirection: "row", gap: 12, width: "100%" }}>
          <ActionCard
            title="개념 학습"
            subtitle="학년별·개념별로 풀기"
            icon="book-open-variant"
            onPress={() => router.push("/concept-learning")}
          />
          <ActionCard
            title="문제 추천"
            subtitle="오늘의 맞춤 학습"
            icon="lightbulb-on-outline"
            onPress={() => router.push("/recommend")}
          />
        </View>
      </View>
    </View>
  );
}

function WormStage({
  equipped,
}: {
  equipped?: NonNullable<ReturnType<typeof useWorm>["data"]>["equipped"];
}) {
  const bob = useRef(new Animated.Value(0)).current;
  const tapScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, {
          toValue: -4,
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

  return (
    <View style={{ alignItems: "center" }}>
      <Pressable
        accessibilityLabel="지렁이 꿈틀이"
        hitSlop={16}
        onPress={() => feedback.wormTap()}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
      >
        <Animated.View
          style={{ transform: [{ translateY: bob }, { scale: tapScale }] }}
        >
          <WormSprite equipped={equipped} size={1.4} />
        </Animated.View>
      </Pressable>
      <View
        pointerEvents="none"
        style={{
          marginTop: 8,
          width: 130,
          height: 10,
          borderRadius: 999,
          backgroundColor: Colors.surfaceBorder,
          opacity: 0.6,
        }}
      />
    </View>
  );
}
