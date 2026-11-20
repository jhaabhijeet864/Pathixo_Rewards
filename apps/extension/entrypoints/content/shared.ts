/**
 * Returns the last element of a NodeList, or null if empty.
 */
export function lastOf<T extends HTMLElement>(list: NodeListOf<T> | T[]): T | null {
  return list.length > 0 ? list[list.length - 1] : null;
}

/**
 * Checks whether an element is visible in the viewport and not display:none / hidden.
 */
export function isElementVisible(el: HTMLElement): boolean {
  if (!el.isConnected) return false;
  const style = window.getComputedStyle(el);
  if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
    return false;
  }
  const rect = el.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}
