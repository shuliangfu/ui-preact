/**
 * **Bahrain** 国旗。ISO: `BH`；只含该国 SVG，**勿手改**（`build-country-flags.mts` 生成）。
 * @see https://github.com/lipis/flag-icons
 */
import type { JSX } from "preact";

import { FlagImg } from "../FlagImg.tsx";
import type { CountryFlagComponentProps } from "../countryFlagTypes.ts";

const FLAG_SVG: string =
  '<svg xmlns="http://www.w3.org/2000/svg" id="flag-icons-bh" viewBox="0 0 512 512"><path fill="#fff" d="M0 0h512v512H0"/><path fill="#ce1126" d="M512 0H102.4l83.4 51.2-83.4 51.2 83.4 51.2-83.4 51.2 83.4 51.2-83.4 51.2 83.4 51.2-83.4 51.2 83.4 51.2-83.4 51.2H512"/></svg>';

/**
 * Bahrain — 1:1 独立文件；只 import 本文件不会打入他国。
 */
export function IconFlagBH(props?: CountryFlagComponentProps): JSX.Element {
  return <FlagImg svg={FLAG_SVG} {...props} />;
}
