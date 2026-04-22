/**
 * **Madagascar** 国旗。ISO: `MG`；只含该国 SVG，**勿手改**（`build-country-flags.mts` 生成）。
 * @see https://github.com/lipis/flag-icons
 */
import type { JSX } from "preact";

import { FlagImg } from "../FlagImg.tsx";
import type { CountryFlagComponentProps } from "../countryFlagTypes.ts";

const FLAG_SVG: string =
  '<svg xmlns="http://www.w3.org/2000/svg" id="flag-icons-mg" viewBox="0 0 512 512"><g fill-rule="evenodd" stroke-width="1pt"><path fill="#fc3d32" d="M170.7 0H512v256H170.7z"/><path fill="#007e3a" d="M170.7 256H512v256H170.7z"/><path fill="#fff" d="M0 0h170.7v512H0z"/></g></svg>';

/**
 * Madagascar — 1:1 独立文件；只 import 本文件不会打入他国。
 */
export function IconFlagMG(props?: CountryFlagComponentProps): JSX.Element {
  return <FlagImg svg={FLAG_SVG} {...props} />;
}
