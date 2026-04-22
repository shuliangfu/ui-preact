#!/usr/bin/env -S deno run -A
/**
 * 自 npm `flag-icons`（MIT）拉取 `country.json` 与各 1:1 SVG，**每个国家/地区一个独立文件**：
 * `src/shared/basic/icons/flags/standalone/IconFlagXX.tsx`（`XX` = 两字母 ISO 大写，如 `IconFlagCN`；只内联**该国** SVG，无全量表）。
 * 并生成 `flags/mod.ts`、`flags/meta.ts`（仅两字母码 + isCountryFlagCode，无 SVG）。
 *
 * 在 `ui-preact` 目录执行（输出 Preact `JSX.Element`；与 ui-view 同源数据）：
 *   deno run -A scripts/build-country-flags.mts
 *
 * 上游：https://github.com/lipis/flag-icons
 */

const FLAG_ICONS_VERSION = "7.5.0";
const BASE = `https://cdn.jsdelivr.net/npm/flag-icons@${FLAG_ICONS_VERSION}`;

const flagsRoot = new URL("../src/shared/basic/icons/flags/", import.meta.url);
const outStandaloneDir = new URL("standalone/", flagsRoot);
const outMetaPath = new URL("meta.ts", flagsRoot);
const outIndexPath = new URL("mod.ts", flagsRoot);

type CountryRow = {
  code: string;
  flag_1x1: string;
  name?: string;
  iso?: boolean;
};

/**
 * 压缩内联的 SVG
 *
 * @param raw 原始内容
 */
function minifyInlineSvg(raw: string): string {
  return raw
    .replace(/^\uFEFF/, "")
    .replace(/<\?xml[^?]*\?>\s*/i, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/>\s+</g, "><")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/**
 * `flag-icons` 的 `xx`（Unknown）1:1：描边为 1 个用户单位 / 512 坐标，缩到 16–32px 时线宽常亚像素，仅见白底。
 * 在写盘前加粗描边并略加深颜色，使「占位符」在组件尺寸下仍可见。
 *
 * @param svg 已 minify 的 1:1 SVG
 * @param code 小写两字母国码
 */
function patchUnknown1x1SvgForSmallDisplay(
  svg: string,
  code: string,
): string {
  if (code !== "xx") return svg;
  return svg.replace(
    /stroke="#adb5bd"/g,
    'stroke="#64748b" stroke-width="32" stroke-linejoin="round" stroke-linecap="round"',
  );
}

/**
 * 两字母国码/地区码 → 短组件名 `IconFlag` + 大写 ISO（如 `cn` → `IconFlagCN`），避免英文全名过长。
 *
 * @param code 小写两字母
 */
function codeToIconFlagName(code: string): string {
  return `IconFlag${code.toUpperCase()}`;
}

const countryRes = await fetch(`${BASE}/country.json`);
if (!countryRes.ok) {
  throw new Error(`country.json: ${countryRes.status}`);
}
const list = (await countryRes.json()) as CountryRow[];

const byCode: Record<string, string> = {};

for (const row of list) {
  if (!row?.code || !row?.flag_1x1) continue;
  const code = String(row.code).toLowerCase();
  const url = `${BASE}/${row.flag_1x1.replace(/^\//, "")}`;
  const r = await fetch(url);
  if (!r.ok) {
    console.warn(`skip ${code} (${r.status}) ${url}`);
    continue;
  }
  const text = minifyInlineSvg(await r.text());
  if (text.length === 0) {
    console.warn(`skip ${code} (empty)`);
    continue;
  }
  byCode[code] = text;
}

const codes = Object.keys(byCode).sort();

/** 每国一行：两字母码唯一，组件名为 `IconFlag` + 大写 ISO。 */
const rows: Array<{
  code: string;
  displayName: string;
  fnName: string;
  svg: string;
}> = [];
for (const row of list) {
  const code = String(row?.code ?? "").toLowerCase();
  if (code.length !== 2 || byCode[code] == null) continue;
  const display = String(row?.name ?? `(${code.toUpperCase()})`)
    .replace(/\s+/g, " ");
  const fnName = codeToIconFlagName(code);
  rows.push({
    code,
    displayName: display,
    fnName,
    svg: patchUnknown1x1SvgForSmallDisplay(byCode[code]!, code),
  });
}
rows.sort((a, b) => a.code.localeCompare(b.code, "en"));

try {
  await Deno.mkdir(outStandaloneDir, { recursive: true });
} catch (e) {
  if (!(e instanceof Deno.errors.AlreadyExists)) {
    throw e;
  }
}

// 清旧单国文件、聚合入口、旧大表/旧单文件
for await (const e of Deno.readDir(outStandaloneDir)) {
  if (e.isFile && e.name.startsWith("IconFlag") && e.name.endsWith(".tsx")) {
    await Deno.remove(new URL(e.name, outStandaloneDir));
  }
}
try {
  await Deno.remove(outIndexPath);
} catch { /*  */ }
try {
  await Deno.remove(outMetaPath);
} catch { /*  */ }
try {
  await Deno.remove(new URL("IconFlagByCountry.gen.tsx", flagsRoot));
} catch { /*  */ }
try {
  await Deno.remove(new URL("flag-svgs-inlined.ts", flagsRoot));
} catch { /*  */ }

const indexExportLines: string[] = [];
for (const r of rows) {
  const file = `${r.fnName}.tsx`;
  const jdoc = r.displayName.replaceAll(`*/`, `*\\/`).replaceAll("\n", " ");
  /**
   * 用行拼接写出生成 TSX，避免 SVG 里含 \` 或 \`${ 时打断本脚本的反引号模板
   */
  const oneFile = [
    "/**",
    ` * **${jdoc}** 国旗。ISO: \`${r.code.toUpperCase()}\`；只含该国 SVG，**勿手改**（\`build-country-flags.mts\` 生成）。`,
    " * @see https://github.com/lipis/flag-icons",
    " */",
    `import type { JSX } from "preact";`,
    "",
    `import { FlagImg } from "../FlagImg.tsx";`,
    `import type { CountryFlagComponentProps } from "../countryFlagTypes.ts";`,
    "",
    "const FLAG_SVG: string = " + JSON.stringify(r.svg) + ";",
    "",
    "/**",
    " * " + jdoc + " — 1:1 独立文件；只 import 本文件不会打入他国。",
    " */",
    "export function " + r.fnName +
    "(props?: CountryFlagComponentProps): JSX.Element {",
    "  return <FlagImg svg={FLAG_SVG} {...props} />;",
    "}",
  ].join("\n");
  const outF = new URL(`standalone/${file}`, flagsRoot);
  await Deno.writeTextFile(outF, oneFile);
  indexExportLines.push(
    `export { ${r.fnName} } from "./standalone/${file}";`,
  );
}
await Deno.writeTextFile(
  outIndexPath,
  `/**
 * 独立国旗下发入口（脚本生成，勿手改）。按需 import 子路径时仅打包所引用的 \`.tsx\`。
 * @see scripts/build-country-flags.mts
 */
${indexExportLines.join("\n")}
`,
);
const metaBody = `/**
 * 仅国码与校验方法，**不含** SVG 文本。生成见 \`scripts/build-country-flags.mts\`。
 */
export const COUNTRY_FLAG_CODES: readonly string[] = ${
  JSON.stringify(codes)
} as const;

const _SET = new Set(COUNTRY_FLAG_CODES) as ReadonlySet<string>;

/**
 * 小写/大写两字母国码/地区码是否在已生成列表中
 */
export function isCountryFlagCode(code: string): boolean {
  const c = String(code).trim().toLowerCase();
  return c.length === 2 && _SET.has(c);
}
`;
await Deno.writeTextFile(outMetaPath, metaBody);

console.log(
  `Wrote ${rows.length} per-country files, mod.ts, meta.ts. Removed monolithic data file.`,
);
