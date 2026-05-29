import { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, type LayoutChangeEvent } from "react-native";
import { Image } from "expo-image";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { API_BASE_URL } from "@/services/api";
import { Colors } from "@/constants/colors";
import { WormSprite } from "@/components/worm/WormSprite";
import { FloatingToolbar } from "@/components/room/FloatingToolbar";
import type {
  FurnitureSlotPosition,
  PlacedRoomSlot,
  RoomLayout,
  RoomState,
  WormPosition,
} from "@/types/room";
import type { ShopItem } from "@/types/shop";
import type { WormState } from "@/types/worm";

export type EditSelection = PlacedRoomSlot | "worm" | null;

interface Props {
  room: RoomState["equipped"] | undefined;
  worm?: WormState["equipped"];
  layout?: RoomLayout | null;
  draftLayout?: RoomLayout;
  editMode?: boolean;
  selected?: EditSelection;
  onSelect?: (selection: EditSelection) => void;
  onDraftChange?: (next: RoomLayout) => void;
  showWorm?: boolean;
  showPlaceholders?: boolean;
}

/* --------------------------------------------------------------------------
 * 좌표계: 모든 위치는 캔버스 기준 정규화 (0~1).
 *   x = 캔버스 width 비율 (CSS left)
 *   y = 캔버스 height 비율 (CSS top)
 *   width = 캔버스 width 비율 (가구별 고정, 사용자 변경 불가)
 * -------------------------------------------------------------------------- */

interface SlotDefault extends FurnitureSlotPosition {
  width: number; // 0~1
  zIndex: number;
}

const SLOT_DEFAULTS: Record<PlacedRoomSlot, SlotDefault> = {
  clock: { x: 0.32, y: 0.08, rotate: 0, flipX: false, width: 0.18, zIndex: 3 },
  shelf: { x: 0.25, y: 0.3, rotate: -2, flipX: false, width: 0.32, zIndex: 4 },
  light: { x: 0.45, y: 0.35, rotate: 5, flipX: true, width: 0.32, zIndex: 5 },
  desk: { x: -0.05, y: 0.4, rotate: 3, flipX: true, width: 0.45, zIndex: 5 },
  bed: { x: 0.56, y: 0.4, rotate: 6, flipX: true, width: 0.49, zIndex: 4 },
  rug: { x: 0.12, y: 0.5, rotate: 6, flipX: false, width: 0.7, zIndex: 1 },
};

const SLOT_ORDER: PlacedRoomSlot[] = [
  "clock",
  "shelf",
  "light",
  "desk",
  "bed",
  "rug",
];

const WORM_DEFAULT: WormPosition = { x: 0.34, y: 0.7 };
const WORM_WIDTH = 0.32;
const WORM_Z_INDEX = 8;

function resolveSlotPosition(
  slot: PlacedRoomSlot,
  draft: RoomLayout | undefined,
  server: RoomLayout | null | undefined,
): FurnitureSlotPosition {
  const d = SLOT_DEFAULTS[slot];
  return (
    draft?.[slot] ??
    server?.[slot] ?? { x: d.x, y: d.y, rotate: d.rotate, flipX: d.flipX }
  );
}

function resolveWormPosition(
  draft: RoomLayout | undefined,
  server: RoomLayout | null | undefined,
): WormPosition {
  return draft?.worm ?? server?.worm ?? WORM_DEFAULT;
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

function DraggableFurniture({
  item,
  position,
  width,
  zIndex,
  editMode,
  selected,
  onSelect,
  onMove,
  canvasW,
  canvasH,
}: {
  item: ShopItem;
  position: FurnitureSlotPosition;
  width: number;
  zIndex: number;
  editMode: boolean;
  selected: boolean;
  onSelect: () => void;
  onMove: (x: number, y: number) => void;
  canvasW: number;
  canvasH: number;
}) {
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);

  // position 이 부모 state 갱신으로 새로 들어오면 translate 리셋
  useEffect(() => {
    tx.value = 0;
    ty.value = 0;
  }, [position.x, position.y, tx, ty]);

  // worklet 안에서는 primitive 만 캡처 (객체 속성 직접 접근 X)
  const flipX = position.flipX;
  const rotate = position.rotate;
  const px = position.x;
  const py = position.y;

  // 드래그 종료 시 px translation → 정규화 좌표 + 클램핑 (JS 쪽에서 처리)
  const handleDragEnd = useCallback(
    (translationX: number, translationY: number) => {
      if (canvasW <= 0 || canvasH <= 0) return;
      const newX = clamp01(px + translationX / canvasW);
      const newY = clamp01(py + translationY / canvasH);
      onMove(newX, newY);
    },
    [px, py, canvasW, canvasH, onMove],
  );

  const tap = useMemo(
    () => Gesture.Tap().onEnd(() => runOnJS(onSelect)()),
    [onSelect],
  );

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .enabled(selected && canvasW > 0 && canvasH > 0)
        .onUpdate((e) => {
          "worklet";
          tx.value = e.translationX;
          ty.value = e.translationY;
        })
        .onEnd((e) => {
          "worklet";
          runOnJS(handleDragEnd)(e.translationX, e.translationY);
        }),
    [selected, canvasW, canvasH, handleDragEnd, tx, ty],
  );

  const composed = useMemo(
    () => Gesture.Simultaneous(tap, pan),
    [tap, pan],
  );

  const animatedStyle = useAnimatedStyle(() => {
    "worklet";
    return {
      transform: [
        { translateX: tx.value },
        { translateY: ty.value },
        { scaleX: flipX ? -1 : 1 },
        { rotate: `${rotate}deg` },
      ],
    };
  }, [flipX, rotate]);

  const content = (
    <Animated.View
      style={[
        {
          width: "100%",
          height: "100%",
        },
        animatedStyle,
      ]}
    >
      <Image
        source={{ uri: `${API_BASE_URL}${item.imageUrl}` }}
        style={{ width: "100%", height: "100%" }}
        contentFit="contain"
        cachePolicy="memory-disk"
        transition={150}
      />
    </Animated.View>
  );

  const containerStyle = {
    position: "absolute" as const,
    left: `${position.x * 100}%` as `${number}%`,
    top: `${position.y * 100}%` as `${number}%`,
    width: `${width * 100}%` as `${number}%`,
    aspectRatio: 1,
    zIndex: selected ? zIndex + 100 : zIndex,
  };

  if (!editMode) {
    return (
      <View pointerEvents="none" style={containerStyle}>
        {content}
      </View>
    );
  }

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={containerStyle}>
        {selected && (
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              left: -4,
              top: -4,
              right: -4,
              bottom: -4,
              borderWidth: 2,
              borderColor: Colors.cta,
              borderRadius: 12,
              borderStyle: "dashed",
            }}
          />
        )}
        {content}
      </Animated.View>
    </GestureDetector>
  );
}

function DraggableWorm({
  worm,
  position,
  editMode,
  selected,
  onSelect,
  onMove,
  canvasW,
  canvasH,
}: {
  worm?: WormState["equipped"];
  position: WormPosition;
  editMode: boolean;
  selected: boolean;
  onSelect: () => void;
  onMove: (x: number, y: number) => void;
  canvasW: number;
  canvasH: number;
}) {
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);

  useEffect(() => {
    tx.value = 0;
    ty.value = 0;
  }, [position.x, position.y, tx, ty]);

  const px = position.x;
  const py = position.y;

  const handleDragEnd = useCallback(
    (translationX: number, translationY: number) => {
      if (canvasW <= 0 || canvasH <= 0) return;
      const newX = clamp01(px + translationX / canvasW);
      const newY = clamp01(py + translationY / canvasH);
      onMove(newX, newY);
    },
    [px, py, canvasW, canvasH, onMove],
  );

  const tap = useMemo(
    () => Gesture.Tap().onEnd(() => runOnJS(onSelect)()),
    [onSelect],
  );

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .enabled(selected && canvasW > 0 && canvasH > 0)
        .onUpdate((e) => {
          "worklet";
          tx.value = e.translationX;
          ty.value = e.translationY;
        })
        .onEnd((e) => {
          "worklet";
          runOnJS(handleDragEnd)(e.translationX, e.translationY);
        }),
    [selected, canvasW, canvasH, handleDragEnd, tx, ty],
  );

  const composed = useMemo(
    () => Gesture.Simultaneous(tap, pan),
    [tap, pan],
  );

  const animatedStyle = useAnimatedStyle(() => {
    "worklet";
    return {
      transform: [{ translateX: tx.value }, { translateY: ty.value }],
    };
  });

  const containerStyle = {
    position: "absolute" as const,
    left: `${position.x * 100}%` as `${number}%`,
    top: `${position.y * 100}%` as `${number}%`,
    width: `${WORM_WIDTH * 100}%` as `${number}%`,
    alignItems: "center" as const,
    zIndex: selected ? WORM_Z_INDEX + 100 : WORM_Z_INDEX,
  };

  const content = <WormSprite equipped={worm} size={0.85} />;

  if (!editMode) {
    return (
      <View pointerEvents="none" style={containerStyle}>
        {content}
      </View>
    );
  }

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={[containerStyle, animatedStyle]}>
        {selected && (
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              left: -6,
              top: -6,
              right: -6,
              bottom: -6,
              borderWidth: 2,
              borderColor: Colors.cta,
              borderRadius: 999,
              borderStyle: "dashed",
            }}
          />
        )}
        {content}
      </Animated.View>
    </GestureDetector>
  );
}

function EmptySlot({
  slot,
  position,
  width,
  zIndex,
}: {
  slot: PlacedRoomSlot;
  position: FurnitureSlotPosition;
  width: number;
  zIndex: number;
}) {
  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: `${position.x * 100}%`,
        top: `${position.y * 100}%`,
        width: `${width * 100}%`,
        aspectRatio: 1,
        zIndex,
      }}
      className="items-center justify-center"
    >
      <View className="opacity-30 bg-white rounded-2xl border-2 border-dashed border-village-border w-full h-full items-center justify-center">
        <MaterialCommunityIcons name="plus" size={20} color={Colors.inactive} />
        <Text className="text-[10px] text-village-text-secondary mt-0.5">
          {slot}
        </Text>
      </View>
    </View>
  );
}

export function RoomCanvas({
  room,
  worm,
  layout,
  draftLayout,
  editMode = false,
  selected = null,
  onSelect,
  onDraftChange,
  showWorm = true,
  showPlaceholders = false,
}: Props) {
  const placed = useMemo(() => room ?? null, [room]);
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });

  const onCanvasLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setCanvasSize({ w: width, h: height });
  }, []);

  const wallpaper = placed?.wallpaper ?? null;
  const backgroundSource = wallpaper
    ? { uri: `${API_BASE_URL}${wallpaper.imageUrl}` }
    : require("@/assets/images/room-empty-card.png");

  const wormPos = resolveWormPosition(draftLayout, layout);

  // 가구 이동/회전/반전 핸들러
  const updateSlot = useCallback(
    (slot: PlacedRoomSlot, patch: Partial<FurnitureSlotPosition>) => {
      const current = resolveSlotPosition(slot, draftLayout, layout);
      const next: RoomLayout = {
        ...(draftLayout ?? {}),
        [slot]: { ...current, ...patch },
      };
      onDraftChange?.(next);
    },
    [draftLayout, layout, onDraftChange],
  );

  const moveSlot = useCallback(
    (slot: PlacedRoomSlot) => (x: number, y: number) =>
      updateSlot(slot, { x, y }),
    [updateSlot],
  );

  const moveWorm = useCallback(
    (x: number, y: number) => {
      const next: RoomLayout = { ...(draftLayout ?? {}), worm: { x, y } };
      onDraftChange?.(next);
    },
    [draftLayout, onDraftChange],
  );

  const selectedSlotPos =
    selected && selected !== "worm"
      ? resolveSlotPosition(selected, draftLayout, layout)
      : null;
  const selectedSlotWidth =
    selected && selected !== "worm" ? SLOT_DEFAULTS[selected].width : 0;

  // 배경(빈 영역) 탭으로 선택 해제 — 가구/지렁이는 더 높은 zIndex 라 그쪽 GestureDetector 가 우선
  const handleBackgroundTap = useCallback(() => {
    onSelect?.(null);
  }, [onSelect]);

  const backgroundTap = useMemo(
    () => Gesture.Tap().onEnd(() => runOnJS(handleBackgroundTap)()),
    [handleBackgroundTap],
  );

  const canvasInner = (
    <>
      <Image
        source={backgroundSource}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
        }}
        contentFit="cover"
        cachePolicy="memory-disk"
        transition={150}
      />

      {/* 빈 영역 탭으로 선택 해제 — 가구/지렁이보다 낮은 zIndex */}
      {editMode && (
        <GestureDetector gesture={backgroundTap}>
          <View
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              right: 0,
              bottom: 0,
              zIndex: 1,
            }}
          />
        </GestureDetector>
      )}

      {SLOT_ORDER.map((slot) => {
        const defaults = SLOT_DEFAULTS[slot];
        const position = resolveSlotPosition(slot, draftLayout, layout);
        const item = placed?.[slot] ?? null;
        if (item) {
          return (
            <DraggableFurniture
              key={slot}
              item={item}
              position={position}
              width={defaults.width}
              zIndex={defaults.zIndex}
              editMode={editMode}
              selected={selected === slot}
              onSelect={() => onSelect?.(slot)}
              onMove={moveSlot(slot)}
              canvasW={canvasSize.w}
              canvasH={canvasSize.h}
            />
          );
        }
        if (showPlaceholders) {
          return (
            <EmptySlot
              key={slot}
              slot={slot}
              position={position}
              width={defaults.width}
              zIndex={defaults.zIndex}
            />
          );
        }
        return null;
      })}

      {showWorm && (
        <DraggableWorm
          worm={worm}
          position={wormPos}
          editMode={editMode}
          selected={selected === "worm"}
          onSelect={() => onSelect?.("worm")}
          onMove={moveWorm}
          canvasW={canvasSize.w}
          canvasH={canvasSize.h}
        />
      )}

      {editMode && selected && selected !== "worm" && selectedSlotPos && (
        <FloatingToolbar
          canvasW={canvasSize.w}
          canvasH={canvasSize.h}
          anchorX={selectedSlotPos.x + selectedSlotWidth / 2}
          anchorY={selectedSlotPos.y}
          showRotate
          showFlip
          flipX={selectedSlotPos.flipX}
          onRotateLeft={() =>
            updateSlot(selected, {
              rotate: normalizeAngle(selectedSlotPos.rotate - 5),
            })
          }
          onRotateRight={() =>
            updateSlot(selected, {
              rotate: normalizeAngle(selectedSlotPos.rotate + 5),
            })
          }
          onFlip={() =>
            updateSlot(selected, { flipX: !selectedSlotPos.flipX })
          }
          onClose={() => onSelect?.(null)}
        />
      )}

      {editMode && selected === "worm" && (
        <FloatingToolbar
          canvasW={canvasSize.w}
          canvasH={canvasSize.h}
          anchorX={wormPos.x + WORM_WIDTH / 2}
          anchorY={wormPos.y}
          showRotate={false}
          showFlip={false}
          flipX={false}
          onRotateLeft={() => {}}
          onRotateRight={() => {}}
          onFlip={() => {}}
          onClose={() => onSelect?.(null)}
        />
      )}
    </>
  );

  return (
    <View
      onLayout={onCanvasLayout}
      className="relative w-full overflow-hidden rounded-3xl border border-village-border"
      style={{ aspectRatio: 5 / 4, backgroundColor: "#F5C7BC" }}
    >
      {canvasInner}
    </View>
  );
}

function normalizeAngle(deg: number) {
  let v = deg % 360;
  if (v > 180) v -= 360;
  if (v < -180) v += 360;
  return v;
}

export {
  SLOT_DEFAULTS,
  SLOT_ORDER,
  WORM_DEFAULT,
  WORM_WIDTH,
  WORM_Z_INDEX,
  resolveSlotPosition,
  resolveWormPosition,
  normalizeAngle,
};
