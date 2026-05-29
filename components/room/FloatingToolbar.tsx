import { Pressable, View, Text } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { feedback } from "@/utils/feedback";

interface Props {
  canvasW: number;
  canvasH: number;
  anchorX: number; // 0~1, 가구 중심의 캔버스 가로 비율
  anchorY: number; // 0~1, 가구 좌상단의 캔버스 세로 비율 (위쪽에 띄움)
  showRotate: boolean;
  showFlip: boolean;
  flipX: boolean;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onFlip: () => void;
  onClose: () => void;
}

const TOOLBAR_HEIGHT = 40;
const TOOLBAR_GAP = 8; // 가구 위쪽과 툴바 사이 간격

export function FloatingToolbar({
  canvasW,
  canvasH,
  anchorX,
  anchorY,
  showRotate,
  showFlip,
  flipX,
  onRotateLeft,
  onRotateRight,
  onFlip,
  onClose,
}: Props) {
  if (canvasW <= 0 || canvasH <= 0) return null;

  const buttonCount = (showRotate ? 2 : 0) + (showFlip ? 1 : 0) + 1; // +close
  const toolbarWidth = buttonCount * 44 + 12; // 버튼 44px + 좌우 패딩

  // 가구 위에 띄우되, 위 공간 부족 시 아래에 표시
  const anchorTopPx = anchorY * canvasH;
  const showBelow = anchorTopPx < TOOLBAR_HEIGHT + TOOLBAR_GAP + 8;
  const topPx = showBelow
    ? anchorTopPx + 80 // 가구 위쪽 어림잡아 아래로
    : anchorTopPx - TOOLBAR_HEIGHT - TOOLBAR_GAP;

  // anchorX 중심으로 정렬 + 좌우 캔버스 경계 클램핑
  const centerPx = anchorX * canvasW;
  const leftPx = Math.max(
    8,
    Math.min(canvasW - toolbarWidth - 8, centerPx - toolbarWidth / 2),
  );

  const press = (fn: () => void) => () => {
    feedback.tabPress();
    fn();
  };

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        left: leftPx,
        top: topPx,
        zIndex: 999,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.surface,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: Colors.surfaceBorder,
        paddingHorizontal: 6,
        height: TOOLBAR_HEIGHT,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 4,
        elevation: 4,
      }}
    >
      {showRotate && (
        <Pressable
          onPress={press(onRotateLeft)}
          hitSlop={6}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MaterialCommunityIcons
            name="rotate-left"
            size={22}
            color={Colors.text}
          />
        </Pressable>
      )}
      {showFlip && (
        <Pressable
          onPress={press(onFlip)}
          hitSlop={6}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: flipX ? Colors.primaryLight : "transparent",
          }}
        >
          <MaterialCommunityIcons
            name="flip-horizontal"
            size={20}
            color={flipX ? "#fff" : Colors.text}
          />
        </Pressable>
      )}
      {showRotate && (
        <Pressable
          onPress={press(onRotateRight)}
          hitSlop={6}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MaterialCommunityIcons
            name="rotate-right"
            size={22}
            color={Colors.text}
          />
        </Pressable>
      )}
      {!showRotate && !showFlip && (
        <View
          style={{
            paddingHorizontal: 8,
            height: 36,
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 12, color: Colors.textSecondary }}>
            드래그로 이동
          </Text>
        </View>
      )}
      <Pressable
        onPress={press(onClose)}
        hitSlop={6}
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          alignItems: "center",
          justifyContent: "center",
          marginLeft: 2,
        }}
      >
        <MaterialCommunityIcons name="close" size={18} color={Colors.text} />
      </Pressable>
    </View>
  );
}
