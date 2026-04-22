/**
 * **Finland** 国旗。ISO: `FI`；只含该国 SVG，**勿手改**（`build-country-flags.mts` 生成）。
 * @see https://github.com/lipis/flag-icons
 */
import type { JSX } from "preact";

import { FlagImg } from "../FlagImg.tsx";
import type { CountryFlagComponentProps } from "../countryFlagTypes.ts";

const FLAG_SVG: string =
  '<svg xmlns="http://www.w3.org/2000/svg" id="flag-icons-fi" viewBox="0 0 512 512"><path fill="#fff" d="M0 0h512v512H0z"/><path fill="#002f6c" d="M0 186.2h512v139.6H0z"/><path fill="#002f6c" d="M123.2 0h139.6v512H123.1z"/></svg>';

/**
 * Finland — 1:1 独立文件；只 import 本文件不会打入他国。
 */
export function IconFlagFI(props?: CountryFlagComponentProps): JSX.Element {
  return <FlagImg svg={FLAG_SVG} {...props} />;
}
