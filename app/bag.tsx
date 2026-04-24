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
import { useInventory } from "@/hooks/useInventory";
import { useEquipItem, useUnequipItem, useWorm } from "@/hooks/useWorm";
import { useToastStore } from "@/stores/useToastStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { getApiErrorMessage } from "@/services/api";
import { SHOP_CATEGORY_BY_KEY } from "@/constants/shop";
import { Colors } from "@/constants/colors";
import { WormSprite } from "@/components/worm/WormSprite";
import { CategoryTabBar } from "@/components/shop/CategoryTabBar";
import type { ShopCategory, InventoryEntry } from "@/types/shop";

export default function BagScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const showToast = useToastStore((s) => s.show);
  const { data: worm } = useWorm();
  const { data: inventory = [], isLoading } = useInventory();
  const equip = useEquipItem();
  const unequip = useUnequipItem();
  const [category, setCategory] = useState<ShopCategory>("hat");

  const filtered = useMemo<InventoryEntry[]>(
    () => inventory.filter((e) => e.item.category === category),
    [inventory, category],
  );

  const handleToggle = (entry: InventoryEntry) => {
    const slot = entry.item.category;
    if (entry.equipped) {
      unequip.mutate(
        { slot },
        {
          onSuccess: () => showToast("장착을 해제했어요.", "info"),
          onError: (e) =>
            showToast(getApiErrorMessage(e, "해제에 실패했어요."), "error"),
        },
      );
    } else {
      equip.mutate(
        { slot, shopItemId: entry.item.id },
        {
          onSuccess: () => showToast(`${entry.item.name} 장착!`, "success"),
          onError: (e) =>
            showToast(getApiErrorMessage(e, "장착에 실패했어요."), "error"),
        },
      );
    }
  };

  return (
    <View
      className="flex-1 bg-village-bg"
      style={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom }}
    >
      <View className="flex-row items-center justify-between px-5 mb-2">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-full bg-white/80 border border-village-border"
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="chevron-left"
            size={24}
            color={Colors.text}
          />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-village-text">내 가방</Text>
        <View className="flex-row items-center bg-white/80 rounded-full px-3 py-1.5 border border-village-border">
          <MaterialCommunityIcons name="circle" size={14} color={Colors.coin} />
          <Text className="text-sm font-bold text-village-text ml-1">
            {user?.coins ?? 0}
          </Text>
        </View>
      </View>

      <View className="mx-5 mt-2 mb-4 rounded-3xl bg-white/70 border border-village-border py-6 items-center justify-center">
        <WormSprite
          stage={worm?.stage ?? user?.wormStage ?? 1}
          equipped={worm?.equipped}
          size={1.4}
        />
      </View>

      <View className="px-5 mb-4">
        <CategoryTabBar value={category} onChange={setCategory} />
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : inventory.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <MaterialCommunityIcons
            name="treasure-chest-outline"
            size={80}
            color={Colors.inactive}
          />
          <Text className="text-lg text-village-text-secondary mt-4">
            아직 아이템이 없어요
          </Text>
          <Text className="text-sm text-village-inactive mt-1 text-center">
            상점에서 지렁이 친구에게 선물해보세요
          </Text>
        </View>
      ) : filtered.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-village-text-secondary">
            이 카테고리에는 아직 아이템이 없어요.
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32, paddingHorizontal: 20 }}
        >
          <View className="flex-row flex-wrap -mx-1">
            {filtered.map((entry) => {
              const busy =
                (equip.isPending &&
                  equip.variables?.shopItemId === entry.item.id) ||
                (unequip.isPending &&
                  unequip.variables?.slot === entry.item.category &&
                  entry.equipped);
              return (
                <View key={entry.inventoryId} className="w-1/3 px-1 mb-2">
                  <TouchableOpacity
                    onPress={() => handleToggle(entry)}
                    disabled={busy}
                    activeOpacity={0.8}
                    className={`rounded-2xl p-2 border ${
                      entry.equipped
                        ? "bg-white border-village-primary border-2"
                        : "bg-village-surface border-village-border"
                    }`}
                  >
                    {entry.equipped && (
                      <View className="absolute -top-2 -right-2 z-10 bg-village-primary w-6 h-6 rounded-full items-center justify-center border-2 border-white">
                        <MaterialCommunityIcons
                          name="check"
                          size={14}
                          color="#fff"
                        />
                      </View>
                    )}
                    <View className="h-20 items-center justify-center bg-white/60 rounded-xl">
                      {busy ? (
                        <ActivityIndicator color={Colors.primary} />
                      ) : (
                        <MaterialCommunityIcons
                          name={
                            SHOP_CATEGORY_BY_KEY[entry.item.category]
                              .icon as never
                          }
                          size={36}
                          color={Colors.primary}
                        />
                      )}
                    </View>
                    <Text
                      className="text-xs font-bold text-village-text mt-1 text-center"
                      numberOfLines={1}
                    >
                      {entry.item.name}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
