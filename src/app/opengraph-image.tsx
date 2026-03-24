import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Blog Pick - 블로그 & 쓰레드 자동 생성";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

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
          background: "#ffffff",
          position: "relative",
        }}
      >
        {/* 상단 블루 라인 */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "6px",
            background: "linear-gradient(90deg, #2563eb, #60a5fa)",
          }}
        />

        {/* 로고 영역 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "64px",
              height: "64px",
              borderRadius: "14px",
              background: "#2563eb",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 20h9" />
              <path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z" />
            </svg>
          </div>
          <span
            style={{
              fontSize: "56px",
              fontWeight: 800,
              color: "#111827",
              letterSpacing: "-1.5px",
            }}
          >
            Blog Pick
          </span>
        </div>

        {/* 구분선 */}
        <div
          style={{
            width: "60px",
            height: "3px",
            background: "#2563eb",
            borderRadius: "2px",
            marginBottom: "20px",
          }}
        />

        {/* 설명 */}
        <span
          style={{
            fontSize: "24px",
            color: "#6b7280",
            fontWeight: 400,
            letterSpacing: "0.5px",
          }}
        >
          블로그 & 쓰레드 자동 생성
        </span>

        {/* 하단 URL */}
        <span
          style={{
            position: "absolute",
            bottom: "32px",
            fontSize: "16px",
            color: "#d1d5db",
            letterSpacing: "1px",
          }}
        >
          blogpick.vercel.app
        </span>
      </div>
    ),
    { ...size }
  );
}
