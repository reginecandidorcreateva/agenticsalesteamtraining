export interface ChatMessage {
  id: number | string;
  role: "user" | "agent";
  agentId: number | null;
  agentName: string | null;
  content: string;
  isError: boolean;
  createdAt: string;
}

export interface ChatAgent {
  id: number;
  name: string;
  kind: string;
}
