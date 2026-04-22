/**
 * **Greenland** 国旗。ISO: `GL`；只含该国 SVG，**勿手改**（`build-country-flags.mts` 生成）。
 * @see https://github.com/lipis/flag-icons
 */
import type { JSX } from "preact";

import { FlagImg } from "../FlagImg.tsx";
import type { CountryFlagComponentProps } from "../countryFlagTypes.ts";

const FLAG_SVG: string =
  '<svg xmlns="http://www.w3.org/2000/svg" id="flag-icons-gl" viewBox="0 0 512 512"><path fill="#fff" d="M0 0h512v512H0z"/><path fill="#d00c33" d="M0 256h512v256H0zm53.3 0a170.7 170.7 0 1 0 341.4 0 170.7 170.7 0 0 0-341.4 0"/></svg>';

/**
 * Greenland — 1:1 独立文件；只 import 本文件不会打入他国。
 */
export function IconFlagGL(props?: CountryFlagComponentProps): JSX.Element {
  return <FlagImg svg={FLAG_SVG} {...props} />;
}
