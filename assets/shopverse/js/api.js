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
  ATTEMPTS: 'sv_login_attempts_v2',
  HERO_SLIDES: 'sv_hero_slides_v1',
  HERO_SETTINGS: 'sv_hero_settings_v1'
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

// Default Seed Hero Slides & Settings
const DEFAULT_HERO_SETTINGS = {
  autoplay: true,
  interval: 4,
  transition: 'slide',
  showDots: true,
  showArrows: true,
  pauseOnHover: true,
  loop: true,
  desktopHeight: 320,
  mobileHeight: 280
};

const DEFAULT_HERO_SLIDES = [
  {
    id: "slide-1",
    order: 1,
    active: true,
    badgeText: "Festive Value Festival",
    badgeVisible: true,
    headline: "Lowest Prices. Zero Fuss.",
    headlineColor: "#ffffff",
    subtext: "Ethnic wear, daily essentials & electronics from trusted brands.",
    subtextColor: "#ffffff",
    backgroundType: "gradient",
    backgroundColor: "#7b1fa2",
    gradientFrom: "#7b1fa2",
    gradientTo: "#5b2bff",
    gradientAngle: 135,
    backgroundImage: "",
    imagePosition: "center",
    imageFit: "cover",
    overlayColor: "#000000",
    overlayOpacity: 0.1,
    rightImage: "",
    rightEmoji: "🛍️",
    rightImageVisible: true,
    textAlign: "left",
    contentPosition: "left",
    primaryButton: {
      text: "Shop Top Deals",
      link: "#/category/popular",
      bgColor: "#ffffff",
      textColor: "#570d48",
      openInNewTab: false
    },
    secondaryButton: {
      text: "",
      link: "",
      visible: false
    },
    startDate: "",
    endDate: "",
    altText: "Festive Value Festival hero banner"
  },
  {
    id: "slide-2",
    order: 2,
    active: true,
    badgeText: "Ethnic & Saree Mahotsav",
    badgeVisible: true,
    headline: "Up to 75% Off On Sarees & Kurtis",
    headlineColor: "#ffffff",
    subtext: "Banarasi silk, georgette partywear & daily cotton comfort.",
    subtextColor: "#ffffff",
    backgroundType: "gradient",
    backgroundColor: "#4a148c",
    gradientFrom: "#4a148c",
    gradientTo: "#ff4081",
    gradientAngle: 135,
    backgroundImage: "",
    imagePosition: "center",
    imageFit: "cover",
    overlayColor: "#000000",
    overlayOpacity: 0.1,
    rightImage: "",
    rightEmoji: "🥻",
    rightImageVisible: true,
    textAlign: "left",
    contentPosition: "left",
    primaryButton: {
      text: "Explore Ethnic",
      link: "#/category/kurti-saree-lehenga",
      bgColor: "#ffffff",
      textColor: "#570d48",
      openInNewTab: false
    },
    secondaryButton: {
      text: "",
      link: "",
      visible: false
    },
    startDate: "",
    endDate: "",
    altText: "Ethnic and Saree Mahotsav banner"
  },
  {
    id: "slide-3",
    order: 3,
    active: true,
    badgeText: "Beauty & Tech Blockbuster",
    badgeVisible: true,
    headline: "Top Skincare, Perfumes & Tech",
    headlineColor: "#ffffff",
    subtext: "Extra 10% discount on first orders with code WELCOME10",
    subtextColor: "#ffffff",
    backgroundType: "gradient",
    backgroundColor: "#311b92",
    gradientFrom: "#311b92",
    gradientTo: "#9f2089",
    gradientAngle: 135,
    backgroundImage: "",
    imagePosition: "center",
    imageFit: "cover",
    overlayColor: "#000000",
    overlayOpacity: 0.1,
    rightImage: "",
    rightEmoji: "💄",
    rightImageVisible: true,
    textAlign: "left",
    contentPosition: "left",
    primaryButton: {
      text: "Grab Offers",
      link: "#/category/beauty-health",
      bgColor: "#ffffff",
      textColor: "#570d48",
      openInNewTab: false
    },
    secondaryButton: {
      text: "",
      link: "",
      visible: false
    },
    startDate: "",
    endDate: "",
    altText: "Beauty and Electronics Blockbuster banner"
  }
];

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

    // Seed default hero slides & carousel settings
    let heroSlides = getStorage(STORAGE_KEYS.HERO_SLIDES, null);
    let heroSettings = getStorage(STORAGE_KEYS.HERO_SETTINGS, null);
    if (!heroSlides || !heroSlides.length || !heroSettings) {
      try {
        const res = await fetch('data/heroSlides.json');
        const heroData = await res.json();
        if (!heroSlides || !heroSlides.length) {
          setStorage(STORAGE_KEYS.HERO_SLIDES, heroData.slides || DEFAULT_HERO_SLIDES);
        }
        if (!heroSettings) {
          setStorage(STORAGE_KEYS.HERO_SETTINGS, heroData.settings || DEFAULT_HERO_SETTINGS);
        }
      } catch (e) {
        if (!heroSlides || !heroSlides.length) {
          setStorage(STORAGE_KEYS.HERO_SLIDES, DEFAULT_HERO_SLIDES);
        }
        if (!heroSettings) {
          setStorage(STORAGE_KEYS.HERO_SETTINGS, DEFAULT_HERO_SETTINGS);
        }
      }
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
  },

  // Hero Carousel & Banners
  async getHeroSettings() {
    const saved = getStorage(STORAGE_KEYS.HERO_SETTINGS, null);
    if (!saved) {
      setStorage(STORAGE_KEYS.HERO_SETTINGS, DEFAULT_HERO_SETTINGS);
      return { ...DEFAULT_HERO_SETTINGS };
    }
    return { ...DEFAULT_HERO_SETTINGS, ...saved };
  },

  async saveHeroSettings(settings) {
    const current = await this.getHeroSettings();
    const clean = {
      ...current,
      ...settings,
      interval: Math.max(2, Math.min(10, parseInt(settings.interval, 10) || 4)),
      desktopHeight: Math.max(200, Math.min(600, parseInt(settings.desktopHeight, 10) || 320)),
      mobileHeight: Math.max(180, Math.min(500, parseInt(settings.mobileHeight, 10) || 280))
    };
    setStorage(STORAGE_KEYS.HERO_SETTINGS, clean);
    return clean;
  },

  async getHeroSlides(includeInactive = false) {
    let slides = getStorage(STORAGE_KEYS.HERO_SLIDES, null);
    if (!slides || !slides.length) {
      slides = JSON.parse(JSON.stringify(DEFAULT_HERO_SLIDES));
      setStorage(STORAGE_KEYS.HERO_SLIDES, slides);
    }

    slides.sort((a, b) => (a.order || 0) - (b.order || 0));

    if (includeInactive) {
      return slides;
    }

    const now = Date.now();
    const active = slides.filter(s => {
      if (!s.active) return false;
      if (s.startDate) {
        const start = new Date(s.startDate).getTime();
        if (!isNaN(start) && start > now) return false;
      }
      if (s.endDate) {
        const end = new Date(s.endDate).getTime();
        if (!isNaN(end) && end < now) return false;
      }
      return true;
    });

    return active.length ? active : JSON.parse(JSON.stringify(DEFAULT_HERO_SLIDES));
  },

  async getAllHeroSlides() {
    return this.getHeroSlides(true);
  },

  async getHeroSlideById(id) {
    const list = await this.getAllHeroSlides();
    return list.find(s => String(s.id) === String(id)) || null;
  },

  async saveHeroSlide(slideData) {
    const list = await this.getAllHeroSlides();
    const cleanHeadline = String(slideData.headline || '').trim();
    if (!cleanHeadline) {
      throw new Error('Headline is required for the hero slide.');
    }

    // Validate button link (relative route or http/https only)
    if (slideData.primaryButton?.link) {
      const link = String(slideData.primaryButton.link).trim();
      if (link.toLowerCase().startsWith('javascript:') || link.toLowerCase().startsWith('data:text/html')) {
        throw new Error('Invalid button link URL. javascript: links are not permitted.');
      }
    }

    if (slideData.id) {
      const idx = list.findIndex(s => String(s.id) === String(slideData.id));
      if (idx >= 0) {
        list[idx] = {
          ...list[idx],
          ...slideData,
          headline: cleanHeadline,
          order: parseInt(slideData.order, 10) || list[idx].order || (idx + 1)
        };
        setStorage(STORAGE_KEYS.HERO_SLIDES, list);
        return list[idx];
      }
    }

    // New Slide
    const maxOrder = list.reduce((m, s) => Math.max(m, s.order || 0), 0);
    const newSlide = {
      id: 'slide_' + Date.now(),
      order: maxOrder + 1,
      active: true,
      badgeText: 'New Offer',
      badgeVisible: true,
      headline: cleanHeadline,
      headlineColor: '#ffffff',
      subtext: '',
      subtextColor: '#ffffff',
      backgroundType: 'gradient',
      backgroundColor: '#7b1fa2',
      gradientFrom: '#7b1fa2',
      gradientTo: '#5b2bff',
      gradientAngle: 135,
      backgroundImage: '',
      imagePosition: 'center',
      imageFit: 'cover',
      overlayColor: '#000000',
      overlayOpacity: 0.1,
      rightImage: '',
      rightEmoji: '🛍️',
      rightImageVisible: true,
      textAlign: 'left',
      contentPosition: 'left',
      primaryButton: {
        text: 'Shop Now',
        link: '#/category/popular',
        bgColor: '#ffffff',
        textColor: '#570d48',
        openInNewTab: false
      },
      secondaryButton: {
        text: '',
        link: '',
        visible: false
      },
      startDate: '',
      endDate: '',
      altText: cleanHeadline,
      ...slideData
    };

    list.push(newSlide);
    setStorage(STORAGE_KEYS.HERO_SLIDES, list);
    return newSlide;
  },

  async deleteHeroSlide(id) {
    let list = await this.getAllHeroSlides();
    list = list.filter(s => String(s.id) !== String(id));
    list.forEach((s, idx) => { s.order = idx + 1; });
    setStorage(STORAGE_KEYS.HERO_SLIDES, list);
    return true;
  },

  async duplicateHeroSlide(id) {
    const list = await this.getAllHeroSlides();
    const origIdx = list.findIndex(s => String(s.id) === String(id));
    if (origIdx === -1) throw new Error('Slide not found to duplicate.');

    const orig = list[origIdx];
    const clone = JSON.parse(JSON.stringify(orig));
    clone.id = 'slide_' + Date.now();
    clone.headline = `${clone.headline} (Copy)`;
    clone.order = orig.order + 1;

    list.splice(origIdx + 1, 0, clone);
    list.forEach((s, idx) => { s.order = idx + 1; });
    setStorage(STORAGE_KEYS.HERO_SLIDES, list);
    return clone;
  },

  async toggleHeroSlideStatus(id) {
    const list = await this.getAllHeroSlides();
    const slide = list.find(s => String(s.id) === String(id));
    if (slide) {
      slide.active = !slide.active;
      setStorage(STORAGE_KEYS.HERO_SLIDES, list);
      return slide.active;
    }
    return false;
  },

  async reorderHeroSlides(orderedIds) {
    const list = await this.getAllHeroSlides();
    const map = new Map(list.map(s => [String(s.id), s]));
    const reordered = [];

    orderedIds.forEach((id, idx) => {
      const slide = map.get(String(id));
      if (slide) {
        slide.order = idx + 1;
        reordered.push(slide);
        map.delete(String(id));
      }
    });

    // Append any remaining
    map.forEach(slide => {
      slide.order = reordered.length + 1;
      reordered.push(slide);
    });

    setStorage(STORAGE_KEYS.HERO_SLIDES, reordered);
    return reordered;
  },

  async resetHeroSlides() {
    const defaultSlides = JSON.parse(JSON.stringify(DEFAULT_HERO_SLIDES));
    const defaultSettings = JSON.parse(JSON.stringify(DEFAULT_HERO_SETTINGS));
    setStorage(STORAGE_KEYS.HERO_SLIDES, defaultSlides);
    setStorage(STORAGE_KEYS.HERO_SETTINGS, defaultSettings);
    return { slides: defaultSlides, settings: defaultSettings };
  },

  async exportHeroSlides() {
    const slides = await this.getAllHeroSlides();
    const settings = await this.getHeroSettings();
    return {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      settings,
      slides
    };
  },

  async importHeroSlides(payload) {
    let slides = [];
    let settings = null;

    if (Array.isArray(payload)) {
      slides = payload;
    } else if (payload && typeof payload === 'object') {
      slides = Array.isArray(payload.slides) ? payload.slides : [];
      settings = payload.settings || null;
    }

    if (!slides.length) {
      throw new Error('Import data must contain at least one slide in "slides" array.');
    }

    // Validate and normalize slides
    const cleanSlides = slides.map((s, idx) => {
      if (!s.headline || !String(s.headline).trim()) {
        throw new Error(`Slide at index ${idx} is missing a headline.`);
      }
      return {
        id: s.id ? String(s.id) : 'slide_' + (Date.now() + idx),
        order: parseInt(s.order, 10) || (idx + 1),
        active: s.active !== false,
        badgeText: String(s.badgeText || 'Special Offer'),
        badgeVisible: s.badgeVisible !== false,
        headline: String(s.headline).trim(),
        headlineColor: s.headlineColor || '#ffffff',
        subtext: String(s.subtext || ''),
        subtextColor: s.subtextColor || '#ffffff',
        backgroundType: s.backgroundType || 'gradient',
        backgroundColor: s.backgroundColor || '#7b1fa2',
        gradientFrom: s.gradientFrom || '#7b1fa2',
        gradientTo: s.gradientTo || '#5b2bff',
        gradientAngle: parseInt(s.gradientAngle, 10) || 135,
        backgroundImage: s.backgroundImage || '',
        imagePosition: s.imagePosition || 'center',
        imageFit: s.imageFit || 'cover',
        overlayColor: s.overlayColor || '#000000',
        overlayOpacity: typeof s.overlayOpacity === 'number' ? s.overlayOpacity : 0.1,
        rightImage: s.rightImage || '',
        rightEmoji: s.rightEmoji || '🛍️',
        rightImageVisible: s.rightImageVisible !== false,
        textAlign: s.textAlign || 'left',
        contentPosition: s.contentPosition || 'left',
        primaryButton: {
          text: s.primaryButton?.text || 'Shop Now',
          link: s.primaryButton?.link || '#/category/popular',
          bgColor: s.primaryButton?.bgColor || '#ffffff',
          textColor: s.primaryButton?.textColor || '#570d48',
          openInNewTab: Boolean(s.primaryButton?.openInNewTab)
        },
        secondaryButton: {
          text: s.secondaryButton?.text || '',
          link: s.secondaryButton?.link || '',
          visible: Boolean(s.secondaryButton?.visible)
        },
        startDate: s.startDate || '',
        endDate: s.endDate || '',
        altText: s.altText || s.headline
      };
    });

    cleanSlides.sort((a, b) => a.order - b.order);
    cleanSlides.forEach((s, idx) => { s.order = idx + 1; });

    setStorage(STORAGE_KEYS.HERO_SLIDES, cleanSlides);
    if (settings && typeof settings === 'object') {
      await this.saveHeroSettings(settings);
    }

    return { importedCount: cleanSlides.length, settingsUpdated: Boolean(settings) };
  }
};
