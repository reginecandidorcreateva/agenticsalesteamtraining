export interface Brand {
  id: number;
  name: string;
  website: string;
  contactEmail: string;
  notes: string;
  status: string;
  brief: string;
  briefUpdatedAt: string | null;
  pitch: string;
  pitchUpdatedAt: string | null;
  proposal: string;
  proposalUpdatedAt: string | null;
  followup: string;
  followupUpdatedAt: string | null;
  createdAt: string;
}
