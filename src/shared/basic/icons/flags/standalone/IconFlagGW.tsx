/**
 * **Guinea-Bissau** 国旗。ISO: `GW`；只含该国 SVG，**勿手改**（`build-country-flags.mts` 生成）。
 * @see https://github.com/lipis/flag-icons
 */
import type { JSX } from "preact";

import { FlagImg } from "../FlagImg.tsx";
import type { CountryFlagComponentProps } from "../countryFlagTypes.ts";

const FLAG_SVG: string =
  '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="flag-icons-gw" viewBox="0 0 512 512"><path fill="#ce1126" d="M0 0h160v512H0z"/><path fill="#fcd116" d="M160 0h352v256H160z"/><path fill="#009e49" d="M160 256h352v256H160z"/><g transform="translate(-46.2 72.8)scale(.7886)"><g id="gw-b" transform="matrix(80 0 0 80 160 240)"><path id="gw-a" fill="#000001" d="M0-1v1h.5" transform="rotate(18 0 -1)"/><use xlink:href="#gw-a" width="100%" height="100%" transform="scale(-1 1)"/></g><use xlink:href="#gw-b" width="100%" height="100%" transform="rotate(72 160 240)"/><use xlink:href="#gw-b" width="100%" height="100%" transform="rotate(144 160 240)"/><use xlink:href="#gw-b" width="100%" height="100%" transform="rotate(-144 160 240)"/><use xlink:href="#gw-b" width="100%" height="100%" transform="rotate(-72 160 240)"/></g></svg>';

/**
 * Guinea-Bissau — 1:1 独立文件；只 import 本文件不会打入他国。
 */
export function IconFlagGW(props?: CountryFlagComponentProps): JSX.Element {
  return <FlagImg svg={FLAG_SVG} {...props} />;
}
