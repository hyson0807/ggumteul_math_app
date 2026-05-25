import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { useStageNodes } from "@/hooks/useLearning";
import type { StageId } from "@/constants/stages";
import { ConceptNodeCard } from "./ConceptNodeCard";

interface Props {
  stage: StageId;
  gradeLabel: string;
}

export function SemesterSection({ stage, gradeLabel }: Props) {
  const router = useRouter();
  const { data, isLoading, isError } = useStageNodes(stage);

  const total = data?.totalNodes ?? 0;
  const cleared = data?.clearedNodes ?? 0;
  const percent = total > 0 ? Math.min(100, (cleared / total) * 100) : 0;

  return (
    <View style={{ marginBottom: 26 }}>
      <SemesterHeader
        gradeLabel={gradeLabel}
        cleared={cleared}
        total={total}
        percent={percent}
        stageLocked={data?.stageLocked ?? false}
        loading={isLoading}
      />

      {isLoading && <SemesterSkeleton />}

      {isError && (
        <PlaceholderRow
          icon="alert-circle-outline"
          text="불러오지 못했어요"
        />
      )}

      {data?.stageLocked && (
        <PlaceholderRow icon="lock-outline" text="아직 잠겨 있어요" />
      )}

      {data && !data.stageLocked && data.nodes.length === 0 && (
        <PlaceholderRow
          icon="clock-outline"
          text="아직 준비된 개념이 없어요"
        />
      )}

      {data &&
        !data.stageLocked &&
        data.nodes.map((node, idx) => (
          <ConceptNodeCard
            key={node.conceptId}
            node={node}
            index={idx}
            isLast={idx === data.nodes.length - 1}
            onPress={() => router.push(`/concept/${node.conceptId}`)}
          />
        ))}
    </View>
  );
}

function SemesterHeader({
  gradeLabel,
  cleared,
  total,
  percent,
  stageLocked,
  loading,
}: {
  gradeLabel: string;
  cleared: number;
  total: number;
  percent: number;
  stageLocked: boolean;
  loading: boolean;
}) {
  const showProgress = !loading && !stageLocked && total > 0;
  return (
    <View style={{ marginBottom: 14 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <Text
          style={{
            fontFamily: "Jua",
            fontSize: 17,
            color: Colors.text,
            letterSpacing: 0.2,
          }}
        >
          {gradeLabel}
        </Text>
        {showProgress && (
          <Text
            style={{
              fontFamily: "GowunDodum",
              fontSize: 12,
              color: Colors.textSecondary,
            }}
          >
            <Text style={{ color: Colors.primary, fontFamily: "Jua" }}>
              {cleared}
            </Text>
            {" / "}
            {total}
          </Text>
        )}
      </View>
      {showProgress && (
        <View
          style={{
            height: 4,
            borderRadius: 999,
            backgroundColor: Colors.surfaceBorder,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              width: `${percent}%`,
              height: "100%",
              backgroundColor: Colors.primary,
              borderRadius: 999,
            }}
          />
        </View>
      )}
    </View>
  );
}

function SemesterSkeleton() {
  return (
    <View>
      {[0, 1, 2].map((i) => (
        <View
          key={i}
          style={{
            flexDirection: "row",
            gap: 14,
            marginBottom: 14,
          }}
        >
          <View
            style={{
              width: 52,
              height: 52,
              borderRadius: 999,
              backgroundColor: Colors.surfaceBorder,
              opacity: 0.4,
            }}
          />
          <View
            style={{
              flex: 1,
              height: 80,
              borderRadius: 18,
              backgroundColor: Colors.surfaceBorder,
              opacity: 0.4,
            }}
          />
        </View>
      ))}
    </View>
  );
}

function PlaceholderRow({
  icon,
  text,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  text: string;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: "#F4F8F6",
        borderRadius: 18,
        borderWidth: 1,
        borderColor: Colors.surfaceBorder,
        paddingVertical: 14,
        paddingHorizontal: 16,
      }}
    >
      <MaterialCommunityIcons name={icon} size={18} color={Colors.inactive} />
      <Text
        style={{
          fontFamily: "GowunDodum",
          fontSize: 13,
          color: Colors.textSecondary,
        }}
      >
        {text}
      </Text>
    </View>
  );
}
