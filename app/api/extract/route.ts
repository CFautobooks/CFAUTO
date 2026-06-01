import { NextResponse } from "next/server";
import {
  extractTextFromFile,
  extractWithOpenAI,
  safeFileName,
  statusForConfidence,
  validateUpload,
} from "@/lib/extraction";
import { createAdminSupabaseClient, createRouteSupabaseClient, readBearerToken } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let documentId: string | null = null;
  let userId: string | null = null;

  try {
    const accessToken = readBearerToken(request);
    if (!accessToken) {
      return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
    }

    const authClient = createRouteSupabaseClient(accessToken);
    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser(accessToken);

    if (authError || !user) {
      return NextResponse.json({ error: "Invalid session." }, { status: 401 });
    }
    userId = user.id;

    const formData = await request.formData();
    const file = formData.get("file");
    const businessId = String(formData.get("business_id") || "") || null;
    const clientId = String(formData.get("client_id") || "") || null;

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "A file is required." }, { status: 400 });
    }

    validateUpload(file);

    const supabase = createAdminSupabaseClient();
    const buffer = Buffer.from(await file.arrayBuffer());
    const storagePath = `${user.id}/${crypto.randomUUID()}-${safeFileName(file.name)}`;

    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data: document, error: documentError } = await supabase
      .from("documents")
      .insert({
        user_id: user.id,
        business_id: businessId,
        client_id: clientId,
        file_name: file.name,
        file_path: storagePath,
        mime_type: file.type,
        file_size: file.size,
        status: "uploaded",
      })
      .select("*")
      .single();

    if (documentError) {
      throw new Error(documentError.message);
    }

    documentId = document.id;
    const extractedText = await extractTextFromFile(file, buffer);
    const extraction = await extractWithOpenAI({ file, buffer, extractedText });
    const status = statusForConfidence(extraction.confidence_score);

    const { data: transaction, error: transactionError } = await supabase
      .from("transactions")
      .insert({
        user_id: user.id,
        business_id: businessId,
        client_id: clientId,
        document_id: document.id,
        supplier_name: extraction.supplier_name,
        supplier_abn: extraction.supplier_abn,
        invoice_number: extraction.invoice_number,
        invoice_date: extraction.invoice_date || null,
        due_date: extraction.due_date || null,
        description: extraction.description,
        category: extraction.category,
        subtotal: extraction.subtotal,
        gst_amount: extraction.gst_amount,
        total_amount: extraction.total_amount,
        currency: "AUD",
        confidence_score: extraction.confidence_score,
        status,
        notes: [...extraction.warnings, ...extraction.missing_fields.map((field) => `Missing ${field}`)]
          .filter(Boolean)
          .join("\n"),
      })
      .select("*")
      .single();

    if (transactionError) {
      throw new Error(transactionError.message);
    }

    if (extraction.line_items.length > 0) {
      const { error: lineItemError } = await supabase.from("transaction_line_items").insert(
        extraction.line_items.map((item, index) => ({
          transaction_id: transaction.id,
          user_id: user.id,
          description: item.description,
          quantity: item.quantity ?? null,
          unit_price: item.unit_price ?? null,
          gst_amount: item.gst_amount ?? null,
          total_amount: item.total_amount ?? null,
          order_index: index,
        })),
      );

      if (lineItemError) {
        throw new Error(lineItemError.message);
      }
    }

    await supabase
      .from("documents")
      .update({ status, extracted_text: extractedText || null })
      .eq("id", document.id);

    await supabase.from("extraction_logs").insert({
      user_id: user.id,
      document_id: document.id,
      transaction_id: transaction.id,
      provider: "openai",
      status: "success",
      extracted_text: extractedText || null,
      raw_response: extraction,
      error_message: null,
    });

    return NextResponse.json({ transaction, extraction });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Extraction failed.";

    try {
      const supabase = createAdminSupabaseClient();
      if (documentId) {
        await supabase.from("documents").update({ status: "failed" }).eq("id", documentId);
      }
      await supabase.from("extraction_logs").insert({
        user_id: userId,
        document_id: documentId,
        provider: "openai",
        status: "failed",
        error_message: message,
      });
    } catch {
      // Avoid hiding the original extraction error.
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
