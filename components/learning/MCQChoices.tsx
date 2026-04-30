import { Text, TouchableOpacity, View } from "react-native";
import { Colors } from "@/constants/colors";

export interface ChoiceSet {
  choice1: string | null;
  choice2: string | null;
  choice3: string | null;
  choice4: string | null;
}

interface Props {
  problem: ChoiceSet;
  selected: string | null;
  onSelect: (value: string) => void;
}

export function MCQChoices({ problem, selected, onSelect }: Props) {
  const choices = [
    problem.choice1,
    problem.choice2,
    problem.choice3,
    problem.choice4,
  ].filter((c): c is string => !!c);

  return (
    <View style={{ gap: 10 }}>
      {choices.map((c, i) => {
        const active = selected === c;
        return (
          <TouchableOpacity
            key={`${i}-${c}`}
            onPress={() => onSelect(c)}
            activeOpacity={0.8}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              paddingVertical: 14,
              paddingHorizontal: 14,
              borderRadius: 14,
              backgroundColor: active ? Colors.primary : Colors.surface,
              borderWidth: 2,
              borderColor: active ? Colors.primary : Colors.surfaceBorder,
            }}
          >
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 999,
                backgroundColor: active ? "#fff" : Colors.surfaceBorder,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "900",
                  color: active ? Colors.primary : Colors.text,
                }}
              >
                {i + 1}
              </Text>
            </View>
            <Text
              style={{
                flex: 1,
                fontSize: 16,
                fontWeight: "700",
                color: active ? "#fff" : Colors.text,
              }}
            >
              {c}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
