/**
 * **Lithuania** 国旗。ISO: `LT`；只含该国 SVG，**勿手改**（`build-country-flags.mts` 生成）。
 * @see https://github.com/lipis/flag-icons
 */
import type { JSX } from "preact";

import { FlagImg } from "../FlagImg.tsx";
import type { CountryFlagComponentProps } from "../countryFlagTypes.ts";

const FLAG_SVG: string =
  '<svg xmlns="http://www.w3.org/2000/svg" id="flag-icons-lt" viewBox="0 0 512 512"><g fill-rule="evenodd" stroke-width="1pt" transform="scale(.51314 1.0322)"><rect width="1063" height="708.7" fill="#006a44" rx="0" ry="0" transform="scale(.93865 .69686)"/><rect width="1063" height="236.2" y="475.6" fill="#c1272d" rx="0" ry="0" transform="scale(.93865 .69686)"/><path fill="#fdb913" d="M0 0h997.8v164.6H0z"/></g></svg>';

/**
 * Lithuania — 1:1 独立文件；只 import 本文件不会打入他国。
 */
export function IconFlagLT(props?: CountryFlagComponentProps): JSX.Element {
  return <FlagImg svg={FLAG_SVG} {...props} />;
}
