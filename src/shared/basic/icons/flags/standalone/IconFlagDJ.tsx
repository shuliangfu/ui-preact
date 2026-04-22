/**
 * **Djibouti** 国旗。ISO: `DJ`；只含该国 SVG，**勿手改**（`build-country-flags.mts` 生成）。
 * @see https://github.com/lipis/flag-icons
 */
import type { JSX } from "preact";

import { FlagImg } from "../FlagImg.tsx";
import type { CountryFlagComponentProps } from "../countryFlagTypes.ts";

const FLAG_SVG: string =
  '<svg xmlns="http://www.w3.org/2000/svg" id="flag-icons-dj" viewBox="0 0 512 512"><defs><clipPath id="dj-a"><path fill-opacity=".7" d="M55.4 0H764v708.7H55.4z"/></clipPath></defs><g fill-rule="evenodd" clip-path="url(#dj-a)" transform="translate(-40)scale(.722)"><path fill="#0c0" d="M0 0h1063v708.7H0z"/><path fill="#69f" d="M0 0h1063v354.3H0z"/><path fill="#fffefe" d="m0 0 529.7 353.9L0 707.3z"/><path fill="red" d="m221.2 404.3-42.7-30.8-42.4 31 15.8-50.3-42.4-31.2 52.4-.4 16.3-50.2 16.6 50 52.4.2-42.1 31.4z"/></g></svg>';

/**
 * Djibouti — 1:1 独立文件；只 import 本文件不会打入他国。
 */
export function IconFlagDJ(props?: CountryFlagComponentProps): JSX.Element {
  return <FlagImg svg={FLAG_SVG} {...props} />;
}
