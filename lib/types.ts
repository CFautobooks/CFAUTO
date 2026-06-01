export type LeadStatus =
  | "new"
  | "contacted"
  | "booked"
  | "quoted"
  | "won"
  | "lost"
  | "spam"
  | "personal"
  | "wrong_number"
  | "emergency";

export type ConversationCategory =
  | "new_lead"
  | "existing_customer"
  | "emergency"
  | "personal"
  | "spam"
  | "wrong_number"
  | "unknown";

export type ConversationStatus = "active" | "complete" | "stopped" | "escalated";
export type Urgency = "low" | "medium" | "high" | "emergency";
export type SenderType = "caller" | "ai" | "owner" | "system";
export type MessageDirection = "inbound" | "outbound" | "internal";
export type MissedCallStatus = "received" | "ignored" | "auto_replied" | "converted";
export type ContactType = "customer" | "staff" | "family" | "vendor" | "other";

export type Business = {
  id: string;
  owner_id?: string;
  name: string;
  industry: string;
  timezone: string;
  main_phone: string;
  created_at: string;
};

export type BusinessSettings = {
  business_id: string;
  auto_reply_enabled: boolean;
  reply_after_missed_call: boolean;
  reply_during_business_hours_only: boolean;
  business_hours: Record<string, { open: string; close: string; enabled: boolean }>;
  after_hours_message: string;
  emergency_keywords: string[];
  ignored_keywords: string[];
  max_ai_messages_per_conversation: number;
  owner_notification_phone: string;
  owner_notification_email: string;
};

export type PhoneNumber = {
  id: string;
  business_id: string;
  phone_number: string;
  label: string;
  forwarding_enabled: boolean;
  created_at: string;
};

export type MissedCall = {
  id: string;
  business_id: string;
  caller_phone: string;
  caller_name: string | null;
  twilio_call_sid: string | null;
  call_time: string;
  status: MissedCallStatus;
  auto_reply_sent: boolean;
  ignored_reason: string | null;
  created_at: string;
};

export type Conversation = {
  id: string;
  business_id: string;
  missed_call_id: string | null;
  caller_phone: string;
  category: ConversationCategory;
  status: ConversationStatus;
  ai_summary: string | null;
  confidence_score: number;
  urgency: Urgency;
  created_at: string;
  updated_at: string;
};

export type Message = {
  id: string;
  conversation_id: string;
  sender_type: SenderType;
  sender_phone: string | null;
  body: string;
  twilio_message_sid: string | null;
  direction: MessageDirection;
  created_at: string;
};

export type Lead = {
  id: string;
  business_id: string;
  conversation_id: string;
  name: string;
  phone: string;
  enquiry_type: string;
  job_description: string;
  urgency: Urgency;
  address: string;
  preferred_callback_time: string;
  status: LeadStatus;
  estimated_value: number | null;
  notes: string;
  created_at: string;
  updated_at: string;
};

export type Contact = {
  id: string;
  business_id: string;
  name: string;
  phone: string;
  contact_type: ContactType;
  notes: string | null;
  auto_reply_allowed: boolean;
};

export type BlockedNumber = {
  id: string;
  business_id: string;
  phone: string;
  reason: string;
  created_at: string;
};

export type AiConversationResult = {
  reply_to_caller: string;
  category: ConversationCategory;
  lead_complete: boolean;
  urgency: Urgency;
  extracted_details: {
    name: string;
    phone: string;
    enquiry_type: string;
    job_description: string;
    address: string;
    preferred_callback_time: string;
  };
  summary_for_owner: string;
  confidence_score: number;
  should_notify_owner_now: boolean;
  should_stop_ai: boolean;
};

export type SimulatorState = {
  business: Business;
  settings: BusinessSettings;
  missedCall: MissedCall | null;
  conversation: Conversation | null;
  messages: Message[];
  lead: Lead | null;
  ownerNotifications: string[];
};
