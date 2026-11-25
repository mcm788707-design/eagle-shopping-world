/**
 * Product Grid & Card Component (productGrid.js)
 * Implements exact product card anatomy and 20-item infinite scroll.
 */

import { api } from '../api.js';
import { store } from '../store.js';

let activeTimers = new Map();
let tickerInterval = null;

function formatCountdown(targetEpoch) {
  const diff = targetEpoch - Date.now();
  if (diff <= 0) return '00h : 00m : 00s';
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  return `${String(hours).padStart(2, '0')}h : ${String(mins).padStart(2, '0')}m : ${String(secs).padStart(2, '0')}s`;
}

function startGlobalTicker() {
  if (tickerInterval) clearInterval(tickerInterval);
  tickerInterval = setInterval(() => {
    activeTimers.forEach((el, target) => {
      if (document.body.contains(el)) {
        el.querySelector('.timer-text').textContent = formatCountdown(target);
      } else {
        activeTimers.delete(target);
      }
    });
  }, 1000);
}

export function renderProductCard(product) {
  const wishlist = store.state.wishlist || [];
  const isWishlisted = wishlist.includes(product.id);
  const discount = Math.round((1 - product.price / product.mrp) * 100);
  const isSub4 = product.rating < 4.0;

  let timerHtml = '';
  if (product.timerEndsAt && product.timerEndsAt > Date.now()) {
    timerHtml = `
      <div class="card-timer-chip" data-timer="${product.timerEndsAt}">
        <span>⏱️</span>
        <span class="timer-text">${formatCountdown(product.timerEndsAt)}</span>
      </div>
    `;
  }

  const moreVariantsHtml = product.moreVariants > 0
    ? `<div class="card-more-chip">+${product.moreVariants} More</div>`
    : '';

  const mallBadgeHtml = product.mall
    ? `<span class="badge-mall">Mall</span>`
    : '';

  const deliveryChipHtml = product.deliveryFee > 0
    ? `<div class="card-delivery-chip">Delivery ₹${product.deliveryFee} <s>₹70</s></div>`
    : '';

  const trustedHtml = product.trusted
    ? `
      <div class="badge-trusted" title="Eagle Shopping World Trusted Quality">
        <svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
        <span>Trusted</span>
      </div>
    ` : '';

  return `
    <article class="product-card" data-id="${product.id}">
      <div class="card-image-wrap">
        <img src="${product.image}" alt="${product.name}" loading="lazy" width="400" height="400">
        <button class="wishlist-btn ${isWishlisted ? 'active' : ''}" data-id="${product.id}" aria-label="Add to Wishlist">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="${isWishlisted ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
        ${timerHtml}
        ${moreVariantsHtml}
      </div>

      <div class="card-body">
        <div class="card-title-row">
          <h3 class="card-product-name" title="${product.name}">${product.name}</h3>
          ${mallBadgeHtml}
        </div>

        <div class="card-price-row">
          <span class="card-price">₹${product.price}</span>
          <span class="card-mrp">₹${product.mrp}</span>
          <span class="card-discount">${discount}% off</span>
        </div>

        ${deliveryChipHtml}

        <div class="card-rating-row">
          <div class="flex items-center gap-2">
            <div class="rating-pill ${isSub4 ? 'sub-4' : ''}">
              <span>${product.rating}</span>
              <span>★</span>
            </div>
            <span class="card-reviews-count">${Number(product.reviews).toLocaleString('en-IN')} Reviews</span>
          </div>
          ${trustedHtml}
        </div>
      </div>
    </article>
  `;
}

export function renderProductGridManager(container) {
  container.innerHTML = `
    <div class="products-section-wrap">
      <div class="section-hdr">
        <h2 class="section-title">Products For You</h2>
      </div>

      <div class="products-layout-grid">
        <!-- Sidebar placeholder -->
        <div id="sidebar-container"></div>

        <!-- Products Column -->
        <div class="products-column">
          <div class="product-grid" id="main-product-grid"></div>
          
          <!-- Infinite Scroll Loader & Trigger -->
          <div class="infinite-scroll-trigger" id="infinite-scroll-trigger">
            <div id="grid-loader-spinner" class="flex gap-2 items-center" style="color:var(--color-text-muted);font-weight:600">
              <span style="display:inline-block;animation:spin 1s linear infinite">⏳</span> Loading more products...
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Sort/Filter Sticky Bottom Bar -->
    <div class="mobile-filter-bar">
      <button class="mobile-filter-btn" id="btn-mobile-sort">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="6" x2="20" y2="6"></line><line x1="7" y1="12" x2="17" y2="12"></line><line x1="10" y1="18" x2="14" y2="18"></line></svg>
        <span>Sort</span>
      </button>
      <button class="mobile-filter-btn" id="btn-mobile-filter">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
        <span>Filter</span>
      </button>
    </div>
  `;

  const gridEl = document.getElementById('main-product-grid');
  const triggerEl = document.getElementById('infinite-scroll-trigger');
  let currentPage = 1;
  let isLoading = false;
  let hasMore = true;

  async function loadProducts(isNewQuery = false) {
    if (isLoading) return;
    if (isNewQuery) {
      currentPage = 1;
      hasMore = true;
      gridEl.innerHTML = Array(8).fill(0).map(() => `
        <div class="skeleton" style="height:320px;border-radius:8px"></div>
      `).join('');
    }

    if (!hasMore) {
      triggerEl.style.display = 'none';
      return;
    }

    isLoading = true;
    triggerEl.style.display = 'flex';

    try {
      const filters = store.state.filters;
      const res = await api.getProducts({
        ...filters,
        page: currentPage,
        limit: 20
      });

      if (isNewQuery) {
        gridEl.innerHTML = '';
      }

      if (!res.items.length && currentPage === 1) {
        gridEl.innerHTML = `
          <div style="grid-column: 1 / -1; padding: 48px 16px; text-align: center; color: var(--color-text-muted);">
            <div style="font-size: 48px; margin-bottom: 12px;">🔍</div>
            <h3 style="font-size: 18px; color: var(--color-text-main); margin-bottom: 6px;">No products match your criteria</h3>
            <p>Try resetting filters or searching for another keyword.</p>
          </div>
        `;
        triggerEl.style.display = 'none';
        return;
      }

      // Render cards
      const frag = document.createDocumentFragment();
      const temp = document.createElement('div');
      temp.innerHTML = res.items.map(renderProductCard).join('');

      while (temp.firstChild) {
        frag.appendChild(temp.firstChild);
      }
      gridEl.appendChild(frag);

      // Register live countdown chips
      gridEl.querySelectorAll('.card-timer-chip').forEach(el => {
        const target = parseInt(el.dataset.timer, 10);
        if (target) activeTimers.set(target, el);
      });
      startGlobalTicker();

      // Attach Card click and Wishlist events
      attachCardEvents(gridEl);

      hasMore = res.hasMore;
      currentPage++;
      if (!hasMore) {
        triggerEl.style.display = 'none';
      }
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      isLoading = false;
    }
  }

  function attachCardEvents(parent) {
    parent.querySelectorAll('.product-card').forEach(card => {
      card.onclick = (e) => {
        if (e.target.closest('.wishlist-btn')) {
          e.stopPropagation();
          const id = parseInt(card.dataset.id, 10);
          store.toggleWishlist(id);
          const btn = card.querySelector('.wishlist-btn');
          btn.classList.toggle('active');
          const isAct = btn.classList.contains('active');
          btn.querySelector('svg').setAttribute('fill', isAct ? 'currentColor' : 'none');
          return;
        }
        window.location.hash = `#/product/${card.dataset.id}`;
      };
    });
  }

  // Intersection Observer for Infinite Scroll
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !isLoading && hasMore) {
      loadProducts(false);
    }
  }, { rootMargin: '300px' });

  observer.observe(triggerEl);

  // Subscribe to filter changes
  store.subscribe((event) => {
    if (event === 'filters_changed') {
      loadProducts(true);
    }
  });

  // Initial load
  loadProducts(true);
}
