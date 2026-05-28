import { View, Text, TouchableOpacity, ActivityIndicator, Image } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { API_BASE_URL } from "@/services/api";
import { SHOP_CATEGORY_BY_KEY } from "@/constants/shop";
import { isFurnitureCategory, type ShopItemWithStatus } from "@/types/shop";

interface Props {
  item: ShopItemWithStatus;
  currentStage: number;
  onPress: () => void;
  busy?: boolean;
}

export function ShopItemCard({ item, currentStage, onPress, busy }: Props) {
  const locked = currentStage < item.unlockStage;
  const isOwned = item.owned;
  const isEquipped = isOwned && item.equipped;
  const isOwnedNotEquipped = isOwned && !item.equipped;

  const cardContainer = isEquipped
    ? "bg-white border-2 border-village-primary"
    : isOwnedNotEquipped
      ? "bg-village-primary/5 border border-dashed border-village-primary"
      : "bg-village-surface border border-village-border";

  const ctaLabel = isEquipped
    ? "장착 중"
    : isOwnedNotEquipped
      ? "장착하기"
      : locked
        ? `Lv.${item.unlockStage} 해제`
        : `${item.price} 코인`;
  const ctaContainer = isEquipped
    ? "bg-village-primary"
    : isOwnedNotEquipped
      ? "bg-white border border-village-primary"
      : locked
        ? "bg-village-border"
        : "bg-village-cta";
  const ctaTextColor = isEquipped
    ? "text-white"
    : isOwnedNotEquipped
      ? "text-village-primary"
      : locked
        ? "text-village-text-secondary"
        : "text-white";

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={busy}
      className={`flex-1 rounded-2xl p-3 ${cardContainer}`}
    >
      {isEquipped && (
        <View className="absolute -top-2 -right-2 z-10 bg-village-primary w-7 h-7 rounded-full items-center justify-center border-2 border-white">
          <MaterialCommunityIcons name="check-bold" size={16} color="#fff" />
        </View>
      )}

      {isOwnedNotEquipped && (
        <View className="absolute -top-2 left-2 z-10 bg-village-primary px-2 py-0.5 rounded-full border border-white">
          <Text className="text-[10px] font-bold text-white">보유</Text>
        </View>
      )}

      <View className="h-24 items-center justify-center bg-white/60 rounded-xl mb-2">
        {isFurnitureCategory(item.category) ? (
          <Image
            source={{ uri: `${API_BASE_URL}${item.imageUrl}` }}
            style={{ width: "85%", height: "85%", opacity: locked ? 0.4 : 1 }}
            resizeMode="contain"
          />
        ) : (
          <MaterialCommunityIcons
            name={(SHOP_CATEGORY_BY_KEY[item.category]?.icon ?? "help-circle") as never}
            size={42}
            color={locked ? Colors.inactive : Colors.primary}
          />
        )}
      </View>

      <Text className="text-sm font-bold text-village-text" numberOfLines={1}>
        {item.name}
      </Text>
      <Text
        className="text-[11px] text-village-text-secondary mb-2"
        numberOfLines={1}
        style={{ lineHeight: 14, minHeight: 14 }}
      >
        {item.description}
      </Text>

      <View
        className={`rounded-xl py-2 items-center flex-row justify-center ${ctaContainer}`}
      >
        {busy ? (
          <ActivityIndicator
            color={isOwnedNotEquipped ? Colors.primary : "#fff"}
            size="small"
          />
        ) : (
          <>
            {!isOwned && !locked && (
              <MaterialCommunityIcons
                name="circle"
                size={12}
                color={Colors.star}
                style={{ marginRight: 4 }}
              />
            )}
            <Text className={`text-xs font-bold ${ctaTextColor}`}>
              {ctaLabel}
            </Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}
