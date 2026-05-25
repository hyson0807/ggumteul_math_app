import { Pressable, Text, View, type ViewStyle } from "react-native";
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

interface StatusStyle {
  cardBg: string;
  cardBorder: string;
  cardBorderWidth: number;
  labelColor: string;
  shadowColor: string;
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
  circle: ViewStyle;
}

const NODE_CIRCLE_SIZE = 52;
const CONNECTOR_WIDTH = 2;
const LOCKED_BG = "#F4F8F6";
const CLEARED_BG = "#F0F7F3";

const BASE_CIRCLE: ViewStyle = {
  width: NODE_CIRCLE_SIZE,
  height: NODE_CIRCLE_SIZE,
  borderRadius: 999,
  alignItems: "center",
  justifyContent: "center",
};

const STATUS_STYLE: Record<NodeStatus, StatusStyle> = {
  active: {
    cardBg: Colors.surface,
    cardBorder: Colors.primary,
    cardBorderWidth: 1.5,
    labelColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
    circle: {
      ...BASE_CIRCLE,
      backgroundColor: "#fff",
      borderWidth: 2.5,
      borderColor: Colors.primary,
      shadowColor: Colors.primary,
      shadowOpacity: 0.3,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 3 },
      elevation: 4,
    },
  },
  cleared: {
    cardBg: CLEARED_BG,
    cardBorder: Colors.surfaceBorder,
    cardBorderWidth: 1,
    labelColor: Colors.primary,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
    circle: {
      ...BASE_CIRCLE,
      backgroundColor: Colors.primary,
      shadowColor: Colors.primary,
      shadowOpacity: 0.25,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
      elevation: 3,
    },
  },
  locked: {
    cardBg: LOCKED_BG,
    cardBorder: Colors.surfaceBorder,
    cardBorderWidth: 1,
    labelColor: Colors.inactive,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
    circle: {
      ...BASE_CIRCLE,
      backgroundColor: LOCKED_BG,
      borderWidth: 1.5,
      borderColor: Colors.surfaceBorder,
    },
  },
  unavailable: {
    cardBg: LOCKED_BG,
    cardBorder: Colors.surfaceBorder,
    cardBorderWidth: 1,
    labelColor: Colors.inactive,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
    circle: {
      ...BASE_CIRCLE,
      backgroundColor: LOCKED_BG,
      borderWidth: 1.5,
      borderColor: Colors.surfaceBorder,
    },
  },
};

export function ConceptNodeCard({ node, index, isLast, onPress }: Props) {
  const status = resolveStatus(node);
  const disabled = status === "locked" || status === "unavailable";
  const style = STATUS_STYLE[status];

  const handlePress = () => {
    if (disabled) return;
    feedback.tabPress();
    onPress();
  };

  return (
    <View style={{ flexDirection: "row", gap: 14, alignItems: "stretch" }}>
      <View style={{ width: NODE_CIRCLE_SIZE, alignItems: "center" }}>
        <View style={style.circle}>
          <NodeCircleContent status={status} index={index} />
        </View>
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

      <Pressable
        onPress={handlePress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={`${node.name} ${STATUS_LABEL[status]}`}
        style={({ pressed }) => ({
          flex: 1,
          marginBottom: 14,
          backgroundColor: style.cardBg,
          borderRadius: 18,
          borderWidth: style.cardBorderWidth,
          borderColor: style.cardBorder,
          paddingVertical: 14,
          paddingHorizontal: 16,
          shadowColor: style.shadowColor,
          shadowOpacity: style.shadowOpacity,
          shadowRadius: style.shadowRadius,
          shadowOffset: { width: 0, height: 3 },
          elevation: style.elevation,
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
              color: style.labelColor,
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

function NodeCircleContent({
  status,
  index,
}: {
  status: NodeStatus;
  index: number;
}) {
  if (status === "cleared") {
    return <MaterialCommunityIcons name="check" size={26} color="#fff" />;
  }
  if (status === "active") {
    return (
      <Text style={{ fontFamily: "Jua", fontSize: 18, color: Colors.primary }}>
        {index + 1}
      </Text>
    );
  }
  return (
    <MaterialCommunityIcons
      name="lock-outline"
      size={22}
      color={Colors.inactive}
    />
  );
}
