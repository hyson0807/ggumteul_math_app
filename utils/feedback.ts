import * as Haptics from "expo-haptics";
import { createAudioPlayer, type AudioPlayer } from "expo-audio";

type FeedbackKey = "tab" | "worm";

const SOURCES: Record<FeedbackKey, number> = {
  tab: require("@/assets/sounds/tab-press.mp3"),
  worm: require("@/assets/sounds/worm-tap.mp3"),
};

const players = new Map<FeedbackKey, AudioPlayer | null>();

const getPlayer = (key: FeedbackKey): AudioPlayer | null => {
  if (!players.has(key)) {
    try {
      players.set(key, createAudioPlayer(SOURCES[key]));
    } catch {
      players.set(key, null);
    }
  }
  return players.get(key) ?? null;
};

const playOnce = (key: FeedbackKey) => {
  const player = getPlayer(key);
  if (!player) return;
  player.seekTo(0);
  player.play();
};

export const feedback = {
  tabPress: () => {
    Haptics.selectionAsync().catch(() => {});
    playOnce("tab");
  },
  wormTap: () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    playOnce("worm");
  },
};
