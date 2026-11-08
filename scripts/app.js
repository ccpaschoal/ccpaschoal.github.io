/* ══════════════════════════════════════════════════════════════
   Camilla Paschoal · Portfólio
   ══════════════════════════════════════════════════════════════ */

document.documentElement.classList.add('js');

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Cada parte roda isolada: se uma quebrar (ex.: elemento removido do HTML), as outras continuam funcionando
const safe = (nome, fn) => {
  try { return fn(); } catch (e) { console.error(`[portfolio] ${nome}:`, e); return undefined; }
};

document.addEventListener('DOMContentLoaded', () => {
  safe('tema', initTheme);
  safe('menu', initNavbar);
  safe('títulos', splitTitles);
  safe('carrosséis', initCarousels);
  safe('grupos', initGroups);
  safe('deck de carrosséis', initCarouselDeck);
  const openLightbox = safe('lightbox', initLightbox);
  safe('faixa', () => initMarquee(openLightbox));
  safe('celular', initHeroPhone);
  safe('contadores', initCounters);
  if (safe('deck', () => { initDeck(); return true; }) !== true) {
    // sem o deck, o CSS do modo .js deixaria cartões e títulos invisíveis: volta para a página simples
    document.documentElement.classList.remove('js', 'deck-on');
  }
  const ano = document.getElementById('year');
  if (ano) ano.textContent = new Date().getFullYear();
});

/* ── Modo claro / escuro ──────────────────────────────────────── */

function initTheme() {
  const root = document.documentElement;
  const toggle = document.querySelector('.theme-toggle');
  const metaColor = document.querySelector('meta[name="theme-color"]');
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)');

  const apply = (theme, animate) => {
    if (animate && !reduceMotion) {
      root.classList.add('theme-transition');
      setTimeout(() => root.classList.remove('theme-transition'), 450);
    }
    const dark = theme === 'dark';
    root.setAttribute('data-theme', theme);
    toggle.setAttribute('aria-pressed', String(dark));
    metaColor.setAttribute('content', dark ? '#16324A' : '#6BA3D8');
  };

  apply(root.getAttribute('data-theme') || 'light', false);

  toggle.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    apply(next, true);
    try { localStorage.setItem('tema', next); } catch (e) { /* navegação privada pode bloquear */ }
  });

  // Se a pessoa nunca escolheu pelo botão, acompanha a mudança do sistema
  systemDark.addEventListener('change', (event) => {
    let saved = null;
    try { saved = localStorage.getItem('tema'); } catch (e) { /* ignora */ }
    if (!saved) apply(event.matches ? 'dark' : 'light', true);
  });
}

/* ── Navbar, menu mobile e barra de progresso ─────────────────── */

function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.getElementById('nav-menu');

  const setOpen = (open) => {
    menu.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open)); // rótulo fixo ("Menu"); o estado aberto/fechado vai aqui
  };
  toggle.setAttribute('aria-label', 'Menu');

  toggle.addEventListener('click', () => setOpen(!menu.classList.contains('is-open')));

  menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setOpen(false)));

  document.addEventListener('click', (event) => {
    if (menu.classList.contains('is-open') && !navbar.contains(event.target)) setOpen(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu.classList.contains('is-open')) {
      setOpen(false);
      toggle.focus();
    }
  });

  let ticking = false;
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    navbar.classList.toggle('is-scrolled', window.scrollY > 10);
    navbar.style.setProperty('--progress', max > 0 ? (window.scrollY / max).toFixed(4) : 0);
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });
  update();
}

/* ── Animações de entrada ─────────────────────────────────────── */

// Títulos que aparecem letra por letra. O texto inteiro fica num span invisível
// para leitores de tela; as letras animadas ficam escondidas deles.
function splitTitles() {
  document.querySelectorAll('.section-title, .contact h2').forEach((title) => {
    const text = title.textContent.trim();
    let n = 0;
    const words = text.split(' ').map((word) => {
      const w = document.createElement('span');
      w.className = 'word';
      w.setAttribute('aria-hidden', 'true');
      [...word].forEach((ch) => {
        const c = document.createElement('span');
        c.className = 'ch';
        c.textContent = ch;
        c.style.setProperty('--c', n++);
        w.append(c);
      });
      n++; // pausa curtinha entre as palavras
      return w;
    });
    const reader = document.createElement('span');
    reader.className = 'sr-only';
    reader.textContent = text;
    title.replaceChildren(reader, ...words.flatMap((w, i) => (i ? [' ', w] : [w])));
    title.classList.add('is-split');
  });
}

/* ── Baralho de carrosséis: todos juntos, abre um por vez ──────── */

function initCarouselDeck() {
  const deck = document.querySelector('.carousel-deck');
  if (!deck) return;
  const viewer = deck.querySelector('.deck-viewer');
  const items = [...viewer.querySelectorAll('.deck-item')];
  if (!items.length) return;
  const meta = deck.querySelector('.deck-meta');
  const metaText = meta.textContent;

  // as cartas do baralho: a capa de cada carrossel
  const cards = document.createElement('div');
  cards.className = 'deck-cards';
  const middle = (items.length - 1) / 2;
  const cardButtons = items.map((item, i) => {
    const title = item.querySelector('h3').textContent;
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'deck-card';
    card.style.setProperty('--o', (i - middle).toFixed(2));
    card.style.setProperty('--a', Math.abs(i - middle).toFixed(2));
    card.style.zIndex = items.length - i;
    card.setAttribute('aria-label', `Abrir o carrossel ${title}`);
    const img = document.createElement('img');
    img.src = item.querySelector('.slide img').getAttribute('src');
    img.alt = '';
    img.width = 640;
    img.height = 640;
    img.loading = 'lazy';
    img.decoding = 'async';
    const label = document.createElement('span');
    label.className = 'deck-card-title';
    label.textContent = title;
    card.append(img, label);
    card.addEventListener('click', () => open(i));
    cards.append(card);
    return card;
  });
  viewer.before(cards);

  // barra de navegação quando um carrossel está aberto
  const bar = document.createElement('div');
  bar.className = 'deck-bar';
  bar.innerHTML = `
    <button type="button" class="btn btn-outline deck-back"><svg class="btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>Voltar ao baralho</button>
    <span class="deck-count" aria-live="polite"></span>
    <button type="button" class="btn btn-primary deck-next">Próximo carrossel<svg class="btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>`;
  viewer.before(bar);
  const count = bar.querySelector('.deck-count');

  let current = -1;
  const refresh = () => window.dispatchEvent(new Event('resize')); // recalcula garrafas e a tela

  const open = (index) => {
    current = (index + items.length) % items.length;
    deck.classList.add('is-open');
    items.forEach((item, i) => item.classList.toggle('is-shown', i === current));
    count.textContent = `${current + 1} de ${items.length}`;
    meta.textContent = 'Arraste ou use as setas para ver os slides';
    refresh();
    items[current].querySelector('.slide')?.focus({ preventScroll: true });
  };

  const close = () => {
    deck.classList.remove('is-open');
    items.forEach((item) => item.classList.remove('is-shown'));
    meta.textContent = metaText;
    refresh();
    cardButtons[Math.max(current, 0)].focus({ preventScroll: true });
  };

  bar.querySelector('.deck-back').addEventListener('click', close);
  bar.querySelector('.deck-next').addEventListener('click', () => open(current + 1));
  deck.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && deck.classList.contains('is-open')) {
      const lightbox = document.getElementById('lightbox');
      if (lightbox && lightbox.classList.contains('is-open')) return;
      close();
    }
  });
}

/* ── Carrosséis ───────────────────────────────────────────────── */

function initCarousels() {
  document.querySelectorAll('.coverflow').forEach(initCoverflow);
}

/* ── Estilo garrafas: o item do meio grande, os vizinhos menores e juntinhos ── */

function initCoverflow(carousel) {
  // a faixa contínua da Minha Apresentação (rail--panorama) fica de fora, embaixo
  const rail = carousel.querySelector('.rail:not(.rail--panorama)');
  if (!rail) return;
  makeCoverflow({
    rail,
    items: [...rail.querySelectorAll('.slide')],
    prev: carousel.querySelector('[data-dir="prev"]'),
    next: carousel.querySelector('[data-dir="next"]'),
    word: carousel.querySelector('h3').textContent,
  });
}

// Serviços e diferenciais: os cards soltos viram um carrossel dentro de um quadrado só
function initGroups() {
  const services = document.querySelector('.services-grid.cf-group');
  if (services) {
    makeCoverflow({
      rail: services,
      items: [...services.children],
      word: services.dataset.cfWord,
      autoHeight: true,
      clickCenter: false,
      // começa pelo do meio, com vizinhos dos dois lados, como as garrafas
      start: Math.floor((services.children.length - 1) / 2),
    });
  }

  const steps = document.querySelector('.story-steps.cf-group');
  if (steps) {
    // carrossel e contador ficam juntos numa coluna, o celular na outra
    const column = document.createElement('div');
    column.className = 'story-cf';
    steps.before(column);
    column.append(steps);
    const images = document.querySelectorAll('.story-phone .phone-media img');
    const like = document.querySelector('.story-phone .phone-like');
    makeCoverflow({
      rail: steps,
      items: [...steps.querySelectorAll('.story-step')],
      autoHeight: true,
      clickCenter: false,
      onChange: (index, item) => {
        // o celular ao lado mostra o post do diferencial que está no meio
        document.querySelectorAll('.story-step').forEach((s) => s.classList.toggle('is-active', s === item));
        images.forEach((img) => img.classList.toggle('is-active', img.dataset.step === item.dataset.step));
        like.classList.remove('is-liked');
        void like.offsetWidth; // reinicia a animação do coração
        like.classList.add('is-liked');
      },
    });
  }
}

function makeButton(dir) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'carousel-btn';
  button.dataset.dir = dir;
  button.setAttribute('aria-label', dir === 'prev' ? 'Anterior' : 'Próximo');
  button.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${dir === 'prev' ? 'm15 18-6-6 6-6' : 'm9 18 6-6-6-6'}"/></svg>`;
  return button;
}

function makeCoverflow({ rail, items, prev, next, word, autoHeight = false, clickCenter = true, onChange, start = 0 }) {
  if (!rail || !items.length) return;
  rail.classList.add('cf-rail');
  if (autoHeight) rail.classList.add('cf-rail--auto');
  items.forEach((item) => item.classList.add('cf-item'));

  // nome do carrossel grande e apagado no fundo
  if (word) {
    const bg = document.createElement('span');
    bg.className = 'cf-word';
    bg.setAttribute('aria-hidden', 'true');
    bg.textContent = word;
    rail.prepend(bg);
  }

  // contador e barrinha de progresso embaixo (com setas próprias quando o grupo não tem)
  const footer = document.createElement('div');
  footer.className = 'cf-footer';
  footer.innerHTML = '<span class="cf-count" aria-live="polite"></span><span class="cf-bar" aria-hidden="true"><span></span></span><span class="cf-hint">arraste ou use as setas</span>';
  rail.after(footer);
  const prevs = prev ? [prev] : [];
  const nexts = next ? [next] : [];
  {
    const footPrev = makeButton('prev');
    const footNext = makeButton('next');
    footer.prepend(footPrev);
    footer.append(footNext);
    footer.classList.add('cf-footer--buttons');
    // com setas no cabeçalho, as do rodapé só aparecem no celular (onde as do cabeçalho somem)
    if (prev) footer.classList.add('cf-footer--mobile-buttons');
    prevs.push(footPrev);
    nexts.push(footNext);
  }
  const count = footer.querySelector('.cf-count');
  const bar = footer.querySelector('.cf-bar');

  // distância (em larguras do item) e tamanho de cada posição a partir do meio
  const OFFSET = [0, 0.56, 0.98, 1.3];
  const SCALE = [1, 0.74, 0.56, 0.44];
  const OPACITY = [1, 1, 0.85, 0];
  const BRIGHT = [1, 0.72, 0.58, 0.5];

  let current = 0;

  const render = () => {
    const size = items[0].offsetWidth;
    if (autoHeight) {
      const tallest = Math.max(...items.map((item) => item.offsetHeight));
      rail.style.height = `${tallest + 16}px`;
    }
    items.forEach((item, i) => {
      const d = i - current;
      const ad = Math.min(Math.abs(d), 3);
      const x = Math.sign(d) * OFFSET[ad] * size;
      item.style.transform = `translateX(${x.toFixed(1)}px) scale(${SCALE[ad]})`;
      item.style.opacity = OPACITY[ad];
      item.style.filter = ad ? `brightness(${BRIGHT[ad]})` : 'none';
      item.style.zIndex = 10 - ad;
      item.style.visibility = Math.abs(d) > 3 ? 'hidden' : 'visible';
      item.classList.toggle('is-center', d === 0);
      if (item.matches('button')) item.tabIndex = d === 0 ? 0 : -1;
    });
    count.textContent = `${String(current + 1).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}`;
    bar.style.setProperty('--cf-progress', `${((current + 1) / items.length) * 100}%`);
    prevs.forEach((b) => { b.disabled = current === 0; });
    nexts.forEach((b) => { b.disabled = current === items.length - 1; });
  };

  const go = (index) => {
    current = Math.max(0, Math.min(items.length - 1, index));
    render();
    if (onChange) onChange(current, items[current]);
  };

  prevs.forEach((b) => b.addEventListener('click', () => go(current - 1)));
  nexts.forEach((b) => b.addEventListener('click', () => go(current + 1)));

  // Clicar num vizinho traz ele para o meio (sem abrir a imagem); o do meio abre em tela cheia
  items.forEach((item, i) => {
    item.addEventListener('click', (event) => {
      if (dragged || i !== current || !clickCenter) event.stopImmediatePropagation();
      if (!dragged && i !== current) go(i);
    });
  });

  rail.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); go(current - 1); items[current].focus?.(); }
    if (event.key === 'ArrowRight') { event.preventDefault(); go(current + 1); items[current].focus?.(); }
  });

  // Arrastar para o lado com o mouse ou o dedo
  let startX = null;
  let startY = null;
  let dragged = false;
  rail.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    startX = event.clientX;
    startY = event.clientY;
    dragged = false;
  });
  rail.addEventListener('pointermove', (event) => {
    if (startX === null) return;
    const delta = event.clientX - startX;
    if (Math.abs(delta) > 8 && Math.abs(delta) > Math.abs(event.clientY - startY)) {
      dragged = true;
      rail.classList.add('is-dragging');
    }
    // cada meio item arrastado passa um
    if (dragged && Math.abs(delta) > items[0].offsetWidth * 0.45) {
      go(current + (delta < 0 ? 1 : -1));
      startX = event.clientX;
    }
  });
  const end = () => {
    startX = null;
    rail.classList.remove('is-dragging');
    // o clique que vem logo depois do arraste não deve abrir a imagem
    setTimeout(() => { dragged = false; }, 0);
  };
  rail.addEventListener('pointerup', end);
  rail.addEventListener('pointercancel', end);
  rail.addEventListener('pointerleave', () => { if (startX !== null) end(); });

  let quadro = 0; // no máximo um cálculo por quadro enquanto a janela muda de tamanho
  window.addEventListener('resize', () => { cancelAnimationFrame(quadro); quadro = requestAnimationFrame(render); });
  window.addEventListener('load', render);
  go(start);
}

/* ── Faixa com os posts dos carrosséis passando ───────────────── */

function initMarquee(openLightbox) {
  const track = document.querySelector('.marquee-track');
  if (!track) return;

  // Intercala os carrosséis (capa de cada um, depois o 1º slide de cada…) para variar o que aparece
  const carousels = [...document.querySelectorAll('.carousel:not(.carousel--strip)')].map((c) => [...c.querySelectorAll('.rail:not(.rail--panorama) .slide')]);
  const longest = Math.max(...carousels.map((slides) => slides.length));
  const order = [];
  for (let i = 0; i < longest; i++) {
    carousels.forEach((slides) => slides[i] && order.push(slides[i]));
  }

  const buildGroup = () => {
    const group = document.createElement('div');
    group.className = 'marquee-group';
    order.forEach((slide) => {
      const item = document.createElement('button');
      item.type = 'button';
      // slides da Minha Apresentação são 1080x1350 (4:5), não quadrados
      item.className = slide.closest('.carousel--panorama') ? 'marquee-item marquee-item--tall' : 'marquee-item';
      item.tabIndex = -1;

      // Versão mini (360px). Não usa loading="lazy": a faixa se move por animação, sem rolar a
      // página, e o Chrome/Safari do celular nem sempre percebem que a imagem entrou na tela.
      const img = document.createElement('img');
      img.dataset.src = slide.querySelector('img').getAttribute('src').replace('-thumb.webp', '-mini.webp');
      img.alt = '';
      img.decoding = 'async';
      img.fetchPriority = 'low';

      item.append(img);
      item.addEventListener('click', () => openLightbox?.(slide, item));
      group.append(item);
    });
    return group;
  };

  // Dois grupos iguais: quando o primeiro sai da tela, o segundo ocupa o lugar e o loop não tem emenda
  track.append(buildGroup(), buildGroup());

  // Botão para parar o movimento da faixa e do celular (conteúdo que se move sozinho precisa poder ser pausado)
  const marquee = track.closest('.marquee');
  if (marquee && !reduceMotion) {
    marquee.removeAttribute('aria-hidden');
    track.setAttribute('aria-hidden', 'true'); // só a faixa é decorativa; o botão é lido
    const pauseBtn = document.createElement('button');
    pauseBtn.type = 'button';
    pauseBtn.className = 'motion-pause';
    const PAUSA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5h3v14H8zM13 5h3v14h-3z"/></svg>';
    const PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5l11 7-11 7z"/></svg>';
    const mostra = (parado) => {
      pauseBtn.setAttribute('aria-pressed', String(parado));
      pauseBtn.setAttribute('aria-label', parado ? 'Continuar animações' : 'Pausar animações');
      pauseBtn.innerHTML = parado ? PLAY : PAUSA;
    };
    mostra(false);
    pauseBtn.addEventListener('click', () => {
      const parado = document.documentElement.classList.toggle('motion-paused');
      mostra(parado);
    });
    marquee.append(pauseBtn);
  }

  // Baixa as minis depois que o essencial da página carregou
  const loadImages = () => {
    track.querySelectorAll('img[data-src]').forEach((img) => {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    });
  };
  const whenNear = () => {
    if (!('IntersectionObserver' in window)) return loadImages();
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        observer.disconnect();
        loadImages();
      }
    }, { rootMargin: '600px 0px' });
    observer.observe(track);
  };
  if (document.readyState === 'complete') whenNear();
  else window.addEventListener('load', whenNear, { once: true });

  const setSpeed = () => {
    const pixelsPerSecond = 45;
    track.style.setProperty('--marquee-duration', `${track.scrollWidth / 2 / pixelsPerSecond}s`);
  };
  setSpeed();
  let quadro = 0;
  window.addEventListener('resize', () => { cancelAnimationFrame(quadro); quadro = requestAnimationFrame(setSpeed); });
}

/* ── Celular do topo: troca as capas como num feed ────────────── */

function initHeroPhone() {
  const phone = document.querySelector('.hero-phone');
  if (!phone) return;

  const images = [...phone.querySelectorAll('.phone-media img')];
  const like = phone.querySelector('.phone-like');
  const dotsWrap = phone.querySelector('.phone-dots');

  dotsWrap.innerHTML = images.map(() => '<span></span>').join('');
  const dots = [...dotsWrap.children];

  const load = (img) => {
    if (img.dataset.src) {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    }
  };

  let current = 0;
  let likeTimer;
  dots[0].classList.add('is-active');

  const show = (index) => {
    images[current].classList.remove('is-active');
    dots[current].classList.remove('is-active');
    current = index;
    load(images[current]);
    images[current].classList.add('is-active');
    dots[current].classList.add('is-active');
    load(images[(current + 1) % images.length]);

    // o coração "curte" cada post logo depois que ele aparece
    like.classList.remove('is-liked');
    clearTimeout(likeTimer);
    likeTimer = setTimeout(() => like.classList.add('is-liked'), 900);
  };

  if (reduceMotion) return;

  // espera a página carregar para não competir com o que é mais importante
  // O botão de pausa fica na faixa de posts (initMarquee) e para o celular também
  const stopped = () => document.documentElement.classList.contains('motion-paused');

  // Só mantém o intervalo enquanto o celular está visível e pode animar.
  let offscreen = false;
  let paused = false;
  let timer = null;
  let loaded = false;
  const updatePlayback = () => {
    const visible = phone.getClientRects().length > 0;
    if (!loaded || document.hidden || paused || stopped() || offscreen || !visible) {
      clearInterval(timer);
      timer = null;
      clearTimeout(likeTimer);
      return;
    }
    if (timer !== null) return;
    load(images[(current + 1) % images.length]);
    timer = setInterval(() => show((current + 1) % images.length), 2800);
  };
  document.addEventListener('screenchange', (e) => {
    offscreen = !e.detail.screen.contains(phone);
    updatePlayback();
  });
  window.addEventListener('resize', updatePlayback);
  document.addEventListener('visibilitychange', updatePlayback);
  // O botão já atualiza a classe no HTML antes de este observador ser chamado.
  new MutationObserver(updatePlayback).observe(document.documentElement, {
    attributes: true, attributeFilter: ['class'],
  });

  window.addEventListener('load', () => {
    loaded = true;
    phone.addEventListener('mouseenter', () => { paused = true; updatePlayback(); });
    phone.addEventListener('mouseleave', () => { paused = false; updatePlayback(); });
    phone.addEventListener('focusin', () => { paused = true; updatePlayback(); });
    phone.addEventListener('focusout', () => { paused = false; updatePlayback(); });
    updatePlayback();
  }, { once: true });
}

/* ── Números que contam até o valor final ─────────────────────── */

function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  const totals = {
    projects: document.querySelectorAll('.carousel:not(.carousel--strip):not(.carousel--panorama)').length
      + document.querySelectorAll('.site-card').length,
    slides: document.querySelectorAll('.carousel:not(.carousel--panorama) .rail:not(.rail--panorama) .slide').length,
  };

  counters.forEach((el) => {
    if (el.dataset.count in totals) el.dataset.count = totals[el.dataset.count];
    el.textContent = reduceMotion ? el.dataset.count : '0';
    // a contagem é só visual: o leitor de tela lê o número final num texto escondido ao lado
    el.setAttribute('aria-hidden', 'true');
    const leitor = document.createElement('span');
    leitor.className = 'sr-only';
    leitor.textContent = el.dataset.count;
    el.after(leitor);
  });

  if (reduceMotion) return;

  const animate = (el) => {
    const target = Number(el.dataset.count);
    const duration = 1600;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  // conta quando a tela do Sobre aparece
  let done = false;
  document.addEventListener('screenchange', (event) => {
    if (done || !event.detail.screen.contains(counters[0])) return;
    done = true;
    counters.forEach(animate);
  });
}

/* ── Lightbox: abre as imagens dos carrosséis em tela cheia ───── */

function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  const image = lightbox.querySelector('.lightbox-img');
  const caption = lightbox.querySelector('.lightbox-caption');
  const closeBtn = lightbox.querySelector('.lightbox-close');
  const prevBtn = lightbox.querySelector('.lightbox-prev');
  const nextBtn = lightbox.querySelector('.lightbox-next');

  let slides = [];
  let index = 0;
  let title = '';
  let lastFocus = null;
  let requestId = 0;

  const fullSrc = (slide) => {
    const img = slide.querySelector('img');
    return img.dataset.full || img.getAttribute('src');
  };

  const show = (i) => {
    index = (i + slides.length) % slides.length;
    const img = slides[index].querySelector('img');
    // mostra a miniatura (já carregada) na hora e troca pela versão grande quando ela chegar
    image.src = img.currentSrc || img.src;
    const full = new Image();
    const request = ++requestId;
    full.onload = () => { if (request === requestId) image.src = full.src; };
    full.onerror = () => { /* versão grande não carregou: continua mostrando a miniatura */ };
    full.src = fullSrc(slides[index]);
    image.alt = img.alt;
    caption.textContent = `${title} · ${index + 1} de ${slides.length}`;

    // adianta o download da próxima e da anterior
    [index + 1, index - 1].forEach((n) => {
      new Image().src = fullSrc(slides[(n + slides.length) % slides.length]);
    });
  };

  const open = (slide, returnFocusTo = slide) => {
    const carousel = slide.closest('.carousel');
    slides = [...slide.closest('.rail').querySelectorAll('.slide')];
    title = carousel.querySelector('h3').textContent;
    lastFocus = returnFocusTo;
    show(slides.indexOf(slide));
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
    closeBtn.focus();
  };

  const close = () => {
    requestId++; // invalida também imagens pendentes de um carrossel já fechado
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
    lastFocus?.focus({ preventScroll: true });
  };

  document.querySelectorAll('.slide').forEach((slide) => {
    slide.addEventListener('click', () => open(slide));
  });

  closeBtn.addEventListener('click', close);
  prevBtn.addEventListener('click', () => show(index - 1));
  nextBtn.addEventListener('click', () => show(index + 1));

  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) close();
  });

  document.addEventListener('keydown', (event) => {
    if (!lightbox.classList.contains('is-open')) return;
    if (event.key === 'Escape') close();
    if (event.key === 'ArrowLeft') show(index - 1);
    if (event.key === 'ArrowRight') show(index + 1);
    if (event.key === 'Tab') {
      // mantém o foco dentro da janela enquanto ela está aberta
      const focusable = [closeBtn, prevBtn, nextBtn];
      const i = focusable.indexOf(document.activeElement);
      event.preventDefault();
      focusable[(i + (event.shiftKey ? -1 : 1) + focusable.length) % focusable.length].focus();
    }
  });

  // Deslizar o dedo para trocar de imagem no celular
  let touchX = null;
  lightbox.addEventListener('touchstart', (event) => { touchX = event.touches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend', (event) => {
    if (touchX === null) return;
    const delta = event.changedTouches[0].clientX - touchX;
    if (Math.abs(delta) > 50) show(index + (delta < 0 ? 1 : -1));
    touchX = null;
  });

  return open;
}

/* ══════════════════════════════════════════════════════════════
   Sem rolagem: telas que trocam com a transição das garrafas na vertical.
   A tela atual fica grande no meio; a anterior e a próxima aparecem
   menores e apagadas, espiando em cima e embaixo.
   ══════════════════════════════════════════════════════════════ */

function initDeck() {
  const screens = [...document.querySelectorAll('.screen')];
  if (screens.length < 2) return;

  const root = document.documentElement;
  const navbar = document.querySelector('.navbar');
  const lightbox = document.getElementById('lightbox');
  const links = [...document.querySelectorAll('a[href^="#"]')];
  root.classList.add('deck-on');

  const SCALE = [1, 0.82, 0.68];
  const OPACITY = [1, 0.55, 0];
  const BRIGHT = [1, 0.7, 0.5];
  const DURATION = reduceMotion ? 0 : 850;

  let current = 0;
  let locked = false;
  let lockTimer = 0;
  let animTimer = 0;
  let announce = false;
  // leitor de tela: anuncia a tela que veio para a frente
  const voice = document.createElement('p');
  voice.className = 'sr-only';
  voice.setAttribute('aria-live', 'polite');
  document.body.append(voice);

  const sectionId = (screen) => screen.closest('section[id]')?.id || screen.id;

  const render = () => {
    const vh = window.innerHeight;
    const gap = window.innerWidth <= 600 ? 14 : 22;
    const heights = screens.map((s) => s.offsetHeight); // todas as leituras antes das escritas
    const curHeight = heights[current];

    screens.forEach((screen, i) => {
      const d = i - current;
      const ad = Math.min(Math.abs(d), 2);
      let y = 0;
      if (ad === 1) {
        // encosta logo depois da tela atual, deixando só a ponta à mostra
        y = Math.sign(d) * (curHeight / 2 + gap + (heights[i] * SCALE[1]) / 2);
      } else if (ad === 2) {
        y = Math.sign(d) * vh;
      }
      screen.style.transform = `translate(-50%, -50%) translateY(${y.toFixed(1)}px) scale(${SCALE[ad]})`;
      screen.style.opacity = OPACITY[ad];
      screen.style.filter = ad ? `brightness(${BRIGHT[ad]})` : 'none';
      screen.style.zIndex = 10 - ad;
      screen.style.visibility = Math.abs(d) > 2 ? 'hidden' : 'visible';
      screen.classList.toggle('is-current', d === 0);
      screen.classList.toggle('is-near', ad === 1);
    });

    const id = sectionId(screens[current]);
    document.querySelectorAll('.nav-link').forEach((link) => {
      link.classList.toggle('is-active', current > 0 && link.getAttribute('href') === `#${id}`);
    });
    navbar.classList.toggle('is-scrolled', current > 0);
    navbar.style.setProperty('--progress', (current / (screens.length - 1)).toFixed(4));
  };

  const go = (index, { updateHash = true, fromFocus = false } = {}) => {
    const target = Math.max(0, Math.min(screens.length - 1, index));
    if (target === current && screens[current].classList.contains('is-current')) return;
    current = target;
    locked = announce; // a primeira tela (ao abrir a página) não trava as setas
    root.classList.add('is-animating');
    render();
    if (!fromFocus) screens[current].scrollTop = 0; // vindo do Tab, o item focado continua visível
    // cancela o timer da troca anterior: senão ele destrava no meio desta animação
    clearTimeout(lockTimer);
    clearTimeout(animTimer);
    lockTimer = setTimeout(() => { locked = false; }, DURATION);
    animTimer = setTimeout(() => root.classList.remove('is-animating'), DURATION + 50);
    if (announce) {
      const nome = (screens[current].querySelector('h1, h2')?.textContent || '').replace(/\s+/g, ' ').trim();
      voice.textContent = `Tela ${current + 1} de ${screens.length}${nome ? `: ${nome}` : ''}`;
    }
    announce = true;
    if (updateHash) {
      const id = sectionId(screens[current]);
      history.replaceState(null, '', id && current > 0 ? `#${id}` : location.pathname + location.search);
    }
    document.dispatchEvent(new CustomEvent('screenchange', { detail: { index: current, screen: screens[current] } }));
  };

  const busy = () => locked || lightbox.classList.contains('is-open');

  // Clicar na tela vizinha que espia traz ela para o meio (sem acionar o que está dentro)
  screens.forEach((screen, i) => screen.addEventListener('click', (event) => {
    if (i === current) return;
    event.preventDefault();
    event.stopPropagation();
    go(i);
  }, true));

  // Navegando com Tab: ao focar algo de outra tela, ela vem para o meio,
  // então todo o conteúdo continua acessível para teclado e leitores de tela
  document.addEventListener('focusin', (event) => {
    if (lightbox.contains(event.target)) return;
    const i = screens.findIndex((screen) => screen.contains(event.target));
    if (i >= 0 && i !== current) {
      go(i, { fromFocus: true });
      event.target.scrollIntoView?.({ block: 'nearest' });
    }
  });

  // A tela pode ter conteúdo maior que o quadrado (celular): primeiro rola dentro dela,
  // e só troca de tela quando chegar ao fim (ou ao começo).
  const canScroll = (dir) => {
    const el = screens[current];
    if (el.scrollHeight <= el.clientHeight + 2) return false;
    return dir > 0 ? el.scrollTop + el.clientHeight < el.scrollHeight - 2 : el.scrollTop > 2;
  };

  // Rodinha do mouse / touchpad
  let wheelSum = 0;
  let wheelTimer;
  window.addEventListener('wheel', (event) => {
    if (event.ctrlKey || event.metaKey) return; // Ctrl + rodinha é o zoom do navegador
    if (lightbox.classList.contains('is-open')) return;
    if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return; // arraste lateral dos carrosséis
    const dir = Math.sign(event.deltaY);
    if (canScroll(dir) && screens[current].contains(event.target)) return;
    event.preventDefault();
    if (busy()) return;
    wheelSum += event.deltaY;
    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(() => { wheelSum = 0; }, 200);
    if (Math.abs(wheelSum) > 40) {
      wheelSum = 0;
      go(current + dir);
    }
  }, { passive: false });

  // Deslizar o dedo para cima ou para baixo
  let touch = null;
  window.addEventListener('touchstart', (event) => {
    if (event.touches.length !== 1) return;
    touch = {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY,
      down: !canScroll(1),
      up: !canScroll(-1),
    };
  }, { passive: true });
  window.addEventListener('touchend', (event) => {
    if (!touch || busy()) { touch = null; return; }
    const dx = event.changedTouches[0].clientX - touch.x;
    const dy = event.changedTouches[0].clientY - touch.y;
    if (Math.abs(dy) > 60 && Math.abs(dy) > Math.abs(dx) * 1.2) {
      if (dy < 0 && touch.down) go(current + 1);
      if (dy > 0 && touch.up) go(current - 1);
    }
    touch = null;
  }, { passive: true });

  // Teclado
  document.addEventListener('keydown', (event) => {
    if (event.ctrlKey || event.altKey || event.metaKey) return; // atalhos do navegador
    if (busy() || event.target.closest('input, textarea, select')) return;
    // Espaço em link ou botão é para clicar, não para trocar de tela
    if (event.key === ' ' && event.target.closest('a, button')) return;
    const next = ['ArrowDown', 'PageDown', ' '].includes(event.key);
    const prev = ['ArrowUp', 'PageUp'].includes(event.key);
    if (event.key === 'Home') { event.preventDefault(); go(0); }
    if (event.key === 'End') { event.preventDefault(); go(screens.length - 1); }
    if (!next && !prev) return;
    const dir = next ? 1 : -1;
    if (canScroll(dir)) return;
    event.preventDefault();
    go(current + dir);
  });

  // Menu e botões que apontam para uma seção
  const indexFor = (id) => {
    const target = document.getElementById(id);
    if (!target) return -1;
    return screens.findIndex((screen) => screen === target || target.contains(screen) || screen.contains(target));
  };
  links.forEach((link) => {
    const id = link.getAttribute('href').slice(1);
    link.addEventListener('click', (event) => {
      // "Pular para o conteúdo" aponta para o <main>: leva o foco para a tela que está na frente
      if (id === 'conteudo') {
        event.preventDefault();
        screens[current].setAttribute('tabindex', '-1');
        screens[current].focus({ preventScroll: true });
        return;
      }
      const index = id ? indexFor(id) : 0;
      if (index < 0) return;
      event.preventDefault();
      go(index);
    });
  });

  // Mudanças de fragmento pelo endereço ou histórico também precisam trocar a tela.
  window.addEventListener('hashchange', () => {
    const index = location.hash ? indexFor(location.hash.slice(1)) : 0;
    if (index >= 0) go(index, { updateHash: false });
  });

  let frame = 0;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(render);
  });
  window.addEventListener('load', render);

  // Abre direto na seção do link (ex.: .../#contato); sem link, começa no topo
  const start = location.hash ? indexFor(location.hash.slice(1)) : 0;
  current = -1;
  go(start > 0 ? start : 0, { updateHash: false });
}
