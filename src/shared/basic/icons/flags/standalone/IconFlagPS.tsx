/**
 * **State of Palestine** 国旗。ISO: `PS`；只含该国 SVG，**勿手改**（`build-country-flags.mts` 生成）。
 * @see https://github.com/lipis/flag-icons
 */
import type { JSX } from "preact";

import { FlagImg } from "../FlagImg.tsx";
import type { CountryFlagComponentProps } from "../countryFlagTypes.ts";

const FLAG_SVG: string =
  '<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" id="flag-icons-ps" viewBox="0 0 512 512"><path fill="#009639" d="M0 0h512v512H0z"/><path fill="#fff" d="M0 0h512v341.3H0z"/><path d="M0 0h512v170.7H0z"/><path fill="#ed2e38" d="m0 0 341.3 256L0 512Z"/></svg>';

/**
 * State of Palestine — 1:1 独立文件；只 import 本文件不会打入他国。
 */
export function IconFlagPS(props?: CountryFlagComponentProps): JSX.Element {
  return <FlagImg svg={FLAG_SVG} {...props} />;
}
