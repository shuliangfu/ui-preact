/**
 * **Uzbekistan** 国旗。ISO: `UZ`；只含该国 SVG，**勿手改**（`build-country-flags.mts` 生成）。
 * @see https://github.com/lipis/flag-icons
 */
import type { JSX } from "preact";

import { FlagImg } from "../FlagImg.tsx";
import type { CountryFlagComponentProps } from "../countryFlagTypes.ts";

const FLAG_SVG: string =
  '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="flag-icons-uz" viewBox="0 0 512 512"><path fill="#1eb53a" d="M0 341.3h512V512H0z"/><path fill="#0099b5" d="M0 0h512v170.7H0z"/><path fill="#ce1126" d="M0 163.8h512v184.4H0z"/><path fill="#fff" d="M0 174h512v164H0z"/><circle cx="143.4" cy="81.9" r="61.4" fill="#fff"/><circle cx="163.8" cy="81.9" r="61.4" fill="#0099b5"/><g fill="#fff" transform="translate(278.5 131)scale(2.048)"><g id="uz-e"><g id="uz-d"><g id="uz-c"><g id="uz-b"><path id="uz-a" d="M0-6-1.9-.3 1 .7"/><use xlink:href="#uz-a" width="100%" height="100%" transform="scale(-1 1)"/></g><use xlink:href="#uz-b" width="100%" height="100%" transform="rotate(72)"/></g><use xlink:href="#uz-b" width="100%" height="100%" transform="rotate(-72)"/><use xlink:href="#uz-c" width="100%" height="100%" transform="rotate(144)"/></g><use xlink:href="#uz-d" width="100%" height="100%" y="-24"/><use xlink:href="#uz-d" width="100%" height="100%" y="-48"/></g><use xlink:href="#uz-e" width="100%" height="100%" x="24"/><use xlink:href="#uz-e" width="100%" height="100%" x="48"/><use xlink:href="#uz-d" width="100%" height="100%" x="-48"/><use xlink:href="#uz-d" width="100%" height="100%" x="-24"/><use xlink:href="#uz-d" width="100%" height="100%" x="-24" y="-24"/></g></svg>';

/**
 * Uzbekistan — 1:1 独立文件；只 import 本文件不会打入他国。
 */
export function IconFlagUZ(props?: CountryFlagComponentProps): JSX.Element {
  return <FlagImg svg={FLAG_SVG} {...props} />;
}
