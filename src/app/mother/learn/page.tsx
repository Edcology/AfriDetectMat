import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MotherHeader } from "@/components/mother/ui";
import { lessons } from "@/lib/mother-data";

export const instant = false;
export const metadata = { title: "Learn" };

const tagTone: Record<string, string> = {
  Pregnancy: "bg-[#f1edfa] text-[#6b4e9e]",
  "Warning signs": "bg-danger-soft text-danger",
  Postpartum: "bg-info-soft text-info",
};

export default function LearnPage() {
  return (
    <div className="flex flex-col gap-6">
      <MotherHeader
        title="Helpful pregnancy information"
        subtitle="Simple information to help you prepare for conversations with your care team."
      />

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {lessons.map((lesson) => (
          <Link
            key={lesson.slug}
            href={`/mother/learn/${lesson.slug}`}
            className="group flex flex-col gap-3 rounded-[16px] border border-line bg-white px-6 py-5 transition-colors hover:border-brand/40"
          >
            <span
              className={`w-fit rounded-pill px-3 py-1.5 text-[12px] font-normal tracking-[-0.12px] ${
                tagTone[lesson.tag] ?? "bg-surface-muted text-ink-soft"
              }`}
            >
              {lesson.tag}
            </span>
            <h2 className="text-[16px] leading-[21px] font-medium text-ink">{lesson.title}</h2>
            <p className="line-clamp-3 text-[13px] leading-[19px] text-ink-soft">{lesson.excerpt}</p>
            <span className="mt-auto inline-flex items-center gap-1 text-[12px] font-semibold text-brand-deep">
              Read · {lesson.minutes} min <ArrowRight size={12} />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
