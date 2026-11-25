/**
 * Hero Banner Carousel Component (carousel.js)
 */

export function renderHeroCarousel(container) {
  const slides = [
    {
      tag: "Festive Value Festival",
      title: "Lowest Prices. Zero Fuss.",
      sub: "Ethnic wear, daily essentials & electronics from trusted brands.",
      cta: "Shop Top Deals",
      graphic: "🛍️",
      className: "slide-1",
      link: "#/category/popular"
    },
    {
      tag: "Ethnic & Saree Mahotsav",
      title: "Up to 75% Off On Sarees & Kurtis",
      sub: "Banarasi silk, georgette partywear & daily cotton comfort.",
      cta: "Explore Ethnic",
      graphic: "🥻",
      className: "slide-2",
      link: "#/category/kurti-saree-lehenga"
    },
    {
      tag: "Beauty Blockbuster",
      title: "Top Skincare, Perfumes & Makeup",
      sub: "Extra 10% discount on first orders with code WELCOME10",
      cta: "Grab Offers",
      graphic: "💄",
      className: "slide-3",
      link: "#/category/beauty-health"
    }
  ];

  let current = 0;
  let timer = null;

  container.innerHTML = `
    <div class="hero-carousel-section" id="hero-carousel">
      <div class="carousel-track" id="carousel-track">
        ${slides.map(s => `
          <div class="carousel-slide ${s.className}">
            <div class="carousel-content">
              <span class="carousel-tag">${s.tag}</span>
              <h2 class="carousel-heading">${s.title}</h2>
              <p class="carousel-sub">${s.sub}</p>
              <a href="${s.link}" class="btn" style="background:#ffffff;color:var(--color-primary-dark);font-weight:800;border-radius:var(--radius-full);padding:12px 28px">${s.cta} →</a>
            </div>
            <div class="carousel-graphic">${s.graphic}</div>
          </div>
        `).join('')}
      </div>
      <div class="carousel-dots" id="carousel-dots">
        ${slides.map((_, i) => `
          <div class="carousel-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></div>
        `).join('')}
      </div>
    </div>
  `;

  const track = document.getElementById('carousel-track');
  const dots = document.querySelectorAll('.carousel-dot');

  function goTo(index) {
    current = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function startAutoplay() {
    stopAutoplay();
    timer = setInterval(() => {
      goTo(current + 1);
    }, 4000);
  }

  function stopAutoplay() {
    if (timer) clearInterval(timer);
  }

  dots.forEach(d => {
    d.addEventListener('click', () => {
      goTo(parseInt(d.dataset.index, 10));
      startAutoplay();
    });
  });

  const carouselEl = document.getElementById('hero-carousel');
  carouselEl.addEventListener('mouseenter', stopAutoplay);
  carouselEl.addEventListener('mouseleave', startAutoplay);

  // Touch Swipe for mobile
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

  startAutoplay();
}
