/**
 * **Ireland** 国旗。ISO: `IE`；只含该国 SVG，**勿手改**（`build-country-flags.mts` 生成）。
 * @see https://github.com/lipis/flag-icons
 */
import type { JSX } from "preact";

import { FlagImg } from "../FlagImg.tsx";
import type { CountryFlagComponentProps } from "../countryFlagTypes.ts";

const FLAG_SVG: string =
  '<svg xmlns="http://www.w3.org/2000/svg" id="flag-icons-ie" viewBox="0 0 512 512"><g fill-rule="evenodd" stroke-width="1pt"><path fill="#fff" d="M0 0h512v512H0z"/><path fill="#009A49" d="M0 0h170.7v512H0z"/><path fill="#FF7900" d="M341.3 0H512v512H341.3z"/></g></svg>';

/**
 * Ireland — 1:1 独立文件；只 import 本文件不会打入他国。
 */
export function IconFlagIE(props?: CountryFlagComponentProps): JSX.Element {
  return <FlagImg svg={FLAG_SVG} {...props} />;
}
