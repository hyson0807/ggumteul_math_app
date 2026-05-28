import { View, Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import type { ShopDomain } from "@/types/shop";

interface Props {
  value: ShopDomain;
  onChange: (next: ShopDomain) => void;
}

const OPTIONS: { key: ShopDomain; label: string; icon: string }[] = [
  { key: "worm", label: "지렁이", icon: "bug-outline" },
  { key: "room", label: "방꾸미기", icon: "sofa-outline" },
];

export function DomainToggle({ value, onChange }: Props) {
  return (
    <View className="flex-row bg-village-surface rounded-2xl p-1 border border-village-border">
      {OPTIONS.map((o) => {
        const active = o.key === value;
        return (
          <TouchableOpacity
            key={o.key}
            className={`flex-1 py-3 rounded-xl flex-row items-center justify-center ${
              active ? "bg-village-primary" : ""
            }`}
            onPress={() => onChange(o.key)}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name={o.icon as never}
              size={20}
              color={active ? "#fff" : Colors.textSecondary}
            />
            <Text
              className={`ml-2 text-base font-bold ${
                active ? "text-white" : "text-village-text-secondary"
              }`}
            >
              {o.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
