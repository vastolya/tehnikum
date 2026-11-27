import Image from "next/image";
import Link from "next/link";
import CausticBackground from "@/components/Franchise/CausticBackground";
import { legalDocuments } from "@/data/legal";

export default function ClosingSlide() {
  return (
    <footer className="relative z-10 flex h-full min-h-0 flex-col overflow-y-auto bg-black px-page-gutter pt-36 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-white max-sm:pt-40">
      <CausticBackground />
      <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center gap-10 py-8 sm:gap-14">
        <h2 data-reveal className="w-full max-w-[1400px] px-[7%]">
          <span className="sr-only">Техникум — сеть бистро</span>
          <Image src="/brand/tehnikum-logo-white.svg" alt="" width={1843} height={227} className="h-auto w-full" />
        </h2>
        <Link href="/map" className="inline-flex min-h-12 items-center justify-center gap-4 bg-brand-red px-6 py-3 font-brand text-xl leading-none font-light text-white transition-colors hover:bg-brand-red/85 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white motion-reduce:transition-none">
          <span className="[text-box:trim-both_cap_alphabetic]">Выбрать бистро</span>
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0"><path d="M3 13 13 3M3 3h10v10" stroke="currentColor" strokeWidth="1.2" /></svg>
        </Link>
      </div>
      <nav aria-label="Юридическая информация" className="relative flex shrink-0 flex-wrap justify-center gap-x-6 gap-y-2 font-brand-mono text-xs leading-relaxed text-white/70">
        {legalDocuments.map((document) => (
          <Link key={document.slug} href={`/legal/${document.slug}`} className="py-1 underline decoration-white/30 underline-offset-4 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white motion-reduce:transition-none">
            {document.title}
          </Link>
        ))}
      </nav>
    </footer>
  );
}
