import { Text, View } from "react-native";
import { Colors } from "@/constants/colors";

export function StatChip({
  label,
  value,
  tint,
}: {
  label: string;
  value: string;
  tint: string;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 999,
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: tint,
      }}
    >
      <View
        style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: tint }}
      />
      <Text style={{ fontSize: 13, color: Colors.text, fontWeight: "800" }}>
        {label}
      </Text>
      <Text style={{ fontSize: 14, color: tint, fontWeight: "900" }}>
        {value}
      </Text>
    </View>
  );
}
