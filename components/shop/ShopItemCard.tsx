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

  // 모두 초록 패밀리 + 흰 배경 (village 톤앤매너 유지). 시각 차이는 다음 축으로 표현:
  //  · 테두리 색 농도 (장착=primary 진한 초록 / 보유=primaryLight 연한 초록 / 미보유=회색)
  //  · 그림자 (장착에만 초록 톤 elevation)
  //  · 뱃지 위치+모양 (장착=우상단 ✓ 원 / 보유=좌상단 "보유" 알약 / 미보유=없음)
  //  · CTA 채움/외곽 (장착=솔리드 진한 / 보유=외곽선만 / 미보유=솔리드 cta)
  const cardInlineStyle = isEquipped
    ? {
        backgroundColor: Colors.surface,
        borderColor: Colors.primary,
        borderWidth: 2,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.22,
        shadowRadius: 8,
        elevation: 4,
      }
    : isOwnedNotEquipped
      ? {
          backgroundColor: Colors.surface,
          borderColor: Colors.primaryLight,
          borderWidth: 2,
        }
      : {
          backgroundColor: Colors.surface,
          borderColor: Colors.surfaceBorder,
          borderWidth: 1,
        };

  const ctaLabel = isEquipped
    ? "장착 중"
    : isOwnedNotEquipped
      ? "장착하기"
      : locked
        ? `Lv.${item.unlockStage} 해제`
        : `${item.price} 코인`;

  const ctaInlineStyle = isEquipped
    ? { backgroundColor: Colors.primary }
    : isOwnedNotEquipped
      ? {
          backgroundColor: Colors.surface,
          borderColor: Colors.primaryLight,
          borderWidth: 1,
        }
      : locked
        ? { backgroundColor: Colors.surfaceBorder }
        : { backgroundColor: Colors.cta };

  const ctaTextColorHex = isEquipped
    ? "#fff"
    : isOwnedNotEquipped
      ? Colors.primary
      : locked
        ? Colors.textSecondary
        : "#fff";

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={busy}
      className="flex-1 rounded-2xl p-3"
      style={cardInlineStyle}
    >
      {isEquipped && (
        <View className="absolute -top-2 -right-2 z-10 bg-village-primary w-7 h-7 rounded-full items-center justify-center border-2 border-white">
          <MaterialCommunityIcons name="check-bold" size={16} color="#fff" />
        </View>
      )}

      {isOwnedNotEquipped && (
        <View
          className="absolute -top-2 left-2 z-10 px-2 py-0.5 rounded-full border border-white"
          style={{ backgroundColor: Colors.primaryLight }}
        >
          <Text className="text-[10px] font-bold text-white">보유</Text>
        </View>
      )}

      <View
        className="h-24 items-center justify-center rounded-xl mb-2"
        style={{ backgroundColor: "rgba(255, 255, 255, 0.65)" }}
      >
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
        className="rounded-xl py-2 items-center flex-row justify-center"
        style={ctaInlineStyle}
      >
        {busy ? (
          <ActivityIndicator color={ctaTextColorHex} size="small" />
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
              className="text-xs font-bold"
              style={{ color: ctaTextColorHex }}
            >
              {ctaLabel}
            </Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}
