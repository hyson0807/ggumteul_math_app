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
import { router } from "expo-router";
import { usePurchaseItem, useShopItems } from "@/hooks/useShop";
import { useWorm } from "@/hooks/useWorm";
import { useToastStore } from "@/stores/useToastStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { ShopItemCard } from "@/components/shop/ShopItemCard";
import { CategoryTabBar } from "@/components/shop/CategoryTabBar";
import { WormSprite } from "@/components/worm/WormSprite";
import { getApiErrorMessage } from "@/services/api";
import { Colors } from "@/constants/colors";
import type {
  ShopCategory,
  ShopItem,
  ShopItemWithStatus,
} from "@/types/shop";
import type { WormState } from "@/types/worm";

type PreviewMap = Partial<Record<ShopCategory, ShopItem>>;

export default function ShopScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const showToast = useToastStore((s) => s.show);
  const { data: items = [], isLoading } = useShopItems();
  const { data: worm } = useWorm();
  const purchase = usePurchaseItem();
  const [category, setCategory] = useState<ShopCategory>("hat");
  const [preview, setPreview] = useState<PreviewMap>({});

  const filtered = useMemo<ShopItemWithStatus[]>(
    () => items.filter((i) => i.category === category),
    [items, category],
  );

  const mergedEquipped = useMemo<WormState["equipped"]>(
    () => ({
      hat: preview.hat ?? worm?.equipped.hat ?? null,
      body: preview.body ?? worm?.equipped.body ?? null,
      accessory: preview.accessory ?? worm?.equipped.accessory ?? null,
    }),
    [preview, worm?.equipped],
  );

  const hasPreview = Boolean(
    preview.hat || preview.body || preview.accessory,
  );

  const handlePurchase = (item: ShopItemWithStatus) => {
    purchase.mutate(item.id, {
      onSuccess: () =>
        showToast(`${item.name} 구매 완료! 가방에서 장착하세요.`, "success"),
      onError: (e) =>
        showToast(getApiErrorMessage(e, "구매에 실패했어요."), "error"),
    });
  };

  const handleTryOn = (item: ShopItemWithStatus) => {
    setPreview((p) => {
      const cur = p[item.category];
      if (cur?.id === item.id) {
        const next = { ...p };
        delete next[item.category];
        return next;
      }
      return { ...p, [item.category]: item };
    });
  };

  const resetPreview = () => setPreview({});

  return (
    <View
      className="flex-1 bg-transparent px-5"
      style={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 96 }}
    >
      <View className="flex-row items-center justify-between mb-3">
        <TouchableOpacity
          onPress={() => router.push("/bag")}
          className="flex-row items-center bg-white/80 rounded-full pl-2 pr-3 py-1.5 border border-village-border"
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="bag-personal"
            size={18}
            color={Colors.primary}
          />
          <Text className="text-sm font-bold text-village-text ml-1">
            내 가방
          </Text>
        </TouchableOpacity>
        <View className="flex-row items-center bg-white/80 rounded-full px-3 py-1.5 border border-village-border">
          <MaterialCommunityIcons name="circle" size={14} color={Colors.coin} />
          <Text className="text-sm font-bold text-village-text ml-1">
            {user?.coins ?? 0}
          </Text>
        </View>
      </View>

      <View className="rounded-3xl bg-white/70 border border-village-border py-5 items-center justify-center mb-4 relative">
        <WormSprite
          equipped={mergedEquipped}
          size={1.2}
        />
        {hasPreview && (
          <TouchableOpacity
            onPress={resetPreview}
            className="absolute top-2 right-2 flex-row items-center bg-village-surface rounded-full px-3 py-1 border border-village-border"
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="restore"
              size={14}
              color={Colors.textSecondary}
            />
            <Text className="text-[11px] font-semibold text-village-text-secondary ml-1">
              원래대로
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View className="mb-4">
        <CategoryTabBar value={category} onChange={setCategory} />
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={Colors.primary} />
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
                  onTryOn={() => handleTryOn(item)}
                  previewing={preview[item.category]?.id === item.id}
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
