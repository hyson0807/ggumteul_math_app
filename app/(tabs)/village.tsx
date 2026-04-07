import { useEffect } from "react";
import {
  View,
  Text,
  ImageBackground,
  Image,
  Pressable,
  useWindowDimensions,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "@/stores/useAuthStore";

type Building = {
  name: string;
  image: number;
  // 화면 너비/높이 대비 비율 (0~1)
  topRatio: number;
  leftRatio: number;
  sizeRatio: number; // 화면 너비 대비 건물 너비 비율
};

const BUILDINGS: Building[] = [
  {
    name: "공원",
    image: require("@/assets/images/buildings/park.png"),
    topRatio: 0.18,
    leftRatio: 0.55,
    sizeRatio: 0.42,
  },
  {
    name: "학교",
    image: require("@/assets/images/buildings/school.png"),
    topRatio: 0.39,
    leftRatio: 0.62,
    sizeRatio: 0.42,
  },
  {
    name: "집",
    image: require("@/assets/images/buildings/house.png"),
    topRatio: 0.23,
    leftRatio: 0.04,
    sizeRatio: 0.42,
  },
  {
    name: "상점",
    image: require("@/assets/images/buildings/shop.png"),
    topRatio: 0.5,
    leftRatio: 0,
    sizeRatio: 0.42,
  },
];

export default function VillageScreen() {
  const user = useAuthStore((s) => s.user);
  const insets = useSafeAreaInsets();
  const { width: screenW, height: screenH } = useWindowDimensions();

  return (
    <View className="flex-1">
      <ImageBackground
        source={require("@/assets/images/village.png")}
        className="flex-1"
        resizeMode="cover"
      >
      <View
        className="flex-1 bg-transparent px-4"
        style={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 96 }}
      >
      {/* 유저 정보 바 */}
      <View className="flex-row items-center bg-white/90 rounded-2xl px-4 py-2 mb-4 border border-[#E8D5C4]">
        {/* 아바타 */}
        <View className="w-8 h-8 rounded-full bg-[#FFE0B2] items-center justify-center">
          <MaterialCommunityIcons name="account" size={20} color="#8D6E63" />
        </View>
        {/* 이름 */}
        <Text className="text-sm font-bold text-[#5D4037] ml-2">
          {user?.name ?? "마을"}
        </Text>
        {/* 구분선 */}
        <View className="w-[1px] h-4 bg-[#D4C4B0] mx-3" />
        {/* 별 */}
        <Text className="text-xs text-[#8D6E63]">별 획득: </Text>
        <Text className="text-xs font-bold text-[#5D4037]">{user?.stars ?? 0}</Text>
        <MaterialCommunityIcons name="star" size={16} color="#FFD700" style={{ marginLeft: 2 }} />
        {/* 코인 */}
        <Text className="text-xs text-[#8D6E63] ml-3">코인: </Text>
        <Text className="text-xs font-bold text-[#5D4037]">{user?.coins ?? 0}</Text>
        <MaterialCommunityIcons name="circle" size={14} color="#DAA520" style={{ marginLeft: 2 }} />
      </View>

      {/* 마을 맵 - 배경 위 자유 배치 */}
      <View className="flex-1">
        {BUILDINGS.map((building, index) => (
          <AnimatedBuilding
            key={building.name}
            building={building}
            index={index}
            screenW={screenW}
            screenH={screenH}
          />
        ))}
      </View>

      </View>
      </ImageBackground>
    </View>
  );
}

type AnimatedBuildingProps = {
  building: Building;
  index: number;
  screenW: number;
  screenH: number;
};

function AnimatedBuilding({ building, index, screenW, screenH }: AnimatedBuildingProps) {
  const size = screenW * building.sizeRatio;
  const translateY = useSharedValue(0);

  useEffect(() => {
    // 건물마다 다른 주기/시작 시점으로 동기화 방지
    const duration = 2400 + index * 300;
    const delay = index * 400;

    translateY.value = withDelay(
      delay,
      withRepeat(
        withTiming(-1., {
          duration,
          easing: Easing.inOut(Easing.sin),
        }),
        -1, // 무한 반복
        true // reverse: 위→아래→위...
      )
    );
  }, [index, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          top: screenH * building.topRatio,
          left: screenW * building.leftRatio,
          width: size,
          alignItems: "center",
        },
        animatedStyle,
      ]}
    >
      <Pressable style={{ alignItems: "center" }}>
        <Image
          source={building.image}
          style={{ width: size, height: size }}
          resizeMode="contain"
        />
      </Pressable>
    </Animated.View>
  );
}
