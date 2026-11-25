import ArrowLink from "@/components/ArrowLink/ArrowLink";
import HeroShade from "@/components/Hero/HeroShade";
import MovingBackground from "@/components/Hero/MovingBackground";
import ActionButton from "./ActionButton";

export default function Franchise({ onDetails, onContact }: { onDetails: () => void; onContact: () => void }) {
  return (
    <div className="relative isolate flex h-full flex-col bg-black">
      <MovingBackground src="/images/slides/franchise.webp" position="60% center" />
      <HeroShade />
      <div className="relative z-10 flex min-h-0 flex-1 flex-col justify-center px-page-gutter pt-36 pb-24 max-sm:pt-40">
        <div className="max-w-xl">
          <h2 data-reveal className="text-balance font-brand text-[clamp(1.875rem,min(4vw,6dvh),3.5rem)] leading-[1.2] font-light">Техникум<br />в вашем городе</h2>
          <p data-reveal className="mt-6 max-w-md font-brand-mono text-sm leading-[1.75] text-white/90 sm:text-base">Откройте «Техникум» в своём городе. Городское гастробистро White Rabbit Family: завтраки, кофе, нескучная еда, десерты и коктейли на каждый день.</p>
          <div data-reveal className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-3">
            <ActionButton type="button" onClick={onContact} arrow>Обсудить франшизу</ActionButton>
            <ArrowLink onClick={onDetails}>О франшизе White Rabbit Family</ArrowLink>
          </div>
        </div>
      </div>
    </div>
  );
}
