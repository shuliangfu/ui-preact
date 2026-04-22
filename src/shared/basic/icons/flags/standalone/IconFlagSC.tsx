/**
 * **Seychelles** 国旗。ISO: `SC`；只含该国 SVG，**勿手改**（`build-country-flags.mts` 生成）。
 * @see https://github.com/lipis/flag-icons
 */
import type { JSX } from "preact";

import { FlagImg } from "../FlagImg.tsx";
import type { CountryFlagComponentProps } from "../countryFlagTypes.ts";

const FLAG_SVG: string =
  '<svg xmlns="http://www.w3.org/2000/svg" id="flag-icons-sc" viewBox="0 0 512 512"><path fill="#fff" d="M0 0h512v512H0Z"/><path fill="#d92223" d="M0 512V0h512v170.7z"/><path fill="#fcd955" d="M0 512V0h341.3z"/><path fill="#003d88" d="M0 512V0h170.7z"/><path fill="#007a39" d="m0 512 512-170.7V512Z"/></svg>';

/**
 * Seychelles — 1:1 独立文件；只 import 本文件不会打入他国。
 */
export function IconFlagSC(props?: CountryFlagComponentProps): JSX.Element {
  return <FlagImg svg={FLAG_SVG} {...props} />;
}
