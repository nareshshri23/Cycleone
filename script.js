// Initialize AOS (Animate On Scroll) with smooth animations
AOS.init({
    duration: 1000,     // Animation duration in milliseconds
    once: false,        // Whether animation should happen only once
    mirror: true        // Whether elements should animate out while scrolling past them
});

// Create and append scroll progress bar to track page scroll
const progressBar = document.createElement('div');
progressBar.className = 'scroll-progress';
document.body.appendChild(progressBar);

// Cache DOM elements for theme toggle functionality
const themeToggle = document.querySelector('.theme-toggle');
const moonIcon = document.querySelector('.fa-moon');

// Smooth scroll for navigation links
// Only prevents default for internal anchor links (starting with #)
document.querySelectorAll('nav a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href.startsWith('#')) {
            e.preventDefault();
            const targetSection = document.querySelector(href);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        }
        // External links will follow their default behavior
    });
});

// Mobile navigation toggle functionality
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

// Toggle mobile menu when hamburger is clicked
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
});

// Close mobile menu when a nav item is clicked
document.querySelectorAll('.nav-item').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
    });
});

// Update active navigation link based on scroll position
window.addEventListener('scroll', () => {
    let current = '';
    const sections = document.querySelectorAll('section');
    
    // Find which section is currently in view
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        // If scrolled to at least 1/3 into the section
        if (scrollY >= (sectionTop - sectionHeight / 3)) {
            current = section.getAttribute('id');
        }
    });

    // Update active state of navigation links
    document.querySelectorAll('nav a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('active');
        }
    });
});

// Handle page loading animation
document.addEventListener('DOMContentLoaded', function() {
    const loadingOverlay = document.getElementById('loading-overlay');
    const bicycle = document.querySelector('.bicycle-container');

    // Hide loading overlay when bicycle animation completes
    bicycle.addEventListener('animationend', function() {
        loadingOverlay.style.opacity = '0';
        setTimeout(() => {
            loadingOverlay.style.display = 'none';
        }, 500); // Match with CSS transition duration
    });

    // Refresh AOS to ensure proper animation initialization
    AOS.refresh();
});

// Fallback in case animationend doesn't fire
window.addEventListener('load', () => {
    const loadingOverlay = document.getElementById('loading-overlay');
    // Wait for 1.5s before starting fade out
    setTimeout(() => {
        loadingOverlay.classList.add('fade-out');
        // Remove from DOM after fade out completes
        setTimeout(() => {
            loadingOverlay.style.display = 'none';
        }, 800); // Match with CSS transition duration
    }, 1500);
});

// Initialize team carousel when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Cache DOM elements
    const track = document.querySelector('.carousel-track');
    const cards = Array.from(document.querySelectorAll('.carousel-card'));
    const prevButton = document.querySelector('.carousel-button.prev');
    const nextButton = document.querySelector('.carousel-button.next');

    // Carousel configuration
    let currentIndex = 0;
    const cardWidth = cards[0].offsetWidth + 20; // Width + gap
    const visibleCards = 5; // Number of cards to show at once
    const totalCards = cards.length;

    // Clone cards for infinite scroll effect
    const cloneFirst = cards.slice(0, visibleCards).map(card => card.cloneNode(true));
    const cloneLast = cards.slice(-visibleCards).map(card => card.cloneNode(true));
    
    // Add cloned cards to beginning and end of track
    cloneLast.forEach(clone => track.insertBefore(clone, track.firstChild));
    cloneFirst.forEach(clone => track.appendChild(clone));

    // Initialize carousel position
    currentIndex = visibleCards;
    moveToSlide(currentIndex, false);
    updateActiveCards();

    // Auto-advance slides every 3 seconds
    let autoSlideInterval = setInterval(nextSlide, 3000);

    /**
     * Reset the auto-slide interval
     * Called after manual navigation to prevent auto-slide during interaction
     */
    function resetInterval() {
        clearInterval(autoSlideInterval);
        autoSlideInterval = setInterval(nextSlide, 3000);
    }

    /**
     * Update active state of carousel cards
     * Adds 'active' class to currently visible cards for styling purposes
     */
    function updateActiveCards() {
        const allCards = Array.from(track.children);
        allCards.forEach((card, index) => {
            const position = (index - currentIndex + totalCards) % totalCards;
            card.classList.toggle('active', position >= 0 && position < visibleCards);
        });
    }

    /**
     * Move carousel to specific slide
     * @param {number} index - Target slide index
     * @param {boolean} smooth - Whether to animate the transition
     */
    function moveToSlide(index, smooth = true) {
        const translateX = -index * cardWidth;
        track.style.transition = smooth ? 'transform 0.5s ease-in-out' : 'none';
        track.style.transform = `translateX(${translateX}px)`;
        currentIndex = index;
        updateActiveCards();

        // Handle infinite scroll edge cases
        if (smooth) {
            setTimeout(() => {
                if (currentIndex >= totalCards + visibleCards) {
                    // If scrolled past last card, jump to first real card
                    moveToSlide(visibleCards, false);
                } else if (currentIndex <= visibleCards - 1) {
                    // If scrolled before first card, jump to last real card
                    moveToSlide(totalCards, false);
                }
            }, 500); // Wait for transition to complete
        }
    }

    // Navigation functions
    function nextSlide() {
        moveToSlide(currentIndex + 1, true);
    }

    function prevSlide() {
        moveToSlide(currentIndex - 1, true);
    }

    // Event listeners for navigation buttons
    prevButton.addEventListener('click', () => {
        prevSlide();
        resetInterval();
    });

    nextButton.addEventListener('click', () => {
        nextSlide();
        resetInterval();
    });

    // Handle infinite scroll when reaching either end
    track.addEventListener('transitionend', () => {
        if (currentIndex >= totalCards + visibleCards) {
            moveToSlide(visibleCards, false);
        } else if (currentIndex <= visibleCards - 1) {
            moveToSlide(totalCards, false);
        }
    });

    // Pause auto-slide on hover
    track.addEventListener('mouseenter', () => {
        clearInterval(autoSlideInterval);
    });

    // Resume auto-slide when mouse leaves
    track.addEventListener('mouseleave', () => {
        autoSlideInterval = setInterval(nextSlide, 3000);
    });

    // Touch event handling for mobile swipe
    let touchStartX = 0;
    let touchEndX = 0;

    track.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        clearInterval(autoSlideInterval);
    });

    track.addEventListener('touchmove', (e) => {
        touchEndX = e.touches[0].clientX;
    });

    // Handle touch end for swipe gestures
    track.addEventListener('touchend', () => {
        const difference = touchStartX - touchEndX;
        const swipeThreshold = 50; // Minimum distance for a swipe to be detected
        
        if (Math.abs(difference) > swipeThreshold) {
            if (difference > 0) {
                nextSlide(); // Swipe left
            } else {
                prevSlide(); // Swipe right
            }
        }
        // Resume auto-slide after touch interaction
        autoSlideInterval = setInterval(nextSlide, 3000);
    });
});
