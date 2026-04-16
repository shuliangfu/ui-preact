/**
 * 供 Toast / Message / Notification 等挂到 `document.body`，脱离应用根节点 overflow。
 */

/**
 * @returns 可作为 Portal 容器的 `body`，非浏览器或不可用则为 `null`
 */
export function getBrowserBodyPortalHost(): HTMLElement | null {
  try {
    if (typeof globalThis.document === "undefined") return null;
    const b = globalThis.document.body;
    if (b == null || b.nodeType !== 1) return null;
    return b as HTMLElement;
  } catch {
    return null;
  }
}
