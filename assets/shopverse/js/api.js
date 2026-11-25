/**
 * Shopverse Isolated Data Layer (api.js)
 * Interacts with localStorage now, structured as an async API service
 * so a real REST backend can drop in seamlessly later.
 */

const STORAGE_KEYS = {
  PRODUCTS: 'sv_products_v2',
  CATEGORIES: 'sv_categories_v2',
  CART: 'sv_cart_v2',
  WISHLIST: 'sv_wishlist_v2',
  ORDERS: 'sv_orders_v2',
  USERS: 'sv_users_v2',
  SESSION: 'sv_session_v2',
  ATTEMPTS: 'sv_login_attempts_v2'
};

const getStorage = (key, fallback = []) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (err) {
    console.error(`Error reading ${key}:`, err);
    return fallback;
  }
};

const setStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving ${key}:`, err);
  }
};

// SHA-256 Web Crypto password hash
async function hashPassword(pass) {
  const enc = new TextEncoder().encode('sv_salt:' + pass);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export const api = {
  // Initialize and seed database from products.json and categories.json
  async init() {
    let prods = getStorage(STORAGE_KEYS.PRODUCTS, null);
    if (!prods || !prods.length) {
      try {
        const res = await fetch('data/products.json');
        prods = await res.json();
        setStorage(STORAGE_KEYS.PRODUCTS, prods);
      } catch (e) {
        console.warn('Failed to load products.json, using fallback', e);
        prods = [];
      }
    }

    let cats = getStorage(STORAGE_KEYS.CATEGORIES, null);
    if (!cats || !cats.length) {
      try {
        const res = await fetch('data/categories.json');
        cats = await res.json();
        setStorage(STORAGE_KEYS.CATEGORIES, cats);
      } catch (e) {
        cats = [];
      }
    }

    // Seed default admin user
    const users = getStorage(STORAGE_KEYS.USERS, []);
    if (!users.some(u => u.email === 'admin@shopverse.com')) {
      const adminPass = await hashPassword('Admin@123');
      users.push({
        id: 1,
        name: 'Shopverse Administrator',
        email: 'admin@shopverse.com',
        passwordHash: adminPass,
        role: 'admin'
      });
      setStorage(STORAGE_KEYS.USERS, users);
    }

    return { productsCount: prods.length, categoriesCount: cats.length };
  },

  // Products
  async getProducts(options = {}) {
    let list = [...getStorage(STORAGE_KEYS.PRODUCTS, [])];

    // Filter by search query
    if (options.search) {
      const q = options.search.toLowerCase().trim();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.subcategory.toLowerCase().includes(q)
      );
    }

    // Filter by category
    if (options.category && options.category !== 'all' && options.category !== 'popular') {
      const target = options.category.toLowerCase().replace(/-/g, ' ');
      list = list.filter(p => p.category.toLowerCase().includes(target));
    }

    // Filter by Price range
    if (options.maxPrice) {
      list = list.filter(p => p.price <= options.maxPrice);
    }
    if (options.minPrice) {
      list = list.filter(p => p.price >= options.minPrice);
    }

    // Filter by Rating
    if (options.minRating) {
      list = list.filter(p => p.rating >= options.minRating);
    }

    // Filter by Discount percentage
    if (options.minDiscount) {
      list = list.filter(p => {
        const disc = Math.round((1 - p.price / p.mrp) * 100);
        return disc >= options.minDiscount;
      });
    }

    // Filter by Mall
    if (options.mallOnly) {
      list = list.filter(p => p.mall);
    }

    // Filter by Festive / Gold
    if (options.goldOnly) {
      list = list.filter(p => p.price >= 350 || p.trusted);
    }

    // Sorting
    const sort = options.sortBy || 'relevance';
    if (sort === 'price-low') {
      list.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-high') {
      list.sort((a, b) => b.price - a.price);
    } else if (sort === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sort === 'discount') {
      list.sort((a, b) => (1 - b.price / b.mrp) - (1 - a.price / a.mrp));
    }

    // Pagination for infinite scroll
    const page = options.page || 1;
    const limit = options.limit || 20;
    const startIndex = (page - 1) * limit;
    const paginated = list.slice(0, page * limit);

    return {
      total: list.length,
      items: paginated,
      hasMore: list.length > paginated.length
    };
  },

  async getProductById(id) {
    const list = getStorage(STORAGE_KEYS.PRODUCTS, []);
    return list.find(p => String(p.id) === String(id)) || null;
  },

  async getCategories() {
    return getStorage(STORAGE_KEYS.CATEGORIES, []);
  },

  // Cart
  async getCart() {
    const cartItems = getStorage(STORAGE_KEYS.CART, []);
    const prods = getStorage(STORAGE_KEYS.PRODUCTS, []);
    return cartItems.map(c => {
      const product = prods.find(p => p.id === c.productId);
      return {
        ...c,
        product: product || { name: 'Item', price: 0, mrp: 0, image: '' }
      };
    }).filter(c => c.product);
  },

  async addToCart(productId, qty = 1) {
    const cart = getStorage(STORAGE_KEYS.CART, []);
    const existing = cart.find(c => c.productId === productId);
    if (existing) {
      existing.qty += qty;
    } else {
      cart.push({ productId, qty });
    }
    setStorage(STORAGE_KEYS.CART, cart);
    return this.getCart();
  },

  async updateCartQty(productId, qty) {
    let cart = getStorage(STORAGE_KEYS.CART, []);
    if (qty <= 0) {
      cart = cart.filter(c => c.productId !== productId);
    } else {
      const item = cart.find(c => c.productId === productId);
      if (item) item.qty = qty;
    }
    setStorage(STORAGE_KEYS.CART, cart);
    return this.getCart();
  },

  async clearCart() {
    setStorage(STORAGE_KEYS.CART, []);
    return [];
  },

  // Wishlist
  async getWishlist() {
    return getStorage(STORAGE_KEYS.WISHLIST, []);
  },

  async toggleWishlist(productId) {
    let wl = getStorage(STORAGE_KEYS.WISHLIST, []);
    const idx = wl.indexOf(productId);
    if (idx >= 0) {
      wl.splice(idx, 1);
    } else {
      wl.push(productId);
    }
    setStorage(STORAGE_KEYS.WISHLIST, wl);
    return wl;
  },

  // Orders
  async getOrders(userId) {
    const all = getStorage(STORAGE_KEYS.ORDERS, []);
    return userId ? all.filter(o => o.userId === userId).reverse() : all.reverse();
  },

  async placeOrder(orderData) {
    const orders = getStorage(STORAGE_KEYS.ORDERS, []);
    const newOrder = {
      id: 'SV-' + Date.now().toString().slice(-8),
      createdAt: new Date().toISOString(),
      status: 'Placed',
      ...orderData
    };
    orders.push(newOrder);
    setStorage(STORAGE_KEYS.ORDERS, orders);
    await this.clearCart();
    return newOrder;
  },

  // Auth & Session
  async getSession() {
    const session = getStorage(STORAGE_KEYS.SESSION, null);
    if (!session) return null;
    if (session.expiresAt && session.expiresAt < Date.now()) {
      localStorage.removeItem(STORAGE_KEYS.SESSION);
      return null;
    }
    return session;
  },

  async login(email, password) {
    const em = email.toLowerCase().trim();
    const attempts = getStorage(STORAGE_KEYS.ATTEMPTS, {});
    
    // Check lockout: 5 attempts within 5 minutes
    if (attempts[em] && attempts[em].count >= 5 && (Date.now() - attempts[em].lastAttempt) < 300000) {
      throw new Error('Too many failed attempts. Account locked for 5 minutes.');
    }

    const users = getStorage(STORAGE_KEYS.USERS, []);
    const user = users.find(u => u.email.toLowerCase() === em);
    const passHash = await hashPassword(password);

    if (!user || user.passwordHash !== passHash) {
      attempts[em] = {
        count: (attempts[em]?.count || 0) + 1,
        lastAttempt: Date.now()
      };
      setStorage(STORAGE_KEYS.ATTEMPTS, attempts);
      throw new Error('Invalid email or password.');
    }

    delete attempts[em];
    setStorage(STORAGE_KEYS.ATTEMPTS, attempts);

    const session = {
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      expiresAt: Date.now() + (24 * 3600 * 1000) // 24 hours
    };
    setStorage(STORAGE_KEYS.SESSION, session);
    return session;
  },

  async register(name, email, password) {
    const em = email.toLowerCase().trim();
    const users = getStorage(STORAGE_KEYS.USERS, []);
    if (users.some(u => u.email.toLowerCase() === em)) {
      throw new Error('An account with this email already exists.');
    }

    const passHash = await hashPassword(password);
    const newUser = {
      id: Date.now(),
      name: name.trim(),
      email: em,
      passwordHash: passHash,
      role: 'customer'
    };
    users.push(newUser);
    setStorage(STORAGE_KEYS.USERS, users);
    return this.login(email, password);
  },

  async logout() {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    return true;
  },

  // Admin Operations
  async addProduct(product) {
    const prods = getStorage(STORAGE_KEYS.PRODUCTS, []);
    const newId = prods.length ? Math.max(...prods.map(p => p.id)) + 1 : 1;
    const newProduct = {
      id: newId,
      image: `assets/placeholders/prod_${newId}.svg`,
      images: [`assets/placeholders/prod_${newId}.svg`],
      rating: 4.2,
      reviews: 10,
      stock: 50,
      ...product
    };
    prods.unshift(newProduct);
    setStorage(STORAGE_KEYS.PRODUCTS, prods);
    return newProduct;
  },

  async updateProduct(id, updates) {
    const prods = getStorage(STORAGE_KEYS.PRODUCTS, []);
    const idx = prods.findIndex(p => String(p.id) === String(id));
    if (idx >= 0) {
      prods[idx] = { ...prods[idx], ...updates };
      setStorage(STORAGE_KEYS.PRODUCTS, prods);
      return prods[idx];
    }
    return null;
  },

  async deleteProduct(id) {
    let prods = getStorage(STORAGE_KEYS.PRODUCTS, []);
    prods = prods.filter(p => String(p.id) !== String(id));
    setStorage(STORAGE_KEYS.PRODUCTS, prods);
    return true;
  },

  async updateOrderStatus(orderId, status) {
    const orders = getStorage(STORAGE_KEYS.ORDERS, []);
    const order = orders.find(o => o.id === orderId);
    if (order) {
      order.status = status;
      setStorage(STORAGE_KEYS.ORDERS, orders);
      return order;
    }
    return null;
  },

  async bulkImport(productsArray) {
    const current = getStorage(STORAGE_KEYS.PRODUCTS, []);
    let added = 0;
    let updated = 0;

    productsArray.forEach(p => {
      const match = current.find(c =>
        c.name.trim().toLowerCase() === String(p.name).trim().toLowerCase() &&
        c.brand.trim().toLowerCase() === String(p.brand).trim().toLowerCase()
      );
      if (match) {
        Object.assign(match, p);
        updated++;
      } else {
        const newId = current.length ? Math.max(...current.map(c => c.id)) + 1 : 1;
        current.push({
          id: newId,
          image: p.image || `assets/placeholders/prod_${newId}.svg`,
          images: [p.image || `assets/placeholders/prod_${newId}.svg`],
          rating: p.rating || 4.1,
          reviews: p.reviews || 25,
          stock: p.stock || 50,
          ...p
        });
        added++;
      }
    });

    setStorage(STORAGE_KEYS.PRODUCTS, current);
    return { added, updated, total: current.length };
  }
};
