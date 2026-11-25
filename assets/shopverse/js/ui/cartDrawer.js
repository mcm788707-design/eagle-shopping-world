/**
 * Cart Drawer & Cart Page Component (cartDrawer.js)
 */

import { store } from '../store.js';

let appliedCoupon = null;

export function renderCartDrawer() {
  let drawer = document.getElementById('cart-drawer-container');
  if (!drawer) {
    drawer = document.createElement('div');
    drawer.id = 'cart-drawer-container';
    document.body.appendChild(drawer);
  }

  function update() {
    const items = store.state.cart;
    const count = store.cartCount;
    const subtotal = store.cartTotal;
    const discount = appliedCoupon === 'WELCOME10' ? Math.round(subtotal * 0.1) : 0;
    const delivery = subtotal >= 499 || subtotal === 0 ? 0 : 49;
    const total = subtotal - discount + delivery;

    drawer.innerHTML = `
      <div class="cart-overlay ${store.state.isCartDrawerOpen ? 'active' : ''}" id="cart-drawer-overlay"></div>
      <aside class="cart-drawer ${store.state.isCartDrawerOpen ? 'active' : ''}" id="cart-drawer-aside">
        <div class="cart-header">
          <h3>Shopping Cart (${count})</h3>
          <span class="cart-close-btn" id="btn-close-cart">&times;</span>
        </div>

        <div class="cart-items-list">
          ${!items.length ? `
            <div style="text-align:center;padding:48px 16px;color:var(--color-text-muted)">
              <div style="font-size:48px;margin-bottom:12px">🛒</div>
              <h4>Your Cart is Empty</h4>
              <p style="font-size:13px;margin-top:6px">Discover everyday lowest prices and start shopping!</p>
              <button class="btn btn-primary" id="btn-cart-shop" style="margin-top:16px">Shop Now</button>
            </div>
          ` : items.map(c => `
            <div class="cart-item-card" data-id="${c.productId}">
              <div class="cart-item-img">
                <img src="${c.product.image}" alt="">
              </div>
              <div class="cart-item-info">
                <div class="cart-item-name">${c.product.name}</div>
                <div style="font-size:12px;color:var(--color-text-muted)">${c.product.brand}</div>
                <div class="flex items-center gap-2" style="margin-top:4px">
                  <span style="font-size:16px;font-weight:800">₹${c.product.price}</span>
                  <span style="font-size:12px;color:var(--color-text-muted);text-decoration:line-through">₹${c.product.mrp}</span>
                </div>
                <div class="cart-qty-ctrl">
                  <button class="qty-btn btn-minus" data-id="${c.productId}">−</button>
                  <span style="font-weight:700;font-size:13px">${c.qty}</span>
                  <button class="qty-btn btn-plus" data-id="${c.productId}">+</button>
                  <button class="btn-remove" data-id="${c.productId}" style="margin-left:auto;color:#c0392b;font-size:12px;font-weight:600">Remove</button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>

        ${items.length ? `
          <div class="cart-footer">
            <!-- Coupon Input -->
            <div class="flex gap-2" style="margin-bottom:14px">
              <input 
                type="text" 
                id="cart-coupon-input" 
                placeholder="Coupon (WELCOME10)" 
                value="${appliedCoupon || ''}"
                style="flex:1;border:1px solid #d4d5d9;border-radius:4px;padding:6px 10px;font-size:12px;text-transform:uppercase"
              >
              <button class="btn btn-outline btn-sm" id="btn-apply-coupon">Apply</button>
            </div>

            <div class="cart-summary-row">
              <span style="color:var(--color-text-muted)">Subtotal</span>
              <span style="font-weight:700">₹${subtotal}</span>
            </div>
            ${discount > 0 ? `
              <div class="cart-summary-row" style="color:var(--color-success)">
                <span>Coupon (10% Off)</span>
                <span>−₹${discount}</span>
              </div>
            ` : ''}
            <div class="cart-summary-row">
              <span style="color:var(--color-text-muted)">Delivery Charges</span>
              <span>${delivery === 0 ? '<b style="color:var(--color-success)">FREE</b>' : `₹${delivery}`}</span>
            </div>
            <div class="cart-total-row">
              <span>Total Amount</span>
              <span style="color:var(--color-primary-dark)">₹${total}</span>
            </div>
            <button class="btn btn-primary w-full" id="btn-drawer-checkout" style="margin-top:14px;padding:12px">
              Proceed to Checkout
            </button>
          </div>
        ` : ''}
      </aside>
    `;

    // Event listeners
    const closeBtn = document.getElementById('btn-close-cart');
    const overlay = document.getElementById('cart-drawer-overlay');
    if (closeBtn) closeBtn.onclick = () => store.closeCartDrawer();
    if (overlay) overlay.onclick = () => store.closeCartDrawer();

    const shopBtn = document.getElementById('btn-cart-shop');
    if (shopBtn) {
      shopBtn.onclick = () => {
        store.closeCartDrawer();
        window.location.hash = '#/';
      };
    }

    drawer.querySelectorAll('.btn-plus').forEach(b => {
      b.onclick = () => {
        const id = parseInt(b.dataset.id, 10);
        const item = items.find(x => x.productId === id);
        if (item) store.updateCartQty(id, item.qty + 1);
      };
    });

    drawer.querySelectorAll('.btn-minus').forEach(b => {
      b.onclick = () => {
        const id = parseInt(b.dataset.id, 10);
        const item = items.find(x => x.productId === id);
        if (item) store.updateCartQty(id, item.qty - 1);
      };
    });

    drawer.querySelectorAll('.btn-remove').forEach(b => {
      b.onclick = () => {
        const id = parseInt(b.dataset.id, 10);
        store.updateCartQty(id, 0);
      };
    });

    const applyCouponBtn = document.getElementById('btn-apply-coupon');
    if (applyCouponBtn) {
      applyCouponBtn.onclick = () => {
        const code = document.getElementById('cart-coupon-input').value.trim().toUpperCase();
        if (code === 'WELCOME10') {
          appliedCoupon = 'WELCOME10';
          store.toast('10% Coupon Applied! 🎉');
          update();
        } else {
          store.toast('Invalid Coupon Code');
        }
      };
    }

    const checkoutBtn = document.getElementById('btn-drawer-checkout');
    if (checkoutBtn) {
      checkoutBtn.onclick = () => {
        store.closeCartDrawer();
        window.location.hash = '#/checkout';
      };
    }
  }

  store.subscribe((event) => {
    if (event === 'cart_drawer_opened' || event === 'cart_drawer_closed' || event === 'cart_updated') {
      update();
    }
  });

  update();
}
