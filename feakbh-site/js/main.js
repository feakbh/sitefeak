/* ============================================================
   FEAKBH - Main JavaScript
   ============================================================ */

// === Service Worker Registration (PWA) ===
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch(() => { /* noop */ });
  });
}

// === Install Prompt (PWA) ===
(function () {
  var STORAGE_KEY = 'feakbh-install-dismissed-at';
  var COOLDOWN_MS = 14 * 24 * 60 * 60 * 1000; // 14 days
  var DELAY_MS = 4000; // wait 4s before showing

  // Skip if already running as installed PWA
  var isStandalone = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
  if (isStandalone || window.navigator.standalone) return;

  // Skip if dismissed recently
  try {
    var dismissedAt = parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);
    if (dismissedAt && Date.now() - dismissedAt < COOLDOWN_MS) return;
  } catch (_) { /* localStorage unavailable */ }

  var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  var deferredPrompt = null;

  function dismiss(banner) {
    try { localStorage.setItem(STORAGE_KEY, String(Date.now())); } catch (_) {}
    banner.classList.remove('visible');
    setTimeout(function () { banner.remove(); }, 300);
  }

  function renderBanner(bodyHtml, onInstall) {
    var banner = document.createElement('div');
    banner.className = 'pwa-install-banner';
    banner.innerHTML =
      '<div class="pwa-install-icon">' +
        '<img src="/images/icon-192.png" alt="FEAKBH">' +
      '</div>' +
      '<div class="pwa-install-body">' + bodyHtml + '</div>' +
      (onInstall ? '<button type="button" class="pwa-install-btn">Instalar</button>' : '') +
      '<button type="button" class="pwa-install-close" aria-label="Fechar">✕</button>';
    document.body.appendChild(banner);
    requestAnimationFrame(function () { banner.classList.add('visible'); });

    banner.querySelector('.pwa-install-close').addEventListener('click', function () {
      dismiss(banner);
    });
    if (onInstall) {
      banner.querySelector('.pwa-install-btn').addEventListener('click', function () {
        onInstall(banner);
      });
    }
    return banner;
  }

  // Chrome/Edge/Android: capture install prompt
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredPrompt = e;
    setTimeout(function () {
      if (!deferredPrompt) return;
      renderBanner(
        '<div class="pwa-install-title">Instalar app FEAKBH</div>' +
        '<div class="pwa-install-text">Acesse horários, avisos e obras direto da tela inicial — funciona offline.</div>',
        function (banner) {
          if (!deferredPrompt) return;
          deferredPrompt.prompt();
          deferredPrompt.userChoice.then(function (choice) {
            deferredPrompt = null;
            if (choice.outcome === 'accepted') {
              banner.classList.remove('visible');
              setTimeout(function () { banner.remove(); }, 300);
            } else {
              dismiss(banner);
            }
          });
        }
      );
    }, DELAY_MS);
  });

  window.addEventListener('appinstalled', function () {
    deferredPrompt = null;
    var existing = document.querySelector('.pwa-install-banner');
    if (existing) { existing.classList.remove('visible'); setTimeout(function () { existing.remove(); }, 300); }
  });

  // iOS Safari: manual instructions (no beforeinstallprompt support)
  if (isIOS) {
    setTimeout(function () {
      renderBanner(
        '<div class="pwa-install-title">Instale o FEAKBH no seu iPhone</div>' +
        '<div class="pwa-install-text">Toque em <span class="pwa-install-kbd">⬆︎</span> e em <strong>"Adicionar à Tela de Início"</strong>.</div>',
        null
      );
    }, DELAY_MS);
  }
})();

document.addEventListener('DOMContentLoaded', () => {

  // === Mobile Menu Toggle ===
  const toggle = document.querySelector('.nav-toggle');
  const mobileNav = document.querySelector('.nav-mobile');
  if (toggle && mobileNav) {
    toggle.addEventListener('click', () => {
      mobileNav.classList.toggle('open');
      toggle.textContent = mobileNav.classList.contains('open') ? '✕' : '☰';
    });
  }

  // === Scroll Fade-in Animation ===
  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 60);
        fadeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  document.querySelectorAll('.fade-in').forEach(el => fadeObserver.observe(el));

  // === Active Nav Highlight ===
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-desktop a, .nav-mobile a').forEach(a => {
    const href = a.getAttribute('href');
    if (href && (href === currentPage || (currentPage === '' && href === 'index.html'))) {
      a.classList.add('active');
    }
  });

  // === Cronograma Modal ===
  const openBtn = document.getElementById('openCronograma');
  const modal = document.getElementById('cronogramaModal');
  if (openBtn && modal) {
    const closeEls = modal.querySelectorAll('[data-close-cronograma]');
    const content = document.getElementById('cronogramaContent');
    let cronogramaLoaded = false;

    function openModal() {
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
      if (!cronogramaLoaded) {
        loadCronograma(content);
        cronogramaLoaded = true;
      }
    }
    function closeModal() {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
    }
    openBtn.addEventListener('click', openModal);
    closeEls.forEach(el => el.addEventListener('click', closeModal));
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
    });
  }

  // Cronograma: fetches data from published Google Sheets.
  // cols: índices das colunas (0-based) onde encontrar cada campo nesta planilha.
  const CRONOGRAMA_SHEETS = [
    {
      label: 'Terças · 20h às 21h',
      sheetId: '1auCOKid39ZD1R50E9vjreG5CMhSoMfjN6NbEmtNyZBg',
      cols: { day: 2, tema: 3, palestrante: 4 }
    },
    {
      label: 'Domingos · 19h às 20h',
      sheetId: '1lqzD3WMqpUS2c6NiCydF7bgGghkwH1Swr_787lLKCgw',
      cols: { day: 3, tema: 4, palestrante: 5 }
    }
  ];

  const MONTH_MAP = {
    'JANEIRO': 0, 'FEVEREIRO': 1, 'MARÇO': 2, 'MARCO': 2, 'ABRIL': 3,
    'MAIO': 4, 'JUNHO': 5, 'JULHO': 6, 'AGOSTO': 7, 'SETEMBRO': 8,
    'OUTUBRO': 9, 'NOVEMBRO': 10, 'DEZEMBRO': 11
  };
  const MONTH_NAMES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  function parseCSV(csv) {
    const rows = [];
    let row = [], field = '', inQuotes = false;
    for (let i = 0; i < csv.length; i++) {
      const c = csv[i];
      if (inQuotes) {
        if (c === '"') {
          if (csv[i + 1] === '"') { field += '"'; i++; continue; }
          inQuotes = false;
        } else field += c;
      } else {
        if (c === '"') inQuotes = true;
        else if (c === ',') { row.push(field); field = ''; }
        else if (c === '\r') continue;
        else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
        else field += c;
      }
    }
    if (field.length || row.length) { row.push(field); rows.push(row); }
    return rows;
  }

  function parseSchedule(csv, cols) {
    const rows = parseCSV(csv);
    const events = [];
    let currentMonth = null;
    let currentYear = new Date().getFullYear();
    const monthRegex = /(JANEIRO|FEVEREIRO|MAR[ÇC]O|ABRIL|MAIO|JUNHO|JULHO|AGOSTO|SETEMBRO|OUTUBRO|NOVEMBRO|DEZEMBRO)\s*(\d{4})?/i;

    for (const r of rows) {
      const dayRaw = (r[cols.day] || '').trim();
      const temaRaw = (r[cols.tema] || '').trim();
      const palestranteRaw = (r[cols.palestrante] || '').trim();

      // Skip entirely empty rows
      if (!dayRaw && !temaRaw && !palestranteRaw) continue;

      // Skip column header rows (contain "RESPONSÁVEL" / "TEMA" / "PALESTRANTE" labels)
      const joined = r.join(' ').toUpperCase();
      if (joined.includes('RESPONSÁVEL') || joined.includes('RESPONSAVEL')) continue;

      // Detect month header — can appear in any column as "JANEIRO 2026 - DOMINGO" or similar
      // Take the longest non-empty cell and check if it's a month header (no day present)
      if (!dayRaw || isNaN(parseInt(dayRaw, 10))) {
        for (const cell of r) {
          const cellText = (cell || '').trim();
          if (!cellText) continue;
          const m = cellText.toUpperCase().match(monthRegex);
          if (m) {
            currentMonth = MONTH_MAP[m[1].toUpperCase()];
            if (m[2]) currentYear = parseInt(m[2], 10);
            break;
          }
        }
        continue;
      }

      const day = parseInt(dayRaw, 10);
      if (isNaN(day) || currentMonth === null) continue;
      if (!temaRaw && !palestranteRaw) continue;

      events.push({
        year: currentYear,
        month: currentMonth,
        day,
        tema: temaRaw,
        palestrante: palestranteRaw
      });
    }
    return events;
  }

  function esc(s) {
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function renderSchedule(sheet, events) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayY = today.getFullYear(), todayM = today.getMonth();

    let displayM = todayM, displayY = todayY;
    let monthEvents = events.filter(e => e.year === displayY && e.month === displayM);
    if (!monthEvents.length) {
      const upcoming = events.find(e => new Date(e.year, e.month, e.day) >= today);
      if (upcoming) {
        displayM = upcoming.month; displayY = upcoming.year;
        monthEvents = events.filter(e => e.year === displayY && e.month === displayM);
      }
    }

    let html = '<div class="cronograma-sheet-label">' + esc(sheet.label) + '</div>';
    html += '<div class="cronograma-month">' + MONTH_NAMES[displayM] + ' ' + displayY + '</div>';

    if (!monthEvents.length) {
      html += '<div class="cronograma-empty">Nenhuma palestra cadastrada para este mês.</div>';
    } else {
      html += '<div class="cronograma-events">';
      for (const ev of monthEvents) {
        const eventDate = new Date(ev.year, ev.month, ev.day);
        const isPast = eventDate < today;
        const isToday = eventDate.getTime() === today.getTime();
        html += '<div class="cronograma-event' + (isPast ? ' past' : '') + (isToday ? ' today' : '') + '">';
        html += '<div class="cronograma-day">' + String(ev.day).padStart(2, '0') + '</div>';
        html += '<div class="cronograma-info">';
        html += '<div class="cronograma-tema">' + (ev.tema ? esc(ev.tema) : '<em>sem tema</em>') + '</div>';
        if (ev.palestrante) {
          html += '<div class="cronograma-palestrante">' + esc(ev.palestrante) + '</div>';
        }
        html += '</div></div>';
      }
      html += '</div>';
    }
    return html;
  }

  async function loadSheet(sheet) {
    const url = 'https://docs.google.com/spreadsheets/d/' + sheet.sheetId + '/gviz/tq?tqx=out:csv';
    const resp = await fetch(url);
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    const csv = await resp.text();
    return parseSchedule(csv, sheet.cols);
  }

  async function loadCronograma(container) {
    try {
      const results = await Promise.all(CRONOGRAMA_SHEETS.map(async s => ({
        sheet: s,
        events: await loadSheet(s)
      })));
      let html = '';
      for (const { sheet, events } of results) {
        html += renderSchedule(sheet, events);
      }
      container.innerHTML = html;
    } catch (err) {
      container.innerHTML =
        '<div class="cronograma-error">' +
          '<p>📅</p>' +
          '<p><strong>Não foi possível carregar o cronograma.</strong></p>' +
          '<p>Verifique sua conexão ou tente novamente mais tarde.</p>' +
        '</div>';
    }
  }

  // === Mural Carousel ===
  const track = document.getElementById('muralTrack');
  const dotsContainer = document.getElementById('muralDots');
  if (!track) return;

  const prevBtn = document.querySelector('.mural-prev');
  const nextBtn = document.querySelector('.mural-next');
  const slides = track.querySelectorAll('.mural-slide');
  if (slides.length === 0) return;

  let currentIndex = 0;
  let slideWidth = 0;
  let slidesVisible = 1;
  let maxIndex = 0;
  let isDragging = false;
  let startX = 0;
  let currentTranslate = 0;
  let prevTranslate = 0;

  function calcDimensions() {
    const slide = slides[0];
    const gap = 24;
    slideWidth = slide.offsetWidth + gap;
    const wrapperWidth = track.parentElement.offsetWidth;
    slidesVisible = Math.floor(wrapperWidth / slideWidth) || 1;
    maxIndex = Math.max(0, slides.length - slidesVisible);
    if (currentIndex > maxIndex) currentIndex = maxIndex;
  }

  function goTo(index) {
    currentIndex = Math.max(0, Math.min(index, maxIndex));
    currentTranslate = -currentIndex * slideWidth;
    prevTranslate = currentTranslate;
    track.style.transform = 'translateX(' + currentTranslate + 'px)';
    updateDots();
    updateButtons();
  }

  function updateButtons() {
    if (prevBtn) prevBtn.disabled = currentIndex <= 0;
    if (nextBtn) nextBtn.disabled = currentIndex >= maxIndex;
  }

  function createDots() {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    var totalPages = maxIndex + 1;
    for (var i = 0; i < totalPages; i++) {
      var dot = document.createElement('button');
      dot.className = 'mural-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', 'Pagina ' + (i + 1));
      (function(idx) {
        dot.addEventListener('click', function() { goTo(idx); });
      })(i);
      dotsContainer.appendChild(dot);
    }
  }

  function updateDots() {
    if (!dotsContainer) return;
    var dots = dotsContainer.querySelectorAll('.mural-dot');
    dots.forEach(function(d, i) {
      if (i === currentIndex) d.classList.add('active');
      else d.classList.remove('active');
    });
  }

  // Nav buttons
  if (prevBtn) prevBtn.addEventListener('click', function() { goTo(currentIndex - 1); });
  if (nextBtn) nextBtn.addEventListener('click', function() { goTo(currentIndex + 1); });

  // Drag / Swipe support
  function getX(e) {
    return e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
  }

  function dragStart(e) {
    isDragging = true;
    startX = getX(e);
    track.classList.add('dragging');
  }

  function dragMove(e) {
    if (!isDragging) return;
    var diff = getX(e) - startX;
    currentTranslate = prevTranslate + diff;
    track.style.transform = 'translateX(' + currentTranslate + 'px)';
  }

  function dragEnd() {
    if (!isDragging) return;
    isDragging = false;
    track.classList.remove('dragging');
    var moved = currentTranslate - prevTranslate;
    if (Math.abs(moved) > slideWidth * 0.2) {
      if (moved < 0) goTo(currentIndex + 1);
      else goTo(currentIndex - 1);
    } else {
      goTo(currentIndex);
    }
  }

  track.addEventListener('mousedown', dragStart);
  track.addEventListener('mousemove', dragMove);
  track.addEventListener('mouseup', dragEnd);
  track.addEventListener('mouseleave', dragEnd);
  track.addEventListener('touchstart', dragStart, { passive: true });
  track.addEventListener('touchmove', dragMove, { passive: true });
  track.addEventListener('touchend', dragEnd);

  // Prevent link clicks during drag
  track.querySelectorAll('a').forEach(function(a) {
    a.addEventListener('click', function(e) {
      if (Math.abs(currentTranslate - prevTranslate) > 5) e.preventDefault();
    });
  });

  // Keyboard nav when carousel is visible
  document.addEventListener('keydown', function(e) {
    var rect = track.getBoundingClientRect();
    var isVisible = rect.top < window.innerHeight && rect.bottom > 0;
    if (!isVisible) return;
    if (e.key === 'ArrowLeft') goTo(currentIndex - 1);
    if (e.key === 'ArrowRight') goTo(currentIndex + 1);
  });

  // Init
  function init() {
    calcDimensions();
    createDots();
    goTo(0);
  }

  init();
  window.addEventListener('resize', function() {
    calcDimensions();
    createDots();
    goTo(currentIndex);
  });

});
