const burger = document.getElementById('burger');
  const navLinks = document.getElementById('navLinks');
  burger.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
  });
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
  }));

  const toTop = document.getElementById('toTop');
  window.addEventListener('scroll', () => {
    toTop.classList.toggle('show', window.scrollY > 400);
  });
  toTop.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));

    // duplicate the track content once so the loop is seamless
  const track = document.getElementById('track');
  track.innerHTML += track.innerHTML;

// ---------- Typewriter effect for hero title (multi-frase en ciclo) ----------
  (function(){
    const target = document.getElementById('typeHero');
    if(!target) return;
    const textSpan = target.querySelector('.tw-text');

    // cada frase es un array de partes {text, em}
    const phrases = [
      [
        { text: "Masa madre, ", em: false },
        { text: "+24 horas", em: true },
        { text: " de fermentación", em: false }
      ],
      [
        { text: "...y el toque crujiente perfecto.", em: false }
      ]
    ];

    const typeSpeed   = 55;    // ms por letra al escribir
    const eraseSpeed  = 25;    // ms por letra al borrar
    const startDelay  = 300;   // ms antes de la primera escritura
    const pauseAfter  = 3000;  // 3s de pausa para leer antes de borrar

    let phraseIndex = 0;
    let partIndex = 0;
    let charIndex = 0;
    let currentEl = null;

    function typeStep(){
      const parts = phrases[phraseIndex];

      if(partIndex >= parts.length){
        // terminó de escribir la frase -> esperar y luego borrar
        setTimeout(eraseAll, pauseAfter);
        return;
      }

      const part = parts[partIndex];

      if(charIndex === 0){
        currentEl = part.em ? document.createElement('em') : document.createTextNode('');
        if(part.em) textSpan.appendChild(currentEl);
      }

      if(charIndex < part.text.length){
        const nextChar = part.text.charAt(charIndex);
        if(part.em){
          currentEl.textContent += nextChar;
        } else {
          textSpan.appendChild(document.createTextNode(nextChar));
        }
        charIndex++;
        setTimeout(typeStep, typeSpeed);
      } else {
        partIndex++;
        charIndex = 0;
        setTimeout(typeStep, typeSpeed);
      }
    }

    function eraseAll(){
      if(textSpan.lastChild){
        const last = textSpan.lastChild;
        last.textContent = last.textContent.slice(0, -1);
        if(last.textContent.length === 0) textSpan.removeChild(last);
        setTimeout(eraseAll, eraseSpeed);
      } else {
        // pasar a la siguiente frase (o volver a la primera)
        phraseIndex = (phraseIndex + 1) % phrases.length;
        partIndex = 0;
        charIndex = 0;
        setTimeout(typeStep, typeSpeed);
      }
    }

    setTimeout(typeStep, startDelay);
  })();

  // ---------- Mini nube de aviso en el botón de pizza (una vez por sesión) ----------
  (function(){
    const tooltip = document.querySelector('.pizza-tooltip');
    if(!tooltip) return;

    const yaSeMostro = sessionStorage.getItem('pizzaTooltipShown');
    if(yaSeMostro) return; // no se muestra de nuevo hasta reiniciar el navegador

    setTimeout(() => {
      tooltip.classList.add('show');
      setTimeout(() => {
        tooltip.classList.remove('show');
      }, 5000); // se mantiene visible 5 segundos
    }, 900); // pequeño delay antes de aparecer al cargar

    sessionStorage.setItem('pizzaTooltipShown', 'true');
  })();


  (function () {
  const root = document.querySelector('.pizza-carousel');
  if (!root) return;

  const stage    = root.querySelector('.carousel-stage');
  const cards    = Array.from(stage.querySelectorAll('.pizza-card'));
  const prevBtn  = root.querySelector('[data-dir="prev"]');
  const nextBtn  = root.querySelector('[data-dir="next"]');
  const dotsWrap = root.querySelector('.carousel-dots');
  const total    = cards.length;
  let index = 0;

  /* ---------- Dots ---------- */
  const dots = cards.map((card, i) => {
    const d = document.createElement('button');
    d.className = 'carousel-dot';
    d.type = 'button';
    d.setAttribute('role', 'tab');
    const name = card.querySelector('.card-name');
    d.setAttribute('aria-label', name ? name.textContent.trim() : 'Pizza ' + (i + 1));
    d.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(d);
    return d;
  });

  /* ---------- Offset circular (infinito) ---------- */
  function offsetOf(i) {
    let o = i - index;
    const half = total / 2;
    if (o > half)  o -= total;
    if (o < -half) o += total;
    return o;
  }

  /* ---------- Layout 3D ---------- */
  function layout() {
    const w = window.innerWidth;
    const mobile = w <= 640;
    const tablet = w <= 1024;

    const cardW      = cards[0].offsetWidth;
    const spread     = mobile ? 0.58 : tablet ? 0.64 : 0.68;  // separación horizontal (x ancho de card)
    const maxVisible = mobile ? 1 : 2;                         // cuántas a cada lado
    const angle      = mobile ? 34 : 40;                       // rotación Y de las laterales
    const depth      = mobile ? 110 : 150;                     // profundidad por posición

    cards.forEach((card, i) => {
      const o = offsetOf(i);
      const a = Math.abs(o);
      const hidden = a > maxVisible;

      const x     = o * cardW * spread;
      const z     = -a * depth;
      const rot   = o === 0 ? 0 : (o > 0 ? -angle : angle);
      const scale = 1 - a * 0.1;
      const op    = hidden ? 0 : (a === 0 ? 1 : a === 1 ? 0.95 : 0.6);

      card.style.transform =
        'translateX(-50%) translateX(' + x + 'px) translateZ(' + z + 'px) rotateY(' + rot + 'deg) scale(' + scale + ')';
      card.style.opacity = op;
      card.style.zIndex  = String(10 - a);

      card.classList.toggle('is-active', o === 0);
      card.classList.toggle('is-hidden', hidden);
      card.setAttribute('aria-hidden', o === 0 ? 'false' : 'true');
    });

    dots.forEach((d, i) => {
      d.classList.toggle('is-active', i === index);
      d.setAttribute('aria-selected', i === index ? 'true' : 'false');
    });

    // Alto del escenario = card más alta + margen
    const tallest = Math.max.apply(null, cards.map(c => c.offsetHeight));
    stage.style.height = (tallest + 48) + 'px';
  }

  function goTo(i) {
    index = (i + total) % total;
    layout();
  }
  const next = () => goTo(index + 1);
  const prev = () => goTo(index - 1);

  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);

  /* ---------- Teclado ---------- */
  stage.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); prev(); }
  });

  /* ---------- Swipe / arrastre ---------- */
  let startX = 0, startY = 0, dragging = false, moved = false;

  stage.addEventListener('pointerdown', e => {
    dragging = true; moved = false;
    startX = e.clientX; startY = e.clientY;
  });
  stage.addEventListener('pointermove', e => {
    if (!dragging) return;
    if (Math.abs(e.clientX - startX) > 8) moved = true;
  });
  function endDrag(e) {
    if (!dragging) return;
    dragging = false;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) {
      dx < 0 ? next() : prev();
    }
  }
  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', () => { dragging = false; });
  stage.addEventListener('pointerleave', e => { if (dragging) endDrag(e); });

  /* ---------- Click en una card lateral = traerla al centro ---------- */
  cards.forEach((card, i) => {
    card.addEventListener('click', () => {
      if (moved) return;
      if (i !== index) goTo(i);
    });
  });

  /* ---------- Resize + carga de imágenes ---------- */
  let rz;
  window.addEventListener('resize', () => {
    clearTimeout(rz);
    rz = setTimeout(layout, 120);
  });
  cards.forEach(c => {
    const img = c.querySelector('img');
    if (img && !img.complete) img.addEventListener('load', layout);
  });

  layout();
})();