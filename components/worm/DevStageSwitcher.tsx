import { Text, TouchableOpacity, View } from "react-native";
import { ALL_STAGES, type StageId } from "@/constants/stages";

interface Props {
  currentStage: number;
  realStage: number;
  onChange: (stage: StageId | null) => void;
  bottomOffset: number;
}

export function DevStageSwitcher({
  currentStage,
  realStage,
  onChange,
  bottomOffset,
}: Props) {
  return (
    <View
      style={{
        position: "absolute",
        left: 10,
        right: 10,
        bottom: bottomOffset,
        padding: 8,
        borderRadius: 12,
        backgroundColor: "rgba(0,0,0,0.62)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.18)",
        gap: 6,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text
          style={{
            fontSize: 10,
            color: "#FFD166",
            fontWeight: "800",
            letterSpacing: 2,
          }}
        >
          DEV · STAGE
        </Text>
        <TouchableOpacity
          onPress={() => onChange(null)}
          hitSlop={8}
          style={{
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 999,
            backgroundColor:
              currentStage === realStage ? "rgba(255,209,102,0.25)" : "rgba(255,255,255,0.1)",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.2)",
          }}
        >
          <Text style={{ fontSize: 10, color: "#fff", fontWeight: "800" }}>
            실제 {realStage}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={{ flexDirection: "row", gap: 6 }}>
        {ALL_STAGES.map((s) => {
          const active = s === currentStage;
          return (
            <TouchableOpacity
              key={s}
              onPress={() => onChange(s)}
              activeOpacity={0.8}
              style={{
                flex: 1,
                height: 32,
                borderRadius: 8,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: active ? "#C0392B" : "rgba(255,255,255,0.08)",
                borderWidth: 1,
                borderColor: active ? "#C0392B" : "rgba(255,255,255,0.2)",
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: "900",
                }}
              >
                {s}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
