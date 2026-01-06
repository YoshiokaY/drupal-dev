/**
 * DOM utility functions
 */

/**
 * 要素を取得（型安全）
 */
export const $ = <T extends HTMLElement = HTMLElement>(
  selector: string,
  parent: ParentNode = document
): T | null => {
  return parent.querySelector<T>(selector);
};

/**
 * 複数要素を取得（型安全）
 */
export const $$ = <T extends HTMLElement = HTMLElement>(
  selector: string,
  parent: ParentNode = document
): T[] => {
  return Array.from(parent.querySelectorAll<T>(selector));
};

/**
 * イベントリスナーを安全に追加
 */
export const on = <K extends keyof HTMLElementEventMap>(
  element: HTMLElement | null,
  event: K,
  handler: (e: HTMLElementEventMap[K]) => void,
  options?: AddEventListenerOptions
): void => {
  element?.addEventListener(event, handler, options);
};
