import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { demoClients } from "@/lib/demo-data";

export default function ClientsPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Bookkeepers"
        title="Client management"
        description="Bookkeeper plan users can track client businesses, upload documents on their behalf and monitor review status."
      />

      {demoClients.length === 0 ? (
        <EmptyState
          title="No clients added"
          description="Add client records once your Supabase project is connected."
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {demoClients.map((client) => (
            <div key={client.id} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-[#0b1f3a]">{client.business_name}</h2>
                  <p className="text-sm text-slate-500">{client.contact_name}</p>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                  {client.status}
                </span>
              </div>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="font-semibold text-slate-500">Email</dt>
                  <dd className="text-slate-800">{client.email}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-500">ABN</dt>
                  <dd className="text-slate-800">{client.abn}</dd>
                </div>
              </dl>
              <button className="mt-6 w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold text-slate-700">
                Upload for client
              </button>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
