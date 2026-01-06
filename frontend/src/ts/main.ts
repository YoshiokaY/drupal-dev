/**
 * Main entry point
 */

import { initHeader } from './components/header';

/**
 * DOMContentLoaded時の初期化
 */
const init = (): void => {
  initHeader();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
