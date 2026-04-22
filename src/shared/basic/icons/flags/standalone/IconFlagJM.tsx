/**
 * **Jamaica** 国旗。ISO: `JM`；只含该国 SVG，**勿手改**（`build-country-flags.mts` 生成）。
 * @see https://github.com/lipis/flag-icons
 */
import type { JSX } from "preact";

import { FlagImg } from "../FlagImg.tsx";
import type { CountryFlagComponentProps } from "../countryFlagTypes.ts";

const FLAG_SVG: string =
  '<svg xmlns="http://www.w3.org/2000/svg" id="flag-icons-jm" viewBox="0 0 512 512"><g fill-rule="evenodd"><path fill="#000001" d="m0 0 256 256L0 512zm512 0L256 256l256 256z"/><path fill="#090" d="m0 0 256 256L512 0zm0 512 256-256 256 256z"/><path fill="#fc0" d="M512 0h-47.7L0 464.3V512h47.7L512 47.7z"/><path fill="#fc0" d="M0 0v47.7L464.3 512H512v-47.7L47.7 0z"/></g></svg>';

/**
 * Jamaica — 1:1 独立文件；只 import 本文件不会打入他国。
 */
export function IconFlagJM(props?: CountryFlagComponentProps): JSX.Element {
  return <FlagImg svg={FLAG_SVG} {...props} />;
}
