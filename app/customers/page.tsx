import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { demoCustomers } from "@/lib/demo-data";

export default function CustomersPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Customers"
        title="Leads and customer records"
        description="Keep contact details, revenue at risk, lifecycle stage and recent outreach in one workspace."
      />

      {demoCustomers.length === 0 ? (
        <EmptyState
          title="No customers yet"
          description="Import invoices, quotes or leads to create customer records."
          href="/import"
          action="Import accounts"
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {demoCustomers.map((customer) => (
            <div key={customer.id} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-[#0b1f3a]">{customer.company_name}</h2>
                  <p className="text-sm text-slate-500">{customer.contact_name}</p>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold capitalize text-emerald-700">
                  {customer.lifecycle_stage.replace("_", " ")}
                </span>
              </div>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="font-semibold text-slate-500">Email</dt>
                  <dd className="text-slate-800">{customer.email}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-500">Phone</dt>
                  <dd className="text-slate-800">{customer.phone}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-500">Revenue at risk</dt>
                  <dd className="text-slate-800">${customer.total_revenue_at_risk.toLocaleString()} AUD</dd>
                </div>
              </dl>
              <p className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                {customer.notes}
              </p>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
