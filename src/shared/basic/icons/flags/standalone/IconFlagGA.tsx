/**
 * **Gabon** 国旗。ISO: `GA`；只含该国 SVG，**勿手改**（`build-country-flags.mts` 生成）。
 * @see https://github.com/lipis/flag-icons
 */
import type { JSX } from "preact";

import { FlagImg } from "../FlagImg.tsx";
import type { CountryFlagComponentProps } from "../countryFlagTypes.ts";

const FLAG_SVG: string =
  '<svg xmlns="http://www.w3.org/2000/svg" id="flag-icons-ga" viewBox="0 0 512 512"><g fill-rule="evenodd"><path fill="#ffe700" d="M512 512H0V0h512z"/><path fill="#36a100" d="M512 170.7H0V0h512z"/><path fill="#006dbc" d="M512 512H0V341.3h512z"/></g></svg>';

/**
 * Gabon — 1:1 独立文件；只 import 本文件不会打入他国。
 */
export function IconFlagGA(props?: CountryFlagComponentProps): JSX.Element {
  return <FlagImg svg={FLAG_SVG} {...props} />;
}
