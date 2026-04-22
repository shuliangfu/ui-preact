/**
 * **Mauritania** 国旗。ISO: `MR`；只含该国 SVG，**勿手改**（`build-country-flags.mts` 生成）。
 * @see https://github.com/lipis/flag-icons
 */
import type { JSX } from "preact";

import { FlagImg } from "../FlagImg.tsx";
import type { CountryFlagComponentProps } from "../countryFlagTypes.ts";

const FLAG_SVG: string =
  '<svg xmlns="http://www.w3.org/2000/svg" id="flag-icons-mr" viewBox="0 0 512 512"><path fill="#cd2a3e" d="M0 0h512v512H0z"/><path fill="#006233" d="M0 76.8h512v358.4H0z"/><path fill="#ffc400" d="M416 164.9a160 160 0 0 1-320 0 165 165 0 0 0-5.4 41.8A165.4 165.4 0 1 0 416 165z" class="mr-st1"/><path fill="#ffc400" d="m256 100-14.4 44.3h-46.5l37.6 27.3-14.3 44.2 37.6-27.3 37.6 27.3-14.4-44.2 37.7-27.3h-46.5z"/></svg>';

/**
 * Mauritania — 1:1 独立文件；只 import 本文件不会打入他国。
 */
export function IconFlagMR(props?: CountryFlagComponentProps): JSX.Element {
  return <FlagImg svg={FLAG_SVG} {...props} />;
}
