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
    // keepAudioSessionActive: pause 시 expo-audio 가 100ms 뒤 예약하는
    // AVAudioSession.setActive(false) 콜백을 끈다. BGM 전환(pause home → play map)
    // 순간 map 의 AVPlayer 가 아직 .waitingToPlay 상태인데 콜백이 "활성 player 없음"
    // 으로 판단해 전 세션을 deactivate → map BGM 이 시작됐다 끊기는 회귀를 막음.
    // downloadFirst: iOS 릴리즈에서 asset 디코딩을 tmp 로 미리 풀어 로드 지연 완화.
    const p = createAudioPlayer(SOURCES[key], {
      downloadFirst: true,
      keepAudioSessionActive: true,
    });
    p.loop = true;
    p.volume = VOLUMES[key];
    players[key] = p;
    return p;
  } catch {
    return null;
  }
};

export const preloadAllBgm = () => {
  (Object.keys(SOURCES) as BgmKey[]).forEach((key) => {
    getPlayer(key);
  });
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
  ensureAppStateListener();

  if (player.isLoaded) {
    player.play();
    return;
  }
  // 로드 완료 전 .play() 호출이 iOS 릴리즈에서 조용히 no-op 되는 사례가 있어
  // playbackStatusUpdate 로 isLoaded 를 기다렸다가 재생
  const sub = player.addListener("playbackStatusUpdate", (status) => {
    if (!status.isLoaded) return;
    sub.remove();
    if (currentKey === key) player.play();
  });
};

export const pauseBgm = () => {
  if (!currentKey) return;
  players[currentKey]?.pause();
};
