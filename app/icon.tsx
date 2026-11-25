import { renderIcon } from "./icon-art";

export const contentType = "image/png";
export const size = { width: 512, height: 512 };

export default function Icon() {
  return renderIcon(512);
}
