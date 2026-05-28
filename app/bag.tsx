import { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useInventory } from "@/hooks/useInventory";
import { useEquipItem, useUnequipItem, useWorm } from "@/hooks/useWorm";
import {
  useEquipFurniture,
  useRoom,
  useUnequipFurniture,
} from "@/hooks/useRoom";
import { useToastStore } from "@/stores/useToastStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { API_BASE_URL, getApiErrorMessage } from "@/services/api";
import {
  WORM_CATEGORY_CONFIG,
  FURNITURE_CATEGORY_CONFIG,
  SHOP_CATEGORY_BY_KEY,
  DEFAULT_WORM_CATEGORY,
  DEFAULT_FURNITURE_CATEGORY,
} from "@/constants/shop";
import { Colors } from "@/constants/colors";
import { WormSprite } from "@/components/worm/WormSprite";
import { RoomCanvas } from "@/components/room/RoomCanvas";
import { CategoryTabBar } from "@/components/shop/CategoryTabBar";
import { DomainToggle } from "@/components/shop/DomainToggle";
import {
  isFurnitureCategory,
  type FurnitureCategory,
  type InventoryEntry,
  type ShopCategory,
  type ShopDomain,
  type WormCategory,
} from "@/types/shop";

export default function BagScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const showToast = useToastStore((s) => s.show);
  const { data: worm } = useWorm();
  const { data: room } = useRoom();
  const { data: inventory = [], isLoading } = useInventory();
  const equipWorm = useEquipItem();
  const unequipWorm = useUnequipItem();
  const equipRoom = useEquipFurniture();
  const unequipRoom = useUnequipFurniture();

  const [domain, setDomain] = useState<ShopDomain>("worm");
  const [wormCategory, setWormCategory] =
    useState<WormCategory>(DEFAULT_WORM_CATEGORY);
  const [roomCategory, setRoomCategory] = useState<FurnitureCategory>(
    DEFAULT_FURNITURE_CATEGORY,
  );

  const activeCategory: ShopCategory =
    domain === "worm" ? wormCategory : roomCategory;

  const domainInventory = useMemo<InventoryEntry[]>(
    () =>
      inventory.filter((e) =>
        domain === "worm"
          ? !isFurnitureCategory(e.item.category)
          : isFurnitureCategory(e.item.category),
      ),
    [inventory, domain],
  );

  const filtered = useMemo<InventoryEntry[]>(
    () => domainInventory.filter((e) => e.item.category === activeCategory),
    [domainInventory, activeCategory],
  );

  const equippedFurnitureIdBySlot = useMemo(() => {
    const map: Partial<Record<FurnitureCategory, string>> = {};
    if (!room) return map;
    (Object.keys(room.equipped) as FurnitureCategory[]).forEach((slot) => {
      const item = room.equipped[slot];
      if (item) map[slot] = item.id;
    });
    return map;
  }, [room]);

  const isEquipped = (entry: InventoryEntry): boolean => {
    if (isFurnitureCategory(entry.item.category)) {
      return (
        equippedFurnitureIdBySlot[entry.item.category as FurnitureCategory] ===
        entry.item.id
      );
    }
    return entry.equipped;
  };

  const handleToggle = (entry: InventoryEntry) => {
    if (isFurnitureCategory(entry.item.category)) {
      const slot = entry.item.category as FurnitureCategory;
      const equipped = isEquipped(entry);
      if (equipped) {
        unequipRoom.mutate(
          { slot },
          {
            onSuccess: () => showToast("가구를 치웠어요.", "info"),
            onError: (e) =>
              showToast(getApiErrorMessage(e, "해제에 실패했어요."), "error"),
          },
        );
      } else {
        equipRoom.mutate(
          { slot, shopItemId: entry.item.id },
          {
            onSuccess: () =>
              showToast(`${entry.item.name} 배치 완료!`, "success"),
            onError: (e) =>
              showToast(getApiErrorMessage(e, "배치에 실패했어요."), "error"),
          },
        );
      }
    } else {
      const slot = entry.item.category as WormCategory;
      if (entry.equipped) {
        unequipWorm.mutate(
          { slot },
          {
            onSuccess: () => showToast("장착을 해제했어요.", "info"),
            onError: (e) =>
              showToast(getApiErrorMessage(e, "해제에 실패했어요."), "error"),
          },
        );
      } else {
        equipWorm.mutate(
          { slot, shopItemId: entry.item.id },
          {
            onSuccess: () => showToast(`${entry.item.name} 장착!`, "success"),
            onError: (e) =>
              showToast(getApiErrorMessage(e, "장착에 실패했어요."), "error"),
          },
        );
      }
    }
  };

  const isBusy = (entry: InventoryEntry): boolean => {
    if (isFurnitureCategory(entry.item.category)) {
      const slot = entry.item.category as FurnitureCategory;
      const equipped = isEquipped(entry);
      return (
        (equipRoom.isPending &&
          equipRoom.variables?.shopItemId === entry.item.id) ||
        (unequipRoom.isPending &&
          unequipRoom.variables?.slot === slot &&
          equipped)
      );
    }
    return (
      (equipWorm.isPending &&
        equipWorm.variables?.shopItemId === entry.item.id) ||
      (unequipWorm.isPending &&
        unequipWorm.variables?.slot === entry.item.category &&
        entry.equipped)
    );
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

      <View className="px-5 mb-3">
        <DomainToggle value={domain} onChange={setDomain} />
      </View>

      <View className="mx-5 mb-4 rounded-3xl bg-white/70 border border-village-border overflow-hidden">
        {domain === "worm" ? (
          <View className="py-6 items-center justify-center">
            <WormSprite equipped={worm?.equipped} size={1.4} />
          </View>
        ) : (
          <RoomCanvas room={room?.equipped} worm={worm?.equipped} showWorm />
        )}
      </View>

      <View className="px-5 mb-4">
        <CategoryTabBar
          value={activeCategory}
          onChange={(c) => {
            if (isFurnitureCategory(c)) setRoomCategory(c);
            else setWormCategory(c as WormCategory);
          }}
          categories={
            domain === "worm"
              ? WORM_CATEGORY_CONFIG
              : FURNITURE_CATEGORY_CONFIG
          }
          scrollable={domain === "room"}
        />
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : domainInventory.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <MaterialCommunityIcons
            name={domain === "worm" ? "treasure-chest-outline" : "sofa-outline"}
            size={80}
            color={Colors.inactive}
          />
          <Text className="text-lg text-village-text-secondary mt-4">
            {domain === "worm"
              ? "아직 아이템이 없어요"
              : "아직 가구가 없어요"}
          </Text>
          <Text className="text-sm text-village-inactive mt-1 text-center">
            상점에서{" "}
            {domain === "worm" ? "지렁이 친구에게 선물해보세요" : "가구를 사보세요"}
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
              const equipped = isEquipped(entry);
              const busy = isBusy(entry);
              const isFurniture = isFurnitureCategory(entry.item.category);
              return (
                <View key={entry.inventoryId} className="w-1/3 px-1 mb-2">
                  <TouchableOpacity
                    onPress={() => handleToggle(entry)}
                    disabled={busy}
                    activeOpacity={0.8}
                    className={`rounded-2xl p-2 border ${
                      equipped
                        ? "bg-white border-village-primary border-2"
                        : "bg-village-surface border-village-border"
                    }`}
                  >
                    {equipped && (
                      <View className="absolute -top-2 -right-2 z-10 bg-village-primary w-6 h-6 rounded-full items-center justify-center border-2 border-white">
                        <MaterialCommunityIcons
                          name="check"
                          size={14}
                          color="#fff"
                        />
                      </View>
                    )}
                    <View
                      className="items-center justify-center bg-white/60 rounded-xl"
                      style={{ aspectRatio: 1 }}
                    >
                      {busy ? (
                        <ActivityIndicator color={Colors.primary} />
                      ) : isFurniture ? (
                        <Image
                          source={{
                            uri: `${API_BASE_URL}${entry.item.imageUrl}`,
                          }}
                          style={{ width: "85%", height: "85%" }}
                          resizeMode="contain"
                        />
                      ) : (
                        <MaterialCommunityIcons
                          name={
                            (SHOP_CATEGORY_BY_KEY[entry.item.category]
                              ?.icon ?? "help-circle") as never
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
