/**
 * **Costa Rica** 国旗。ISO: `CR`；只含该国 SVG，**勿手改**（`build-country-flags.mts` 生成）。
 * @see https://github.com/lipis/flag-icons
 */
import type { JSX } from "preact";

import { FlagImg } from "../FlagImg.tsx";
import type { CountryFlagComponentProps } from "../countryFlagTypes.ts";

const FLAG_SVG: string =
  '<svg xmlns="http://www.w3.org/2000/svg" id="flag-icons-cr" viewBox="0 0 512 512"><g fill-rule="evenodd" stroke-width="1pt"><path fill="#0000b4" d="M0 0h512v512H0z"/><path fill="#fff" d="M0 80.5h512v343.7H0z"/><path fill="#d90000" d="M0 168.2h512v168.2H0z"/></g></svg>';

/**
 * Costa Rica — 1:1 独立文件；只 import 本文件不会打入他国。
 */
export function IconFlagCR(props?: CountryFlagComponentProps): JSX.Element {
  return <FlagImg svg={FLAG_SVG} {...props} />;
}
