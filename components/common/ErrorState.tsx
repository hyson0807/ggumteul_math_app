import { Text, TouchableOpacity, View } from "react-native";
import { Colors } from "@/constants/colors";

interface Props {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: Props) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 12, paddingHorizontal: 30 }}>
      <Text style={{ color: Colors.text, fontSize: 14, textAlign: "center" }}>
        {message}
      </Text>
      <TouchableOpacity
        onPress={onRetry}
        style={{
          paddingHorizontal: 18,
          paddingVertical: 10,
          backgroundColor: Colors.primary,
          borderRadius: 12,
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "800" }}>다시 시도</Text>
      </TouchableOpacity>
    </View>
  );
}
