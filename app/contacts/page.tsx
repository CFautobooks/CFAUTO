import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { demoBlockedNumbers, demoContacts } from "@/lib/demo-data";

export default function ContactsPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Contacts and blocked numbers"
        title="Decide who should receive AI follow-up"
        description="Saved contacts can be allowed, ignored or classified as personal before the AI continues."
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-xl font-bold text-[#0b1f3a]">Contacts</h2>
          <div className="mt-5 space-y-3">
            {demoContacts.map((contact) => (
              <div key={contact.id} className="rounded-2xl border border-slate-100 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-bold text-[#0b1f3a]">{contact.name}</p>
                    <p className="text-sm text-slate-500">{contact.phone}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold capitalize text-slate-600">
                    {contact.contact_type}
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate-600">{contact.notes}</p>
                <p className="mt-2 text-xs font-bold text-emerald-700">
                  Auto-reply {contact.auto_reply_allowed ? "allowed" : "disabled"}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-xl font-bold text-[#0b1f3a]">Blocked numbers</h2>
          <div className="mt-5 space-y-3">
            {demoBlockedNumbers.map((blocked) => (
              <div key={blocked.id} className="rounded-2xl border border-rose-100 bg-rose-50 p-4">
                <p className="font-bold text-rose-900">{blocked.phone}</p>
                <p className="mt-1 text-sm text-rose-700">{blocked.reason}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            Twilio webhooks check this list before sending the first missed-call SMS.
          </div>
        </section>
      </div>
    </AppShell>
  );
}
