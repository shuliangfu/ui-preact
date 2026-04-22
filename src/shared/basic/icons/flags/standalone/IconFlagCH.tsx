/**
 * **Switzerland** 国旗。ISO: `CH`；只含该国 SVG，**勿手改**（`build-country-flags.mts` 生成）。
 * @see https://github.com/lipis/flag-icons
 */
import type { JSX } from "preact";

import { FlagImg } from "../FlagImg.tsx";
import type { CountryFlagComponentProps } from "../countryFlagTypes.ts";

const FLAG_SVG: string =
  '<svg xmlns="http://www.w3.org/2000/svg" id="flag-icons-ch" viewBox="0 0 512 512"><g fill-rule="evenodd" stroke-width="1pt"><path fill="red" d="M0 0h512v512H0z"/><g fill="#fff"><path d="M96 208h320v96H96z"/><path d="M208 96h96v320h-96z"/></g></g></svg>';

/**
 * Switzerland — 1:1 独立文件；只 import 本文件不会打入他国。
 */
export function IconFlagCH(props?: CountryFlagComponentProps): JSX.Element {
  return <FlagImg svg={FLAG_SVG} {...props} />;
}
