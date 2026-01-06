/**
 * Header component
 */

export const initHeader = (): void => {
  const header = document.querySelector<HTMLElement>('.header');
  if (!header) return;

  // スクロール時のヘッダースタイル変更例
  let lastScrollY = 0;

  const handleScroll = (): void => {
    const currentScrollY = window.scrollY;

    if (currentScrollY > 100) {
      header.classList.add('header-scrolled');
    } else {
      header.classList.remove('header-scrolled');
    }

    lastScrollY = currentScrollY;
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
};
