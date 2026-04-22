/**
 * **Chad** 国旗。ISO: `TD`；只含该国 SVG，**勿手改**（`build-country-flags.mts` 生成）。
 * @see https://github.com/lipis/flag-icons
 */
import type { JSX } from "preact";

import { FlagImg } from "../FlagImg.tsx";
import type { CountryFlagComponentProps } from "../countryFlagTypes.ts";

const FLAG_SVG: string =
  '<svg xmlns="http://www.w3.org/2000/svg" id="flag-icons-td" viewBox="0 0 512 512"><g fill-rule="evenodd"><path fill="#002664" d="M0 0h171.2v512H0z"/><path fill="#c60c30" d="M340.8 0H512v512H340.8z"/><path fill="#fecb00" d="M171.2 0h169.6v512H171.2z"/></g></svg>';

/**
 * Chad — 1:1 独立文件；只 import 本文件不会打入他国。
 */
export function IconFlagTD(props?: CountryFlagComponentProps): JSX.Element {
  return <FlagImg svg={FLAG_SVG} {...props} />;
}
