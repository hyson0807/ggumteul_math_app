export function formatDifficulty(d: number): string {
  if (d <= -2) return "아주 쉬움";
  if (d < 0) return "쉬움";
  if (d === 0) return "보통";
  if (d < 3) return "어려움";
  return "아주 어려움";
}
