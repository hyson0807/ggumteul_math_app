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
import { useRoom } from "@/hooks/useRoom";
import { useToastStore } from "@/stores/useToastStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { ShopItemCard } from "@/components/shop/ShopItemCard";
import { CategoryTabBar } from "@/components/shop/CategoryTabBar";
import { DomainToggle } from "@/components/shop/DomainToggle";
import { WormSprite } from "@/components/worm/WormSprite";
import { RoomCanvas } from "@/components/room/RoomCanvas";
import { getApiErrorMessage } from "@/services/api";
import { Colors } from "@/constants/colors";
import {
  WORM_CATEGORY_CONFIG,
  FURNITURE_CATEGORY_CONFIG,
  DEFAULT_WORM_CATEGORY,
  DEFAULT_FURNITURE_CATEGORY,
} from "@/constants/shop";
import {
  isFurnitureCategory,
  type ShopCategory,
  type ShopDomain,
  type ShopItem,
  type ShopItemWithStatus,
  type WormCategory,
  type FurnitureCategory,
} from "@/types/shop";
import type { WormState } from "@/types/worm";
import type { RoomState } from "@/types/room";

type WormPreviewMap = Partial<Record<WormCategory, ShopItem>>;
type RoomPreviewMap = Partial<Record<FurnitureCategory, ShopItem>>;

export default function ShopScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const showToast = useToastStore((s) => s.show);
  const { data: items = [], isLoading } = useShopItems();
  const { data: worm } = useWorm();
  const { data: room } = useRoom();
  const purchase = usePurchaseItem();

  const [domain, setDomain] = useState<ShopDomain>("worm");
  const [wormCategory, setWormCategory] = useState<WormCategory>(
    DEFAULT_WORM_CATEGORY,
  );
  const [roomCategory, setRoomCategory] = useState<FurnitureCategory>(
    DEFAULT_FURNITURE_CATEGORY,
  );
  const [wormPreview, setWormPreview] = useState<WormPreviewMap>({});
  const [roomPreview, setRoomPreview] = useState<RoomPreviewMap>({});

  const activeCategory: ShopCategory =
    domain === "worm" ? wormCategory : roomCategory;

  const filtered = useMemo<ShopItemWithStatus[]>(
    () => items.filter((i) => i.category === activeCategory),
    [items, activeCategory],
  );

  const mergedWormEquipped = useMemo<WormState["equipped"]>(
    () => ({
      hat: wormPreview.hat ?? worm?.equipped.hat ?? null,
      body: wormPreview.body ?? worm?.equipped.body ?? null,
      accessory:
        wormPreview.accessory ?? worm?.equipped.accessory ?? null,
    }),
    [wormPreview, worm?.equipped],
  );

  const mergedRoomEquipped = useMemo<RoomState["equipped"]>(
    () => ({
      desk: roomPreview.desk ?? room?.equipped.desk ?? null,
      shelf: roomPreview.shelf ?? room?.equipped.shelf ?? null,
      clock: roomPreview.clock ?? room?.equipped.clock ?? null,
      bed: roomPreview.bed ?? room?.equipped.bed ?? null,
      light: roomPreview.light ?? room?.equipped.light ?? null,
      rug: roomPreview.rug ?? room?.equipped.rug ?? null,
      wallpaper: roomPreview.wallpaper ?? room?.equipped.wallpaper ?? null,
    }),
    [roomPreview, room?.equipped],
  );

  const hasWormPreview = Boolean(
    wormPreview.hat || wormPreview.body || wormPreview.accessory,
  );
  const hasRoomPreview = Object.keys(roomPreview).length > 0;
  const hasPreview = domain === "worm" ? hasWormPreview : hasRoomPreview;

  const handlePurchase = (item: ShopItemWithStatus) => {
    purchase.mutate(item.id, {
      onSuccess: () =>
        showToast(
          `${item.name} 구매 완료! ${
            isFurnitureCategory(item.category) ? "방꾸미기" : "가방"
          }에서 ${isFurnitureCategory(item.category) ? "배치" : "장착"}하세요.`,
          "success",
        ),
      onError: (e) =>
        showToast(getApiErrorMessage(e, "구매에 실패했어요."), "error"),
    });
  };

  const handleTryOn = (item: ShopItemWithStatus) => {
    if (isFurnitureCategory(item.category)) {
      const cat = item.category;
      setRoomPreview((p) => {
        const cur = p[cat];
        if (cur?.id === item.id) {
          const next = { ...p };
          delete next[cat];
          return next;
        }
        return { ...p, [cat]: item };
      });
    } else {
      const cat = item.category as WormCategory;
      setWormPreview((p) => {
        const cur = p[cat];
        if (cur?.id === item.id) {
          const next = { ...p };
          delete next[cat];
          return next;
        }
        return { ...p, [cat]: item };
      });
    }
  };

  const resetPreview = () => {
    if (domain === "worm") setWormPreview({});
    else setRoomPreview({});
  };

  const isItemPreviewing = (item: ShopItemWithStatus) =>
    isFurnitureCategory(item.category)
      ? roomPreview[item.category]?.id === item.id
      : wormPreview[item.category as WormCategory]?.id === item.id;

  return (
    <View
      className="flex-1 bg-transparent px-5"
      style={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 96 }}
    >
      {/* 헤더 */}
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

      {/* 도메인 토글 */}
      <View className="mb-3">
        <DomainToggle value={domain} onChange={setDomain} />
      </View>

      {/* 프리뷰 */}
      <View className="rounded-3xl bg-white/70 border border-village-border mb-4 relative overflow-hidden">
        {domain === "worm" ? (
          <View className="py-5 items-center justify-center">
            <WormSprite equipped={mergedWormEquipped} size={1.2} />
          </View>
        ) : (
          <RoomCanvas
            room={mergedRoomEquipped}
            worm={worm?.equipped}
            showWorm
          />
        )}
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

      {/* 카테고리 탭 */}
      <View className="mb-4">
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

      {/* 아이템 그리드 */}
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
                  previewing={isItemPreviewing(item)}
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
