/**
 * **Panama** 国旗。ISO: `PA`；只含该国 SVG，**勿手改**（`build-country-flags.mts` 生成）。
 * @see https://github.com/lipis/flag-icons
 */
import type { JSX } from "preact";

import { FlagImg } from "../FlagImg.tsx";
import type { CountryFlagComponentProps } from "../countryFlagTypes.ts";

const FLAG_SVG: string =
  '<svg xmlns="http://www.w3.org/2000/svg" id="flag-icons-pa" viewBox="0 0 512 512"><defs><clipPath id="pa-a"><path fill-opacity=".7" d="M0 0h512v512H0z"/></clipPath></defs><g fill-rule="evenodd" clip-path="url(#pa-a)"><path fill="#fff" d="M-26-25h592.5v596H-26z"/><path fill="#db0000" d="M255.3-20.4h312.1v275.2h-312z"/><path fill="#0000ab" d="M-54.5 254.8h309.9V571H-54.5zM179 181.6l-46.5-29.2-46.2 29.5 17.2-48-46.2-29.6 57.1-.4 17.7-47.8 18.1 47.7h57.1l-45.9 30z"/><path fill="#d80000" d="m435.2 449-46.4-29.2-46.3 29.5 17.2-48-46.2-29.5 57.2-.4 17.7-47.8 18 47.7h57.2l-46 30z"/></g></svg>';

/**
 * Panama — 1:1 独立文件；只 import 本文件不会打入他国。
 */
export function IconFlagPA(props?: CountryFlagComponentProps): JSX.Element {
  return <FlagImg svg={FLAG_SVG} {...props} />;
}
