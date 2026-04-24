const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const OUT_DIR = path.join(process.cwd(), "appstore_mockups");
fs.mkdirSync(OUT_DIR, { recursive: true });

const colors = {
  primary: "#A0522D",
  primaryLight: "#C8956C",
  secondary: "#DAA520",
  secondaryLight: "#E8C860",
  background: "#FFE2DE",
  surface: "#FFF8F0",
  surfaceBorder: "#F0D5C8",
  text: "#5D4037",
  textSecondary: "#8D6E63",
  success: "#6B8E23",
  error: "#CD5C5C",
  coin: "#DAA520",
  cta: "#C0392B",
  deep: "#2A1810",
  shallow: "#6B4226",
  grass: "#7FB83D",
  sky: "#8FC9F9",
  space: "#0B0E2A",
};

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrapText(text, maxChars) {
  const words = text.split(" ");
  const lines = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function textBlock(text, x, y, size, weight, fill, opts = {}) {
  const lines = Array.isArray(text) ? text : wrapText(text, opts.maxChars ?? 16);
  const lh = opts.lineHeight ?? size * 1.22;
  const anchor = opts.anchor ?? "start";
  return `<text x="${x}" y="${y}" font-family="Apple SD Gothic Neo, Arial, sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}">${lines
    .map((line, i) => `<tspan x="${x}" dy="${i === 0 ? 0 : lh}">${esc(line)}</tspan>`)
    .join("")}</text>`;
}

function pill(x, y, w, h, fill, stroke = "none") {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="${fill}" stroke="${stroke}" stroke-width="${stroke === "none" ? 0 : 3}"/>`;
}

function worm(x, y, scale = 1, hat = "acorn", glasses = false) {
  const s = scale;
  const body = "#E89B7A";
  const shade = "#C87A5A";
  const circles = [28, 44, 60, 76, 90]
    .map(
      (cx) => `<g><circle cx="${cx}" cy="50" r="14" fill="${body}"/><circle cx="${cx - 4}" cy="48" r="10" fill="${shade}" opacity=".35"/></g>`,
    )
    .join("");
  let hatSvg = "";
  if (hat === "crown") {
    hatSvg = `<path d="M86 31 L86 21 L92 27 L99 17 L106 27 L112 21 L112 31 Z" fill="#E8C860" stroke="#B8942A" stroke-width="1.4"/><circle cx="99" cy="21" r="2" fill="${colors.cta}"/>`;
  } else if (hat === "beanie") {
    hatSvg = `<path d="M86 32 Q86 20 98 20 Q110 20 110 32 Z" fill="#6B8E23"/><rect x="85" y="30" width="27" height="5" rx="2.5" fill="#4D6818"/><circle cx="98" cy="17" r="3" fill="#C8D088"/>`;
  } else if (hat === "acorn") {
    hatSvg = `<ellipse cx="99" cy="32" rx="10" ry="8" fill="#C88454"/><path d="M89 28 Q99 18 109 28 Q105 32 99 32 Q93 32 89 28 Z" fill="#6B4226"/><circle cx="99" cy="20" r="1.8" fill="#3A2410"/>`;
  }
  const glassesSvg = glasses
    ? `<g fill="rgba(255,255,255,.35)" stroke="#2A1810" stroke-width="1.8"><circle cx="88" cy="53" r="5"/><circle cx="106" cy="53" r="5"/><path d="M93 53 L101 53"/></g>`
    : "";
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <ellipse cx="60" cy="72" rx="40" ry="4" fill="rgba(0,0,0,.18)"/>
    ${circles}
    <circle cx="94" cy="46" r="13.5" fill="${body}"/>
    <circle cx="88" cy="44" r="4" fill="#FFE6D3" opacity=".8"/>
    <circle cx="100" cy="54" r="3" fill="#F19C8A" opacity=".55"/>
    <circle cx="98" cy="46" r="2.4" fill="#2A1810"/>
    <circle cx="98.8" cy="45.4" r=".8" fill="#fff"/>
    <path d="M96 52 Q99 54 102 52" stroke="#6B3A2A" stroke-width="1.4" fill="none" stroke-linecap="round"/>
    ${hatSvg}${glassesSvg}
  </g>`;
}

function coin(x, y, r = 18) {
  return `<g><circle cx="${x}" cy="${y}" r="${r}" fill="${colors.coin}" stroke="#B8860B" stroke-width="${r * 0.13}"/><text x="${x}" y="${y + r * 0.36}" font-family="Arial" font-size="${r * 1.1}" font-weight="900" fill="#FFF5C2" text-anchor="middle">₩</text></g>`;
}

function phoneShell(W, H, inner, opts = {}) {
  const margin = Math.round(W * (W > 1600 ? 0.14 : 0.09));
  const top = Math.round(H * (W > 1600 ? 0.19 : 0.22));
  const fw = W - margin * 2;
  const fh = Math.round(H * (W > 1600 ? 0.62 : 0.58));
  const r = W > 1600 ? 68 : 56;
  const screenPad = W > 1600 ? 34 : 24;
  return `<g transform="translate(${margin} ${top})">
    <rect width="${fw}" height="${fh}" rx="${r}" fill="#2A1810" opacity=".18"/>
    <rect x="0" y="-12" width="${fw}" height="${fh}" rx="${r}" fill="#fff" stroke="#F4D9CC" stroke-width="6"/>
    <clipPath id="${opts.clipId}"><rect x="${screenPad}" y="${screenPad - 12}" width="${fw - screenPad * 2}" height="${fh - screenPad * 2}" rx="${r - 22}"/></clipPath>
    <g clip-path="url(#${opts.clipId})" transform="translate(${screenPad} ${screenPad - 12})">
      ${inner(fw - screenPad * 2, fh - screenPad * 2)}
    </g>
  </g>`;
}

function base(W, H, idx, title, subtitle, inner) {
  const isPad = W > 1600;
  const titleSize = isPad ? 108 : 72;
  const subSize = isPad ? 42 : 30;
  const top = isPad ? 180 : 170;
  const maxChars = isPad ? 15 : 11;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <defs>
      <linearGradient id="bg${idx}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FFF4E6"/>
        <stop offset="55%" stop-color="#FFE2DE"/>
        <stop offset="100%" stop-color="#F7C9B8"/>
      </linearGradient>
      <pattern id="paper${idx}" width="38" height="38" patternUnits="userSpaceOnUse">
        <circle cx="6" cy="9" r="1.4" fill="#C8956C" opacity=".18"/>
        <circle cx="29" cy="24" r="1.2" fill="#C8956C" opacity=".16"/>
      </pattern>
      <filter id="shadow${idx}" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="18" stdDeviation="16" flood-color="#8D5F48" flood-opacity=".20"/>
      </filter>
    </defs>
    <rect width="100%" height="100%" fill="url(#bg${idx})"/>
    <rect width="100%" height="100%" fill="url(#paper${idx})"/>
    ${textBlock(title, W / 2, top, titleSize, 900, colors.text, { anchor: "middle", maxChars, lineHeight: titleSize * 1.18 })}
    ${textBlock(subtitle, W / 2, top + titleSize * (title.includes(" ") ? 2.45 : 1.35), subSize, 800, colors.textSecondary, { anchor: "middle", maxChars: isPad ? 26 : 19 })}
    <g filter="url(#shadow${idx})">${inner}</g>
  </svg>`;
}

function homeScreen(w, h) {
  return `<rect width="${w}" height="${h}" fill="${colors.deep}"/>
    <rect y="${h * 0.55}" width="${w}" height="${h * 0.45}" fill="#1A0F08"/>
    <path d="M0 ${h * 0.74} C ${w * 0.18} ${h * 0.68}, ${w * 0.26} ${h * 0.86}, ${w * 0.46} ${h * 0.78} S ${w * 0.8} ${h * 0.66}, ${w} ${h * 0.76} L ${w} ${h} L0 ${h}Z" fill="#3A2418" opacity=".95"/>
    <path d="M0 ${h * 0.2} C ${w * 0.2} ${h * 0.25}, ${w * 0.35} ${h * 0.08}, ${w * 0.52} ${h * 0.18} S ${w * 0.82} ${h * 0.3}, ${w} ${h * 0.18}" stroke="#8A5A3A" stroke-width="18" fill="none" opacity=".38"/>
    ${pill(42, 46, 190, 58, "rgba(255,248,240,.9)", colors.surfaceBorder)}
    ${coin(72, 75, 17)}
    ${textBlock("1,240", 104, 85, 28, 900, colors.text)}
    ${pill(w - 235, 46, 190, 58, "rgba(255,248,240,.9)", colors.surfaceBorder)}
    ${textBlock("2학년 1학기", w - 140, 83, 25, 900, colors.primary, { anchor: "middle" })}
    <circle cx="${w / 2}" cy="${h * 0.36}" r="${w * 0.28}" fill="#FFF3D0" opacity=".12"/>
    ${worm(w / 2 - 110, h * 0.34 - 75, 1.85, "acorn", false)}
    <rect x="${w * 0.13}" y="${h * 0.66}" width="${w * 0.74}" height="185" rx="30" fill="${colors.surface}" stroke="${colors.surfaceBorder}" stroke-width="4"/>
    ${textBlock("오늘의 개념", w * 0.2, h * 0.705, 25, 900, colors.cta)}
    ${textBlock("받아올림이 있는 덧셈", w * 0.2, h * 0.755, 34, 900, colors.text, { maxChars: 12, lineHeight: 42 })}
    <rect x="${w * 0.2}" y="${h * 0.835}" width="${w * 0.6}" height="20" rx="10" fill="#EAD3C8"/>
    <rect x="${w * 0.2}" y="${h * 0.835}" width="${w * 0.38}" height="20" rx="10" fill="${colors.secondary}"/>
    ${textBlock("6 / 10 클리어", w * 0.5, h * 0.895, 24, 900, colors.textSecondary, { anchor: "middle" })}`;
}

function problemScreen(w, h) {
  const cx = w / 2;
  const apples = Array.from({ length: 8 }, (_, i) => {
    const x = cx - 168 + (i % 4) * 112;
    const y = 292 + Math.floor(i / 4) * 78;
    const tint = i < 5 ? "#E95F4D" : "#F5B14C";
    return `<g transform="translate(${x} ${y})">
      <circle cx="0" cy="18" r="24" fill="${tint}" stroke="#A0522D" stroke-width="3"/>
      <path d="M-8 0 Q0 -18 10 0" fill="none" stroke="#6B4226" stroke-width="5" stroke-linecap="round"/>
      <ellipse cx="16" cy="1" rx="12" ry="6" fill="#6B8E23" transform="rotate(-24 16 1)"/>
      <circle cx="-8" cy="9" r="5" fill="#fff" opacity=".35"/>
    </g>`;
  }).join("");
  return `<rect width="${w}" height="${h}" fill="${colors.background}"/>
    ${pill(36, 44, 116, 48, colors.primary)}
    ${textBlock("3 / 8", 94, 78, 24, 900, "#fff", { anchor: "middle" })}
    ${pill(w - 210, 44, 168, 48, colors.surface, colors.surfaceBorder)}
    ${textBlock("난이도 보통", w - 126, 76, 22, 900, colors.textSecondary, { anchor: "middle" })}
    <rect x="44" y="128" width="${w - 88}" height="285" rx="28" fill="${colors.surface}" stroke="${colors.surfaceBorder}" stroke-width="4"/>
    ${textBlock("사과 5개와 3개를 모으면 모두 몇 개일까요?", 78, 188, 33, 900, colors.text, { maxChars: 16, lineHeight: 42 })}
    ${apples}
    ${["12", "16", "18", "20"].map((v, i) => {
      const y = 470 + i * 92;
      const choices = ["6", "7", "8", "9"];
      const active = i === 2;
      return `<rect x="54" y="${y}" width="${w - 108}" height="70" rx="20" fill="${active ? colors.primary : colors.surface}" stroke="${active ? colors.primary : colors.surfaceBorder}" stroke-width="4"/>
        <circle cx="98" cy="${y + 35}" r="22" fill="${active ? "#fff" : colors.surfaceBorder}"/>
        ${textBlock(String(i + 1), 98, y + 44, 23, 900, active ? colors.primary : colors.text, { anchor: "middle" })}
        ${textBlock(choices[i], 142, y + 45, 31, 900, active ? "#fff" : colors.text)}`;
    }).join("")}
    <rect x="54" y="${h - 104}" width="${w - 108}" height="70" rx="24" fill="${colors.cta}"/>
    ${textBlock("제출하기", cx, h - 60, 31, 900, "#fff", { anchor: "middle" })}`;
}

function rewardScreen(w, h) {
  return `<rect width="${w}" height="${h}" fill="${colors.background}"/>
    <circle cx="${w / 2}" cy="220" r="96" fill="${colors.success}"/>
    <path d="M${w / 2 - 40} 220 L${w / 2 - 8} 252 L${w / 2 + 48} 184" stroke="#fff" stroke-width="16" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    ${textBlock("정답이에요!", w / 2, 370, 48, 900, colors.text, { anchor: "middle" })}
    <rect x="${w * 0.14}" y="430" width="${w * 0.72}" height="120" rx="30" fill="${colors.surface}" stroke="${colors.surfaceBorder}" stroke-width="4"/>
    ${coin(w * 0.32, 490, 27)}
    ${textBlock("+30 코인", w * 0.43, 503, 34, 900, colors.coin)}
    <path d="M${w * 0.62} 490 l18 -38 l18 38 l42 5 l-31 28 l8 41 l-36 -21 l-36 21 l8 -41 l-31 -28z" fill="${colors.secondary}" stroke="#B8942A" stroke-width="3"/>
    ${textBlock("+1 별", w * 0.75, 503, 34, 900, colors.secondary)}
    <rect x="54" y="610" width="${w - 108}" height="190" rx="28" fill="#fff" stroke="${colors.surfaceBorder}" stroke-width="4"/>
    ${textBlock("풀이", 88, 665, 27, 900, colors.textSecondary)}
    ${textBlock("5개와 3개를 더하면 모두 8개예요.", 88, 725, 33, 800, colors.text, { maxChars: 16 })}
    <rect x="54" y="850" width="${w - 108}" height="110" rx="25" fill="${colors.secondary}"/>
    ${textBlock("개념 클리어! 지렁이가 전진했어요", w / 2, 916, 29, 900, "#fff", { anchor: "middle", maxChars: 19 })}`;
}

function shopScreen(w, h) {
  return `<rect width="${w}" height="${h}" fill="#FFF6E8"/>
    ${pill(44, 44, 145, 54, "rgba(255,255,255,.85)", colors.surfaceBorder)}
    ${textBlock("내 가방", 116, 80, 24, 900, colors.text, { anchor: "middle" })}
    ${pill(w - 184, 44, 138, 54, "rgba(255,255,255,.85)", colors.surfaceBorder)}
    ${coin(w - 152, 71, 16)}
    ${textBlock("1,240", w - 118, 81, 24, 900, colors.text)}
    <rect x="54" y="125" width="${w - 108}" height="330" rx="36" fill="rgba(255,255,255,.72)" stroke="${colors.surfaceBorder}" stroke-width="4"/>
    ${worm(w / 2 - 150, 230, 2.45, "crown", true)}
    ${["모자", "옷", "장신구"].map((v, i) => {
      const x = 54 + i * ((w - 108) / 3);
      const tw = (w - 108) / 3 - 8;
      return `<rect x="${x + 4}" y="490" width="${tw}" height="62" rx="22" fill="${i === 0 ? colors.primary : colors.surface}" stroke="${colors.surfaceBorder}" stroke-width="3"/>
        ${textBlock(v, x + 4 + tw / 2, 530, 24, 900, i === 0 ? "#fff" : colors.textSecondary, { anchor: "middle" })}`;
    }).join("")}
    ${[
      ["도토리 모자", "120", "acorn"],
      ["반짝 왕관", "300", "crown"],
      ["초록 비니", "180", "beanie"],
      ["동글 안경", "220", "glasses"],
    ].map((it, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const cw = (w - 126) / 2;
      const x = 54 + col * (cw + 18);
      const y = 590 + row * 205;
      return `<rect x="${x}" y="${y}" width="${cw}" height="178" rx="24" fill="${colors.surface}" stroke="${colors.surfaceBorder}" stroke-width="4"/>
        ${it[2] === "glasses" ? `<g transform="translate(${x + cw / 2 - 42} ${y + 42}) scale(2.6)"><circle cx="8" cy="7" r="5" stroke="#2A1810" stroke-width="1.8" fill="rgba(255,255,255,.35)"/><circle cx="26" cy="7" r="5" stroke="#2A1810" stroke-width="1.8" fill="rgba(255,255,255,.35)"/><path d="M13 7 L21 7" stroke="#2A1810" stroke-width="1.8"/></g>` : worm(x + cw / 2 - 56, y + 22, 0.95, it[2], false)}
        ${textBlock(it[0], x + cw / 2, y + 122, 24, 900, colors.text, { anchor: "middle" })}
        ${coin(x + cw / 2 - 34, y + 151, 14)}
        ${textBlock(it[1], x + cw / 2 - 8, y + 160, 22, 900, colors.coin)}`;
    }).join("")}`;
}

function reportScreen(w, h) {
  const chartX = 84;
  const chartY = 550;
  const bars = [0.9, 0.64, 0.78, 0.46].map((v, i) => {
    const bw = (w - 168) / 4 - 18;
    const x = chartX + i * ((w - 168) / 4);
    const bh = 170 * v;
    return `<rect x="${x}" y="${chartY + 180 - bh}" width="${bw}" height="${bh}" rx="12" fill="${i === 3 ? colors.cta : colors.secondary}"/>
      ${textBlock(["수", "연산", "도형", "측정"][i], x + bw / 2, chartY + 220, 23, 900, colors.textSecondary, { anchor: "middle" })}`;
  }).join("");
  return `<rect width="${w}" height="${h}" fill="#FFF6E8"/>
    <rect x="54" y="60" width="${w - 108}" height="150" rx="30" fill="${colors.surface}" stroke="${colors.surfaceBorder}" stroke-width="4"/>
    ${worm(84, 82, 1.15, "beanie", false)}
    ${textBlock("하린이의 학습 리포트", 230, 124, 34, 900, colors.text)}
    ${textBlock("이번 주 정확도 84%", 230, 172, 26, 900, colors.success)}
    <rect x="54" y="245" width="${w - 108}" height="215" rx="30" fill="#fff" stroke="${colors.surfaceBorder}" stroke-width="4"/>
    ${textBlock("맞춤 추천", 86, 305, 28, 900, colors.cta)}
    ${textBlock("측정 단원에서 한 번 더 연습하면 좋아요.", 86, 365, 32, 900, colors.text, { maxChars: 17 })}
    ${pill(86, 405, 210, 44, "#FCE7DF", colors.surfaceBorder)}
    ${textBlock("추천 문제 6개", 191, 435, 23, 900, colors.cta, { anchor: "middle" })}
    <rect x="54" y="500" width="${w - 108}" height="310" rx="30" fill="${colors.surface}" stroke="${colors.surfaceBorder}" stroke-width="4"/>
    ${textBlock("단원별 이해도", 86, 560, 28, 900, colors.text)}
    ${bars}
    <rect x="54" y="850" width="${w - 108}" height="110" rx="25" fill="${colors.primary}"/>
    ${textBlock("오늘은 받아올림 덧셈부터 시작해요", w / 2, 916, 30, 900, "#fff", { anchor: "middle", maxChars: 18 })}`;
}

const screens = [
  ["01-adventure", "깊은 땅에서 하늘까지", "문제를 풀수록 지렁이가 한 단계씩 올라가요", homeScreen],
  ["02-visual-problem", "그림으로 바로 이해", "초등 1-3학년 눈높이에 맞춘 시각화 문제", problemScreen],
  ["03-reward", "정답이면 코인 보상", "풀이와 함께 별, 코인을 모으며 계속 도전해요", rewardScreen],
  ["04-shop", "코인으로 꾸미기", "모자와 장신구로 나만의 지렁이를 만들어요", shopScreen],
  ["05-report", "맞춤 문제와 리포트", "부족한 개념을 찾아 다음 문제를 추천해요", reportScreen],
];

const sizes = [
  ["iphone", 1242, 2688],
  ["ipad", 2064, 2752],
];

for (const [device, W, H] of sizes) {
  for (let i = 0; i < screens.length; i += 1) {
    const [slug, title, subtitle, screen] = screens[i];
    const svg = base(
      W,
      H,
      `${device}${i}`,
      title,
      subtitle,
      phoneShell(W, H, screen, { clipId: `clip-${device}-${i}` }),
    );
    const svgPath = path.join(OUT_DIR, `${device}-${slug}.svg`);
    const pngPath = path.join(OUT_DIR, `${device}-${slug}.png`);
    fs.writeFileSync(svgPath, svg);
    execFileSync("rsvg-convert", ["-w", String(W), "-h", String(H), "-o", pngPath, svgPath]);
  }
}

console.log(`Generated ${screens.length * sizes.length} PNG mockups in ${OUT_DIR}`);
