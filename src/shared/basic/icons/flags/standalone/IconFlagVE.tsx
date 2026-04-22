/**
 * **Venezuela** 国旗。ISO: `VE`；只含该国 SVG，**勿手改**（`build-country-flags.mts` 生成）。
 * @see https://github.com/lipis/flag-icons
 */
import type { JSX } from "preact";

import { FlagImg } from "../FlagImg.tsx";
import type { CountryFlagComponentProps } from "../countryFlagTypes.ts";

const FLAG_SVG: string =
  '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="flag-icons-ve" viewBox="0 0 512 512"><defs><g id="ve-d" transform="translate(0 -36)"><g id="ve-c"><g id="ve-b"><path id="ve-a" fill="#fff" d="M0-5-1.5-.2l2.8.9z"/><use xlink:href="#ve-a" width="180" height="120" transform="scale(-1 1)"/></g><use xlink:href="#ve-b" width="180" height="120" transform="rotate(72)"/></g><use xlink:href="#ve-b" width="180" height="120" transform="rotate(-72)"/><use xlink:href="#ve-c" width="180" height="120" transform="rotate(144)"/></g></defs><path fill="#cf142b" d="M0 0h512v512H0z"/><path fill="#00247d" d="M0 0h512v341.3H0z"/><path fill="#fc0" d="M0 0h512v170.7H0z"/><g id="ve-f" transform="translate(256.3 358.4)scale(4.265)"><g id="ve-e"><use xlink:href="#ve-d" width="180" height="120" transform="rotate(10)"/><use xlink:href="#ve-d" width="180" height="120" transform="rotate(30)"/></g><use xlink:href="#ve-e" width="180" height="120" transform="rotate(40)"/></g><use xlink:href="#ve-f" width="180" height="120" transform="rotate(-80 256.3 358.4)"/></svg>';

/**
 * Venezuela — 1:1 独立文件；只 import 本文件不会打入他国。
 */
export function IconFlagVE(props?: CountryFlagComponentProps): JSX.Element {
  return <FlagImg svg={FLAG_SVG} {...props} />;
}
