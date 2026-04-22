/**
 * **Poland** 国旗。ISO: `PL`；只含该国 SVG，**勿手改**（`build-country-flags.mts` 生成）。
 * @see https://github.com/lipis/flag-icons
 */
import type { JSX } from "preact";

import { FlagImg } from "../FlagImg.tsx";
import type { CountryFlagComponentProps } from "../countryFlagTypes.ts";

const FLAG_SVG: string =
  '<svg xmlns="http://www.w3.org/2000/svg" id="flag-icons-pl" viewBox="0 0 512 512"><g fill-rule="evenodd"><path fill="#fff" d="M512 512H0V0h512z"/><path fill="#dc143c" d="M512 512H0V256h512z"/></g></svg>';

/**
 * Poland — 1:1 独立文件；只 import 本文件不会打入他国。
 */
export function IconFlagPL(props?: CountryFlagComponentProps): JSX.Element {
  return <FlagImg svg={FLAG_SVG} {...props} />;
}
