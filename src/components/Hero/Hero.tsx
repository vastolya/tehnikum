import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative min-h-svh bg-brand-ink">
      <Image
        src="/images/hero-kitchen.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-linear-to-b from-brand-ink/75 via-brand-ink/15 to-transparent" />
      <h1 className="sr-only">???????? ? ???? ??????</h1>
    </section>
  );
}
