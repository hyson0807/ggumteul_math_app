import { useMemo } from "react";
import { View, Text } from "react-native";
import { Image } from "expo-image";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { API_BASE_URL } from "@/services/api";
import { Colors } from "@/constants/colors";
import { WormSprite } from "@/components/worm/WormSprite";
import type { RoomState, RoomSlot } from "@/types/room";
import type { ShopItem } from "@/types/shop";
import type { WormState } from "@/types/worm";

interface Props {
  room: RoomState["equipped"] | undefined;
  worm?: WormState["equipped"];
  showWorm?: boolean;
  showPlaceholders?: boolean;
}

type SlotLayout = {
  left: `${number}%`;
  top: `${number}%`;
  width: `${number}%`;
  zIndex: number;
  flipX?: boolean; // 가구 PNG 가 우리 방 원근과 반대 방향일 때 좌우 반전
  rotate?: number; // 시계방향 회전 각도 (단위: degree). 음수면 반시계.
};

/* --------------------------------------------------------------------------
 * 빈 방 배경: `assets/images/room-empty-card.png` (1402×1122, 5:4)
 *  - 좌측: 측벽 (이미지 좌측 ~30%)
 *  - 우/뒤: 뒷벽 + 창문 (이미지 우측 ~70%)
 *  - 하단 ~37%: 나무 바닥 (앞이 넓고 좌측이 좁아지는 1점 원근)
 *  - 벽-바닥 경계 (baseboard): 좌상 ~70% → 우측 ~63% 로 살짝 우상향
 *
 * 가구 슬롯 좌표는 이 배경 그림에 맞춰 절대 위치 (%).
 *  - 뒷벽에 붙는 아이템: 시계 (창문 좌측 빈 공간)
 *  - 바닥에 놓이는 아이템: 책장/조명/책상/의자/침대/러그
 * -------------------------------------------------------------------------- */
// wallpaper 는 배경 교체 슬롯이라 절대좌표 가구 슬롯에서 제외
type PlacedSlot = Exclude<RoomSlot, "wallpaper">;

const SLOT_LAYOUT: Record<PlacedSlot, SlotLayout> = {
  // 벽
  clock: { left: "32%", top: "8%", width: "18%", zIndex: 3 },
  // 가구 (바닥)
  shelf: { left: "25%", top: "30%", width: "32%", zIndex: 4, rotate:-2 },
  light: { left: "45%", top: "35%", width: "32%", zIndex: 5, flipX: true, rotate:5 },
  // 책상 PNG 안에 의자가 포함되어 있어서 의자 슬롯은 없음
  desk: { left: "-5%", top: "40%", width: "45%", zIndex: 5, flipX: true, rotate:3 },
  // 침대: PNG 는 머리판이 좌측인데, 우리 방의 뒷벽은 우상단이라 머리판이 우측을 향해야 함 → flipX
  bed: { left: "56%", top: "40%", width: "49%", zIndex: 4, flipX: true, rotate:6 },
  rug: { left: "12%", top: "50%", width: "70%", zIndex: 1, rotate:6 },
};

const SLOT_ORDER: PlacedSlot[] = [
  "clock",
  "shelf",
  "light",
  "desk",
  "bed",
  "rug",
];

function FurnitureImage({
  item,
  layout,
}: {
  item: ShopItem;
  layout: SlotLayout;
}) {
  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: layout.left,
        top: layout.top,
        width: layout.width,
        aspectRatio: 1,
        zIndex: layout.zIndex,
      }}
    >
      <Image
        source={{ uri: `${API_BASE_URL}${item.imageUrl}` }}
        style={{
          width: "100%",
          height: "100%",
          transform: buildTransform(layout),
        }}
        contentFit="contain"
        cachePolicy="memory-disk"
        transition={150}
      />
    </View>
  );
}

function buildTransform(layout: SlotLayout) {
  const t: ({ scaleX: number } | { rotate: string })[] = [];
  if (layout.flipX) t.push({ scaleX: -1 });
  if (layout.rotate) t.push({ rotate: `${layout.rotate}deg` });
  return t.length ? t : undefined;
}

function EmptySlot({
  slot,
  layout,
}: {
  slot: PlacedSlot;
  layout: SlotLayout;
}) {
  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: layout.left,
        top: layout.top,
        width: layout.width,
        aspectRatio: 1,
        zIndex: layout.zIndex,
      }}
      className="items-center justify-center"
    >
      <View className="opacity-30 bg-white rounded-2xl border-2 border-dashed border-village-border w-full h-full items-center justify-center">
        <MaterialCommunityIcons
          name="plus"
          size={20}
          color={Colors.inactive}
        />
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
  showWorm = true,
  showPlaceholders = false,
}: Props) {
  const placed = useMemo(() => room ?? null, [room]);

  // 장착된 벽지가 있으면 그 PNG 를 배경으로, 없으면 기본 빈 방
  const wallpaper = placed?.wallpaper ?? null;
  const backgroundSource = wallpaper
    ? { uri: `${API_BASE_URL}${wallpaper.imageUrl}` }
    : require("@/assets/images/room-empty-card.png");

  return (
    <View
      className="relative w-full overflow-hidden rounded-3xl border border-village-border"
      style={{ aspectRatio: 5 / 4, backgroundColor: "#F5C7BC" }}
    >
      {/* 방 배경 — 벽지 장착 시 교체됨 */}
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

      {/* 가구 슬롯 */}
      {SLOT_ORDER.map((slot) => {
        const layout = SLOT_LAYOUT[slot];
        const item = placed?.[slot] ?? null;
        if (item) {
          return <FurnitureImage key={slot} item={item} layout={layout} />;
        }
        if (showPlaceholders) {
          return <EmptySlot key={slot} slot={slot} layout={layout} />;
        }
        return null;
      })}

      {/* 지렁이 — 러그 중앙 위 */}
      {showWorm && (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: "34%",
            top: "70%",
            width: "32%",
            alignItems: "center",
            zIndex: 8,
          }}
        >
          <WormSprite equipped={worm} size={0.85} />
        </View>
      )}
    </View>
  );
}
