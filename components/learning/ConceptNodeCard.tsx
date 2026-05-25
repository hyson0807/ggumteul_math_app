import { Pressable, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { feedback } from "@/utils/feedback";
import type { ConceptNode } from "@/types/learning";

type NodeStatus = "active" | "cleared" | "locked" | "unavailable";

interface Props {
  node: ConceptNode;
  index: number;
  isLast?: boolean;
  onPress: () => void;
}

function resolveStatus(node: ConceptNode): NodeStatus {
  if (!node.playable) return "unavailable";
  if (node.cleared) return "cleared";
  if (node.locked) return "locked";
  return "active";
}

const STATUS_LABEL: Record<NodeStatus, string> = {
  active: "진행중",
  cleared: "완료",
  locked: "잠김",
  unavailable: "준비 중",
};

const NODE_CIRCLE_SIZE = 52;
const CONNECTOR_WIDTH = 2;

export function ConceptNodeCard({ node, index, isLast, onPress }: Props) {
  const status = resolveStatus(node);
  const disabled = status === "locked" || status === "unavailable";

  const handlePress = () => {
    if (disabled) return;
    feedback.tabPress();
    onPress();
  };

  return (
    <View style={{ flexDirection: "row", gap: 14, alignItems: "stretch" }}>
      {/* Left column: circle node + connector */}
      <View style={{ width: NODE_CIRCLE_SIZE, alignItems: "center" }}>
        <NodeCircle status={status} index={index} />
        {!isLast && (
          <View
            style={{
              width: CONNECTOR_WIDTH,
              flex: 1,
              minHeight: 18,
              backgroundColor:
                status === "cleared" ? Colors.primary : Colors.surfaceBorder,
              opacity: status === "cleared" ? 0.6 : 1,
              marginTop: 4,
              marginBottom: 4,
              borderRadius: CONNECTOR_WIDTH,
            }}
          />
        )}
      </View>

      {/* Right side: card */}
      <Pressable
        onPress={handlePress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={`${node.name} ${STATUS_LABEL[status]}`}
        style={({ pressed }) => ({
          flex: 1,
          marginBottom: 14,
          backgroundColor: cardBg(status),
          borderRadius: 18,
          borderWidth: status === "active" ? 1.5 : 1,
          borderColor: cardBorder(status),
          paddingVertical: 14,
          paddingHorizontal: 16,
          shadowColor: status === "active" ? Colors.primary : "#000",
          shadowOpacity: status === "active" ? 0.12 : 0.04,
          shadowRadius: status === "active" ? 12 : 8,
          shadowOffset: { width: 0, height: 3 },
          elevation: status === "active" ? 4 : 1,
          opacity: pressed && !disabled ? 0.9 : 1,
        })}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 6,
          }}
        >
          <Text
            style={{
              fontFamily: "Jua",
              fontSize: 10,
              letterSpacing: 2,
              color: labelColor(status),
            }}
          >
            {STATUS_LABEL[status].toUpperCase()}
          </Text>
          {status === "active" && (
            <View
              style={{
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 999,
                backgroundColor: Colors.primary,
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontFamily: "Jua",
                  fontSize: 10,
                  letterSpacing: 0.5,
                }}
              >
                도전!
              </Text>
            </View>
          )}
        </View>

        <Text
          numberOfLines={2}
          style={{
            fontFamily: "Jua",
            fontSize: 16,
            color: disabled ? Colors.inactive : Colors.text,
            lineHeight: 22,
          }}
        >
          {node.name}
        </Text>

        <View
          style={{
            marginTop: 8,
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
          }}
        >
          <MaterialCommunityIcons
            name="file-document-outline"
            size={13}
            color={Colors.textSecondary}
          />
          <Text
            style={{
              fontFamily: "GowunDodum",
              fontSize: 12,
              color: Colors.textSecondary,
            }}
          >
            문제 {node.problemCount}개
          </Text>
        </View>
      </Pressable>
    </View>
  );
}

function NodeCircle({
  status,
  index,
}: {
  status: NodeStatus;
  index: number;
}) {
  if (status === "cleared") {
    return (
      <View
        style={{
          width: NODE_CIRCLE_SIZE,
          height: NODE_CIRCLE_SIZE,
          borderRadius: 999,
          backgroundColor: Colors.primary,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: Colors.primary,
          shadowOpacity: 0.25,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 3 },
          elevation: 3,
        }}
      >
        <MaterialCommunityIcons name="check" size={26} color="#fff" />
      </View>
    );
  }

  if (status === "active") {
    return (
      <View
        style={{
          width: NODE_CIRCLE_SIZE,
          height: NODE_CIRCLE_SIZE,
          borderRadius: 999,
          backgroundColor: "#fff",
          borderWidth: 2.5,
          borderColor: Colors.primary,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: Colors.primary,
          shadowOpacity: 0.3,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 3 },
          elevation: 4,
        }}
      >
        <Text
          style={{
            fontFamily: "Jua",
            fontSize: 18,
            color: Colors.primary,
          }}
        >
          {index + 1}
        </Text>
      </View>
    );
  }

  // locked / unavailable
  return (
    <View
      style={{
        width: NODE_CIRCLE_SIZE,
        height: NODE_CIRCLE_SIZE,
        borderRadius: 999,
        backgroundColor: "#F4F8F6",
        borderWidth: 1.5,
        borderColor: Colors.surfaceBorder,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <MaterialCommunityIcons
        name="lock-outline"
        size={22}
        color={Colors.inactive}
      />
    </View>
  );
}

function cardBg(status: NodeStatus): string {
  if (status === "cleared") return "#F0F7F3";
  if (status === "locked" || status === "unavailable") return "#F4F8F6";
  return Colors.surface;
}

function cardBorder(status: NodeStatus): string {
  if (status === "active") return Colors.primary;
  return Colors.surfaceBorder;
}

function labelColor(status: NodeStatus): string {
  if (status === "active") return Colors.primary;
  if (status === "cleared") return Colors.primary;
  return Colors.inactive;
}
