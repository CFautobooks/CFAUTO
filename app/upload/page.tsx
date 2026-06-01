import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { UploadDropzone } from "@/components/upload-dropzone";

export default function UploadPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Upload"
        title="Upload an invoice or receipt"
        description="Store the source document in Supabase Storage, extract bookkeeping details with OpenAI and send the transaction to the review screen."
      />
      <UploadDropzone />
    </AppShell>
  );
}
