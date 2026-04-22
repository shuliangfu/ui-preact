/**
 * **Burkina Faso** 国旗。ISO: `BF`；只含该国 SVG，**勿手改**（`build-country-flags.mts` 生成）。
 * @see https://github.com/lipis/flag-icons
 */
import type { JSX } from "preact";

import { FlagImg } from "../FlagImg.tsx";
import type { CountryFlagComponentProps } from "../countryFlagTypes.ts";

const FLAG_SVG: string =
  '<svg xmlns="http://www.w3.org/2000/svg" id="flag-icons-bf" viewBox="0 0 512 512"><g fill-rule="evenodd"><path fill="#de0000" d="M512 511.6H.5V0H512z"/><path fill="#35a100" d="M511.8 512H0V256.2h511.7z"/></g><path fill="#fff300" fill-rule="evenodd" d="m389 223.8-82.9 56.5 31.7 91.6-82.7-56.7-82.8 56.7 31.7-91.6-82.8-56.6 102.3.2 31.6-91.7 31.5 91.6"/></svg>';

/**
 * Burkina Faso — 1:1 独立文件；只 import 本文件不会打入他国。
 */
export function IconFlagBF(props?: CountryFlagComponentProps): JSX.Element {
  return <FlagImg svg={FLAG_SVG} {...props} />;
}
