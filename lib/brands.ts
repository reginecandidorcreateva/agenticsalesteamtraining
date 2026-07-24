export const PENDING_APPROVAL = "pending_approval" as const;

export const STAGES = [
  { key: "new", label: "New" },
  { key: "pitched", label: "Pitched" },
  { key: "proposal_sent", label: "Proposal Sent" },
  { key: "following_up", label: "Following Up" },
  { key: "booked_call", label: "Booked a Call" },
] as const;

export type StageKey = (typeof STAGES)[number]["key"];
export type BrandStatus = typeof PENDING_APPROVAL | StageKey;

export const VALID_STATUSES: string[] = [PENDING_APPROVAL, ...STAGES.map((s) => s.key)];

export function isValidStatus(status: string): status is BrandStatus {
  return VALID_STATUSES.includes(status);
}
