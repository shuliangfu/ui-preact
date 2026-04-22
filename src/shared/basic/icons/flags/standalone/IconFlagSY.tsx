/**
 * **Syria** 国旗。ISO: `SY`；只含该国 SVG，**勿手改**（`build-country-flags.mts` 生成）。
 * @see https://github.com/lipis/flag-icons
 */
import type { JSX } from "preact";

import { FlagImg } from "../FlagImg.tsx";
import type { CountryFlagComponentProps } from "../countryFlagTypes.ts";

const FLAG_SVG: string =
  '<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" id="flag-icons-sy" viewBox="0 0 512 512"><path d="M0 0h512v512H0Z"/><path fill="#fff" d="M0 0h512v341.3H0Z"/><path fill="#007a3d" d="M0 0h512v170.7H0Z"/><path fill="#ce1126" d="M26.3 317.9 67.2 192 108 317.9 1 240h132.4m270.5 77.8L445 192l40.8 125.9-107-77.8H511m-295.9 77.8L256 192l40.9 125.9-107-77.8h132.3"/></svg>';

/**
 * Syria — 1:1 独立文件；只 import 本文件不会打入他国。
 */
export function IconFlagSY(props?: CountryFlagComponentProps): JSX.Element {
  return <FlagImg svg={FLAG_SVG} {...props} />;
}
