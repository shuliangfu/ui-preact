/**
 * **Svalbard and Jan Mayen** 国旗。ISO: `SJ`；只含该国 SVG，**勿手改**（`build-country-flags.mts` 生成）。
 * @see https://github.com/lipis/flag-icons
 */
import type { JSX } from "preact";

import { FlagImg } from "../FlagImg.tsx";
import type { CountryFlagComponentProps } from "../countryFlagTypes.ts";

const FLAG_SVG: string =
  '<svg xmlns="http://www.w3.org/2000/svg" id="flag-icons-sj" viewBox="0 0 512 512"><path fill="#ef2b2d" d="M0 0h512v512H0z"/><path fill="#fff" d="M128 0h128v512H128z"/><path fill="#fff" d="M0 192h512v128H0z"/><path fill="#002868" d="M160 0h64v512h-64z"/><path fill="#002868" d="M0 224h512v64H0z"/></svg>';

/**
 * Svalbard and Jan Mayen — 1:1 独立文件；只 import 本文件不会打入他国。
 */
export function IconFlagSJ(props?: CountryFlagComponentProps): JSX.Element {
  return <FlagImg svg={FLAG_SVG} {...props} />;
}
