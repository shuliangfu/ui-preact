/**
 * **Thailand** 国旗。ISO: `TH`；只含该国 SVG，**勿手改**（`build-country-flags.mts` 生成）。
 * @see https://github.com/lipis/flag-icons
 */
import type { JSX } from "preact";

import { FlagImg } from "../FlagImg.tsx";
import type { CountryFlagComponentProps } from "../countryFlagTypes.ts";

const FLAG_SVG: string =
  '<svg xmlns="http://www.w3.org/2000/svg" id="flag-icons-th" viewBox="0 0 512 512"><g fill-rule="evenodd"><path fill="#f4f5f8" d="M0 0h512v512H0z"/><path fill="#2d2a4a" d="M0 173.4h512V344H0z"/><path fill="#a51931" d="M0 0h512v88H0zm0 426.7h512V512H0z"/></g></svg>';

/**
 * Thailand — 1:1 独立文件；只 import 本文件不会打入他国。
 */
export function IconFlagTH(props?: CountryFlagComponentProps): JSX.Element {
  return <FlagImg svg={FLAG_SVG} {...props} />;
}
