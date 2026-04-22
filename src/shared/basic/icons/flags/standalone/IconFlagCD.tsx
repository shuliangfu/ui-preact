/**
 * **Democratic Republic of the Congo** 国旗。ISO: `CD`；只含该国 SVG，**勿手改**（`build-country-flags.mts` 生成）。
 * @see https://github.com/lipis/flag-icons
 */
import type { JSX } from "preact";

import { FlagImg } from "../FlagImg.tsx";
import type { CountryFlagComponentProps } from "../countryFlagTypes.ts";

const FLAG_SVG: string =
  '<svg xmlns="http://www.w3.org/2000/svg" id="flag-icons-cd" viewBox="0 0 512 512"><defs><clipPath id="cd-a"><path fill="#fff" d="M0-88h600v600H0z"/></clipPath></defs><g clip-path="url(#cd-a)" transform="translate(0 75.1)scale(.853)"><path fill="#007fff" d="M0-88h800v600H0z"/><path fill="#f7d618" d="M36 32h84l26-84 26 84h84l-68 52 26 84-68-52-68 52 26-84zM750-88 0 362v150h50L800 62V-88z"/><path fill="#ce1021" d="M800-88 0 392v120L800 32z"/></g></svg>';

/**
 * Democratic Republic of the Congo — 1:1 独立文件；只 import 本文件不会打入他国。
 */
export function IconFlagCD(props?: CountryFlagComponentProps): JSX.Element {
  return <FlagImg svg={FLAG_SVG} {...props} />;
}
