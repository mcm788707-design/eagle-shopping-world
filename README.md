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

## 🎪 Hero Banners & Carousel Management Guide

The **Hero Banners** management system allows administrators to dynamically customize, schedule, and reorder all promotional slides shown on the homepage without touching any code.

### Accessing the Hero Manager
1. Log in to the Admin Dashboard at **[http://localhost:3000/#/admin](http://localhost:3000/#/admin)** using `admin@shopverse.com` / `Admin@123`.
2. Click the **🎪 Hero Banners** tab in the admin navigation bar. (This tab is strictly protected and only accessible to users with the `admin` role).

---

### 1. Adding a New Slide
1. Click the **`+ New Slide`** button at the top right of the Hero Banners tab.
2. In the **Content** section, enter your **Headline** (required), choose a headline color, write your **Subtext**, and configure the optional **Badge Pill** text and visibility.
3. Observe the **🔴 Live Slide Preview** on the right side of the screen; it updates in real time as you type!
4. Click **`➕ Add Slide to Carousel`** at the bottom to publish the slide.

---

### 2. Uploading a Background Image & Configuring Contrast
1. In the **2. Background** accordion section, select the **🖼️ Background Image** radio button.
2. Drag & drop an image file (PNG, JPG, WebP, or SVG, up to 2 MB) into the dashed drop zone, or click **browse** to select a file.
   - *Optimization feature*: The system automatically compresses and resizes oversized images down to a maximum width of 1920px using the HTML5 Canvas API before saving.
   - Alternatively, you can paste any direct web image URL into the **Or Paste Image URL** field.
3. Choose the **Image Position** (`Center`, `Top`, `Bottom`, `Left`, `Right`) and **Size / Fit** (`Cover` to fill the banner, or `Contain`).
4. Adjust the **Overlay Opacity slider** (0% to 90%) and overlay color to ensure high contrast and readability for headline and tagline text.

---

### 3. Setting Call-to-Action (CTA) Button Links
1. Open the **4. Call-to-Action Buttons** accordion section.
2. Under **Primary CTA Button**, customize the **Button Label** (e.g. `Explore Ethnic`).
3. Set the **Button Link URL**:
   - For internal navigation without page reload, use hash routes such as `#/category/kurti-saree-lehenga`, `#/category/men`, or `#/category/popular`.
   - For external sites, use standard full URLs such as `https://example.com` and toggle **Open in new tab**.
   - *Security protection*: Unsafe schemes like `javascript:` or `data:text/html` are automatically blocked and rejected.
4. Customize button background and text colors using the color pickers.
5. Optionally enable and configure a **Secondary Button** (e.g. `Learn More`).

---

### 4. Reordering Slides
In the **All Carousel Slides** list at the bottom of the tab:
- **Up / Down Buttons**: Click **`▲`** or **`▼`** next to any slide to immediately move it up or down in the rotation order.
- **Drag & Drop**: Click and hold the **`☰`** handle on any slide row and drag it to your desired position. The sequence numbers (`#1`, `#2`, `#3`, etc.) update automatically and save instantly.

---

### 5. Scheduling Slides (Start & End Dates)
1. Open the **6. Schedule & Publication Status** accordion section in the slide editor.
2. Enter a **Start Date / Time**: The slide will remain hidden from the home page until this timestamp arrives.
3. Enter an **End Date / Time**: The slide will automatically expire and stop displaying on the home page once this timestamp passes.
4. Use the **Active** checkbox to manually enable or disable any slide on demand.

---

### 6. Configuring Global Carousel Settings
Below the slide list, use the **⚙️ Carousel Display & Animation Settings** card to customize:
- **Autoplay**: Turn automatic slide rotation on or off.
- **Slide Interval**: Set rotation speed between 2 and 10 seconds.
- **Transition Animation**: Choose between **Slide** (horizontal transform) or **Fade** (smooth cross-fade dissolve).
- **Navigation Controls**: Toggle indicator dots and previous/next navigation arrows.
- **Pause on Hover**: Automatically pause autoplay when visitors hover over the banner.
- **Desktop & Mobile Banner Heights**: Set custom pixel heights for desktop (e.g. `320px`) and mobile (e.g. `280px`).

---

### 7. Exporting & Importing Hero Slides (JSON)
- Click **`📤 Export JSON`** to download a backup file (`shopverse_hero_banners.json`) containing all slide configurations and carousel settings.
- Click **`📥 Import JSON`** to import previously saved or shared hero configurations.
- Click **`↺ Reset to Defaults`** to restore the original 3 festive seed slides anytime.

---

## 🖼️ Swapping Placeholder Images for Real Images
All product image references are stored in `data/products.json`:
- `image`: Primary square image path (e.g. `assets/placeholders/prod_1.svg`).
- `images`: Array of alternative angle images for the gallery view.

To use real photos:
1. Place image files in `assets/products/`.
2. Update the `image` and `images` fields in `data/products.json` or update them in the Admin Panel.
