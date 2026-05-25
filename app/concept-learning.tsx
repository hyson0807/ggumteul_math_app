import { useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { feedback } from "@/utils/feedback";
import { ALL_STAGES, STAGE_SCENES } from "@/constants/stages";
import { SemesterSection } from "@/components/learning/SemesterSection";

type Mode = "grade" | "concept";

export default function ConceptLearningScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<Mode>("concept");

  const switchMode = (next: Mode) => {
    if (next === mode) return;
    feedback.tabPress();
    setMode(next);
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: insets.top + 8,
          paddingBottom: 8,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityLabel="뒤로 가기"
          hitSlop={10}
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
          <MaterialCommunityIcons
            name="chevron-left"
            size={22}
            color={Colors.text}
          />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontFamily: "Jua",
              fontSize: 10,
              letterSpacing: 2,
              color: Colors.textSecondary,
            }}
          >
            CONCEPT LEARNING
          </Text>
          <Text style={{ fontFamily: "Jua", fontSize: 22, color: Colors.text }}>
            개념 학습
          </Text>
        </View>
      </View>

      <View style={{ paddingHorizontal: 20, paddingBottom: 16 }}>
        <Text
          style={{
            fontFamily: "GowunDodum",
            fontSize: 13,
            color: Colors.textSecondary,
            marginBottom: 12,
          }}
        >
          학년별 또는 개념별로 골라서 풀 수 있어요
        </Text>

        <View
          style={{
            flexDirection: "row",
            padding: 4,
            backgroundColor: Colors.surface,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: Colors.surfaceBorder,
          }}
        >
          {(["grade", "concept"] as Mode[]).map((m) => {
            const active = mode === m;
            return (
              <Pressable
                key={m}
                onPress={() => switchMode(m)}
                accessibilityRole="button"
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 999,
                  alignItems: "center",
                  backgroundColor: active ? Colors.primary : "transparent",
                  shadowColor: active ? "#000" : "transparent",
                  shadowOpacity: active ? 0.12 : 0,
                  shadowRadius: active ? 6 : 0,
                  shadowOffset: { width: 0, height: 2 },
                }}
              >
                <Text
                  style={{
                    fontFamily: "Jua",
                    fontSize: 14,
                    color: active ? "#fff" : Colors.textSecondary,
                  }}
                >
                  {m === "grade" ? "학년별" : "개념별"}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {mode === "grade" ? (
        <GradeTabPlaceholder bottomInset={insets.bottom} />
      ) : (
        <ConceptTab bottomInset={insets.bottom} />
      )}
    </View>
  );
}

function ConceptTab({ bottomInset }: { bottomInset: number }) {
  return (
    <ScrollView
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingTop: 4,
        paddingBottom: bottomInset + 80,
      }}
      showsVerticalScrollIndicator={false}
    >
      {ALL_STAGES.map((stage) => (
        <SemesterSection
          key={stage}
          stage={stage}
          gradeLabel={STAGE_SCENES[stage].grade}
        />
      ))}
    </ScrollView>
  );
}

function GradeTabPlaceholder({ bottomInset }: { bottomInset: number }) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 36,
        paddingBottom: bottomInset + 80,
        gap: 14,
      }}
    >
      <View
        style={{
          width: 72,
          height: 72,
          borderRadius: 999,
          backgroundColor: Colors.surface,
          borderWidth: 1,
          borderColor: Colors.surfaceBorder,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <MaterialCommunityIcons
          name="clock-outline"
          size={36}
          color={Colors.inactive}
        />
      </View>
      <Text
        style={{
          fontFamily: "Jua",
          fontSize: 18,
          color: Colors.text,
        }}
      >
        준비 중이에요
      </Text>
      <Text
        style={{
          fontFamily: "GowunDodum",
          fontSize: 13,
          color: Colors.textSecondary,
          textAlign: "center",
          lineHeight: 20,
        }}
      >
        곧 학년별로 모아 풀 수 있는 학습이 열려요.{"\n"}먼저 개념별 탭에서
        시작해볼까요?
      </Text>
    </View>
  );
}
