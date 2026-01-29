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
  { threshold: 0.1 },
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
        setTimeout(
          () => {
            card.classList.add('card-visible');
            card.classList.add('scroll-visible');
          },
          260 + idx * 180,
        );
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
    },
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
    { threshold: 0.12 },
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

// Image Modal functionality
function initImageModal() {
  const modal = document.getElementById('image-modal');
  const modalImage = document.getElementById('modal-image');
  const modalClose = document.getElementById('modal-close');

  // Get all card images
  const cardImages = document.querySelectorAll('#card-container img');

  cardImages.forEach((img) => {
    // Add click listener to image wrapper
    const wrapper = img.closest('div[class*="overflow-hidden"]') || img.parentElement;
    if (wrapper) {
      wrapper.style.cursor = 'pointer';
      wrapper.addEventListener('click', (e) => {
        // Don't trigger if clicking on links
        if (e.target.closest('a')) return;

        // Get the actual image source (handle data-src for lazy loaded images)
        const src = img.src || img.dataset.src;
        modalImage.src = src;
        modalImage.alt = img.alt;

        // Show modal
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
      });
    }
  });

  // Close modal on X button click
  modalClose.addEventListener('click', (e) => {
    e.stopPropagation();
    modal.classList.add('hidden');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
  });

  // Close modal on background click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.add('hidden');
      modal.style.display = 'none';
      document.body.style.overflow = 'auto';
    }
  });

  // Close modal on ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      modal.classList.add('hidden');
      modal.style.display = 'none';
      document.body.style.overflow = 'auto';
    }
  });
}

// Initialize image modal after page load
document.addEventListener('DOMContentLoaded', () => {
  initImageModal();
});
