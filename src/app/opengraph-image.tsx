import { ImageResponse } from "next/og";
import React from "react";

export const runtime = "edge";
export const alt = "GRÉIAS — Simulated Digital Bank for Fintech QA";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

const OG_STARS = [
  { cx: 88, cy: 76, r: 1.2, opacity: 0.36 },
  { cx: 196, cy: 148, r: 0.9, opacity: 0.28 },
  { cx: 342, cy: 62, r: 1.2, opacity: 0.36 },
  { cx: 486, cy: 112, r: 0.9, opacity: 0.28 },
  { cx: 618, cy: 74, r: 1.1, opacity: 0.34 },
  { cx: 742, cy: 136, r: 1.0, opacity: 0.3 },
  { cx: 912, cy: 64, r: 1.2, opacity: 0.36 },
  { cx: 1084, cy: 96, r: 1.0, opacity: 0.32 },
  { cx: 1146, cy: 238, r: 0.9, opacity: 0.28 },
  { cx: 1098, cy: 524, r: 1.1, opacity: 0.34 },
  { cx: 942, cy: 562, r: 0.9, opacity: 0.28 },
  { cx: 786, cy: 518, r: 1.1, opacity: 0.32 },
  { cx: 614, cy: 572, r: 1.0, opacity: 0.3 },
  { cx: 428, cy: 546, r: 0.9, opacity: 0.28 },
  { cx: 164, cy: 548, r: 1.1, opacity: 0.32 },
  { cx: 72, cy: 412, r: 0.9, opacity: 0.28 },
];

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#0A0A0A",
          color: "#F2EFE9",
          padding: "56px 68px",
          position: "relative",
        }}
      >
        {/* Outer editorial frame & subtle background starfield */}
        <svg
          width="1200"
          height="630"
          viewBox="0 0 1200 630"
          fill="none"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
          }}
        >
          <rect
            x="24"
            y="24"
            width="1152"
            height="582"
            stroke="#242424"
            strokeWidth="1"
          />
          {OG_STARS.map((star, index) => (
            <circle
              key={index}
              cx={star.cx}
              cy={star.cy}
              r={star.r}
              fill="#D8D4CC"
              fillOpacity={star.opacity}
            />
          ))}
        </svg>

        {/* Left editorial column */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "630px",
            height: "470px",
            position: "relative",
          }}
        >
          {/* Brand lockup with exact EyeLogo geometry */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <svg width="42" height="42" viewBox="0 0 40 40" fill="none">
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
              <path
                d="M6.5 20C10.2 14.2 14.8 11.5 20 11.5C25.2 11.5 29.8 14.2 33.5 20C29.8 25.8 25.2 28.5 20 28.5C14.8 28.5 10.2 25.8 6.5 20Z"
                stroke="#F2EFE9"
                strokeWidth="1.35"
                strokeLinejoin="round"
              />
              <circle cx="20" cy="20" r="2.9" fill="#9CB4A3" />
            </svg>
            <span
              style={{
                fontSize: 22,
                letterSpacing: 7,
                color: "#F2EFE9",
                marginLeft: 14,
              }}
            >
              GRÉIAS
            </span>
          </div>

          {/* Main editorial headline */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span
              style={{
                fontSize: 13,
                letterSpacing: 4,
                color: "#73706A",
                marginBottom: 22,
              }}
            >
              SIMULATE / EXPLORE / TEST / LEARN
            </span>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                fontSize: 56,
                fontWeight: 700,
                lineHeight: 1.08,
                color: "#F2EFE9",
              }}
            >
              <span>Banking, stripped</span>
              <span>to pure precision.</span>
            </div>

            <span
              style={{
                fontSize: 22,
                lineHeight: 1.45,
                color: "#A6A29A",
                marginTop: 22,
              }}
            >
              Simulated Digital Bank for Fintech QA Practice
            </span>
          </div>

          {/* Bottom QA capability bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              paddingTop: 18,
              borderTop: "1px solid #262626",
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: 9999,
                backgroundColor: "#9CB4A3",
              }}
            />
            <span
              style={{
                fontSize: 12,
                letterSpacing: 2,
                color: "#8E8B85",
                marginLeft: 12,
              }}
            >
              PIX & WIRE · SMART CARD · LIVE STATEMENT · CHAOS MONKEY
            </span>
          </div>
        </div>

        {/* Right card showcase */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "410px",
            position: "relative",
          }}
        >
          <div
            style={{
              width: "400px",
              height: "252px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              padding: "26px 28px",
              borderRadius: "14px",
              border: "1px solid rgba(216, 212, 204, 0.3)",
              backgroundImage:
                "linear-gradient(135deg, #1E1E1E 0%, #141414 55%, #0C0C0C 100%)",
              position: "relative",
            }}
          >
            {/* Card Perseus primary stars + scattered stars */}
            <svg
              width="210"
              height="180"
              viewBox="0 0 220 180"
              fill="none"
              style={{
                position: "absolute",
                right: 10,
                top: 18,
              }}
            >
              <path
                d="M130 19L121 32M117 39L109 54M104 61L93 71M89 78L78 120M77 129L74 147M75 155L80 165M111 58L119 59M126 59L146 57M123 63L126 85M127 93L130 112"
                stroke="#A6A29A"
                strokeOpacity="0.28"
                strokeWidth="0.55"
                strokeLinecap="round"
              />
              <circle cx="132" cy="16" r="1.2" fill="#D8D4CC" />
              <circle cx="119" cy="35" r="1.3" fill="#D8D4CC" />
              <circle cx="107" cy="58" r="2.2" fill="#F2EFE9" />
              <circle cx="122" cy="59" r="1.1" fill="#D8D4CC" />
              <circle cx="150" cy="57" r="1.1" fill="#A6A29A" />
              <circle cx="90" cy="74" r="1.4" fill="#D8D4CC" />
              <circle cx="126" cy="89" r="1.1" fill="#D8D4CC" />
              <circle cx="131" cy="117" r="2.0" fill="#F2EFE9" />
              <circle cx="77" cy="125" r="1.5" fill="#D8D4CC" />
              <circle cx="74" cy="151" r="1.3" fill="#D8D4CC" />
              <circle cx="81" cy="168" r="1.4" fill="#D8D4CC" />
              <circle cx="174" cy="76" r="0.8" fill="#8E8B85" />
              <circle cx="196" cy="108" r="0.8" fill="#8E8B85" />
              <circle cx="164" cy="146" r="0.7" fill="#73706A" />
              <circle cx="186" cy="36" r="0.75" fill="#8E8B85" />
            </svg>

            {/* Card header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                position: "relative",
              }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <svg width="26" height="26" viewBox="0 0 40 40" fill="none">
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
                  <path
                    d="M6.5 20C10.2 14.2 14.8 11.5 20 11.5C25.2 11.5 29.8 14.2 33.5 20C29.8 25.8 25.2 28.5 20 28.5C14.8 28.5 10.2 25.8 6.5 20Z"
                    stroke="#F2EFE9"
                    strokeWidth="1.35"
                    strokeLinejoin="round"
                  />
                  <circle cx="20" cy="20" r="2.9" fill="#9CB4A3" />
                </svg>
                <span
                  style={{
                    fontSize: 15,
                    letterSpacing: 4,
                    color: "#F2EFE9",
                    marginLeft: 10,
                  }}
                >
                  GRÉIAS
                </span>
              </div>
              <span
                style={{
                  fontSize: 10,
                  letterSpacing: 3,
                  color: "#A6A29A",
                }}
              >
                CARD
              </span>
            </div>

            {/* Metallic chip */}
            <div
              style={{
                width: "44px",
                height: "32px",
                borderRadius: "4px",
                border: "1px solid rgba(216, 212, 204, 0.5)",
                backgroundImage:
                  "linear-gradient(135deg, #B8B4AC 0%, #73706A 55%, #3A3A3A 100%)",
                position: "relative",
              }}
            />

            {/* Card credentials footer */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                position: "relative",
              }}
            >
              <span
                style={{
                  fontSize: 14,
                  letterSpacing: 3,
                  color: "#F2EFE9",
                  marginBottom: 8,
                }}
              >
                •••• •••• •••• 4821
              </span>
              <span
                style={{
                  fontSize: 12,
                  letterSpacing: 2,
                  color: "#D8D4CC",
                  marginBottom: 4,
                }}
              >
                PERSEU B.
              </span>
              <span
                style={{
                  fontSize: 10,
                  letterSpacing: 2,
                  color: "#73706A",
                }}
              >
                VALID THRU 08/30
              </span>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}