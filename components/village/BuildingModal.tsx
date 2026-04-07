import { useMemo } from "react";
import {
  Image,
  Modal,
  Pressable,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Colors } from "@/constants/colors";
import { useAuthStore } from "@/stores/useAuthStore";
import { useBuildingStore } from "@/stores/useBuildingStore";
import {
  BUILDING_LABELS,
  BuildingType,
  COIN_COST_PER_TAP,
  MAX_LEVEL,
  MAX_PROGRESS,
} from "@/types/building";

const BUILDING_IMAGES: Record<BuildingType, number> = {
  house: require("@/assets/images/buildings/house.png"),
  school: require("@/assets/images/buildings/school.png"),
  park: require("@/assets/images/buildings/park.png"),
  shop: require("@/assets/images/buildings/shop.png"),
};

interface Props {
  type: BuildingType | null;
  onClose: () => void;
}

export function BuildingModal({ type, onClose }: Props) {
  const visible = type !== null;

  const buildings = useBuildingStore((s) => s.buildings);
  const isUpgrading = useBuildingStore((s) => s.isUpgrading);
  const upgrade = useBuildingStore((s) => s.upgrade);
  const coins = useAuthStore((s) => s.user?.coins ?? 0);

  const building = useMemo(
    () => (type && buildings ? buildings[type] : null),
    [type, buildings],
  );

  const isMaxedOut =
    building != null &&
    building.level >= MAX_LEVEL &&
    building.progress >= MAX_PROGRESS;
  const notEnoughCoins = coins < COIN_COST_PER_TAP;
  const disabled = isUpgrading || isMaxedOut || notEnoughCoins;

  const handleUpgrade = async () => {
    if (!type || disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await upgrade(type);
      // 레벨업 시 더 강한 햅틱
      const before = building;
      const after = useBuildingStore.getState().buildings?.[type];
      if (before && after && after.level > before.level) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const buttonLabel = isMaxedOut
    ? "최대 레벨 달성"
    : notEnoughCoins
      ? "코인이 부족해요"
      : `코인 ${COIN_COST_PER_TAP}개로 진행도 올리기 (+10)`;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <Pressable
        onPress={onClose}
        className="flex-1 items-center justify-center bg-black/50 px-6"
      >
        {/* Card (탭 이벤트가 backdrop으로 전파되지 않도록 Pressable로 감쌈) */}
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="w-full bg-village-surface rounded-3xl border border-village-border p-6"
          style={{ maxWidth: 360 }}
        >
          {/* 닫기 버튼 */}
          <Pressable
            onPress={onClose}
            hitSlop={12}
            className="absolute right-3 top-3 w-8 h-8 items-center justify-center rounded-full bg-black/5"
          >
            <MaterialCommunityIcons name="close" size={18} color={Colors.text} />
          </Pressable>

          {type && building && (
            <>
              {/* 건물 이미지 */}
              <View className="items-center">
                <Image
                  source={BUILDING_IMAGES[type]}
                  style={{ width: 120, height: 120 }}
                  resizeMode="contain"
                />
              </View>

              {/* 이름 + 레벨 */}
              <View className="items-center mt-2">
                <Text className="text-xl font-bold text-village-text">
                  {BUILDING_LABELS[type]}
                </Text>
                <View className="bg-village-primary rounded-full px-3 py-0.5 mt-1">
                  <Text className="text-xs text-white font-bold">
                    Lv. {building.level} / {MAX_LEVEL}
                  </Text>
                </View>
              </View>

              {/* 진행도 바 */}
              <View className="mt-5">
                <View className="flex-row justify-between mb-1">
                  <Text className="text-xs text-village-textSecondary">
                    다음 레벨까지
                  </Text>
                  <Text className="text-xs font-bold text-village-text">
                    {building.progress} / {MAX_PROGRESS}
                  </Text>
                </View>
                <View className="h-3 w-full bg-village-border rounded-full overflow-hidden">
                  <View
                    style={{
                      width: `${Math.min(100, (building.progress / MAX_PROGRESS) * 100)}%`,
                      backgroundColor: Colors.secondary,
                      height: "100%",
                    }}
                  />
                </View>
              </View>

              {/* 보유 코인 */}
              <View className="flex-row items-center justify-center mt-5">
                <Text className="text-xs text-village-textSecondary">
                  보유 코인
                </Text>
                <Text className="text-sm font-bold text-village-text ml-2">
                  {coins}
                </Text>
                <MaterialCommunityIcons
                  name="circle"
                  size={14}
                  color={Colors.coin}
                  style={{ marginLeft: 4 }}
                />
              </View>

              {/* 업그레이드 버튼 */}
              <Pressable
                onPress={handleUpgrade}
                disabled={disabled}
                className="mt-5 rounded-2xl py-4 items-center"
                style={{
                  backgroundColor: disabled ? Colors.inactive : Colors.cta,
                }}
              >
                {isUpgrading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-base font-bold text-white">
                    {buttonLabel}
                  </Text>
                )}
              </Pressable>
            </>
          )}

          {type && !building && (
            <View className="items-center py-10">
              <ActivityIndicator color={Colors.primary} />
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
