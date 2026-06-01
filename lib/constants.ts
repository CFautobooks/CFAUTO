import {
  AlertTriangle,
  BarChart3,
  Bot,
  Building2,
  CreditCard,
  LayoutDashboard,
  MessageSquareText,
  Phone,
  PhoneCall,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import type { ConversationCategory, LeadStatus } from "@/lib/types";

export const appName = "CallBack AI";
export const parentBusiness = "Miss a call. Don't lose the customer.";

export const defaultFirstSms =
  "Hi, thanks for calling [Business Name]. Sorry we missed your call. What can we help with?";

export const leadStatusLabels: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  booked: "Booked",
  quoted: "Quoted",
  won: "Won",
  lost: "Lost",
  spam: "Spam",
  personal: "Personal",
  wrong_number: "Wrong number",
  emergency: "Emergency",
};

export const categoryLabels: Record<ConversationCategory, string> = {
  new_lead: "New lead",
  existing_customer: "Existing customer",
  emergency: "Emergency",
  personal: "Personal",
  spam: "Spam",
  wrong_number: "Wrong number",
  unknown: "Unknown",
};

export const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leads", label: "Leads inbox", icon: PhoneCall },
  { href: "/conversations", label: "Conversations", icon: MessageSquareText },
  { href: "/simulator", label: "Test simulator", icon: Bot },
  { href: "/settings/phone", label: "Phone settings", icon: Phone },
  { href: "/settings/ai", label: "AI settings", icon: Settings },
  { href: "/settings/business", label: "Business profile", icon: Building2 },
  { href: "/contacts", label: "Contacts", icon: Users },
  { href: "/pricing", label: "Pricing", icon: CreditCard },
  { href: "/admin", label: "Admin", icon: ShieldCheck },
];

export const dashboardStats = [
  { label: "Missed calls today", value: "12", detail: "9 were eligible for AI follow-up", icon: PhoneCall },
  { label: "AI conversations started", value: "9", detail: "Median first reply under 10 seconds", icon: MessageSquareText },
  { label: "Leads captured", value: "6", detail: "4 new enquiries, 2 existing customers", icon: Users },
  { label: "Emergencies flagged", value: "1", detail: "Owner notified immediately", icon: AlertTriangle },
  { label: "Personal/spam ignored", value: "3", detail: "No AI follow-up continued", icon: ShieldCheck },
  { label: "Estimated recovered revenue", value: "$8.4k", detail: "Based on captured job value", icon: BarChart3 },
];

export const industries = [
  "Home services",
  "Medical and dental clinics",
  "Real estate",
  "Consulting",
  "Legal and accounting",
  "Salons and med spas",
  "Automotive repair",
  "Fitness and wellness",
];

export const pricingPlans = [
  {
    name: "Starter",
    price: "$49",
    features: [
      "1 business number",
      "100 missed-call follow-ups/month",
      "SMS lead capture",
      "Basic dashboard",
    ],
  },
  {
    name: "Growth",
    price: "$99",
    highlighted: true,
    features: [
      "2 numbers",
      "500 follow-ups/month",
      "AI classification",
      "Owner SMS/email alerts",
      "Lead pipeline",
    ],
  },
  {
    name: "Pro",
    price: "$199",
    features: [
      "5 numbers",
      "2,000 follow-ups/month",
      "Multiple staff alerts",
      "Advanced rules",
      "Priority support",
    ],
  },
];
