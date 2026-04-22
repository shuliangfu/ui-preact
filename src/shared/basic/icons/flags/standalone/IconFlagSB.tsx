/**
 * **Solomon Islands** 国旗。ISO: `SB`；只含该国 SVG，**勿手改**（`build-country-flags.mts` 生成）。
 * @see https://github.com/lipis/flag-icons
 */
import type { JSX } from "preact";

import { FlagImg } from "../FlagImg.tsx";
import type { CountryFlagComponentProps } from "../countryFlagTypes.ts";

const FLAG_SVG: string =
  '<svg xmlns="http://www.w3.org/2000/svg" id="flag-icons-sb" viewBox="0 0 512 512"><defs><clipPath id="sb-a"><path fill-opacity=".7" d="M0 0h496v496H0z"/></clipPath></defs><g fill-rule="evenodd" stroke-width="1pt" clip-path="url(#sb-a)" transform="scale(1.0321)"><path fill="#0000d6" d="M0 491.4 956.7 0H0z"/><path fill="#006000" d="M992.1 0 26.3 496h965.8z"/><path fill="#fc0" d="M992.2 0H939L0 470.3V496h53.1l939-469.4V0z"/><path fill="#fff" d="m39 96.1 11.6-33.3-30.2-20.6h37.3L69.2 8.8l11.5 33.4h37.2L87.8 62.8 99.3 96 69.2 75.5zm185.2 0 11.6-33.3-30.2-20.6h37.3l11.5-33.4 11.5 33.4H303l-30 20.6L284.5 96l-30.1-20.6zm0 140 11.6-33.3-30.2-20.6h37.3l11.5-33.4 11.5 33.4H303l-30 20.6 11.6 33.3-30.1-20.6zm-92-69.2 11.5-33.3-30.1-20.6h37.2l11.5-33.3 11.5 33.3h37.3l-30.2 20.6 11.5 33.3-30-20.6zM39 236.1l11.6-33.3-30.2-20.6h37.3l11.5-33.4 11.5 33.4h37.2l-30.1 20.6L99.3 236l-30.1-20.6z"/></g></svg>';

/**
 * Solomon Islands — 1:1 独立文件；只 import 本文件不会打入他国。
 */
export function IconFlagSB(props?: CountryFlagComponentProps): JSX.Element {
  return <FlagImg svg={FLAG_SVG} {...props} />;
}
