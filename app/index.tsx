import { Redirect } from "expo-router";
import { useAuthStore } from "@/stores/useAuthStore";

export default function Index() {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!user?.tutorType) {
    return <Redirect href="/(onboarding)/select-tutor" />;
  }

  return <Redirect href="/(tabs)/village" />;
}
