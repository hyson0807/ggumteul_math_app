import { useCallback, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "@/stores/useAuthStore";
import { useWorm } from "@/hooks/useWorm";
import { useStageNodes, useStages } from "@/hooks/useLearning";
import { WormScene } from "@/components/worm/WormScene";
import { HUD } from "@/components/worm/HUD";
import { FocusCard } from "@/components/worm/FocusCard";
import { DevStageSwitcher } from "@/components/worm/DevStageSwitcher";
import { STAGE_SCENES, clampStage, type StageId } from "@/constants/stages";
import { pauseBgm, playBgm } from "@/utils/bgm";

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const { data: worm, isLoading } = useWorm();
  const { data: stagesData } = useStages();
  const [focusOpen, setFocusOpen] = useState(false);
  const [devStage, setDevStage] = useState<StageId | null>(null);

  const realStage = worm ? clampStage(worm.stage) : 1;
  const displayStage: StageId = __DEV__ && devStage != null ? devStage : realStage;

  const { data: stageNodesData } = useStageNodes(displayStage);

  useFocusEffect(
    useCallback(() => {
      playBgm("home");
      return () => pauseBgm();
    }, []),
  );

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

  const sceneConfig = STAGE_SCENES[displayStage];
  const currentUnit = sceneConfig.unitId;
  const stageInfo = stagesData?.stages.find((s) => s.stage === displayStage);
  const totalNodes = stageInfo?.totalNodes ?? 0;
  const clearedNodes = stageInfo?.clearedNodes ?? 0;
  const activeNode =
    stageNodesData?.nodes.find((n) => n.playable && !n.locked && !n.cleared) ??
    null;

  const handleWormPress = () => {
    setFocusOpen((open) => !open);
  };

  const goToStage = () => {
    setFocusOpen(false);
    router.push(`/stage/${displayStage}`);
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
        displayStage={displayStage}
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
          stageCleared={stageInfo?.cleared ?? false}
          bottomOffset={insets.bottom + 96}
          onClose={() => setFocusOpen(false)}
          onStartSolve={goToActiveConcept}
          onViewStage={goToStage}
        />
      )}

      {__DEV__ && (
        <DevStageSwitcher
          currentStage={displayStage}
          realStage={realStage}
          onChange={setDevStage}
          bottomOffset={Math.max(insets.bottom, 12) + 64 + 12}
        />
      )}
    </View>
  );
}
