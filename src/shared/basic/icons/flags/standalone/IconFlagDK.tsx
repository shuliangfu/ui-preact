/**
 * **Denmark** 国旗。ISO: `DK`；只含该国 SVG，**勿手改**（`build-country-flags.mts` 生成）。
 * @see https://github.com/lipis/flag-icons
 */
import type { JSX } from "preact";

import { FlagImg } from "../FlagImg.tsx";
import type { CountryFlagComponentProps } from "../countryFlagTypes.ts";

const FLAG_SVG: string =
  '<svg xmlns="http://www.w3.org/2000/svg" id="flag-icons-dk" viewBox="0 0 512 512"><path fill="#c8102e" d="M0 0h512.1v512H0z"/><path fill="#fff" d="M144 0h73.1v512H144z"/><path fill="#fff" d="M0 219.4h512.1v73.2H0z"/></svg>';

/**
 * Denmark — 1:1 独立文件；只 import 本文件不会打入他国。
 */
export function IconFlagDK(props?: CountryFlagComponentProps): JSX.Element {
  return <FlagImg svg={FLAG_SVG} {...props} />;
}
