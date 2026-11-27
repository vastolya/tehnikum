import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { legalDocuments } from "@/data/legal";
import { personalDataPolicy } from "@/data/personal-data-policy";
import { userAgreement } from "@/data/user-agreement";

type Props = { params: Promise<{ document: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return legalDocuments.map((document) => ({ document: document.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { document: slug } = await params;
  const document = legalDocuments.find((item) => item.slug === slug);
  return { title: `${document?.title ?? "Документ"} — Техникум`, robots: { index: false, follow: false } };
}

export default async function LegalPage({ params }: Props) {
  const { document: slug } = await params;
  const document = legalDocuments.find((item) => item.slug === slug);
  if (!document) notFound();
  const paragraphs = slug === "personal-data-policy" ? personalDataPolicy : slug === "user-agreement" ? userAgreement : null;

  return (
    <main className="min-h-dvh bg-black px-page-gutter py-8 text-white sm:py-12">
      <Link href="/#footer" aria-label="Техникум — вернуться на сайт" className="inline-block focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-white">
        <Image src="/brand/tehnikum-logo-white.svg" alt="Техникум" width={200} height={25} className="h-auto w-40 sm:w-50" />
      </Link>
      <article className="mx-auto max-w-4xl py-20 sm:py-28">
        <h1 className="text-balance font-brand text-3xl leading-[1.2] font-light sm:text-5xl">{document.title}</h1>
        {paragraphs ? (
          <div className="mt-10 space-y-3 font-brand-mono text-sm leading-[1.75] break-words text-white/80 sm:text-base">
            {paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
          </div>
        ) : (
          <p className="mt-10 font-brand-mono text-sm leading-[1.75] text-white/80 sm:text-base">Документ готовится к публикации.</p>
        )}
        <Link href="/#footer" className="mt-12 inline-flex min-h-11 items-center gap-3 font-brand-mono text-sm underline underline-offset-4 hover:text-brand-red focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"><span aria-hidden="true">←</span> Вернуться на сайт</Link>
      </article>
    </main>
  );
}
