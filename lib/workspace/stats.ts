// Shapes the orbit dashboard reads. Filled with representative demo values at Milestone 1
// (see 09-dashboard-design.md); wired to the real activity log + pipeline at Milestone 15.

export interface WorkspaceStats {
  activeAgents: number;
  tasksRunning: number;
  leadsWorked: number;
  perAgent: { agentId: string; leadsWorked: number }[];
}

export interface ActivityItem {
  agentId: string;
  text: string;
}
