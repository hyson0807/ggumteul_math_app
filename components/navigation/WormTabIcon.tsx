import { View } from "react-native";
import { WormSprite } from "@/components/worm/WormSprite";

interface Props {
  focused: boolean;
}

export function WormTabIcon({ focused }: Props) {
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
      <WormSprite size={0.24} />
    </View>
  );
}
