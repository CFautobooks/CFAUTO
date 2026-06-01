export type TransactionStatus =
  | "uploaded"
  | "extracted"
  | "needs_review"
  | "approved"
  | "exported";

export type ExtractedLineItem = {
  description: string;
  quantity?: number | null;
  unit_price?: number | null;
  gst_amount?: number | null;
  total_amount?: number | null;
};

export type ExtractionResult = {
  supplier_name: string;
  supplier_abn: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  description: string;
  category: string;
  subtotal: number;
  gst_amount: number;
  total_amount: number;
  line_items: ExtractedLineItem[];
  confidence_score: number;
  missing_fields: string[];
  warnings: string[];
};

export type Transaction = {
  id: string;
  user_id: string;
  business_id: string | null;
  client_id: string | null;
  document_id: string | null;
  supplier_name: string | null;
  supplier_abn: string | null;
  invoice_number: string | null;
  invoice_date: string | null;
  due_date: string | null;
  description: string | null;
  category: string | null;
  subtotal: number | null;
  gst_amount: number | null;
  total_amount: number | null;
  currency: string;
  confidence_score: number | null;
  status: TransactionStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  transaction_line_items?: ExtractedLineItem[];
};

export type Client = {
  id: string;
  business_name: string;
  contact_name: string | null;
  email: string | null;
  abn: string | null;
  status: string;
};
