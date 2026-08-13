document.addEventListener('DOMContentLoaded', () => {

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------
     Footer year
  --------------------------------------------------------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------------------------------------------------
     Cursor glow (desktop only)
  --------------------------------------------------------- */
  const glow = document.getElementById('cursorGlow');
  if (glow && !reducedMotion && window.matchMedia('(pointer: fine)').matches) {
    window.addEventListener('mousemove', (e) => {
      glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%,-50%)`;
    });
  } else if (glow) {
    glow.style.display = 'none';
  }

  /* ---------------------------------------------------------
     Terminal typing effect
  --------------------------------------------------------- */
  const typedOutput = document.getElementById('typedOutput');
  const lines = [
    'Web Developer',
    'BSIT Student — 7th Semester',
    'Stack: HTML · CSS · JS · C++ · C# · Python'
  ];

  function typeLines(el, textLines, speed = 32) {
    let lineIndex = 0;
    let charIndex = 0;
    el.textContent = '';

    function typeChar() {
      if (lineIndex >= textLines.length) return;
      const currentLine = textLines[lineIndex];

      if (charIndex < currentLine.length) {
        el.textContent += currentLine.charAt(charIndex);
        charIndex++;
        setTimeout(typeChar, speed);
      } else {
        el.textContent += '\n';
        lineIndex++;
        charIndex = 0;
        setTimeout(typeChar, speed * 8);
      }
    }
    typeChar();
  }

  if (typedOutput) {
    if (reducedMotion) {
      typedOutput.textContent = lines.join('\n');
    } else {
      setTimeout(() => typeLines(typedOutput, lines), 500);
    }
  }

  /* ---------------------------------------------------------
     Mobile menu toggle
  --------------------------------------------------------- */
  const menuToggle = document.getElementById('menuToggle');
  const tabs = document.getElementById('tabs');
  if (menuToggle && tabs) {
    menuToggle.addEventListener('click', () => {
      const isOpen = tabs.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', isOpen);
    });
    tabs.querySelectorAll('.tab').forEach(t => {
      t.addEventListener('click', () => {
        tabs.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------------------------------------------------------
     Scrollspy — highlight active tab
  --------------------------------------------------------- */
  const sections = document.querySelectorAll('main section[id]');
  const tabLinks = document.querySelectorAll('.tab');

  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        tabLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { rootMargin: '-40% 0px -50% 0px', threshold: 0 });

  sections.forEach(sec => spyObserver.observe(sec));

  /* ---------------------------------------------------------
     Scroll reveal
  --------------------------------------------------------- */
  const revealEls = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');

        // If this reveal contains skill bars, animate their fill
        entry.target.querySelectorAll('.skill-fill').forEach((bar, i) => {
          setTimeout(() => bar.classList.add('animate'), i * 90);
        });

        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealEls.forEach(el => revealObserver.observe(el));

  if (reducedMotion) {
    revealEls.forEach(el => {
      el.classList.add('in-view');
      el.querySelectorAll('.skill-fill').forEach(bar => bar.classList.add('animate'));
    });
  }

});
