/**
 * **Chile** 国旗。ISO: `CL`；只含该国 SVG，**勿手改**（`build-country-flags.mts` 生成）。
 * @see https://github.com/lipis/flag-icons
 */
import type { JSX } from "preact";

import { FlagImg } from "../FlagImg.tsx";
import type { CountryFlagComponentProps } from "../countryFlagTypes.ts";

const FLAG_SVG: string =
  '<svg xmlns="http://www.w3.org/2000/svg" id="flag-icons-cl" viewBox="0 0 512 512"><defs><clipPath id="cl-a"><path fill-opacity=".7" d="M0 0h708.7v708.7H0z"/></clipPath></defs><g fill-rule="evenodd" clip-path="url(#cl-a)" transform="scale(.722)"><path fill="#fff" d="M354.3 0H1063v354.3H354.3z"/><path fill="#0039a6" d="M0 0h354.3v354.3H0z"/><path fill="#fff" d="m232.3 265.3-55-41.1-54.5 41.5 20.3-67.5-54.5-41.7 67.4-.6 21-67.3 21.3 67.2h67.5L211.4 198z"/><path fill="#d52b1e" d="M0 354.3h1063v354.4H0z"/></g></svg>';

/**
 * Chile — 1:1 独立文件；只 import 本文件不会打入他国。
 */
export function IconFlagCL(props?: CountryFlagComponentProps): JSX.Element {
  return <FlagImg svg={FLAG_SVG} {...props} />;
}
