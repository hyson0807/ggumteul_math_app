import { Fragment, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useShopItems, usePurchaseItem } from "@/hooks/useShop";
import { useRoom, useEquipFurniture, useUnequipFurniture } from "@/hooks/useRoom";
import { useWorm, useEquipItem, useUnequipItem } from "@/hooks/useWorm";
import { useToastStore } from "@/stores/useToastStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { getApiErrorMessage } from "@/services/api";
import { ROOM_TAB_CONFIG, type RoomTabKey } from "@/constants/shop";
import { Colors } from "@/constants/colors";
import { CategoryTabBar } from "@/components/shop/CategoryTabBar";
import { ShopItemCard } from "@/components/shop/ShopItemCard";
import { RoomCanvas } from "@/components/room/RoomCanvas";
import {
  isFurnitureCategory,
  type FurnitureCategory,
  type ShopItemWithStatus,
  type WormCategory,
} from "@/types/shop";

export default function RoomScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const showToast = useToastStore((s) => s.show);
  const { data: items = [], isLoading } = useShopItems();
  const { data: room } = useRoom();
  const { data: worm } = useWorm();
  const purchase = usePurchaseItem();
  const equipFurniture = useEquipFurniture();
  const unequipFurniture = useUnequipFurniture();
  const equipWorm = useEquipItem();
  const unequipWorm = useUnequipItem();
  const [category, setCategory] = useState<RoomTabKey>("all");

  const { owned, purchasable, sorted } = useMemo(() => {
    const filtered = items.filter((i) => {
      if (category === "all") return true;
      if (category === "outfit") return !isFurnitureCategory(i.category);
      return i.category === category;
    });
    const o = filtered.filter((i) => i.owned);
    const p = filtered.filter((i) => !i.owned);
    return { owned: o, purchasable: p, sorted: [...o, ...p] };
  }, [items, category]);

  const toastCallbacks = (successMsg: string, fallbackErr: string) => ({
    onSuccess: () =>
      showToast(successMsg, "success" as const) as void | undefined,
    onError: (e: unknown) =>
      showToast(getApiErrorMessage(e, fallbackErr), "error"),
  });

  const handleCardPress = (item: ShopItemWithStatus) => {
    const currentStage = user?.wormStage ?? 1;
    const coins = user?.coins ?? 0;
    const isFurniture = isFurnitureCategory(item.category);
    const equip = isFurniture ? equipFurniture : equipWorm;
    const unequip = isFurniture ? unequipFurniture : unequipWorm;
    const equipArgs = isFurniture
      ? { slot: item.category as FurnitureCategory, shopItemId: item.id }
      : { slot: item.category as WormCategory, shopItemId: item.id };
    const unequipArgs = isFurniture
      ? { slot: item.category as FurnitureCategory }
      : { slot: item.category as WormCategory };

    if (item.owned && item.equipped) {
      const msg = isFurniture ? "가구를 치웠어요." : "장착을 해제했어요.";
      // @ts-expect-error — equip/unequip union 의 mutate 시그니처가 domain 별로 좁혀짐
      unequip.mutate(unequipArgs, {
        onSuccess: () => showToast(msg, "info"),
        onError: (e) =>
          showToast(getApiErrorMessage(e, "해제에 실패했어요."), "error"),
      });
      return;
    }

    if (item.owned) {
      const msg = isFurniture ? `${item.name} 배치 완료!` : `${item.name} 장착!`;
      // @ts-expect-error — equip union 의 mutate 시그니처가 domain 별로 좁혀짐
      equip.mutate(equipArgs, toastCallbacks(msg, "장착에 실패했어요."));
      return;
    }

    if (item.unlockStage > currentStage) {
      showToast(
        `Lv.${item.unlockStage} 단계에 도달하면 잠금이 풀려요!`,
        "info",
      );
      return;
    }

    if (coins < item.price) {
      showToast("코인이 부족해요. 문제를 풀어 모아보세요!", "error");
      return;
    }

    Alert.alert(
      "구매 확인",
      `${item.price} 코인을 사용해 "${item.name}" 을(를) 구매할까요?`,
      [
        { text: "취소", style: "cancel" },
        {
          text: "구매",
          onPress: () =>
            purchase.mutate(item.id, {
              onSuccess: () => {
                // equip 의 onSuccess 안에서 토스트 → 장착 성공 후에만 "장착됐어요" 표시
                // @ts-expect-error — equip union 의 mutate 시그니처가 domain 별로 좁혀짐
                equip.mutate(equipArgs, {
                  onSuccess: () =>
                    showToast(
                      `${item.name} 구매 완료! 장착됐어요`,
                      "success",
                    ),
                  onError: (e) =>
                    showToast(
                      getApiErrorMessage(e, "장착에 실패했어요."),
                      "error",
                    ),
                });
              },
              onError: (e) =>
                showToast(getApiErrorMessage(e, "구매에 실패했어요."), "error"),
            }),
        },
      ],
    );
  };

  const isBusy = (item: ShopItemWithStatus): boolean =>
    [
      purchase.isPending && purchase.variables === item.id,
      equipFurniture.isPending &&
        equipFurniture.variables?.shopItemId === item.id,
      equipWorm.isPending && equipWorm.variables?.shopItemId === item.id,
      unequipFurniture.isPending &&
        unequipFurniture.variables?.slot === item.category &&
        item.equipped,
      unequipWorm.isPending &&
        unequipWorm.variables?.slot === item.category &&
        item.equipped,
    ].some(Boolean);

  return (
    <View
      className="flex-1 bg-village-bg"
      style={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 96 }}
    >
      <View className="flex-row items-center justify-between px-5 mb-3">
        <View>
          <Text className="text-xl font-extrabold text-village-text">
            나의 방 꾸미기
          </Text>
          <Text className="text-xs text-village-text-secondary mt-0.5">
            지렁이도 입히고, 방도 꾸며보세요!
          </Text>
        </View>
        <View className="flex-row items-center bg-white/80 rounded-full px-3 py-1.5 border border-village-border">
          <MaterialCommunityIcons name="circle" size={14} color={Colors.coin} />
          <Text className="text-sm font-bold text-village-text ml-1">
            {user?.coins ?? 0}
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <View className="px-2 mb-4">
          <RoomCanvas room={room?.equipped} worm={worm?.equipped} />
        </View>

        <View className="px-5 mb-3">
          <CategoryTabBar
            value={category}
            onChange={setCategory}
            categories={ROOM_TAB_CONFIG}
            scrollable
          />
        </View>

        <View className="px-5">
          {isLoading ? (
            <View className="py-12 items-center justify-center">
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
          ) : sorted.length === 0 ? (
            <View className="py-12 items-center justify-center">
              <Text className="text-sm text-village-text-secondary">
                이 카테고리에는 아이템이 없어요.
              </Text>
            </View>
          ) : (
            <>
              <View className="flex-row items-center justify-between mt-1 mb-2">
                <Text className="text-sm font-bold text-village-text">
                  총 {sorted.length}개
                </Text>
                <Text className="text-xs text-village-text-secondary">
                  보유 {owned.length} · 구매 가능 {purchasable.length}
                </Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  paddingTop: 10,
                  paddingRight: 8,
                  paddingLeft: 4,
                  paddingBottom: 4,
                }}
              >
                {sorted.map((item, idx) => (
                  <Fragment key={item.id}>
                    {idx === owned.length &&
                      owned.length > 0 &&
                      purchasable.length > 0 && (
                        <View
                          style={{
                            width: 1,
                            alignSelf: "stretch",
                            backgroundColor: Colors.surfaceBorder,
                            marginHorizontal: 8,
                            marginVertical: 12,
                          }}
                        />
                      )}
                    <View style={{ width: 140, marginRight: 8 }}>
                      <ShopItemCard
                        item={item}
                        currentStage={user?.wormStage ?? 1}
                        onPress={() => handleCardPress(item)}
                        busy={isBusy(item)}
                      />
                    </View>
                  </Fragment>
                ))}
              </ScrollView>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
