import { useEffect } from "react";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useFonts, Jua_400Regular } from "@expo-google-fonts/jua";
import { GowunDodum_400Regular } from "@expo-google-fonts/gowun-dodum";
import * as SplashScreen from "expo-splash-screen";
import { useStartupFlow } from "@/hooks/useStartupFlow";
import { StartupSplash } from "@/components/startup/StartupSplash";
import { UpdateRequiredModal } from "@/components/startup/UpdateRequiredModal";
import { useAuthStore } from "@/stores/useAuthStore";
import { isUserOnboarded } from "@/utils/onboarding";

export default function StartupScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [fontsLoaded] = useFonts({
    Jua: Jua_400Regular,
    GowunDodum: GowunDodum_400Regular,
  });
  const { isDone, updateRequired, storeUrl } = useStartupFlow(queryClient);

  useEffect(() => {
    if (updateRequired) {
      SplashScreen.hideAsync().catch(() => {});
      return;
    }
    if (!isDone || !fontsLoaded) return;

    SplashScreen.hideAsync().catch(() => {});

    const { isAuthenticated, user } = useAuthStore.getState();

    if (!isAuthenticated) {
      router.replace("/(auth)/login");
    } else if (!isUserOnboarded(user)) {
      router.replace("/(onboarding)/select-tutor");
    } else {
      router.replace("/(tabs)/home");
    }
  }, [isDone, fontsLoaded, updateRequired, router]);

  if (updateRequired && storeUrl) {
    return <UpdateRequiredModal storeUrl={storeUrl} />;
  }

  return <StartupSplash />;
}
