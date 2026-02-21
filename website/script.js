// Radio Check Website JavaScript

// Feature card data for modals
const featureData = {
    'AI Battle Buddies': {
        icon: 'fas fa-comments',
        description: 'Our AI Battle Buddies are available 24/7 and understand military culture. Each has a unique personality — from Tommy\'s friendly chat to Bob\'s straight-talking Para banter, Doris\'s warmth, Finch\'s crisis support, Margie\'s substance guidance, and Hugo\'s wellness tips.\n\nThey\'re trained to listen without judgment, offer coping strategies, and know when to guide you to human support. Perfect for those 3am moments when you need someone to talk to. They won\'t replace professional help, but they\'re always here when you need a friendly ear.'
    },
    'Peer Support': {
        icon: 'fas fa-users',
        description: 'Our peer supporters are veterans and serving personnel who\'ve walked in your boots. They\'ve completed specialist training in active listening and mental health first aid.\n\nWhether you need a brew and a chat, advice on transitioning to civvy street, or just someone who gets it — they\'re here for you. No judgment, no paperwork, just real support from people who understand.\n\nYou can request a call back at a time that suits you, or connect instantly when someone is available.'
    },
    'Crisis Counselling': {
        icon: 'fas fa-phone',
        description: 'When things get tough, our qualified counsellors are available for voice calls through the app. They specialise in military-related issues including PTSD, transition challenges, and relationship difficulties.\n\nConversations are confidential, and you can request a callback at a time that suits you. We also connect you with specialist services like Combat Stress, Samaritans, and Veterans UK when needed.\n\nIn an emergency, always call 999.'
    },
    'Self-Care Tools': {
        icon: 'fas fa-book',
        description: 'Your personal toolkit for mental wellness. Features include:\n\n• Private journaling to process your thoughts\n• Guided breathing exercises for anxiety and panic\n• Grounding techniques for flashbacks and difficult moments\n• Sleep hygiene tips for those restless nights\n• Mood tracking to understand your patterns\n\nAll stored locally on your device — your private space for reflection and recovery. No one else can see what you write.'
    },
    'Buddy Finder': {
        icon: 'fas fa-search',
        description: 'Missing that sense of belonging? Buddy Finder helps you connect with other veterans in your area or find old mates from your regiment.\n\nSearch by location, service branch, or unit. Build your local support network, organise meetups, or simply know you\'re not alone.\n\nBecause sometimes the best support comes from those who served alongside you. Your data is protected and you control what you share.'
    },
    'Support Directory': {
        icon: 'fas fa-building',
        description: 'A comprehensive directory of UK veteran charities, regimental associations, and support services:\n\n• Housing and homelessness support\n• Employment and career guidance\n• Legal advice and advocacy\n• Family and relationship services\n• Financial assistance\n• Health and wellbeing services\n\nFilter by what you need, read about each organisation, and connect directly. Help is out there; we just make it easier to find.'
    }
};

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

// Modal functions
function openModal(title, icon, description) {
    const modal = document.getElementById('featureModal');
    const modalIcon = document.getElementById('modalIcon');
    const modalTitle = document.getElementById('modalTitle');
    const modalDescription = document.getElementById('modalDescription');
    
    if (modal && modalIcon && modalTitle && modalDescription) {
        modalIcon.innerHTML = `<i class="${icon}"></i>`;
        modalTitle.textContent = title;
        modalDescription.innerHTML = description.replace(/\n/g, '<br>');
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal() {
    const modal = document.getElementById('featureModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Close modal on background click
document.addEventListener('click', function(event) {
    const modal = document.getElementById('featureModal');
    if (event.target === modal) {
        closeModal();
    }
});

// Close modal on Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeModal();
    }
});

// Add click handlers to feature cards
document.addEventListener('DOMContentLoaded', function() {
    const featureCards = document.querySelectorAll('.feature-card');
    
    featureCards.forEach(function(card) {
        card.addEventListener('click', function() {
            const title = card.querySelector('h3').textContent;
            const data = featureData[title];
            
            if (data) {
                openModal(title, data.icon, data.description);
            }
        });
    });
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
