import { View } from "react-native";
import { WormSprite } from "@/components/worm/WormSprite";
import { useAuthStore } from "@/stores/useAuthStore";
import { MAX_WORM_STAGE } from "@/constants/worm";

interface Props {
  focused: boolean;
}

export function WormTabIcon({ focused }: Props) {
  const user = useAuthStore((s) => s.user);
  const stage = Math.min(Math.max(user?.wormStage ?? 1, 1), MAX_WORM_STAGE);

  return (
    <View
      style={{
        width: 40,
        height: 30,
        alignItems: "center",
        justifyContent: "center",
        opacity: focused ? 1 : 0.55,
      }}
    >
      <WormSprite stage={stage} size={0.24} />
    </View>
  );
}
