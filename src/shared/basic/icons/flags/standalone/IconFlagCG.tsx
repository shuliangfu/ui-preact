/**
 * **Republic of the Congo** 国旗。ISO: `CG`；只含该国 SVG，**勿手改**（`build-country-flags.mts` 生成）。
 * @see https://github.com/lipis/flag-icons
 */
import type { JSX } from "preact";

import { FlagImg } from "../FlagImg.tsx";
import type { CountryFlagComponentProps } from "../countryFlagTypes.ts";

const FLAG_SVG: string =
  '<svg xmlns="http://www.w3.org/2000/svg" id="flag-icons-cg" viewBox="0 0 512 512"><defs><clipPath id="cg-a"><path fill-opacity=".7" d="M115.7 0h496.1v496h-496z"/></clipPath></defs><g fill-rule="evenodd" stroke-width="1pt" clip-path="url(#cg-a)" transform="translate(-119.5)scale(1.032)"><path fill="#ff0" d="M0 0h744v496H0z"/><path fill="#00ca00" d="M0 0v496L496 0z"/><path fill="red" d="M248 496h496V0z"/></g></svg>';

/**
 * Republic of the Congo — 1:1 独立文件；只 import 本文件不会打入他国。
 */
export function IconFlagCG(props?: CountryFlagComponentProps): JSX.Element {
  return <FlagImg svg={FLAG_SVG} {...props} />;
}
