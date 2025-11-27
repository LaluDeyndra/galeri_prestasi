// Preload gambar: hanya tunggu gambar yang terlihat pertama (bukan yang tersembunyi)
const images = document.querySelectorAll('#card-container .bg-white:not(.hidden-card) img');
let loadedImages = 0;
const totalImages = images.length;

function imageLoaded() {
  loadedImages++;
  if (loadedImages === totalImages) {
    setTimeout(() => {
      document.getElementById('loading-screen').classList.add('hidden');
      initLoadMore(); // Inisialisasi tombol lihat lebih banyak setelah loading selesai
      initScrollAnimations(); // Inisialisasi animasi scroll
    }, 500); // Delay kecil untuk efek smooth
  }
}

if (totalImages === 0) {
  // Tidak ada gambar terlihat, langsung lanjutkan
  document.getElementById('loading-screen').classList.add('hidden');
  initLoadMore();
  initScrollAnimations();
} else {
  images.forEach((img) => {
    if (img.complete && img.naturalWidth !== 0) {
      imageLoaded();
    } else {
      img.addEventListener('load', imageLoaded);
      img.addEventListener('error', imageLoaded); // Jika error, tetap hitung sebagai loaded
    }
  });
}

// Animasi scroll: Kartu muncul dengan fade-in dan slide-up saat masuk viewport
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('card-visible');
      }
    });
  },
  { threshold: 0.1 }
);

// Ambil semua kartu dan observasi
const cards = document.querySelectorAll('.card-hidden');
cards.forEach((card) => observer.observe(card));

// Fungsi untuk mengelola tombol "Lihat Lebih Banyak"
function initLoadMore() {
  const cardContainer = document.getElementById('card-container');
  const cards = cardContainer.querySelectorAll('.bg-white');
  const loadMoreContainer = document.getElementById('load-more-container');
  const loadMoreBtn = document.getElementById('load-more-btn');

  // Tampilkan hanya 6 kartu pertama
  const totalCards = cards.length;
  const cardsToShow = 6;
  let currentlyShowing = cardsToShow;

  if (totalCards > cardsToShow) {
    // Sembunyikan kartu yang lebih dari 6
    for (let i = cardsToShow; i < totalCards; i++) {
      cards[i].classList.add('hidden-card');
    }

    // Tampilkan tombol lihat lebih banyak
    loadMoreContainer.classList.remove('hidden');

    // Tambahkan animasi untuk tombol
    setTimeout(() => {
      loadMoreContainer.classList.add('button-visible');
    }, 300);

    // Event listener untuk tombol lihat lebih banyak (lazy-load batch selanjutnya)
    loadMoreBtn.addEventListener('click', async function () {
      const btnSpinner = document.getElementById('btn-spinner');
      const btnIcon = document.getElementById('btn-icon');
      const btnText = document.getElementById('btn-text');

      // Tampilkan spinner di tombol
      btnSpinner.classList.remove('hidden');
      if (btnIcon) btnIcon.style.display = 'none';
      btnText.textContent = 'Memuat...';

      // Siapkan batch berikutnya
      const batchSize = 3;
      const loadBatch = [];
      for (let i = currentlyShowing; i < currentlyShowing + batchSize && i < totalCards; i++) {
        loadBatch.push(cards[i]);
      }

      // Untuk setiap kartu dalam batch, set src dari data-src jika ada, dan tunggu load
      const loadPromises = loadBatch.map((card) => {
        return new Promise((resolve) => {
          const img = card.querySelector('img');
          if (!img) return resolve();
          const dataSrc = img.dataset.src;
          if (dataSrc) {
            img.addEventListener('load', () => resolve());
            img.addEventListener('error', () => resolve());
            img.src = dataSrc;
            delete img.dataset.src;
          } else {
            // Sudah punya src, langsung resolve
            resolve();
          }
        });
      });

      // Tunggu sampai semua gambar batch selesai dimuat
      await Promise.all(loadPromises);

      // Tampilkan kartu setelah gambar siap
      loadBatch.forEach((card, idx) => {
        card.classList.remove('hidden-card');
        setTimeout(() => {
          card.classList.add('card-visible');
          card.classList.add('scroll-visible');
        }, 260 + idx * 180);
      });

      currentlyShowing += loadBatch.length;

      // Kembalikan tombol ke keadaan semula
      btnSpinner.classList.add('hidden');
      if (btnIcon) btnIcon.style.display = '';
      btnText.textContent = 'Lihat Lebih Banyak';

      // Jika semua kartu sudah ditampilkan, sembunyikan tombol
      if (currentlyShowing >= totalCards) {
        loadMoreContainer.classList.add('hidden');
      }
    });
  }
}

// Fungsi untuk inisialisasi animasi scroll
function initScrollAnimations() {
  // Animasi untuk judul halaman
  const title = document.querySelector('.title-animate');
  if (title) {
    setTimeout(() => {
      title.classList.add('title-visible');
    }, 300);
  }

  // Observer untuk elemen dengan animasi scroll
  const scrollObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('scroll-visible');
        } else {
          // Opsional: Hapus animasi saat elemen keluar dari viewport
          // entry.target.classList.remove('scroll-visible');
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    }
  );

  // Observasi semua elemen dengan kelas animasi scroll
  const scrollElements = document.querySelectorAll('.scroll-animate, .scroll-animate-left, .scroll-animate-right, .scroll-animate-zoom');
  scrollElements.forEach((el) => {
    scrollObserver.observe(el);
  });

  // Improved scroll behavior: staggered reveal per-column + light parallax on images
  function getGridColumns() {
    const container = document.getElementById('card-container');
    const styles = window.getComputedStyle(container);
    const cols = styles.getPropertyValue('grid-template-columns').split(' ').filter(Boolean).length;
    return Math.max(1, cols);
  }

  // Theme toggle functionality
  const themeToggle = document.getElementById('theme-toggle');
  const darkModeKey = 'darkMode';

  // Check for saved theme preference or default to light mode
  function initTheme() {
    const isDarkMode = localStorage.getItem(darkModeKey) === 'true';
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
      themeToggle.querySelector('i').classList.remove('fa-sun');
      themeToggle.querySelector('i').classList.add('fa-moon');
    }
  }

  themeToggle.addEventListener('click', () => {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    const icon = themeToggle.querySelector('i');

    if (isDarkMode) {
      icon.classList.remove('fa-sun');
      icon.classList.add('fa-moon');
      localStorage.setItem(darkModeKey, 'true');
    } else {
      icon.classList.remove('fa-moon');
      icon.classList.add('fa-sun');
      localStorage.setItem(darkModeKey, 'false');
    }
  });

  // Initialize theme on page load
  initTheme();

  // Enhanced IntersectionObserver: when a card becomes visible, add delay based on its column
  const enhancedObserver = new IntersectionObserver(
    (entries) => {
      const cols = getGridColumns();
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const allCards = Array.from(document.querySelectorAll('#card-container > .bg-white'));
          const index = allCards.indexOf(entry.target);
          const colIndex = index % cols;
          // reversed ordering: right -> left
          const revCol = Math.max(0, cols - 1 - colIndex);
          const delay = revCol * 180; // ms stagger per column (right->left)
          entry.target.style.transitionDelay = delay + 'ms';
          entry.target.classList.add('scroll-visible');
        } else {
          // Reset delay so re-entering recomputes properly
          entry.target.style.transitionDelay = '';
        }
      });
    },
    { threshold: 0.12 }
  );

  // Observe all cards for enhanced reveal and add overlay elements
  const allCards = Array.from(document.querySelectorAll('#card-container > .bg-white'));
  allCards.forEach((c) => {
    // ensure card is positioned for absolute overlay
    if (getComputedStyle(c).position === 'static') c.style.position = 'relative';
    // create overlay element that will sit over the image area
    const overlay = document.createElement('div');
    overlay.className = 'img-overlay';
    // try to set height to match image if present
    const img = c.querySelector('img');
    if (img) overlay.style.height = img.clientHeight ? img.clientHeight + 'px' : '192px';
    // insert overlay right after the image so it sits on top
    if (img && img.nextSibling) c.insertBefore(overlay, img.nextSibling);
    else c.appendChild(overlay);

    // Update overlay height when image loads (covers late-loaded images)
    if (img) {
      img.addEventListener('load', () => {
        overlay.style.height = img.clientHeight + 'px';
      });
    }

    enhancedObserver.observe(c);
  });

  // Keep overlays sized correctly on window resize (responsive)
  function updateOverlays() {
    const cardsWithOverlay = document.querySelectorAll('#card-container > .bg-white');
    cardsWithOverlay.forEach((c) => {
      const img = c.querySelector('img');
      const overlay = c.querySelector('.img-overlay');
      if (img && overlay) {
        overlay.style.height = img.clientHeight + 'px';
      }
    });
  }

  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      updateOverlays();
    }, 120);
  });

  // Subtle parallax on images inside cards (doesn't affect layout)
  function parallaxImages() {
    const imgs = document.querySelectorAll('#card-container > .bg-white img');
    const center = window.innerHeight / 2;
    imgs.forEach((img) => {
      const rect = img.getBoundingClientRect();
      const offset = rect.top - center;
      const max = 8; // max px translate (more subtle)
      const translateY = Math.max(-max, Math.min(max, -offset * 0.02));
      // keep scale if card already has scroll-visible state
      const card = img.closest('.bg-white');
      const isVisible = card && card.classList.contains('scroll-visible');
      const scale = isVisible ? 1.02 : 1;
      img.style.transform = `translateY(${translateY}px) scale(${scale})`;
    });
  }

  let parallaxTick = false;
  window.addEventListener('scroll', () => {
    if (!parallaxTick) {
      requestAnimationFrame(() => {
        parallaxImages();
        parallaxTick = false;
      });
      parallaxTick = true;
    }
  });

  // Run once to position images correctly
  parallaxImages();
}
// Popup Trophy
const trophyBtn = document.getElementById('trophy-toggle');
const popup = document.getElementById('congrats-popup');
const closePopup = document.getElementById('close-popup');
const fireworks = document.getElementById('fireworks');
const trophyContainer = document.getElementById('trophy-container');

function showPopup() {
  if (!popup) return;
  // populate popup badges
  populateBadges();

  popup.classList.remove('hidden');
  popup.classList.add('flex');
  // small reflow then add entrance class (in case of repeated opening)
  requestAnimationFrame(() => {
    const card = popup.querySelector('.popup-card');
    if (card) {
      card.classList.remove('popup-enter');
      void card.offsetWidth;
      card.classList.add('popup-enter');
    }
  });

  playCheer();
  launchFireworks();
  launchConfetti();
  launchSparklers();
}

function hidePopup() {
  if (!popup) return;
  popup.classList.add('hidden');
  popup.classList.remove('flex');
  if (fireworks) fireworks.innerHTML = '';
  // remove confetti
  if (trophyContainer) trophyContainer.innerHTML = '';
}

// close handlers
trophyBtn && trophyBtn.addEventListener('click', showPopup);
closePopup && closePopup.addEventListener('click', hidePopup);
// close when clicking on overlay outside card
popup &&
  popup.addEventListener('click', (e) => {
    const card = popup.querySelector('.popup-card');
    if (e.target === popup) hidePopup();
    if (card && !card.contains(e.target) && e.target !== card) hidePopup();
  });
// close on ESC
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') hidePopup();
});

function launchFireworks() {
  if (!fireworks) return;
  fireworks.innerHTML = '';
  for (let i = 0; i < 18; i++) {
    const fw = document.createElement('div');
    fw.className = 'firework';
    fw.style.left = Math.random() * 85 + 7 + '%';
    fw.style.bottom = Math.random() * 8 + 'px';
    fw.style.background = `radial-gradient(circle, hsl(${Math.random() * 360},90%,60%) 60%, #FFD700 100%)`;
    // random delay so they don't all explode same time
    fw.style.animationDelay = Math.random() * 300 + 'ms';
    fireworks.appendChild(fw);
    setTimeout(() => fw.remove(), 1400 + Math.random() * 400);
  }
}

// Confetti across the page attached to #trophy-container
function launchConfetti() {
  if (!trophyContainer) return;
  const colors = ['#ef4444', '#f97316', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];
  const count = 40;
  for (let i = 0; i < count; i++) {
    const c = document.createElement('div');
    c.className = 'confetti';
    c.style.left = Math.random() * 100 + '%';
    c.style.top = -(Math.random() * 12 + 2) + 'vh';
    c.style.background = colors[Math.floor(Math.random() * colors.length)];
    // random size & rotation duration
    c.style.width = 8 + Math.random() * 8 + 'px';
    c.style.height = 10 + Math.random() * 10 + 'px';
    c.style.setProperty('--dur', 1600 + Math.random() * 1600 + 'ms');
    c.style.transform = `rotate(${Math.random() * 360}deg)`;
    trophyContainer.appendChild(c);
    // remove after animation
    setTimeout(() => c.remove(), 3000 + Math.random() * 1200);
  }
  // Emoji confetti (small emoji rising near popup)
  const emojis = ['🎉', '👏', '🏆', '✨', '🌟'];
  const emojiCount = 10;
  for (let i = 0; i < emojiCount; i++) {
    const e = document.createElement('div');
    e.className = 'emoji-confetti';
    e.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    // position near center top area
    e.style.left = 30 + Math.random() * 40 + '%';
    e.style.bottom = 40 + Math.random() * 30 + 'px';
    e.style.fontSize = 16 + Math.random() * 18 + 'px';
    e.style.animationDelay = Math.random() * 300 + 'ms';
    trophyContainer.appendChild(e);
    setTimeout(() => e.remove(), 2200 + Math.random() * 800);
  }
}

// Populate popup with attractive badges (motivation words)
function populateBadges() {
  const container = document.getElementById('popup-badges');
  if (!container) return;
  container.innerHTML = '';
  const phrases = ['Hebat!', 'Inspiratif', 'Juara!', 'Bangga!', 'Pantang Menyerah', 'Penggerak', 'Berkarya', 'Pemimpin', 'Bintang', 'Semangat!'];
  phrases.forEach((p, i) => {
    const el = document.createElement('div');
    el.className = 'badge';
    el.textContent = p;
    // slight staggered entrance
    el.style.transitionDelay = i * 40 + 'ms';
    container.appendChild(el);
  });
}

// Short synthesized cheer sound using Web Audio API (no external file)
function playCheer() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // short chord (two oscillators)
    const o1 = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.18, now + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

    o1.frequency.value = 880; // A5
    o2.frequency.value = 1100; // C#6
    o1.type = 'sine';
    o2.type = 'sine';

    o1.connect(g);
    o2.connect(g);

    // a bit of noise for crowd feel
    const bufferSize = ctx.sampleRate * 0.4;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.25;
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 800;
    noise.connect(noiseFilter);
    noiseFilter.connect(g);

    g.connect(ctx.destination);

    o1.start(now);
    o2.start(now + 0.02);
    noise.start(now);

    o1.stop(now + 0.85);
    o2.stop(now + 0.85);
    noise.stop(now + 0.85);

    // close context after sound finished
    setTimeout(() => {
      if (ctx.close) ctx.close();
    }, 1200);
  } catch (e) {
    // ignore if audio not available
    console.warn('Audio unavailable', e);
  }
}

// small sparklers near the big trophy in popup
function launchSparklers() {
  const popup = document.getElementById('congrats-popup');
  if (!popup) return;
  const card = popup.querySelector('.popup-card');
  if (!card) return;
  // remove old sparks
  const old = card.querySelectorAll('.spark');
  old.forEach((n) => n.remove());
  const rect = card.getBoundingClientRect();
  for (let i = 0; i < 12; i++) {
    const s = document.createElement('div');
    s.className = 'spark';
    s.style.background = `hsl(${Math.random() * 60 + 40},90%,60%)`;
    s.style.left = 40 + Math.random() * 20 + '%';
    s.style.bottom = 40 + Math.random() * 10 + 'px';
    card.appendChild(s);
    setTimeout(() => s.remove(), 900 + Math.random() * 400);
  }
}
