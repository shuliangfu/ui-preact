/**
 * **South Sudan** 国旗。ISO: `SS`；只含该国 SVG，**勿手改**（`build-country-flags.mts` 生成）。
 * @see https://github.com/lipis/flag-icons
 */
import type { JSX } from "preact";

import { FlagImg } from "../FlagImg.tsx";
import type { CountryFlagComponentProps } from "../countryFlagTypes.ts";

const FLAG_SVG: string =
  '<svg xmlns="http://www.w3.org/2000/svg" id="flag-icons-ss" viewBox="0 0 512 512"><path fill="#078930" d="M0 358.4h512V512H0z"/><path fill="#fff" d="M0 153.6h512v204.8H0z"/><path fill="#000001" d="M0 0h512v153.6H0z"/><path fill="#da121a" d="M0 179.2h512v153.6H0z"/><path fill="#0f47af" d="m0 0 433 256L0 512z"/><path fill="#fcdd09" d="M209 207.8 64.4 256l144.8 48.1-89.5-126v155.8z"/></svg>';

/**
 * South Sudan — 1:1 独立文件；只 import 本文件不会打入他国。
 */
export function IconFlagSS(props?: CountryFlagComponentProps): JSX.Element {
  return <FlagImg svg={FLAG_SVG} {...props} />;
}
