/**
 * **Côte d'Ivoire** 国旗。ISO: `CI`；只含该国 SVG，**勿手改**（`build-country-flags.mts` 生成）。
 * @see https://github.com/lipis/flag-icons
 */
import type { JSX } from "preact";

import { FlagImg } from "../FlagImg.tsx";
import type { CountryFlagComponentProps } from "../countryFlagTypes.ts";

const FLAG_SVG: string =
  '<svg xmlns="http://www.w3.org/2000/svg" id="flag-icons-ci" viewBox="0 0 512 512"><g fill-rule="evenodd"><path fill="#00cd00" d="M341.5 0H512v512H341.5z"/><path fill="#ff9a00" d="M0 0h170.3v512H0z"/><path fill="#fff" d="M170.3 0h171.2v512H170.3z"/></g></svg>';

/**
 * Côte d'Ivoire — 1:1 独立文件；只 import 本文件不会打入他国。
 */
export function IconFlagCI(props?: CountryFlagComponentProps): JSX.Element {
  return <FlagImg svg={FLAG_SVG} {...props} />;
}
