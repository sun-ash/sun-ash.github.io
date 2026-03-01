/**
 * Portfolio Site - Main JavaScript
 * Handles custom cursor, scroll animations, and Alpine.js data
 */

// ============================================
// CUSTOM CURSOR
// ============================================
const initCursor = () => {
  const cursor = document.getElementById('cursor');
  if (!cursor) return;

  // Mouse movement tracking
  document.addEventListener('mousemove', (e) => {
    cursor.style.left = `${e.clientX}px`;
    cursor.style.top = `${e.clientY}px`;
  });

  // Expand cursor on interactive elements
  const interactiveElements = document.querySelectorAll(
    'a, button, input, textarea, .project-card, .btn'
  );

  interactiveElements.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('expanded');
    });
    
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('expanded');
    });
  });
};

// ============================================
// SCROLL REVEAL ANIMATIONS
// ============================================
const initScrollReveal = () => {
  const reveals = document.querySelectorAll('.reveal');
  
  const observerOptions = {
    threshold: 0.12,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Optional: Stop observing once revealed
        // observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  reveals.forEach((el) => observer.observe(el));
};

// ============================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ============================================
const initSmoothScroll = () => {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
};

// ============================================
// ALPINE.JS DATA FUNCTIONS
// ============================================

/**
 * Main App Data
 * Manages global state and skills data
 */
// eslint-disable-next-line no-unused-vars
const app = () => ({
  skills: [
    {
      label: 'Frontend',
      items: ['PHP', 'Javascript', 'Tailwind', 'Laravel Blade']
    },
    {
      label: 'Backend',
      items: ['MySQL', 'PostgreSQL']
    },
    {
      label: 'Infra',
      items: ['Docker', 'GitHub Actions']
    }
  ],
  
  init() {
    // Initialize non-Alpine functionality
    initCursor();
    initScrollReveal();
    initSmoothScroll();
    
    console.log('Portfolio initialized');
  }
});

/**
 * Contact Form Handler
 * Manages form state and submission
 */
// eslint-disable-next-line no-unused-vars
const contactForm = () => ({
  form: {
    name: '',
    email: '',
    message: ''
  },
  sent: false,
  loading: false,

  validate() {
    return this.form.name && 
           this.form.email && 
           this.form.message &&
           this.isValidEmail(this.form.email);
  },

  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  async submit() {
    if (!this.validate()) {
      // Shake animation or error message could go here
      return;
    }

    this.loading = true;

    try {
      // Simulate API call - replace with actual endpoint
      await this.simulateSubmit();
      
      this.sent = true;
      this.resetForm();
      
      // Reset after 3 seconds for demo purposes
      setTimeout(() => {
        this.sent = false;
      }, 3000);
      
    } catch (error) {
      console.error('Form submission failed:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      this.loading = false;
    }
  },

  simulateSubmit() {
    return new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });
  },

  resetForm() {
    this.form = {
      name: '',
      email: '',
      message: ''
    };
  }
});

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Debounce function for performance
 */
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function for scroll events
 */
const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// ============================================
// PERFORMANCE OPTIMIZATIONS
// ============================================

// Reduce motion for users who prefer it
const respectMotionPreference = () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  
  if (prefersReducedMotion.matches) {
    document.documentElement.style.setProperty('--transition-slow', '0s');
    document.documentElement.style.setProperty('--transition-base', '0s');
  }
};

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', respectMotionPreference);
} else {
  respectMotionPreference();
}

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { app, contactForm };
}

// ============================================
// SMOOTH NAVBAR CONTROLLER
// ============================================

// eslint-disable-next-line no-unused-vars
const navbar = () => ({
  isHidden: false,
  isScrolled: false,
  lastScrollY: 0,
  scrollVelocity: 0,
  velocityThreshold: 2, // Pixels per frame to trigger hide
  scrollTimeout: null,
  rafId: null,
  
  init() {
    // Initial check
    this.handleScroll();
    
    // Smooth scroll listener with throttling
    let ticking = false;
    
    window.addEventListener('scroll', () => {
      if (!ticking) {
        this.rafId = window.requestAnimationFrame(() => {
          this.handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
    
    // Show navbar when mouse near top
    document.addEventListener('mousemove', (e) => {
      if (e.clientY < 100 && this.isHidden) {
        this.isHidden = false;
      }
    });
    
    // Show on touch near top (mobile)
    document.addEventListener('touchstart', (e) => {
      if (e.touches[0].clientY < 100 && this.isHidden) {
        this.isHidden = false;
      }
    }, { passive: true });
  },
  
  handleScroll() {
    const currentScrollY = window.scrollY;
    const delta = currentScrollY - this.lastScrollY;
    
    // Calculate velocity (pixels per frame)
    this.scrollVelocity = Math.abs(delta);
    
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const isAtTop = currentScrollY < 50;
    const isNearBottom = currentScrollY + windowHeight > documentHeight - 200;
    const isPastHero = currentScrollY > windowHeight * 0.3;
    
    // Update scrolled state for background
    this.isScrolled = currentScrollY > 30;
    
    // Clear existing timeout
    clearTimeout(this.scrollTimeout);
    
    // Logic to hide/show based on direction and velocity
    if (isAtTop) {
      // Always show at top
      this.isHidden = false;
    } else if (isNearBottom) {
      // Always show near bottom
      this.isHidden = false;
    } else if (delta > 0 && isPastHero && this.scrollVelocity > this.velocityThreshold) {
      // Scrolling down fast - hide
      this.isHidden = true;
    } else if (delta < 0) {
      // Scrolling up - show (with slight delay for smoothness)
      this.scrollTimeout = setTimeout(() => {
        this.isHidden = false;
      }, 50);
    }
    
    // Auto-show after stop scrolling (if hidden)
    if (this.isHidden) {
      this.scrollTimeout = setTimeout(() => {
        this.isHidden = false;
      }, 3000); // Show after 3 seconds of no scrolling
    }
    
    this.lastScrollY = currentScrollY;
  },
  
  // Cleanup
  destroy() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    clearTimeout(this.scrollTimeout);
  }
});

// ============================================
// MUSIC PLAYER
// ============================================

// eslint-disable-next-line no-unused-vars
const musicPlayer = () => ({
  isPlaying: false,
  audioContext: null,
  gainNode: null,
  
  init() {
    this.$nextTick(() => {
      // Set audio source if not set
      const audio = this.$refs.audio;
      if (!audio.querySelector('source') || !audio.querySelector('source').src) {
        // Use default URL or show error
        const defaultUrl = window.DEFAULT_AUDIO_URL;
        if (defaultUrl) {
          audio.src = defaultUrl;
        }
      }
      
      // Handle autoplay restrictions
      this.handleAutoplay();
      
      // Save state to localStorage
      this.restoreState();
    });
  },
  
  handleAutoplay() {
    const audio = this.$refs.audio;
    
    // Browsers block autoplay until user interaction
    const attemptPlay = () => {
      audio.volume = 0.3; // Start quiet (30%)
      audio.play().then(() => {
        this.isPlaying = true;
        this.saveState();
      }).catch((err) => {
        console.log('Autoplay blocked:', err);
        this.isPlaying = false;
      });
    };
    
    // Try on first user interaction
    const unlockAudio = () => {
      attemptPlay();
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
      document.removeEventListener('scroll', unlockAudio);
    };
    
    document.addEventListener('click', unlockAudio, { once: true });
    document.addEventListener('touchstart', unlockAudio, { once: true });
    document.addEventListener('scroll', unlockAudio, { once: true });
    
    // Also try immediately (may work if user previously allowed)
    attemptPlay();
  },
  
  toggle() {
    const audio = this.$refs.audio;
    
    if (this.isPlaying) {
      this.fadeOut(audio, () => {
        audio.pause();
        this.isPlaying = false;
        this.saveState();
      });
    } else {
      audio.volume = 0;
      audio.play().then(() => {
        this.isPlaying = true;
        this.fadeIn(audio);
        this.saveState();
      }).catch((err) => {
        console.error('Playback failed:', err);
        alert('Could not play audio. Please check your audio source.');
      });
    }
  },
  
  fadeIn(audio, targetVolume = 0.3, duration = 1000) {
    const start = performance.now();
    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      audio.volume = progress * targetVolume;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  },
  
  fadeOut(audio, callback, duration = 500) {
    const startVolume = audio.volume;
    const start = performance.now();
    
    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      audio.volume = startVolume * (1 - progress);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        callback();
      }
    };
    requestAnimationFrame(animate);
  },
  
  saveState() {
    localStorage.setItem('music-playing', this.isPlaying);
    localStorage.setItem('music-time', this.$refs.audio.currentTime);
  },
  
  restoreState() {
    const wasPlaying = localStorage.getItem('music-playing') === 'true';
    const savedTime = parseFloat(localStorage.getItem('music-time')) || 0;
    
    this.$refs.audio.currentTime = savedTime;
    
    // Don't auto-resume, let user decide (browser policy friendly)
    if (wasPlaying) {
      console.log('Music was playing, click to resume');
    }
  }
});

// Save progress periodically
setInterval(() => {
  const audio = document.querySelector('.music-player audio');
  if (audio && !audio.paused) {
    localStorage.setItem('music-time', audio.currentTime);
  }
}, 5000);



