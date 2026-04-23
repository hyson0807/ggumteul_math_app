import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { useAuthStore } from "@/stores/useAuthStore";
import { useWorm } from "@/hooks/useWorm";
import { useStages } from "@/hooks/useLearning";
import { WormScene } from "@/components/worm/WormScene";
import { HUD } from "@/components/worm/HUD";
import { FocusCard } from "@/components/worm/FocusCard";
import { unitFromWorm, type UnitId } from "@/constants/units";

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const { data: worm, isLoading } = useWorm();
  const { data: stagesData } = useStages();
  const [focusOpen, setFocusOpen] = useState(false);
  const scrollToUnitRef = useRef<((u: UnitId) => void) | null>(null);

  if (isLoading || !worm) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#2A1810",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color="#DAA520" />
      </View>
    );
  }

  const currentUnit = unitFromWorm(worm.stage);
  const currentStageInfo = stagesData?.stages.find((s) => s.current);
  const totalNodes = currentStageInfo?.totalNodes ?? 0;
  const clearedNodes = currentStageInfo?.clearedNodes ?? 0;

  const goToProblem = () => {
    setFocusOpen(false);
    router.push(`/stage/${worm.stage}`);
  };

  const handleCta = () => {
    if (focusOpen) {
      goToProblem();
    } else {
      setFocusOpen(true);
      scrollToUnitRef.current?.(currentUnit);
    }
  };

  const bottomCtaBase = insets.bottom + 92;

  return (
    <View style={{ flex: 1, backgroundColor: "#2A1810" }}>
      <WormScene
        worm={worm}
        currentUnit={currentUnit}
        scrollToUnitRef={scrollToUnitRef}
      />

      <HUD
        coins={user?.coins ?? 0}
        unit={currentUnit}
        progress={clearedNodes}
        total={totalNodes}
        topInset={insets.top}
        onMapPress={() => router.push("/map")}
      />

      {/* CTA "문제 풀기" (or "여기서부터 풀기" when focus open) */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handleCta}
        style={{
          position: "absolute",
          left: 18,
          right: 18,
          bottom: bottomCtaBase,
          height: 56,
          borderRadius: 20,
          backgroundColor: focusOpen ? "#DAA520" : "#C0392B",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          gap: 8,
          shadowColor: focusOpen ? "#DAA520" : "#C0392B",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.45,
          shadowRadius: 20,
          elevation: 8,
        }}
      >
        {focusOpen ? (
          <>
            <Svg width={20} height={20} viewBox="0 0 20 20">
              <Path d="M4 10 L9 5 L9 8 L16 8 L16 12 L9 12 L9 15 Z" fill="#C0392B" />
            </Svg>
            <Text style={{ color: "#C0392B", fontSize: 17, fontWeight: "900" }}>
              여기서부터 풀기
            </Text>
          </>
        ) : (
          <>
            <Svg width={20} height={20} viewBox="0 0 20 20">
              <Path
                d="M10 3 L13 9 L19 10 L14.5 14 L16 20 L10 17 L4 20 L5.5 14 L1 10 L7 9 Z"
                fill="#fff"
              />
            </Svg>
            <Text style={{ color: "#fff", fontSize: 17, fontWeight: "900" }}>
              문제 풀기
            </Text>
          </>
        )}
      </TouchableOpacity>

      {focusOpen && (
        <FocusCard
          unit={currentUnit}
          bottomOffset={bottomCtaBase + 72}
          onClose={() => setFocusOpen(false)}
          onStartSolve={goToProblem}
        />
      )}
    </View>
  );
}
