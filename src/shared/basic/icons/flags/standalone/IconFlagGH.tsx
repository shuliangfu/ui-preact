/**
 * **Ghana** 国旗。ISO: `GH`；只含该国 SVG，**勿手改**（`build-country-flags.mts` 生成）。
 * @see https://github.com/lipis/flag-icons
 */
import type { JSX } from "preact";

import { FlagImg } from "../FlagImg.tsx";
import type { CountryFlagComponentProps } from "../countryFlagTypes.ts";

const FLAG_SVG: string =
  '<svg xmlns="http://www.w3.org/2000/svg" id="flag-icons-gh" viewBox="0 0 512 512"><path fill="#006b3f" d="M0 0h512v512H0z"/><path fill="#fcd116" d="M0 0h512v341.3H0z"/><path fill="#ce1126" d="M0 0h512v170.7H0z"/><path fill="#000001" d="m256 170.7 55.5 170.6L166.3 236h179.4L200.6 341.3z"/></svg>';

/**
 * Ghana — 1:1 独立文件；只 import 本文件不会打入他国。
 */
export function IconFlagGH(props?: CountryFlagComponentProps): JSX.Element {
  return <FlagImg svg={FLAG_SVG} {...props} />;
}
