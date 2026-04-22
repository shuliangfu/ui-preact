/**
 * **Bonaire, Sint Eustatius and Saba** 国旗。ISO: `BQ`；只含该国 SVG，**勿手改**（`build-country-flags.mts` 生成）。
 * @see https://github.com/lipis/flag-icons
 */
import type { JSX } from "preact";

import { FlagImg } from "../FlagImg.tsx";
import type { CountryFlagComponentProps } from "../countryFlagTypes.ts";

const FLAG_SVG: string =
  '<svg xmlns="http://www.w3.org/2000/svg" id="flag-icons-bq" viewBox="0 0 512 512"><path fill="#21468b" d="M0 0h512v512H0z"/><path fill="#fff" d="M0 0h512v341.3H0z"/><path fill="#ae1c28" d="M0 0h512v170.7H0z"/></svg>';

/**
 * Bonaire, Sint Eustatius and Saba — 1:1 独立文件；只 import 本文件不会打入他国。
 */
export function IconFlagBQ(props?: CountryFlagComponentProps): JSX.Element {
  return <FlagImg svg={FLAG_SVG} {...props} />;
}
