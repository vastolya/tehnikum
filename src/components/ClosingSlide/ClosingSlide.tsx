import Image from "next/image";
import Link from "next/link";
import { legalDocuments } from "@/data/legal";
import { navigationItems } from "@/data/navigation";

export default function ClosingSlide({ onNavigate }: { onNavigate: (id: string) => void }) {
  return (
    <footer onWheel={(event) => { const el = event.currentTarget; if ((event.deltaY > 0 && el.scrollTop + el.clientHeight < el.scrollHeight - 1) || (event.deltaY < 0 && el.scrollTop > 0)) event.stopPropagation(); }} onTouchStart={(event) => { if (event.currentTarget.scrollHeight > event.currentTarget.clientHeight) event.stopPropagation(); }} onTouchEnd={(event) => { if (event.currentTarget.scrollHeight > event.currentTarget.clientHeight) event.stopPropagation(); }} className="relative z-10 flex h-full min-h-0 flex-col overflow-y-auto bg-black px-page-gutter pt-36 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-white max-sm:pt-40 sm:pb-8">
      <div className="flex min-h-24 flex-1 flex-col items-center justify-center">
        <h2 data-reveal className="w-full max-w-[1400px] px-[7%] py-8">
          <span className="sr-only">Техникум — сеть бистро</span>
          <Image src="/brand/tehnikum-logo-white.svg" alt="" width={1843} height={227} className="h-auto w-full" />
        </h2>
      </div>
      <div className="grid shrink-0 grid-cols-2 gap-6 border-t border-white/25 py-6 font-brand-mono text-xs leading-relaxed sm:grid-cols-3">
        <nav aria-label="Разделы сайта" className="flex flex-col items-start gap-3">
          {navigationItems.map((item) => <a key={item.id} href={`/#${item.id}`} onClick={(event) => { if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); onNavigate(item.id); }} className="underline underline-offset-4 hover:text-brand-red">{item.label}</a>)}
        </nav>
        <div className="flex flex-col items-start gap-3">
          <Link href="/map" className="underline underline-offset-4 hover:text-brand-red">Выбрать бистро</Link>
          <Link href="/map" className="underline underline-offset-4 hover:text-brand-red">Меню: выбрать бистро</Link>
        </div>
        <div className="flex flex-col items-start gap-3">
          <span className="text-white/60">Москва, Большая Дмитровка</span>
          <a href="tel:+74991367336" className="underline underline-offset-4 hover:text-brand-red">+7 (499) 136-73-36</a>
          <a href="https://t.me/tehnikum_dmitrovka" className="underline underline-offset-4 hover:text-brand-red">Telegram Дмитровки ↗</a>
          <a href="mailto:franchising@wrf.su?subject=Tehnikum" className="underline underline-offset-4 hover:text-brand-red">Франчайзинг: franchising@wrf.su</a>
        </div>
      </div>
      <div className="grid shrink-0 grid-cols-1 items-start gap-x-8 gap-y-4 border-t border-white/25 pt-6 font-brand-mono text-[11px] leading-relaxed sm:grid-cols-2 sm:py-6 lg:grid-cols-[1.1fr_1fr_1.2fr_1fr]">
        <div>
          <p>© Техникум, {new Date().getFullYear()}</p>
          <details className="group relative mt-2 w-fit">
            <summary className="flex min-h-8 cursor-pointer list-none items-center gap-3 text-white/55 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white [&::-webkit-details-marker]:hidden">Юридическая информация <svg aria-hidden="true" width="10" height="6" viewBox="0 0 10 6" fill="none" className="transition-transform group-open:rotate-180 motion-reduce:transition-none"><path d="m1 1 4 4 4-4" stroke="currentColor" /></svg></summary>
            <div className="absolute bottom-full left-0 z-30 mb-3 w-[min(20rem,80vw)] border border-white/25 bg-black p-5 shadow-xl">
              <p className="text-white/65">Реквизиты уточняются.</p>
              <Link href="/legal/user-agreement" className="mt-4 inline-block underline underline-offset-4 hover:text-brand-red focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">Пользовательское соглашение</Link>
            </div>
          </details>
        </div>
        {legalDocuments.slice(0, 3).map((document) => <Link key={document.slug} href={`/legal/${document.slug}`} className="group inline-flex min-h-8 items-start py-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"><span className="bg-linear-to-r from-current to-current bg-size-[0%_1px] bg-left-bottom bg-no-repeat pb-1 transition-[background-size] duration-300 group-hover:bg-size-[100%_1px] group-focus-visible:bg-size-[100%_1px] motion-reduce:transition-none">{document.title}</span></Link>)}
      </div>
    </footer>
  );
}
