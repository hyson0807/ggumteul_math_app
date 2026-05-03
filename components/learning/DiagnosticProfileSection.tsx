import { ActivityIndicator, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { useDiagnosticProfile } from "@/hooks/useLearning";
import type { DiagnosticProfileItem } from "@/types/learning";

export function DiagnosticProfileSection() {
  const { data, isLoading, isError } = useDiagnosticProfile();

  if (isError) return null;

  return (
    <View style={{ marginBottom: 18 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          marginBottom: 8,
          paddingHorizontal: 4,
        }}
      >
        <MaterialCommunityIcons
          name="brain"
          size={16}
          color={Colors.primary}
        />
        <Text style={{ fontSize: 14, fontWeight: "900", color: Colors.text }}>
          AI 분석 결과
        </Text>
      </View>
      <Text
        style={{
          fontSize: 11,
          color: Colors.textSecondary,
          marginBottom: 10,
          paddingHorizontal: 4,
        }}
      >
        진단평가를 바탕으로 추정한 강점·약점 영역이에요
      </Text>

      {isLoading || !data ? (
        <View
          style={{
            backgroundColor: Colors.surface,
            borderRadius: 18,
            paddingVertical: 28,
            alignItems: "center",
            borderWidth: 1,
            borderColor: Colors.surfaceBorder,
          }}
        >
          <ActivityIndicator size="small" color={Colors.primary} />
          <Text
            style={{
              marginTop: 8,
              fontSize: 12,
              color: Colors.textSecondary,
              fontWeight: "700",
            }}
          >
            분석 중...
          </Text>
        </View>
      ) : (
        <View style={{ gap: 12 }}>
          <ProfileGroup
            title="강점"
            tint={Colors.success}
            items={data.strong}
          />
          <ProfileGroup
            title="약점"
            tint={Colors.error}
            items={data.weak}
          />
        </View>
      )}
    </View>
  );
}

function ProfileGroup({
  title,
  tint,
  items,
}: {
  title: string;
  tint: string;
  items: DiagnosticProfileItem[];
}) {
  if (items.length === 0) return null;
  return (
    <View
      style={{
        backgroundColor: Colors.surface,
        borderRadius: 18,
        padding: 14,
        borderWidth: 1,
        borderColor: Colors.surfaceBorder,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          marginBottom: 10,
        }}
      >
        <View
          style={{
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 999,
            backgroundColor: `${tint}1A`,
            borderWidth: 1,
            borderColor: tint,
          }}
        >
          <Text style={{ fontSize: 11, fontWeight: "900", color: tint }}>
            {title}
          </Text>
        </View>
        <Text
          style={{ fontSize: 11, color: Colors.textSecondary, fontWeight: "700" }}
        >
          {items.length}개 영역
        </Text>
      </View>

      <View style={{ gap: 6 }}>
        {items.map((item) => (
          <ProfileRow key={item.knowledgeTag} item={item} tint={tint} />
        ))}
      </View>
    </View>
  );
}

function ProfileRow({
  item,
  tint,
}: {
  item: DiagnosticProfileItem;
  tint: string;
}) {
  const percent = Math.round(item.probability * 100);
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderRadius: 10,
        backgroundColor: `${tint}0F`,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 13,
            fontWeight: "800",
            color: Colors.text,
          }}
          numberOfLines={2}
        >
          {item.conceptName}
        </Text>
        <Text
          style={{
            fontSize: 10,
            color: Colors.textSecondary,
            fontWeight: "700",
            marginTop: 2,
          }}
        >
          {item.grade}학년 {item.semester}학기
        </Text>
      </View>
      <Text
        style={{
          fontSize: 13,
          fontWeight: "900",
          color: tint,
          minWidth: 38,
          textAlign: "right",
        }}
      >
        {percent}%
      </Text>
    </View>
  );
}
