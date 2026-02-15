// Grid Landing Page Interactivity

document.addEventListener('DOMContentLoaded', () => {

    // 1. Reveal Animations on Scroll
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, observerOptions);

    document.querySelectorAll('[data-reveal]').forEach(el => {
        revealObserver.observe(el);
    });

    // 2. Navbar Scroll Effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.boxShadow = '0 10px 30px rgba(0,0,0,0.05)';
            navbar.style.height = '80px';
        } else {
            navbar.style.boxShadow = 'none';
            navbar.style.height = '90px';
        }
    });

    // 3. Ticker Duplication for Seamless Loop
    const tickerTrack = document.querySelector('.ticker-track');
    if (tickerTrack) {
        const items = Array.from(tickerTrack.children);
        items.forEach(item => {
            const clone = item.cloneNode(true);
            tickerTrack.appendChild(clone);
        });
    }

    // 4. Smooth Privacy Toggles Animation
    const toggles = document.querySelectorAll('.toggle');
    toggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            toggle.classList.toggle('active');
        });
    });

    // 5. Form Submission Logic
    const waitlistForm = document.getElementById('waitlistForm');
    if (waitlistForm) {
        waitlistForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = waitlistForm.querySelector('input');
            const button = waitlistForm.querySelector('button');

            button.innerText = 'Added to List!';
            button.style.backgroundColor = '#16A34A';
            input.value = '';
            input.disabled = true;
            button.disabled = true;
        });
    }

    // 6. Subtle Parallax for Hero Image
    window.addEventListener('mousemove', (e) => {
        const heroVisual = document.querySelector('.hero-visual');
        if (heroVisual && window.innerWidth > 992) {
            const moveX = (e.clientX - window.innerWidth / 2) / 50;
            const moveY = (e.clientY - window.innerHeight / 2) / 50;
            heroVisual.style.transform = `translate(${moveX}px, ${moveY}px)`;
        }
    });

});
