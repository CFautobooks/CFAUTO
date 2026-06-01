import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { categoryLabels } from "@/lib/constants";
import { demoConversations, demoMessages } from "@/lib/demo-data";

export default function ConversationsPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Conversations"
        title="AI SMS conversations"
        description="See how CallBack AI classified each missed-call thread and when it stopped, escalated or created a lead."
      />

      <div className="grid gap-6 xl:grid-cols-3">
        {demoConversations.map((conversation) => {
          const messages = demoMessages.filter((message) => message.conversation_id === conversation.id);
          return (
            <section key={conversation.id} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-bold text-[#0b1f3a]">{conversation.caller_phone}</h2>
                  <p className="text-sm text-slate-500">{categoryLabels[conversation.category]}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold capitalize text-slate-600">
                  {conversation.status}
                </span>
              </div>
              <div className="mt-5 space-y-3">
                {messages.length === 0 ? (
                  <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                    Transcript not stored for this demo conversation.
                  </p>
                ) : (
                  messages.map((message) => (
                    <div key={message.id} className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                      <p className="mb-1 text-xs font-bold uppercase text-slate-500">{message.sender_type}</p>
                      {message.body}
                    </div>
                  ))
                )}
              </div>
              <div className="mt-5 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900">
                {conversation.ai_summary || "AI is still collecting details."}
              </div>
            </section>
          );
        })}
      </div>
    </AppShell>
  );
}
