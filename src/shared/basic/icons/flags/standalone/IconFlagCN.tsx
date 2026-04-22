/**
 * **China** 国旗。ISO: `CN`；只含该国 SVG，**勿手改**（`build-country-flags.mts` 生成）。
 * @see https://github.com/lipis/flag-icons
 */
import type { JSX } from "preact";

import { FlagImg } from "../FlagImg.tsx";
import type { CountryFlagComponentProps } from "../countryFlagTypes.ts";

const FLAG_SVG: string =
  '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="flag-icons-cn" viewBox="0 0 512 512"><defs><path id="cn-a" fill="#ff0" d="M1-.3-.7.8 0-1 .6.8-1-.3z"/></defs><path fill="#ee1c25" d="M0 0h512v512H0z"/><use xlink:href="#cn-a" width="30" height="20" transform="translate(128 128)scale(76.8)"/><use xlink:href="#cn-a" width="30" height="20" transform="rotate(-121 142.6 -47)scale(25.5827)"/><use xlink:href="#cn-a" width="30" height="20" transform="rotate(-98.1 198 -82)scale(25.6)"/><use xlink:href="#cn-a" width="30" height="20" transform="rotate(-74 272.4 -114)scale(25.6137)"/><use xlink:href="#cn-a" width="30" height="20" transform="matrix(16 -19.968 19.968 16 256 230.4)"/></svg>';

/**
 * China — 1:1 独立文件；只 import 本文件不会打入他国。
 */
export function IconFlagCN(props?: CountryFlagComponentProps): JSX.Element {
  return <FlagImg svg={FLAG_SVG} {...props} />;
}
