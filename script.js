
document.addEventListener('DOMContentLoaded', function() {
    const scrollDown = document.getElementById('scroll-down');
    
    // Hide when scrolling down
    let lastScrollTop = 0;
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Hide if user scrolls down more than 100px
        if (scrollTop > 100) {
            scrollDown.classList.add('hide');
        } else {
            scrollDown.classList.remove('hide');
        }
        
        lastScrollTop = scrollTop;
    });
    
    // Smooth scroll to next section when clicked
    scrollDown.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Get the next section (assuming it's the immediate next sibling)
        const nextSection = this.parentElement.nextElementSibling;
        
        if (nextSection) {
            nextSection.scrollIntoView({
                behavior: 'smooth'
            });
            
            // Add click animation
            this.style.transform = 'translateY(10px) scale(0.95)';
            this.style.opacity = '0.5';
            
            setTimeout(() => {
                this.style.transform = '';
                this.style.opacity = '';
            }, 300);
        }
    });
    
    // Pause animation when hovering
    scrollDown.addEventListener('mouseenter', function() {
        this.style.animationPlayState = 'paused';
        document.querySelectorAll('.wheel, .arrow').forEach(el => {
            el.style.animationPlayState = 'paused';
        });
    });
    
    scrollDown.addEventListener('mouseleave', function() {
        this.style.animationPlayState = 'running';
        document.querySelectorAll('.wheel, .arrow').forEach(el => {
            el.style.animationPlayState = 'running';
        });
    });
});
document.addEventListener('DOMContentLoaded', function() {
    const backTopButton = document.getElementById('back-top');
    
    // Show/hide button based on scroll position
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backTopButton.classList.add('active');
        } else {
            backTopButton.classList.remove('active');
        }
    });
    
    // Smooth scroll to top when clicked
    backTopButton.addEventListener('click', function(e) {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        
        // Add a temporary animation class
        this.classList.add('clicked');
        setTimeout(() => {
            this.classList.remove('clicked');
        }, 300);
    });
    
    // Add a subtle floating animation when visible
    function floatAnimation() {
        if (backTopButton.classList.contains('active')) {
            backTopButton.style.transform = 'translateY(-5px)';
            setTimeout(() => {
                backTopButton.style.transform = 'translateY(0)';
            }, 1000);
        }
    }
    
    // Run the floating animation every 3 seconds when button is visible
    setInterval(floatAnimation, 2000);
});
document.addEventListener('DOMContentLoaded', function() {
    const loader = document.querySelector('.modern-loader');
    const progressBar = document.querySelector('.progress-bar');
    const progressText = document.querySelector('.progress-text');
    const loadingMessages = [
        "Loading...",
        "Loading...",
        "Loading...",
        "Loading...",
        "Loading..."
    ];
    
    // Configuration
    const MIN_SHOW_TIME = 1500; // Minimum 1.5 seconds display
    const startTime = Date.now();
    let currentMessage = 0;
    let isContentLoaded = false;
    let fakeProgress = 0;
    let realProgress = 0;
    
    // 1. Start fake progress animation (visual feedback)
    const fakeProgressInterval = setInterval(() => {
        if (fakeProgress < 80) {
            fakeProgress += Math.random() * 5;
            updateProgressBar();
        }
    }, 50);
    
    // 2. Track real loading progress
    window.addEventListener('load', () => {
        realProgress = 100;
        isContentLoaded = true;
        checkCompletion();
    });
    
    // 3. Animate skill badges
    const badges = document.querySelectorAll('.badge');
    badges.forEach((badge, index) => {
        badge.style.animationDelay = `${index * 0.3 + 0.5}s`;
    });
    
    function updateProgressBar() {
        // Use whichever progress is higher (fake or real)
        const displayProgress = Math.max(fakeProgress, realProgress);
        progressBar.style.width = `${displayProgress}%`;
        
        // Update messages
        if (displayProgress > 20 && currentMessage === 0) updateMessage();
        if (displayProgress > 45 && currentMessage === 1) updateMessage();
        if (displayProgress > 70 && currentMessage === 2) updateMessage();
        if (displayProgress > 90 && currentMessage === 3) updateMessage();
    }
    
    function updateMessage() {
        currentMessage++;
        progressText.style.opacity = 0;
        setTimeout(() => {
            progressText.textContent = loadingMessages[currentMessage];
            progressText.style.opacity = 1;
        }, 300);
    }
    
    function checkCompletion() {
        const elapsed = Date.now() - startTime;
        const isMinTimeElapsed = elapsed >= MIN_SHOW_TIME;
        
        if (isContentLoaded && isMinTimeElapsed) {
            clearInterval(fakeProgressInterval);
            completeLoading();
        } else if (isContentLoaded) {
            // Content loaded but min time not elapsed - wait
            setTimeout(completeLoading, MIN_SHOW_TIME - elapsed);
        }
    }
    
    function completeLoading() {
        // Final animation to 100%
        fakeProgress = 100;
        updateProgressBar();
        progressText.textContent = loadingMessages[4];
        
        setTimeout(() => {
            loader.classList.add('hidden');
            loader.addEventListener('transitionend', () => loader.remove());
        }, 800);
    }
    
    // Fallback - if load event doesn't fire
    setTimeout(checkCompletion, 5000);
});
// Mobile Menu Toggle
function toggleMobileMenu() {
    const hamburger = document.getElementById('hamburger-icon');
    const mobileMenu = document.getElementById('mobileMenu');
    
    hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    
    // Toggle body scroll
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
}

document.getElementById('hamburger-icon').addEventListener('click', toggleMobileMenu);

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
            
            // Close mobile menu if open
            const mobileMenu = document.getElementById('mobileMenu');
            if (mobileMenu.classList.contains('active')) {
                toggleMobileMenu();
            }
        }
    });
});

// Active link highlighting
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Typing animation
const roles = ["Frontend Developer", "Backend Developer", "UI/UX Designer", "Web Designer"];
let roleIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typingSpeed = 100;

function type() {
    const roleElement = document.getElementById('role');
    const currentRole = roles[roleIndex];
    
    if (isDeleting) {
        roleElement.textContent = currentRole.substring(0, charIndex - 1);
        charIndex--;
        typingSpeed = 50;
    } else {
        roleElement.textContent = currentRole.substring(0, charIndex + 1);
        charIndex++;
        typingSpeed = 100;
    }
    
    if (!isDeleting && charIndex === currentRole.length) {
        isDeleting = true;
        typingSpeed = 1500; // Pause at end of word
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        typingSpeed = 500; // Pause before typing next word
    }
    
    setTimeout(type, typingSpeed);
}

// Start typing animation
setTimeout(type, 1000);

// Header scroll effect
window.addEventListener('scroll', function() {
    const header = document.getElementById('header');
    if (window.scrollY > 100) {
        header.style.padding = '10px 0';
        header.style.background = 'rgba(15, 15, 26, 0.95)';
    } else {
        header.style.padding = '20px 0';
        header.style.background = 'rgba(15, 15, 26, 0.9)';
    }
});

// Initialize particles.js if you're using it
document.addEventListener('DOMContentLoaded', function() {
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            "particles": {
                "number": {
                    "value": 80,
                    "density": {
                        "enable": true,
                        "value_area": 800
                    }
                },
                "color": {
                    "value": "#00ff88"
                },
                "shape": {
                    "type": "circle",
                    "stroke": {
                        "width": 0,
                        "color": "#000000"
                    },
                    "polygon": {
                        "nb_sides": 5
                    }
                },
                "opacity": {
                    "value": 0.3,
                    "random": false,
                    "anim": {
                        "enable": false,
                        "speed": 1,
                        "opacity_min": 0.1,
                        "sync": false
                    }
                },
                "size": {
                    "value": 3,
                    "random": true,
                    "anim": {
                        "enable": false,
                        "speed": 40,
                        "size_min": 0.1,
                        "sync": false
                    }
                },
                "line_linked": {
                    "enable": true,
                    "distance": 150,
                    "color": "#00ff88",
                    "opacity": 0.2,
                    "width": 1
                },
                "move": {
                    "enable": true,
                    "speed": 2,
                    "direction": "none",
                    "random": false,
                    "straight": false,
                    "out_mode": "out",
                    "bounce": false,
                    "attract": {
                        "enable": false,
                        "rotateX": 600,
                        "rotateY": 1200
                    }
                }
            },
            "interactivity": {
                "detect_on": "canvas",
                "events": {
                    "onhover": {
                        "enable": true,
                        "mode": "grab"
                    },
                    "onclick": {
                        "enable": true,
                        "mode": "push"
                    },
                    "resize": true
                },
                "modes": {
                    "grab": {
                        "distance": 140,
                        "line_linked": {
                            "opacity": 1
                        }
                    },
                    "bubble": {
                        "distance": 400,
                        "size": 40,
                        "duration": 2,
                        "opacity": 8,
                        "speed": 3
                    },
                    "repulse": {
                        "distance": 200,
                        "duration": 0.4
                    },
                    "push": {
                        "particles_nb": 4
                    },
                    "remove": {
                        "particles_nb": 2
                    }
                }
            },
            "retina_detect": true
        });
    }
});

// Hover effect for tech icons
document.querySelectorAll('.tech-icon').forEach(icon => {
    icon.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.5)';
        this.style.opacity = '0.8';
    });
    
    icon.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
        this.style.opacity = '0.2';
    });
});

// Pulse animation for CTA button
const ctaButton = document.querySelector('.cta-button');
if (ctaButton) {
    setInterval(() => {
        ctaButton.classList.toggle('pulse-animation');
    }, 6000);
}
// Gallery functionality
document.addEventListener('DOMContentLoaded', function() {
    // Gallery variables
    const galleryTrack = document.querySelector('.gallery-track');
    const slides = document.querySelectorAll('.gallery-slide');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.gallery-nav.prev');
    const nextBtn = document.querySelector('.gallery-nav.next');
    let currentIndex = 0;
    const slideCount = slides.length;
    
    // Initialize gallery
    function initGallery() {
        slides[currentIndex].classList.add('active');
        dots[currentIndex].classList.add('active');
        
        // Auto-rotate slides every 5 seconds
        setInterval(() => {
            goToNextSlide();
        }, 5000);
    }
    
    // Update gallery display
    function updateGallery() {
        galleryTrack.style.transform = `translateX(-${currentIndex * 100}%)`;
        
        // Update active classes
        slides.forEach((slide, index) => {
            slide.classList.toggle('active', index === currentIndex);
        });
        
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    }
    
    // Go to specific slide
    function goToSlide(index) {
        currentIndex = (index + slideCount) % slideCount;
        updateGallery();
    }
    
    // Go to next slide
    function goToNextSlide() {
        goToSlide(currentIndex + 1);
    }
    
    // Go to previous slide
    function goToPrevSlide() {
        goToSlide(currentIndex - 1);
    }
    
    // Event listeners
    prevBtn.addEventListener('click', goToPrevSlide);
    nextBtn.addEventListener('click', goToNextSlide);
    
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => goToSlide(index));
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') {
            goToPrevSlide();
        } else if (e.key === 'ArrowRight') {
            goToNextSlide();
        }
    });
    
    // Initialize the gallery
    initGallery();
    
 // See more button functionality
const seeMoreBtn = document.querySelector('.see-more-btn');
const fullContent = document.querySelector('.full-content');
const btnText = document.querySelector('.btn-text');

// Set default state: content is hidden, button says "See More"
fullContent.style.display = 'none';
btnText.textContent = 'See More';
seeMoreBtn.classList.remove('active');

seeMoreBtn.addEventListener('click', function () {
    const isVisible = fullContent.style.display === 'block';

    if (isVisible) {
        // Hide content
        fullContent.style.display = 'none';
        btnText.textContent = 'See More';
        seeMoreBtn.classList.remove('active');
    } else {
        // Show content
        fullContent.style.display = 'block';
        btnText.textContent = 'Show Less';
        seeMoreBtn.classList.add('active');
        fullContent.style.animation = 'fadeIn 0.5s ease forwards'; // Optional fade effect
    }
});


    
    // Resume button functionality
    const resumeButton = document.getElementById('resumeButton');
    const resumeLink = document.getElementById('resumeLink');
    
    if (resumeButton) {
        resumeButton.addEventListener('click', function() {
            resumeLink.click();
        });
    }
});

// Animation for elements when they come into view
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
        }
    });
}, {
    threshold: 0.1
});

document.querySelectorAll('.about-section .intro-paragraph, .about-section .perseverance-paragraph, .gallery-container').forEach(el => {
    observer.observe(el);
});
document.addEventListener('DOMContentLoaded', function() {
    // ========== Portfolio Filter Functionality ==========
    const filterButtons = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Animate button press
            this.classList.add('button-press');
            setTimeout(() => this.classList.remove('button-press'), 200);
            
            // Update active button with smooth transition
            filterButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.style.transform = 'scale(0.95)';
                setTimeout(() => btn.style.transform = 'scale(1)', 150);
            });
            this.classList.add('active');
            
            const filterValue = this.getAttribute('data-filter');
            let visibleItems = 0;
            
            // Animate portfolio items
            portfolioItems.forEach((item, index) => {
                if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                    item.style.display = 'block';
                    item.style.animation = `fadeInUp 0.6s ease ${index * 0.1}s forwards`;
                    visibleItems++;
                } else {
                    item.style.animation = 'fadeOut 0.4s ease forwards';
                    setTimeout(() => item.style.display = 'none', 400);
                }
            });
            
            // Show message if no items match filter
            const noItemsMessage = document.querySelector('.no-items-message');
            if (visibleItems === 0 && noItemsMessage) {
                noItemsMessage.style.display = 'block';
                noItemsMessage.style.animation = 'fadeInUp 0.6s ease forwards';
            } else if (noItemsMessage) {
                noItemsMessage.style.display = 'none';
            }
        });
    });

    // ========== Portfolio Item Interactions ==========
    portfolioItems.forEach(item => {
        // 3D Tilt Effect
        item.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const xAxis = (centerX - x) / 15;
            const yAxis = (centerY - y) / 15;
            
            this.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
            this.querySelector('.portfolio-overlay').style.transform = `translateZ(30px)`;
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'rotateY(0deg) rotateX(0deg)';
            this.querySelector('.portfolio-overlay').style.transform = 'translateZ(0)';
        });
        
        // Click animation
        item.addEventListener('click', function() {
            this.classList.add('item-click');
            setTimeout(() => this.classList.remove('item-click'), 300);
        });
    });

    // ========== View More Button ==========
    const viewMoreBtn = document.querySelector('.view-more-btn');
    if (viewMoreBtn) {
        viewMoreBtn.addEventListener('click', function() {
            this.classList.add('loading');
            this.innerHTML = '<span class="loader-dots"><span></span><span></span><span></span></span>';
            
            // Simulate loading more items
            setTimeout(() => {
                this.classList.remove('loading');
                this.textContent = 'View More';
                
                // In a real implementation, you would load and append new items here
                // For demo purposes, we'll just show a message
                const newItemsMsg = document.createElement('div');
                newItemsMsg.className = 'new-items-message';
                newItemsMsg.textContent = 'New portfolio items would load here in a real implementation';
                this.parentNode.insertBefore(newItemsMsg, this);
                
                setTimeout(() => newItemsMsg.remove(), 3000);
            }, 1500);
        });
    }

    // ========== Progress Bars Animation ==========
    const progressBars = document.querySelectorAll('.progress-bar');
    const animateProgressBars = () => {
        progressBars.forEach(bar => {
            const width = bar.getAttribute('data-width');
            const duration = Math.min(parseInt(width) * 10, 1500); // Dynamic duration based on width
            bar.style.transition = `width ${duration}ms ease-out`;
            bar.style.width = width;
        });
    };
    
    const skillsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateProgressBars();
                skillsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    
    document.querySelectorAll('.skills-section').forEach(section => {
        skillsObserver.observe(section);
    });

    // ========== Skill Cards Interactions ==========
    const skillCards = document.querySelectorAll('.skill-card');
    skillCards.forEach(card => {
        card.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const xAxis = (centerX - x) / 20;
            const yAxis = (centerY - y) / 20;
            
            this.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg) translateZ(10px)`;
            this.style.boxShadow = `${-xAxis * 2}px ${yAxis * 2}px 20px rgba(0,0,0,0.2)`;
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'rotateY(0deg) rotateX(0deg) translateZ(0)';
            this.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
        });
    });
});
document.addEventListener('DOMContentLoaded', function() {
    // Feature 1: Flip Contact Card
    const contactCard = document.querySelector('.contact-card');
    const flipButtons = document.querySelectorAll('.flip-btn');
    
    flipButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            contactCard.classList.toggle('flipped');
        });
    });

    // Feature 2: Form Submission with Enhanced UI
    const contactForm = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    const formMessage = document.getElementById('form-message');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Show loading state
            submitBtn.disabled = true;
            btnText.style.display = 'none';
            btnLoader.style.display = 'flex';
            
            // Simulate form submission (replace with actual AJAX call)
            setTimeout(() => {
                // Show success message
                formMessage.textContent = "Message sent successfully! I'll get back to you soon. Galatoomaa!";
                formMessage.classList.add('success');
                
                // Reset form
                contactForm.reset();
                
                // Reset button state
                setTimeout(() => {
                    submitBtn.disabled = false;
                    btnText.style.display = 'block';
                    btnLoader.style.display = 'none';
                    formMessage.classList.remove('success');
                }, 3000);
                
                // Feature 5: Trigger confetti celebration
                triggerConfetti();
            }, 2000);
        });
    }
    // Feature 3: Animated Loader
    const modernLoader = document.querySelector('.modern-loader');
    const progressBar = document.querySelector('.modern-loader .progress-bar');
    
    if (modernLoader) {
        let progress = 0;
        const loaderInterval = setInterval(() => {
            progress += Math.floor(Math.random() * 5) + 1;
            if (progress >= 100) {
                progress = 100;
                clearInterval(loaderInterval);
                
                // Hide loader
                setTimeout(() => {
                    modernLoader.style.opacity = '0';
                    setTimeout(() => {
                        modernLoader.style.display = 'none';
                    }, 500);
                }, 500);
            }
            progressBar.style.width = `${progress}%`;
        }, 50);
    }

    // Feature 4: Current Year in Footer
    document.getElementById('current-year').textContent = new Date().getFullYear();

    // Feature 5: Confetti Celebration
    function triggerConfetti() {
        const confettiContainer = document.querySelector('.confetti-container');
        confettiContainer.innerHTML = '';
        confettiContainer.style.display = 'block';
        
        // Create confetti particles
        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.classList.add('confetti');
            
            // Random properties
            const size = Math.random() * 10 + 5;
            const color = `hsl(${Math.random() * 360}, 100%, 50%)`;
            const left = Math.random() * 100;
            const animationDuration = Math.random() * 3 + 2;
            const delay = Math.random() * 5;
            
            confetti.style.width = `${size}px`;
            confetti.style.height = `${size}px`;
            confetti.style.background = color;
            confetti.style.left = `${left}%`;
            confetti.style.animationDuration = `${animationDuration}s`;
            confetti.style.animationDelay = `${delay}s`;
            
            confettiContainer.appendChild(confetti);
        }
        
        // Hide after animation
        setTimeout(() => {
            confettiContainer.style.display = 'none';
        }, 5000);
    }

    // Floating label effect for form inputs
    const floatingInputs = document.querySelectorAll('.form-group.floating input, .form-group.floating textarea');
    
    floatingInputs.forEach(input => {
        // Check if input has value on page load
        if (input.value) {
            input.previousElementSibling.style.top = '-0.5rem';
            input.previousElementSibling.style.fontSize = '0.8rem';
            input.previousElementSibling.style.color = '#4361ee';
        }
        
        input.addEventListener('focus', function() {
            this.previousElementSibling.style.top = '-0.5rem';
            this.previousElementSibling.style.fontSize = '0.8rem';
            this.previousElementSibling.style.color = '#4361ee';
        });
        
        input.addEventListener('blur', function() {
            if (!this.value) {
                this.previousElementSibling.style.top = '1rem';
                this.previousElementSibling.style.fontSize = '1rem';
                this.previousElementSibling.style.color = 'rgba(255,255,255,0.7)';
            }
        });
    });
});

