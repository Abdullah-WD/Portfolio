document.addEventListener('DOMContentLoaded', () => {

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------
     Intro splash — boot sequence + typing + sound
  --------------------------------------------------------- */
  const introLoader = document.getElementById('introLoader');
  const introGate = document.getElementById('introGate');
  const introInner = document.getElementById('introInner');
  const introBoot = document.getElementById('introBoot');
  const introTyped = document.getElementById('introTyped');
  const introProgress = document.getElementById('introProgress');
  const introSkip = document.getElementById('introSkip');

  const bootLines = [
    'booting profile.sh ...',
    'loading skills.json ...  [OK]',
    'compiling projects/ ...  [OK]',
    'connecting to visitor session ...  [OK]'
  ];
  const introText = 'Abdullah Zafar — Web Developer';

  let audioCtx = null;
  let introFinished = false;

  function getAudioCtx() {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) audioCtx = new AC();
    }
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }

  // Synthesized mechanical "key click" — no external audio file needed
  function playKeySound() {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    const bufferSize = ctx.sampleRate * 0.02;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 2200 + Math.random() * 800;
    bandpass.Q.value = 1.1;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    noise.connect(bandpass).connect(gain).connect(ctx.destination);
    noise.start(now);
    noise.stop(now + 0.05);
  }

  // Soft ascending chime when the intro completes
  function playDoneChime() {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const notes = [523.25, 659.25, 783.99];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const start = ctx.currentTime + i * 0.09;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.12, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);
      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.4);
    });
  }

  function hideIntroLoader() {
    if (introFinished) return;
    introFinished = true;
    document.body.classList.remove('preload-lock');
    if (introLoader) {
      introLoader.classList.add('intro-hidden');
      setTimeout(() => introLoader.remove(), 700);
    }
  }

  function updateProgress(pct) {
    if (introProgress) introProgress.style.width = Math.min(pct, 100) + '%';
  }

  function typeBootLines(done) {
    let idx = 0;
    function next() {
      if (idx >= bootLines.length) { done(); return; }
      const line = document.createElement('p');
      line.className = 'boot-line';
      const raw = bootLines[idx];
      const okMatch = raw.match(/(.*)(\[OK\])$/);
      if (okMatch) {
        line.innerHTML = `<span>${okMatch[1]}</span><span class="boot-ok">${okMatch[2]}</span>`;
      } else {
        line.textContent = raw;
      }
      introBoot.appendChild(line);
      updateProgress(10 + (idx + 1) * 12);
      idx++;
      setTimeout(next, 220);
    }
    next();
  }

  function typeMainTitle(done) {
    let i = 0;
    function step() {
      if (i < introText.length) {
        introTyped.textContent += introText.charAt(i);
        if (introText.charAt(i) !== ' ' && introText.charAt(i) !== '—') playKeySound();
        i++;
        updateProgress(58 + (i / introText.length) * 42);
        setTimeout(step, 48);
      } else {
        done();
      }
    }
    step();
  }

  function runIntroSequence() {
    typeBootLines(() => {
      typeMainTitle(() => {
        updateProgress(100);
        playDoneChime();
        setTimeout(hideIntroLoader, 750);
      });
    });
  }

  function enterIntro() {
    getAudioCtx();
    if (introGate) introGate.classList.add('intro-gate-hidden');
    if (introInner) introInner.classList.add('intro-inner-active');
    runIntroSequence();
  }

  if (introLoader && introTyped) {
    if (reducedMotion) {
      introTyped.textContent = introText;
      hideIntroLoader();
    } else {
      // Safety net in case anything stalls
      setTimeout(hideIntroLoader, 9000);

      if (introGate) {
        introGate.addEventListener('click', enterIntro, { once: true });
      } else {
        enterIntro();
      }

      if (introSkip) {
        introSkip.addEventListener('click', (e) => {
          e.stopPropagation();
          hideIntroLoader();
        });
      }
    }
  } else {
    document.body.classList.remove('preload-lock');
  }

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
