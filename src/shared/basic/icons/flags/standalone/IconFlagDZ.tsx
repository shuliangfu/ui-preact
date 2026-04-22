/**
 * **Algeria** 国旗。ISO: `DZ`；只含该国 SVG，**勿手改**（`build-country-flags.mts` 生成）。
 * @see https://github.com/lipis/flag-icons
 */
import type { JSX } from "preact";

import { FlagImg } from "../FlagImg.tsx";
import type { CountryFlagComponentProps } from "../countryFlagTypes.ts";

const FLAG_SVG: string =
  '<svg xmlns="http://www.w3.org/2000/svg" id="flag-icons-dz" viewBox="0 0 512 512"><path fill="#fff" d="M256 0h256v512H256z"/><path fill="#006233" d="M0 0h256v512H0z"/><path fill="#d21034" d="M367 192a128 128 0 1 0 0 128 102.4 102.4 0 1 1 0-128m4.2 64L256 218.4l71.7 98.2V195.4L256 293.6z"/></svg>';

/**
 * Algeria — 1:1 独立文件；只 import 本文件不会打入他国。
 */
export function IconFlagDZ(props?: CountryFlagComponentProps): JSX.Element {
  return <FlagImg svg={FLAG_SVG} {...props} />;
}
