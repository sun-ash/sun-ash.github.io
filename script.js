/**
 * Portfolio Site - Main JavaScript
 * Fixed: removed duplicate function definitions, corrected cursor/nav class names
 */

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
// PERFORMANCE UTILITIES
// ============================================
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

// Reduce motion for users who prefer it
const respectMotionPreference = () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (prefersReducedMotion.matches) {
    document.documentElement.style.setProperty('--transition-slow', '0s');
    document.documentElement.style.setProperty('--transition-base', '0s');
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', respectMotionPreference);
} else {
  respectMotionPreference();
}

// ============================================
// EMAILJS INIT
// ============================================ 
emailjs.init("clrtkGgyETZtk28oP");

// ============================================
// ALPINE.JS — MAIN APP
// ============================================
function app() {
  return {
    // Navigation state
    isNavHidden: false,
    isNavScrolled: false,
    lastScrollY: 0,

    // Skills data
    skills: [
      {
        label: 'Frontend',
        items: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Alpine.js']
      },
      {
        label: 'Backend',
        items: ['Node.js', 'Python', 'PostgreSQL', 'Redis', 'GraphQL']
      },
      {
        label: 'DevOps',
        items: ['Docker', 'AWS', 'CI/CD', 'Linux']
      }
    ],

    // Contact form state
    contactForm: {
      name: '',
      email: '',
      message: ''
    },
    contactSending: false,
    contactSent: false,

    init() {
      this.initNavigation();
      this.initCursor();
      initScrollReveal();
      initSmoothScroll();
      console.log('Portfolio initialized');
    },

    // Navigation: hide on scroll down, show on scroll up
    initNavigation() {
      window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;

        if (currentScrollY > this.lastScrollY && currentScrollY > 100) {
          this.isNavHidden = true;
        } else {
          this.isNavHidden = false;
        }

        this.isNavScrolled = currentScrollY > 50;
        this.lastScrollY = currentScrollY;
      }, { passive: true });

      // Show navbar when mouse is near top of screen
      document.addEventListener('mousemove', (e) => {
        if (e.clientY < 80 && this.isNavHidden) {
          this.isNavHidden = false;
        }
      });
    },

    // Custom cursor — uses CSS class 'expanded' (not 'cursor-hover')
    initCursor() {
      const cursor = document.getElementById('cursor');
      if (!cursor) return;

      document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
      });

      const interactiveElements = document.querySelectorAll('a, button, .project-card');
      interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('expanded'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('expanded'));
      });
    },

    // Contact form submission via EmailJS
    async submitContact() {
      this.contactSending = true;

      try {
        await emailjs.send("service_y4ktboq", "template_fad7otz", {
          from_name: this.contactForm.name,
          from_email: this.contactForm.email,
          message: this.contactForm.message,
          to_email: "aashishsunuwar527@gmail.com"
        });

        this.contactSent = true;
        this.contactForm = { name: '', email: '', message: '' };

        setTimeout(() => {
          this.contactSent = false;
        }, 3000);

      } catch (error) {
        alert("Failed to send message. Please try again.");
        console.error(error);
      } finally {
        this.contactSending = false;
      }
    }
  };
}

// ============================================
// ALPINE.JS — MUSIC PLAYER
// ============================================
function musicPlayer() {
  return {
    isPlaying: false,

    init() {
      this.$nextTick(() => {
        this.restoreState();
      });
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
        audio.play()
          .then(() => {
            this.isPlaying = true;
            this.fadeIn(audio);
            this.saveState();
          })
          .catch(e => {
            console.error('Audio play failed:', e);
          });
      }
    },

    fadeIn(audio, targetVolume = 0.3, duration = 1000) {
      const start = performance.now();
      const animate = (now) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        audio.volume = progress * targetVolume;
        if (progress < 1) requestAnimationFrame(animate);
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
      try {
        localStorage.setItem('music-playing', this.isPlaying);
        localStorage.setItem('music-time', this.$refs.audio.currentTime);
      } catch (e) { /* localStorage may be blocked */ }
    },

    restoreState() {
      try {
        const savedTime = parseFloat(localStorage.getItem('music-time')) || 0;
        this.$refs.audio.currentTime = savedTime;
      } catch (e) { /* localStorage may be blocked */ }
    }
  };
}

// Periodically save music playback position
setInterval(() => {
  const audio = document.querySelector('.music-player audio');
  if (audio && !audio.paused) {
    try {
      localStorage.setItem('music-time', audio.currentTime);
    } catch (e) { /* ignore */ }
  }
}, 5000);
