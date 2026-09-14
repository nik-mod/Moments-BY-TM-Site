(() => {
  'use strict';

  const body = document.body;
  requestAnimationFrame(() => requestAnimationFrame(() => body.classList.add('ready')));
  const header = document.querySelector('.site-header');
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileLinks = document.querySelectorAll('.mobile-nav a');
  const mobileMenu = document.querySelector('#mobile-menu');
  const progress = document.querySelector('.scroll-progress');
  document.documentElement.classList.add('motion-ready');

  const setHeaderState = () => {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 24);
  };

  const setProgress = () => {
    if (!progress) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
    progress.style.width = `${Math.min(100, Math.max(0, pct))}%`;
  };

  setHeaderState();
  setProgress();
  window.addEventListener('scroll', () => {
    setHeaderState();
    setProgress();
  }, { passive: true });

  if (mobileMenu) mobileMenu.setAttribute('aria-hidden', 'true');

  const setMenu = (open, { returnFocus = false } = {}) => {
    body.classList.toggle('menu-open', open);
    menuToggle?.setAttribute('aria-expanded', String(open));
    menuToggle?.setAttribute('aria-label', open ? 'მენიუს დახურვა' : 'მენიუს გახსნა');
    mobileMenu?.setAttribute('aria-hidden', String(!open));
    if (open) {
      window.setTimeout(() => mobileLinks[0]?.focus(), 120);
    } else if (returnFocus) {
      menuToggle?.focus();
    }
  };

  if (menuToggle) {
    menuToggle.addEventListener('click', () => setMenu(!body.classList.contains('menu-open')));
  }

  mobileLinks.forEach(link => link.addEventListener('click', () => setMenu(false)));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && body.classList.contains('menu-open')) {
      setMenu(false, { returnFocus: true });
    }
    if (event.key === 'Tab' && body.classList.contains('menu-open') && mobileMenu) {
      const focusable = [menuToggle, ...mobileMenu.querySelectorAll('a[href], button:not([disabled])')].filter(Boolean);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });

  const revealEls = document.querySelectorAll('.reveal, .image-reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px' });
    revealEls.forEach(el => observer.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('revealed'));
  }

  // Subtle parallax, disabled for reduced-motion users.
  const heroImage = document.querySelector('[data-parallax]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (heroImage && !reduceMotion) {
    window.addEventListener('scroll', () => {
      const rect = heroImage.parentElement.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        const offset = Math.max(-18, Math.min(18, -rect.top * 0.025));
        heroImage.style.translate = `0 ${offset}px`;
      }
    }, { passive: true });
  }

  // Portfolio filtering
  const filterButtons = document.querySelectorAll('[data-filter]');
  const portfolioItems = document.querySelectorAll('[data-category]');
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      filterButtons.forEach(btn => {
        const active = btn === button;
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-pressed', String(active));
      });
      let visibleIndex = 0;
      portfolioItems.forEach(item => {
        const categories = (item.dataset.category || '').split(' ');
        const show = filter === 'all' || categories.includes(filter);
        item.classList.toggle('is-hidden', !show);
        if (show && !reduceMotion && item.animate) {
          item.animate([
            { opacity: 0, transform: 'translateY(14px) scale(.985)' },
            { opacity: 1, transform: 'none' }
          ], { duration: 360, delay: Math.min(visibleIndex * 35, 210), easing: 'cubic-bezier(.22,.61,.36,1)', fill: 'both' });
          visibleIndex += 1;
        }
      });
    });
  });

  const requestedFilter = new URLSearchParams(window.location.search).get('filter');
  if (requestedFilter) {
    const requestedButton = [...filterButtons].find(btn => btn.dataset.filter === requestedFilter);
    requestedButton?.click();
  }

  // Portfolio lightbox
  const lightbox = document.querySelector('.lightbox');
  const lightboxImage = lightbox?.querySelector('img');
  const lightboxCaption = lightbox?.querySelector('figcaption');
  const lightboxClose = lightbox?.querySelector('.lightbox-close');
  let lastFocused = null;

  const closeLightbox = () => {
    if (!lightbox) return;
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    body.classList.remove('lightbox-open');
    if (lastFocused) lastFocused.focus();
  };

  document.querySelectorAll('.portfolio-item').forEach(item => {
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    const open = () => {
      if (!lightbox || !lightboxImage) return;
      const image = item.querySelector('img');
      if (!image) return;
      lastFocused = item;
      lightboxImage.src = image.src;
      lightboxImage.alt = image.alt;
      if (lightboxCaption) lightboxCaption.textContent = item.dataset.caption || image.alt;
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
      body.classList.add('lightbox-open');
      lightboxClose?.focus();
    };
    item.addEventListener('click', open);
    item.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        open();
      }
    });
  });

  lightboxClose?.addEventListener('click', closeLightbox);
  lightbox?.addEventListener('click', event => {
    if (event.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && lightbox?.classList.contains('open')) closeLightbox();
  });

  // FAQ accordion
  document.querySelectorAll('.faq-question').forEach(button => {
    button.addEventListener('click', () => {
      const item = button.closest('.faq-item');
      if (!item) return;
      const open = item.classList.toggle('open');
      button.setAttribute('aria-expanded', String(open));
    });
  });

  // Booking form client-side validation.
  const bookingForm = document.querySelector('#booking-form');
  if (bookingForm) {
    const dateInput = bookingForm.querySelector('input[type="date"]');
    const sessionSelect = bookingForm.querySelector('#session');
    const requestedSession = new URLSearchParams(window.location.search).get('session');
    if (sessionSelect && requestedSession && [...sessionSelect.options].some(option => option.value === requestedSession)) {
      sessionSelect.value = requestedSession;
    }
    if (dateInput) {
      const today = new Date();
      const local = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().split('T')[0];
      dateInput.min = local;
    }

    const validators = {
      name: value => value.trim().length >= 2 ? '' : 'გთხოვთ, მიუთითოთ სახელი.',
      phone: value => /^[+\d][\d\s()\-]{7,}$/.test(value.trim()) ? '' : 'მიუთითეთ სწორი ტელეფონის ნომერი.',
      email: value => !value.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? '' : 'ელფოსტის ფორმატი არასწორია.',
      session: value => value ? '' : 'აირჩიეთ ფოტოსესიის ტიპი.',
      date: value => value ? '' : 'აირჩიეთ სასურველი თარიღი.',
      message: value => value.trim().length >= 8 ? '' : 'დაწერეთ რამდენიმე სიტყვა თქვენს იდეაზე.'
    };

    const validateField = field => {
      const key = field.name;
      if (!validators[key]) return true;
      const message = validators[key](field.value);
      const error = bookingForm.querySelector(`[data-error-for="${key}"]`);
      field.classList.toggle('invalid', Boolean(message));
      field.setAttribute('aria-invalid', String(Boolean(message)));
      if (error) error.textContent = message;
      return !message;
    };

    bookingForm.querySelectorAll('input, select, textarea').forEach(field => {
      field.addEventListener('blur', () => validateField(field));
      field.addEventListener('input', () => {
        if (field.classList.contains('invalid')) validateField(field);
      });
    });

    bookingForm.addEventListener('submit', event => {
      event.preventDefault();
      const fields = [...bookingForm.querySelectorAll('[name]')].filter(field => field.type !== 'checkbox');
      let valid = true;
      fields.forEach(field => { if (!validateField(field)) valid = false; });
      const consent = bookingForm.querySelector('#consent');
      const consentError = bookingForm.querySelector('[data-error-for="consent"]');
      const consentValid = Boolean(consent?.checked);
      if (consentError) consentError.textContent = consentValid ? '' : 'გთხოვთ, დაეთანხმოთ მონაცემების გამოყენებას მხოლოდ დაჯავშნის მიზნით.';
      if (!valid || !consentValid) {
        const firstInvalid = bookingForm.querySelector('.invalid') || consent;
        firstInvalid?.focus();
        return;
      }

      const success = bookingForm.querySelector('.form-success');
      const submitButton = bookingForm.querySelector('button[type="submit"]');
      const sessionLabel = bookingForm.querySelector('#session')?.selectedOptions?.[0]?.textContent || '';
      const requestText = [
        'გამარჯობა, Moments by TM ✨',
        '',
        `სახელი: ${bookingForm.elements.name.value.trim()}`,
        `ტელეფონი: ${bookingForm.elements.phone.value.trim()}`,
        bookingForm.elements.email.value.trim() ? `ელფოსტა: ${bookingForm.elements.email.value.trim()}` : '',
        `ფოტოსესია: ${sessionLabel}`,
        `სასურველი თარიღი: ${bookingForm.elements.date.value}`,
        '',
        'იდეა / დეტალები:',
        bookingForm.elements.message.value.trim()
      ].filter(Boolean).join('\n');

      const copyRequestText = async () => {
        try {
          if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(requestText);
            return true;
          }
        } catch (_) { /* fall through to legacy copy */ }
        const helper = document.createElement('textarea');
        helper.value = requestText;
        helper.setAttribute('readonly', '');
        helper.style.position = 'fixed';
        helper.style.opacity = '0';
        document.body.appendChild(helper);
        helper.select();
        let copied = false;
        try { copied = document.execCommand('copy'); } catch (_) { copied = false; }
        helper.remove();
        return copied;
      };
      copyRequestText().then(copied => {
        if (success) {
          success.firstChild.textContent = copied
            ? 'მოთხოვნის ტექსტი მზადაა და დაკოპირდა. გახსენით '
            : 'მოთხოვნის ტექსტი მზადაა. გახსენით ';
        }
      });
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'მოთხოვნა მომზადებულია ✓';
      }
      success?.classList.add('show');
    });
  }


  // Tactile click feedback for CTA buttons (works on touch and mouse).
  document.querySelectorAll('.btn-primary, .btn-secondary, .btn-dark, .nav-cta').forEach(button => {
    button.addEventListener('pointerdown', event => {
      if (reduceMotion) return;
      const rect = button.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(rect.width, rect.height) * 2.1;
      ripple.className = 'tap-ripple';
      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;
      ripple.style.left = `${event.clientX - rect.left}px`;
      ripple.style.top = `${event.clientY - rect.top}px`;
      button.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
    });
  });

  document.querySelectorAll('[data-year]').forEach(el => {
    el.textContent = String(new Date().getFullYear());
  });
})();
