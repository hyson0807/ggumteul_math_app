function parseDate(isoDate?: string | null): Date | null {
  if (!isoDate) return null;
  const d = new Date(isoDate);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatJoinedDate(isoDate?: string | null): string {
  const d = parseDate(isoDate);
  if (!d) return "-";
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export function formatShortDate(isoDate?: string | null): string {
  const d = parseDate(isoDate);
  if (!d) return "-";
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yy}.${mm}.${dd}`;
}
