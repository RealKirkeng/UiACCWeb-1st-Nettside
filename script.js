/**
 * UiA Case Club — Main Script
 * Handles: parallax, scroll reveal, navbar, mobile menu, hero animations,
 * sticky journey scroll tracking, dual audience tabs, animated counters, FAQ accordion,
 * and contact integrations for uiacaseclub@gmail.com.
 */

'use strict';

/* ===================================================
   UTILITIES
   =================================================== */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function debounce(fn, ms = 100) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); };
}

/* ===================================================
   NAVBAR — Scroll state & dynamic theme
   =================================================== */
(function initNavbar() {
  const navbar = $('#navbar');
  if (!navbar) return;

  const containers = $$('section, header, footer, main, .hero, .subpage-hero, .subpage-content, .dual-hub-section, .sticky-journey-section, .partnerships-section');

  function updateTheme() {
    const navRect = navbar.getBoundingClientRect();
    const navCenterY = navRect.top + navRect.height / 2;
    let currentTheme = 'dark'; // Default theme

    for (const container of containers) {
      const rect = container.getBoundingClientRect();
      if (rect.top <= navCenterY && rect.bottom >= navCenterY) {
        // Classify container theme
        const isLight = 
          container.classList.contains('subpage-content') || 
          container.classList.contains('about') || 
          container.classList.contains('approach') || 
          container.classList.contains('competitions') ||
          container.classList.contains('dual-hub-section') ||
          container.classList.contains('sticky-journey-section') ||
          container.classList.contains('partnerships-section') ||
          container.classList.contains('faq-section') ||
          (window.getComputedStyle(container).backgroundColor === 'rgb(255, 255, 255)') ||
          (window.getComputedStyle(container).backgroundColor === 'rgb(248, 249, 252)');
          
        if (isLight) {
          currentTheme = 'light';
        }
        break;
      }
    }
    navbar.setAttribute('data-over-theme', currentTheme);
  }

  let activeScrolled = false;

  function updateNavbar() {
    // Keep the navbar scrolled on subpages that do not feature the primary hero banner
    const isScrolled = !$('.hero') || window.scrollY > 40;
    
    if (isScrolled) {
      if (!activeScrolled) {
        activeScrolled = true;
        navbar.classList.remove('contracting');
        navbar.classList.add('scrolled');
      }
      updateTheme();
    } else {
      if (activeScrolled) {
        activeScrolled = false;
        navbar.classList.add('contracting');
        navbar.removeAttribute('data-over-theme');
        
        setTimeout(() => {
          if (!activeScrolled) {
            navbar.classList.remove('scrolled');
            navbar.classList.remove('contracting');
          }
        }, 450);
      }
    }
  }

  window.addEventListener('scroll', updateNavbar, { passive: true });
  window.addEventListener('resize', updateNavbar, { passive: true });
  updateNavbar();

  setInterval(updateNavbar, 200);
})();


/* ===================================================
   MOBILE MENU
   =================================================== */
(function initMobileMenu() {
  const hamburger   = $('#hamburger');
  const mobileMenu  = $('#mobile-menu');
  if (!hamburger || !mobileMenu) return;

  const mobileLinks = $$('.mobile-link, .mobile-menu .nav-cta, .mobile-menu a', mobileMenu);

  function openMenu() {
    hamburger.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
    mobileMenu.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.contains('open');
    isOpen ? closeMenu() : openMenu();
  });

  mobileLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMenu();
  });
})();


/* ===================================================
   HERO — Entry animations & Parallax
   =================================================== */
(function initHeroAnimations() {
  const titleLines = $$('.hero-title .line-inner');
  titleLines.forEach((line, i) => {
    setTimeout(() => line.classList.add('animate'), 200 + i * 140);
  });

  const desc      = $('#hero-desc');
  const actions   = $('#hero-actions');
  const scrollCue = $('#scroll-cue');

  if (desc)      setTimeout(() => desc.classList.add('animate'), 720);
  if (actions)   setTimeout(() => actions.classList.add('animate'), 900);
  if (scrollCue) setTimeout(() => scrollCue.classList.add('animate'), 1200);

  const stats = $$('.stat-item');
  stats.forEach((stat, i) => {
    setTimeout(() => stat.classList.add('animate'), 1100 + i * 100);
  });

  const heroBg = $('#hero-bg');
  if (heroBg) {
    setTimeout(() => heroBg.classList.add('loaded'), 100);
  }
})();

(function initParallax() {
  const parallax = $('#hero-parallax');
  if (!parallax || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let ticking = false;

  function updateParallax() {
    const scrollY  = window.scrollY;
    const heroEl   = $('#hero');
    if (!heroEl) return;
    const heroH    = heroEl.offsetHeight;

    if (scrollY <= heroH) {
      const offset = scrollY * 0.35;
      parallax.style.transform = `translateY(${offset}px)`;
    }
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }, { passive: true });
})();


/* ===================================================
   SCROLL REVEAL (IntersectionObserver)
   =================================================== */
(function initScrollReveal() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    $$('.reveal').forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = entry.target;

          if (target.classList.contains('reveal-group')) {
            const children = $$('.reveal', target);
            children.forEach((child, idx) => {
              if (![...child.classList].some(cls => cls.startsWith('reveal-delay-'))) {
                child.style.transitionDelay = `${idx * 100}ms`;
              }
              child.classList.add('visible');
            });
          } else {
            target.classList.add('visible');
          }
          
          observer.unobserve(target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -30px 0px',
    }
  );

  $$('.reveal, .reveal-group').forEach(el => {
    if (el.classList.contains('reveal') && el.closest('.reveal-group')) {
      return;
    }
    observer.observe(el);
  });
})();


/* ===================================================
   DUAL-AUDIENCE TAB SWITCHER
   =================================================== */
(function initAudienceSwitcher() {
  const tabBtns = $$('.audience-tab-btn');
  const panels  = $$('.audience-panel');

  if (!tabBtns.length || !panels.length) return;

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      
      tabBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      panels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      const targetPanel = $(`#${targetId}`);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }
    });
  });
})();


/* ===================================================
   STICKY JOURNEY SCROLL TRACKER
   =================================================== */
(function initStickyJourney() {
  const stepCards = $$('.journey-step-card');
  const stepPills = $$('.journey-step-pill');

  if (!stepCards.length || !stepPills.length) return;

  // Click on indicator pill to smooth scroll to step card
  stepPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const stepIndex = pill.getAttribute('data-step');
      const targetCard = $(`#step-${stepIndex}`);
      if (targetCard) {
        const top = targetCard.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // Track scroll position to activate corresponding pill
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const cardId = entry.target.id;
        const stepNum = cardId.replace('step-', '');

        stepPills.forEach(pill => {
          if (pill.getAttribute('data-step') === stepNum) {
            pill.classList.add('active');
          } else {
            pill.classList.remove('active');
          }
        });
      }
    });
  }, {
    threshold: 0.45,
    rootMargin: '-50px 0px -40% 0px'
  });

  stepCards.forEach(card => observer.observe(card));
})();


/* ===================================================
   FAQ ACCORDION (Enhanced)
   =================================================== */
(function initFaqAccordion() {
  // Legacy .faq-item support
  $$('.faq-item').forEach(item => {
    const btn = $('.faq-question-btn', item);
    if (!btn) return;
    btn.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      $$('.faq-item').forEach(i => i.classList.remove('active'));
      if (!isActive) item.classList.add('active');
    });
  });

  // Modern .faq-card support
  const faqCards = $$('.faq-card');
  faqCards.forEach(card => {
    const btn = $('.faq-toggle-btn', card);
    if (!btn) return;

    btn.addEventListener('click', () => {
      const isAlreadyActive = card.classList.contains('active');
      faqCards.forEach(c => c.classList.remove('active'));
      if (!isAlreadyActive) {
        card.classList.add('active');
      }
    });
  });
})();


/* ===================================================
   SMOOTH NAV LINKS (Offset calculation)
   =================================================== */
(function initSmoothNav() {
  const NAV_HEIGHT = 72;
  const navHeight  = parseInt(
    getComputedStyle(document.documentElement)
      .getPropertyValue('--nav-height') || NAV_HEIGHT
  );

  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#' || href.length <= 1) return;
      const target = $(href);
      if (!target) return;
      
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();


/* ===================================================
   CONTACT FORM & WIDGET (uiacaseclub@gmail.com)
   =================================================== */
(function initContactForm() {
  const form   = $('#contact-form');
  const submit = $('#form-submit');
  if (!form || !submit) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name    = $('#form-name') ? $('#form-name').value.trim() : '';
    const email   = $('#form-email') ? $('#form-email').value.trim() : '';
    const subject = $('#form-subject') ? $('#form-subject').value.trim() : 'Inquiry for UiA Case Club';
    const message = $('#form-message') ? $('#form-message').value.trim() : '';

    if (!name || !email || !message) {
      [['#form-name', name], ['#form-email', email], ['#form-message', message]]
        .forEach(([sel, val]) => {
          const el = $(sel);
          if (el && !val) {
            el.style.borderColor = 'rgba(199,14,46,0.7)';
            el.addEventListener('input', () => { el.style.borderColor = ''; }, { once: true });
          }
        });
      return;
    }

    submit.textContent = 'Preparing Email…';
    submit.disabled = true;

    await new Promise(r => setTimeout(r, 600));

    // Construct mailto link
    const mailtoSubject = encodeURIComponent(`[UiA Case Club Website] ${subject} - ${name}`);
    const mailtoBody = encodeURIComponent(`Hello UiA Case Club Team,\n\n${message}\n\nFrom:\n${name}\nEmail: ${email}`);
    
    // Redirect to user's mail client
    window.location.href = `mailto:uiacaseclub@gmail.com?subject=${mailtoSubject}&body=${mailtoBody}`;

    submit.textContent = '✓ Opening Email Client!';
    submit.style.background = '#16a34a';
    form.reset();

    setTimeout(() => {
      submit.textContent = 'Send Message';
      submit.style.background = '';
      submit.disabled = false;
    }, 4000);
  });
})();

(function initContactWidget() {
  const widget   = $('#contact-widget');
  const bubble   = $('#widget-bubble');
  const closeBtn = $('#widget-close');
  const form     = $('#widget-form');

  if (!widget || !bubble || !closeBtn) return;

  bubble.addEventListener('click', () => {
    widget.classList.add('active');
    const box = $('#widget-box');
    if (box) box.setAttribute('aria-hidden', 'false');
    setTimeout(() => {
      const firstInput = $('#widget-name');
      if (firstInput) firstInput.focus();
    }, 150);
  });

  closeBtn.addEventListener('click', () => {
    widget.classList.remove('active');
    const box = $('#widget-box');
    if (box) box.setAttribute('aria-hidden', 'true');
  });

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name    = $('#widget-name') ? $('#widget-name').value.trim() : '';
      const email   = $('#widget-email') ? $('#widget-email').value.trim() : '';
      const message = $('#widget-message') ? $('#widget-message').value.trim() : '';

      if (!name || !email || !message) return;

      const subject = `Inquiry from ${name} (UiA Case Club Website Widget)`;
      const body = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;

      window.location.href = `mailto:uiacaseclub@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      form.reset();
      widget.classList.remove('active');
      const box = $('#widget-box');
      if (box) box.setAttribute('aria-hidden', 'true');
    });
  }
})();
