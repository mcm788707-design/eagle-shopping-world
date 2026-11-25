# Shopverse – Indian Value E-Commerce Web Application

A pixel-faithful, responsive clone of an Indian value e-commerce home page (inspired by Meesho) built with **plain HTML5, CSS3, and vanilla JavaScript (ES modules)**. No third-party frameworks.

---

## 🚀 Quick Start & Setup

### Prerequisites
- Node.js (v16+ recommended) or any static HTTP server.

### Running the Application
```bash
# Start with built-in Node server
node server.js

# Or start with npx serve
npx serve .
```

Open your browser at:
👉 **[http://localhost:3000](http://localhost:3000)** (or [http://127.0.0.1:3000](http://127.0.0.1:3000))

---

## 🔑 Administrator Credentials
- **URL:** [http://localhost:3000/#/admin](http://localhost:3000/#/admin)
- **Email:** `admin@shopverse.com`
- **Password:** `Admin@123`
- **Role:** Administrator (full CRUD access, stock updates, order management, and SheetJS bulk Excel/CSV import & export)

---

## 🎨 Design Tokens & System

| Token | Value | Description |
|---|---|---|
| Primary Plum | `#9f2089` | Brand primary color, active underlines, buttons |
| Dark Plum | `#570d48` | Logo, headings, app discount banner title |
| Accent Purple | `#5b2bff` | Brand category cards, verified tick badges |
| Offer Orange | `#f9a01b` | App download banner, promotion accents |
| Soft Lavender | `#f1ecff` | Brand strip background, section containers |
| Success Green | `#038d63` | Rating pills (4.0+), discount percentages |
| Timer Peach | `#ffe9dc` | Countdown chip background (`#b24700` text) |
| Card Border | `#eeeeee` | Subtle 1px borders across product cards |
| Max Width | `1180px` | Centered layout with `24px` side padding |
| Typography | `Mukta`, `DM Sans` | Indian e-commerce sans-serif font scale |

---

## 📑 10 Home Page Sections Checklist

1. **Header (Sticky)**
   - Plum geometric lowercase text logo `shopverse`.
   - Wide search bar with magnifier icon, placeholder *"Try Saree, Kurti or Search by Product Code"*, and live debounced dropdown suggestions.
   - Right action items: "Become a Supplier", vertical divider, "Investor Relations", divider, Profile icon, Cart icon with live counter badge.
2. **Category Nav Bar & Full-Width Mega Menu**
   - 11 top categories (*Popular, Kurti, Saree & Lehenga, Women Western, Lingerie, Men, Kids & Toys, Home & Kitchen, Beauty & Health, Jewellery & Accessories, Bags & Footwear, Electronics*).
   - Active/hover plum text with 2px underline.
   - Full-width mega menu with 3 columns (middle column highlighted in `#f8f9fc` with subtle borders), keyboard accessible, closes on Esc or mouse-leave.
3. **Hero Banner Carousel**
   - Purple festive gradient banner with auto-play every 4s, navigation dots, hover-pause, and touch swipe gestures.
4. **Trust Strip**
   - Rounded pale-pink centered bar with dividers: *"7 Days Easy Return"*, *"Cash on Delivery"*, *"Lowest Prices"*.
5. **Circular / Arch Category Row**
   - Scroller of arch-shaped tiles with pale-pink background: *Ethnic Wear, Western Dresses, Menswear, Footwear, Home Decor, Beauty, Accessories* with desktop arrow navigation.
6. **Festive "Gold" Promo Banner**
   - Dark brown gradient background with 4-point gold star + "Gold" wordmark, *"Products you Love. Quality we Trust."*, outlined gold button, and 2×2 arch grid (*Lehengas, Menwear, Sarees, Jewellery*).
7. **Original Brands Section**
   - "Original Brands" heading with purple verified badge and "VIEW ALL >" link.
   - Horizontal carousel of lavender cards with bold purple label bar (*Personal Care, Electronics, Makeup, Men Perfume, Bags, Footwear, Home Care*).
   - Auto-scrolling infinite marquee strip of branded logo tiles (*WOW Skin Science, mamaearth, Wild Stone, plum, Nivea, Himalaya, etc.*).
8. **App Download Banner**
   - Left orange panel with "Up to 35% OFF on first order", "*Only on App", white "Download Now" button, and vertical "*T&C Apply".
   - Right purple panel with 4 orange-framed portrait cards (*Trending Now, Budget Buys, Top Rated Picks, Daily Essentials*).
9. **"Products For You" Main Listing**
   - Sticky left sidebar with Sort dropdown (*Relevance, Price low→high, Price high→low, Rating, Discount*), Filters header, Price chip buttons (*Under ₹199, ₹249, ₹299, ₹349, ₹399, ₹449, ₹499, ₹200–₹249, etc.*), Rating radios, Discount radios, Shopverse Gold, and Shopverse Mall checkboxes.
   - 4-column product grid with 108+ products across all categories.
   - Product Card anatomy: square image, peach countdown timer chip (*ticking live*), "+N More" chip, product name, Mall badge, bold price, struck-through MRP, green discount %, delivery fee chip, green rating pill with review count, Trusted badge, and hover wishlist heart.
   - Infinite scroll loading 20 products per batch with skeleton shimmer loaders.
10. **Multi-Column Footer**
    - Categories, supplier and investor links, customer care, legal & privacy, payment badges (UPI, Visa, Mastercard, RuPay, COD), social icons, app store badges, popular searches SEO keyword block, and copyright bar.

---

## 📊 Excel Bulk Import Column Specification

When importing products in the Admin Panel (`#/admin`), SheetJS parses files with the following case-insensitive column headers:

| Column | Type | Required | Description | Example |
|---|---|---|---|---|
| `name` | String | Yes | Product title | `Banarasi Art Silk Saree` |
| `brand` | String | Yes | Brand name | `Libas` |
| `category` | String | Yes | Top-level category | `Kurti, Saree & Lehenga` |
| `subcategory` | String | No | Sub-classification | `Sarees` |
| `price` | Number | Yes | Selling price in ₹ | `399` |
| `mrp` | Number | Yes | Original MRP in ₹ | `1299` |
| `stock` | Number | No | Inventory count | `50` |
| `description` | String | No | Product details | `Soft silk festive saree` |

---

## 🖼️ Swapping Placeholder Images for Real Images
All product image references are stored in `data/products.json`:
- `image`: Primary square image path (e.g. `assets/placeholders/prod_1.svg`).
- `images`: Array of alternative angle images for the gallery view.

To use real photos:
1. Place image files in `assets/products/`.
2. Update the `image` and `images` fields in `data/products.json` or update them in the Admin Panel.
