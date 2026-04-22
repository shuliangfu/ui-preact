/**
 * **Iceland** 国旗。ISO: `IS`；只含该国 SVG，**勿手改**（`build-country-flags.mts` 生成）。
 * @see https://github.com/lipis/flag-icons
 */
import type { JSX } from "preact";

import { FlagImg } from "../FlagImg.tsx";
import type { CountryFlagComponentProps } from "../countryFlagTypes.ts";

const FLAG_SVG: string =
  '<svg xmlns="http://www.w3.org/2000/svg" id="flag-icons-is" viewBox="0 0 512 512"><defs><clipPath id="is-a"><path fill-opacity=".7" d="M85.4 0h486v486h-486z"/></clipPath></defs><g fill-rule="evenodd" stroke-width="0" clip-path="url(#is-a)" transform="translate(-90)scale(1.0535)"><path fill="#003897" d="M0 0h675v486H0z"/><path fill="#fff" d="M0 189h189V0h108v189h378v108H297v189H189V297H0z"/><path fill="#d72828" d="M0 216h216V0h54v216h405v54H270v216h-54V270H0z"/></g></svg>';

/**
 * Iceland — 1:1 独立文件；只 import 本文件不会打入他国。
 */
export function IconFlagIS(props?: CountryFlagComponentProps): JSX.Element {
  return <FlagImg svg={FLAG_SVG} {...props} />;
}
