import { Text, View } from "react-native";
import { Colors } from "@/constants/colors";
import { CoinIcon } from "@/components/common/CoinIcon";

interface Props {
  name: string;
  coins: number;
}

export function HomeHeader({ name, coins }: Props) {
  return (
    <View
      style={{
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 8,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <View style={{ flex: 1, paddingRight: 12 }}>
        <Text
          numberOfLines={1}
          style={{
            fontFamily: "Jua",
            fontSize: 22,
            color: Colors.text,
            letterSpacing: 0.1,
          }}
        >
          {name}님,
        </Text>
        <Text
          numberOfLines={1}
          style={{
            marginTop: 2,
            fontFamily: "GowunDodum",
            fontSize: 13,
            color: Colors.textSecondary,
          }}
        >
          오늘도 꿈틀꿈틀 시작해볼까요?
        </Text>
      </View>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          paddingVertical: 7,
          paddingLeft: 8,
          paddingRight: 12,
          borderRadius: 999,
          backgroundColor: Colors.surface,
          borderWidth: 1,
          borderColor: Colors.surfaceBorder,
          shadowColor: "#000",
          shadowOpacity: 0.04,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 2 },
          elevation: 1,
        }}
      >
        <CoinIcon size={18} />
        <Text
          style={{
            fontFamily: "Jua",
            fontSize: 14,
            color: Colors.text,
            minWidth: 24,
            textAlign: "right",
          }}
        >
          {coins.toLocaleString()}
        </Text>
      </View>
    </View>
  );
}
