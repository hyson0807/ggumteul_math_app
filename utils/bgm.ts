import { AppState, type AppStateStatus, type NativeEventSubscription } from "react-native";
import { createAudioPlayer, type AudioPlayer } from "expo-audio";

export type BgmKey = "home" | "shop" | "map";

const SOURCES: Record<BgmKey, number> = {
  home: require("@/assets/music/home-bgm.mp3"),
  shop: require("@/assets/music/shop-bgm.mp3"),
  map: require("@/assets/music/map-bgm.mp3"),
};

const VOLUMES: Record<BgmKey, number> = {
  home: 0.35,
  shop: 0.35,
  map: 0.35,
};

const players: Partial<Record<BgmKey, AudioPlayer>> = {};
let currentKey: BgmKey | null = null;
let appStateSub: NativeEventSubscription | null = null;

const getPlayer = (key: BgmKey): AudioPlayer | null => {
  const cached = players[key];
  if (cached) return cached;
  try {
    const p = createAudioPlayer(SOURCES[key]);
    p.loop = true;
    p.volume = VOLUMES[key];
    players[key] = p;
    return p;
  } catch {
    return null;
  }
};

const handleAppStateChange = (state: AppStateStatus) => {
  if (!currentKey) return;
  const player = players[currentKey];
  if (!player) return;
  if (state === "active") player.play();
  else player.pause();
};

const ensureAppStateListener = () => {
  if (appStateSub) return;
  appStateSub = AppState.addEventListener("change", handleAppStateChange);
};

export const playBgm = (key: BgmKey) => {
  if (currentKey === key) {
    players[key]?.play();
    return;
  }
  if (currentKey) players[currentKey]?.pause();
  const player = getPlayer(key);
  if (!player) return;
  currentKey = key;
  player.play();
  ensureAppStateListener();
};

export const pauseBgm = () => {
  if (!currentKey) return;
  players[currentKey]?.pause();
};
