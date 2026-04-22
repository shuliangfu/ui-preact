/**
 * **Palau** 国旗。ISO: `PW`；只含该国 SVG，**勿手改**（`build-country-flags.mts` 生成）。
 * @see https://github.com/lipis/flag-icons
 */
import type { JSX } from "preact";

import { FlagImg } from "../FlagImg.tsx";
import type { CountryFlagComponentProps } from "../countryFlagTypes.ts";

const FLAG_SVG: string =
  '<svg xmlns="http://www.w3.org/2000/svg" id="flag-icons-pw" viewBox="0 0 512 512"><defs><clipPath id="pw-a"><path fill-opacity=".7" d="M61.7 4.2h170.8V175H61.7z"/></clipPath></defs><g fill-rule="evenodd" stroke-width="1pt" clip-path="url(#pw-a)" transform="translate(-185 -12.5)scale(2.9973)"><path fill="#4aadd6" d="M0 4.2h301.2V175H0z"/><path fill="#ffde00" d="M185.9 86.8a52 52 0 0 1-53 50.8 52 52 0 0 1-53.2-50.8c0-28 23.8-50.8 53.1-50.8s53 22.7 53 50.8z"/></g></svg>';

/**
 * Palau — 1:1 独立文件；只 import 本文件不会打入他国。
 */
export function IconFlagPW(props?: CountryFlagComponentProps): JSX.Element {
  return <FlagImg svg={FLAG_SVG} {...props} />;
}
