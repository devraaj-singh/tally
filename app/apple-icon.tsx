import { renderIcon } from "./icon-art";

export const contentType = "image/png";
export const size = { width: 180, height: 180 };

// iOS applies its own corner mask, so render full-bleed.
export default function AppleIcon() {
  return renderIcon(180, false);
}
