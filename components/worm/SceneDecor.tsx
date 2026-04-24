import {
  Circle,
  Ellipse,
  G,
  Line,
  Path,
  Polygon,
  Rect,
} from "react-native-svg";

interface DecorProps {
  width: number;
  height: number;
  x0: number;
}

export function DeepDecor({ width, height, x0 }: DecorProps) {
  return (
    <G>
      <G stroke="#6B3A1A" strokeWidth={1.2} fill="none" opacity={0.5}>
        <Path
          d={`M${x0} ${height * 0.3} L${x0 + width * 0.3} ${height * 0.32} L${x0 + width * 0.5} ${height * 0.28}`}
        />
        <Path
          d={`M${x0 + width * 0.1} ${height * 0.85} L${x0 + width * 0.4} ${height * 0.88} L${x0 + width * 0.7} ${height * 0.84}`}
        />
      </G>
      <Path
        d={`M${x0} ${height * 0.55} Q${x0 + width * 0.3} ${height * 0.58} ${x0 + width * 0.55} ${height * 0.5} T${x0 + width} ${height * 0.56}`}
        stroke="#E87A3A"
        strokeWidth={2}
        fill="none"
        opacity={0.7}
      />
      <Path
        d={`M${x0} ${height * 0.55} Q${x0 + width * 0.3} ${height * 0.58} ${x0 + width * 0.55} ${height * 0.5} T${x0 + width} ${height * 0.56}`}
        stroke="#FFD166"
        strokeWidth={0.8}
        fill="none"
        opacity={0.6}
      />
      {[
        { x: 0.12, y: 0.25, c: "#9AD0F0" },
        { x: 0.55, y: 0.75, c: "#F29ACB" },
        { x: 0.85, y: 0.85, c: "#C8A0F0" },
        { x: 0.35, y: 0.92, c: "#8AE0B0" },
      ].map((k, i) => (
        <G key={i} transform={`translate(${x0 + k.x * width}, ${k.y * height})`}>
          <Polygon points="0,-14 -7,0 0,10 7,0" fill={k.c} />
          <Polygon points="-10,0 -14,6 -8,10 -6,4" fill={k.c} opacity={0.9} />
          <Polygon points="8,2 12,8 6,12 4,6" fill={k.c} opacity={0.8} />
        </G>
      ))}
      <G
        transform={`translate(${x0 + width * 0.75}, ${height * 0.35})`}
        stroke="#D8C6A8"
        strokeWidth={1.2}
        fill="none"
        opacity={0.7}
      >
        <Path d="M-10 0 Q-6 -8 0 -6 Q8 -4 10 4 Q6 10 -2 8 Q-10 6 -10 0 Z" />
        <Path d="M-6 -2 Q-2 -6 4 -4" />
      </G>
      <Path
        d={`M${x0} 0 L${x0 + width} 0 L${x0 + width} ${height * 0.15} Q${x0 + width * 0.5} ${height * 0.1} ${x0} ${height * 0.18} Z`}
        fill="#1A0F08"
        opacity={0.6}
      />
    </G>
  );
}

export function ShallowDecor({ width, height, x0 }: DecorProps) {
  return (
    <G>
      <G stroke="#4A2A18" strokeWidth={2.4} fill="none" strokeLinecap="round">
        <Path
          d={`M${x0 + width * 0.15} 0 Q${x0 + width * 0.17} ${height * 0.18} ${x0 + width * 0.13} ${height * 0.35}`}
        />
        <Path
          d={`M${x0 + width * 0.45} 0 Q${x0 + width * 0.5} ${height * 0.15} ${x0 + width * 0.48} ${height * 0.3}`}
        />
        <Path
          d={`M${x0 + width * 0.78} 0 Q${x0 + width * 0.82} ${height * 0.2} ${x0 + width * 0.78} ${height * 0.4}`}
        />
      </G>
      {[
        { x: 0.1, y: 0.6 },
        { x: 0.32, y: 0.82 },
        { x: 0.58, y: 0.7 },
        { x: 0.82, y: 0.85 },
      ].map((p, i) => (
        <G
          key={i}
          transform={`translate(${x0 + p.x * width}, ${p.y * height})`}
        >
          <Ellipse rx={9} ry={6} fill="#8A6244" />
          <Ellipse cx={-2} cy={-1} rx={3} ry={1.5} fill="#B08866" opacity={0.7} />
        </G>
      ))}
      <G transform={`translate(${x0 + width * 0.42}, ${height * 0.72})`}>
        <Ellipse rx={20} ry={11} fill="#2A1408" />
        <Ellipse rx={15} ry={6} fill="#1A0A04" />
      </G>
      {[0.2, 0.45, 0.68].map((p, i) => (
        <Path
          key={i}
          d={`M${x0} ${p * height} Q${x0 + width / 2} ${p * height + 4} ${x0 + width} ${p * height}`}
          stroke="#5A3822"
          strokeWidth={1}
          fill="none"
          opacity={0.4}
        />
      ))}
    </G>
  );
}

export function GroundDecor({ width, height, x0 }: DecorProps) {
  const blades = Array.from({ length: 14 }, (_, i) => {
    const x = x0 + (i / 14) * width + 2;
    return (
      <G key={i}>
        <Path
          d={`M${x} ${height * 0.5} Q${x - 1} ${height * 0.42} ${x - 3} ${height * 0.36}`}
          stroke="#5A8A22"
          strokeWidth={1.4}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d={`M${x + 2} ${height * 0.5} Q${x + 3} ${height * 0.43} ${x + 5} ${height * 0.38}`}
          stroke="#7FB83D"
          strokeWidth={1.4}
          fill="none"
          strokeLinecap="round"
        />
      </G>
    );
  });
  return (
    <G>
      <Rect x={x0} y={height * 0.5} width={width} height={height * 0.5} fill="#C49072" />
      <Rect x={x0} y={height * 0.48} width={width} height={4} fill="#A87050" opacity={0.5} />
      {blades}
      <G transform={`translate(${x0 + width * 0.5}, ${height * 0.44})`}>
        <Circle r={3} fill="#FFEAA0" />
        <Circle r={1.2} fill="#E09A5A" />
      </G>
    </G>
  );
}

export function SkyDecor({ width, height, x0 }: DecorProps) {
  const clouds = [
    { x: 0.5, y: 0.25, s: 1 },
    { x: 0.75, y: 0.4, s: 0.85 },
    { x: 0.15, y: 0.55, s: 1.1 },
    { x: 0.6, y: 0.65, s: 0.9 },
    { x: 0.9, y: 0.7, s: 1 },
  ];
  const birds = [
    { x: 0.35, y: 0.3 },
    { x: 0.45, y: 0.35 },
    { x: 0.68, y: 0.48 },
  ];
  return (
    <G>
      <G transform={`translate(${x0 + width * 0.2}, ${height * 0.22})`}>
        <Circle r={38} fill="#FFE6C2" opacity={0.55} />
        <Circle r={22} fill="#FFD58A" />
        <Circle r={16} fill="#FFE6A8" />
      </G>
      {clouds.map((c, i) => (
        <G
          key={i}
          transform={`translate(${x0 + c.x * width}, ${c.y * height}) scale(${c.s})`}
        >
          <Ellipse cx={0} cy={0} rx={30} ry={10} fill="#fff" opacity={0.95} />
          <Ellipse cx={-14} cy={-4} rx={14} ry={10} fill="#fff" opacity={0.95} />
          <Ellipse cx={12} cy={-3} rx={16} ry={11} fill="#fff" opacity={0.95} />
          <Ellipse cx={-4} cy={-8} rx={10} ry={8} fill="#fff" opacity={0.95} />
        </G>
      ))}
      {birds.map((b, i) => (
        <G
          key={i}
          transform={`translate(${x0 + b.x * width}, ${b.y * height})`}
        >
          <Path
            d="M-6 0 Q-3 -3 0 0 Q3 -3 6 0"
            stroke="#5D4037"
            strokeWidth={1.4}
            fill="none"
            strokeLinecap="round"
          />
        </G>
      ))}
      <Rect
        x={x0}
        y={height * 0.95}
        width={width}
        height={height * 0.05}
        fill="#C49072"
        opacity={0.3}
      />
    </G>
  );
}

export function SpaceDecor({ width, height, x0 }: DecorProps) {
  const stars: { x: number; y: number; s: number }[] = [];
  let rng = 1;
  for (let i = 0; i < 36; i++) {
    rng = (rng * 9301 + 49297) % 233280;
    const r = rng / 233280;
    rng = (rng * 9301 + 49297) % 233280;
    const r2 = rng / 233280;
    stars.push({ x: x0 + r * width, y: r2 * height, s: 0.6 + r * r2 * 1.8 });
  }
  return (
    <G>
      <Ellipse
        cx={x0 + width * 0.5}
        cy={height * 0.45}
        rx={width * 0.5}
        ry={height * 0.3}
        fill="#3A2B5E"
        opacity={0.35}
      />
      <Ellipse
        cx={x0 + width * 0.7}
        cy={height * 0.2}
        rx={width * 0.4}
        ry={height * 0.2}
        fill="#5E3A7E"
        opacity={0.22}
      />
      {stars.map((s, i) => (
        <G key={i} opacity={0.3 + (s.s - 0.6) / 2.4}>
          <Circle cx={s.x} cy={s.y} r={s.s} fill="#fff" />
          {s.s > 1.4 && (
            <>
              <Line
                x1={s.x - s.s * 2}
                y1={s.y}
                x2={s.x + s.s * 2}
                y2={s.y}
                stroke="#fff"
                strokeWidth={0.4}
              />
              <Line
                x1={s.x}
                y1={s.y - s.s * 2}
                x2={s.x}
                y2={s.y + s.s * 2}
                stroke="#fff"
                strokeWidth={0.4}
              />
            </>
          )}
        </G>
      ))}
      <G transform={`translate(${x0 + width * 0.4}, ${height * 0.7})`}>
        <Circle r={28} fill="#E8B084" />
        <Ellipse cy={-4} rx={14} ry={4} fill="#F2C8A0" opacity={0.6} />
        <Ellipse
          rx={42}
          ry={8}
          fill="none"
          stroke="#C89070"
          strokeWidth={2}
          transform="rotate(-18)"
        />
      </G>
      <G transform={`translate(${x0 + width * 0.82}, ${height * 0.3})`}>
        <Circle r={20} fill="#FFF4D6" />
        <Circle cx={7} r={18} fill="#0B0E2A" />
      </G>
    </G>
  );
}
