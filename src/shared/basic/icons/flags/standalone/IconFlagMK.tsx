/**
 * **North Macedonia** 国旗。ISO: `MK`；只含该国 SVG，**勿手改**（`build-country-flags.mts` 生成）。
 * @see https://github.com/lipis/flag-icons
 */
import type { JSX } from "preact";

import { FlagImg } from "../FlagImg.tsx";
import type { CountryFlagComponentProps } from "../countryFlagTypes.ts";

const FLAG_SVG: string =
  '<svg xmlns="http://www.w3.org/2000/svg" id="flag-icons-mk" viewBox="0 0 512 512"><path fill="#d20000" d="M0 0h512v512H0z"/><path fill="#ffe600" d="M0 0h86.8L256 246.9 425.2 0H512L0 512h86.8L256 265.1 425.2 512H512zm512 204.8v102.4L0 204.8v102.4zM204.8 0 256 219.4 307.2 0zm0 512L256 292.6 307.2 512z"/><circle cx="256" cy="256" r="82.3" fill="#ffe600" stroke="#d20000" stroke-width="18.3"/></svg>';

/**
 * North Macedonia — 1:1 独立文件；只 import 本文件不会打入他国。
 */
export function IconFlagMK(props?: CountryFlagComponentProps): JSX.Element {
  return <FlagImg svg={FLAG_SVG} {...props} />;
}
