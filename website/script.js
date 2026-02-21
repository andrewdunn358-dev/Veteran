// Radio Check Website JavaScript

// Toggle mobile navigation
function toggleMobileNav() {
    const navMenu = document.getElementById('navMenu');
    navMenu.classList.toggle('active');
}

// Close mobile nav when clicking outside
document.addEventListener('click', function(event) {
    const navMenu = document.getElementById('navMenu');
    const navToggle = document.querySelector('.nav-toggle');
    
    if (navMenu && navToggle) {
        if (!navMenu.contains(event.target) && !navToggle.contains(event.target)) {
            navMenu.classList.remove('active');
        }
    }
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
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

// Add scroll effect to navbar
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (window.scrollY > 50) {
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.3)';
        } else {
            navbar.style.boxShadow = 'none';
        }
    }
});

// Contact form handling (if present)
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData.entries());
        
        // Show success message (in a real implementation, this would send to a server)
        alert('Thank you for your message. We will get back to you soon.');
        contactForm.reset();
    });
}

// Console welcome message
console.log('%cRadio Check', 'font-size: 24px; font-weight: bold; color: #0d9488;');
console.log('%cSupporting UK veterans and serving personnel', 'font-size: 14px; color: #94a3b8;');
