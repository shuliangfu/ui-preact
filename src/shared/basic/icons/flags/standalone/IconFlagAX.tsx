/**
 * **Aland Islands** 国旗。ISO: `AX`；只含该国 SVG，**勿手改**（`build-country-flags.mts` 生成）。
 * @see https://github.com/lipis/flag-icons
 */
import type { JSX } from "preact";

import { FlagImg } from "../FlagImg.tsx";
import type { CountryFlagComponentProps } from "../countryFlagTypes.ts";

const FLAG_SVG: string =
  '<svg xmlns="http://www.w3.org/2000/svg" id="flag-icons-ax" viewBox="0 0 512 512"><defs><clipPath id="ax-a"><path fill-opacity=".7" d="M166 0h850v850H166z"/></clipPath></defs><g clip-path="url(#ax-a)" transform="translate(-100)scale(.6024)"><path fill="#0053a5" d="M0 0h1300v850H0z"/><g fill="#ffce00"><path d="M400 0h250v850H400z"/><path d="M0 300h1300v250H0z"/></g><g fill="#d21034"><path d="M475 0h100v850H475z"/><path d="M0 375h1300v100H0z"/></g></g></svg>';

/**
 * Aland Islands — 1:1 独立文件；只 import 本文件不会打入他国。
 */
export function IconFlagAX(props?: CountryFlagComponentProps): JSX.Element {
  return <FlagImg svg={FLAG_SVG} {...props} />;
}
