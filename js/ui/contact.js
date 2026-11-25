/**
 * Enterprise Contact & Resources View (contact.js)
 * Pixel-faithful, fully responsive contact page for Eagle Shopping World / Eagle Groups India.
 */

import { api } from '../api.js';
import { store } from '../store.js';

export async function renderContactView(container) {
  // Update document title
  document.title = "Contact Us · Eagle Groups India | Eagle Shopping World";

  // Load Contact Data
  const data = await api.getContactData() || {};

  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => '&#' + c.charCodeAt(0) + ';');

  const hero = data.hero || {
    title: "Contact Us",
    breadcrumb: "Home > Resources > Contact",
    directoryLabel: "Eagle Groups India · Corporate Directory"
  };

  const leadership = data.leadership || {
    quote: "We stand on a strong foundation of rapid growth, innovative solutions, and a clear vision for the future. Join us in building a more efficient and sustainable tomorrow.",
    author: "M.S. Lingam",
    role: "Founder & Managing Director"
  };

  const stats = data.stats || [
    { value: "2018", label: "Established", icon: "🗓️" },
    { value: "4", label: "Regional Branches", icon: "🏢" },
    { value: "100+", label: "Enterprise Clients", icon: "🤝" },
    { value: "17", label: "Cities across 9+ States", icon: "📍" }
  ];

  const contactInfo = data.contactInfo || {
    pill: "CONTACT INFO",
    heading: "Contact Information",
    subtext: "Reach our administrative team across all key regional communication desks",
    cards: [
      {
        id: "visit",
        icon: "📍",
        title: "Visit Us At",
        lines: [
          "Headquarters: Bengaluru, Karnataka, India",
          "Regional Hubs: Bengaluru · Hyderabad · Chennai"
        ]
      },
      {
        id: "call",
        icon: "📞",
        title: "Call Us On",
        phones: [
          { name: "M.S. Lingam", phone: "+91 95389 98799", tel: "+919538998799" },
          { name: "Murugan", phone: "+91 80504 29402", tel: "+918050429402" },
          { name: "Vijesh", phone: "+91 90350 69019", tel: "+919035069019" }
        ]
      },
      {
        id: "mail",
        icon: "✉️",
        title: "Mail Address",
        email: "info@eaglegroupsindia.com",
        website: "eaglegroupsindia.com"
      },
      {
        id: "time",
        icon: "⚡",
        title: "Response Time",
        sla: "SLA 24–48 Hrs",
        note: "Guaranteed resolution turnaround on all formal inquiries"
      }
    ]
  };

  const grievance = data.grievance || {
    cardTitle: "Queries & Grievance Redressal",
    sla: "SLA: 24–48 Hrs",
    description: "Have an urgent inquiry, grievance redressal, or service escalation? Reach out directly to our management for prioritized fast resolution.",
    officers: [
      {
        name: "M.S. Lingam",
        role: "Founder | Managing Director",
        initials: "ML",
        email: "lingam@eaglegroupsindia.com",
        phone: "+91 95389 98799"
      },
      {
        name: "Murugan",
        role: "General Manager & Grievance Officer",
        initials: "M",
        email: "murugan@eaglegroupsindia.com",
        phone: "+91 80504 29402"
      }
    ]
  };

  const supplyChain = data.supplyChain || {
    pill: "COMMERCIAL RELATIONS",
    heading: "Supply Chain & Commercial Relations",
    subtext: "Direct access for supplier registrations, vendor onboarding, and procurement operations",
    procurement: {
      name: "Vijesh",
      role: "Supply Chain Manager",
      tag: "Procurement Desk",
      initials: "V",
      email: "vijesh@eaglegroupsindia.com",
      phone: "+91 90350 69019"
    },
    corporateDesk: {
      title: "General Corporate Desk",
      email: "info@eaglegroupsindia.com",
      website: "eaglegroupsindia.com"
    }
  };

  const registeredOffice = data.registeredOffice || {
    companyName: "Eagle Groups India (HQ)",
    tagline: "Building Excellence. Delivering Trust. Growing Together.",
    headquarters: "Bengaluru, Karnataka, India",
    regionalHubs: "Bengaluru · Hyderabad · Chennai",
    pdfUrl: "assets/eagle-groups-profile.pdf",
    pdfFilename: "Eagle-Groups-Company-Profile.pdf",
    mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d248849.8865390924!2d77.49085205!3d12.95396!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1670c9b44e6d%3A0xf8dfc3e8517e4fe0!2sBengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin",
    mapDirectionsUrl: "https://maps.google.com/?q=Bengaluru+Karnataka+India"
  };

  const divisions = data.divisions || [
    {
      id: "enterprises",
      name: "Eagle Enterprises",
      tag: "Industrial Materials & Service Works",
      desc: "Reliable supply & procurement across industries, MEP supplies, Electrical, Plumbing & Hardware.",
      icon: "🏭",
      accent: "#9f2089"
    },
    {
      id: "facility",
      name: "Eagle Global Facility Solutions",
      tag: "Comprehensive Facility Management",
      desc: "Civil & Fabrication, Painting & POP, Toughened Glass & Mirror, Carpet Shampooing.",
      icon: "🛠️",
      accent: "#038d63"
    },
    {
      id: "vision",
      name: "Eagle Vision Tech",
      tag: "Modern IT & Digital Solutions",
      desc: "Specializing in Website Development, SEO, Mobile Apps, Digital Marketing, and E-commerce.",
      icon: "💻",
      accent: "#5b2bff"
    }
  ];

  const presence = data.presence || {
    pill: "NATIONWIDE REACH",
    heading: "Service Reach & Presence",
    subtext: "17 Cities · 9+ States",
    cities: [
      { name: "Bengaluru", isHq: true },
      { name: "Hyderabad", isHq: false },
      { name: "Chennai", isHq: false },
      { name: "Delhi – NCR", isHq: false },
      { name: "Mumbai", isHq: false },
      { name: "Pune", isHq: false },
      { name: "Coimbatore", isHq: false },
      { name: "Cochin", isHq: false },
      { name: "Vijayawada", isHq: false },
      { name: "Mysore", isHq: false },
      { name: "Bhimavaram", isHq: false },
      { name: "Mangalore", isHq: false },
      { name: "Pondicherry", isHq: false },
      { name: "Trichy", isHq: false },
      { name: "Tirunelveli", isHq: false },
      { name: "Trivandrum", isHq: false },
      { name: "Madurai", isHq: false },
      { name: "Gujarat", isHq: false }
    ]
  };

  container.innerHTML = `
    <div class="contact-page-wrapper">
      <!-- 1. HERO BANNER -->
      <section class="eg-hero-section">
        <div class="eg-hero-backdrop"></div>
        <div class="container eg-hero-container">
          <div class="eg-hero-pill-badge">${esc(hero.directoryLabel)}</div>
          <h1 class="eg-hero-title">${esc(hero.title)}</h1>
          
          <nav class="eg-breadcrumb" aria-label="Breadcrumb">
            <a href="#/">Home</a>
            <span class="eg-bc-divider">&gt;</span>
            <a href="#/resources">Resources</a>
            <span class="eg-bc-divider">&gt;</span>
            <span class="eg-bc-active">Contact</span>
          </nav>

          <!-- Founder Quote in Hero -->
          <div class="eg-founder-quote-card">
            <div class="eg-quote-mark" aria-hidden="true">“</div>
            <p class="eg-quote-text">${esc(leadership.quote)}</p>
            <div class="eg-quote-author-row">
              <span class="eg-quote-dash">—</span>
              <span class="eg-quote-author-name">${esc(leadership.author)}</span>,
              <span class="eg-quote-author-role">${esc(leadership.role)}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 2. STATS STRIP (4 Cards / Counters) -->
      <section class="eg-stats-section">
        <div class="container">
          <div class="eg-stats-grid">
            ${stats.map(s => `
              <div class="eg-stat-card">
                <div class="eg-stat-icon">${s.icon || '📊'}</div>
                <div class="eg-stat-value">${esc(s.value)}</div>
                <div class="eg-stat-label">${esc(s.label)}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- 3. "CONTACT INFO" 4-CARD ROW -->
      <section class="eg-section eg-contact-info-section">
        <div class="container">
          <div class="eg-section-hdr text-center">
            <span class="eg-pill-badge">${esc(contactInfo.pill)}</span>
            <h2 class="eg-section-title">
              <span class="eg-accent-word">Contact</span> Information
            </h2>
            <p class="eg-section-subtitle">${esc(contactInfo.subtext)}</p>
          </div>

          <div class="eg-info-cards-grid">
            <!-- Card 1: Visit Us At -->
            <div class="eg-info-card">
              <div class="eg-info-card-icon" aria-hidden="true">📍</div>
              <h3 class="eg-info-card-title">Visit Us At</h3>
              <div class="eg-info-card-content">
                <div class="eg-info-line">
                  <span class="eg-info-label">Headquarters:</span>
                  <span class="eg-info-val">Bengaluru, Karnataka, India</span>
                </div>
                <div class="eg-info-line" style="margin-top:8px">
                  <span class="eg-info-label">Regional Hubs:</span>
                  <span class="eg-info-val">Bengaluru · Hyderabad · Chennai</span>
                </div>
              </div>
            </div>

            <!-- Card 2: Call Us On -->
            <div class="eg-info-card">
              <div class="eg-info-card-icon" aria-hidden="true">📞</div>
              <h3 class="eg-info-card-title">Call Us On</h3>
              <div class="eg-info-card-content">
                ${contactInfo.cards[1].phones.map(p => `
                  <div class="eg-phone-item">
                    <a href="tel:${esc(p.tel)}" class="eg-link-phone" title="Call ${esc(p.name)}">
                      ${esc(p.phone)}
                    </a>
                    <span class="eg-person-name">(${esc(p.name)})</span>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Card 3: Mail Address -->
            <div class="eg-info-card">
              <div class="eg-info-card-icon" aria-hidden="true">✉️</div>
              <h3 class="eg-info-card-title">Mail Address</h3>
              <div class="eg-info-card-content">
                <div class="eg-mail-item">
                  <span class="eg-info-label">Email:</span>
                  <a href="mailto:${esc(contactInfo.cards[2].email)}" class="eg-link-email">
                    ${esc(contactInfo.cards[2].email)}
                  </a>
                </div>
                <div class="eg-mail-item" style="margin-top:8px">
                  <span class="eg-info-label">Website:</span>
                  <a href="https://${esc(contactInfo.cards[2].website)}" target="_blank" rel="noopener noreferrer" class="eg-link-web">
                    ${esc(contactInfo.cards[2].website)}
                  </a>
                </div>
              </div>
            </div>

            <!-- Card 4: Response Time -->
            <div class="eg-info-card">
              <div class="eg-info-card-icon" aria-hidden="true">⚡</div>
              <h3 class="eg-info-card-title">Response Time</h3>
              <div class="eg-info-card-content">
                <div class="eg-sla-chip">
                  <span class="eg-sla-bullet">●</span>
                  ${esc(contactInfo.cards[3].sla)}
                </div>
                <p class="eg-sla-note">${esc(contactInfo.cards[3].note)}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 4. "QUERIES AND GRIEVANCE REDRESSAL" SECTION (Two-Column) -->
      <section class="eg-section eg-grievance-section" id="grievance-section">
        <div class="container">
          <div class="eg-grievance-grid">
            <!-- Left Side: Highlighted Accent Card + Person Cards -->
            <div class="eg-grievance-left-col">
              <!-- Highlighted Accent Card (Like "Chat With Live!") -->
              <div class="eg-highlight-accent-card">
                <div class="eg-headset-circle" aria-hidden="true">🎧</div>
                <div class="eg-accent-card-badge">URGENT RESOLUTION DESK</div>
                <h3 class="eg-accent-card-title">
                  Queries &amp; Grievance Redressal
                  <span class="eg-accent-sla-tag">SLA: 24–48 Hrs</span>
                </h3>
                <p class="eg-accent-card-desc">${esc(grievance.description)}</p>
                <div class="eg-accent-card-action">
                  <button type="button" class="btn eg-btn-accent-white" id="btn-focus-contact-form">
                    Contact Now <span>👇</span>
                  </button>
                </div>
              </div>

              <!-- Two Person Cards Underneath -->
              <div class="eg-officers-stack">
                ${grievance.officers.map(officer => `
                  <div class="eg-person-card">
                    <div class="eg-person-avatar">${esc(officer.initials)}</div>
                    <div class="eg-person-info">
                      <div class="eg-person-name-row">
                        <h4 class="eg-officer-name">${esc(officer.name)}</h4>
                        <span class="eg-officer-badge">Designated Officer</span>
                      </div>
                      <div class="eg-officer-role">${esc(officer.role)}</div>
                      <div class="eg-officer-actions">
                        <a href="mailto:${esc(officer.email)}" class="eg-officer-btn" title="Send email">
                          <span>✉️</span> ${esc(officer.email)}
                        </a>
                        <a href="tel:${esc(officer.phone.replace(/\s+/g, ''))}" class="eg-officer-btn" title="Call directly">
                          <span>📞</span> ${esc(officer.phone)}
                        </a>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Right Side: Contact Form -->
            <div class="eg-grievance-right-col">
              <div class="eg-form-card">
                <div class="eg-form-header">
                  <span class="eg-pill-badge">CONTACT US</span>
                  <h3 class="eg-form-title">
                    <span class="eg-accent-word">Reach</span> &amp; Get In Touch
                  </h3>
                  <p class="eg-form-subtext">Fill out your details below and our management desk will respond within 24–48 hours.</p>
                </div>

                <form id="eg-contact-inquiry-form" class="eg-inquiry-form" novalidate>
                  <div class="eg-form-group">
                    <label class="eg-label" for="cf-name">Your Name <span class="eg-req">*</span></label>
                    <input type="text" id="cf-name" name="name" class="eg-input" placeholder="e.g. Ramesh Kumar" required>
                    <div class="eg-field-err" id="err-cf-name"></div>
                  </div>

                  <div class="eg-form-row-2">
                    <div class="eg-form-group">
                      <label class="eg-label" for="cf-email">Your Email <span class="eg-req">*</span></label>
                      <input type="email" id="cf-email" name="email" class="eg-input" placeholder="name@company.com" required>
                      <div class="eg-field-err" id="err-cf-email"></div>
                    </div>

                    <div class="eg-form-group">
                      <label class="eg-label" for="cf-number">Your Number <span class="eg-req">*</span></label>
                      <input type="tel" id="cf-number" name="phone" class="eg-input" placeholder="+91 98765 43210" required>
                      <div class="eg-field-err" id="err-cf-number"></div>
                    </div>
                  </div>

                  <div class="eg-form-group">
                    <label class="eg-label" for="cf-subject">Your Subject <span class="eg-req">*</span></label>
                    <select id="cf-subject" name="subject" class="eg-select" required>
                      <option value="">-- Please Select a Subject --</option>
                      <option value="Queries and Grievance Redressal">Queries and Grievance Redressal</option>
                      <option value="Supply Chain & Procurement">Supply Chain &amp; Procurement</option>
                      <option value="Industrial Materials & Service Works">Eagle Enterprises – Industrial Materials</option>
                      <option value="Facility Solutions">Eagle Global Facility Solutions</option>
                      <option value="IT & Digital Solutions">Eagle Vision Tech – IT Solutions</option>
                      <option value="General Corporate Inquiry">General Corporate Inquiry</option>
                    </select>
                    <div class="eg-field-err" id="err-cf-subject"></div>
                  </div>

                  <div class="eg-form-group">
                    <label class="eg-label" for="cf-message">Message <span class="eg-req">*</span></label>
                    <textarea id="cf-message" name="message" class="eg-textarea" rows="4" placeholder="How can our team assist your organization today?" required></textarea>
                    <div class="eg-field-err" id="err-cf-message"></div>
                  </div>

                  <button type="submit" class="btn eg-btn-submit" id="btn-submit-contact-form">
                    <span>Send Message</span> <span>🚀</span>
                  </button>
                </form>

                <!-- Success Confirmation Receipt Box -->
                <div id="eg-form-success-box" class="eg-form-success-box" style="display:none">
                  <div class="eg-success-icon">✅</div>
                  <h4 class="eg-success-title">Message Dispatched Successfully!</h4>
                  <p class="eg-success-p">Thank you for contacting Eagle Groups India. Our team will review your query and get back to you within 24–48 hours.</p>
                  <div class="eg-ticket-receipt">
                    <span class="eg-ticket-label">Reference Ticket ID:</span>
                    <b class="eg-ticket-num" id="eg-ticket-id">#EG-84920</b>
                  </div>
                  <button type="button" class="btn btn-outline btn-sm" id="btn-send-another-msg" style="margin-top:14px">
                    Send Another Message
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 5. "SUPPLY CHAIN & COMMERCIAL RELATIONS" SECTION -->
      <section class="eg-section eg-supply-chain-section">
        <div class="container">
          <div class="eg-section-hdr text-center">
            <span class="eg-pill-badge">${esc(supplyChain.pill)}</span>
            <h2 class="eg-section-title">
              <span class="eg-accent-word">Supply</span> Chain &amp; Commercial Relations
            </h2>
            <p class="eg-section-subtitle">${esc(supplyChain.subtext)}</p>
          </div>

          <div class="eg-commercial-grid">
            <!-- Card 1: Procurement (Vijesh) -->
            <div class="eg-commercial-card">
              <div class="eg-commercial-card-top">
                <div class="eg-person-avatar purple">${esc(supplyChain.procurement.initials)}</div>
                <div>
                  <span class="eg-tag-pill">${esc(supplyChain.procurement.tag)}</span>
                  <h3 class="eg-commercial-person-name">${esc(supplyChain.procurement.name)}</h3>
                  <div class="eg-commercial-person-role">${esc(supplyChain.procurement.role)}</div>
                </div>
              </div>
              <div class="eg-commercial-links">
                <a href="mailto:${esc(supplyChain.procurement.email)}" class="eg-comm-link-btn">
                  <span>✉️</span> ${esc(supplyChain.procurement.email)}
                </a>
                <a href="tel:${esc(supplyChain.procurement.phone.replace(/\s+/g, ''))}" class="eg-comm-link-btn">
                  <span>📞</span> ${esc(supplyChain.procurement.phone)}
                </a>
              </div>
            </div>

            <!-- Card 2: General Corporate Desk -->
            <div class="eg-commercial-card">
              <div class="eg-commercial-card-top">
                <div class="eg-person-avatar teal">🏢</div>
                <div>
                  <span class="eg-tag-pill">CENTRAL DESK</span>
                  <h3 class="eg-commercial-person-name">${esc(supplyChain.corporateDesk.title)}</h3>
                  <div class="eg-commercial-person-role">Primary communications &amp; enterprise liaison</div>
                </div>
              </div>
              <div class="eg-commercial-links">
                <a href="mailto:${esc(supplyChain.corporateDesk.email)}" class="eg-comm-link-btn">
                  <span>✉️</span> ${esc(supplyChain.corporateDesk.email)}
                </a>
                <a href="https://${esc(supplyChain.corporateDesk.website)}" target="_blank" rel="noopener noreferrer" class="eg-comm-link-btn">
                  <span>🌐</span> ${esc(supplyChain.corporateDesk.website)}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 6. "REGISTERED OFFICE ADDRESS" SECTION + GOOGLE MAP -->
      <section class="eg-section eg-office-section" id="office-map-section">
        <div class="container">
          <div class="eg-office-card">
            <div class="eg-office-text-wrap">
              <span class="eg-pill-badge">REGISTERED OFFICE ADDRESS</span>
              <h2 class="eg-office-title">${esc(registeredOffice.companyName)}</h2>
              <p class="eg-office-tagline">“${esc(registeredOffice.tagline)}”</p>

              <div class="eg-office-details-grid">
                <div class="eg-office-hub-box">
                  <div class="eg-hub-icon">📍</div>
                  <div>
                    <b class="eg-hub-title">Headquarters:</b>
                    <div class="eg-hub-val">${esc(registeredOffice.headquarters)}</div>
                  </div>
                </div>

                <div class="eg-office-hub-box">
                  <div class="eg-hub-icon">🏢</div>
                  <div>
                    <b class="eg-hub-title">Regional Hubs:</b>
                    <div class="eg-hub-val">${esc(registeredOffice.regionalHubs)}</div>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="eg-office-actions">
                <a href="${esc(registeredOffice.pdfUrl)}" download="${esc(registeredOffice.pdfFilename)}" class="btn eg-btn-download-pdf">
                  <span>📄</span> Download Company Profile (PDF)
                </a>
                <a href="${esc(registeredOffice.mapDirectionsUrl)}" target="_blank" rel="noopener noreferrer" class="btn eg-btn-view-map">
                  <span>🗺️</span> View Location Map
                </a>
              </div>
            </div>

            <!-- Full-width Google Map Embed with Directions Card -->
            <div class="eg-map-container-wrap">
              <div class="eg-map-directions-badge">
                <div class="eg-map-dir-icon">📍</div>
                <div>
                  <b>Eagle Groups India (HQ)</b><br>
                  <small>Bengaluru, Karnataka, India</small>
                </div>
                <a href="${esc(registeredOffice.mapDirectionsUrl)}" target="_blank" rel="noopener noreferrer" class="eg-map-dir-link">
                  Get Directions →
                </a>
              </div>
              <iframe 
                class="eg-google-map-iframe"
                src="${registeredOffice.mapEmbedUrl}" 
                width="100%" 
                height="380" 
                style="border:0;" 
                allowfullscreen="" 
                loading="lazy" 
                referrerpolicy="no-referrer-when-downgrade"
                title="Eagle Groups India Headquarters Map">
              </iframe>
            </div>
          </div>
        </div>
      </section>

      <!-- 7. "OUR BUSINESS DIVISIONS" – 3 Verticals -->
      <section class="eg-section eg-divisions-section">
        <div class="container">
          <div class="eg-section-hdr text-center">
            <span class="eg-pill-badge">WHAT WE DO</span>
            <h2 class="eg-section-title">
              <span class="eg-accent-word">Our</span> Business Divisions
            </h2>
            <p class="eg-section-subtitle">Three dedicated enterprise verticals driving infrastructure, procurement, and digital transformation</p>
          </div>

          <div class="eg-divisions-grid">
            ${divisions.map(d => `
              <div class="eg-division-card" style="border-top: 4px solid ${d.accent || 'var(--color-primary)'}">
                <div class="eg-division-icon">${d.icon || '🏢'}</div>
                <h3 class="eg-division-title">${esc(d.name)}</h3>
                <div class="eg-division-tag">${esc(d.tag)}</div>
                <p class="eg-division-desc">${esc(d.desc)}</p>
                <div class="eg-division-footer">
                  <span class="eg-division-bullet">✓ Guaranteed Delivery &amp; SLA</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- 8. "SERVICE REACH & PRESENCE" – 17 Cities · 9+ States -->
      <section class="eg-section eg-presence-section">
        <div class="container">
          <div class="eg-section-hdr text-center">
            <span class="eg-pill-badge">${esc(presence.pill)}</span>
            <h2 class="eg-section-title">
              <span class="eg-accent-word">Service</span> Reach &amp; Presence
            </h2>
            <p class="eg-section-subtitle">${esc(presence.subtext)} with rapid on-site fulfillment</p>
          </div>

          <div class="eg-presence-card">
            <div class="eg-cities-flex">
              ${presence.cities.map(c => `
                <span class="eg-city-pill ${c.isHq ? 'eg-city-hq' : ''}">
                  ${c.isHq ? '★ ' : '📍 '}${esc(c.name)}${c.isHq ? ' (HQ)' : ''}
                </span>
              `).join('')}
            </div>
          </div>
        </div>
      </section>
    </div>
  `;

  // Attach interactive behaviors
  attachContactListeners(container);
}

function attachContactListeners(container) {
  // Smooth scroll button to form
  const btnFocus = container.querySelector('#btn-focus-contact-form');
  if (btnFocus) {
    btnFocus.onclick = () => {
      const formEl = container.querySelector('#eg-contact-inquiry-form');
      if (formEl) {
        formEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const nameInput = container.querySelector('#cf-name');
        if (nameInput) setTimeout(() => nameInput.focus(), 500);
      }
    };
  }

  // Contact form submission and validation
  const form = container.querySelector('#eg-contact-inquiry-form');
  const successBox = container.querySelector('#eg-form-success-box');
  const resetBtn = container.querySelector('#btn-send-another-msg');

  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();

      // Clear existing errors
      container.querySelectorAll('.eg-field-err').forEach(el => el.textContent = '');

      const name = container.querySelector('#cf-name').value.trim();
      const email = container.querySelector('#cf-email').value.trim();
      const phone = container.querySelector('#cf-number').value.trim();
      const subject = container.querySelector('#cf-subject').value.trim();
      const message = container.querySelector('#cf-message').value.trim();

      let hasError = false;

      if (!name || name.length < 2) {
        container.querySelector('#err-cf-name').textContent = 'Please enter your full name.';
        hasError = true;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        container.querySelector('#err-cf-email').textContent = 'Please provide a valid email address.';
        hasError = true;
      }

      const phoneClean = phone.replace(/[^\d+]/g, '');
      if (!phone || phoneClean.length < 10) {
        container.querySelector('#err-cf-number').textContent = 'Please provide a valid contact number (min 10 digits).';
        hasError = true;
      }

      if (!subject) {
        container.querySelector('#err-cf-subject').textContent = 'Please choose a subject.';
        hasError = true;
      }

      if (!message || message.length < 10) {
        container.querySelector('#err-cf-message').textContent = 'Please enter a message of at least 10 characters.';
        hasError = true;
      }

      if (hasError) return;

      const submitBtn = container.querySelector('#btn-submit-contact-form');
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>Sending...</span> <span>⏳</span>`;

      try {
        const result = await api.submitContactMessage({
          name,
          email,
          phone,
          subject,
          message
        });

        // Show success confirmation
        form.style.display = 'none';
        successBox.style.display = 'block';
        const ticketEl = container.querySelector('#eg-ticket-id');
        if (ticketEl) ticketEl.textContent = '#' + result.id;

        store.toast('Your message has been sent successfully! 📨');
      } catch (err) {
        store.toast('Error sending message: ' + err.message);
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<span>Send Message</span> <span>🚀</span>`;
      }
    };
  }

  if (resetBtn && form && successBox) {
    resetBtn.onclick = () => {
      form.reset();
      form.style.display = 'block';
      successBox.style.display = 'none';
      const submitBtn = container.querySelector('#btn-submit-contact-form');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<span>Send Message</span> <span>🚀</span>`;
      }
    };
  }
}
