import {
  BarChart3,
  Building2,
  CalendarClock,
  CreditCard,
  FileSpreadsheet,
  LayoutDashboard,
  MessageSquareText,
  Send,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import type { IntegrationProvider } from "@/lib/types";

export const appName = "RecoverFlow";
export const parentBusiness = "Revenue recovery autopilot";

export const allowedImportMimeTypes = ["text/csv", "application/vnd.ms-excel"];
export const maxImportBytes = 5 * 1024 * 1024;

export const caseTypeLabels = {
  invoice: "Unpaid invoice",
  quote: "Unanswered quote",
  lead: "Cold lead",
  appointment: "Missed appointment request",
  repeat_service: "Repeat service due",
};

export const followUpSequences = [
  {
    name: "Invoice recovery",
    trigger: "Invoice is 3 days overdue",
    steps: ["Friendly email", "SMS reminder", "Firm email with payment link"],
  },
  {
    name: "Quote win-back",
    trigger: "Quote has no reply after 48 hours",
    steps: ["Helpful check-in", "Objection-handling email", "Book-a-call SMS"],
  },
  {
    name: "Past customer reactivation",
    trigger: "Repeat service window is open",
    steps: ["Reminder email", "Calendar booking link", "Last-call SMS"],
  },
];

export const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/accounts", label: "Accounts", icon: Send },
  { href: "/import", label: "Import", icon: FileSpreadsheet },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/sequences", label: "Sequences", icon: CalendarClock },
  { href: "/pricing", label: "Pricing", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/admin", label: "Admin", icon: ShieldCheck },
];

export const dashboardStats = [
  { label: "Revenue at risk", value: "$42.8k", detail: "Across 31 open follow-ups", icon: BarChart3 },
  { label: "Recovered this month", value: "$18.6k", detail: "From invoices and stale quotes", icon: CreditCard },
  { label: "Messages queued", value: "74", detail: "Email and SMS follow-ups", icon: MessageSquareText },
  { label: "Connected sources", value: "10", detail: "Email, payments, CRM and scheduling", icon: Building2 },
];

export const integrationCatalog: Array<{
  provider: IntegrationProvider;
  name: string;
  category: string;
  purpose: string;
}> = [
  {
    provider: "gmail",
    name: "Gmail",
    category: "Email",
    purpose: "Detect replies and send follow-ups from the owner inbox.",
  },
  {
    provider: "outlook",
    name: "Outlook",
    category: "Email",
    purpose: "Sync Microsoft 365 conversations and reply status.",
  },
  {
    provider: "quickbooks",
    name: "QuickBooks",
    category: "Accounting",
    purpose: "Import overdue invoices, customer balances and payment links.",
  },
  {
    provider: "stripe",
    name: "Stripe",
    category: "Payments",
    purpose: "Track recovered payments and include hosted payment links.",
  },
  {
    provider: "square",
    name: "Square",
    category: "Payments",
    purpose: "Pull unpaid invoices and match in-person or online payments.",
  },
  {
    provider: "calendly",
    name: "Calendly",
    category: "Scheduling",
    purpose: "Book quote review calls and missed appointment follow-ups.",
  },
  {
    provider: "hubspot",
    name: "HubSpot",
    category: "CRM",
    purpose: "Recover stale deals, open quotes and unanswered form leads.",
  },
  {
    provider: "jobber",
    name: "Jobber",
    category: "Field service",
    purpose: "Import home-service quotes, jobs and client follow-up tasks.",
  },
  {
    provider: "servicetitan",
    name: "ServiceTitan",
    category: "Field service",
    purpose: "Sync enterprise service estimates and unscheduled opportunities.",
  },
  {
    provider: "twilio",
    name: "Twilio",
    category: "Messaging",
    purpose: "Send compliant SMS reminders and log delivery failures.",
  },
];
