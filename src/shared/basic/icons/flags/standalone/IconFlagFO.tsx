/**
 * **Faroe Islands** 国旗。ISO: `FO`；只含该国 SVG，**勿手改**（`build-country-flags.mts` 生成）。
 * @see https://github.com/lipis/flag-icons
 */
import type { JSX } from "preact";

import { FlagImg } from "../FlagImg.tsx";
import type { CountryFlagComponentProps } from "../countryFlagTypes.ts";

const FLAG_SVG: string =
  '<svg xmlns="http://www.w3.org/2000/svg" id="flag-icons-fo" viewBox="0 0 512 512"><defs><clipPath id="fo-a"><path fill-opacity=".7" d="M0 0h512v512H0z"/></clipPath></defs><g fill-rule="evenodd" stroke-width="0" clip-path="url(#fo-a)"><path fill="#fff" d="M-78 0h708.2v512H-78z"/><path fill="#003897" d="M-75.9 199.1h198.3V0h113.3v199.1h396.6V313H235.7v199H122.4V312.9H-76z"/><path fill="#d72828" d="M-75.9 227.6h226.6V0h56.7v227.6h424.9v56.9h-425V512h-56.6V284.4H-75.9z"/></g></svg>';

/**
 * Faroe Islands — 1:1 独立文件；只 import 本文件不会打入他国。
 */
export function IconFlagFO(props?: CountryFlagComponentProps): JSX.Element {
  return <FlagImg svg={FLAG_SVG} {...props} />;
}
