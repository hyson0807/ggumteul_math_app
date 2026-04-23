import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Path, Rect } from "react-native-svg";
import { Colors } from "@/constants/colors";
import { MAX_WORM_STAGE, WORM_STAGE_LABELS } from "@/constants/worm";
import { useStageNodes } from "@/hooks/useLearning";
import { ErrorState } from "@/components/common/ErrorState";
import type { ConceptNode } from "@/types/learning";

type NodeStatus = "cleared" | "active" | "locked" | "unavailable";

const NODE_CIRCLE_STYLE: Record<NodeStatus, { bg: string; border: string; label: string }> = {
  cleared: { bg: Colors.secondary, border: Colors.primary, label: "#fff" },
  active: { bg: Colors.cta, border: Colors.cta, label: "#fff" },
  locked: { bg: Colors.surface, border: Colors.surfaceBorder, label: Colors.textSecondary },
  unavailable: { bg: "#F5EDE7", border: Colors.surfaceBorder, label: Colors.inactive },
};

const NODE_LABEL_TEXT: Record<NodeStatus, string> = {
  cleared: "클리어",
  active: "도전",
  locked: "잠김",
  unavailable: "준비중",
};

function resolveNodeStatus(node: ConceptNode): NodeStatus {
  if (!node.playable) return "unavailable";
  if (node.cleared) return "cleared";
  if (node.locked) return "locked";
  return "active";
}

export default function StageScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { stage: stageParam } = useLocalSearchParams<{ stage: string }>();
  const parsed = Number.parseInt(stageParam ?? "1", 10);
  const safeStage =
    Number.isFinite(parsed) && parsed >= 1 && parsed <= MAX_WORM_STAGE
      ? parsed
      : 1;

  const { data, isLoading, isError, refetch } = useStageNodes(safeStage);
  const regionLabel = WORM_STAGE_LABELS[safeStage] ?? "";

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.background,
        paddingTop: insets.top,
      }}
    >
      <View
        style={{
          paddingHorizontal: 18,
          paddingVertical: 14,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 36,
            height: 36,
            borderRadius: 999,
            backgroundColor: Colors.surface,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: Colors.surfaceBorder,
          }}
        >
          <Text style={{ fontSize: 16, color: Colors.text }}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 10,
              color: Colors.textSecondary,
              fontWeight: "700",
              letterSpacing: 2,
            }}
          >
            STAGE {safeStage} · {data ? `${data.grade}-${data.semester}학기` : ""}
          </Text>
          <Text style={{ fontSize: 22, fontWeight: "900", color: Colors.text }}>
            {regionLabel}
          </Text>
        </View>
        {data && !data.stageLocked && (
          <View
            style={{
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 999,
              backgroundColor: Colors.secondary,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 12, fontWeight: "900" }}>
              {data.clearedNodes} / {data.totalNodes}
            </Text>
          </View>
        )}
      </View>

      <StageBody
        data={data}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        bottomInset={insets.bottom}
        onNodePress={(conceptId) => router.push(`/concept/${conceptId}`)}
      />
    </View>
  );
}

function StageBody({
  data,
  isLoading,
  isError,
  onRetry,
  bottomInset,
  onNodePress,
}: {
  data: ReturnType<typeof useStageNodes>["data"];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  bottomInset: number;
  onNodePress: (conceptId: number) => void;
}) {
  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (isError || !data) {
    return <ErrorState message="노드 정보를 불러오지 못했습니다." onRetry={onRetry} />;
  }

  if (data.stageLocked) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 14, paddingHorizontal: 30 }}>
        <LockIcon size={48} />
        <Text style={{ color: Colors.text, fontSize: 16, fontWeight: "900" }}>
          아직 잠겨 있어요
        </Text>
        <Text style={{ color: Colors.textSecondary, fontSize: 13, textAlign: "center", lineHeight: 19 }}>
          이전 스테이지의 모든 개념을 클리어하면 이 땅이 열립니다.
        </Text>
      </View>
    );
  }

  if (data.nodes.length === 0) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 30 }}>
        <Text style={{ color: Colors.textSecondary, fontSize: 13, textAlign: "center" }}>
          아직 이 학기에는 준비된 개념이 없어요.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{
        paddingHorizontal: 18,
        paddingTop: 8,
        paddingBottom: bottomInset + 30,
      }}
      showsVerticalScrollIndicator={false}
    >
      {data.nodes.map((node, idx) => (
        <NodeRow
          key={node.conceptId}
          node={node}
          index={idx}
          isLast={idx === data.nodes.length - 1}
          onPress={() => onNodePress(node.conceptId)}
        />
      ))}
    </ScrollView>
  );
}

function NodeRow({
  node,
  index,
  isLast,
  onPress,
}: {
  node: ConceptNode;
  index: number;
  isLast: boolean;
  onPress: () => void;
}) {
  const status = resolveNodeStatus(node);
  const disabled = status === "locked" || status === "unavailable";
  const circle = NODE_CIRCLE_STYLE[status];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={disabled ? 1 : 0.8}
      style={{ flexDirection: "row", gap: 14, alignItems: "stretch" }}
    >
      <View style={{ alignItems: "center", width: 56 }}>
        <View
          style={{
            width: 52,
            height: 52,
            borderRadius: 999,
            backgroundColor: circle.bg,
            borderWidth: 2,
            borderColor: circle.border,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <NodeBadge status={status} index={index} color={circle.label} />
        </View>
        {!isLast && (
          <View
            style={{
              width: 2,
              flex: 1,
              minHeight: 14,
              backgroundColor: Colors.surfaceBorder,
              marginVertical: 2,
            }}
          />
        )}
      </View>

      <View
        style={{
          flex: 1,
          backgroundColor: disabled ? "#F5EDE7" : Colors.surface,
          borderWidth: 1,
          borderColor: status === "active" ? Colors.cta : Colors.surfaceBorder,
          borderRadius: 14,
          padding: 14,
          marginBottom: 14,
          opacity: status === "unavailable" ? 0.65 : 1,
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text
            style={{
              fontSize: 10,
              fontWeight: "800",
              color: status === "active" ? Colors.cta : Colors.textSecondary,
              letterSpacing: 1,
            }}
          >
            {NODE_LABEL_TEXT[status]}
          </Text>
          <Text style={{ fontSize: 11, color: Colors.textSecondary, fontWeight: "700" }}>
            문제 {node.problemCount}개
          </Text>
        </View>
        <Text
          numberOfLines={2}
          style={{
            fontSize: 15,
            fontWeight: "900",
            color: disabled ? Colors.textSecondary : Colors.text,
            marginTop: 4,
            lineHeight: 20,
          }}
        >
          {node.name}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function NodeBadge({
  status,
  index,
  color,
}: {
  status: NodeStatus;
  index: number;
  color: string;
}) {
  if (status === "cleared") return <CheckIcon color={color} />;
  if (status === "locked" || status === "unavailable") {
    return <LockIcon size={20} color={color} />;
  }
  return (
    <Text style={{ color, fontWeight: "900", fontSize: 16 }}>{index + 1}</Text>
  );
}

function CheckIcon({ color = "#fff" }: { color?: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 22 22">
      <Path
        d="M5 11 L9.5 15 L17 7"
        stroke={color}
        strokeWidth={2.6}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function LockIcon({ size = 22, color = "#8D6E63" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 22 22">
      <Rect x={6} y={10} width={10} height={8} rx={1.5} fill={color} />
      <Path
        d="M7.5 10 V7 Q7.5 4 11 4 Q14.5 4 14.5 7 V10"
        stroke={color}
        strokeWidth={1.8}
        fill="none"
        strokeLinecap="round"
      />
      <Circle cx={11} cy={14} r={1.2} fill="#fff" />
    </Svg>
  );
}
