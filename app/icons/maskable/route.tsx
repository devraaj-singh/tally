import { renderIcon } from "../../icon-art";

// Full-bleed so the OS mask can crop to any shape; the T sits in the safe zone.
export function GET() {
  return renderIcon(512, false);
}
