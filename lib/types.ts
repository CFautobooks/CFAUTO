export type FollowUpStatus =
  | "new"
  | "drafted"
  | "scheduled"
  | "sent"
  | "replied"
  | "recovered"
  | "paused"
  | "closed";

export type OutreachChannel = "email" | "sms" | "phone";

export type CaseType = "invoice" | "quote" | "lead" | "appointment" | "repeat_service";

export type IntegrationProvider =
  | "gmail"
  | "outlook"
  | "quickbooks"
  | "stripe"
  | "square"
  | "calendly"
  | "hubspot"
  | "jobber"
  | "servicetitan"
  | "twilio";

export type Customer = {
  id: string;
  user_id?: string;
  business_id?: string | null;
  company_name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  lifecycle_stage: "lead" | "quoted" | "customer" | "past_customer";
  total_revenue_at_risk: number;
  last_contacted_at: string | null;
  notes: string | null;
  created_at?: string;
  updated_at?: string;
};

export type FollowUpCase = {
  id: string;
  user_id?: string;
  business_id?: string | null;
  customer_id: string | null;
  customer?: Customer | null;
  case_type: CaseType;
  title: string;
  source: IntegrationProvider | "csv" | "manual";
  amount_cents: number;
  currency: string;
  due_date: string | null;
  last_contacted_at: string | null;
  next_follow_up_at: string | null;
  recovery_score: number;
  status: FollowUpStatus;
  channel: OutreachChannel;
  draft_subject: string | null;
  draft_body: string | null;
  sequence_name: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type FollowUpMessage = {
  id: string;
  case_id: string;
  user_id?: string;
  channel: OutreachChannel;
  subject: string | null;
  body: string;
  status: "draft" | "queued" | "sent" | "failed" | "replied";
  provider: IntegrationProvider | null;
  scheduled_at: string | null;
  sent_at: string | null;
  error_message: string | null;
  created_at: string;
};

export type FollowUpDraft = {
  subject: string;
  body: string;
  channel: OutreachChannel;
  tone: "friendly" | "professional" | "firm";
  recovery_score: number;
  recommended_next_step: string;
};
