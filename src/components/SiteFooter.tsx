import React from "react";

export function SiteFooter() {
  return (
    <footer
      data-testid="site-footer"
      className="relative z-10 border-t border-graphite-700/70 bg-obsidian-950/85 backdrop-blur-[2px]"
    >
      <div className="mx-auto grid max-w-[1360px] grid-cols-1 items-center gap-2.5 px-4 py-4 text-center sm:px-8 lg:grid-cols-3 lg:gap-6">
        <p className="font-mono text-[11px] tracking-[0.04em] text-silver lg:text-left">
          <span>© 2026 Gréias Lab</span>
        </p>

        <p className="font-serif text-[13px] italic tracking-[0.01em] text-stone lg:text-center">
          <span>No single look is enough.</span>
        </p>

        <div className="lg:text-right">
          <a
            href="https://github.com/pbruzaca-qa/greias-fintech-qa"
            target="_blank"
            rel="noopener noreferrer"
            data-testid="footer-github-link"
            className="inline-block font-mono text-[11px] tracking-[0.04em] text-stone underline-offset-4 transition-colors hover:text-ivory hover:underline focus-visible:text-ivory focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sage"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}