/**
 * **India** 国旗。ISO: `IN`；只含该国 SVG，**勿手改**（`build-country-flags.mts` 生成）。
 * @see https://github.com/lipis/flag-icons
 */
import type { JSX } from "preact";

import { FlagImg } from "../FlagImg.tsx";
import type { CountryFlagComponentProps } from "../countryFlagTypes.ts";

const FLAG_SVG: string =
  '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="flag-icons-in" viewBox="0 0 512 512"><path fill="#f93" d="M0 0h512v170.7H0z"/><path fill="#fff" d="M0 170.7h512v170.6H0z"/><path fill="#128807" d="M0 341.3h512V512H0z"/><g transform="translate(256 256)scale(3.41333)"><circle r="20" fill="#008"/><circle r="17.5" fill="#fff"/><circle r="3.5" fill="#008"/><g id="in-d"><g id="in-c"><g id="in-b"><g id="in-a" fill="#008"><circle r=".9" transform="rotate(7.5 -8.8 133.5)"/><path d="M0 17.5.6 7 0 2l-.6 5z"/></g><use xlink:href="#in-a" width="100%" height="100%" transform="rotate(15)"/></g><use xlink:href="#in-b" width="100%" height="100%" transform="rotate(30)"/></g><use xlink:href="#in-c" width="100%" height="100%" transform="rotate(60)"/></g><use xlink:href="#in-d" width="100%" height="100%" transform="rotate(120)"/><use xlink:href="#in-d" width="100%" height="100%" transform="rotate(-120)"/></g></svg>';

/**
 * India — 1:1 独立文件；只 import 本文件不会打入他国。
 */
export function IconFlagIN(props?: CountryFlagComponentProps): JSX.Element {
  return <FlagImg svg={FLAG_SVG} {...props} />;
}
