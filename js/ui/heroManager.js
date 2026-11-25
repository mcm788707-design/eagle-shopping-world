/**
 * Hero Banners Admin Manager Component (heroManager.js)
 * Enables full CRUD, reordering, enable/disable, scheduling,
 * live preview with Desktop/Mobile toggles, settings management,
 * and JSON import/export for hero carousel slides.
 */

import { api } from '../api.js';
import { store } from '../store.js';
import { renderSlideHtml, escHtml, getSlideBackgroundStyle } from './heroCarousel.js';

// Image compression utility: max 2MB check, max 1920px resize via Canvas
function processImageUpload(file, maxWidth = 1920) {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error('No file selected'));
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      return reject(new Error('Invalid format. Allowed: JPG, PNG, WebP, SVG.'));
    }
    if (file.size > 2 * 1024 * 1024) {
      return reject(new Error('File exceeds 2 MB limit. Please select a smaller image.'));
    }
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = ev => resolve(ev.target.result);
      reader.onerror = () => reject(new Error('Failed to read SVG file.'));
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => {
        let w = img.width;
        let h = img.height;
        if (w > maxWidth) {
          h = Math.round((h * maxWidth) / w);
          w = maxWidth;
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const format = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const compressed = canvas.toDataURL(format, 0.88);
        resolve(compressed);
      };
      img.onerror = () => reject(new Error('Failed to decode image.'));
      img.src = ev.target.result;
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsDataURL(file);
  });
}

// Default blank slide model
function createEmptySlide(order = 1) {
  return {
    id: '',
    order,
    active: true,
    badgeText: 'New Festive Deal',
    badgeVisible: true,
    headline: 'Exclusive Festive Offer',
    headlineColor: '#ffffff',
    subtext: 'Discover our newest arrivals with lowest prices guaranteed.',
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
    overlayOpacity: 0.15,
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
    altText: 'Promotional Banner'
  };
}

export async function renderHeroManager(mountPoint) {
  const session = await api.getSession();
  if (!session || session.role !== 'admin') {
    mountPoint.innerHTML = `
      <div class="checkout-box" style="text-align:center;padding:36px">
        <h3 style="color:#c0392b;margin-bottom:8px">Access Restricted</h3>
        <p style="color:var(--color-text-muted)">Administrator authentication is required to manage Hero Banners.</p>
      </div>
    `;
    return;
  }

  let slides = await api.getAllHeroSlides();
  let settings = await api.getHeroSettings();
  let currentSlide = null; // null = listing / new slide mode
  let formDraft = createEmptySlide(slides.length + 1);
  let previewDevice = 'desktop'; // 'desktop' | 'mobile'

  function renderView() {
    mountPoint.innerHTML = `
      <div class="hero-manager-wrap">
        <!-- Top Title & Action Header -->
        <div class="flex justify-between items-center" style="margin-bottom:20px;flex-wrap:wrap;gap:12px">
          <div>
            <h2 style="font-size:22px;font-weight:900;color:var(--color-primary-dark);margin:0">
              Hero Banners &amp; Carousel Management
            </h2>
            <p style="color:var(--color-text-muted);font-size:13px;margin:4px 0 0">
              Create, edit, schedule, reorder slides, and configure homepage carousel settings.
            </p>
          </div>
          <div class="flex gap-2">
            <button class="btn btn-outline btn-sm" id="btn-export-hero-json" title="Download slides as JSON">
              📤 Export JSON
            </button>
            <button class="btn btn-outline btn-sm" id="btn-trigger-import-hero" title="Import slides from JSON">
              📥 Import JSON
            </button>
            <input type="file" id="hero-json-file-input" accept=".json" style="display:none">
            <button class="btn btn-outline btn-sm" id="btn-reset-hero-defaults" style="color:#c0392b;border-color:#e8b4b4">
              ↺ Reset to Defaults
            </button>
            <button class="btn btn-primary btn-sm" id="btn-create-new-slide">
              + New Slide
            </button>
          </div>
        </div>

        <!-- Section A: Slide Editor & Live Preview Grid -->
        <div class="hero-admin-grid">
          <!-- Left Column: Collapsible Form -->
          <div class="hero-form-panel">
            <div class="checkout-box" style="margin-bottom:20px">
              <div class="flex justify-between items-center" style="margin-bottom:14px;border-bottom:1px solid #f0f0f4;padding-bottom:10px">
                <h3 style="font-size:17px;font-weight:800;color:var(--color-primary-dark);margin:0">
                  ${currentSlide ? `✏️ Edit Slide: "${escHtml(currentSlide.headline)}"` : '➕ Create New Hero Slide'}
                </h3>
                ${currentSlide ? `
                  <button type="button" class="btn btn-outline btn-sm" id="btn-cancel-slide-edit" style="font-size:11px;padding:4px 10px">
                    Cancel Edit
                  </button>
                ` : ''}
              </div>

              <form id="hero-slide-form">
                <!-- Accordion 1: Content -->
                <div class="hero-accordion-item open" id="acc-content">
                  <div class="hero-accordion-header">
                    <span>1. Badge, Headline &amp; Text</span>
                    <span class="chevron">▼</span>
                  </div>
                  <div class="hero-accordion-body">
                    <div class="flex gap-3 items-center" style="margin-bottom:12px">
                      <div style="flex:1">
                        <label class="form-label">Badge Pill Text</label>
                        <input type="text" class="form-input hero-sync" name="badgeText" placeholder="e.g. ETHNIC &amp; SAREE MAHOTSAV" value="${escHtml(formDraft.badgeText)}">
                      </div>
                      <div style="width:130px;padding-top:22px">
                        <label style="font-size:12px;font-weight:700;display:flex;align-items:center;gap:6px;cursor:pointer">
                          <input type="checkbox" class="hero-sync" name="badgeVisible" ${formDraft.badgeVisible !== false ? 'checked' : ''}> Show Badge
                        </label>
                      </div>
                    </div>

                    <div class="flex gap-3 items-start" style="margin-bottom:12px">
                      <div style="flex:1">
                        <label class="form-label">Headline *</label>
                        <input type="text" class="form-input hero-sync" name="headline" required placeholder="e.g. Lowest Prices. Zero Fuss." value="${escHtml(formDraft.headline)}">
                      </div>
                      <div style="width:130px">
                        <label class="form-label">Headline Color</label>
                        <div class="color-picker-row">
                          <input type="color" class="color-input-swatch hero-sync" name="headlineColor" value="${formDraft.headlineColor || '#ffffff'}">
                          <input type="text" class="form-input hero-sync" name="headlineColorText" style="padding:4px 8px;font-size:12px" value="${formDraft.headlineColor || '#ffffff'}">
                        </div>
                      </div>
                    </div>

                    <div class="flex gap-3 items-start">
                      <div style="flex:1">
                        <label class="form-label">Subtext / Tagline</label>
                        <textarea class="form-textarea hero-sync" name="subtext" rows="2" placeholder="Brief supporting description...">${escHtml(formDraft.subtext)}</textarea>
                      </div>
                      <div style="width:130px">
                        <label class="form-label">Subtext Color</label>
                        <div class="color-picker-row">
                          <input type="color" class="color-input-swatch hero-sync" name="subtextColor" value="${formDraft.subtextColor || '#ffffff'}">
                          <input type="text" class="form-input hero-sync" name="subtextColorText" style="padding:4px 8px;font-size:12px" value="${formDraft.subtextColor || '#ffffff'}">
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Accordion 2: Background -->
                <div class="hero-accordion-item open" id="acc-bg">
                  <div class="hero-accordion-header">
                    <span>2. Background (Gradient, Color, or Image)</span>
                    <span class="chevron">▼</span>
                  </div>
                  <div class="hero-accordion-body">
                    <!-- Background Type Selector -->
                    <label class="form-label">Background Mode</label>
                    <div class="pill-radio-group" style="margin-bottom:14px">
                      <input type="radio" id="bg-type-grad" name="backgroundType" value="gradient" class="pill-radio-input hero-sync" ${formDraft.backgroundType === 'gradient' ? 'checked' : ''}>
                      <label for="bg-type-grad" class="pill-radio-label">🌈 Gradient</label>

                      <input type="radio" id="bg-type-color" name="backgroundType" value="color" class="pill-radio-input hero-sync" ${formDraft.backgroundType === 'color' ? 'checked' : ''}>
                      <label for="bg-type-color" class="pill-radio-label">🎨 Solid Color</label>

                      <input type="radio" id="bg-type-img" name="backgroundType" value="image" class="pill-radio-input hero-sync" ${formDraft.backgroundType === 'image' ? 'checked' : ''}>
                      <label for="bg-type-img" class="pill-radio-label">🖼️ Background Image</label>
                    </div>

                    <!-- Mode 1: Gradient Controls -->
                    <div id="controls-gradient" style="${formDraft.backgroundType === 'gradient' ? 'display:block' : 'display:none'};margin-bottom:12px">
                      <div class="flex gap-3">
                        <div style="flex:1">
                          <label class="form-label">Start Color</label>
                          <div class="color-picker-row">
                            <input type="color" class="color-input-swatch hero-sync" name="gradientFrom" value="${formDraft.gradientFrom || '#7b1fa2'}">
                            <input type="text" class="form-input hero-sync" name="gradientFromText" style="padding:4px 8px;font-size:12px" value="${formDraft.gradientFrom || '#7b1fa2'}">
                          </div>
                        </div>
                        <div style="flex:1">
                          <label class="form-label">End Color</label>
                          <div class="color-picker-row">
                            <input type="color" class="color-input-swatch hero-sync" name="gradientTo" value="${formDraft.gradientTo || '#5b2bff'}">
                            <input type="text" class="form-input hero-sync" name="gradientToText" style="padding:4px 8px;font-size:12px" value="${formDraft.gradientTo || '#5b2bff'}">
                          </div>
                        </div>
                        <div style="width:110px">
                          <label class="form-label">Angle (deg)</label>
                          <input type="number" class="form-input hero-sync" name="gradientAngle" min="0" max="360" value="${formDraft.gradientAngle ?? 135}">
                        </div>
                      </div>
                    </div>

                    <!-- Mode 2: Solid Color Controls -->
                    <div id="controls-solid" style="${formDraft.backgroundType === 'color' ? 'display:block' : 'display:none'};margin-bottom:12px">
                      <label class="form-label">Background Color</label>
                      <div class="color-picker-row">
                        <input type="color" class="color-input-swatch hero-sync" name="backgroundColor" value="${formDraft.backgroundColor || '#7b1fa2'}">
                        <input type="text" class="form-input hero-sync" name="backgroundColorText" style="padding:4px 8px;font-size:12px" value="${formDraft.backgroundColor || '#7b1fa2'}">
                      </div>
                    </div>

                    <!-- Mode 3: Image Controls -->
                    <div id="controls-image" style="${formDraft.backgroundType === 'image' ? 'display:block' : 'display:none'};margin-bottom:12px">
                      <label class="form-label">Upload Background Image (Max 2MB, auto-compressed to 1920px)</label>
                      <div class="drop-zone" id="bg-image-drop-zone" style="padding:14px;background:#faf8fb;margin-bottom:10px">
                        <input type="file" id="bg-file-input" accept="image/jpeg,image/png,image/webp,image/svg+xml" style="display:none">
                        <div style="font-size:22px;margin-bottom:4px">🖼️</div>
                        <div style="font-size:13px;font-weight:700">Drag &amp; drop background image, or <span style="color:var(--color-primary);text-decoration:underline">browse</span></div>
                        <div style="font-size:11px;color:var(--color-text-muted)">Supports JPG, PNG, WebP, SVG &bull; Auto-scaled</div>
                      </div>

                      <div style="margin-bottom:10px">
                        <label class="form-label" style="font-size:11px">Or Paste Image URL</label>
                        <input type="text" class="form-input hero-sync" name="backgroundImage" id="input-bg-image-url" placeholder="https://example.com/banner.jpg" value="${escHtml(formDraft.backgroundImage)}">
                      </div>

                      <div class="flex gap-3" style="margin-bottom:10px">
                        <div style="flex:1">
                          <label class="form-label">Position</label>
                          <select class="form-select hero-sync" name="imagePosition">
                            <option value="center" ${formDraft.imagePosition === 'center' ? 'selected' : ''}>Center</option>
                            <option value="top" ${formDraft.imagePosition === 'top' ? 'selected' : ''}>Top</option>
                            <option value="bottom" ${formDraft.imagePosition === 'bottom' ? 'selected' : ''}>Bottom</option>
                            <option value="left" ${formDraft.imagePosition === 'left' ? 'selected' : ''}>Left</option>
                            <option value="right" ${formDraft.imagePosition === 'right' ? 'selected' : ''}>Right</option>
                          </select>
                        </div>
                        <div style="flex:1">
                          <label class="form-label">Size / Fit</label>
                          <select class="form-select hero-sync" name="imageFit">
                            <option value="cover" ${formDraft.imageFit === 'cover' ? 'selected' : ''}>Cover (fill full slide)</option>
                            <option value="contain" ${formDraft.imageFit === 'contain' ? 'selected' : ''}>Contain (keep aspect ratio)</option>
                          </select>
                        </div>
                      </div>

                      <!-- Overlay for Readability -->
                      <div class="flex gap-3 items-center" style="background:#fafafa;padding:10px 12px;border-radius:6px;border:1px solid #eee">
                        <div style="width:130px">
                          <label class="form-label" style="margin:0 0 4px">Overlay Color</label>
                          <div class="color-picker-row">
                            <input type="color" class="color-input-swatch hero-sync" name="overlayColor" value="${formDraft.overlayColor || '#000000'}">
                            <span style="font-size:12px;color:var(--color-text-muted)">Dark shade</span>
                          </div>
                        </div>
                        <div style="flex:1">
                          <div class="flex justify-between" style="font-size:12px;margin-bottom:4px">
                            <span><b>Overlay Opacity</b> (protects text contrast)</span>
                            <span id="overlay-opacity-val">${Math.round((formDraft.overlayOpacity ?? 0.15) * 100)}%</span>
                          </div>
                          <input type="range" class="hero-sync w-full" name="overlayOpacity" min="0" max="0.9" step="0.05" value="${formDraft.overlayOpacity ?? 0.15}">
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Accordion 3: Right-Side Graphic -->
                <div class="hero-accordion-item" id="acc-graphic">
                  <div class="hero-accordion-header">
                    <span>3. Right-Side Product Graphic or Emoji</span>
                    <span class="chevron">▼</span>
                  </div>
                  <div class="hero-accordion-body">
                    <div style="margin-bottom:12px">
                      <label style="font-size:13px;font-weight:700;display:flex;align-items:center;gap:6px;cursor:pointer">
                        <input type="checkbox" class="hero-sync" name="rightImageVisible" ${formDraft.rightImageVisible !== false ? 'checked' : ''}> Show Right Graphic
                      </label>
                    </div>

                    <div class="flex gap-3">
                      <div style="width:120px">
                        <label class="form-label">Emoji Fallback</label>
                        <input type="text" class="form-input hero-sync" name="rightEmoji" style="font-size:24px;text-align:center" placeholder="🛍️" value="${escHtml(formDraft.rightEmoji || '🛍️')}">
                      </div>
                      <div style="flex:1">
                        <label class="form-label">Custom Right Image URL (optional)</label>
                        <input type="text" class="form-input hero-sync" name="rightImage" id="input-right-image-url" placeholder="https://example.com/product.png" value="${escHtml(formDraft.rightImage || '')}">
                        <div style="margin-top:6px">
                          <button type="button" class="btn btn-outline btn-sm" id="btn-upload-right-img" style="font-size:11px;padding:4px 10px">
                            📁 Upload Right Image
                          </button>
                          <input type="file" id="right-img-file-input" accept="image/*" style="display:none">
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Accordion 4: Action Buttons -->
                <div class="hero-accordion-item" id="acc-buttons">
                  <div class="hero-accordion-header">
                    <span>4. Call-to-Action Buttons</span>
                    <span class="chevron">▼</span>
                  </div>
                  <div class="hero-accordion-body">
                    <!-- Primary Button -->
                    <div style="background:#fafafa;padding:12px;border-radius:6px;border:1px solid #eee;margin-bottom:14px">
                      <div style="font-weight:800;font-size:13px;color:var(--color-primary-dark);margin-bottom:8px">Primary CTA Button</div>
                      <div class="flex gap-3" style="margin-bottom:8px">
                        <div style="flex:1">
                          <label class="form-label">Button Label *</label>
                          <input type="text" class="form-input hero-sync" name="primaryBtnText" required placeholder="Shop Top Deals" value="${escHtml(formDraft.primaryButton?.text || 'Shop Now')}">
                        </div>
                        <div style="flex:1">
                          <label class="form-label">Button Link URL *</label>
                          <input type="text" class="form-input hero-sync" name="primaryBtnLink" required placeholder="#/category/popular or https://..." value="${escHtml(formDraft.primaryButton?.link || '#/category/popular')}">
                        </div>
                      </div>
                      <div class="flex gap-4 items-center">
                        <div>
                          <label class="form-label" style="font-size:11px">Button Background</label>
                          <input type="color" class="color-input-swatch hero-sync" name="primaryBtnBg" value="${formDraft.primaryButton?.bgColor || '#ffffff'}">
                        </div>
                        <div>
                          <label class="form-label" style="font-size:11px">Text Color</label>
                          <input type="color" class="color-input-swatch hero-sync" name="primaryBtnTextCol" value="${formDraft.primaryButton?.textColor || '#570d48'}">
                        </div>
                        <div style="padding-top:16px">
                          <label style="font-size:12px;display:flex;align-items:center;gap:6px;cursor:pointer">
                            <input type="checkbox" class="hero-sync" name="primaryBtnNewTab" ${formDraft.primaryButton?.openInNewTab ? 'checked' : ''}> Open in new tab
                          </label>
                        </div>
                      </div>
                    </div>

                    <!-- Optional Secondary Button -->
                    <div style="background:#fafafa;padding:12px;border-radius:6px;border:1px solid #eee">
                      <div class="flex justify-between items-center" style="margin-bottom:8px">
                        <span style="font-weight:800;font-size:13px;color:var(--color-text-main)">Secondary Button (Optional)</span>
                        <label style="font-size:12px;display:flex;align-items:center;gap:6px;cursor:pointer">
                          <input type="checkbox" class="hero-sync" name="secondaryBtnVisible" ${formDraft.secondaryButton?.visible ? 'checked' : ''}> Enable
                        </label>
                      </div>
                      <div class="flex gap-3">
                        <div style="flex:1">
                          <label class="form-label">Secondary Text</label>
                          <input type="text" class="form-input hero-sync" name="secondaryBtnText" placeholder="e.g. Learn More" value="${escHtml(formDraft.secondaryButton?.text || '')}">
                        </div>
                        <div style="flex:1">
                          <label class="form-label">Secondary Link</label>
                          <input type="text" class="form-input hero-sync" name="secondaryBtnLink" placeholder="#/category/women-western" value="${escHtml(formDraft.secondaryButton?.link || '')}">
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Accordion 5: Layout & Alignment -->
                <div class="hero-accordion-item" id="acc-layout">
                  <div class="hero-accordion-header">
                    <span>5. Alignment, Positioning &amp; Accessibility</span>
                    <span class="chevron">▼</span>
                  </div>
                  <div class="hero-accordion-body">
                    <div class="flex gap-4" style="margin-bottom:12px">
                      <div style="flex:1">
                        <label class="form-label">Text Alignment</label>
                        <select class="form-select hero-sync" name="textAlign">
                          <option value="left" ${formDraft.textAlign === 'left' ? 'selected' : ''}>Left aligned</option>
                          <option value="center" ${formDraft.textAlign === 'center' ? 'selected' : ''}>Centered</option>
                          <option value="right" ${formDraft.textAlign === 'right' ? 'selected' : ''}>Right aligned</option>
                        </select>
                      </div>
                      <div style="flex:1">
                        <label class="form-label">Content Block Position</label>
                        <select class="form-select hero-sync" name="contentPosition">
                          <option value="left" ${formDraft.contentPosition === 'left' ? 'selected' : ''}>Left side</option>
                          <option value="center" ${formDraft.contentPosition === 'center' ? 'selected' : ''}>Center stage</option>
                          <option value="right" ${formDraft.contentPosition === 'right' ? 'selected' : ''}>Right side</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label class="form-label">Accessible Image Alt Text</label>
                      <input type="text" class="form-input hero-sync" name="altText" placeholder="Descriptive label for screen readers" value="${escHtml(formDraft.altText || '')}">
                    </div>
                  </div>
                </div>

                <!-- Accordion 6: Scheduling & Status -->
                <div class="hero-accordion-item" id="acc-scheduling">
                  <div class="hero-accordion-header">
                    <span>6. Schedule &amp; Publication Status</span>
                    <span class="chevron">▼</span>
                  </div>
                  <div class="hero-accordion-body">
                    <div style="margin-bottom:14px">
                      <label style="font-size:13px;font-weight:800;display:flex;align-items:center;gap:8px;cursor:pointer">
                        <input type="checkbox" class="hero-sync" name="active" ${formDraft.active !== false ? 'checked' : ''} style="width:16px;height:16px"> 
                        <span>Active (Slide is enabled in carousel)</span>
                      </label>
                    </div>

                    <div class="flex gap-3">
                      <div style="flex:1">
                        <label class="form-label">Start Date / Time (Optional)</label>
                        <input type="datetime-local" class="form-input hero-sync" name="startDate" value="${formDraft.startDate ? formDraft.startDate.slice(0, 16) : ''}">
                        <small style="color:var(--color-text-muted);font-size:11px">Slide appears only after this timestamp</small>
                      </div>
                      <div style="flex:1">
                        <label class="form-label">End Date / Time (Optional)</label>
                        <input type="datetime-local" class="form-input hero-sync" name="endDate" value="${formDraft.endDate ? formDraft.endDate.slice(0, 16) : ''}">
                        <small style="color:var(--color-text-muted);font-size:11px">Slide automatically expires after this timestamp</small>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Save Action Buttons -->
                <div class="flex gap-3 items-center" style="margin-top:18px">
                  <button type="submit" class="btn btn-primary" style="padding:12px 28px;font-weight:800">
                    ${currentSlide ? '💾 Update Slide' : '➕ Add Slide to Carousel'}
                  </button>
                  ${currentSlide ? `
                    <button type="button" class="btn btn-outline" id="btn-cancel-bottom" style="padding:12px 20px">
                      Cancel
                    </button>
                  ` : ''}
                </div>
              </form>
            </div>
          </div>

          <!-- Right Column: Sticky Live Preview Panel -->
          <div class="hero-preview-col">
            <div class="hero-preview-sticky">
              <div class="preview-toolbar">
                <div style="display:flex;align-items:center;gap:8px">
                  <span style="font-size:13px;font-weight:800;color:var(--color-primary-dark)">
                    🔴 Live Slide Preview
                  </span>
                  <span style="font-size:11px;background:#e8f4fd;color:#0b72b9;padding:2px 8px;border-radius:99px;font-weight:700">
                    Real-time
                  </span>
                </div>
                <div class="pill-radio-group">
                  <input type="radio" id="prev-mode-desktop" name="prevMode" value="desktop" class="pill-radio-input" ${previewDevice === 'desktop' ? 'checked' : ''}>
                  <label for="prev-mode-desktop" class="pill-radio-label">🖥️ Desktop</label>

                  <input type="radio" id="prev-mode-mobile" name="prevMode" value="mobile" class="pill-radio-input" ${previewDevice === 'mobile' ? 'checked' : ''}>
                  <label for="prev-mode-mobile" class="pill-radio-label">📱 Mobile (390px)</label>
                </div>
              </div>

              <!-- Preview Frame -->
              <div class="preview-frame-wrap">
                <div class="preview-frame ${previewDevice === 'mobile' ? 'mobile-mode' : ''}" id="hero-live-preview-box">
                  <!-- Rendered dynamically -->
                </div>
              </div>

              <div style="font-size:11px;color:var(--color-text-muted);margin-top:10px;text-align:center">
                Uses the exact same rendering engine and responsive breakpoints as the home page.
              </div>
            </div>
          </div>
        </div>

        <!-- Section B: Slide Inventory List & Order Management -->
        <div class="checkout-box" style="margin-top:24px">
          <div class="flex justify-between items-center" style="margin-bottom:14px;border-bottom:1px solid #f0f0f4;padding-bottom:12px">
            <div>
              <h3 style="font-size:18px;font-weight:800;color:var(--color-primary-dark);margin:0">
                All Carousel Slides (${slides.length})
              </h3>
              <p style="color:var(--color-text-muted);font-size:13px;margin:2px 0 0">
                Drag rows or click Up/Down arrows to reorder. Enable, duplicate or edit any slide.
              </p>
            </div>
          </div>

          <div id="hero-slides-list-container">
            ${slides.map((s, idx) => {
              const bgThumb = getSlideBackgroundStyle(s);
              return `
                <div class="hero-slide-row" data-id="${s.id}" data-order="${s.order}" draggable="true">
                  <!-- Reorder buttons & handle -->
                  <div style="display:flex;align-items:center;gap:4px">
                    <span style="cursor:grab;font-size:14px;color:#aaa;padding:0 4px" title="Drag to reorder">☰</span>
                    <button class="hero-reorder-btn btn-slide-up" data-id="${s.id}" ${idx === 0 ? 'disabled' : ''} title="Move Up">▲</button>
                    <button class="hero-reorder-btn btn-slide-down" data-id="${s.id}" ${idx === slides.length - 1 ? 'disabled' : ''} title="Move Down">▼</button>
                  </div>

                  <!-- Order number badge -->
                  <div style="font-weight:800;font-size:13px;width:30px;color:var(--color-text-muted)">
                    #${s.order || (idx + 1)}
                  </div>

                  <!-- Thumbnail -->
                  <div class="hero-slide-thumb" style="${bgThumb};color:#fff;">
                    ${s.rightImage ? `<img src="${s.rightImage}" alt="" style="width:100%;height:100%;object-fit:cover">` : `<span>${s.rightEmoji || '🛍️'}</span>`}
                  </div>

                  <!-- Info & Headline -->
                  <div style="flex:1;min-width:0">
                    <div class="flex items-center gap-2">
                      <b style="font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escHtml(s.headline)}</b>
                      ${s.badgeText ? `<span style="font-size:10px;background:#f0e6f5;color:var(--color-primary-dark);padding:1px 6px;border-radius:4px;font-weight:700">${escHtml(s.badgeText)}</span>` : ''}
                    </div>
                    <div style="font-size:12px;color:var(--color-text-muted);margin-top:2px;display:flex;gap:12px;flex-wrap:wrap">
                      <span>🎨 ${s.backgroundType || 'gradient'}</span>
                      <span>🔗 ${escHtml(s.primaryButton?.text || 'CTA')} &rarr; ${escHtml(s.primaryButton?.link || '')}</span>
                      ${s.startDate || s.endDate ? `<span style="color:#d97706">⏰ Scheduled</span>` : ''}
                    </div>
                  </div>

                  <!-- Active Status Pill -->
                  <div>
                    <button class="hero-status-tag ${s.active ? 'active' : 'inactive'} btn-toggle-status" data-id="${s.id}" style="border:none;cursor:pointer">
                      ${s.active ? '● Active' : '○ Inactive'}
                    </button>
                  </div>

                  <!-- Action Buttons -->
                  <div class="flex gap-2">
                    <button class="btn btn-outline btn-sm btn-edit-slide" data-id="${s.id}" style="font-size:12px;padding:4px 10px;color:var(--color-primary);border-color:var(--color-primary)">
                      ✏️ Edit
                    </button>
                    <button class="btn btn-outline btn-sm btn-dup-slide" data-id="${s.id}" style="font-size:12px;padding:4px 10px" title="Duplicate">
                      📋 Copy
                    </button>
                    <button class="btn btn-outline btn-sm btn-del-slide" data-id="${s.id}" style="font-size:12px;padding:4px 10px;color:#c0392b;border-color:#e8b4b4" title="Delete">
                      🗑️
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Section C: Carousel Global Settings Form -->
        <div class="checkout-box" style="margin-top:24px;max-width:760px">
          <h3 style="font-size:18px;font-weight:800;color:var(--color-primary-dark);margin:0 0 4px">
            ⚙️ Carousel Display &amp; Animation Settings
          </h3>
          <p style="color:var(--color-text-muted);font-size:13px;margin:0 0 16px">
            Tune the timing, transitions, navigation controls, and height of the homepage hero banner.
          </p>

          <form id="hero-settings-form">
            <div class="flex gap-4" style="margin-bottom:14px">
              <div style="flex:1">
                <label class="form-label">Autoplay</label>
                <select class="form-select" name="autoplay">
                  <option value="true" ${settings.autoplay ? 'selected' : ''}>Enabled (Auto-rotates slides)</option>
                  <option value="false" ${!settings.autoplay ? 'selected' : ''}>Disabled (Manual navigation only)</option>
                </select>
              </div>
              <div style="flex:1">
                <label class="form-label">Slide Interval: <b id="settings-interval-val">${settings.interval || 4}s</b></label>
                <input type="range" class="form-input w-full" name="interval" min="2" max="10" step="1" value="${settings.interval || 4}" id="range-interval">
              </div>
              <div style="flex:1">
                <label class="form-label">Transition Animation</label>
                <select class="form-select" name="transition">
                  <option value="slide" ${settings.transition === 'slide' ? 'selected' : ''}>Slide (Horizontal scroll)</option>
                  <option value="fade" ${settings.transition === 'fade' ? 'selected' : ''}>Fade (Smooth opacity dissolve)</option>
                </select>
              </div>
            </div>

            <div class="flex gap-4" style="margin-bottom:14px">
              <div style="flex:1">
                <label class="form-label">Desktop Banner Height (px)</label>
                <input type="number" class="form-input" name="desktopHeight" min="220" max="600" value="${settings.desktopHeight || 320}">
              </div>
              <div style="flex:1">
                <label class="form-label">Mobile Banner Height (px)</label>
                <input type="number" class="form-input" name="mobileHeight" min="200" max="450" value="${settings.mobileHeight || 280}">
              </div>
            </div>

            <div class="flex gap-4" style="margin-bottom:18px;flex-wrap:wrap">
              <label style="font-size:13px;font-weight:700;display:flex;align-items:center;gap:6px;cursor:pointer">
                <input type="checkbox" name="showDots" ${settings.showDots ? 'checked' : ''}> Show Indicator Dots
              </label>
              <label style="font-size:13px;font-weight:700;display:flex;align-items:center;gap:6px;cursor:pointer">
                <input type="checkbox" name="showArrows" ${settings.showArrows ? 'checked' : ''}> Show Left / Right Arrows
              </label>
              <label style="font-size:13px;font-weight:700;display:flex;align-items:center;gap:6px;cursor:pointer">
                <input type="checkbox" name="pauseOnHover" ${settings.pauseOnHover ? 'checked' : ''}> Pause on Mouse Hover
              </label>
              <label style="font-size:13px;font-weight:700;display:flex;align-items:center;gap:6px;cursor:pointer">
                <input type="checkbox" name="loop" ${settings.loop !== false ? 'checked' : ''}> Continuous Loop
              </label>
            </div>

            <button type="submit" class="btn btn-primary" style="padding:10px 24px;font-weight:800">
              💾 Save Carousel Settings
            </button>
          </form>
        </div>
      </div>
    `;

    // Initialize interactive handlers
    initAccordionToggles();
    initLivePreviewSync();
    initSlideActions();
    initDragAndDrop();
    initSettingsForm();
    initImportExport();
    updateLivePreview();
  }

  // Live preview update
  function updateLivePreview() {
    const previewBox = document.getElementById('hero-live-preview-box');
    if (!previewBox) return;

    previewBox.innerHTML = `
      <div class="hero-carousel-section" style="--hero-desktop-height:${settings.desktopHeight || 320}px;--hero-mobile-height:${settings.mobileHeight || 280}px;margin:0">
        <div class="carousel-viewport">
          <div class="carousel-track">
            ${renderSlideHtml(formDraft, 0, false)}
          </div>
        </div>
      </div>
    `;
  }

  // Accordion toggle behavior
  function initAccordionToggles() {
    mountPoint.querySelectorAll('.hero-accordion-header').forEach(hdr => {
      hdr.onclick = () => {
        const item = hdr.closest('.hero-accordion-item');
        item.classList.toggle('open');
      };
    });
  }

  // Read current draft from form fields
  function syncDraftFromForm() {
    const form = document.getElementById('hero-slide-form');
    if (!form) return;
    const f = new FormData(form);

    formDraft.badgeText = f.get('badgeText') || '';
    formDraft.badgeVisible = Boolean(form.querySelector('input[name="badgeVisible"]').checked);

    formDraft.headline = f.get('headline') || '';
    formDraft.headlineColor = f.get('headlineColor') || '#ffffff';
    formDraft.subtext = f.get('subtext') || '';
    formDraft.subtextColor = f.get('subtextColor') || '#ffffff';

    formDraft.backgroundType = f.get('backgroundType') || 'gradient';
    formDraft.backgroundColor = f.get('backgroundColor') || '#7b1fa2';
    formDraft.gradientFrom = f.get('gradientFrom') || '#7b1fa2';
    formDraft.gradientTo = f.get('gradientTo') || '#5b2bff';
    formDraft.gradientAngle = parseInt(f.get('gradientAngle'), 10) || 135;

    formDraft.backgroundImage = f.get('backgroundImage') || '';
    formDraft.imagePosition = f.get('imagePosition') || 'center';
    formDraft.imageFit = f.get('imageFit') || 'cover';
    formDraft.overlayColor = f.get('overlayColor') || '#000000';
    formDraft.overlayOpacity = parseFloat(f.get('overlayOpacity')) || 0.15;

    formDraft.rightImageVisible = Boolean(form.querySelector('input[name="rightImageVisible"]').checked);
    formDraft.rightEmoji = f.get('rightEmoji') || '🛍️';
    formDraft.rightImage = f.get('rightImage') || '';

    formDraft.primaryButton = {
      text: f.get('primaryBtnText') || 'Shop Now',
      link: f.get('primaryBtnLink') || '#/category/popular',
      bgColor: f.get('primaryBtnBg') || '#ffffff',
      textColor: f.get('primaryBtnTextCol') || '#570d48',
      openInNewTab: Boolean(form.querySelector('input[name="primaryBtnNewTab"]').checked)
    };

    formDraft.secondaryButton = {
      text: f.get('secondaryBtnText') || '',
      link: f.get('secondaryBtnLink') || '',
      visible: Boolean(form.querySelector('input[name="secondaryBtnVisible"]').checked)
    };

    formDraft.textAlign = f.get('textAlign') || 'left';
    formDraft.contentPosition = f.get('contentPosition') || 'left';
    formDraft.altText = f.get('altText') || formDraft.headline;

    formDraft.active = Boolean(form.querySelector('input[name="active"]').checked);
    formDraft.startDate = f.get('startDate') || '';
    formDraft.endDate = f.get('endDate') || '';

    // Update overlay opacity percentage label
    const opVal = document.getElementById('overlay-opacity-val');
    if (opVal) opVal.textContent = Math.round(formDraft.overlayOpacity * 100) + '%';
  }

  // Live preview input synchronization
  function initLivePreviewSync() {
    const form = document.getElementById('hero-slide-form');
    if (!form) return;

    // Background type toggling controls
    form.querySelectorAll('input[name="backgroundType"]').forEach(r => {
      r.onchange = () => {
        const val = r.value;
        document.getElementById('controls-gradient').style.display = val === 'gradient' ? 'block' : 'none';
        document.getElementById('controls-solid').style.display = val === 'color' ? 'block' : 'none';
        document.getElementById('controls-image').style.display = val === 'image' ? 'block' : 'none';
        syncDraftFromForm();
        updateLivePreview();
      };
    });

    // Synchronize color swatches with hex inputs
    const syncPair = (swatchName, textName) => {
      const sw = form.querySelector(`input[name="${swatchName}"]`);
      const tx = form.querySelector(`input[name="${textName}"]`);
      if (sw && tx) {
        sw.oninput = () => { tx.value = sw.value; syncDraftFromForm(); updateLivePreview(); };
        tx.oninput = () => { if (/^#[0-9a-f]{6}$/i.test(tx.value)) sw.value = tx.value; syncDraftFromForm(); updateLivePreview(); };
      }
    };

    syncPair('headlineColor', 'headlineColorText');
    syncPair('subtextColor', 'subtextColorText');
    syncPair('gradientFrom', 'gradientFromText');
    syncPair('gradientTo', 'gradientToText');
    syncPair('backgroundColor', 'backgroundColorText');

    // Live sync on any form input
    form.addEventListener('input', () => {
      syncDraftFromForm();
      updateLivePreview();
    });

    // Device preview toggle (Desktop vs Mobile)
    mountPoint.querySelectorAll('input[name="prevMode"]').forEach(r => {
      r.onchange = () => {
        previewDevice = r.value;
        const frame = document.getElementById('hero-live-preview-box');
        if (frame) {
          frame.classList.toggle('mobile-mode', previewDevice === 'mobile');
        }
      };
    });

    // Background Image File Drop / Browse
    const bgDropZone = document.getElementById('bg-image-drop-zone');
    const bgFileInput = document.getElementById('bg-file-input');
    const bgUrlInput = document.getElementById('input-bg-image-url');

    if (bgDropZone && bgFileInput) {
      bgDropZone.onclick = () => bgFileInput.click();
      bgFileInput.onchange = async (e) => {
        if (e.target.files && e.target.files[0]) {
          try {
            const dataUrl = await processImageUpload(e.target.files[0]);
            formDraft.backgroundImage = dataUrl;
            if (bgUrlInput) bgUrlInput.value = dataUrl;
            updateLivePreview();
            store.toast('Background image uploaded & compressed! 🖼️');
          } catch (err) {
            store.toast(err.message);
          }
        }
      };

      bgDropZone.ondragover = e => { e.preventDefault(); bgDropZone.classList.add('dragover'); };
      bgDropZone.ondragleave = () => bgDropZone.classList.remove('dragover');
      bgDropZone.ondrop = async e => {
        e.preventDefault();
        bgDropZone.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          try {
            const dataUrl = await processImageUpload(e.dataTransfer.files[0]);
            formDraft.backgroundImage = dataUrl;
            if (bgUrlInput) bgUrlInput.value = dataUrl;
            updateLivePreview();
            store.toast('Background image uploaded! 🖼️');
          } catch (err) {
            store.toast(err.message);
          }
        }
      };
    }

    // Right-side Image File Upload
    const rightImgBtn = document.getElementById('btn-upload-right-img');
    const rightImgInput = document.getElementById('right-img-file-input');
    const rightUrlInput = document.getElementById('input-right-image-url');

    if (rightImgBtn && rightImgInput) {
      rightImgBtn.onclick = () => rightImgInput.click();
      rightImgInput.onchange = async (e) => {
        if (e.target.files && e.target.files[0]) {
          try {
            const dataUrl = await processImageUpload(e.target.files[0], 800);
            formDraft.rightImage = dataUrl;
            if (rightUrlInput) rightUrlInput.value = dataUrl;
            updateLivePreview();
            store.toast('Right image uploaded! 🛍️');
          } catch (err) {
            store.toast(err.message);
          }
        }
      };
    }

    // Cancel edit buttons
    const cancelEdit = () => {
      currentSlide = null;
      formDraft = createEmptySlide(slides.length + 1);
      renderView();
    };
    const cancelTop = document.getElementById('btn-cancel-slide-edit');
    const cancelBottom = document.getElementById('btn-cancel-bottom');
    if (cancelTop) cancelTop.onclick = cancelEdit;
    if (cancelBottom) cancelBottom.onclick = cancelEdit;

    // Slide Form Submit (Add or Update)
    form.onsubmit = async (e) => {
      e.preventDefault();
      syncDraftFromForm();

      if (!formDraft.headline.trim()) {
        store.toast('Headline is required!');
        return;
      }

      try {
        const payload = {
          ...formDraft,
          id: currentSlide ? currentSlide.id : undefined,
          order: currentSlide ? currentSlide.order : slides.length + 1
        };

        await api.saveHeroSlide(payload);
        store.toast(currentSlide ? 'Hero slide updated successfully! 🎉' : 'New hero slide added! 🎉');
        currentSlide = null;
        slides = await api.getAllHeroSlides();
        formDraft = createEmptySlide(slides.length + 1);
        renderView();
      } catch (err) {
        store.toast(err.message);
      }
    };
  }

  // Slide list actions: Edit, Duplicate, Toggle, Delete, Reorder
  function initSlideActions() {
    // New Slide Button
    const newBtn = document.getElementById('btn-create-new-slide');
    if (newBtn) {
      newBtn.onclick = () => {
        currentSlide = null;
        formDraft = createEmptySlide(slides.length + 1);
        renderView();
        window.scrollTo({ top: 180, behavior: 'smooth' });
      };
    }

    // Edit Slide
    mountPoint.querySelectorAll('.btn-edit-slide').forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.id;
        const target = slides.find(s => String(s.id) === String(id));
        if (target) {
          currentSlide = target;
          formDraft = JSON.parse(JSON.stringify(target));
          renderView();
          window.scrollTo({ top: 180, behavior: 'smooth' });
          store.toast(`Editing slide "${target.headline}" ✏️`);
        }
      };
    });

    // Duplicate Slide
    mountPoint.querySelectorAll('.btn-dup-slide').forEach(btn => {
      btn.onclick = async () => {
        const id = btn.dataset.id;
        try {
          await api.duplicateHeroSlide(id);
          store.toast('Slide duplicated! 📋');
          slides = await api.getAllHeroSlides();
          renderView();
        } catch (err) {
          store.toast(err.message);
        }
      };
    });

    // Toggle Active Status
    mountPoint.querySelectorAll('.btn-toggle-status').forEach(btn => {
      btn.onclick = async () => {
        const id = btn.dataset.id;
        const active = await api.toggleHeroSlideStatus(id);
        store.toast(active ? 'Slide activated! ●' : 'Slide deactivated! ○');
        slides = await api.getAllHeroSlides();
        renderView();
      };
    });

    // Delete Slide
    mountPoint.querySelectorAll('.btn-del-slide').forEach(btn => {
      btn.onclick = async () => {
        const id = btn.dataset.id;
        const target = slides.find(s => String(s.id) === String(id));
        if (confirm(`Delete slide "${target ? target.headline : id}"?`)) {
          await api.deleteHeroSlide(id);
          store.toast('Slide deleted.');
          if (currentSlide && String(currentSlide.id) === String(id)) {
            currentSlide = null;
            formDraft = createEmptySlide(slides.length);
          }
          slides = await api.getAllHeroSlides();
          renderView();
        }
      };
    });

    // Move Up
    mountPoint.querySelectorAll('.btn-slide-up').forEach(btn => {
      btn.onclick = async () => {
        const id = btn.dataset.id;
        const idx = slides.findIndex(s => String(s.id) === String(id));
        if (idx > 0) {
          const list = [...slides];
          const temp = list[idx - 1];
          list[idx - 1] = list[idx];
          list[idx] = temp;
          await api.reorderHeroSlides(list.map(s => s.id));
          slides = await api.getAllHeroSlides();
          renderView();
          store.toast('Slide moved up! ⬆️');
        }
      };
    });

    // Move Down
    mountPoint.querySelectorAll('.btn-slide-down').forEach(btn => {
      btn.onclick = async () => {
        const id = btn.dataset.id;
        const idx = slides.findIndex(s => String(s.id) === String(id));
        if (idx < slides.length - 1 && idx >= 0) {
          const list = [...slides];
          const temp = list[idx + 1];
          list[idx + 1] = list[idx];
          list[idx] = temp;
          await api.reorderHeroSlides(list.map(s => s.id));
          slides = await api.getAllHeroSlides();
          renderView();
          store.toast('Slide moved down! ⬇️');
        }
      };
    });

    // Reset Defaults
    const resetBtn = document.getElementById('btn-reset-hero-defaults');
    if (resetBtn) {
      resetBtn.onclick = async () => {
        if (confirm('Reset hero carousel to default original slides? Any custom slides will be replaced.')) {
          const res = await api.resetHeroSlides();
          slides = res.slides;
          settings = res.settings;
          currentSlide = null;
          formDraft = createEmptySlide(slides.length + 1);
          renderView();
          store.toast('Carousel reset to default slides! ↺');
        }
      };
    }
  }

  // HTML5 Drag and drop reordering
  function initDragAndDrop() {
    const list = document.getElementById('hero-slides-list-container');
    if (!list) return;

    let draggedItem = null;

    list.querySelectorAll('.hero-slide-row').forEach(row => {
      row.addEventListener('dragstart', (e) => {
        draggedItem = row;
        row.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
      });

      row.addEventListener('dragend', async () => {
        row.classList.remove('dragging');
        draggedItem = null;

        // Gather new order
        const newOrderIds = Array.from(list.querySelectorAll('.hero-slide-row')).map(r => r.dataset.id);
        await api.reorderHeroSlides(newOrderIds);
        slides = await api.getAllHeroSlides();
        renderView();
        store.toast('Slides reordered! ↕️');
      });

      row.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (!draggedItem || draggedItem === row) return;

        const bounding = row.getBoundingClientRect();
        const offset = bounding.y + bounding.height / 2;
        if (e.clientY - offset > 0) {
          row.after(draggedItem);
        } else {
          row.before(draggedItem);
        }
      });
    });
  }

  // Carousel Global Settings Form
  function initSettingsForm() {
    const sForm = document.getElementById('hero-settings-form');
    if (!sForm) return;

    const rangeInterval = document.getElementById('range-interval');
    const intervalVal = document.getElementById('settings-interval-val');
    if (rangeInterval && intervalVal) {
      rangeInterval.oninput = () => {
        intervalVal.textContent = rangeInterval.value + 's';
      };
    }

    sForm.onsubmit = async (e) => {
      e.preventDefault();
      const f = new FormData(sForm);

      const updated = {
        autoplay: f.get('autoplay') === 'true',
        interval: parseInt(f.get('interval'), 10) || 4,
        transition: f.get('transition') || 'slide',
        desktopHeight: parseInt(f.get('desktopHeight'), 10) || 320,
        mobileHeight: parseInt(f.get('mobileHeight'), 10) || 280,
        showDots: Boolean(sForm.querySelector('input[name="showDots"]').checked),
        showArrows: Boolean(sForm.querySelector('input[name="showArrows"]').checked),
        pauseOnHover: Boolean(sForm.querySelector('input[name="pauseOnHover"]').checked),
        loop: Boolean(sForm.querySelector('input[name="loop"]').checked)
      };

      settings = await api.saveHeroSettings(updated);
      store.toast('Carousel settings saved! ⚙️');
      updateLivePreview();
    };
  }

  // Import / Export JSON
  function initImportExport() {
    const exportBtn = document.getElementById('btn-export-hero-json');
    if (exportBtn) {
      exportBtn.onclick = async () => {
        const data = await api.exportHeroSlides();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `shopverse_hero_banners_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        store.toast('Hero banners exported to JSON! 📤');
      };
    }

    const triggerImport = document.getElementById('btn-trigger-import-hero');
    const fileInp = document.getElementById('hero-json-file-input');
    if (triggerImport && fileInp) {
      triggerImport.onclick = () => fileInp.click();
      fileInp.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (ev) => {
          try {
            const parsed = JSON.parse(ev.target.result);
            const res = await api.importHeroSlides(parsed);
            slides = await api.getAllHeroSlides();
            settings = await api.getHeroSettings();
            currentSlide = null;
            formDraft = createEmptySlide(slides.length + 1);
            renderView();
            store.toast(`Imported ${res.importedCount} slides successfully! 📥`);
          } catch (err) {
            alert('Error importing JSON: ' + err.message);
          }
        };
        reader.readAsText(file);
      };
    }
  }

  renderView();
}
