import { useEffect } from "react";
import { usePathname } from "expo-router";
import { pauseBgm, playBgm, type BgmKey } from "@/utils/bgm";

const BGM_BY_PATH: Record<string, BgmKey> = {
  "/home": "home",
  "/recommend": "home",
  "/recommend-session": "home",
  "/concept-learning": "home",
  "/room": "shop",
};

export function BgmController() {
  const pathname = usePathname();
  useEffect(() => {
    const key = BGM_BY_PATH[pathname];
    if (key) playBgm(key);
    else pauseBgm();
  }, [pathname]);
  return null;
}
