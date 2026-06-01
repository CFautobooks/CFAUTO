"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, UploadCloud } from "lucide-react";
import { allowedMimeTypes, maxUploadBytes } from "@/lib/constants";
import { createBrowserSupabaseClient } from "@/lib/supabase";

export function UploadDropzone() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const helper = useMemo(
    () => `PDF, JPG or PNG up to ${Math.round(maxUploadBytes / 1024 / 1024)} MB`,
    [],
  );

  function chooseFile(nextFile?: File) {
    setError("");
    if (!nextFile) return;
    if (!allowedMimeTypes.includes(nextFile.type)) {
      setError("Please upload a PDF, JPG or PNG file.");
      return;
    }
    if (nextFile.size > maxUploadBytes) {
      setError("Please upload a file that is 10 MB or smaller.");
      return;
    }
    setFile(nextFile);
  }

  async function upload() {
    if (!file) {
      setError("Choose an invoice or receipt before continuing.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const supabase = createBrowserSupabaseClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        router.push("/login");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/extract", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Upload failed.");
      }

      router.push(`/review/${payload.transaction.id}`);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          chooseFile(event.dataTransfer.files[0]);
        }}
        className="flex min-h-72 cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center transition hover:border-emerald-400 hover:bg-emerald-50/40"
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={allowedMimeTypes.join(",")}
          className="hidden"
          onChange={(event) => chooseFile(event.target.files?.[0])}
        />
        <div className="mb-5 rounded-3xl bg-white p-5 text-emerald-600 shadow-sm">
          <UploadCloud size={36} />
        </div>
        <h2 className="text-2xl font-bold text-[#0b1f3a]">Drop your invoice or receipt here</h2>
        <p className="mt-2 text-slate-600">{helper}</p>
        <p className="mt-4 text-sm text-slate-500">
          CF AutoBooks will extract supplier details, ABN, GST, totals, line items and a suggested
          bookkeeping category.
        </p>
        {file ? (
          <div className="mt-6 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm">
            Selected: {file.name}
          </div>
        ) : null}
      </div>

      {error ? (
        <div className="mt-4 flex items-center gap-2 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertCircle size={18} />
          {error}
        </div>
      ) : null}

      <button
        type="button"
        onClick={upload}
        disabled={loading}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-4 font-bold text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? <Loader2 className="animate-spin" size={20} /> : <UploadCloud size={20} />}
        {loading ? "Extracting bookkeeping data..." : "Upload and extract"}
      </button>
    </div>
  );
}
