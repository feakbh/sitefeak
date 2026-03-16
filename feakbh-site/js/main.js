/* ============================================================
   FEAKBH - Main JavaScript
   ============================================================ */

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
