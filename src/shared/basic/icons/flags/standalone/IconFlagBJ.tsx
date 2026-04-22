/**
 * **Benin** 国旗。ISO: `BJ`；只含该国 SVG，**勿手改**（`build-country-flags.mts` 生成）。
 * @see https://github.com/lipis/flag-icons
 */
import type { JSX } from "preact";

import { FlagImg } from "../FlagImg.tsx";
import type { CountryFlagComponentProps } from "../countryFlagTypes.ts";

const FLAG_SVG: string =
  '<svg xmlns="http://www.w3.org/2000/svg" id="flag-icons-bj" viewBox="0 0 512 512"><defs><clipPath id="bj-a"><path fill="gray" d="M67.6-154h666v666h-666z"/></clipPath></defs><g clip-path="url(#bj-a)" transform="translate(-52 118.4)scale(.7688)"><g fill-rule="evenodd" stroke-width="1pt"><path fill="#319400" d="M0-154h333v666H0z"/><path fill="#ffd600" d="M333-154h666v333H333z"/><path fill="#de2110" d="M333 179h666v333H333z"/></g></g></svg>';

/**
 * Benin — 1:1 独立文件；只 import 本文件不会打入他国。
 */
export function IconFlagBJ(props?: CountryFlagComponentProps): JSX.Element {
  return <FlagImg svg={FLAG_SVG} {...props} />;
}
