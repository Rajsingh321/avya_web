/* ═══════════════════════════════════
   AVYA — Backend / Interaction Layer
   Scroll reveals, nav, form handling
═══════════════════════════════════ */

(function () {
  'use strict';

  // ── Scroll Progress Bar ──
  function updateScrollProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    document.documentElement.style.setProperty('--scroll', progress + '%');
  }

  // ── Nav scroll state ──
  const nav = document.getElementById('nav');
  function updateNav() {
    if (window.scrollY > 40) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }

  // ── Reveal on scroll ──
  const revealEls = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // Stagger siblings that share the same parent
          const siblings = Array.from(
            entry.target.parentElement.querySelectorAll('.reveal:not(.visible)')
          );
          const idx = siblings.indexOf(entry.target);
          const delay = Math.min(idx * 60, 300);

          setTimeout(() => {
            entry.target.classList.add('visible');
          }, delay);

          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  revealEls.forEach((el) => revealObserver.observe(el));

  // ── Smooth anchor scroll (with nav offset) ──
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navH = nav ? nav.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - navH - 20;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // ── Form Handling ──
  const form = document.getElementById('accessForm');
  const msg = document.getElementById('formMessage');

  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      const btn = form.querySelector('.form-btn');
      const originalText = btn.textContent;

      // Gather data
      const data = {
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        city: form.city.value.trim(),
        role: form.role.value,
        timestamp: new Date().toISOString(),
      };

      // Basic validation
      if (!data.name || !data.email || !data.city || !data.role) {
        showMessage('Please fill in all fields.', 'error');
        return;
      }
      if (!isValidEmail(data.email)) {
        showMessage('Please enter a valid email address.', 'error');
        return;
      }

      // Simulate submission
      btn.textContent = 'Submitting…';
      btn.style.pointerEvents = 'none';
      btn.style.opacity = '0.6';

      try {
        await submitEarlyAccess(data);
        showMessage(
          `Thank you, ${data.name.split(' ')[0]}. You're on the list. We'll be in touch.`,
          'success'
        );
        form.reset();
      } catch (err) {
        showMessage(
          'Something went wrong. Please try again or email us directly.',
          'error'
        );
        console.error('[AVYA] Form submission error:', err);
      } finally {
        btn.textContent = originalText;
        btn.style.pointerEvents = '';
        btn.style.opacity = '';
      }
    });
  }

  function showMessage(text, type) {
    if (!msg) return;
    msg.textContent = text;
    msg.className = 'form-message ' + type;
    msg.style.opacity = '0';
    requestAnimationFrame(() => {
      msg.style.transition = 'opacity 0.4s ease';
      msg.style.opacity = '1';
    });
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /**
   * submitEarlyAccess
   * Stores the submission locally (localStorage) and logs to console.
   * In production, replace the body of this function with your API call.
   * Example with a real endpoint:
   *   const res = await fetch('https://your-api.com/early-access', {
   *     method: 'POST',
   *     headers: { 'Content-Type': 'application/json' },
   *     body: JSON.stringify(data),
   *   });
   *   if (!res.ok) throw new Error('Network error');
   */
  async function submitEarlyAccess(data) {
    // Simulate network delay
    await delay(1200);

    // Store locally
    const existing = JSON.parse(localStorage.getItem('avya_signups') || '[]');
    existing.push(data);
    localStorage.setItem('avya_signups', JSON.stringify(existing));

    console.log('[AVYA] Early access submission recorded:', data);
    console.log(
      '[AVYA] Total signups stored locally:',
      existing.length
    );

    return { success: true };
  }

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // ── Scroll listener (throttled) ──
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateScrollProgress();
        updateNav();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // ── Init ──
  updateScrollProgress();
  updateNav();

  // Trigger reveals already in viewport on load
  setTimeout(() => {
    revealEls.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.9) {
        el.classList.add('visible');
      }
    });
  }, 100);

  // ── Console signature ──
  console.log(
    '%cAVYA — Early Access',
    'font-family: serif; font-size: 16px; color: #f5f4f0; background: #0a0a0a; padding: 8px 14px;'
  );
  console.log(
    '%cBuilt for real life. Not presentations.',
    'font-family: serif; font-size: 11px; color: #666; padding: 2px 14px;'
  );
})();