/**
 * **Europe** 国旗。ISO: `EU`；只含该国 SVG，**勿手改**（`build-country-flags.mts` 生成）。
 * @see https://github.com/lipis/flag-icons
 */
import type { JSX } from "preact";

import { FlagImg } from "../FlagImg.tsx";
import type { CountryFlagComponentProps } from "../countryFlagTypes.ts";

const FLAG_SVG: string =
  '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="flag-icons-eu" viewBox="0 0 512 512"><defs><g id="eu-d"><g id="eu-b"><path id="eu-a" d="m0-1-.3 1 .5.1z"/><use xlink:href="#eu-a" transform="scale(-1 1)"/></g><g id="eu-c"><use xlink:href="#eu-b" transform="rotate(72)"/><use xlink:href="#eu-b" transform="rotate(144)"/></g><use xlink:href="#eu-c" transform="scale(-1 1)"/></g></defs><path fill="#039" d="M0 0h512v512H0z"/><g fill="#fc0" transform="translate(256 258.4)scale(25.28395)"><use xlink:href="#eu-d" width="100%" height="100%" y="-6"/><use xlink:href="#eu-d" width="100%" height="100%" y="6"/><g id="eu-e"><use xlink:href="#eu-d" width="100%" height="100%" x="-6"/><use xlink:href="#eu-d" width="100%" height="100%" transform="rotate(-144 -2.3 -2.1)"/><use xlink:href="#eu-d" width="100%" height="100%" transform="rotate(144 -2.1 -2.3)"/><use xlink:href="#eu-d" width="100%" height="100%" transform="rotate(72 -4.7 -2)"/><use xlink:href="#eu-d" width="100%" height="100%" transform="rotate(72 -5 .5)"/></g><use xlink:href="#eu-e" width="100%" height="100%" transform="scale(-1 1)"/></g></svg>';

/**
 * Europe — 1:1 独立文件；只 import 本文件不会打入他国。
 */
export function IconFlagEU(props?: CountryFlagComponentProps): JSX.Element {
  return <FlagImg svg={FLAG_SVG} {...props} />;
}
