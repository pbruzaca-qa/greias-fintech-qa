import React from "react";

interface EyeLogoProps {
  className?: string;
}

export function EyeLogo({ className = "w-7 h-7" }: EyeLogoProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Outer orbital arcs */}
      <path
        d="M11 8.5C13.6 6.8 16.7 6 20 6C23.3 6 26.4 6.8 29 8.5"
        stroke="#F2EFE9"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeOpacity="0.85"
      />
      <path
        d="M11 31.5C13.6 33.2 16.7 34 20 34C23.3 34 26.4 33.2 29 31.5"
        stroke="#F2EFE9"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeOpacity="0.85"
      />
      {/* Eye contour */}
      <path
        d="M6.5 20C10.2 14.2 14.8 11.5 20 11.5C25.2 11.5 29.8 14.2 33.5 20C29.8 25.8 25.2 28.5 20 28.5C14.8 28.5 10.2 25.8 6.5 20Z"
        stroke="#F2EFE9"
        strokeWidth="1.35"
        strokeLinejoin="round"
      />
      {/* Sage green surgical pupil */}
      <circle cx="20" cy="20" r="2.9" fill="#9CB4A3" />
    </svg>
  );
}