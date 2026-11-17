import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Info } from "lucide-react";
import { lessons } from "@/lib/mother-data";

export const instant = false;

export default async function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lesson = lessons.find((entry) => entry.slug === slug);
  if (!lesson) notFound();

  const related = lessons.filter((entry) => entry.slug !== lesson.slug).slice(0, 2);

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/mother/learn"
        className="inline-flex w-fit items-center gap-2 rounded-pill border border-line bg-white px-4 py-2 text-[13px] text-ink-soft hover:text-ink"
      >
        <ArrowLeft size={14} /> Back to lessons
      </Link>

      <article className="max-w-[820px] rounded-[16px] border border-line bg-white px-8 py-8">
        <span className="rounded-pill bg-[#f1edfa] px-3 py-1.5 text-[12px] text-[#6b4e9e]">{lesson.tag}</span>
        <h1 className="mt-4 text-[32px] leading-[40px] font-semibold tracking-[-0.32px] text-ink">{lesson.title}</h1>
        <p className="mt-2 text-[12px] text-muted">{lesson.minutes} minute read · reviewed by your care team</p>

        <div className="mt-6 flex flex-col gap-4">
          {lesson.body.map((paragraph) => (
            <p key={paragraph} className="text-[15px] leading-[24px] text-ink">
              {paragraph}
            </p>
          ))}
        </div>

        <div className="mt-6 flex items-start gap-2 rounded-[12px] bg-[#f1f5f2] px-4 py-3">
          <Info size={16} className="mt-0.5 shrink-0 text-brand-deep" />
          <p className="text-[12px] leading-[18px] text-ink-soft">
            This information is general guidance and does not replace advice from your midwife or doctor. Ask your care
            team if anything is unclear.
          </p>
        </div>
      </article>

      <div>
        <h2 className="text-[14px] font-medium text-ink">Read next</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {related.map((entry) => (
            <Link
              key={entry.slug}
              href={`/mother/learn/${entry.slug}`}
              className="rounded-[16px] border border-line bg-white px-5 py-4 hover:border-brand/40"
            >
              <p className="text-[14px] font-medium text-ink">{entry.title}</p>
              <p className="mt-1 line-clamp-2 text-[12px] leading-[18px] text-ink-soft">{entry.excerpt}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
