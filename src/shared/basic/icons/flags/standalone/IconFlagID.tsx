/**
 * **Indonesia** 国旗。ISO: `ID`；只含该国 SVG，**勿手改**（`build-country-flags.mts` 生成）。
 * @see https://github.com/lipis/flag-icons
 */
import type { JSX } from "preact";

import { FlagImg } from "../FlagImg.tsx";
import type { CountryFlagComponentProps } from "../countryFlagTypes.ts";

const FLAG_SVG: string =
  '<svg xmlns="http://www.w3.org/2000/svg" id="flag-icons-id" viewBox="0 0 512 512"><path fill="#e70011" d="M0 0h512v256H0Z"/><path fill="#fff" d="M0 256h512v256H0Z"/></svg>';

/**
 * Indonesia — 1:1 独立文件；只 import 本文件不会打入他国。
 */
export function IconFlagID(props?: CountryFlagComponentProps): JSX.Element {
  return <FlagImg svg={FLAG_SVG} {...props} />;
}
