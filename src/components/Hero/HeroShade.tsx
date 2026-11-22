export default function HeroShade() {
  return <>
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 bg-linear-to-b from-black/75 via-black/30 to-black/85" />
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 bg-linear-to-r from-black/90 via-black/60 to-black/10" />
  </>;
}
