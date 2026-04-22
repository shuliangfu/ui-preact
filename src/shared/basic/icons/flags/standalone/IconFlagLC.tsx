/**
 * **Saint Lucia** 国旗。ISO: `LC`；只含该国 SVG，**勿手改**（`build-country-flags.mts` 生成）。
 * @see https://github.com/lipis/flag-icons
 */
import type { JSX } from "preact";

import { FlagImg } from "../FlagImg.tsx";
import type { CountryFlagComponentProps } from "../countryFlagTypes.ts";

const FLAG_SVG: string =
  '<svg xmlns="http://www.w3.org/2000/svg" id="flag-icons-lc" viewBox="0 0 512 512"><g fill-rule="evenodd"><path fill="#65cfff" d="M0 0h512v512H0z"/><path fill="#fff" d="m254.8 44.8 173.5 421.6-344 1L254.7 44.8z"/><path fill="#000001" d="m255 103 150 362.6-297.5.8z"/><path fill="#ffce00" d="m254.8 256.1 173.5 210.8-344 .5z"/></g></svg>';

/**
 * Saint Lucia — 1:1 独立文件；只 import 本文件不会打入他国。
 */
export function IconFlagLC(props?: CountryFlagComponentProps): JSX.Element {
  return <FlagImg svg={FLAG_SVG} {...props} />;
}
