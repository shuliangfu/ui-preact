/**
 * **Tanzania** 国旗。ISO: `TZ`；只含该国 SVG，**勿手改**（`build-country-flags.mts` 生成）。
 * @see https://github.com/lipis/flag-icons
 */
import type { JSX } from "preact";

import { FlagImg } from "../FlagImg.tsx";
import type { CountryFlagComponentProps } from "../countryFlagTypes.ts";

const FLAG_SVG: string =
  '<svg xmlns="http://www.w3.org/2000/svg" id="flag-icons-tz" viewBox="0 0 512 512"><defs><clipPath id="tz-a"><path fill-opacity=".7" d="M102.9 0h496v496H103z"/></clipPath></defs><g clip-path="url(#tz-a)" transform="translate(-106.2)scale(1.0321)"><g fill-rule="evenodd" stroke-width="1pt"><path fill="#09f" d="M0 0h744.1v496H0z"/><path fill="#090" d="M0 0h744.1L0 496z"/><path fill="#000001" d="M0 496h165.4L744 103.4V0H578.7L0 392.7v103.4z"/><path fill="#ff0" d="M0 378 567 0h56L0 415.3v-37.2zm121.1 118 623-415.3V118L177 496z"/></g></g></svg>';

/**
 * Tanzania — 1:1 独立文件；只 import 本文件不会打入他国。
 */
export function IconFlagTZ(props?: CountryFlagComponentProps): JSX.Element {
  return <FlagImg svg={FLAG_SVG} {...props} />;
}
