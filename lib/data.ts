export type StatusKey = "working" | "waiting" | "offline" | "error";
export interface StatusMeta { label: string; bg: string; color: string; dot: string }

const STATUS_META: Record<StatusKey, StatusMeta> = {
  working: { label: "Working", bg: "#E7F7EC", color: "#1B7A3D", dot: "#2FA45C" },
  waiting: { label: "Waiting", bg: "#FEF6E8", color: "#B45309", dot: "#F59E0B" },
  offline: { label: "Offline", bg: "#F4F4F5", color: "#71717A", dot: "#A1A1AA" },
  error: { label: "Error", bg: "#FEECEC", color: "#B91C1C", dot: "#EF4444" },
};

export function statusMeta(s: StatusKey): StatusMeta {
  return STATUS_META[s] ?? STATUS_META.offline;
}
