import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "Phosra — Investor Data Room"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg, #0D1B2A 0%, #132D46 40%, #0A1929 100%)",
          position: "relative",
        }}
      >
        {/* Top accent line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: "linear-gradient(90deg, transparent 10%, #00D47E 50%, transparent 90%)",
            display: "flex",
          }}
        />

        {/* Subtle corner glow */}
        <div
          style={{
            position: "absolute",
            top: -100,
            right: -100,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0,212,126,0.08) 0%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* Burst mark */}
        <svg
          width="100"
          height="110"
          viewBox="0 0 66 73"
          fill="none"
        >
          <path d="M32.5152 53.8069C29.9079 59.9238 29.9079 66.0408 32.5152 72.1577C35.1225 66.0408 35.1225 59.9238 32.5152 53.8069Z" fill="#00D47E"/>
          <path d="M32.5152 0C29.9079 6.11695 29.9079 12.2339 32.5152 18.3508C35.1225 12.2339 35.1225 6.11695 32.5152 0Z" fill="#00D47E"/>
          <path d="M40.5035 51.4317C41.0019 58.1757 43.7583 63.4731 48.7727 67.324C48.2743 60.5801 45.5179 55.2826 40.5035 51.4317Z" fill="#00D47E"/>
          <path d="M16.2576 4.8338C16.756 11.5778 19.5124 16.8752 24.5268 20.7261C24.0284 13.9822 21.272 8.68471 16.2576 4.8338Z" fill="#00D47E"/>
          <path d="M46.3512 44.9432C49.8218 50.5071 54.596 53.5656 60.6739 54.1187C57.2033 48.5547 52.4291 45.4962 46.3512 44.9432Z" fill="#00D47E"/>
          <path d="M4.35619 18.0396C7.82677 23.6036 12.601 26.6621 18.6789 27.2151C15.2083 21.6511 10.4341 18.5926 4.35619 18.0396Z" fill="#00D47E"/>
          <path d="M48.4919 36.0795C54.0047 38.9725 59.5175 38.9725 65.0303 36.0795C59.5175 33.1864 54.0047 33.1864 48.4919 36.0795Z" fill="#00D47E"/>
          <path d="M0 36.0792C5.51282 38.9723 11.0256 38.9723 16.5385 36.0792C11.0256 33.1862 5.51282 33.1862 0 36.0792Z" fill="#00D47E"/>
          <path d="M46.3514 27.2154C52.4293 26.6624 57.2035 23.6039 60.6741 18.0399C54.5962 18.5929 49.822 21.6514 46.3514 27.2154Z" fill="#00D47E"/>
          <path d="M4.35626 54.1187C10.4341 53.5657 15.2084 50.5072 18.679 44.9432C12.6011 45.4963 7.82684 48.5548 4.35626 54.1187Z" fill="#00D47E"/>
          <path d="M40.5037 20.7286C45.5181 16.8777 48.2745 11.5802 48.7729 4.83625C43.7585 8.68715 41.0021 13.9846 40.5037 20.7286Z" fill="#00D47E"/>
          <path d="M16.2579 67.3262C21.2722 63.4753 24.0286 58.1779 24.527 51.4339C19.5126 55.2848 16.7562 60.5822 16.2579 67.3262Z" fill="#00D47E"/>
        </svg>

        {/* Phosra wordmark */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: "#FFFFFF",
            marginTop: 28,
            letterSpacing: "-0.02em",
            display: "flex",
          }}
        >
          Phosra
        </div>

        {/* Divider */}
        <div
          style={{
            width: 60,
            height: 2,
            background: "#00D47E",
            marginTop: 24,
            marginBottom: 24,
            borderRadius: 1,
            display: "flex",
          }}
        />

        {/* Subtitle */}
        <div
          style={{
            fontSize: 30,
            color: "rgba(255,255,255,0.85)",
            fontWeight: 500,
            display: "flex",
          }}
        >
          Investor Data Room
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 20,
            color: "#00D47E",
            marginTop: 12,
            fontWeight: 400,
            display: "flex",
          }}
        >
          You&apos;ve been invited to view confidential materials
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 56,
            background: "rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <div
            style={{
              fontSize: 15,
              color: "rgba(255,255,255,0.5)",
              display: "flex",
            }}
          >
            phosra.com
          </div>
          <div
            style={{
              fontSize: 15,
              color: "rgba(255,255,255,0.2)",
              display: "flex",
            }}
          >
            |
          </div>
          <div
            style={{
              fontSize: 15,
              color: "rgba(255,255,255,0.5)",
              display: "flex",
            }}
          >
            Pre-Seed Round
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
