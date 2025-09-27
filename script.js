// Initialize AOS (Animate On Scroll)
AOS.init({
    duration: 1000,
    once: false,
    mirror: true
});

// Create scroll progress indicator
const progressBar = document.createElement('div');
progressBar.className = 'scroll-progress';
document.body.appendChild(progressBar);

// Dark mode toggle functionality
const themeToggle = document.querySelector('.theme-toggle');
const moonIcon = document.querySelector('.fa-moon');


// Smooth scroll for navigation links (only for internal anchor links)
document.querySelectorAll('nav a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        // Only prevent default for internal anchor links (starting with #)
        if (href.startsWith('#')) {
            e.preventDefault();
            const targetSection = document.querySelector(href);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        }
        // For external links (like about.html), let the browser handle normally
    });
});

// navbar js

const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
});

// Close menu when clicking a nav link
document.querySelectorAll('.nav-item').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
    });
});

// Add active class to current section in navigation
window.addEventListener('scroll', () => {
    let current = '';
    const sections = document.querySelectorAll('section');
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= (sectionTop - sectionHeight / 3)) {
            current = section.getAttribute('id');
        }
    });

    document.querySelectorAll('nav a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('active');
        }
    });
});

// Add loading animation
document.addEventListener('DOMContentLoaded', function() {
    const loadingOverlay = document.getElementById('loading-overlay');
    const bicycle = document.querySelector('.bicycle-container');

    // Hide the loading overlay after the bicycle animation completes
    bicycle.addEventListener('animationend', function() {
        loadingOverlay.style.opacity = '0';
        setTimeout(() => {
            loadingOverlay.style.display = 'none';
        }, 500);
    });

    // Refresh AOS on load to ensure animations work properly
    AOS.refresh();
});

// Handle loader animation
window.addEventListener('load', () => {
    const loadingOverlay = document.getElementById('loading-overlay');
    setTimeout(() => {
        loadingOverlay.classList.add('fade-out');
        setTimeout(() => {
            loadingOverlay.style.display = 'none';
        }, 800); // Match this with the CSS transition duration
    }, 1500); // Show loader for 1.5 seconds
});

// Team Carousel
document.addEventListener('DOMContentLoaded', function() {
    const track = document.querySelector('.carousel-track');
    const cards = Array.from(document.querySelectorAll('.carousel-card'));
    const prevButton = document.querySelector('.carousel-button.prev');
    const nextButton = document.querySelector('.carousel-button.next');

    let currentIndex = 0;
    const cardWidth = cards[0].offsetWidth + 20; // Including gap
    const visibleCards = 5;
    const totalCards = cards.length;

    // Clone cards for infinite scroll
    const cloneFirst = cards.slice(0, visibleCards).map(card => card.cloneNode(true));
    const cloneLast = cards.slice(-visibleCards).map(card => card.cloneNode(true));
    
    // Add clones to track
    cloneLast.forEach(clone => track.insertBefore(clone, track.firstChild));
    cloneFirst.forEach(clone => track.appendChild(clone));

    // Set initial position to show first set of original cards
    currentIndex = visibleCards;
    moveToSlide(currentIndex, false);

    // Initialize active cards
    updateActiveCards();

    // Auto slide every 3 seconds
    let autoSlideInterval = setInterval(nextSlide, 3000);

    // Reset interval on manual navigation
    function resetInterval() {
        clearInterval(autoSlideInterval);
        autoSlideInterval = setInterval(nextSlide, 3000);
    }

    function updateActiveCards() {
        const allCards = Array.from(track.children);
        allCards.forEach((card, index) => {
            const position = (index - currentIndex + totalCards) % totalCards;
            if (position >= 0 && position < visibleCards) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });
    }

    function moveToSlide(index, smooth = true) {
        const translateX = -index * cardWidth;
        track.style.transition = smooth ? 'transform 0.5s ease-in-out' : 'none';
        track.style.transform = `translateX(${translateX}px)`;
        currentIndex = index;
        updateActiveCards();

        // Check if we need to snap back to original position
        if (smooth) {
            setTimeout(() => {
                if (currentIndex >= totalCards + visibleCards) {
                    moveToSlide(visibleCards, false);
                } else if (currentIndex <= visibleCards - 1) {
                    moveToSlide(totalCards, false);
                }
            }, 500);
        }
    }

    function nextSlide() {
        moveToSlide(currentIndex + 1, true);
    }

    function prevSlide() {
        moveToSlide(currentIndex - 1, true);
    }

    // Event Listeners
    prevButton.addEventListener('click', () => {
        prevSlide();
        resetInterval();
    });

    nextButton.addEventListener('click', () => {
        nextSlide();
        resetInterval();
    });

    // Handle transition end for smooth infinite scroll
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

    track.addEventListener('mouseleave', () => {
        autoSlideInterval = setInterval(nextSlide, 3000);
    });

    // Handle touch events for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    track.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        clearInterval(autoSlideInterval);
    });

    track.addEventListener('touchmove', (e) => {
        touchEndX = e.touches[0].clientX;
    });

    track.addEventListener('touchend', () => {
        const difference = touchStartX - touchEndX;
        if (Math.abs(difference) > 50) {
            if (difference > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        }
        autoSlideInterval = setInterval(nextSlide, 3000);
    });
});

// animated navbar

// const list = document.querySelectorAll('.list');

// function activeLink() {
//     list.forEach((item) => 
//         item.classList.remove('active')
//     );
//     this.classList.add('active');
// }

// list.forEach((item) => {
//     item.addEventListener('click', activeLink);
//     item.addEventListener('mouseover', () => {
//         item.classList.add('hovered');
//     });
//     item.addEventListener('mouseout', () => {
//         if (!item.classList.contains('active')) {
//             item.classList.remove('hovered');
//         }
//     });
// });
