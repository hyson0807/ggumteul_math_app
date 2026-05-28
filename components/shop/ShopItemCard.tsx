import { View, Text, TouchableOpacity, ActivityIndicator, Image } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { API_BASE_URL } from "@/services/api";
import { SHOP_CATEGORY_BY_KEY } from "@/constants/shop";
import { isFurnitureCategory, type ShopItemWithStatus } from "@/types/shop";

interface Props {
  item: ShopItemWithStatus;
  currentStage: number;
  onPurchase: () => void;
  onTryOn?: () => void;
  previewing?: boolean;
  disabled?: boolean;
  busy?: boolean;
}

export function ShopItemCard({
  item,
  currentStage,
  onPurchase,
  onTryOn,
  previewing,
  disabled,
  busy,
}: Props) {
  const locked = currentStage < item.unlockStage;
  const isOwned = item.owned;
  const ctaLabel = isOwned
    ? item.equipped
      ? "장착 중"
      : "보유중"
    : locked
      ? `Lv.${item.unlockStage} 해제`
      : `${item.price} 코인`;
  const ctaDisabled = disabled || isOwned || locked;

  return (
    <TouchableOpacity
      activeOpacity={onTryOn ? 0.8 : 1}
      onPress={onTryOn}
      disabled={!onTryOn}
      className={`flex-1 rounded-2xl p-3 border ${
        previewing
          ? "bg-white border-village-primary border-2"
          : "bg-village-surface border-village-border"
      }`}
    >
      {previewing && (
        <View className="absolute -top-2 -right-2 z-10 bg-village-primary w-6 h-6 rounded-full items-center justify-center border-2 border-white">
          <MaterialCommunityIcons name="check" size={14} color="#fff" />
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
      <Text className="text-[11px] text-village-text-secondary mb-2" numberOfLines={2}>
        {item.description}
      </Text>

      <TouchableOpacity
        className={`rounded-xl py-2 items-center flex-row justify-center ${
          ctaDisabled ? "bg-village-border" : "bg-village-primary"
        }`}
        disabled={ctaDisabled}
        onPress={onPurchase}
        activeOpacity={0.8}
      >
        {busy ? (
          <ActivityIndicator color="#fff" size="small" />
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
            <Text
              className={`text-xs font-bold ${
                ctaDisabled ? "text-village-text-secondary" : "text-white"
              }`}
            >
              {ctaLabel}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  );
}
