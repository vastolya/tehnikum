import Image from "next/image";

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
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 bg-linear-to-r from-black/70 via-black/20 to-transparent" />
      <div className="relative z-10 flex min-h-0 w-full flex-1 flex-col px-page-gutter pt-36 pb-24 text-white max-sm:pt-40">
        <div className="flex min-h-0 max-w-3xl flex-1 flex-col items-start justify-center">
          <h1 data-reveal id="hero-title" className="text-balance font-brand text-[clamp(1.875rem,min(4vw,6dvh),3.5rem)] leading-[1.2] font-light">
            Интересная гастрономия на каждый день
          </h1>
          <p data-reveal className="mt-6 max-w-md font-brand-mono text-sm leading-[1.75] text-white/90 sm:text-base">
            Понятная еда с необычными сочетаниями. Бистро, где легко пробовать новое и быть собой.
          </p>
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
