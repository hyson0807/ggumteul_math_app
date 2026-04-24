import { Image, View } from "react-native";
import { Colors } from "@/constants/colors";

export const StartupSplash = () => (
  <View
    style={{
      flex: 1,
      backgroundColor: Colors.splashBg,
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <Image
      source={require("@/assets/images/splash-icon.png")}
      style={{ width: 200, height: 200 }}
      resizeMode="contain"
    />
  </View>
);
