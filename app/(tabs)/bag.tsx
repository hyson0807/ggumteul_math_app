import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useInventory } from "@/hooks/useInventory";
import { useEquipItem, useUnequipItem } from "@/hooks/useWorm";
import { useToastStore } from "@/stores/useToastStore";
import { getApiErrorMessage } from "@/services/api";
import { SHOP_CATEGORY_BY_KEY } from "@/constants/shop";
import type { EquipSlot } from "@/types/worm";
import type { InventoryEntry } from "@/types/shop";

export default function BagScreen() {
  const insets = useSafeAreaInsets();
  const { data: inventory = [], isLoading } = useInventory();
  const equip = useEquipItem();
  const unequip = useUnequipItem();
  const showToast = useToastStore((s) => s.show);

  const handleToggle = (entry: InventoryEntry) => {
    const slot = entry.item.category as EquipSlot;
    if (entry.equipped) {
      unequip.mutate(
        { slot },
        {
          onSuccess: () => showToast("장착을 해제했어요.", "info"),
          onError: (e) => showToast(getApiErrorMessage(e, "해제에 실패했어요."), "error"),
        },
      );
    } else {
      equip.mutate(
        { slot, shopItemId: entry.item.id },
        {
          onSuccess: () => showToast(`${entry.item.name} 장착!`, "success"),
          onError: (e) => showToast(getApiErrorMessage(e, "장착에 실패했어요."), "error"),
        },
      );
    }
  };

  return (
    <View
      className="flex-1 bg-transparent px-5"
      style={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 96 }}
    >
      <Text className="text-xl font-bold text-village-text mb-4">내 가방</Text>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#A0522D" />
        </View>
      ) : inventory.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <MaterialCommunityIcons
            name="treasure-chest-outline"
            size={80}
            color="#CDAB8F"
          />
          <Text className="text-lg text-village-text-secondary mt-4">
            아직 아이템이 없어요
          </Text>
          <Text className="text-sm text-village-inactive mt-1">
            상점에서 지렁이 친구에게 선물해보세요
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          <View className="flex-row flex-wrap -mx-1">
            {inventory.map((entry) => {
              const config = SHOP_CATEGORY_BY_KEY[entry.item.category];
              const busy =
                (equip.isPending && equip.variables?.shopItemId === entry.item.id) ||
                (unequip.isPending &&
                  unequip.variables?.slot === entry.item.category);
              return (
                <View key={entry.inventoryId} className="w-1/2 px-1 mb-2">
                  <View className="bg-village-surface rounded-2xl p-3 border border-village-border">
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="text-[11px] text-village-text-secondary">
                        {config?.label ?? entry.item.category}
                      </Text>
                      {entry.equipped && (
                        <View className="bg-village-success rounded-full px-2 py-0.5">
                          <Text className="text-[10px] text-white font-bold">
                            장착
                          </Text>
                        </View>
                      )}
                    </View>
                    <View className="h-20 items-center justify-center bg-white/60 rounded-xl mb-2">
                      <MaterialCommunityIcons
                        name={(config?.icon ?? "shape-outline") as never}
                        size={40}
                        color="#A0522D"
                      />
                    </View>
                    <Text
                      className="text-sm font-bold text-village-text"
                      numberOfLines={1}
                    >
                      {entry.item.name}
                    </Text>
                    <TouchableOpacity
                      className={`mt-2 rounded-xl py-2 items-center ${
                        entry.equipped
                          ? "bg-village-border"
                          : "bg-village-primary"
                      }`}
                      onPress={() => handleToggle(entry)}
                      disabled={busy}
                      activeOpacity={0.8}
                    >
                      {busy ? (
                        <ActivityIndicator color="#fff" size="small" />
                      ) : (
                        <Text
                          className={`text-xs font-bold ${
                            entry.equipped
                              ? "text-village-text-secondary"
                              : "text-white"
                          }`}
                        >
                          {entry.equipped ? "해제하기" : "장착하기"}
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
