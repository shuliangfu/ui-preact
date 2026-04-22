/**
 * **Sao Tome and Principe** 国旗。ISO: `ST`；只含该国 SVG，**勿手改**（`build-country-flags.mts` 生成）。
 * @see https://github.com/lipis/flag-icons
 */
import type { JSX } from "preact";

import { FlagImg } from "../FlagImg.tsx";
import type { CountryFlagComponentProps } from "../countryFlagTypes.ts";

const FLAG_SVG: string =
  '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="flag-icons-st" viewBox="0 0 512 512"><path fill="#12ad2b" d="M0 0h512v512H0z"/><path fill="#ffce00" d="M0 146.3h512v219.4H0z"/><path fill="#d21034" d="M0 0v512l192-256"/><g id="st-c" transform="translate(276.9 261.5)scale(.33167)"><g id="st-b"><path id="st-a" fill="#000001" d="M0-200V0h100" transform="rotate(18 0 -200)"/><use xlink:href="#st-a" width="100%" height="100%" transform="scale(-1 1)"/></g><use xlink:href="#st-b" width="100%" height="100%" transform="rotate(72)"/><use xlink:href="#st-b" width="100%" height="100%" transform="rotate(144)"/><use xlink:href="#st-b" width="100%" height="100%" transform="rotate(-144)"/><use xlink:href="#st-b" width="100%" height="100%" transform="rotate(-72)"/></g><use xlink:href="#st-c" width="100%" height="100%" x="700" transform="translate(-550.9)"/></svg>';

/**
 * Sao Tome and Principe — 1:1 独立文件；只 import 本文件不会打入他国。
 */
export function IconFlagST(props?: CountryFlagComponentProps): JSX.Element {
  return <FlagImg svg={FLAG_SVG} {...props} />;
}
