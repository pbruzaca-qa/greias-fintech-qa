import React from "react";

const BACKGROUND_STARS: Array<{
  cx: number;
  cy: number;
  r: number;
  fill: string;
  opacity: number;
}> = [
  { cx: 48, cy: 92, r: 0.9, fill: "#A6A29A", opacity: 0.34 },
  { cx: 88, cy: 214, r: 0.8, fill: "#8E8B85", opacity: 0.3 },
  { cx: 128, cy: 368, r: 0.95, fill: "#D8D4CC", opacity: 0.36 },
  { cx: 74, cy: 524, r: 0.75, fill: "#8E8B85", opacity: 0.28 },
  { cx: 146, cy: 642, r: 1.0, fill: "#D8D4CC", opacity: 0.38 },
  { cx: 108, cy: 794, r: 0.85, fill: "#A6A29A", opacity: 0.32 },
  { cx: 214, cy: 132, r: 0.85, fill: "#A6A29A", opacity: 0.32 },
  { cx: 248, cy: 284, r: 0.95, fill: "#D8D4CC", opacity: 0.36 },
  { cx: 198, cy: 446, r: 0.75, fill: "#8E8B85", opacity: 0.28 },
  { cx: 268, cy: 588, r: 0.9, fill: "#A6A29A", opacity: 0.34 },
  { cx: 232, cy: 734, r: 0.8, fill: "#8E8B85", opacity: 0.3 },
  { cx: 318, cy: 92, r: 1.0, fill: "#D8D4CC", opacity: 0.38 },
  { cx: 344, cy: 236, r: 0.8, fill: "#8E8B85", opacity: 0.3 },
  { cx: 306, cy: 408, r: 0.9, fill: "#A6A29A", opacity: 0.34 },
  { cx: 362, cy: 648, r: 0.85, fill: "#A6A29A", opacity: 0.32 },
  { cx: 336, cy: 818, r: 0.95, fill: "#D8D4CC", opacity: 0.36 },
  { cx: 416, cy: 158, r: 0.85, fill: "#A6A29A", opacity: 0.32 },
  { cx: 442, cy: 332, r: 0.95, fill: "#D8D4CC", opacity: 0.34 },
  { cx: 404, cy: 512, r: 0.8, fill: "#8E8B85", opacity: 0.3 },
  { cx: 468, cy: 702, r: 0.9, fill: "#A6A29A", opacity: 0.34 },
  { cx: 492, cy: 86, r: 0.8, fill: "#8E8B85", opacity: 0.3 },
  { cx: 518, cy: 248, r: 0.95, fill: "#D8D4CC", opacity: 0.36 },
  { cx: 492, cy: 448, r: 0.75, fill: "#8E8B85", opacity: 0.28 },
  { cx: 564, cy: 162, r: 1.0, fill: "#D8D4CC", opacity: 0.38 },
  { cx: 618, cy: 454, r: 0.85, fill: "#A6A29A", opacity: 0.32 },
  { cx: 616, cy: 548, r: 0.8, fill: "#8E8B85", opacity: 0.3 },
  { cx: 634, cy: 764, r: 0.85, fill: "#A6A29A", opacity: 0.32 },
  { cx: 656, cy: 104, r: 1.05, fill: "#D8D4CC", opacity: 0.4 },
  { cx: 678, cy: 672, r: 0.9, fill: "#A6A29A", opacity: 0.34 },
  { cx: 704, cy: 396, r: 0.75, fill: "#8E8B85", opacity: 0.28 },
  { cx: 736, cy: 794, r: 0.95, fill: "#D8D4CC", opacity: 0.36 },
  { cx: 786, cy: 184, r: 0.85, fill: "#A6A29A", opacity: 0.32 },
  { cx: 814, cy: 368, r: 0.9, fill: "#A6A29A", opacity: 0.34 },
  { cx: 834, cy: 112, r: 0.85, fill: "#A6A29A", opacity: 0.32 },
  { cx: 842, cy: 492, r: 0.95, fill: "#D8D4CC", opacity: 0.36 },
  { cx: 874, cy: 676, r: 1.0, fill: "#D8D4CC", opacity: 0.38 },
  { cx: 912, cy: 208, r: 0.85, fill: "#A6A29A", opacity: 0.32 },
  { cx: 924, cy: 818, r: 0.85, fill: "#A6A29A", opacity: 0.3 },
  { cx: 964, cy: 114, r: 0.95, fill: "#D8D4CC", opacity: 0.36 },
  { cx: 978, cy: 428, r: 0.85, fill: "#A6A29A", opacity: 0.32 },
  { cx: 1014, cy: 604, r: 0.95, fill: "#D8D4CC", opacity: 0.36 },
  { cx: 1068, cy: 242, r: 0.8, fill: "#8E8B85", opacity: 0.3 },
  { cx: 1094, cy: 488, r: 0.95, fill: "#D8D4CC", opacity: 0.34 },
  { cx: 1118, cy: 148, r: 1.0, fill: "#D8D4CC", opacity: 0.38 },
  { cx: 1142, cy: 738, r: 0.85, fill: "#A6A29A", opacity: 0.32 },
  { cx: 1178, cy: 344, r: 0.9, fill: "#A6A29A", opacity: 0.34 },
  { cx: 1218, cy: 644, r: 0.95, fill: "#D8D4CC", opacity: 0.36 },
  { cx: 1246, cy: 218, r: 0.8, fill: "#8E8B85", opacity: 0.3 },
  { cx: 1276, cy: 118, r: 1.05, fill: "#D8D4CC", opacity: 0.4 },
  { cx: 1298, cy: 468, r: 0.9, fill: "#A6A29A", opacity: 0.34 },
  { cx: 1328, cy: 314, r: 0.85, fill: "#A6A29A", opacity: 0.32 },
  { cx: 1372, cy: 598, r: 1.0, fill: "#D8D4CC", opacity: 0.36 },
  { cx: 1392, cy: 738, r: 0.85, fill: "#A6A29A", opacity: 0.32 },
];

export function ConstellationBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 select-none overflow-hidden"
    >
      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        className="h-full w-full"
      >
        <defs>
          <radialGradient id="greias-backdrop-star-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F2EFE9" stopOpacity="0.26" />
            <stop offset="50%" stopColor="#D8D4CC" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#0A0A0A" stopOpacity="0" />
          </radialGradient>
        </defs>

        {BACKGROUND_STARS.map((star, index) => (
          <circle
            key={index}
            cx={star.cx}
            cy={star.cy}
            r={star.r}
            fill={star.fill}
            opacity={star.opacity}
          />
        ))}

        {/* Primary Perseus stars with whisper-thin, broken/fading guide lines */}
        <g>
          <path
            d="M756 142L714 210"
            stroke="#8E8B85"
            strokeOpacity="0.11"
            strokeWidth="0.45"
            strokeLinecap="round"
            strokeDasharray="6 9 3 7"
          />
          <path
            d="M706 222L664 298"
            stroke="#8E8B85"
            strokeOpacity="0.12"
            strokeWidth="0.45"
            strokeLinecap="round"
            strokeDasharray="11 8 4 10"
          />
          <path
            d="M651 318L594 370"
            stroke="#8E8B85"
            strokeOpacity="0.11"
            strokeWidth="0.45"
            strokeLinecap="round"
            strokeDasharray="8 7 3 8"
          />
          <path
            d="M585 388L536 576"
            stroke="#8E8B85"
            strokeOpacity="0.11"
            strokeWidth="0.45"
            strokeLinecap="round"
            strokeDasharray="12 10 4 9"
          />
          <path
            d="M531 604L522 686"
            stroke="#8E8B85"
            strokeOpacity="0.1"
            strokeWidth="0.45"
            strokeLinecap="round"
            strokeDasharray="7 8 3 7"
          />
          <path
            d="M526 710L546 760"
            stroke="#8E8B85"
            strokeOpacity="0.1"
            strokeWidth="0.45"
            strokeLinecap="round"
            strokeDasharray="5 8"
          />

          <path
            d="M672 310L712 313"
            stroke="#8E8B85"
            strokeOpacity="0.1"
            strokeWidth="0.45"
            strokeLinecap="round"
            strokeDasharray="5 7"
          />
          <path
            d="M732 312L826 305"
            stroke="#8E8B85"
            strokeOpacity="0.09"
            strokeWidth="0.45"
            strokeLinecap="round"
            strokeDasharray="9 11 4 9"
          />
          <path
            d="M724 326L738 426"
            stroke="#8E8B85"
            strokeOpacity="0.11"
            strokeWidth="0.45"
            strokeLinecap="round"
            strokeDasharray="8 9 3 8"
          />
          <path
            d="M742 452L758 542"
            stroke="#8E8B85"
            strokeOpacity="0.11"
            strokeWidth="0.45"
            strokeLinecap="round"
            strokeDasharray="10 8 3 9"
          />

          <circle cx="659" cy="309" r="16" fill="url(#greias-backdrop-star-glow)" />
          <circle cx="760" cy="556" r="15" fill="url(#greias-backdrop-star-glow)" />

          <circle cx="764" cy="132" r="1.5" fill="#D8D4CC" opacity="0.42" />
          <circle cx="710" cy="212" r="1.65" fill="#D8D4CC" opacity="0.46" />
          <circle cx="659" cy="309" r="2.4" fill="#F2EFE9" opacity="0.58" />
          <circle cx="722" cy="313" r="1.45" fill="#D8D4CC" opacity="0.42" />
          <circle cx="840" cy="304" r="1.35" fill="#A6A29A" opacity="0.38" />
          <circle cx="588" cy="376" r="1.65" fill="#D8D4CC" opacity="0.46" />
          <circle cx="739" cy="439" r="1.35" fill="#A6A29A" opacity="0.38" />
          <circle cx="760" cy="556" r="2.2" fill="#F2EFE9" opacity="0.56" />
          <circle cx="533" cy="590" r="1.8" fill="#D8D4CC" opacity="0.48" />
          <circle cx="521" cy="699" r="1.55" fill="#D8D4CC" opacity="0.42" />
          <circle cx="550" cy="771" r="1.7" fill="#D8D4CC" opacity="0.46" />
        </g>
      </svg>
    </div>
  );
}