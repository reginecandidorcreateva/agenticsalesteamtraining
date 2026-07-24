export interface LastRun {
  task: string;
  output: string | null;
  error: string | null;
  createdAt: string;
}

export interface Agent {
  id: number;
  name: string;
  kind: string;
  instructions: string;
  createdAt: string;
  lastRun: LastRun | null;
}

export interface TeamMember {
  id: number;
  name: string;
  kind: string;
}

export interface Team {
  id: number;
  name: string;
  createdAt: string;
  members: TeamMember[];
}
