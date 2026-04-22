/**
 * **Tonga** 国旗。ISO: `TO`；只含该国 SVG，**勿手改**（`build-country-flags.mts` 生成）。
 * @see https://github.com/lipis/flag-icons
 */
import type { JSX } from "preact";

import { FlagImg } from "../FlagImg.tsx";
import type { CountryFlagComponentProps } from "../countryFlagTypes.ts";

const FLAG_SVG: string =
  '<svg xmlns="http://www.w3.org/2000/svg" id="flag-icons-to" viewBox="0 0 512 512"><g fill-rule="evenodd" stroke-width="1pt"><path fill="#c10000" d="M0 0h512v512H0z"/><path fill="#fff" d="M0 0h218.3v175H0z"/><g fill="#c10000"><path d="M89.8 27.3h34.8v121.9H89.8z"/><path d="M168.2 70.8v34.8H46.3V70.8z"/></g></g></svg>';

/**
 * Tonga — 1:1 独立文件；只 import 本文件不会打入他国。
 */
export function IconFlagTO(props?: CountryFlagComponentProps): JSX.Element {
  return <FlagImg svg={FLAG_SVG} {...props} />;
}
