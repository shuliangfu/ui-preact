/**
 * **Cuba** 国旗。ISO: `CU`；只含该国 SVG，**勿手改**（`build-country-flags.mts` 生成）。
 * @see https://github.com/lipis/flag-icons
 */
import type { JSX } from "preact";

import { FlagImg } from "../FlagImg.tsx";
import type { CountryFlagComponentProps } from "../countryFlagTypes.ts";

const FLAG_SVG: string =
  '<svg xmlns="http://www.w3.org/2000/svg" id="flag-icons-cu" viewBox="0 0 512 512"><defs><clipPath id="cu-a"><path fill-opacity=".7" d="M0 0h512v512H0z"/></clipPath></defs><g fill-rule="evenodd" clip-path="url(#cu-a)"><path fill="#002a8f" d="M-32 0h768v512H-32z"/><path fill="#fff" d="M-32 102.4h768v102.4H-32zm0 204.8h768v102.4H-32z"/><path fill="#cb1515" d="m-32 0 440.7 255.7L-32 511z"/><path fill="#fff" d="M161.8 325.5 114.3 290l-47.2 35.8 17.6-58.1-47.2-36 58.3-.4 18.1-58 18.5 57.8 58.3.1-46.9 36.3z"/></g></svg>';

/**
 * Cuba — 1:1 独立文件；只 import 本文件不会打入他国。
 */
export function IconFlagCU(props?: CountryFlagComponentProps): JSX.Element {
  return <FlagImg svg={FLAG_SVG} {...props} />;
}
