/**
 * **Gambia** 国旗。ISO: `GM`；只含该国 SVG，**勿手改**（`build-country-flags.mts` 生成）。
 * @see https://github.com/lipis/flag-icons
 */
import type { JSX } from "preact";

import { FlagImg } from "../FlagImg.tsx";
import type { CountryFlagComponentProps } from "../countryFlagTypes.ts";

const FLAG_SVG: string =
  '<svg xmlns="http://www.w3.org/2000/svg" id="flag-icons-gm" viewBox="0 0 512 512"><g fill-rule="evenodd" stroke-width="1pt"><path fill="red" d="M0 0h512v170.7H0z"/><path fill="#fff" d="M0 170.7h512V199H0z"/><path fill="#009" d="M0 199.1h512V313H0z"/><path fill="#fff" d="M0 312.9h512v28.4H0z"/><path fill="#090" d="M0 341.3h512V512H0z"/></g></svg>';

/**
 * Gambia — 1:1 独立文件；只 import 本文件不会打入他国。
 */
export function IconFlagGM(props?: CountryFlagComponentProps): JSX.Element {
  return <FlagImg svg={FLAG_SVG} {...props} />;
}
