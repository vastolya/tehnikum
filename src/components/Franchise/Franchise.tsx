import Image from "next/image";
import ArrowLink from "@/components/ArrowLink/ArrowLink";

export default function Franchise({ onDetails }: { onDetails: () => void }) {
  return (
    <div className="relative isolate flex h-full flex-col bg-black">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 md:right-[35%]">
        <Image src="/images/slides/franchise.webp" alt="" fill sizes="(min-width: 768px) 65vw, 100vw" className="object-cover object-[60%_center] md:[mask-image:linear-gradient(to_right,black_45%,transparent_100%)]" />
        <div className="absolute inset-0 bg-linear-to-b from-black/65 via-black/40 to-black md:from-black/35 md:via-black/10 md:to-black/60" />
      </div>
      <div className="relative z-10 flex min-h-0 flex-1 flex-col justify-center px-page-gutter pt-36 pb-24 max-sm:pt-40 md:pl-[51.4%]">
        <div className="max-w-xl">
          <p data-reveal className="w-fit border-b border-brand-red pb-1.5 font-brand-mono text-xs leading-relaxed text-white/80">Франшиза · White Rabbit Family</p>
          <h2 data-reveal className="mt-6 text-balance font-brand text-[clamp(1.875rem,min(4vw,6dvh),3.5rem)] leading-[1.2] font-light">Техникум<br />в вашем городе</h2>
          <p data-reveal className="mt-6 max-w-md font-brand-mono text-sm leading-[1.75] text-white/90 sm:text-base">Городское бистро от White Rabbit Family. Интересная гастрономия на каждый день, авторская кухня и живая атмосфера.</p>
          <div data-reveal className="mt-8 flex flex-wrap gap-x-5 gap-y-2 border-y border-white/20 py-4 font-brand-mono text-xs leading-relaxed text-white/80">
            <span>Завтраки</span><span>Кухня</span><span>Коктейли</span>
          </div>
          <div data-reveal className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-3">
            <a href="mailto:franchising@wrf.su?subject=Tehnikum" className="inline-flex min-h-12 items-center justify-center gap-4 bg-brand-red px-6 py-3 font-brand text-xl leading-none font-light text-white transition-colors hover:bg-brand-red/85 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white motion-reduce:transition-none">
              <span className="[text-box:trim-both_cap_alphabetic]">Обсудить франшизу</span>
              <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0"><path d="M3 13 13 3M3 3h10v10" stroke="currentColor" strokeWidth="1.2" /></svg>
            </a>
            <ArrowLink onClick={onDetails}>О формате</ArrowLink>
          </div>
        </div>
      </div>
    </div>
  );
}
