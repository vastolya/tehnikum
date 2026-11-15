/** Reveal reading blocks in DOM order without splitting words or letters. */
export function revealText(container: Element): Animation[] {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return [];

  return Array.from(container.querySelectorAll<HTMLElement>("[data-reveal]")).map((element, index) => {
    const animation = element.animate(
      [{ opacity: 0, transform: "translateY(12px)" }, { opacity: 1, transform: "translateY(0)" }],
      { duration: 420, delay: 60 + index * 90, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "both" },
    );
    // Return control to regular styles once the entrance has finished.
    animation.finished.then(() => animation.cancel()).catch(() => {});
    return animation;
  });
}
