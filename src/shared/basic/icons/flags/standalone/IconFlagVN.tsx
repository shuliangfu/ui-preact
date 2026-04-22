/**
 * **Vietnam** 国旗。ISO: `VN`；只含该国 SVG，**勿手改**（`build-country-flags.mts` 生成）。
 * @see https://github.com/lipis/flag-icons
 */
import type { JSX } from "preact";

import { FlagImg } from "../FlagImg.tsx";
import type { CountryFlagComponentProps } from "../countryFlagTypes.ts";

const FLAG_SVG: string =
  '<svg xmlns="http://www.w3.org/2000/svg" id="flag-icons-vn" viewBox="0 0 512 512"><defs><clipPath id="vn-a"><path fill-opacity=".7" d="M177.2 0h708.6v708.7H177.2z"/></clipPath></defs><g fill-rule="evenodd" clip-path="url(#vn-a)" transform="translate(-128)scale(.72249)"><path fill="#da251d" d="M0 0h1063v708.7H0z"/><path fill="#ff0" d="m661 527.5-124-92.6-123.3 93.5 45.9-152-123.2-93.8 152.4-1.3L536 129.8 584.3 281l152.4.2-122.5 94.7z"/></g></svg>';

/**
 * Vietnam — 1:1 独立文件；只 import 本文件不会打入他国。
 */
export function IconFlagVN(props?: CountryFlagComponentProps): JSX.Element {
  return <FlagImg svg={FLAG_SVG} {...props} />;
}
