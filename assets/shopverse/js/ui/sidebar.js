/**
 * Sidebar Filters & Sorting Component (sidebar.js)
 */

import { store } from '../store.js';

export function renderSidebar(container) {
  const currentFilters = store.state.filters;

  container.innerHTML = `
    <aside class="filters-sidebar" id="filters-sidebar">
      <!-- Sort By Dropdown -->
      <div class="sidebar-sort-wrap">
        <div class="sort-label">Sort by</div>
        <select class="sort-select" id="sort-select">
          <option value="relevance" ${currentFilters.sortBy === 'relevance' ? 'selected' : ''}>Relevance</option>
          <option value="price-low" ${currentFilters.sortBy === 'price-low' ? 'selected' : ''}>Price: Low to High</option>
          <option value="price-high" ${currentFilters.sortBy === 'price-high' ? 'selected' : ''}>Price: High to Low</option>
          <option value="rating" ${currentFilters.sortBy === 'rating' ? 'selected' : ''}>Customer Rating</option>
          <option value="discount" ${currentFilters.sortBy === 'discount' ? 'selected' : ''}>Biggest Discount</option>
        </select>
      </div>

      <!-- Filters Header -->
      <div class="filters-header flex justify-between items-center">
        <div>
          <div class="filters-title">FILTERS</div>
          <div class="filters-subtitle">1000+ Products</div>
        </div>
        <button id="btn-clear-filters" style="font-size:12px;font-weight:700;color:var(--color-primary)">Clear All</button>
      </div>

      <!-- Occasion (Festive) -->
      <div class="filter-group">
        <div class="filter-group-header">
          <span>Occasion</span>
          <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </div>
        <div class="filter-group-body">
          <label class="filter-checkbox-label">
            <input type="checkbox" id="filter-festive" ${currentFilters.goldOnly ? 'checked' : ''}>
            <span>Festive Collection</span>
          </label>
        </div>
      </div>

      <!-- Price Chips Group -->
      <div class="filter-group">
        <div class="filter-group-header">
          <span>Price</span>
          <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </div>
        <div class="filter-group-body">
          <div class="price-chips-grid">
            ${[
              { label: 'Under ₹199', max: 199, min: 0 },
              { label: 'Under ₹249', max: 249, min: 0 },
              { label: 'Under ₹299', max: 299, min: 0 },
              { label: 'Under ₹349', max: 349, min: 0 },
              { label: 'Under ₹399', max: 399, min: 0 },
              { label: 'Under ₹449', max: 449, min: 0 },
              { label: 'Under ₹499', max: 499, min: 0 },
              { label: '₹200 – ₹249', max: 249, min: 200 },
              { label: '₹250 – ₹299', max: 299, min: 250 },
              { label: '₹300 – ₹399', max: 399, min: 300 },
              { label: '₹400 – ₹499', max: 499, min: 400 },
              { label: '₹500 – ₹599', max: 599, min: 500 }
            ].map(chip => {
              const isActive = currentFilters.maxPrice === chip.max && (currentFilters.minPrice === chip.min || (chip.min === 0 && !currentFilters.minPrice));
              return `
                <button 
                  class="price-chip ${isActive ? 'active' : ''}" 
                  data-min="${chip.min}" 
                  data-max="${chip.max}">
                  ${chip.label}
                </button>
              `;
            }).join('')}
          </div>
          <button id="btn-show-more-prices" style="font-size:12px;color:var(--color-primary);font-weight:700;align-self:flex-start;margin-top:4px">Show More</button>
        </div>
      </div>

      <!-- Rating Group -->
      <div class="filter-group">
        <div class="filter-group-header">
          <span>Rating</span>
          <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </div>
        <div class="filter-group-body">
          ${[4.0, 3.5, 3.0].map(r => `
            <label class="filter-checkbox-label">
              <input type="radio" name="rating-filter" value="${r}" ${currentFilters.minRating === r ? 'checked' : ''}>
              <span>${r}★ &amp; above</span>
            </label>
          `).join('')}
        </div>
      </div>

      <!-- Discount Group -->
      <div class="filter-group">
        <div class="filter-group-header">
          <span>Discount</span>
          <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </div>
        <div class="filter-group-body">
          ${[10, 20, 30, 50].map(d => `
            <label class="filter-checkbox-label">
              <input type="radio" name="discount-filter" value="${d}" ${currentFilters.minDiscount === d ? 'checked' : ''}>
              <span>${d}% or more</span>
            </label>
          `).join('')}
        </div>
      </div>

      <!-- Eagle Gold -->
      <div class="filter-group">
        <div class="filter-group-header">
          <span>Eagle Gold</span>
          <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </div>
        <div class="filter-group-body">
          <label class="filter-checkbox-label">
            <input type="checkbox" id="filter-gold" ${currentFilters.goldOnly ? 'checked' : ''}>
            <span>Gold Exclusive (Assured Quality)</span>
          </label>
        </div>
      </div>

      <!-- Eagle Mall -->
      <div class="filter-group">
        <div class="filter-group-header">
          <span>Eagle Mall</span>
          <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </div>
        <div class="filter-group-body">
          <label class="filter-checkbox-label">
            <input type="checkbox" id="filter-mall" ${currentFilters.mallOnly ? 'checked' : ''}>
            <span>Mall Products (Direct from Brand)</span>
          </label>
        </div>
      </div>

      <!-- Collapsible Aesthetic Groups (Fit/Shape, Country, Print, Waist) -->
      ${['Fit / Shape', 'Country of Origin', 'Print or Pattern Type', 'Waist Rise'].map(title => `
        <div class="filter-group collapsed">
          <div class="filter-group-header">
            <span>${title}</span>
            <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>
          <div class="filter-group-body">
            <label class="filter-checkbox-label">
              <input type="checkbox">
              <span>All Varieties</span>
            </label>
            <label class="filter-checkbox-label">
              <input type="checkbox">
              <span>Regular Standard</span>
            </label>
          </div>
        </div>
      `).join('')}
    </aside>
  `;

  // Sort change
  const sortSelect = document.getElementById('sort-select');
  sortSelect.addEventListener('change', (e) => {
    store.setFilters({ sortBy: e.target.value });
  });

  // Price chips
  container.querySelectorAll('.price-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      const min = parseInt(btn.dataset.min, 10);
      const max = parseInt(btn.dataset.max, 10);
      const isAlreadyActive = btn.classList.contains('active');
      store.setFilters({
        minPrice: isAlreadyActive ? null : min,
        maxPrice: isAlreadyActive ? null : max
      });
    });
  });

  // Rating radio
  container.querySelectorAll('input[name="rating-filter"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      store.setFilters({ minRating: parseFloat(e.target.value) });
    });
  });

  // Discount radio
  container.querySelectorAll('input[name="discount-filter"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      store.setFilters({ minDiscount: parseInt(e.target.value, 10) });
    });
  });

  // Mall checkbox
  const mallCb = document.getElementById('filter-mall');
  if (mallCb) {
    mallCb.addEventListener('change', (e) => {
      store.setFilters({ mallOnly: e.target.checked });
    });
  }

  // Gold checkbox
  const goldCb = document.getElementById('filter-gold');
  if (goldCb) {
    goldCb.addEventListener('change', (e) => {
      store.setFilters({ goldOnly: e.target.checked });
    });
  }

  // Festive checkbox
  const festiveCb = document.getElementById('filter-festive');
  if (festiveCb) {
    festiveCb.addEventListener('change', (e) => {
      store.setFilters({ goldOnly: e.target.checked });
    });
  }

  // Clear all filters
  document.getElementById('btn-clear-filters').addEventListener('click', () => {
    store.resetFilters();
  });

  // Accordion toggle chevrons
  container.querySelectorAll('.filter-group-header').forEach(hdr => {
    hdr.addEventListener('click', () => {
      hdr.parentElement.classList.toggle('collapsed');
    });
  });
}
