import { ImageResponse } from "next/og";

// Shared monogram: white "T" on emerald. Rendered by next/og (wasm, no native deps).
export function renderIcon(size: number, rounded = true) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#059669",
          color: "#ffffff",
          fontSize: size * 0.62,
          fontWeight: 700,
          borderRadius: rounded ? size * 0.22 : 0,
        }}
      >
        T
      </div>
    ),
    { width: size, height: size },
  );
}
