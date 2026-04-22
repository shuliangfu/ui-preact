/**
 * **Botswana** 国旗。ISO: `BW`；只含该国 SVG，**勿手改**（`build-country-flags.mts` 生成）。
 * @see https://github.com/lipis/flag-icons
 */
import type { JSX } from "preact";

import { FlagImg } from "../FlagImg.tsx";
import type { CountryFlagComponentProps } from "../countryFlagTypes.ts";

const FLAG_SVG: string =
  '<svg xmlns="http://www.w3.org/2000/svg" id="flag-icons-bw" viewBox="0 0 512 512"><g fill-rule="evenodd"><path fill="#00cbff" d="M0 0h512v512H0z"/><path fill="#fff" d="M0 192h512v128H0z"/><path fill="#000001" d="M0 212.7h512V299H0z"/></g></svg>';

/**
 * Botswana — 1:1 独立文件；只 import 本文件不会打入他国。
 */
export function IconFlagBW(props?: CountryFlagComponentProps): JSX.Element {
  return <FlagImg svg={FLAG_SVG} {...props} />;
}
