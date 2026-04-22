/**
 * **Niger** 国旗。ISO: `NE`；只含该国 SVG，**勿手改**（`build-country-flags.mts` 生成）。
 * @see https://github.com/lipis/flag-icons
 */
import type { JSX } from "preact";

import { FlagImg } from "../FlagImg.tsx";
import type { CountryFlagComponentProps } from "../countryFlagTypes.ts";

const FLAG_SVG: string =
  '<svg xmlns="http://www.w3.org/2000/svg" id="flag-icons-ne" viewBox="0 0 512 512"><path fill="#0db02b" d="M0 0h512v512H0z"/><path fill="#fff" d="M0 0h512v341.3H0z"/><path fill="#e05206" d="M0 0h512v170.7H0z"/><circle cx="256" cy="256" r="72.5" fill="#e05206"/></svg>';

/**
 * Niger — 1:1 独立文件；只 import 本文件不会打入他国。
 */
export function IconFlagNE(props?: CountryFlagComponentProps): JSX.Element {
  return <FlagImg svg={FLAG_SVG} {...props} />;
}
