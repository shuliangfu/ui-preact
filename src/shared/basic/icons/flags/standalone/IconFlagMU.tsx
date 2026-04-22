/**
 * **Mauritius** 国旗。ISO: `MU`；只含该国 SVG，**勿手改**（`build-country-flags.mts` 生成）。
 * @see https://github.com/lipis/flag-icons
 */
import type { JSX } from "preact";

import { FlagImg } from "../FlagImg.tsx";
import type { CountryFlagComponentProps } from "../countryFlagTypes.ts";

const FLAG_SVG: string =
  '<svg xmlns="http://www.w3.org/2000/svg" id="flag-icons-mu" viewBox="0 0 512 512"><g fill-rule="evenodd"><path fill="#009f4d" d="M0 384h512v128H0z"/><path fill="#151f6d" d="M0 128h512v128H0z"/><path fill="#ee2737" d="M0 0h512v128H0z"/><path fill="#ffcd00" d="M0 256h512v128H0z"/></g></svg>';

/**
 * Mauritius — 1:1 独立文件；只 import 本文件不会打入他国。
 */
export function IconFlagMU(props?: CountryFlagComponentProps): JSX.Element {
  return <FlagImg svg={FLAG_SVG} {...props} />;
}
