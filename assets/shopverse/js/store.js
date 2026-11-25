/**
 * Shopverse Reactive State Store (store.js)
 */

import { api } from './api.js';

class Store {
  constructor() {
    this.listeners = new Set();
    this.state = {
      user: null,
      cart: [],
      wishlist: [],
      categories: [],
      filters: {
        category: 'all',
        search: '',
        minPrice: null,
        maxPrice: null,
        minRating: null,
        minDiscount: null,
        mallOnly: false,
        goldOnly: false,
        sortBy: 'relevance',
        page: 1
      },
      isCartDrawerOpen: false
    };
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(event, payload) {
    this.listeners.forEach(fn => {
      try {
        fn(event, payload, this.state);
      } catch (err) {
        console.error('Store listener error:', err);
      }
    });
  }

  async init() {
    await api.init();
    this.state.user = await api.getSession();
    this.state.cart = await api.getCart();
    this.state.wishlist = await api.getWishlist();
    this.state.categories = await api.getCategories();
    this.notify('init', this.state);
  }

  get cartCount() {
    return this.state.cart.reduce((sum, item) => sum + (item.qty || 1), 0);
  }

  get cartTotal() {
    return this.state.cart.reduce((sum, item) => sum + (item.product?.price || 0) * (item.qty || 1), 0);
  }

  async addToCart(productId, qty = 1) {
    this.state.cart = await api.addToCart(productId, qty);
    this.notify('cart_updated', this.state.cart);
    this.toast('Added to cart!');
  }

  async updateCartQty(productId, qty) {
    this.state.cart = await api.updateCartQty(productId, qty);
    this.notify('cart_updated', this.state.cart);
  }

  async toggleWishlist(productId) {
    this.state.wishlist = await api.toggleWishlist(productId);
    const isSaved = this.state.wishlist.includes(productId);
    this.notify('wishlist_updated', this.state.wishlist);
    this.toast(isSaved ? 'Added to Wishlist ❤️' : 'Removed from Wishlist');
  }

  openCartDrawer() {
    this.state.isCartDrawerOpen = true;
    this.notify('cart_drawer_opened');
  }

  closeCartDrawer() {
    this.state.isCartDrawerOpen = false;
    this.notify('cart_drawer_closed');
  }

  setFilters(partialFilters) {
    this.state.filters = { ...this.state.filters, ...partialFilters, page: partialFilters.page || 1 };
    this.notify('filters_changed', this.state.filters);
  }

  resetFilters() {
    this.state.filters = {
      category: 'all',
      search: '',
      minPrice: null,
      maxPrice: null,
      minRating: null,
      minDiscount: null,
      mallOnly: false,
      goldOnly: false,
      sortBy: 'relevance',
      page: 1
    };
    this.notify('filters_changed', this.state.filters);
  }

  toast(message) {
    const el = document.getElementById('toast-notice');
    if (el) {
      el.textContent = message;
      el.classList.add('show');
      clearTimeout(this._toastTimer);
      this._toastTimer = setTimeout(() => {
        el.classList.remove('show');
      }, 2400);
    }
  }
}

export const store = new Store();
