/**
 * **Unknown** 国旗。ISO: `XX`；只含该国 SVG，**勿手改**（`build-country-flags.mts` 生成）。
 * @see https://github.com/lipis/flag-icons
 */
import type { JSX } from "preact";

import { FlagImg } from "../FlagImg.tsx";
import type { CountryFlagComponentProps } from "../countryFlagTypes.ts";

const FLAG_SVG: string =
  '<svg xmlns="http://www.w3.org/2000/svg" id="flag-icons-xx" viewBox="0 0 512 512"><path fill="#fff" fill-rule="evenodd" stroke="#64748b" stroke-width="32" stroke-linejoin="round" stroke-linecap="round" d="M.5.5h511v511H.5z"/><path fill="none" stroke="#64748b" stroke-width="32" stroke-linejoin="round" stroke-linecap="round" d="m.5.5 511 511m0-511-511 511"/></svg>';

/**
 * Unknown — 1:1 独立文件；只 import 本文件不会打入他国。
 */
export function IconFlagXX(props?: CountryFlagComponentProps): JSX.Element {
  return <FlagImg svg={FLAG_SVG} {...props} />;
}
