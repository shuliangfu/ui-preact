/**
 * **Greece** 国旗。ISO: `GR`；只含该国 SVG，**勿手改**（`build-country-flags.mts` 生成）。
 * @see https://github.com/lipis/flag-icons
 */
import type { JSX } from "preact";

import { FlagImg } from "../FlagImg.tsx";
import type { CountryFlagComponentProps } from "../countryFlagTypes.ts";

const FLAG_SVG: string =
  '<svg xmlns="http://www.w3.org/2000/svg" id="flag-icons-gr" viewBox="0 0 512 512"><path fill="#0d5eaf" fill-rule="evenodd" d="M0 0h512v57H0z"/><path fill="#fff" fill-rule="evenodd" d="M0 57h512v57H0z"/><path fill="#0d5eaf" fill-rule="evenodd" d="M0 114h512v57H0z"/><path fill="#fff" fill-rule="evenodd" d="M0 171h512v57H0z"/><path fill="#0d5eaf" fill-rule="evenodd" d="M0 228h512v56.9H0z"/><path fill="#fff" fill-rule="evenodd" d="M0 284.9h512v57H0z"/><path fill="#0d5eaf" fill-rule="evenodd" d="M0 341.9h512v57H0z"/><path fill="#fff" fill-rule="evenodd" d="M0 398.9h512v57H0z"/><path fill="#0d5eaf" d="M0 0h284.9v284.9H0z"/><g fill="#fff" fill-rule="evenodd" stroke-width="1.3"><path d="M114 0h57v284.9h-57z"/><path d="M0 114h284.9v57H0z"/></g><path fill="#0d5eaf" fill-rule="evenodd" d="M0 455h512v57H0z"/></svg>';

/**
 * Greece — 1:1 独立文件；只 import 本文件不会打入他国。
 */
export function IconFlagGR(props?: CountryFlagComponentProps): JSX.Element {
  return <FlagImg svg={FLAG_SVG} {...props} />;
}
