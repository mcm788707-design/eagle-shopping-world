/**
 * Header Component (header.js)
 */

import { store } from '../store.js';
import { api } from '../api.js';

export function renderHeader(container) {
  const user = store.state.user;
  const cartCount = store.cartCount;

  container.innerHTML = `
    <header class="site-header">
      <div class="container header-inner">
        <!-- Logo -->
        <div class="header-left">
          <button class="mobile-hamburger" id="btn-mobile-menu" aria-label="Open Navigation">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
          <a href="#/" class="logo" aria-label="Eagle Shopping World">Eagle Shopping World</a>
        </div>

        <!-- Search Box -->
        <div class="header-search">
          <div class="search-box">
            <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              id="global-search-input" 
              class="search-input" 
              placeholder="Try Saree, Kurti or Search by Product Code"
              aria-label="Search products"
              autocomplete="off"
            >
          </div>
          <!-- Live Suggestions Dropdown -->
          <div id="search-dropdown-menu" class="search-dropdown"></div>
        </div>

        <!-- Actions Right -->
        <div class="header-right">
          <a href="#/admin" class="header-action-text">
            <span>Become a</span>
            <b>Supplier</b>
          </a>
          <div class="header-divider"></div>
          <a href="#/contact" class="header-action-text">
            <span>Investor</span>
            <b>Relations</b>
          </a>
          <div class="header-divider"></div>
          
          <!-- Profile -->
          <a href="${user ? '#/orders' : '#/login'}" class="header-icon-action" id="btn-profile-nav">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span>${user ? user.name.split(' ')[0] : 'Account'}</span>
          </a>

          <!-- Cart -->
          <button class="header-icon-action" id="btn-header-cart" aria-label="Shopping Cart">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <span>Cart</span>
            <span class="cart-count-badge" id="header-cart-badge">${cartCount}</span>
          </button>
        </div>
      </div>
    </header>
  `;

  // Attach search input listener with debounce
  const searchInput = document.getElementById('global-search-input');
  const dropdown = document.getElementById('search-dropdown-menu');
  let debounceTimer;

  searchInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    const query = e.target.value.trim();
    if (!query) {
      dropdown.classList.remove('active');
      dropdown.innerHTML = '';
      return;
    }

    debounceTimer = setTimeout(async () => {
      const results = await api.getProducts({ search: query, limit: 6 });
      if (!results.items.length) {
        dropdown.innerHTML = `<div class="search-item" style="color:var(--color-text-muted)">No products found for "${query}"</div>`;
      } else {
        dropdown.innerHTML = results.items.map(p => `
          <div class="search-item" data-id="${p.id}">
            <img src="${p.image}" alt="" style="width:36px;height:36px;border-radius:4px;object-fit:cover">
            <div>
              <div style="font-weight:700">${p.name}</div>
              <div style="font-size:12px;color:var(--color-text-muted)">₹${p.price} in ${p.category}</div>
            </div>
          </div>
        `).join('');

        dropdown.querySelectorAll('.search-item').forEach(el => {
          el.addEventListener('click', () => {
            const id = el.dataset.id;
            dropdown.classList.remove('active');
            if (id) window.location.hash = `#/product/${id}`;
          });
        });
      }
      dropdown.classList.add('active');
    }, 250);
  });

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const q = searchInput.value.trim();
      dropdown.classList.remove('active');
      store.setFilters({ search: q });
      if (window.location.hash !== '#/') {
        window.location.hash = '#/';
      }
    }
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.header-search')) {
      dropdown.classList.remove('active');
    }
  });

  // Cart button click
  document.getElementById('btn-header-cart').addEventListener('click', () => {
    store.openCartDrawer();
  });
}
