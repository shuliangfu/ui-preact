/**
 * **Suriname** 国旗。ISO: `SR`；只含该国 SVG，**勿手改**（`build-country-flags.mts` 生成）。
 * @see https://github.com/lipis/flag-icons
 */
import type { JSX } from "preact";

import { FlagImg } from "../FlagImg.tsx";
import type { CountryFlagComponentProps } from "../countryFlagTypes.ts";

const FLAG_SVG: string =
  '<svg xmlns="http://www.w3.org/2000/svg" id="flag-icons-sr" viewBox="0 0 512 512"><path fill="#377e3f" d="M0 0h512v512H0z"/><path fill="#fff" d="M0 102.4h512v307.2H0z"/><path fill="#b40a2d" d="M0 153.6h512v204.8H0z"/><path fill="#ecc81d" d="m255.9 163.4 60.2 185.2-157.6-114.5h194.8L195.7 348.6z"/></svg>';

/**
 * Suriname — 1:1 独立文件；只 import 本文件不会打入他国。
 */
export function IconFlagSR(props?: CountryFlagComponentProps): JSX.Element {
  return <FlagImg svg={FLAG_SVG} {...props} />;
}
