import { View, Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { SHOP_CATEGORY_CONFIG } from "@/constants/shop";
import type { ShopCategory } from "@/types/shop";

interface Props {
  value: ShopCategory;
  onChange: (next: ShopCategory) => void;
}

export function CategoryTabBar({ value, onChange }: Props) {
  return (
    <View className="flex-row bg-village-surface rounded-2xl p-1 border border-village-border">
      {SHOP_CATEGORY_CONFIG.map((c) => {
        const active = c.key === value;
        return (
          <TouchableOpacity
            key={c.key}
            className={`flex-1 py-2 rounded-xl flex-row items-center justify-center ${
              active ? "bg-village-primary" : ""
            }`}
            onPress={() => onChange(c.key)}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name={c.icon as never}
              size={16}
              color={active ? "#fff" : Colors.textSecondary}
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
  );
}
