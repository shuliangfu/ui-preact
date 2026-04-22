/**
 * **Sweden** 国旗。ISO: `SE`；只含该国 SVG，**勿手改**（`build-country-flags.mts` 生成）。
 * @see https://github.com/lipis/flag-icons
 */
import type { JSX } from "preact";

import { FlagImg } from "../FlagImg.tsx";
import type { CountryFlagComponentProps } from "../countryFlagTypes.ts";

const FLAG_SVG: string =
  '<svg xmlns="http://www.w3.org/2000/svg" id="flag-icons-se" viewBox="0 0 512 512"><path fill="#005293" d="M0 0h512v512H0z"/><path fill="#fecb00" d="M134 0v204.8H0v102.4h134V512h102.4V307.2H512V204.8H236.4V0z"/></svg>';

/**
 * Sweden — 1:1 独立文件；只 import 本文件不会打入他国。
 */
export function IconFlagSE(props?: CountryFlagComponentProps): JSX.Element {
  return <FlagImg svg={FLAG_SVG} {...props} />;
}
