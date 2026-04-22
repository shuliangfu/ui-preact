/**
 * **Réunion** 国旗。ISO: `RE`；只含该国 SVG，**勿手改**（`build-country-flags.mts` 生成）。
 * @see https://github.com/lipis/flag-icons
 */
import type { JSX } from "preact";

import { FlagImg } from "../FlagImg.tsx";
import type { CountryFlagComponentProps } from "../countryFlagTypes.ts";

const FLAG_SVG: string =
  '<svg xmlns="http://www.w3.org/2000/svg" id="flag-icons-re" viewBox="0 0 512 512"><g fill-rule="evenodd" stroke-width="1pt"><path fill="#fff" d="M0 0h512v512H0z"/><path fill="#00267f" d="M0 0h170.7v512H0z"/><path fill="#f31830" d="M341.3 0H512v512H341.3z"/></g></svg>';

/**
 * Réunion — 1:1 独立文件；只 import 本文件不会打入他国。
 */
export function IconFlagRE(props?: CountryFlagComponentProps): JSX.Element {
  return <FlagImg svg={FLAG_SVG} {...props} />;
}
