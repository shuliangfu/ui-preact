/**
 * **Bangladesh** 国旗。ISO: `BD`；只含该国 SVG，**勿手改**（`build-country-flags.mts` 生成）。
 * @see https://github.com/lipis/flag-icons
 */
import type { JSX } from "preact";

import { FlagImg } from "../FlagImg.tsx";
import type { CountryFlagComponentProps } from "../countryFlagTypes.ts";

const FLAG_SVG: string =
  '<svg xmlns="http://www.w3.org/2000/svg" id="flag-icons-bd" viewBox="0 0 512 512"><path fill="#006a4e" d="M0 0h512v512H0z"/><circle cx="230" cy="256" r="170.7" fill="#f42a41"/></svg>';

/**
 * Bangladesh — 1:1 独立文件；只 import 本文件不会打入他国。
 */
export function IconFlagBD(props?: CountryFlagComponentProps): JSX.Element {
  return <FlagImg svg={FLAG_SVG} {...props} />;
}
