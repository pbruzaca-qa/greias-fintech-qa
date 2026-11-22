import Link from "next/link";
import React from "react";
import { GreiasCardVisual } from "@/components/GreiasCardVisual";

const PILLARS = [
  {
    number: "01",
    title: "INSTANT TRANSFERS",
    description: "Simulated Pix & wire flows with testable edge cases.",
    href: "/workspace?module=transfers",
  },
  {
    number: "02",
    title: "SMART CARD CONTROL",
    description: "Freeze, reveal credentials, and test invoice limits.",
    href: "/workspace?module=card",
  },
  {
    number: "03",
    title: "LIVE STATEMENT",
    description: "Real-time ledger with deterministic QA reset.",
    href: "/workspace?module=statement",
  },
];

export default function BankLandingPage() {
  return (
    <div className="flex min-h-[calc(100vh-58px)] flex-col justify-between bg-obsidian-950">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden border-b border-graphite-700/70 bg-gradient-to-b from-obsidian-900 via-obsidian-950 to-obsidian-950">
        <div className="mx-auto grid max-w-[1360px] grid-cols-1 items-center gap-12 px-4 py-14 sm:px-8 lg:grid-cols-12 lg:py-20">
          {/* Left Copy Column */}
          <div className="space-y-7 lg:col-span-6">
            <p className="font-mono text-[11px] tracking-[0.34em] text-ash uppercase">
              SIMULATE <span className="mx-1.5 text-graphite-600">/</span>{" "}
              EXPLORE <span className="mx-1.5 text-graphite-600">/</span> TEST{" "}
              <span className="mx-1.5 text-graphite-600">/</span> LEARN
            </p>

            <h1 className="font-serif text-4xl font-semibold leading-[1.04] tracking-tight text-ivory sm:text-6xl">
              Banking, stripped
              <br />
              to pure precision.
            </h1>

            <p className="max-w-lg font-serif text-lg leading-relaxed text-stone sm:text-xl">
              A fully simulated digital bank built for real-world fintech QA
              practice.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-1">
              <Link
                href="/open-account"
                data-testid="open-account-cta"
                className="inline-flex items-center gap-3 border border-ivory bg-ivory px-6 py-3 font-serif text-sm font-medium text-obsidian-900 transition-colors hover:bg-fillet"
              >
                <span>Open Digital Account</span>
                <span aria-hidden="true">→</span>
              </Link>

              <Link
                href="/workspace"
                data-testid="explore-card-cta"
                className="inline-flex items-center border border-graphite-700 bg-obsidian-900/70 px-6 py-3 font-serif text-sm text-ivory transition-colors hover:border-graphite-600 hover:bg-charcoal-800"
              >
                Explore Greias Card
              </Link>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <span className="h-px w-8 bg-graphite-700" aria-hidden="true" />
              <p className="font-mono text-[10px] tracking-[0.32em] text-ash uppercase">
                SAME LOGIC. A BRIGHTER TOMORROW.
              </p>
            </div>
          </div>

          {/* Right Card Showcase + Vertical Editorial Microtext */}
          <div className="relative flex items-center justify-center pb-8 lg:col-span-6 lg:justify-end lg:pr-14">
            <div className="w-full max-w-[450px]">
              <GreiasCardVisual
                holderName="PERSEU B."
                last4="4821"
                validThru="08/30"
                variant="hero"
              />
            </div>

            <div
              aria-hidden="true"
              className="pointer-events-none absolute right-0 top-0 hidden h-full flex-col items-end justify-between text-right font-mono text-[9px] leading-relaxed tracking-[0.26em] text-ash/80 uppercase xl:flex"
            >
              <div className="flex flex-col items-end gap-3">
                <span className="h-8 w-px bg-graphite-700" />
                <p className="max-w-[96px]">
                  A SAFER FINANCIAL TOMORROW IS A MORE CURIOUS ONE.
                </p>
                <span className="h-16 w-px bg-graphite-700" />
              </div>

              <p className="max-w-[80px] text-ash/70">
                BUILT FOR A BETTER PRACTICE WORLD.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* BOTTOM 3-PILLAR STRIP */}
      <section
        aria-label="Core simulated capabilities"
        className="bg-obsidian-900"
      >
        <div className="mx-auto grid max-w-[1360px] grid-cols-1 divide-y divide-graphite-700/70 px-4 sm:px-8 md:grid-cols-3 md:divide-x md:divide-y-0">
          {PILLARS.map((pillar) => (
            <Link
              key={pillar.number}
              href={pillar.href}
              data-testid={`pillar-${pillar.number}`}
              className="group flex items-start gap-6 py-8 transition-colors hover:bg-charcoal-850/50 md:px-6 md:first:pl-0 md:last:pr-0"
            >
              <span className="font-serif text-3xl leading-none text-sage sm:text-4xl">
                {pillar.number}
              </span>
              <div className="space-y-1.5">
                <h2 className="font-mono text-xs tracking-[0.22em] text-ivory uppercase group-hover:text-fillet">
                  {pillar.title}
                </h2>
                <p className="font-serif text-sm leading-relaxed text-stone">
                  {pillar.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}