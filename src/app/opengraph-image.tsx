import { ImageResponse } from "next/og";

export const alt = "Memory Jar — Your Digital Journal";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
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
          background: "linear-gradient(160deg, #FAF6F1 0%, #F0E8DE 50%, #EDE6DC 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <span style={{ fontSize: 72, marginBottom: 16 }}>🫙</span>
        <div style={{ fontSize: 56, fontWeight: 700, color: "#3D3530", marginBottom: 12 }}>
          Memory Jar
        </div>
        <div style={{ fontSize: 28, color: "#5C5248", maxWidth: 600, textAlign: "center" }}>
          Your digital journal — preserve your story, one day at a time.
        </div>
      </div>
    ),
    { ...size }
  );
}
