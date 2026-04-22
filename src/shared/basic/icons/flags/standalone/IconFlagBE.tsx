/**
 * **Belgium** 国旗。ISO: `BE`；只含该国 SVG，**勿手改**（`build-country-flags.mts` 生成）。
 * @see https://github.com/lipis/flag-icons
 */
import type { JSX } from "preact";

import { FlagImg } from "../FlagImg.tsx";
import type { CountryFlagComponentProps } from "../countryFlagTypes.ts";

const FLAG_SVG: string =
  '<svg xmlns="http://www.w3.org/2000/svg" id="flag-icons-be" viewBox="0 0 512 512"><g fill-rule="evenodd" stroke-width="1pt"><path fill="#000001" d="M0 0h170.7v512H0z"/><path fill="#ffd90c" d="M170.7 0h170.6v512H170.7z"/><path fill="#f31830" d="M341.3 0H512v512H341.3z"/></g></svg>';

/**
 * Belgium — 1:1 独立文件；只 import 本文件不会打入他国。
 */
export function IconFlagBE(props?: CountryFlagComponentProps): JSX.Element {
  return <FlagImg svg={FLAG_SVG} {...props} />;
}
