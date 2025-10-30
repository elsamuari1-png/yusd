document.addEventListener('DOMContentLoaded', () => {

    // 3D Tilt Effect for Desktop
    if (window.innerWidth > 768) {
        const tiltCards = document.querySelectorAll('[data-tilt]');
        tiltCards.forEach(card => {
            const maxTilt = 15;
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -maxTilt;
                const rotateY = ((x - centerX) / centerX) * maxTilt;
                card.style.transition = 'transform 0.1s ease-out';
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            });
            card.addEventListener('mouseleave', () => {
                card.style.transition = 'transform 0.5s ease-in-out';
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
            });
        });
    }

    // Sidebar Logic
    const sidebar = document.getElementById('sidebar');
    const closeBtn = document.getElementById('close-btn');
    const desktopMenuToggle = document.getElementById('menu-toggle');
    const mobileMenuToggle = document.getElementById('menu-btn-bottom');

    function openSidebar() { if (sidebar) sidebar.classList.add('open'); }
    function closeSidebar() { if (sidebar) sidebar.classList.remove('open'); }

    if (desktopMenuToggle) desktopMenuToggle.addEventListener('click', openSidebar);
    if (mobileMenuToggle) mobileMenuToggle.addEventListener('click', openSidebar);
    if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
    
    document.addEventListener('click', e => {
        const targetElement = e.target;
        if (sidebar && !sidebar.contains(targetElement) && 
            desktopMenuToggle && !desktopMenuToggle.contains(targetElement) && 
            mobileMenuToggle && !mobileMenuToggle.contains(targetElement) && 
            sidebar.classList.contains('open')) {
            closeSidebar();
        }
    });

    // Mobile Accordion Logic
    const accordionHeaders = document.querySelectorAll('[data-toggle="accordion"]');
    if (accordionHeaders.length > 0) {
        accordionHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const activeCard = document.querySelector('.accordion-card.active');
                const clickedCard = header.parentElement;

                if (activeCard && activeCard !== clickedCard) {
                    activeCard.classList.remove('active');
                }
                clickedCard.classList.toggle('active');
            });
        });
    }

    // Simple Routing Logic
    const ROUTES = {
        profile: "./Profile/page2.html",
        whatsapp: "https://www.whatsapp.com/channel/0029Vb9XPVBGehEPBcULkf24",
        telegram: "https://t.me/BO2LPP",
        contact: "https://t.me/D_R_G_7_BOT",
        subscription: "../registration/subscription.html",
        "free-tools": "./Free-tools/free-tools.html",
        conversation: "../chat/conversation.html",
        shop: "./Offers/products.html",
        upload: "./products/upload.html",
        youtube: "Educational_Videos/YouTube.html"
    };
	
    document.addEventListener('click', e => {
        const targetElement = e.target.closest("[data-route]");
        if (!targetElement) return;
        e.preventDefault();
        const key = targetElement.dataset.route;
        const url = ROUTES[key];
        if (url) {
            if (url.startsWith('http')) { window.open(url, '_blank'); } 
            else { window.location.href = url; }
        } else { console.warn(`Route "${key}" not found.`); }
    });
    
    // Features Modal Logic
    const featuresBtn = document.getElementById('features-btn');
    const modal = document.getElementById('features-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');

    const openModal = () => {
        if (modal) {
            modal.classList.add('visible');
            closeSidebar(); // Close sidebar when modal opens
        }
    };

    const closeModal = () => {
        if (modal) modal.classList.remove('visible');
    };

    if (featuresBtn) featuresBtn.addEventListener('click', openModal);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    // Scroll Animation Logic for both Desktop and Mobile (Repeating)
    const elementsToObserve = document.querySelectorAll('.section-card, .accordion-card');
    
    const elementObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // When element enters viewport, add 'visible' class
                entry.target.classList.add('visible');
            } else {
                // When element leaves viewport, remove 'visible' class to reset animation
                entry.target.classList.remove('visible');
            }
        });
    }, {
        threshold: 0.1
    });

    elementsToObserve.forEach(el => {
        elementObserver.observe(el);
    });


    // Matrix Background Effect
    const canvas = document.getElementById('matrix');
    const ctx = canvas?.getContext('2d');

    function setCanvasSize() { if (!canvas) return; canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    if (canvas) { setCanvasSize(); window.addEventListener('resize', setCanvasSize); }
    
    const matrixChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*";
    const charArray = matrixChars.split("");
    const fontSize = 15;
    const columns = canvas ? Math.floor(canvas.width / fontSize) : 0;
    const drops = Array(columns).fill(1);
    
    function drawMatrix() {
        if (!ctx) return;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
        ctx.font = fontSize + 'px monospace';
        for (let i = 0; i < drops.length; i++) {
            const text = charArray[Math.floor(Math.random() * charArray.length)];
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);
            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }

    let matrixInterval;
    if (canvas) { matrixInterval = setInterval(drawMatrix, 80); }

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) { if (matrixInterval) clearInterval(matrixInterval); } 
        else { if(canvas) { matrixInterval = setInterval(drawMatrix, 80); } }
    });
    
    // Hover Sound Effect
    const hoverSound = document.getElementById('hover-sound');
    if (hoverSound && window.innerWidth > 768) {
        document.querySelectorAll('.section-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                try {
                    hoverSound.currentTime = 0;
                    hoverSound.play();
                } catch (e) { console.error("Error playing sound:", e); }
            });
        });
    }
});