/**
 * **Japan** 国旗。ISO: `JP`；只含该国 SVG，**勿手改**（`build-country-flags.mts` 生成）。
 * @see https://github.com/lipis/flag-icons
 */
import type { JSX } from "preact";

import { FlagImg } from "../FlagImg.tsx";
import type { CountryFlagComponentProps } from "../countryFlagTypes.ts";

const FLAG_SVG: string =
  '<svg xmlns="http://www.w3.org/2000/svg" id="flag-icons-jp" viewBox="0 0 512 512"><defs><clipPath id="jp-a"><path fill-opacity=".7" d="M177.2 0h708.6v708.7H177.2z"/></clipPath></defs><g fill-rule="evenodd" stroke-width="1pt" clip-path="url(#jp-a)" transform="translate(-128)scale(.72249)"><path fill="#fff" d="M0 0h1063v708.7H0z"/><circle cx="523.1" cy="344.1" r="194.9" fill="#bc002d" transform="translate(-59.7 -34.5)scale(1.1302)"/></g></svg>';

/**
 * Japan — 1:1 独立文件；只 import 本文件不会打入他国。
 */
export function IconFlagJP(props?: CountryFlagComponentProps): JSX.Element {
  return <FlagImg svg={FLAG_SVG} {...props} />;
}
