import {
  BarChart3,
  Building2,
  CreditCard,
  FileCheck2,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  UploadCloud,
  Users,
} from "lucide-react";

export const appName = "CF AutoBooks";
export const parentBusiness = "Carmichael Financials";

export const allowedMimeTypes = ["application/pdf", "image/jpeg", "image/png"];
export const maxUploadBytes = 10 * 1024 * 1024;

export const categories = [
  "Advertising and marketing",
  "Bank fees",
  "Cleaning",
  "Computer and software",
  "Contractors",
  "Equipment and tools",
  "Fuel and motor vehicle",
  "Insurance",
  "Meals and entertainment",
  "Office supplies",
  "Professional fees",
  "Rent",
  "Repairs and maintenance",
  "Telephone and internet",
  "Travel",
  "Utilities",
  "Other expenses",
];

export const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/upload", label: "Upload", icon: UploadCloud },
  { href: "/transactions", label: "Transactions", icon: FileCheck2 },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/pricing", label: "Pricing", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/admin", label: "Admin", icon: ShieldCheck },
];

export const dashboardStats = [
  { label: "Documents uploaded", value: "128", detail: "24 this month", icon: UploadCloud },
  { label: "Ready for review", value: "17", detail: "Avg confidence 91%", icon: BarChart3 },
  { label: "Approved transactions", value: "86", detail: "$42,810 captured", icon: FileCheck2 },
  { label: "Bookkeeper clients", value: "12", detail: "4 awaiting documents", icon: Building2 },
];
