/**
 * **Romania** 国旗。ISO: `RO`；只含该国 SVG，**勿手改**（`build-country-flags.mts` 生成）。
 * @see https://github.com/lipis/flag-icons
 */
import type { JSX } from "preact";

import { FlagImg } from "../FlagImg.tsx";
import type { CountryFlagComponentProps } from "../countryFlagTypes.ts";

const FLAG_SVG: string =
  '<svg xmlns="http://www.w3.org/2000/svg" id="flag-icons-ro" viewBox="0 0 512 512"><g fill-rule="evenodd" stroke-width="1pt"><path fill="#00319c" d="M0 0h170.7v512H0z"/><path fill="#ffde00" d="M170.7 0h170.6v512H170.7z"/><path fill="#de2110" d="M341.3 0H512v512H341.3z"/></g></svg>';

/**
 * Romania — 1:1 独立文件；只 import 本文件不会打入他国。
 */
export function IconFlagRO(props?: CountryFlagComponentProps): JSX.Element {
  return <FlagImg svg={FLAG_SVG} {...props} />;
}
