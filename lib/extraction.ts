import OpenAI from "openai";
import { z } from "zod";
import { allowedMimeTypes, categories, maxUploadBytes } from "@/lib/constants";
import type { ExtractionResult, TransactionStatus } from "@/lib/types";

const lineItemSchema = z.object({
  description: z.string().default(""),
  quantity: z.number().nullable().optional(),
  unit_price: z.number().nullable().optional(),
  gst_amount: z.number().nullable().optional(),
  total_amount: z.number().nullable().optional(),
});

const extractionSchema = z.object({
  supplier_name: z.string().default(""),
  supplier_abn: z.string().default(""),
  invoice_number: z.string().default(""),
  invoice_date: z.string().default(""),
  due_date: z.string().default(""),
  description: z.string().default(""),
  category: z.string().default(""),
  subtotal: z.number().default(0),
  gst_amount: z.number().default(0),
  total_amount: z.number().default(0),
  line_items: z.array(lineItemSchema).default([]),
  confidence_score: z.number().default(0),
  missing_fields: z.array(z.string()).default([]),
  warnings: z.array(z.string()).default([]),
});

export function validateUpload(file: File) {
  if (!allowedMimeTypes.includes(file.type)) {
    throw new Error("Only PDF, JPG and PNG files can be uploaded.");
  }

  if (file.size > maxUploadBytes) {
    throw new Error("Files must be 10 MB or smaller.");
  }
}

export function safeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-");
}

export function statusForConfidence(confidenceScore: number): TransactionStatus {
  return confidenceScore >= 95 ? "extracted" : "needs_review";
}

export function normaliseExtraction(input: unknown): ExtractionResult {
  const parsed = extractionSchema.parse(input);
  const confidenceScore =
    parsed.confidence_score > 0 && parsed.confidence_score <= 1
      ? Math.round(parsed.confidence_score * 100)
      : Math.round(parsed.confidence_score);

  return {
    ...parsed,
    confidence_score: Math.max(0, Math.min(100, confidenceScore)),
  };
}

export async function extractTextFromFile(file: File, buffer: Buffer) {
  if (file.type !== "application/pdf") {
    return "";
  }

  try {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: buffer });
    const parsed = await parser.getText();
    await parser.destroy();
    return parsed.text?.trim() ?? "";
  } catch (error) {
    console.warn("PDF text extraction failed", error);
    return "";
  }
}

export async function extractWithOpenAI(params: {
  file: File;
  buffer: Buffer;
  extractedText: string;
}) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const openai = new OpenAI({ apiKey });
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const basePrompt = [
    "You are CF AutoBooks, an AI bookkeeping assistant for Australian small businesses and bookkeepers.",
    "Extract invoice or receipt data for bookkeeping. Use Australian English and Australian GST rules.",
    "Return strict JSON only, matching this schema exactly:",
    JSON.stringify({
      supplier_name: "",
      supplier_abn: "",
      invoice_number: "",
      invoice_date: "",
      due_date: "",
      description: "",
      category: "",
      subtotal: 0,
      gst_amount: 0,
      total_amount: 0,
      line_items: [],
      confidence_score: 0,
      missing_fields: [],
      warnings: [],
    }),
    `Use one of these categories when possible: ${categories.join(", ")}.`,
    "Dates must be ISO yyyy-mm-dd where possible. Currency is AUD. Confidence score must be 0 to 100.",
  ].join("\n");

  const content =
    params.extractedText.length > 20
      ? [
          {
            type: "text" as const,
            text: `${basePrompt}\n\nExtracted document text:\n${params.extractedText.slice(0, 18000)}`,
          },
        ]
      : buildVisualPrompt(params.file, params.buffer, basePrompt);

  const completion = await openai.chat.completions.create({
    model,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "Return only valid JSON. Do not wrap the response in Markdown. If a value is unknown, use an empty string, 0, [] or a warning.",
      },
      {
        role: "user",
        content,
      },
    ],
    temperature: 0.1,
  });

  const response = completion.choices[0]?.message.content;
  if (!response) {
    throw new Error("OpenAI returned an empty extraction response.");
  }

  return normaliseExtraction(JSON.parse(response));
}

function buildVisualPrompt(file: File, buffer: Buffer, basePrompt: string) {
  if (file.type === "image/jpeg" || file.type === "image/png") {
    return [
      {
        type: "text" as const,
        text: `${basePrompt}\n\nNo reliable text was extracted. Read the attached receipt or invoice image.`,
      },
      {
        type: "image_url" as const,
        image_url: {
          url: `data:${file.type};base64,${buffer.toString("base64")}`,
        },
      },
    ];
  }

  return [
    {
      type: "text" as const,
      text: `${basePrompt}\n\nThe PDF did not expose readable text. Return low-confidence JSON and include a warning that manual review is required.`,
    },
  ];
}
