/**
 * **Germany** 国旗。ISO: `DE`；只含该国 SVG，**勿手改**（`build-country-flags.mts` 生成）。
 * @see https://github.com/lipis/flag-icons
 */
import type { JSX } from "preact";

import { FlagImg } from "../FlagImg.tsx";
import type { CountryFlagComponentProps } from "../countryFlagTypes.ts";

const FLAG_SVG: string =
  '<svg xmlns="http://www.w3.org/2000/svg" id="flag-icons-de" viewBox="0 0 512 512"><path fill="#fc0" d="M0 341.3h512V512H0z"/><path fill="#000001" d="M0 0h512v170.7H0z"/><path fill="red" d="M0 170.7h512v170.6H0z"/></svg>';

/**
 * Germany — 1:1 独立文件；只 import 本文件不会打入他国。
 */
export function IconFlagDE(props?: CountryFlagComponentProps): JSX.Element {
  return <FlagImg svg={FLAG_SVG} {...props} />;
}
