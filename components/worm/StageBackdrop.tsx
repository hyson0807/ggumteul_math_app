import { useMemo } from "react";
import { View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, {
  Circle,
  Ellipse,
  G,
  Line,
  Path,
  Polygon,
  Rect,
} from "react-native-svg";
import type { StageDecorKind, StageSceneConfig } from "@/constants/stages";

interface Props {
  config: StageSceneConfig;
  width: number;
  height: number;
}

export function StageBackdrop({ config, width, height }: Props) {
  return (
    <View style={{ position: "absolute", top: 0, left: 0, width, height }}>
      <LinearGradient
        colors={config.gradient}
        locations={config.locations}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ position: "absolute", top: 0, left: 0, width, height }}
      />
      <Svg
        width={width}
        height={height}
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        <StageDecor kind={config.decor} width={width} height={height} />
      </Svg>
    </View>
  );
}

interface DecorProps {
  kind: StageDecorKind;
  width: number;
  height: number;
}

function StageDecor({ kind, width, height }: DecorProps) {
  switch (kind) {
    case "deep-bottom":
      return <DeepBottomDecor width={width} height={height} />;
    case "deep-top":
      return <DeepTopDecor width={width} height={height} />;
    case "shallow-bottom":
      return <ShallowBottomDecor width={width} height={height} />;
    case "shallow-top":
      return <ShallowTopDecor width={width} height={height} />;
    case "sky":
      return <SkyDecor width={width} height={height} />;
    case "space":
      return <SpaceDecor width={width} height={height} />;
  }
}

function DeepBottomDecor({ width, height }: { width: number; height: number }) {
  const crystals = [
    { x: 0.12, y: 0.78, c: "#9AD0F0" },
    { x: 0.28, y: 0.88, c: "#C8A0F0" },
    { x: 0.55, y: 0.82, c: "#F29ACB" },
    { x: 0.78, y: 0.9, c: "#8AE0B0" },
    { x: 0.88, y: 0.72, c: "#FFD166" },
  ];
  return (
    <G>
      <Rect x={0} y={height * 0.92} width={width} height={height * 0.08} fill="#0A0604" />
      <G stroke="#6B3A1A" strokeWidth={1.2} fill="none" opacity={0.5}>
        <Path d={`M0 ${height * 0.25} L${width * 0.45} ${height * 0.28} L${width * 0.95} ${height * 0.22}`} />
        <Path d={`M${width * 0.1} ${height * 0.55} L${width * 0.5} ${height * 0.58} L${width * 0.9} ${height * 0.52}`} />
      </G>
      <Path
        d={`M0 ${height * 0.7} Q${width * 0.35} ${height * 0.74} ${width * 0.6} ${height * 0.66} T${width} ${height * 0.72}`}
        stroke="#E87A3A"
        strokeWidth={2}
        fill="none"
        opacity={0.7}
      />
      {crystals.map((k, i) => (
        <G key={i} transform={`translate(${k.x * width}, ${k.y * height})`}>
          <Polygon points="0,-18 -9,0 0,12 9,0" fill={k.c} />
          <Polygon points="-12,0 -17,8 -10,12 -8,4" fill={k.c} opacity={0.9} />
          <Polygon points="10,2 14,10 8,14 6,8" fill={k.c} opacity={0.8} />
        </G>
      ))}
      <G
        transform={`translate(${width * 0.82}, ${height * 0.42})`}
        stroke="#D8C6A8"
        strokeWidth={1.2}
        fill="none"
        opacity={0.6}
      >
        <Path d="M-12 0 Q-6 -10 0 -7 Q10 -5 12 5 Q7 12 -2 10 Q-12 8 -12 0 Z" />
      </G>
      <Path
        d={`M0 0 L${width} 0 L${width} ${height * 0.08} Q${width * 0.5} ${height * 0.05} 0 ${height * 0.1} Z`}
        fill="#00000040"
      />
    </G>
  );
}

function DeepTopDecor({ width, height }: { width: number; height: number }) {
  const roots = [
    { x: 0.18, depth: 0.35 },
    { x: 0.4, depth: 0.5 },
    { x: 0.68, depth: 0.42 },
    { x: 0.88, depth: 0.3 },
  ];
  const crystals = [
    { x: 0.15, y: 0.62, c: "#9AD0F0" },
    { x: 0.72, y: 0.7, c: "#C8A0F0" },
    { x: 0.4, y: 0.82, c: "#F29ACB" },
  ];
  return (
    <G>
      <Rect x={0} y={0} width={width} height={height * 0.1} fill="#5A3822" opacity={0.75} />
      <Rect x={0} y={height * 0.1} width={width} height={4} fill="#3A2010" opacity={0.6} />
      <G stroke="#3A2010" strokeWidth={1.6} fill="none" strokeLinecap="round">
        {roots.map((r, i) => (
          <Path
            key={i}
            d={`M${r.x * width} ${height * 0.1} Q${r.x * width + 6} ${height * (0.1 + r.depth * 0.4)} ${r.x * width - 4} ${height * (0.1 + r.depth)}`}
          />
        ))}
      </G>
      <Path
        d={`M0 ${height * 0.45} Q${width * 0.35} ${height * 0.48} ${width * 0.6} ${height * 0.42} T${width} ${height * 0.46}`}
        stroke="#E87A3A"
        strokeWidth={2}
        fill="none"
        opacity={0.6}
      />
      {crystals.map((k, i) => (
        <G key={i} transform={`translate(${k.x * width}, ${k.y * height})`}>
          <Polygon points="0,-14 -7,0 0,10 7,0" fill={k.c} opacity={0.9} />
          <Polygon points="-10,0 -14,6 -8,10 -6,4" fill={k.c} opacity={0.8} />
        </G>
      ))}
    </G>
  );
}

function ShallowBottomDecor({
  width,
  height,
}: {
  width: number;
  height: number;
}) {
  const pebbles = [
    { x: 0.12, y: 0.74 },
    { x: 0.3, y: 0.86 },
    { x: 0.52, y: 0.78 },
    { x: 0.74, y: 0.88 },
    { x: 0.88, y: 0.72 },
  ];
  const burrows = [
    { x: 0.2, y: 0.55 },
    { x: 0.62, y: 0.66 },
  ];
  return (
    <G>
      <G stroke="#4A2A18" strokeWidth={2.4} fill="none" strokeLinecap="round" opacity={0.6}>
        <Path d={`M${width * 0.15} 0 Q${width * 0.17} ${height * 0.18} ${width * 0.13} ${height * 0.38}`} />
        <Path d={`M${width * 0.5} 0 Q${width * 0.55} ${height * 0.15} ${width * 0.53} ${height * 0.32}`} />
        <Path d={`M${width * 0.82} 0 Q${width * 0.85} ${height * 0.2} ${width * 0.8} ${height * 0.42}`} />
      </G>
      {burrows.map((b, i) => (
        <G key={i} transform={`translate(${b.x * width}, ${b.y * height})`}>
          <Ellipse rx={width * 0.08} ry={height * 0.04} fill="#2A1408" />
          <Ellipse rx={width * 0.06} ry={height * 0.025} fill="#1A0A04" />
        </G>
      ))}
      {pebbles.map((p, i) => (
        <G key={i} transform={`translate(${p.x * width}, ${p.y * height})`}>
          <Ellipse rx={12} ry={7} fill="#8A6244" />
          <Ellipse cx={-3} cy={-1.5} rx={4} ry={2} fill="#B08866" opacity={0.7} />
        </G>
      ))}
      {[0.2, 0.45, 0.68].map((p, i) => (
        <Path
          key={i}
          d={`M0 ${p * height} Q${width / 2} ${p * height + 5} ${width} ${p * height}`}
          stroke="#5A3822"
          strokeWidth={1}
          fill="none"
          opacity={0.4}
        />
      ))}
    </G>
  );
}

function ShallowTopDecor({ width, height }: { width: number; height: number }) {
  const grass = Array.from({ length: 18 }, (_, i) => {
    const x = (i / 18) * width + 8;
    return (
      <G key={i}>
        <Path
          d={`M${x} ${height * 0.08} Q${x - 1} ${height * 0.04} ${x - 3} 0`}
          stroke="#5A8A22"
          strokeWidth={1.4}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d={`M${x + 3} ${height * 0.08} Q${x + 4} ${height * 0.04} ${x + 6} 0`}
          stroke="#7FB83D"
          strokeWidth={1.4}
          fill="none"
          strokeLinecap="round"
        />
      </G>
    );
  });
  const pebbles = [
    { x: 0.18, y: 0.76 },
    { x: 0.46, y: 0.84 },
    { x: 0.72, y: 0.78 },
    { x: 0.88, y: 0.88 },
  ];
  return (
    <G>
      <Rect x={0} y={0} width={width} height={height * 0.08} fill="#7FB83D" />
      <Rect x={0} y={height * 0.08} width={width} height={4} fill="#5A8A22" opacity={0.7} />
      {grass}
      <G stroke="#4A2A18" strokeWidth={2} fill="none" strokeLinecap="round" opacity={0.5}>
        <Path d={`M${width * 0.2} ${height * 0.1} Q${width * 0.22} ${height * 0.3} ${width * 0.18} ${height * 0.48}`} />
        <Path d={`M${width * 0.55} ${height * 0.1} Q${width * 0.58} ${height * 0.28} ${width * 0.56} ${height * 0.44}`} />
        <Path d={`M${width * 0.82} ${height * 0.1} Q${width * 0.84} ${height * 0.3} ${width * 0.8} ${height * 0.5}`} />
      </G>
      {pebbles.map((p, i) => (
        <G key={i} transform={`translate(${p.x * width}, ${p.y * height})`}>
          <Ellipse rx={9} ry={5} fill="#8A6244" />
          <Ellipse cx={-2} cy={-1} rx={3} ry={1.5} fill="#B08866" opacity={0.7} />
        </G>
      ))}
    </G>
  );
}

function SkyDecor({ width, height }: { width: number; height: number }) {
  const clouds = [
    { x: 0.2, y: 0.28, s: 1.1 },
    { x: 0.72, y: 0.22, s: 1 },
    { x: 0.5, y: 0.48, s: 0.9 },
    { x: 0.82, y: 0.6, s: 1.05 },
    { x: 0.15, y: 0.7, s: 0.85 },
  ];
  const birds = [
    { x: 0.38, y: 0.38 },
    { x: 0.48, y: 0.42 },
    { x: 0.66, y: 0.56 },
  ];
  return (
    <G>
      <G transform={`translate(${width * 0.78}, ${height * 0.16})`}>
        <Circle r={44} fill="#FFE6C2" opacity={0.5} />
        <Circle r={26} fill="#FFD58A" />
        <Circle r={18} fill="#FFE6A8" />
      </G>
      {clouds.map((c, i) => (
        <G key={i} transform={`translate(${c.x * width}, ${c.y * height}) scale(${c.s})`}>
          <Ellipse rx={32} ry={11} fill="#fff" opacity={0.95} />
          <Ellipse cx={-15} cy={-5} rx={15} ry={11} fill="#fff" opacity={0.95} />
          <Ellipse cx={13} cy={-4} rx={17} ry={12} fill="#fff" opacity={0.95} />
          <Ellipse cx={-4} cy={-9} rx={11} ry={9} fill="#fff" opacity={0.95} />
        </G>
      ))}
      {birds.map((b, i) => (
        <G key={i} transform={`translate(${b.x * width}, ${b.y * height})`}>
          <Path
            d="M-7 0 Q-3.5 -3.5 0 0 Q3.5 -3.5 7 0"
            stroke="#5D4037"
            strokeWidth={1.4}
            fill="none"
            strokeLinecap="round"
          />
        </G>
      ))}
      <Rect x={0} y={height * 0.94} width={width} height={height * 0.06} fill="#7FB83D" opacity={0.55} />
      <Rect x={0} y={height * 0.92} width={width} height={4} fill="#5A8A22" opacity={0.6} />
    </G>
  );
}

function SpaceDecor({ width, height }: { width: number; height: number }) {
  const stars = useMemo(() => {
    const arr: { x: number; y: number; s: number }[] = [];
    let rng = 1;
    for (let i = 0; i < 60; i++) {
      rng = (rng * 9301 + 49297) % 233280;
      const r = rng / 233280;
      rng = (rng * 9301 + 49297) % 233280;
      const r2 = rng / 233280;
      arr.push({ x: r * width, y: r2 * height, s: 0.6 + r * r2 * 2 });
    }
    return arr;
  }, [width, height]);
  return (
    <G>
      <Ellipse
        cx={width * 0.3}
        cy={height * 0.35}
        rx={width * 0.55}
        ry={height * 0.3}
        fill="#3A2B5E"
        opacity={0.35}
      />
      <Ellipse
        cx={width * 0.78}
        cy={height * 0.72}
        rx={width * 0.45}
        ry={height * 0.25}
        fill="#5E3A7E"
        opacity={0.22}
      />
      {stars.map((s, i) => (
        <G key={i} opacity={0.3 + (s.s - 0.6) / 2.4}>
          <Circle cx={s.x} cy={s.y} r={s.s} fill="#fff" />
          {s.s > 1.6 && (
            <>
              <Line
                x1={s.x - s.s * 2.4}
                y1={s.y}
                x2={s.x + s.s * 2.4}
                y2={s.y}
                stroke="#fff"
                strokeWidth={0.5}
              />
              <Line
                x1={s.x}
                y1={s.y - s.s * 2.4}
                x2={s.x}
                y2={s.y + s.s * 2.4}
                stroke="#fff"
                strokeWidth={0.5}
              />
            </>
          )}
        </G>
      ))}
      <G transform={`translate(${width * 0.22}, ${height * 0.78})`}>
        <Circle r={36} fill="#E8B084" />
        <Ellipse cy={-5} rx={18} ry={5} fill="#F2C8A0" opacity={0.6} />
        <Ellipse
          rx={54}
          ry={10}
          fill="none"
          stroke="#C89070"
          strokeWidth={2}
          transform="rotate(-18)"
        />
      </G>
      <G transform={`translate(${width * 0.82}, ${height * 0.24})`}>
        <Circle r={22} fill="#FFF4D6" />
        <Circle cx={8} r={20} fill="#0B0E2A" />
      </G>
    </G>
  );
}
