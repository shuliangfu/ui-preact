/**
 * **Colombia** 国旗。ISO: `CO`；只含该国 SVG，**勿手改**（`build-country-flags.mts` 生成）。
 * @see https://github.com/lipis/flag-icons
 */
import type { JSX } from "preact";

import { FlagImg } from "../FlagImg.tsx";
import type { CountryFlagComponentProps } from "../countryFlagTypes.ts";

const FLAG_SVG: string =
  '<svg xmlns="http://www.w3.org/2000/svg" id="flag-icons-co" viewBox="0 0 512 512"><g fill-rule="evenodd" stroke-width="1pt"><path fill="#ffe800" d="M0 0h512v512H0z"/><path fill="#00148e" d="M0 256h512v256H0z"/><path fill="#da0010" d="M0 384h512v128H0z"/></g></svg>';

/**
 * Colombia — 1:1 独立文件；只 import 本文件不会打入他国。
 */
export function IconFlagCO(props?: CountryFlagComponentProps): JSX.Element {
  return <FlagImg svg={FLAG_SVG} {...props} />;
}
