/**
 * 将同步自 ui-view 的 docs 路由中的 `@dreamer/view` / `createSignal` 等批量迁到
 * `@preact/signals` 与 `preact/hooks`。
 *
 * 用法（在 `ui-preact` 包根）：`deno run -A scripts/codemod-docs-routes-view-to-preact.ts`
 */
import {
  dirname,
  fromFileUrl,
  join,
  readdir,
  readTextFile,
  writeTextFile,
} from "@dreamer/runtime-adapter";

const scriptDir = dirname(fromFileUrl(import.meta.url));
const ROUTES_ROOT = join(scriptDir, "..", "docs", "src", "routes");

async function processFile(path: string): Promise<void> {
  let t = await readTextFile(path);
  const orig = t;

  t = t.replaceAll("@dreamer/ui-view/mobile", "@dreamer/ui-preact/mobile");
  t = t.replaceAll("@dreamer/ui-view/form", "@dreamer/ui-preact/form");
  t = t.replaceAll("@dreamer/ui-view", "@dreamer/ui-preact");

  t = t.replaceAll(
    'import { createMemo, createSignal } from "@dreamer/view";',
    'import { computed, signal } from "@preact/signals";',
  );
  t = t.replaceAll(
    "import { createMemo, createSignal } from '@dreamer/view';",
    "import { computed, signal } from '@preact/signals';",
  );
  t = t.replace(/\bcreateMemo\(/g, "computed(");

  t = t.replaceAll(
    'import { createSignal } from "@dreamer/view";',
    'import { signal } from "@preact/signals";',
  );
  t = t.replaceAll(
    "import { createSignal } from '@dreamer/view';",
    "import { signal } from '@preact/signals';",
  );

  t = t.replaceAll(
    `import {
  createRenderEffect,
  createSignal,
  onCleanup,
} from "@dreamer/view";`,
    `import { signal } from "@preact/signals";
import { onCleanup, useLayoutEffect } from "preact/hooks";`,
  );
  t = t.replace(
    /\bcreateRenderEffect\(\(\)\s*=>\s*\{/g,
    "useLayoutEffect(() => {",
  );

  t = t.replaceAll(
    'import { createSignal, onCleanup } from "@dreamer/view";',
    'import { signal } from "@preact/signals";\nimport { onCleanup } from "preact/hooks";',
  );

  t = t.replaceAll(
    'import { createMemo } from "@dreamer/view";',
    'import { computed } from "@preact/signals";',
  );

  t = t.replaceAll(
    'import { onCleanup, onMount, type VNode } from "@dreamer/view";',
    'import type { ComponentChildren } from "preact";\nimport { onCleanup, onMount } from "preact/hooks";',
  );
  t = t.replace(/\bVNode\b/g, "ComponentChildren");

  t = t.replace(/\bcreateSignal\(/g, "signal(");

  t = t.replace(
    /import \{ signal \} from "@preact\/signals";\nimport \{ signal \} from "@preact\/signals";\n/g,
    'import { signal } from "@preact/signals";\n',
  );

  if (t !== orig) {
    await writeTextFile(path, t);
    console.log("updated", path);
  }
}

async function walk(dir: string): Promise<void> {
  const entries = await readdir(dir);
  for (const ent of entries) {
    const p = join(dir, ent.name);
    if (ent.isDirectory) await walk(p);
    else if (ent.name.endsWith(".tsx") || ent.name.endsWith(".ts")) {
      await processFile(p);
    }
  }
}

await walk(ROUTES_ROOT);
console.log("codemod finished:", ROUTES_ROOT);
