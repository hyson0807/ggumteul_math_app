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
import { useRoom, useEquipFurniture, useUnequipFurniture } from "@/hooks/useRoom";
import { useWorm } from "@/hooks/useWorm";
import { useInventory } from "@/hooks/useInventory";
import { useToastStore } from "@/stores/useToastStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { getApiErrorMessage } from "@/services/api";
import {
  FURNITURE_CATEGORY_CONFIG,
  DEFAULT_FURNITURE_CATEGORY,
} from "@/constants/shop";
import { Colors } from "@/constants/colors";
import { CategoryTabBar } from "@/components/shop/CategoryTabBar";
import { RoomCanvas } from "@/components/room/RoomCanvas";
import { RoomFurnitureCard } from "@/components/room/RoomFurnitureCard";
import type {
  FurnitureCategory,
  InventoryEntry,
  ShopCategory,
} from "@/types/shop";
import { isFurnitureCategory } from "@/types/shop";

export default function RoomScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const showToast = useToastStore((s) => s.show);
  const { data: room, isLoading: roomLoading } = useRoom();
  const { data: worm } = useWorm();
  const { data: inventory = [], isLoading: invLoading } = useInventory();
  const equip = useEquipFurniture();
  const unequip = useUnequipFurniture();
  const [category, setCategory] = useState<FurnitureCategory>(
    DEFAULT_FURNITURE_CATEGORY,
  );

  const furnitureInventory = useMemo<InventoryEntry[]>(
    () => inventory.filter((e) => isFurnitureCategory(e.item.category)),
    [inventory],
  );

  const filtered = useMemo<InventoryEntry[]>(
    () => furnitureInventory.filter((e) => e.item.category === category),
    [furnitureInventory, category],
  );

  const equippedIdBySlot = useMemo(() => {
    const map: Partial<Record<FurnitureCategory, string>> = {};
    if (!room) return map;
    (Object.keys(room.equipped) as FurnitureCategory[]).forEach((slot) => {
      const item = room.equipped[slot];
      if (item) map[slot] = item.id;
    });
    return map;
  }, [room]);

  const handleToggle = (entry: InventoryEntry) => {
    const slot = entry.item.category as FurnitureCategory;
    const currentEquippedId = equippedIdBySlot[slot];
    const isEquippedHere = currentEquippedId === entry.item.id;

    if (isEquippedHere) {
      unequip.mutate(
        { slot },
        {
          onSuccess: () => showToast("가구를 치웠어요.", "info"),
          onError: (e) =>
            showToast(getApiErrorMessage(e, "해제에 실패했어요."), "error"),
        },
      );
    } else {
      equip.mutate(
        { slot, shopItemId: entry.item.id },
        {
          onSuccess: () => showToast(`${entry.item.name} 배치 완료!`, "success"),
          onError: (e) =>
            showToast(getApiErrorMessage(e, "배치에 실패했어요."), "error"),
        },
      );
    }
  };

  const isLoading = roomLoading || invLoading;

  return (
    <View
      className="flex-1 bg-village-bg"
      style={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 96 }}
    >
      {/* 헤더 */}
      <View className="flex-row items-center justify-between px-5 mb-3">
        <View>
          <Text className="text-xl font-extrabold text-village-text">
            나의 방 꾸미기
          </Text>
          <Text className="text-xs text-village-text-secondary mt-0.5">
            나만의 예쁜 방을 꾸며보세요!
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/shop")}
          className="flex-row items-center bg-white/80 rounded-full px-3 py-1.5 border border-village-border"
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="circle" size={14} color={Colors.coin} />
          <Text className="text-sm font-bold text-village-text ml-1">
            {user?.coins ?? 0}
          </Text>
          <MaterialCommunityIcons
            name="plus"
            size={14}
            color={Colors.primary}
            style={{ marginLeft: 4 }}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* 방 미리보기 (좌우 풀폭 - 살짝 여백만) */}
        <View className="px-2 mb-4">
          <RoomCanvas room={room?.equipped} worm={worm?.equipped} />
        </View>

        {/* 카테고리 탭 */}
        <View className="px-5 mb-3">
          <CategoryTabBar
            value={category}
            onChange={(c: ShopCategory) => {
              if (isFurnitureCategory(c)) setCategory(c);
            }}
            categories={FURNITURE_CATEGORY_CONFIG}
            scrollable
          />
        </View>

        {/* 보유 가구 */}
        <View className="px-5">
          {isLoading ? (
            <View className="py-12 items-center justify-center">
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
          ) : furnitureInventory.length === 0 ? (
            <View className="py-12 items-center justify-center">
              <MaterialCommunityIcons
                name="sofa-outline"
                size={64}
                color={Colors.inactive}
              />
              <Text className="text-base text-village-text-secondary mt-3">
                아직 보유한 가구가 없어요
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/shop")}
                className="mt-4 flex-row items-center bg-village-primary rounded-full px-4 py-2"
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name="storefront-outline"
                  size={16}
                  color="#fff"
                />
                <Text className="text-sm font-bold text-white ml-1">
                  상점에서 가구 사러가기
                </Text>
              </TouchableOpacity>
            </View>
          ) : filtered.length === 0 ? (
            <View className="py-12 items-center justify-center">
              <Text className="text-sm text-village-text-secondary">
                이 카테고리의 가구가 아직 없어요.
              </Text>
            </View>
          ) : (
            <View className="flex-row flex-wrap -mx-1">
              {filtered.map((entry) => {
                const slot = entry.item.category as FurnitureCategory;
                const isEquippedHere =
                  equippedIdBySlot[slot] === entry.item.id;
                const busy =
                  (equip.isPending &&
                    equip.variables?.shopItemId === entry.item.id) ||
                  (unequip.isPending &&
                    unequip.variables?.slot === slot &&
                    isEquippedHere);
                return (
                  <View key={entry.inventoryId} className="w-1/3 px-1 mb-2">
                    <RoomFurnitureCard
                      item={entry.item}
                      equipped={isEquippedHere}
                      onPress={() => handleToggle(entry)}
                      busy={busy}
                    />
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
