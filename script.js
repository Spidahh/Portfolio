/**
 * Francesco Noncistà - Portfolio
 * Minimal interactions
 */

document.addEventListener('DOMContentLoaded', () => {
    initNavScroll();
    initSmoothScroll();
    initFadeIn();
});

/**
 * Navbar opacity on scroll
 */
function initNavScroll() {
    const nav = document.querySelector('.nav');
    if (!nav) return;

    let lastY = 0;
    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const y = window.scrollY;
                
                // Toggle background opacity
                if (y > 50) {
                    nav.style.background = 'rgba(9, 9, 11, 0.95)';
                } else {
                    nav.style.background = 'rgba(9, 9, 11, 0.8)';
                }

                // Hide on scroll down, show on scroll up
                if (y > lastY && y > 100) {
                    nav.style.transform = 'translateY(-100%)';
                } else {
                    nav.style.transform = 'translateY(0)';
                }

                lastY = y;
                ticking = false;
            });
            ticking = true;
        }
    });
}

/**
 * Smooth scroll for anchor links
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const href = anchor.getAttribute('href');
            if (href === '#') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const offset = 80;
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                
                window.scrollTo({
                    top,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Fade in elements on scroll
 */
function initFadeIn() {
    const elements = document.querySelectorAll('.card, .playlist-item, .section-header');
    
    if (!elements.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, i * 50);
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '-20px'
    });

    elements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(el);
    });
}
