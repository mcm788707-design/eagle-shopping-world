/**
 * Mega Menu Component (megamenu.js)
 */

import { store } from '../store.js';

export function renderCategoryNav(container) {
  const categories = store.state.categories;

  container.innerHTML = `
    <nav class="category-nav-bar" id="category-nav-bar">
      <div class="container">
        <div class="category-nav-list" id="category-nav-list">
          ${categories.map(c => `
            <div class="category-nav-item" data-slug="${c.slug}" tabindex="0" role="button" aria-haspopup="true">
              ${c.name}
            </div>
          `).join('')}
        </div>
      </div>
      <!-- Mega Menu Panel -->
      <div class="mega-menu-panel" id="global-mega-menu">
        <div class="container">
          <div class="mega-menu-inner" id="mega-menu-content"></div>
        </div>
      </div>
    </nav>
  `;

  const megaMenu = document.getElementById('global-mega-menu');
  const megaContent = document.getElementById('mega-menu-content');
  const items = container.querySelectorAll('.category-nav-item');
  let closeTimer;

  function showMega(catSlug) {
    clearTimeout(closeTimer);
    const cat = categories.find(c => c.slug === catSlug);
    if (!cat || !cat.columns) return;

    items.forEach(el => el.classList.toggle('active', el.dataset.slug === catSlug));

    megaContent.innerHTML = cat.columns.map((col, idx) => `
      <div class="mega-column ${idx === 1 ? 'highlight' : ''}">
        <div class="mega-column-title">${col.title}</div>
        <div class="mega-link-list">
          ${col.items.map(subItem => `
            <a href="#/category/${cat.slug}?sub=${encodeURIComponent(subItem)}" class="mega-link" data-slug="${cat.slug}" data-sub="${subItem}">
              ${subItem}
            </a>
          `).join('')}
        </div>
      </div>
    `).join('');

    megaMenu.classList.add('active');

    // Attach click events on mega menu links
    megaContent.querySelectorAll('.mega-link').forEach(link => {
      link.addEventListener('click', (e) => {
        megaMenu.classList.remove('active');
        items.forEach(el => el.classList.remove('active'));
      });
    });
  }

  function hideMega() {
    closeTimer = setTimeout(() => {
      megaMenu.classList.remove('active');
      items.forEach(el => el.classList.remove('active'));
    }, 180);
  }

  items.forEach(item => {
    item.addEventListener('mouseenter', () => showMega(item.dataset.slug));
    item.addEventListener('focus', () => showMega(item.dataset.slug));
    item.addEventListener('mouseleave', hideMega);
    item.addEventListener('click', () => {
      const slug = item.dataset.slug;
      store.setFilters({ category: slug });
      window.location.hash = slug === 'popular' ? '#/' : `#/category/${slug}`;
      hideMega();
    });
  });

  megaMenu.addEventListener('mouseenter', () => clearTimeout(closeTimer));
  megaMenu.addEventListener('mouseleave', hideMega);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      megaMenu.classList.remove('active');
      items.forEach(el => el.classList.remove('active'));
    }
  });
}
