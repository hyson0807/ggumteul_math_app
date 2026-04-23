import { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePurchaseItem, useShopItems } from "@/hooks/useShop";
import { useToastStore } from "@/stores/useToastStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { ShopItemCard } from "@/components/shop/ShopItemCard";
import { getApiErrorMessage } from "@/services/api";
import { SHOP_CATEGORY_CONFIG } from "@/constants/shop";
import type { ShopCategory, ShopItemWithStatus } from "@/types/shop";

export default function ShopScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const showToast = useToastStore((s) => s.show);
  const { data: items = [], isLoading } = useShopItems();
  const purchase = usePurchaseItem();
  const [category, setCategory] = useState<ShopCategory>("hat");

  const filtered = useMemo<ShopItemWithStatus[]>(
    () => items.filter((i) => i.category === category),
    [items, category],
  );

  const handlePurchase = (item: ShopItemWithStatus) => {
    purchase.mutate(item.id, {
      onSuccess: () => showToast(`${item.name} 구매 완료!`, "success"),
      onError: (e) => showToast(getApiErrorMessage(e, "구매에 실패했어요."), "error"),
    });
  };

  return (
    <View
      className="flex-1 bg-transparent px-5"
      style={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 96 }}
    >
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-xl font-bold text-village-text">상점</Text>
        <View className="flex-row items-center bg-white/80 rounded-full px-3 py-1.5 border border-village-border">
          <MaterialCommunityIcons name="circle" size={14} color="#DAA520" />
          <Text className="text-sm font-bold text-village-text ml-1">
            {user?.coins ?? 0}
          </Text>
        </View>
      </View>

      {/* 카테고리 탭 */}
      <View className="flex-row mb-4 bg-village-surface rounded-2xl p-1 border border-village-border">
        {SHOP_CATEGORY_CONFIG.map((c) => {
          const active = c.key === category;
          return (
            <TouchableOpacity
              key={c.key}
              className={`flex-1 py-2 rounded-xl flex-row items-center justify-center ${
                active ? "bg-village-primary" : ""
              }`}
              onPress={() => setCategory(c.key)}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name={c.icon as never}
                size={16}
                color={active ? "#fff" : "#8D6E63"}
              />
              <Text
                className={`ml-1 text-sm font-semibold ${
                  active ? "text-white" : "text-village-text-secondary"
                }`}
              >
                {c.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#A0522D" />
        </View>
      ) : filtered.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-village-text-secondary">
            아이템이 아직 없어요.
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          <View className="flex-row flex-wrap -mx-1">
            {filtered.map((item) => (
              <View key={item.id} className="w-1/2 px-1 mb-2">
                <ShopItemCard
                  item={item}
                  currentStage={user?.wormStage ?? 1}
                  onPurchase={() => handlePurchase(item)}
                  busy={purchase.isPending && purchase.variables === item.id}
                />
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
