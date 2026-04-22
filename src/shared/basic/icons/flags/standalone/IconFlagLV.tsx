/**
 * **Latvia** 国旗。ISO: `LV`；只含该国 SVG，**勿手改**（`build-country-flags.mts` 生成）。
 * @see https://github.com/lipis/flag-icons
 */
import type { JSX } from "preact";

import { FlagImg } from "../FlagImg.tsx";
import type { CountryFlagComponentProps } from "../countryFlagTypes.ts";

const FLAG_SVG: string =
  '<svg xmlns="http://www.w3.org/2000/svg" id="flag-icons-lv" viewBox="0 0 512 512"><g fill-rule="evenodd"><path fill="#fff" d="M0 0h512v512H0z"/><path fill="#981e32" d="M0 0h512v204.8H0zm0 307.2h512V512H0z"/></g></svg>';

/**
 * Latvia — 1:1 独立文件；只 import 本文件不会打入他国。
 */
export function IconFlagLV(props?: CountryFlagComponentProps): JSX.Element {
  return <FlagImg svg={FLAG_SVG} {...props} />;
}
