// ============================================
// MobileCellMedix — Iteration 5
// Clean, zero-dependency interactions
// ============================================

(function () {
  'use strict';

  // ---------- Footer Year ----------
  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---------- Header Scroll ----------
  const header = document.getElementById('site-header');
  let ticking = false;

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        header.classList.toggle('scrolled', window.scrollY > 12);
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  // ---------- Smooth Anchor Scroll ----------
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (id === '#') return;

      const target = document.querySelector(id);
      if (!target) return;

      e.preventDefault();
      const offset = header.offsetHeight + 12;

      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - offset,
        behavior: 'smooth'
      });
    });
  });

  // ---------- Scroll Reveal ----------
  const revealEls = document.querySelectorAll('.reveal, .reveal-scale');

  if ('IntersectionObserver' in window && revealEls.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -48px 0px' }
    );

    revealEls.forEach(el => observer.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('visible'));
  }

  // ---------- Reviews Carousel ----------
  const carousel = document.getElementById('reviews-carousel');
  const track = document.getElementById('reviews-track');
  const dotsContainer = document.getElementById('reviews-dots');
  const leftArrow = document.querySelector('.reviews-arrow-left');
  const rightArrow = document.querySelector('.reviews-arrow-right');

  if (carousel && track) {
    const cards = track.querySelectorAll('.review-card');
    let currentIndex = 0;
    let autoPlayTimer = null;

    function getCardsVisible() {
      const cardEl = cards[0];
      if (!cardEl) return 1;
      const cardWidth = cardEl.offsetWidth + 16; // card + gap
      return Math.max(1, Math.floor(carousel.offsetWidth / cardWidth));
    }

    function getMaxIndex() {
      return Math.max(0, cards.length - getCardsVisible());
    }

    function updateCarousel() {
      const cardWidth = cards[0].offsetWidth + 16;
      const offset = currentIndex * cardWidth;
      track.style.transform = `translateX(-${offset}px)`;
      updateDots();
      updateArrows();
    }

    function updateArrows() {
      if (leftArrow) leftArrow.disabled = currentIndex <= 0;
      if (rightArrow) rightArrow.disabled = currentIndex >= getMaxIndex();
    }

    function buildDots() {
      if (!dotsContainer) return;
      dotsContainer.innerHTML = '';
      const maxI = getMaxIndex();
      const numDots = maxI + 1;
      for (let i = 0; i < numDots; i++) {
        const dot = document.createElement('button');
        dot.classList.add('reviews-dot');
        dot.setAttribute('aria-label', `Go to review group ${i + 1}`);
        if (i === currentIndex) dot.classList.add('active');
        dot.addEventListener('click', () => {
          currentIndex = i;
          updateCarousel();
          restartAutoPlay();
        });
        dotsContainer.appendChild(dot);
      }
    }

    function updateDots() {
      if (!dotsContainer) return;
      const dots = dotsContainer.querySelectorAll('.reviews-dot');
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentIndex);
      });
    }

    if (leftArrow) {
      leftArrow.addEventListener('click', () => {
        if (currentIndex > 0) {
          currentIndex--;
          updateCarousel();
          restartAutoPlay();
        }
      });
    }

    if (rightArrow) {
      rightArrow.addEventListener('click', () => {
        if (currentIndex < getMaxIndex()) {
          currentIndex++;
          updateCarousel();
          restartAutoPlay();
        }
      });
    }

    // Drag support
    let isDragging = false;
    let startX = 0;
    let currentTranslate = 0;

    carousel.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.pageX;
      currentTranslate = currentIndex * (cards[0].offsetWidth + 16);
      carousel.classList.add('dragging');
    });

    carousel.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const diff = startX - e.pageX;
      track.style.transform = `translateX(-${currentTranslate + diff}px)`;
    });

    carousel.addEventListener('mouseup', (e) => {
      if (!isDragging) return;
      isDragging = false;
      carousel.classList.remove('dragging');
      const diff = startX - e.pageX;
      const threshold = cards[0].offsetWidth / 4;
      if (diff > threshold && currentIndex < getMaxIndex()) {
        currentIndex++;
      } else if (diff < -threshold && currentIndex > 0) {
        currentIndex--;
      }
      updateCarousel();
      restartAutoPlay();
    });

    carousel.addEventListener('mouseleave', () => {
      if (isDragging) {
        isDragging = false;
        carousel.classList.remove('dragging');
        updateCarousel();
      }
    });

    // Touch support
    carousel.addEventListener('touchstart', (e) => {
      isDragging = true;
      startX = e.touches[0].pageX;
      currentTranslate = currentIndex * (cards[0].offsetWidth + 16);
      carousel.classList.add('dragging');
    }, { passive: true });

    carousel.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      const diff = startX - e.touches[0].pageX;
      track.style.transform = `translateX(-${currentTranslate + diff}px)`;
    }, { passive: true });

    carousel.addEventListener('touchend', (e) => {
      if (!isDragging) return;
      isDragging = false;
      carousel.classList.remove('dragging');
      const diff = startX - (e.changedTouches[0]?.pageX || startX);
      const threshold = cards[0].offsetWidth / 4;
      if (diff > threshold && currentIndex < getMaxIndex()) {
        currentIndex++;
      } else if (diff < -threshold && currentIndex > 0) {
        currentIndex--;
      }
      updateCarousel();
      restartAutoPlay();
    });

    // Auto-play
    function startAutoPlay() {
      autoPlayTimer = setInterval(() => {
        if (currentIndex < getMaxIndex()) {
          currentIndex++;
        } else {
          currentIndex = 0;
        }
        updateCarousel();
      }, 5000);
    }

    function restartAutoPlay() {
      clearInterval(autoPlayTimer);
      startAutoPlay();
    }

    // Pause on hover
    carousel.addEventListener('mouseenter', () => clearInterval(autoPlayTimer));
    carousel.addEventListener('mouseleave', () => {
      if (!isDragging) startAutoPlay();
    });

    // Responsive rebuild
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (currentIndex > getMaxIndex()) currentIndex = getMaxIndex();
        buildDots();
        updateCarousel();
      }, 150);
    });

    // Init
    buildDots();
    updateCarousel();
    startAutoPlay();
  }

  // ---------- FAQ Accordion ----------
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');

      // Close all others
      faqItems.forEach(otherItem => {
        otherItem.classList.remove('active');
        otherItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
        otherItem.querySelector('.faq-answer').style.maxHeight = null;
      });

      // Toggle current
      if (!isOpen) {
        item.classList.add('active');
        question.setAttribute('aria-expanded', 'true');
        const answer = item.querySelector('.faq-answer');
        answer.style.maxHeight = answer.scrollHeight + "px";
      }
    });
  });

  // ---------- Booking Drawer ----------
  const fab = document.getElementById('fab-book');
  const backdrop = document.getElementById('booking-backdrop');
  const drawer = document.getElementById('booking-drawer');
  const drawerClose = document.getElementById('drawer-close');
  const bookingForm = document.getElementById('booking-form');
  const drawerSuccess = document.getElementById('drawer-success');
  const submitBtn = document.getElementById('btn-submit');
  const formError = document.getElementById('form-error');

  function openDrawer() {
    backdrop.classList.add('active');
    drawer.classList.add('active');
    fab.classList.add('hidden');
    document.body.style.overflow = 'hidden';
    // Focus the first input after animation
    setTimeout(() => {
      const firstInput = bookingForm.querySelector('input:not([type="hidden"])');
      if (firstInput) firstInput.focus();
    }, 400);
  }

  function closeDrawer() {
    backdrop.classList.remove('active');
    drawer.classList.remove('active');
    fab.classList.remove('hidden');
    document.body.style.overflow = '';
  }

  function resetDrawer() {
    bookingForm.classList.remove('hidden');
    drawerSuccess.classList.remove('active');
    bookingForm.reset();
    formError.textContent = '';
    submitBtn.classList.remove('loading');
    submitBtn.disabled = false;
  }

  if (fab) fab.addEventListener('click', openDrawer);
  if (drawerClose) drawerClose.addEventListener('click', () => {
    closeDrawer();
    // Reset form after close animation
    setTimeout(resetDrawer, 500);
  });
  if (backdrop) backdrop.addEventListener('click', () => {
    closeDrawer();
    setTimeout(resetDrawer, 500);
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('active')) {
      closeDrawer();
      setTimeout(resetDrawer, 500);
    }
  });

  // ---------- Formspree AJAX Submission ----------
  if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      formError.textContent = '';

      // Basic validation
      const phone = bookingForm.querySelector('#booking-phone').value.trim();
      const name = bookingForm.querySelector('#booking-name').value.trim();

      if (!name) {
        formError.textContent = 'Please enter your name.';
        return;
      }
      if (!phone || phone.length < 7) {
        formError.textContent = 'Please enter a valid phone number.';
        return;
      }

      // Show loading
      submitBtn.classList.add('loading');
      submitBtn.disabled = true;

      try {
        const formData = new FormData(bookingForm);
        const response = await fetch(bookingForm.action, {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          // Show success
          bookingForm.classList.add('hidden');
          drawerSuccess.classList.add('active');
        } else {
          const data = await response.json();
          if (data.errors) {
            formError.textContent = data.errors.map(err => err.message).join(', ');
          } else {
            formError.textContent = 'Something went wrong. Please try again or call us directly.';
          }
          submitBtn.classList.remove('loading');
          submitBtn.disabled = false;
        }
      } catch (err) {
        formError.textContent = 'Network error. Please try again or call (905) 302-1942.';
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
      }
    });
  }

})();
