/**
 * **Morocco** 国旗。ISO: `MA`；只含该国 SVG，**勿手改**（`build-country-flags.mts` 生成）。
 * @see https://github.com/lipis/flag-icons
 */
import type { JSX } from "preact";

import { FlagImg } from "../FlagImg.tsx";
import type { CountryFlagComponentProps } from "../countryFlagTypes.ts";

const FLAG_SVG: string =
  '<svg xmlns="http://www.w3.org/2000/svg" id="flag-icons-ma" viewBox="0 0 512 512"><path fill="#c1272d" d="M512 0H0v512h512z"/><path fill="none" stroke="#006233" stroke-width="12.5" d="m256 191.4-38 116.8 99.4-72.2H194.6l99.3 72.2z"/></svg>';

/**
 * Morocco — 1:1 独立文件；只 import 本文件不会打入他国。
 */
export function IconFlagMA(props?: CountryFlagComponentProps): JSX.Element {
  return <FlagImg svg={FLAG_SVG} {...props} />;
}
