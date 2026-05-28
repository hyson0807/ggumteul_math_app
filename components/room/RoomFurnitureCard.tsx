import { View, Text, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { API_BASE_URL } from "@/services/api";
import { Colors } from "@/constants/colors";
import type { ShopItem } from "@/types/shop";

interface Props {
  item: ShopItem;
  equipped: boolean;
  onPress: () => void;
  busy?: boolean;
}

export function RoomFurnitureCard({ item, equipped, onPress, busy }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
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
          <MaterialCommunityIcons name="check" size={14} color="#fff" />
        </View>
      )}
      <View
        className="rounded-xl bg-white/60 items-center justify-center"
        style={{ aspectRatio: 1 }}
      >
        {busy ? (
          <ActivityIndicator color={Colors.primary} />
        ) : (
          <Image
            source={{ uri: `${API_BASE_URL}${item.imageUrl}` }}
            style={{ width: "85%", height: "85%" }}
            resizeMode="contain"
          />
        )}
      </View>
      <Text
        className="text-xs font-bold text-village-text mt-1 text-center"
        numberOfLines={1}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );
}
