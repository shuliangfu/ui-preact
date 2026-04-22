/**
 * **Guyana** 国旗。ISO: `GY`；只含该国 SVG，**勿手改**（`build-country-flags.mts` 生成）。
 * @see https://github.com/lipis/flag-icons
 */
import type { JSX } from "preact";

import { FlagImg } from "../FlagImg.tsx";
import type { CountryFlagComponentProps } from "../countryFlagTypes.ts";

const FLAG_SVG: string =
  '<svg xmlns="http://www.w3.org/2000/svg" id="flag-icons-gy" viewBox="0 0 512 512"><g fill-rule="evenodd"><path fill="#399408" d="M2 0h510v512H2z"/><path fill="#fff" d="M.1 0c-.6 0 495.7 257.6 495.7 257.6L0 511.7z"/><path fill="#ffde08" d="M.2 21.5C3 21.5 447.5 254 445 256.2L1.5 494.2.2 21.4z"/><path fill="#000001" d="M1.5.8c1.5 0 232.8 257 232.8 257L1.5 508.8z"/><path fill="#de2110" d="M.2 36.2C1.6 20.2 209 258.5 209 258.5L.2 481.8z"/></g></svg>';

/**
 * Guyana — 1:1 独立文件；只 import 本文件不会打入他国。
 */
export function IconFlagGY(props?: CountryFlagComponentProps): JSX.Element {
  return <FlagImg svg={FLAG_SVG} {...props} />;
}
