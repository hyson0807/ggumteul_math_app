import { useRef, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "@/stores/useAuthStore";
import { useWorm } from "@/hooks/useWorm";
import { useStageNodes, useStages } from "@/hooks/useLearning";
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
  const { data: stageNodesData } = useStageNodes(worm?.stage ?? 1);
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
  const activeNode =
    stageNodesData?.nodes.find((n) => n.playable && !n.locked && !n.cleared) ??
    null;

  const handleWormPress = () => {
    setFocusOpen((open) => !open);
    scrollToUnitRef.current?.(currentUnit);
  };

  const goToStage = () => {
    setFocusOpen(false);
    router.push(`/stage/${worm.stage}`);
  };

  const goToActiveConcept = () => {
    if (!activeNode) {
      goToStage();
      return;
    }
    setFocusOpen(false);
    router.push(`/concept/${activeNode.conceptId}`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#2A1810" }}>
      <WormScene
        worm={worm}
        currentUnit={currentUnit}
        scrollToUnitRef={scrollToUnitRef}
        onWormPress={handleWormPress}
      />

      <HUD
        coins={user?.coins ?? 0}
        unit={currentUnit}
        progress={clearedNodes}
        total={totalNodes}
        topInset={insets.top}
        onMapPress={() => router.push("/map")}
      />

      {focusOpen && (
        <FocusCard
          unit={currentUnit}
          activeConceptName={activeNode?.name ?? null}
          clearedNodes={clearedNodes}
          totalNodes={totalNodes}
          stageCleared={currentStageInfo?.cleared ?? false}
          bottomOffset={insets.bottom + 96}
          onClose={() => setFocusOpen(false)}
          onStartSolve={goToActiveConcept}
          onViewStage={goToStage}
        />
      )}
    </View>
  );
}
