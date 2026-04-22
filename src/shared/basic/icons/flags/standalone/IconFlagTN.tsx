/**
 * **Tunisia** 国旗。ISO: `TN`；只含该国 SVG，**勿手改**（`build-country-flags.mts` 生成）。
 * @see https://github.com/lipis/flag-icons
 */
import type { JSX } from "preact";

import { FlagImg } from "../FlagImg.tsx";
import type { CountryFlagComponentProps } from "../countryFlagTypes.ts";

const FLAG_SVG: string =
  '<svg xmlns="http://www.w3.org/2000/svg" id="flag-icons-tn" viewBox="0 0 512 512"><path fill="#e70013" d="M0 0h512v512H0z"/><path fill="#fff" d="M256 135a1 1 0 0 0-1 240 1 1 0 0 0 0-241zm72 174a90 90 0 1 1 0-107 72 72 0 1 0 0 107m-4.7-21.7-37.4-12.1-23.1 31.8v-39.3l-37.3-12.2 37.3-12.2v-39.4l23.1 31.9 37.4-12.1-23.1 31.8z"/></svg>';

/**
 * Tunisia — 1:1 独立文件；只 import 本文件不会打入他国。
 */
export function IconFlagTN(props?: CountryFlagComponentProps): JSX.Element {
  return <FlagImg svg={FLAG_SVG} {...props} />;
}
