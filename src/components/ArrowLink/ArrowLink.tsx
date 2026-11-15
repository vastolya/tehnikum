import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type SharedProps = {
  children: ReactNode;
  className?: string;
};

type ArrowLinkProps = SharedProps & (
  | ({ href: string } & Omit<ComponentProps<typeof Link>, "children" | "className" | "href">)
  | ({ href?: never } & Omit<ComponentProps<"button">, "children" | "className">)
);

export default function ArrowLink(props: ArrowLinkProps) {
  const { children, className = "", ...rest } = props;
  const classes = `group inline-flex min-h-11 cursor-pointer items-center gap-3 font-brand-mono text-sm leading-relaxed text-current focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current ${className}`;
  const content = <>
    <span className="underline underline-offset-4">{children}</span>
    <span aria-hidden="true" className="inline-block transition-transform duration-200 ease-out group-hover:translate-x-1.5 group-focus-visible:translate-x-1.5 motion-reduce:transition-none">→</span>
  </>;

  if (rest.href !== undefined) {
    return <Link {...rest} className={classes}>{content}</Link>;
  }

  return <button type="button" {...rest} className={classes}>{content}</button>;
}
