import type { ComponentProps, ReactNode } from "react";

export default function ActionButton({ children, arrow = false, className = "", ...props }: ComponentProps<"button"> & { children: ReactNode; arrow?: boolean }) {
  return <button {...props} className={`inline-flex min-h-12 cursor-pointer items-center justify-center gap-4 bg-brand-red px-6 py-3 font-brand text-xl leading-none font-light text-white transition-colors hover:bg-brand-red/85 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white motion-reduce:transition-none ${className}`}><span className="[text-box:trim-both_cap_alphabetic]">{children}</span>{arrow && <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0"><path d="M3 13 13 3M3 3h10v10" stroke="currentColor" strokeWidth="1.2" /></svg>}</button>;
}
