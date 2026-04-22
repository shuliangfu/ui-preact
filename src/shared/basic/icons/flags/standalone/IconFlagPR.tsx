/**
 * **Puerto Rico** 国旗。ISO: `PR`；只含该国 SVG，**勿手改**（`build-country-flags.mts` 生成）。
 * @see https://github.com/lipis/flag-icons
 */
import type { JSX } from "preact";

import { FlagImg } from "../FlagImg.tsx";
import type { CountryFlagComponentProps } from "../countryFlagTypes.ts";

const FLAG_SVG: string =
  '<svg xmlns="http://www.w3.org/2000/svg" id="flag-icons-pr" viewBox="0 0 512 512"><defs><clipPath id="pr-a"><path fill-opacity=".7" d="M51.6 0h708.7v708.7H51.6z"/></clipPath></defs><g fill-rule="evenodd" clip-path="url(#pr-a)" transform="translate(-37.3)scale(.72249)"><path fill="#ed0000" d="M0 0h1063v708.7H0z"/><path fill="#fff" d="M0 141.7h1063v141.8H0zm0 283.5h1063v141.7H0z"/><path fill="#0050f0" d="m0 0 610 353.9L0 707.3z"/><path fill="#fff" d="m268.2 450.5-65.7-49-65.3 49.5 24.3-80.5-65.3-49.7 80.7-.7 25-80.2 25.6 80 80.7.1-64.9 50.2z"/></g></svg>';

/**
 * Puerto Rico — 1:1 独立文件；只 import 本文件不会打入他国。
 */
export function IconFlagPR(props?: CountryFlagComponentProps): JSX.Element {
  return <FlagImg svg={FLAG_SVG} {...props} />;
}
