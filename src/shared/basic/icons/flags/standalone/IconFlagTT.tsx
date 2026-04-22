/**
 * **Trinidad and Tobago** 国旗。ISO: `TT`；只含该国 SVG，**勿手改**（`build-country-flags.mts` 生成）。
 * @see https://github.com/lipis/flag-icons
 */
import type { JSX } from "preact";

import { FlagImg } from "../FlagImg.tsx";
import type { CountryFlagComponentProps } from "../countryFlagTypes.ts";

const FLAG_SVG: string =
  '<svg xmlns="http://www.w3.org/2000/svg" id="flag-icons-tt" viewBox="0 0 512 512"><path fill="#fff" d="M0 0h512v512H0z" style="width:0"/><g fill-rule="evenodd"><path fill="#e00000" d="M371 512 0 1v510.7zM141 0l371 511V.2z"/><path fill="#000001" d="M22.2.2h94.9l374.5 511.3h-97.9z"/></g></svg>';

/**
 * Trinidad and Tobago — 1:1 独立文件；只 import 本文件不会打入他国。
 */
export function IconFlagTT(props?: CountryFlagComponentProps): JSX.Element {
  return <FlagImg svg={FLAG_SVG} {...props} />;
}
