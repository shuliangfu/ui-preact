/**
 * **Sierra Leone** 国旗。ISO: `SL`；只含该国 SVG，**勿手改**（`build-country-flags.mts` 生成）。
 * @see https://github.com/lipis/flag-icons
 */
import type { JSX } from "preact";

import { FlagImg } from "../FlagImg.tsx";
import type { CountryFlagComponentProps } from "../countryFlagTypes.ts";

const FLAG_SVG: string =
  '<svg xmlns="http://www.w3.org/2000/svg" id="flag-icons-sl" viewBox="0 0 512 512"><defs><clipPath id="sl-a"><rect width="384" height="512" rx="4.6" ry="7.6"/></clipPath></defs><g fill-rule="evenodd" clip-path="url(#sl-a)" transform="scale(1.33333 1)"><path fill="#0000cd" d="M0 341.7h512V512H0z"/><path fill="#fff" d="M0 171.4h512v170.3H0z"/><path fill="#00cd00" d="M0 0h512v171.4H0z"/></g></svg>';

/**
 * Sierra Leone — 1:1 独立文件；只 import 本文件不会打入他国。
 */
export function IconFlagSL(props?: CountryFlagComponentProps): JSX.Element {
  return <FlagImg svg={FLAG_SVG} {...props} />;
}
