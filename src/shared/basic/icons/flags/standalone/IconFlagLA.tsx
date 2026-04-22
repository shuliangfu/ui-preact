/**
 * **Laos** 国旗。ISO: `LA`；只含该国 SVG，**勿手改**（`build-country-flags.mts` 生成）。
 * @see https://github.com/lipis/flag-icons
 */
import type { JSX } from "preact";

import { FlagImg } from "../FlagImg.tsx";
import type { CountryFlagComponentProps } from "../countryFlagTypes.ts";

const FLAG_SVG: string =
  '<svg xmlns="http://www.w3.org/2000/svg" id="flag-icons-la" viewBox="0 0 512 512"><defs><clipPath id="la-a"><path fill-opacity=".7" d="M177.2 0h708.6v708.7H177.2z"/></clipPath></defs><g fill-rule="evenodd" clip-path="url(#la-a)" transform="translate(-128)scale(.72249)"><path fill="#ce1126" d="M0 0h1063v708.7H0z"/><path fill="#002868" d="M0 176h1063v356.6H0z"/><path fill="#fff" d="M684.2 354.3a152.7 152.7 0 1 1-305.4 0 152.7 152.7 0 0 1 305.4 0"/></g></svg>';

/**
 * Laos — 1:1 独立文件；只 import 本文件不会打入他国。
 */
export function IconFlagLA(props?: CountryFlagComponentProps): JSX.Element {
  return <FlagImg svg={FLAG_SVG} {...props} />;
}
