/**
 * Shopverse Main Application Entry Point (app.js)
 * Modular ES Modules architecture
 */

import { store } from './store.js';
import { renderHeader } from './ui/header.js';
import { renderCategoryNav } from './ui/megamenu.js';
import { renderCartDrawer } from './ui/cartDrawer.js';
import { initRouter } from './router.js';

async function bootstrap() {
  try {
    // 1. Initialize State Store and Seed Data
    await store.init();

    // 2. Render Sticky Header
    const headerMount = document.getElementById('site-header-mount');
    if (headerMount) renderHeader(headerMount);

    // 3. Render Category Nav & Mega Menu
    const navMount = document.getElementById('category-nav-mount');
    if (navMount) renderCategoryNav(navMount);

    // 4. Mount Cart Drawer
    renderCartDrawer();

    // 5. Initialize Hash Router for Page Content
    const appMount = document.getElementById('app-main-mount');
    if (appMount) await initRouter(appMount);

    // 6. Header Cart Count Subscriber
    store.subscribe((event) => {
      if (event === 'cart_updated' || event === 'init') {
        const badge = document.getElementById('header-cart-badge');
        if (badge) badge.textContent = store.cartCount;
      }
    });

    // 7. Scroll-to-top Button
    const scrollTopBtn = document.getElementById('btn-scroll-top');
    if (scrollTopBtn) {
      window.addEventListener('scroll', () => {
        scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
      });
      scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    console.log('Eagle Shopping World front-end initialized successfully.');
  } catch (err) {
    console.error('Bootstrap error:', err);
  }
}

// Start application
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
