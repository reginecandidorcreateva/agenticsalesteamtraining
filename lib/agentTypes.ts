// The static capability + agent-type + team catalog.
// See 07-engines.md (capabilities) and 07a-the-deal-team.md (the five-agent roster reference).
// Presets are curated developer data — the creator's own additions/overrides live in the database (later milestone).

import type { StatusKey } from "@/lib/data";

export interface Capability {
  id: string;
  label: string;
  jobKind: string;
}

export const CAPABILITIES: Capability[] = [
  { id: "scrape", label: "Research", jobKind: "scrape" },
  { id: "research", label: "Brand brief", jobKind: "research" },
  { id: "outreach", label: "Initial outreach", jobKind: "outreach" },
  { id: "proposal", label: "Proposals", jobKind: "proposal" },
  { id: "follow-up", label: "Follow-ups", jobKind: "follow-up" },
  { id: "book-meeting", label: "Scheduling", jobKind: "book-meeting" },
];

export interface AgentType {
  id: string;
  name: string;
  initials: string;
  role: string;
  color: string;
  capabilities: string[];
  status: StatusKey;
  task: string;
  goal: string;
  char?: number;
}

// The premade "Deal Team" — five single-task agents, one capability each.
export const AGENT_TYPES: AgentType[] = [
  {
    id: "discovery",
    name: "Remy Rivera",
    initials: "RR",
    role: "Research",
    color: "#0EA5E9",
    capabilities: ["scrape", "research"],
    status: "working",
    task: "Scouting new brand fits in your niche",
    goal: "Find brands that sponsor creators like you",
    char: 1,
  },
  {
    id: "outreach",
    name: "Otis Vance",
    initials: "OV",
    role: "Initial Outreach",
    color: "#5122C1",
    capabilities: ["outreach"],
    status: "working",
    task: "Drafting a first pitch for a new brand",
    goal: "Write the first pitch in your voice",
    char: 2,
  },
  {
    id: "proposal",
    name: "Priya Shah",
    initials: "PS",
    role: "Proposal",
    color: "#7C3AED",
    capabilities: ["proposal"],
    status: "working",
    task: "Scoping a priced proposal",
    goal: "Turn interest into a priced deal",
    char: 3,
  },
  {
    id: "followup",
    name: "Faye Cole",
    initials: "FC",
    role: "Follow-up",
    color: "#8B5CF6",
    capabilities: ["follow-up"],
    status: "waiting",
    task: "Watching for brands that went quiet",
    goal: "Re-engage brands that went cold",
    char: 4,
  },
  {
    id: "scheduler",
    name: "Sam Okafor",
    initials: "SO",
    role: "Scheduler",
    color: "#F43F7E",
    capabilities: ["book-meeting"],
    status: "working",
    task: "Booking a call on the calendar",
    goal: "Get the brand call on the calendar",
    char: 5,
  },
];

export interface TeamTemplate {
  id: string;
  name: string;
  description: string;
  members: string[];
}

export const TEAM_TEMPLATES: TeamTemplate[] = [
  {
    id: "deal-team",
    name: "Deal Team",
    description: "Finds, pitches, proposes, follows up, and books — end to end.",
    members: ["discovery", "outreach", "proposal", "followup", "scheduler"],
  },
];

export function byAgentTypeId(id: string): AgentType | undefined {
  return AGENT_TYPES.find((a) => a.id === id);
}
