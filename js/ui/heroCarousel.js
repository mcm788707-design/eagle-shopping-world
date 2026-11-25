/**
 * Dynamic Hero Banner Carousel Component (heroCarousel.js)
 * Supports dynamic slides, custom backgrounds (gradient, solid, image with overlay),
 * right-side images/emojis, custom buttons, transitions (slide/fade),
 * responsive heights, scheduling, swipe, keyboard navigation & live preview.
 */

import { api } from '../api.js';

// Safe HTML escaping helper
export function escHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));
}

// Generate CSS style string for a slide background
export function getSlideBackgroundStyle(slide) {
  const bgType = slide.backgroundType || 'gradient';
  if (bgType === 'color') {
    return `background-color: ${slide.backgroundColor || '#7b1fa2'};`;
  }
  if (bgType === 'image' && slide.backgroundImage) {
    const pos = slide.imagePosition || 'center';
    const fit = slide.imageFit || 'cover';
    return `background-image: url('${slide.backgroundImage}'); background-position: ${pos}; background-size: ${fit}; background-repeat: no-repeat;`;
  }
  // Default gradient
  const angle = slide.gradientAngle ?? 135;
  const from = slide.gradientFrom || '#7b1fa2';
  const to = slide.gradientTo || '#5b2bff';
  return `background: linear-gradient(${angle}deg, ${from}, ${to});`;
}

// Convert hex color + opacity to rgba string
export function hexToRgba(hex, opacity) {
  if (!hex || typeof hex !== 'string') return `rgba(0,0,0,${opacity ?? 0.2})`;
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const num = parseInt(c, 16);
  if (isNaN(num)) return `rgba(0,0,0,${opacity ?? 0.2})`;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${opacity ?? 0.2})`;
}

// Render a single slide's HTML
export function renderSlideHtml(slide, index = 0, isLazy = true) {
  const bgStyle = getSlideBackgroundStyle(slide);
  const overlayRgba = hexToRgba(slide.overlayColor || '#000000', slide.overlayOpacity ?? 0.1);
  const hasOverlay = (slide.backgroundType === 'image' && slide.backgroundImage) || (slide.overlayOpacity > 0);

  const textAlign = slide.textAlign || 'left';
  const contentPos = slide.contentPosition || 'left';

  // Content alignment classes / styles
  let justifyStyle = 'justify-content: flex-start;';
  if (contentPos === 'center') justifyStyle = 'justify-content: center;';
  else if (contentPos === 'right') justifyStyle = 'justify-content: flex-end;';

  const pBtn = slide.primaryButton || { text: 'Shop Now', link: '#/category/popular', bgColor: '#ffffff', textColor: '#570d48' };
  const sBtn = slide.secondaryButton;

  // Safe button link handler: if link starts with # or / or http
  const primaryHref = escHtml(pBtn.link || '#/category/popular');
  const primaryTarget = pBtn.openInNewTab ? 'target="_blank" rel="noopener noreferrer"' : '';

  return `
    <div class="carousel-slide dynamic-slide ${slide.backgroundType === 'image' ? 'has-bg-image' : ''}" 
         style="${bgStyle}; text-align:${textAlign};"
         data-slide-id="${slide.id || index}"
         role="group"
         aria-roledescription="slide"
         aria-label="${escHtml(slide.altText || slide.headline || `Slide ${index + 1}`)}">
      
      ${hasOverlay ? `<div class="carousel-overlay" style="background-color:${overlayRgba}"></div>` : ''}

      <div class="carousel-slide-inner" style="${justifyStyle}">
        <div class="carousel-content" style="text-align:${textAlign}">
          ${slide.badgeVisible !== false && slide.badgeText ? `
            <span class="carousel-tag" style="background-color:rgba(255,255,255,0.22);color:#ffffff">
              ${escHtml(slide.badgeText)}
            </span>
          ` : ''}

          <h2 class="carousel-heading" style="color:${slide.headlineColor || '#ffffff'}">
            ${escHtml(slide.headline || '')}
          </h2>

          ${slide.subtext ? `
            <p class="carousel-sub" style="color:${slide.subtextColor || '#ffffff'}">
              ${escHtml(slide.subtext)}
            </p>
          ` : ''}

          <div class="carousel-btn-group" style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;${textAlign === 'center' ? 'justify-content:center;' : textAlign === 'right' ? 'justify-content:flex-end;' : 'justify-content:flex-start;'}">
            ${pBtn.text ? `
              <a href="${primaryHref}" ${primaryTarget} 
                 class="btn carousel-cta-btn" 
                 style="background-color:${pBtn.bgColor || '#ffffff'};color:${pBtn.textColor || '#570d48'};font-weight:800;border-radius:var(--radius-full);padding:12px 28px;text-decoration:none;display:inline-flex;align-items:center;gap:6px">
                ${escHtml(pBtn.text)} <span>&rarr;</span>
              </a>
            ` : ''}

            ${sBtn && sBtn.visible && sBtn.text ? `
              <a href="${escHtml(sBtn.link || '#/')}" 
                 class="btn carousel-sec-btn" 
                 style="background:rgba(255,255,255,0.18);backdrop-filter:blur(6px);color:#ffffff;border:1px solid rgba(255,255,255,0.4);font-weight:700;border-radius:var(--radius-full);padding:11px 22px;text-decoration:none">
                ${escHtml(sBtn.text)}
              </a>
            ` : ''}
          </div>
        </div>

        ${slide.rightImageVisible !== false ? `
          <div class="carousel-graphic">
            ${slide.rightImage ? `
              <img src="${slide.rightImage}" 
                   alt="${escHtml(slide.altText || slide.headline || 'Product Image')}" 
                   class="carousel-custom-img" 
                   ${isLazy && index > 0 ? 'loading="lazy"' : 'loading="eager"'}>
            ` : `
              <span class="carousel-emoji-graphic">${slide.rightEmoji || '🛍️'}</span>
            `}
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

/**
 * Main Hero Carousel Render Function
 * Reads data from api.getHeroSlides and api.getHeroSettings
 */
export async function renderHeroCarousel(container, options = {}) {
  if (!container) return;

  // Retrieve slides & settings
  let slides = options.slides;
  let settings = options.settings;

  if (!slides) {
    slides = await api.getHeroSlides(false);
  }
  if (!settings) {
    settings = await api.getHeroSettings();
  }

  // Fallback if no active slides
  if (!slides || !slides.length) {
    slides = await api.getAllHeroSlides();
  }
  if (!slides || !slides.length) return;

  const isFade = settings.transition === 'fade';
  const desktopH = settings.desktopHeight || 320;
  const mobileH = settings.mobileHeight || 280;

  let current = 0;
  let timer = null;
  const total = slides.length;

  container.innerHTML = `
    <div class="hero-carousel-section ${isFade ? 'transition-fade' : 'transition-slide'}" 
         id="hero-carousel"
         style="--hero-desktop-height:${desktopH}px; --hero-mobile-height:${mobileH}px;"
         role="region" 
         aria-label="Promotional Hero Banners">
      
      <div class="carousel-viewport" style="position:relative;overflow:hidden;border-radius:var(--radius-tile);">
        <div class="carousel-track" id="carousel-track">
          ${slides.map((s, idx) => renderSlideHtml(s, idx, idx > 0)).join('')}
        </div>

        ${settings.showArrows && total > 1 ? `
          <button class="carousel-nav-arrow carousel-arrow-prev" id="carousel-prev" aria-label="Previous Slide">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <button class="carousel-nav-arrow carousel-arrow-next" id="carousel-next" aria-label="Next Slide">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        ` : ''}
      </div>

      ${settings.showDots && total > 1 ? `
        <div class="carousel-dots" id="carousel-dots" role="tablist" aria-label="Slide Selection">
          ${slides.map((s, i) => `
            <button class="carousel-dot ${i === 0 ? 'active' : ''}" 
                    data-index="${i}" 
                    role="tab" 
                    aria-selected="${i === 0 ? 'true' : 'false'}" 
                    aria-label="Slide ${i + 1}: ${escHtml(s.headline || '')}">
            </button>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;

  const carouselEl = container.querySelector('#hero-carousel');
  const track = container.querySelector('#carousel-track');
  const slideEls = container.querySelectorAll('.carousel-slide');
  const dots = container.querySelectorAll('.carousel-dot');
  const prevBtn = container.querySelector('#carousel-prev');
  const nextBtn = container.querySelector('#carousel-next');

  function goTo(index) {
    if (total <= 1) return;
    if (settings.loop !== false) {
      current = (index + total) % total;
    } else {
      current = Math.max(0, Math.min(total - 1, index));
    }

    if (isFade) {
      slideEls.forEach((slide, i) => {
        slide.classList.toggle('active', i === current);
      });
    } else {
      track.style.transform = `translateX(-${current * 100}%)`;
    }

    dots.forEach((d, i) => {
      const isActive = i === current;
      d.classList.toggle('active', isActive);
      d.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
  }

  // Initial active state for fade
  if (isFade && slideEls.length) {
    slideEls[0].classList.add('active');
  }

  // Autoplay setup
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const intervalMs = Math.max(2000, (settings.interval || 4) * 1000);

  function startAutoplay() {
    stopAutoplay();
    if (!settings.autoplay || total <= 1 || prefersReducedMotion) return;
    timer = setInterval(() => {
      goTo(current + 1);
    }, intervalMs);
  }

  function stopAutoplay() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  // Dots navigation
  dots.forEach(d => {
    d.addEventListener('click', () => {
      goTo(parseInt(d.dataset.index, 10));
      startAutoplay();
    });
  });

  // Arrow navigation
  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      goTo(current - 1);
      startAutoplay();
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      goTo(current + 1);
      startAutoplay();
    });
  }

  // Pause on hover
  if (settings.pauseOnHover && carouselEl) {
    carouselEl.addEventListener('mouseenter', stopAutoplay);
    carouselEl.addEventListener('mouseleave', startAutoplay);
  }

  // Mobile Touch Swipe
  if (carouselEl && total > 1) {
    let touchStartX = 0;
    let touchEndX = 0;

    carouselEl.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      stopAutoplay();
    }, { passive: true });

    carouselEl.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      if (touchStartX - touchEndX > 45) {
        goTo(current + 1);
      } else if (touchEndX - touchStartX > 45) {
        goTo(current - 1);
      }
      startAutoplay();
    }, { passive: true });
  }

  // Keyboard navigation
  if (carouselEl && total > 1) {
    carouselEl.setAttribute('tabindex', '0');
    carouselEl.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        goTo(current - 1);
        startAutoplay();
      } else if (e.key === 'ArrowRight') {
        goTo(current + 1);
        startAutoplay();
      }
    });
  }

  // Safe CTA link navigation (navigate without full reload if hash link)
  container.querySelectorAll('a.carousel-cta-btn, a.carousel-sec-btn').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        window.location.hash = href;
      }
    });
  });

  startAutoplay();

  return {
    goTo,
    stopAutoplay,
    startAutoplay
  };
}
