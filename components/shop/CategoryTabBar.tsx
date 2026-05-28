import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";

export type TabConfig<K extends string> = {
  key: K;
  label: string;
  icon: string;
};

interface Props<K extends string> {
  value: K;
  onChange: (next: K) => void;
  categories: TabConfig<K>[];
  scrollable?: boolean;
}

export function CategoryTabBar<K extends string>({
  value,
  onChange,
  categories,
  scrollable,
}: Props<K>) {
  const Container = scrollable ? ScrollView : View;
  const containerProps = scrollable
    ? {
        horizontal: true,
        showsHorizontalScrollIndicator: false,
        contentContainerStyle: { paddingHorizontal: 4 },
      }
    : {};

  return (
    <View className="bg-village-surface rounded-2xl p-1 border border-village-border">
      <Container
        {...(containerProps as object)}
        className={scrollable ? "" : "flex-row"}
      >
        {categories.map((c) => {
          const active = c.key === value;
          return (
            <TouchableOpacity
              key={c.key}
              className={`${
                scrollable ? "px-3 mr-1" : "flex-1"
              } py-2 rounded-xl flex-row items-center justify-center ${
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
      </Container>
    </View>
  );
}
