/**
 * Shopverse Hash-Based Client Router (router.js)
 */

import { store } from './store.js';
import { api } from './api.js';

// UI Module Imports
import { renderHeroCarousel } from './ui/carousel.js';
import { renderSidebar } from './ui/sidebar.js';
import { renderProductGridManager } from './ui/productGrid.js';
import { renderAdminPanel } from './ui/admin.js';

export async function initRouter(appRoot) {
  async function handleRoute() {
    const hash = window.location.hash || '#/';
    const path = hash.slice(1); // remove '#'

    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (path === '/' || path === '') {
      await renderHomeView(appRoot);
    } else if (path.startsWith('/category/')) {
      const slug = path.split('/')[2];
      await renderCategoryView(appRoot, slug);
    } else if (path.startsWith('/product/')) {
      const id = path.split('/')[2];
      await renderProductDetailView(appRoot, id);
    } else if (path === '/cart') {
      await renderCartPageView(appRoot);
    } else if (path === '/checkout') {
      await renderCheckoutView(appRoot);
    } else if (path === '/orders') {
      await renderOrdersView(appRoot);
    } else if (path === '/wishlist') {
      await renderWishlistView(appRoot);
    } else if (path === '/login') {
      await renderLoginView(appRoot);
    } else if (path === '/register') {
      await renderRegisterView(appRoot);
    } else if (path === '/admin') {
      await renderAdminPanel(appRoot);
    } else if (path === '/contact' || path === '/resources' || path.startsWith('/info/')) {
      await renderContactView(appRoot);
    } else {
      appRoot.innerHTML = `
        <div class="container" style="padding:60px 0;text-align:center">
          <div style="font-size:48px;margin-bottom:12px">🛍️</div>
          <h2>Page Not Found</h2>
          <p style="color:var(--color-text-muted);margin:8px 0 20px">The page you requested does not exist or has been moved.</p>
          <a href="#/" class="btn btn-primary">Return Home</a>
        </div>
      `;
    }
  }

  window.addEventListener('hashchange', handleRoute);
  await handleRoute();
}

/**
 * HOME VIEW (Sections 3 to 9)
 */
async function renderHomeView(container) {
  container.innerHTML = `
    <div class="container">
      <!-- Section 3: Hero Carousel -->
      <div id="hero-carousel-mount"></div>

      <!-- Section 4: Trust Strip -->
      <section class="trust-strip">
        <div class="trust-item">
          <span>🔄</span>
          <span>7 Days Easy Return</span>
        </div>
        <div class="trust-divider"></div>
        <div class="trust-item">
          <span>💵</span>
          <span>Cash on Delivery</span>
        </div>
        <div class="trust-divider"></div>
        <div class="trust-item">
          <span>🏷️</span>
          <span>Lowest Prices</span>
        </div>
      </section>

      <!-- Section 5: Circular / Arch Category Row -->
      <section class="arch-categories-section">
        <div class="section-hdr">
          <h2 class="section-title">Top Categories</h2>
        </div>
        <div style="position:relative">
          <button class="scroller-arrow left" id="arch-scroll-left" aria-label="Scroll Left">‹</button>
          <div class="arch-scroll-container" id="arch-scroll-container">
            ${[
              { name: "Ethnic Wear", file: "assets/placeholders/arch_ethnic.svg", cat: "kurti-saree-lehenga" },
              { name: "Western Dresses", file: "assets/placeholders/arch_western.svg", cat: "women-western" },
              { name: "Menswear", file: "assets/placeholders/arch_men.svg", cat: "men" },
              { name: "Footwear", file: "assets/placeholders/arch_footwear.svg", cat: "bags-footwear" },
              { name: "Home Decor", file: "assets/placeholders/arch_homedecor.svg", cat: "home-kitchen" },
              { name: "Beauty", file: "assets/placeholders/arch_beauty.svg", cat: "beauty-health" },
              { name: "Accessories", file: "assets/placeholders/arch_accessories.svg", cat: "jewellery-accessories" }
            ].map(a => `
              <div class="arch-tile" data-cat="${a.cat}">
                <div class="arch-shape">
                  <img src="${a.file}" alt="${a.name}" width="220" height="260" loading="lazy">
                </div>
                <div class="arch-label">${a.name}</div>
              </div>
            `).join('')}
          </div>
          <button class="scroller-arrow right" id="arch-scroll-right" aria-label="Scroll Right">›</button>
        </div>
      </section>

      <!-- Section 6: Festive "Gold" Promo Banner -->
      <section class="festive-gold-banner">
        <div class="gold-banner-left">
          <div class="gold-wordmark-wrap">
            <span class="gold-star-icon">✦</span>
            <span class="gold-wordmark">Gold</span>
          </div>
          <div class="gold-tagline">Products you Love. Quality we Trust.</div>
          <a href="#/category/kurti-saree-lehenga" class="btn btn-gold-outline">Shop Now</a>
        </div>
        <div class="gold-banner-right">
          ${[
            { name: "Lehengas", file: "assets/placeholders/gold_lehengas.svg" },
            { name: "Menwear", file: "assets/placeholders/gold_menwear.svg" },
            { name: "Sarees", file: "assets/placeholders/gold_sarees.svg" },
            { name: "Jewellery", file: "assets/placeholders/gold_jewellery.svg" }
          ].map(g => `
            <div class="gold-arch-card" onclick="window.location.hash='#/category/popular'">
              <img src="${g.file}" alt="${g.name}" width="200" height="240" loading="lazy">
            </div>
          `).join('')}
        </div>
      </section>

      <!-- Section 7: Original Brands -->
      <section class="original-brands-section">
        <div class="section-hdr">
          <div class="brands-title-wrap">
            <h2 class="section-title">Original Brands</h2>
            <span class="verified-badge">✓</span>
          </div>
          <a href="#/category/popular" class="view-all-link">VIEW ALL &gt;</a>
        </div>

        <!-- Horizontal Carousel of Brand Category Cards -->
        <div class="brand-categories-scroller">
          ${[
            { name: "Personal Care", file: "assets/placeholders/brand_personal_care.svg" },
            { name: "Electronics", file: "assets/placeholders/brand_electronics.svg" },
            { name: "Makeup", file: "assets/placeholders/brand_makeup.svg" },
            { name: "Men Perfume", file: "assets/placeholders/brand_perfume.svg" },
            { name: "Bags", file: "assets/placeholders/brand_bags.svg" },
            { name: "Footwear", file: "assets/placeholders/brand_footwear.svg" },
            { name: "Home Care", file: "assets/placeholders/brand_homecare.svg" }
          ].map(b => `
            <div class="brand-category-card" onclick="window.location.hash='#/category/beauty-health'">
              <div class="brand-card-img">
                <img src="${b.file}" alt="${b.name}" width="260" height="260" loading="lazy">
              </div>
              <div class="brand-card-label">${b.name}</div>
            </div>
          `).join('')}
        </div>

        <!-- Marquee Auto-Scrolling Strip of Logo Tiles -->
        <div class="brands-marquee-wrap">
          <div class="brands-marquee-track">
            ${[
              'WOW Skin Science', 'mamaearth', 'WILD STONE', 'plum', 'NIVEA', 'Himalaya',
              'boAt', 'Libas', 'Roadster', 'Pampers', 'Vaseline', 'Zouk', 'Noise',
              'WOW Skin Science', 'mamaearth', 'WILD STONE', 'plum', 'NIVEA', 'Himalaya'
            ].map(name => `
              <div class="brand-logo-tile">
                <span>✨</span>
                <span>${name}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- Section 8: App Download Banner -->
      <section class="app-download-banner">
        <div class="app-banner-left">
          <div class="app-upto">Up to</div>
          <div class="app-big-discount">35% OFF</div>
          <div class="app-tagline">on first order</div>
          <div class="app-only-text">*Only on App</div>
          <button class="btn btn-app-download" onclick="alert('Download the Shopverse Android & iOS mobile app from the App Store!')">Download Now</button>
          <div class="app-tc-text">*T&amp;C Apply</div>
        </div>
        <div class="app-banner-right">
          ${[
            { title: "Trending Now", file: "assets/placeholders/app_trending.svg" },
            { title: "Budget Buys", file: "assets/placeholders/app_budget.svg" },
            { title: "Top Rated Picks", file: "assets/placeholders/app_toprated.svg" },
            { title: "Daily Essentials", file: "assets/placeholders/app_essentials.svg" }
          ].map(app => `
            <div class="app-portrait-card" onclick="window.location.hash='#/category/popular'">
              <img src="${app.file}" alt="${app.title}" width="160" height="220" loading="lazy">
            </div>
          `).join('')}
        </div>
      </section>

      <!-- Section 9: "Products For You" Listing (Sidebar + 4-Col Grid) -->
      <div id="products-listing-mount"></div>
    </div>
  `;

  // Mount Hero Carousel
  renderHeroCarousel(document.getElementById('hero-carousel-mount'));

  // Mount Products Grid & Sidebar
  renderProductGridManager(document.getElementById('products-listing-mount'));
  renderSidebar(document.getElementById('sidebar-container'));

  // Arch categories scroller arrows
  const archScroller = document.getElementById('arch-scroll-container');
  document.getElementById('arch-scroll-left').onclick = () => archScroller.scrollBy({ left: -260, behavior: 'smooth' });
  document.getElementById('arch-scroll-right').onclick = () => archScroller.scrollBy({ left: 260, behavior: 'smooth' });

  // Arch tiles click
  container.querySelectorAll('.arch-tile').forEach(t => {
    t.onclick = () => {
      const cat = t.dataset.cat;
      store.setFilters({ category: cat });
      window.location.hash = `#/category/${cat}`;
    };
  });
}

/**
 * CATEGORY VIEW (#/category/:slug)
 */
async function renderCategoryView(container, slug) {
  store.setFilters({ category: slug });
  container.innerHTML = `
    <div class="container" style="padding-top:20px">
      <div style="font-size:13px;color:var(--color-text-muted);margin-bottom:12px">
        <a href="#/" style="color:var(--color-primary)">Home</a> / 
        <span style="text-transform:capitalize">${slug.replace(/-/g, ' ')}</span>
      </div>
      <div id="products-listing-mount"></div>
    </div>
  `;
  renderProductGridManager(document.getElementById('products-listing-mount'));
  renderSidebar(document.getElementById('sidebar-container'));
}

/**
 * PRODUCT DETAIL VIEW (#/product/:id)
 */
async function renderProductDetailView(container, id) {
  const product = await api.getProductById(id);
  if (!product) {
    container.innerHTML = `
      <div class="container" style="padding:48px 0;text-align:center">
        <h2>Product not found</h2>
        <a href="#/" class="btn btn-primary" style="margin-top:16px">Back to Shopping</a>
      </div>
    `;
    return;
  }

  const discount = Math.round((1 - product.price / product.mrp) * 100);

  container.innerHTML = `
    <div class="container product-detail-view">
      <div style="font-size:13px;color:var(--color-text-muted);margin-bottom:16px">
        <a href="#/" style="color:var(--color-primary)">Home</a> / 
        <a href="#/category/${product.category.toLowerCase().replace(/[^a-z0-9]/g, '-')}" style="color:var(--color-primary)">${product.category}</a> / 
        <span>${product.name}</span>
      </div>

      <div class="product-detail-grid">
        <!-- Gallery -->
        <div class="product-gallery">
          <div class="gallery-main-img">
            <img id="detail-main-img" src="${product.image}" alt="${product.name}" width="500" height="500">
          </div>
          <div class="gallery-thumbs">
            ${(product.images || [product.image]).map((imgSrc, i) => `
              <div class="gallery-thumb ${i === 0 ? 'active' : ''}" data-src="${imgSrc}">
                <img src="${imgSrc}" alt="" width="72" height="72">
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Info & Actions -->
        <div class="product-info-panel">
          <div>
            <div class="product-brand">${product.brand}</div>
            <h1 class="product-title">${product.name}</h1>
          </div>

          <div class="flex items-center gap-3">
            <div class="rating-pill">
              <span>${product.rating}</span>
              <span>★</span>
            </div>
            <span style="font-size:13px;color:var(--color-text-muted)">${Number(product.reviews).toLocaleString('en-IN')} Ratings &amp; Reviews</span>
            ${product.mall ? '<span class="badge-mall">Mall</span>' : ''}
            ${product.trusted ? '<span class="badge-trusted">✓ Trusted Quality</span>' : ''}
          </div>

          <div class="product-price-box">
            <span class="product-big-price">₹${product.price}</span>
            <span class="product-detail-mrp">₹${product.mrp}</span>
            <span class="product-detail-discount">${discount}% off</span>
          </div>

          <div class="detail-trust-pills">
            <span class="detail-trust-pill">🔄 7 Days Easy Returns</span>
            <span class="detail-trust-pill">💵 Cash on Delivery Available</span>
            <span class="detail-trust-pill">🚚 ${product.deliveryFee === 0 ? 'Free Delivery' : 'Standard Delivery ₹' + product.deliveryFee}</span>
          </div>

          <div style="border-top:1px solid var(--color-card-border);padding-top:16px">
            <h4 style="font-size:14px;font-weight:700;margin-bottom:8px">Product Details</h4>
            <p style="font-size:14px;color:var(--color-text-muted);line-height:1.6">${product.description}</p>
          </div>

          <div class="product-actions-row">
            <button class="btn btn-add-cart" id="btn-detail-add-cart">Add to Cart</button>
            <button class="btn btn-buy-now" id="btn-detail-buy-now">Buy Now</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Gallery thumbnail click
  const mainImg = document.getElementById('detail-main-img');
  container.querySelectorAll('.gallery-thumb').forEach(th => {
    th.onclick = () => {
      container.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
      th.classList.add('active');
      mainImg.src = th.dataset.src;
    };
  });

  document.getElementById('btn-detail-add-cart').onclick = () => {
    store.addToCart(product.id, 1);
    store.openCartDrawer();
  };

  document.getElementById('btn-detail-buy-now').onclick = () => {
    store.addToCart(product.id, 1);
    window.location.hash = '#/checkout';
  };
}

/**
 * CART PAGE VIEW (#/cart)
 */
async function renderCartPageView(container) {
  const items = store.state.cart;
  const count = store.cartCount;
  const subtotal = store.cartTotal;
  const discount = Math.round(subtotal * 0.1);
  const delivery = subtotal >= 499 || subtotal === 0 ? 0 : 49;
  const total = subtotal - discount + delivery;

  container.innerHTML = `
    <div class="container" style="padding:32px 0 60px">
      <h1 style="font-size:26px;font-weight:800;margin-bottom:20px">Shopping Cart (${count})</h1>
      ${!items.length ? `
        <div style="text-align:center;padding:60px 16px;background:#ffffff;border-radius:12px;border:1px solid var(--color-card-border)">
          <div style="font-size:64px;margin-bottom:14px">🛒</div>
          <h2>Your Cart is Empty</h2>
          <p style="color:var(--color-text-muted);margin:8px 0 20px">Explore thousands of products with daily discounts.</p>
          <a href="#/" class="btn btn-primary">Start Shopping</a>
        </div>
      ` : `
        <div class="checkout-grid">
          <div style="background:#fff;border:1px solid var(--color-card-border);border-radius:8px;padding:20px">
            ${items.map(c => `
              <div class="cart-item-card" style="padding:16px 0">
                <div class="cart-item-img" style="width:90px;height:90px">
                  <img src="${c.product.image}" alt="">
                </div>
                <div class="cart-item-info">
                  <div style="font-weight:700;font-size:15px">${c.product.name}</div>
                  <div style="color:var(--color-text-muted);font-size:13px">${c.product.brand}</div>
                  <div class="flex items-center gap-2" style="margin:6px 0">
                    <span style="font-size:18px;font-weight:800">₹${c.product.price}</span>
                    <span style="color:var(--color-text-muted);text-decoration:line-through;font-size:13px">₹${c.product.mrp}</span>
                  </div>
                  <div class="cart-qty-ctrl">
                    <button class="qty-btn btn-pg-minus" data-id="${c.productId}">−</button>
                    <span style="font-weight:800;font-size:14px">${c.qty}</span>
                    <button class="qty-btn btn-pg-plus" data-id="${c.productId}">+</button>
                    <button class="btn-pg-remove" data-id="${c.productId}" style="margin-left:24px;color:#c0392b;font-weight:600;font-size:13px">Remove</button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>

          <div style="background:#fff;border:1px solid var(--color-card-border);border-radius:8px;padding:24px;height:max-content">
            <h3 style="font-size:18px;font-weight:800;margin-bottom:16px">Price Details</h3>
            <div class="cart-summary-row">
              <span>Total MRP</span>
              <span>₹${items.reduce((s, i) => s + i.product.mrp * i.qty, 0)}</span>
            </div>
            <div class="cart-summary-row" style="color:var(--color-success)">
              <span>Coupon Discount (10%)</span>
              <span>−₹${discount}</span>
            </div>
            <div class="cart-summary-row">
              <span>Delivery Charges</span>
              <span>${delivery === 0 ? '<b style="color:var(--color-success)">FREE</b>' : `₹${delivery}`}</span>
            </div>
            <div class="cart-total-row">
              <span>Total Amount</span>
              <span style="color:var(--color-primary-dark)">₹${total}</span>
            </div>
            <a href="#/checkout" class="btn btn-primary w-full" style="margin-top:20px;padding:14px">Proceed to Checkout</a>
          </div>
        </div>
      `}
    </div>
  `;

  container.querySelectorAll('.btn-pg-plus').forEach(b => {
    b.onclick = () => {
      const id = parseInt(b.dataset.id, 10);
      const item = items.find(x => x.productId === id);
      if (item) store.updateCartQty(id, item.qty + 1);
      renderCartPageView(container);
    };
  });

  container.querySelectorAll('.btn-pg-minus').forEach(b => {
    b.onclick = () => {
      const id = parseInt(b.dataset.id, 10);
      const item = items.find(x => x.productId === id);
      if (item) store.updateCartQty(id, item.qty - 1);
      renderCartPageView(container);
    };
  });

  container.querySelectorAll('.btn-pg-remove').forEach(b => {
    b.onclick = () => {
      const id = parseInt(b.dataset.id, 10);
      store.updateCartQty(id, 0);
      renderCartPageView(container);
    };
  });
}

/**
 * CHECKOUT VIEW (#/checkout)
 */
async function renderCheckoutView(container) {
  const items = store.state.cart;
  if (!items.length) {
    window.location.hash = '#/cart';
    return;
  }

  const subtotal = store.cartTotal;
  const delivery = subtotal >= 499 ? 0 : 49;
  const total = subtotal + delivery;
  const user = store.state.user;

  container.innerHTML = `
    <div class="container checkout-view">
      <h1 style="font-size:26px;font-weight:800;margin-bottom:20px">Checkout</h1>
      <div class="checkout-grid">
        <form class="checkout-box" id="checkout-form">
          <h3 style="font-size:18px;margin-bottom:14px">1. Delivery Address</h3>
          <label class="form-label">Full Name *</label>
          <input class="form-input" name="name" required value="${user ? user.name : 'Rahul Sharma'}">

          <div class="flex gap-3">
            <div style="flex:1">
              <label class="form-label">Mobile Number (10 Digits) *</label>
              <input class="form-input" name="phone" required pattern="[0-9]{10}" placeholder="9876543210" value="9876543210">
            </div>
            <div style="flex:1">
              <label class="form-label">PIN Code (6 Digits) *</label>
              <input class="form-input" name="pincode" required pattern="[0-9]{6}" placeholder="560001" value="560001">
            </div>
          </div>

          <label class="form-label">Street Address / House No. *</label>
          <textarea class="form-textarea" name="address" required rows="3">Flat 402, Green Glen Layout, Bellandur, Bengaluru</textarea>

          <h3 style="font-size:18px;margin:24px 0 14px">2. Payment Method</h3>
          <div style="display:flex;flex-direction:column;gap:10px">
            <label class="filter-checkbox-label" style="background:#fcfcfd;padding:12px;border:1px solid #e0e0e6;border-radius:6px">
              <input type="radio" name="payment" value="Cash on Delivery" checked>
              <span><b>Cash on Delivery (COD)</b> — Pay cash or UPI at your doorstep</span>
            </label>
            <label class="filter-checkbox-label" style="background:#fcfcfd;padding:12px;border:1px solid #e0e0e6;border-radius:6px">
              <input type="radio" name="payment" value="UPI Demo">
              <span><b>UPI (Google Pay, PhonePe, Paytm)</b></span>
            </label>
            <label class="filter-checkbox-label" style="background:#fcfcfd;padding:12px;border:1px solid #e0e0e6;border-radius:6px">
              <input type="radio" name="payment" value="Card Demo">
              <span><b>Debit / Credit Card</b></span>
            </label>
          </div>

          <button class="btn btn-primary w-full" style="margin-top:24px;padding:14px;font-size:16px">
            Place Order · ₹${total}
          </button>
        </form>

        <div class="checkout-box" style="height:max-content">
          <h3 style="font-size:18px;margin-bottom:14px">Order Summary</h3>
          ${items.map(i => `
            <div class="flex justify-between" style="font-size:13px;margin-bottom:8px">
              <span>${i.product.name} × ${i.qty}</span>
              <b>₹${i.product.price * i.qty}</b>
            </div>
          `).join('')}
          <div class="cart-total-row" style="margin-top:16px">
            <span>Total Payable</span>
            <span style="color:var(--color-primary-dark)">₹${total}</span>
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('checkout-form').onsubmit = async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const orderData = {
      customerName: f.get('name'),
      phone: f.get('phone'),
      address: `${f.get('address')}, PIN: ${f.get('pincode')}`,
      paymentMethod: f.get('payment'),
      items: store.state.cart,
      subtotal,
      delivery,
      total,
      userId: user ? user.userId : null
    };

    const order = await api.placeOrder(orderData);
    store.toast(`Order placed successfully! Order ID: ${order.id}`);
    window.location.hash = '#/orders';
  };
}

/**
 * ORDERS VIEW (#/orders)
 */
async function renderOrdersView(container) {
  const user = store.state.user;
  const orders = await api.getOrders(user ? user.userId : null);

  container.innerHTML = `
    <div class="container" style="padding:32px 0 60px">
      <div class="flex justify-between items-center" style="margin-bottom:20px">
        <h1 style="font-size:26px;font-weight:800">My Orders (${orders.length})</h1>
        ${user ? `<button class="btn btn-outline btn-sm" id="btn-user-logout">Log Out</button>` : ''}
      </div>

      ${!orders.length ? `
        <div style="text-align:center;padding:60px 16px;background:#fff;border-radius:12px;border:1px solid var(--color-card-border)">
          <div style="font-size:64px;margin-bottom:14px">📦</div>
          <h2>No Orders Found</h2>
          <p style="color:var(--color-text-muted);margin:8px 0 20px">You haven't placed any orders yet.</p>
          <a href="#/" class="btn btn-primary">Start Shopping</a>
        </div>
      ` : orders.map(o => `
        <div class="checkout-box" style="margin-bottom:16px">
          <div class="flex justify-between items-center" style="border-bottom:1px solid var(--color-card-border);padding-bottom:10px;margin-bottom:12px">
            <div>
              <b style="font-size:15px">Order #${o.id}</b>
              <div style="font-size:12px;color:var(--color-text-muted)">Placed on ${new Date(o.createdAt).toLocaleString()}</div>
            </div>
            <span class="rating-pill" style="background:#2b59ff">${o.status}</span>
          </div>

          <div style="font-size:14px;margin-bottom:10px">
            ${(o.items || []).map(i => `
              <div class="flex justify-between" style="margin-bottom:4px">
                <span>${i.product?.name || 'Item'} × ${i.qty}</span>
                <b>₹${(i.product?.price || 0) * i.qty}</b>
              </div>
            `).join('')}
          </div>

          <div class="flex justify-between items-center" style="border-top:1px dashed var(--color-card-border);padding-top:10px;font-size:14px">
            <span style="color:var(--color-text-muted)">Payment: ${o.paymentMethod || 'COD'}</span>
            <span style="font-size:18px;font-weight:900;color:var(--color-primary-dark)">Total: ₹${o.total}</span>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  const logoutBtn = document.getElementById('btn-user-logout');
  if (logoutBtn) {
    logoutBtn.onclick = async () => {
      await api.logout();
      store.state.user = null;
      store.toast('Logged out successfully');
      window.location.hash = '#/';
    };
  }
}

/**
 * WISHLIST VIEW (#/wishlist)
 */
async function renderWishlistView(container) {
  const wishlistIds = store.state.wishlist;
  const allProds = (await api.getProducts({ limit: 500 })).items;
  const saved = allProds.filter(p => wishlistIds.includes(p.id));

  container.innerHTML = `
    <div class="container" style="padding:32px 0 60px">
      <h1 style="font-size:26px;font-weight:800;margin-bottom:20px">My Wishlist (${saved.length})</h1>
      ${!saved.length ? `
        <div style="text-align:center;padding:60px 16px;background:#fff;border-radius:12px;border:1px solid var(--color-card-border)">
          <div style="font-size:64px;margin-bottom:14px">❤️</div>
          <h2>Your Wishlist is Empty</h2>
          <p style="color:var(--color-text-muted);margin:8px 0 20px">Save items you love by tapping the heart icon on any product.</p>
          <a href="#/" class="btn btn-primary">Discover Products</a>
        </div>
      ` : `
        <div class="product-grid">
          ${saved.map(p => `
            <div class="product-card" data-id="${p.id}">
              <div class="card-image-wrap">
                <img src="${p.image}" alt="">
              </div>
              <div class="card-body">
                <h3 class="card-product-name">${p.name}</h3>
                <div class="card-price-row">
                  <span class="card-price">₹${p.price}</span>
                  <span class="card-mrp">₹${p.mrp}</span>
                </div>
                <button class="btn btn-primary btn-sm" onclick="event.stopPropagation();store.addToCart(${p.id},1)" style="margin-top:8px">
                  Move to Cart
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      `}
    </div>
  `;

  container.querySelectorAll('.product-card').forEach(c => {
    c.onclick = () => window.location.hash = `#/product/${c.dataset.id}`;
  });
}

/**
 * LOGIN VIEW (#/login)
 */
async function renderLoginView(container) {
  container.innerHTML = `
    <div class="auth-view-wrap">
      <div class="auth-card">
        <h2>Welcome to Shopverse</h2>
        <p style="color:var(--color-text-muted);font-size:13px;margin-bottom:16px">Log in to track orders, manage your wishlist and checkout faster.</p>
        <form id="login-form">
          <label class="form-label">Email Address</label>
          <input type="email" class="form-input" id="auth-email" required placeholder="your.name@example.com">

          <label class="form-label">Password</label>
          <input type="password" class="form-input" id="auth-pass" required placeholder="••••••••">

          <div id="auth-err" class="auth-err-msg"></div>

          <button class="btn btn-primary w-full" style="margin-top:16px">Log In</button>
        </form>

        <p style="text-align:center;font-size:13px;margin-top:18px">
          New to Shopverse? <a href="#/register" style="color:var(--color-primary);font-weight:700">Create an Account</a>
        </p>

        <div style="font-size:11.5px;color:var(--color-text-muted);margin-top:16px;background:#fafafa;padding:8px 12px;border-radius:4px">
          <b>Admin Demo Access:</b> admin@shopverse.com / Admin@123
        </div>
      </div>
    </div>
  `;

  document.getElementById('login-form').onsubmit = async (e) => {
    e.preventDefault();
    const errEl = document.getElementById('auth-err');
    errEl.textContent = '';
    try {
      const email = document.getElementById('auth-email').value;
      const pass = document.getElementById('auth-pass').value;
      const user = await api.login(email, pass);
      store.state.user = user;
      store.toast(`Welcome back, ${user.name}!`);
      window.location.hash = user.role === 'admin' ? '#/admin' : '#/';
    } catch (err) {
      errEl.textContent = err.message;
    }
  };
}

/**
 * REGISTER VIEW (#/register)
 */
async function renderRegisterView(container) {
  container.innerHTML = `
    <div class="auth-view-wrap">
      <div class="auth-card">
        <h2>Create Account</h2>
        <p style="color:var(--color-text-muted);font-size:13px;margin-bottom:16px">Sign up for exclusive daily deals and fast delivery.</p>
        <form id="register-form">
          <label class="form-label">Full Name</label>
          <input type="text" class="form-input" id="reg-name" required placeholder="e.g. Priya Patel">

          <label class="form-label">Email Address</label>
          <input type="email" class="form-input" id="reg-email" required placeholder="priya@example.com">

          <label class="form-label">Password (Min 6 Characters)</label>
          <input type="password" class="form-input" id="reg-pass" required minlength="6" placeholder="••••••••">

          <div id="reg-err" class="auth-err-msg"></div>

          <button class="btn btn-primary w-full" style="margin-top:16px">Create Account</button>
        </form>

        <p style="text-align:center;font-size:13px;margin-top:18px">
          Already have an account? <a href="#/login" style="color:var(--color-primary);font-weight:700">Log In</a>
        </p>
      </div>
    </div>
  `;

  document.getElementById('register-form').onsubmit = async (e) => {
    e.preventDefault();
    const errEl = document.getElementById('reg-err');
    errEl.textContent = '';
    try {
      const name = document.getElementById('reg-name').value;
      const email = document.getElementById('reg-email').value;
      const pass = document.getElementById('reg-pass').value;
      const user = await api.register(name, email, pass);
      store.state.user = user;
      store.toast('Account created successfully!');
      window.location.hash = '#/';
    } catch (err) {
      errEl.textContent = err.message;
    }
  };
}

/**
 * CONTACT & RESOURCES VIEW (#/contact or #/resources)
 */
async function renderContactView(container) {
  container.innerHTML = `
    <div class="container contact-wrap">
      <div class="contact-hero">
        <div class="contact-breadcrumb">Eagle Groups India · Corporate Directory</div>
        <h1 class="contact-res-title">Resources</h1>
        <div class="contact-section-title">Contact Us</div>
        <div class="contact-quote">
          “We stand on a strong foundation of rapid growth, innovative solutions, and a clear vision for the future. Join us in building a more efficient and sustainable tomorrow.”
          <div style="font-style:normal;font-weight:700;margin-top:6px;color:var(--color-primary)">— M.S. Lingam, Founder &amp; Managing Director</div>
        </div>
      </div>

      <div class="contact-stats-grid">
        <div class="contact-stat-box">
          <div class="contact-stat-num">2018</div>
          <div class="contact-stat-lbl">Established</div>
        </div>
        <div class="contact-stat-box">
          <div class="contact-stat-num">4</div>
          <div class="contact-stat-lbl">Regional Branches</div>
        </div>
        <div class="contact-stat-box">
          <div class="contact-stat-num">100+</div>
          <div class="contact-stat-lbl">Enterprise Clients</div>
        </div>
        <div class="contact-stat-box">
          <div class="contact-stat-num">17</div>
          <div class="contact-stat-lbl">Cities across 9+ States</div>
        </div>
      </div>

      <div class="contact-main-grid">
        <!-- Left Column -->
        <div class="contact-col">
          <div class="contact-panel">
            <div class="contact-panel-hdr">
              <h3>Queries and Grievance Redressal</h3>
              <span>SLA: 24–48 Hrs</span>
            </div>
            <div class="contact-officer">
              <div class="officer-name">M.S. Lingam</div>
              <div class="officer-role">Founder | Managing Director</div>
              <div class="contact-actions">
                <a class="contact-action-btn" href="mailto:lingam@eaglegroupsindia.com">✉️ lingam@eaglegroupsindia.com</a>
                <a class="contact-action-btn" href="tel:+919538998799">📞 +91 95389 98799</a>
              </div>
            </div>
            <div class="contact-officer">
              <div class="officer-name">Murugan</div>
              <div class="officer-role">General Manager &amp; Grievance Officer</div>
              <div class="contact-actions">
                <a class="contact-action-btn" href="mailto:murugan@eaglegroupsindia.com">✉️ murugan@eaglegroupsindia.com</a>
                <a class="contact-action-btn" href="tel:+918050429402">📞 +91 80504 29402</a>
              </div>
            </div>
          </div>

          <div class="contact-panel">
            <div class="contact-panel-hdr">
              <h3>Supply Chain &amp; Commercial Relations</h3>
              <span>Procurement</span>
            </div>
            <div class="contact-officer">
              <div class="officer-name">Vijesh</div>
              <div class="officer-role">Supply Chain Manager</div>
              <div class="contact-actions">
                <a class="contact-action-btn" href="mailto:vijesh@eaglegroupsindia.com">✉️ vijesh@eaglegroupsindia.com</a>
                <a class="contact-action-btn" href="tel:+919035069019">📞 +91 90350 69019</a>
              </div>
            </div>
            <div style="margin-top:14px;padding-top:12px;border-top:1px dashed var(--color-card-border);font-size:13px;color:var(--color-text-muted)">
              <b>General Corporate Desk:</b>
              <div class="contact-actions" style="margin-top:6px">
                <a class="contact-action-btn" href="mailto:info@eaglegroupsindia.com">✉️ info@eaglegroupsindia.com</a>
                <a class="contact-action-btn" href="https://eaglegroupsindia.com" target="_blank" rel="noopener">🌐 eaglegroupsindia.com</a>
              </div>
            </div>
          </div>

          <div class="contact-panel">
            <div class="contact-panel-hdr">
              <h3>Registered Office Address</h3>
              <span>HQ</span>
            </div>
            <div class="corp-address">
              <b style="font-size:16px">Eagle Groups India</b><br>
              <span style="color:var(--color-text-muted)">Building Excellence. Delivering Trust. Growing Together.</span><br><br>
              📍 <b>Headquarters:</b> Bengaluru, Karnataka, India<br>
              🏢 <b>Regional Hubs:</b> Bengaluru · Hyderabad · Chennai
            </div>
            <div class="corp-quick-links">
              <a href="assets/eagle-groups-profile.pdf" download="Eagle-Groups-Company-Profile.pdf">📄 Download Company Profile (PDF)</a>
              <span>·</span>
              <a href="https://maps.google.com/?q=Bengaluru+Karnataka" target="_blank" rel="noopener">🗺️ View Location Map</a>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="contact-col">
          <div class="contact-panel">
            <div class="contact-panel-hdr">
              <h3>Our Business Divisions</h3>
              <span>3 Verticals</span>
            </div>
            <div class="business-unit-card">
              <div class="business-unit-name">🏢 Eagle Enterprises</div>
              <div class="business-unit-desc">Industrial Materials &amp; Service Works. Reliable supply &amp; procurement across industries, MEP supplies, Electrical, Plumbing &amp; Hardware.</div>
            </div>
            <div class="business-unit-card" style="border-left-color:var(--color-success)">
              <div class="business-unit-name">🛠️ Eagle Global Facility Solutions</div>
              <div class="business-unit-desc">Comprehensive Facility Management. Civil &amp; Fabrication, Painting &amp; POP, Toughened Glass &amp; Mirror, Carpet Shampooing.</div>
            </div>
            <div class="business-unit-card" style="border-left-color:var(--color-accent-purple)">
              <div class="business-unit-name">💻 Eagle Vision Tech</div>
              <div class="business-unit-desc">Modern IT &amp; Digital Solutions. Specializing in Website Development, SEO, Mobile Apps, Digital Marketing, and E-commerce.</div>
            </div>
          </div>

          <div class="contact-panel">
            <div class="contact-panel-hdr">
              <h3>Service Reach &amp; Presence</h3>
              <span>17 Cities · 9+ States</span>
            </div>
            <div class="cities-grid">
              <span class="city-pill hq">★ Bengaluru (HQ)</span>
              <span class="city-pill">Hyderabad</span>
              <span class="city-pill">Chennai</span>
              <span class="city-pill">Delhi – NCR</span>
              <span class="city-pill">Mumbai</span>
              <span class="city-pill">Pune</span>
              <span class="city-pill">Coimbatore</span>
              <span class="city-pill">Cochin</span>
              <span class="city-pill">Vijayawada</span>
              <span class="city-pill">Mysore</span>
              <span class="city-pill">Bhimavaram</span>
              <span class="city-pill">Mangalore</span>
              <span class="city-pill">Pondicherry</span>
              <span class="city-pill">Trichy</span>
              <span class="city-pill">Tirunelveli</span>
              <span class="city-pill">Trivandrum</span>
              <span class="city-pill">Madurai</span>
              <span class="city-pill">Gujarat</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}
