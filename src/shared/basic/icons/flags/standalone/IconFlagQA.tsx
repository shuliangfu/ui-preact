/**
 * **Qatar** 国旗。ISO: `QA`；只含该国 SVG，**勿手改**（`build-country-flags.mts` 生成）。
 * @see https://github.com/lipis/flag-icons
 */
import type { JSX } from "preact";

import { FlagImg } from "../FlagImg.tsx";
import type { CountryFlagComponentProps } from "../countryFlagTypes.ts";

const FLAG_SVG: string =
  '<svg xmlns="http://www.w3.org/2000/svg" id="flag-icons-qa" viewBox="0 0 512 512"><path fill="#8d1b3d" d="M0 0h512v512H0z"/><path fill="#fff" d="M0 0v512h113l104.2-28.4L113 455l104.2-28.4L113 398.2l104.2-28.4L113 341.3 217.2 313 113 284.4 217.2 256 113 227.6 217.2 199 113 170.7l104.2-28.5L113 113.8l104.2-28.5L113 57l104.2-28.4L113 0z"/></svg>';

/**
 * Qatar — 1:1 独立文件；只 import 本文件不会打入他国。
 */
export function IconFlagQA(props?: CountryFlagComponentProps): JSX.Element {
  return <FlagImg svg={FLAG_SVG} {...props} />;
}
