import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative isolate flex h-full min-h-0 flex-col bg-black">
      <Image
        src="/images/hero-kitchen.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 bg-linear-to-b from-black/75 via-black/30 to-black/85" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 bg-linear-to-r from-black/90 via-black/60 to-black/10" />
      <div className="relative z-10 flex min-h-0 w-full flex-1 flex-col px-page-gutter pt-36 pb-24 text-white max-sm:pt-40">
        <div className="flex min-h-0 max-w-3xl flex-1 flex-col items-start justify-center">
          <h1 data-reveal id="hero-title" className="text-balance font-brand text-[clamp(1.875rem,min(4vw,6dvh),3.5rem)] leading-[1.2] font-light [text-shadow:0_2px_12px_rgba(0,0,0,0.75)]">
            Демократичное гастробистро на каждый день
          </h1>
          <p data-reveal className="mt-6 max-w-md font-brand-mono text-sm leading-[1.75] text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.8)] sm:text-base">
            Завтраки, кофе, нескучная еда, десерты и коктейли. Честно. Модно. Доступно.
          </p>
          <Link data-reveal href="/map" className="mt-8 inline-flex min-h-12 items-center justify-center gap-4 bg-brand-red px-6 py-3 font-brand text-xl leading-none font-light text-white transition-colors hover:bg-brand-red/85 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white motion-reduce:transition-none">
            <span className="[text-box:trim-both_cap_alphabetic]">Выбрать бистро</span>
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0"><path d="M3 13 13 3M3 3h10v10" stroke="currentColor" strokeWidth="1.2" /></svg>
          </Link>
        </div>
      </div>
      <div className="pointer-events-none absolute right-page-gutter bottom-8 z-10 flex items-center gap-2 font-brand text-sm leading-none font-light text-white sm:bottom-[12dvh]">
        <span>Прокрутка</span>
        <svg aria-hidden="true" width="12" height="8" viewBox="0 0 12 8" fill="none" className="shrink-0 motion-safe:animate-scroll-hint">
          <path d="m1 1 5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </section>
  );
}
