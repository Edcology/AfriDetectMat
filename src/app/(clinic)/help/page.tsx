import Link from "next/link";
import { BookOpen, LifeBuoy, MessageSquare, Phone } from "lucide-react";
import { PageHeader } from "@/components/ui/card";

export const metadata = { title: "Help & support" };

const faqs = [
  {
    question: "How does the screening protocol decide a flag?",
    answer:
      "Protocol A runs on every verified reading. A single 160/110 mmHg reading is urgent; 140/90 needs confirmation on a second reading at least four hours apart. Missing results are shown as “more data needed”, never as normal.",
  },
  {
    question: "Why can't I close an alert?",
    answer:
      "Alerts close when a clinician acknowledges them, and the acknowledgement is attributed to your account. Screening never closes an alert on its own.",
  },
  {
    question: "How do I share a record with another facility?",
    answer:
      "Send a referral from the patient record, or grant an access request from Mother access. Access is scoped to a purpose and expires automatically.",
  },
  {
    question: "What happens when a mother reports a reading?",
    answer:
      "Patient-reported readings enter monitoring immediately and are labelled as such. A clinician verifies the reading before it changes the care plan.",
  },
];

export default function HelpPage() {
  return (
    <div className="flex flex-col gap-6 pt-2">
      <PageHeader title="Help & support" subtitle="Guidance for the clinical team at Harbour Health Centre" />

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { icon: MessageSquare, title: "Message the team", body: "Clinical leads reply within the working day." },
          { icon: Phone, title: "Call the desk", body: "Ext. 204 · available 08:00–18:00." },
          { icon: BookOpen, title: "Protocol library", body: "Screening protocols and escalation paths." },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="rounded-card border border-line bg-white px-6 py-5">
              <span className="grid size-9 place-items-center rounded-full bg-brand-mist text-brand-deep">
                <Icon size={16} />
              </span>
              <p className="mt-3 text-[15px] font-medium text-ink">{card.title}</p>
              <p className="mt-1 text-[13px] text-ink-soft">{card.body}</p>
            </div>
          );
        })}
      </div>

      <div className="rounded-card border border-line bg-white px-6 py-5">
        <h2 className="card-title">Common questions</h2>
        <div className="mt-4 divide-y divide-line-soft">
          {faqs.map((faq) => (
            <details key={faq.question} className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-medium text-ink">
                {faq.question}
                <span className="text-muted transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-2 max-w-3xl text-[13px] leading-[20px] text-ink-soft">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-card border border-line bg-brand-mist px-6 py-5">
        <div className="flex items-center gap-3">
          <LifeBuoy size={18} className="text-brand-deep" />
          <p className="text-[13px] text-brand-deep">
            Still stuck? Escalate a clinical safety issue directly to the on-call consultant.
          </p>
        </div>
        <Link href="/alerts" className="text-[13px] font-medium text-brand-deep hover:underline">
          Open clinical safety board
        </Link>
      </div>
    </div>
  );
}

export const instant = false;
