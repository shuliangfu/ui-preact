/**
 * **Kuwait** 国旗。ISO: `KW`；只含该国 SVG，**勿手改**（`build-country-flags.mts` 生成）。
 * @see https://github.com/lipis/flag-icons
 */
import type { JSX } from "preact";

import { FlagImg } from "../FlagImg.tsx";
import type { CountryFlagComponentProps } from "../countryFlagTypes.ts";

const FLAG_SVG: string =
  '<svg xmlns="http://www.w3.org/2000/svg" id="flag-icons-kw" viewBox="0 0 512 512"><defs><clipPath id="kw-a"><path fill-opacity=".7" d="M0 0h496v496H0z"/></clipPath></defs><g fill-rule="evenodd" stroke-width="1pt" clip-path="url(#kw-a)" transform="scale(1.0321)"><path fill="#fff" d="M0 165.3h992.1v165.4H0z"/><path fill="#f31830" d="M0 330.7h992.1v165.4H0z"/><path fill="#00d941" d="M0 0h992.1v165.4H0z"/><path fill="#000001" d="M0 0v496l247.5-165.3.5-165.5z"/></g></svg>';

/**
 * Kuwait — 1:1 独立文件；只 import 本文件不会打入他国。
 */
export function IconFlagKW(props?: CountryFlagComponentProps): JSX.Element {
  return <FlagImg svg={FLAG_SVG} {...props} />;
}
