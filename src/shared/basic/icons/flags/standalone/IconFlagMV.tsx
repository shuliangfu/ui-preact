/**
 * **Maldives** 国旗。ISO: `MV`；只含该国 SVG，**勿手改**（`build-country-flags.mts` 生成）。
 * @see https://github.com/lipis/flag-icons
 */
import type { JSX } from "preact";

import { FlagImg } from "../FlagImg.tsx";
import type { CountryFlagComponentProps } from "../countryFlagTypes.ts";

const FLAG_SVG: string =
  '<svg xmlns="http://www.w3.org/2000/svg" id="flag-icons-mv" viewBox="0 0 512 512"><path fill="#d21034" d="M0 0h512v512H0z"/><path fill="#007e3a" d="M128 128h256v256H128z"/><circle cx="288" cy="256" r="85.3" fill="#fff"/><ellipse cx="308.6" cy="256" fill="#007e3a" rx="73.9" ry="85.3"/></svg>';

/**
 * Maldives — 1:1 独立文件；只 import 本文件不会打入他国。
 */
export function IconFlagMV(props?: CountryFlagComponentProps): JSX.Element {
  return <FlagImg svg={FLAG_SVG} {...props} />;
}
