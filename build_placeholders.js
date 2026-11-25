const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'assets', 'placeholders');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

function makeSvg(width, height, bgGradient, icon, label, sub) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bgGradient[0]}"/>
      <stop offset="100%" stop-color="${bgGradient[1]}"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-opacity="0.12"/>
    </filter>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <circle cx="${width/2}" cy="${height*0.42}" r="${Math.min(width,height)*0.28}" fill="#ffffff" opacity="0.5" filter="url(#shadow)"/>
  <text x="50%" y="${height*0.48}" font-family="system-ui, -apple-system, sans-serif" font-size="${Math.round(height*0.28)}" text-anchor="middle" dominant-baseline="middle">${icon}</text>
  ${label ? `<text x="50%" y="${height*0.82}" font-family="'Mukta', system-ui, sans-serif" font-size="${Math.max(12, Math.round(height*0.065))}" font-weight="700" fill="#353543" text-anchor="middle">${label}</text>` : ''}
  ${sub ? `<text x="50%" y="${height*0.91}" font-family="'Mukta', system-ui, sans-serif" font-size="${Math.max(10, Math.round(height*0.048))}" font-weight="500" fill="#8b8b9a" text-anchor="middle">${sub}</text>` : ''}
</svg>`;
}

// Generate products
const products = require('./data/products.json');
products.forEach(p => {
  const g1 = p.color || '#f3e8ff';
  const g2 = '#ffffff';
  const svg = makeSvg(400, 400, [g1, g2], p.icon || '🛍️', p.brand, p.subcategory);
  fs.writeFileSync(path.join(dir, `prod_${p.id}.svg`), svg);
  fs.writeFileSync(path.join(dir, `prod_${p.id}_b.svg`), makeSvg(400, 400, [g1, '#fafafa'], p.icon || '🛍️', `${p.brand} Angle 2`, 'View Detail'));
  fs.writeFileSync(path.join(dir, `prod_${p.id}_c.svg`), makeSvg(400, 400, ['#ffffff', g1], '✨', `${p.brand} Quality Tested`, 'Shopverse Verified'));
});

// Arch categories
const arches = [
  { id: 'arch_ethnic', icon: '👗', name: 'Ethnic Wear', g: ['#fce7f3', '#fbcfe8'] },
  { id: 'arch_western', icon: '💃', name: 'Western Dresses', g: ['#fef3c7', '#fde68a'] },
  { id: 'arch_men', icon: '👕', name: 'Menswear', g: ['#e0e7ff', '#c7d2fe'] },
  { id: 'arch_footwear', icon: '👟', name: 'Footwear', g: ['#d1fae5', '#a7f3d0'] },
  { id: 'arch_homedecor', icon: '🏺', name: 'Home Decor', g: ['#fae8ff', '#f5d0fe'] },
  { id: 'arch_beauty', icon: '💄', name: 'Beauty', g: ['#ffe4e6', '#fecdd3'] },
  { id: 'arch_accessories', icon: '👜', name: 'Accessories', g: ['#ffedd5', '#fed7aa'] }
];
arches.forEach(a => {
  const svg = makeSvg(220, 260, a.g, a.icon, a.name, '');
  fs.writeFileSync(path.join(dir, `${a.id}.svg`), svg);
});

// Original Brands category cards
const brandCards = [
  { id: 'brand_personal_care', icon: '🧴', name: 'Personal Care', g: ['#ede9fe', '#ddd6fe'] },
  { id: 'brand_electronics', icon: '🎧', name: 'Electronics', g: ['#dbeafe', '#bfdbfe'] },
  { id: 'brand_makeup', icon: '💄', name: 'Makeup', g: ['#fce7f3', '#fbcfe8'] },
  { id: 'brand_perfume', icon: '✨', name: 'Men Perfume', g: ['#dcfce7', '#bbf7d0'] },
  { id: 'brand_bags', icon: '👜', name: 'Bags', g: ['#fae8ff', '#f5d0fe'] },
  { id: 'brand_footwear', icon: '👟', name: 'Footwear', g: ['#ffedd5', '#fed7aa'] },
  { id: 'brand_homecare', icon: '🧽', name: 'Home Care', g: ['#e0f2fe', '#bae6fd'] }
];
brandCards.forEach(b => {
  const svg = makeSvg(260, 260, b.g, b.icon, b.name, 'Shopverse Official');
  fs.writeFileSync(path.join(dir, `${b.id}.svg`), svg);
});

// Gold Arches
const goldItems = [
  { id: 'gold_lehengas', icon: '👗', name: 'Lehengas' },
  { id: 'gold_menwear', icon: '👑', name: 'Menwear' },
  { id: 'gold_sarees', icon: '🥻', name: 'Sarees' },
  { id: 'gold_jewellery', icon: '✨', name: 'Jewellery' }
];
goldItems.forEach(g => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240" width="200" height="240">
    <defs>
      <linearGradient id="gg" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#4a341e"/>
        <stop offset="100%" stop-color="#24170a"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" rx="90" fill="url(#gg)" stroke="#cfa856" stroke-width="2.5"/>
    <circle cx="100" cy="100" r="50" fill="#3a2514" stroke="#cfa856" stroke-dasharray="3,3"/>
    <text x="100" y="112" font-size="52" text-anchor="middle">${g.icon}</text>
    <rect x="25" y="185" width="150" height="34" rx="17" fill="#1d1206" stroke="#cfa856" stroke-width="1.5"/>
    <text x="100" y="207" font-family="'Mukta', sans-serif" font-size="14" font-weight="700" fill="#f8e5b9" text-anchor="middle">${g.name}</text>
  </svg>`;
  fs.writeFileSync(path.join(dir, `${g.id}.svg`), svg);
});

// App Promo Portraits
const appItems = [
  { id: 'app_trending', icon: '🔥', title: 'Trending Now' },
  { id: 'app_budget', icon: '💰', title: 'Budget Buys' },
  { id: 'app_toprated', icon: '⭐', title: 'Top Rated Picks' },
  { id: 'app_essentials', icon: '🛒', title: 'Daily Essentials' }
];
appItems.forEach(item => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 220" width="160" height="220">
    <rect width="100%" height="100%" rx="16" fill="#fff7ed" stroke="#f9a01b" stroke-width="3"/>
    <circle cx="80" cy="85" r="45" fill="#fed7aa" opacity="0.6"/>
    <text x="80" y="98" font-size="44" text-anchor="middle">${item.icon}</text>
    <rect x="12" y="165" width="136" height="30" rx="15" fill="#ffffff" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.08))"/>
    <text x="80" y="185" font-family="'Mukta', sans-serif" font-size="12" font-weight="700" fill="#570d48" text-anchor="middle">${item.title}</text>
  </svg>`;
  fs.writeFileSync(path.join(dir, `${item.id}.svg`), svg);
});

console.log('Successfully generated all placeholder assets in assets/placeholders/');
