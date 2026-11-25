import Link from "next/link";
import type { RefObject } from "react";
import ActionButton from "./ActionButton";
import CausticBackground from "./CausticBackground";

export type ContactKind = "franchise" | "partners";

export default function ContactDialog({ dialogRef, kind, onClose }: { dialogRef: RefObject<HTMLDialogElement | null>; kind: ContactKind; onClose: () => void }) {
  const partners = kind === "partners";
  const label = partners ? "Отправить" : "Обсудить франшизу";
  const fields = [
    { name: "name", label: "Имя и фамилия", type: "text", autoComplete: "name" },
    partners ? { name: "company", label: "Компания", type: "text", autoComplete: "organization" } : { name: "city", label: "Планируемый город открытия", type: "text", autoComplete: "address-level2" },
    { name: "phone", label: "Телефон", type: "tel", autoComplete: "tel" },
    { name: "email", label: "Электронная почта", type: "email", autoComplete: "email" },
  ];
  return <dialog ref={dialogRef} aria-labelledby="contact-title" onCancel={(event) => { event.preventDefault(); onClose(); }} className="group/contact fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none overflow-hidden border-0 bg-black p-0 text-white backdrop:bg-transparent">
    <CausticBackground />
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-brand-red opacity-0 mix-blend-color transition-opacity duration-700 group-has-[[data-contact-submit]:hover]/contact:opacity-35 motion-reduce:transition-none" />
    <div className="relative h-full overflow-y-auto overscroll-contain md:mr-24">
      <div className="mx-auto grid min-h-full max-w-7xl content-center gap-12 px-page-gutter py-24 md:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] md:items-center md:gap-16 lg:gap-24">
        <div className="max-w-md"><h2 id="contact-title" className="text-balance font-brand text-[clamp(2rem,2.8vw,3rem)] leading-[1.2] font-light">{partners ? "Давайте сотрудничать" : "Откройте Техникум в вашем городе"}</h2>{partners && <p className="mt-6 max-w-xs font-brand-mono text-sm leading-[1.75] text-white/80">Расскажите о себе и вашей идее в форме.</p>}</div>
        <form className="grid gap-x-8 gap-y-8 font-brand-mono text-base leading-relaxed sm:grid-cols-2 sm:gap-y-10" onSubmit={(event) => event.preventDefault()}>
          {fields.map(({ label: fieldLabel, ...field }) => <input key={field.name} required {...field} aria-label={fieldLabel} placeholder={fieldLabel} className="min-h-14 w-full border-b border-white/60 bg-transparent py-3 outline-none placeholder:text-white placeholder-shown:caret-transparent focus:border-brand-red focus:placeholder:text-white/50 autofill:bg-clip-text autofill:[-webkit-text-fill-color:white]" />)}
          <textarea name="message" aria-label="Текст сообщения" placeholder="Текст сообщения" rows={3} className="w-full resize-y border-b border-white/60 bg-transparent py-3 outline-none placeholder:text-white placeholder-shown:caret-transparent focus:border-brand-red focus:placeholder:text-white/50 sm:col-span-2" />
          <ActionButton type="submit" data-contact-submit className="min-h-14 sm:col-span-2">{label}</ActionButton>
          <p className="-mt-5 font-brand-mono text-xs leading-relaxed text-white/50 sm:col-span-2 sm:-mt-7">Нажимая «{label}», я даю согласие на обработку <Link href="/legal/personal-data-policy" className="underline underline-offset-2 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">персональных данных</Link></p>
        </form>
      </div>
    </div>
    <button type="button" onClick={onClose} aria-label="Закрыть форму" className="absolute top-4 right-4 grid size-14 cursor-pointer place-items-center bg-transparent text-white transition-colors hover:text-brand-red focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-white motion-reduce:transition-none md:top-1/2 md:right-5 md:-translate-y-1/2"><svg aria-hidden="true" width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="m4 4 24 24M28 4 4 28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg></button>
  </dialog>;
}
