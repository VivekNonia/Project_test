
export enum GrievanceCategory {
  NO_WATER_SUPPLY = "No Water Supply",
  PIPELINE_LEAKAGE = "Pipeline Leakage",
  WATER_QUALITY = "Water Quality",
  BILLING_ISSUE = "Billing Issue",
  INFRASTRUCTURE_DAMAGE = "Infrastructure Damage",
  OTHER = "Other",
}

export enum GrievanceStatus {
  OPEN = "Open",
  IN_PROGRESS = "In Progress",
  RESOLVED = "Resolved",
  CLOSED = "Closed",
}

export interface Grievance {
  id: string;
  category: GrievanceCategory;
  summary: string;
  location: string;
  status: GrievanceStatus;
  submittedAt: Date;
}

export interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
}

export type View = 'citizen' | 'official';

export enum Intent {
    GRIEVANCE_FILING = "GRIEVANCE_FILING",
    STATUS_CHECK = "STATUS_CHECK",
    GENERAL_QUERY = "GENERAL_QUERY",
}

export interface GeminiResponse {
    intent: Intent;
    grievance?: {
        category: GrievanceCategory;
        location: string;
        summary: string;
    };
    ticketId?: string;
    response: string;
}
