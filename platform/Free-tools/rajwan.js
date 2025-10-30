(function() {
    'use strict';

    /* ===== روابط الموقع ===== */
    const linksMap = {
        htmlCourse:   './HTML-course/HTML-course.html',
        cssCourse:    './CSS course/CSS-course.html',
        pentestBot:   'https://t.me/D_J_M_G_BOT?start=1591575436',
        aiModels:     './ai-models/index.html',
        telegramChannel: 'https://t.me/BO2LPP'
    };

    /* ===== دالة فتح الرابط عند النقر ===== */
    function handleDynamicLinks() {
        document.addEventListener('click', function (e) {
            const key = e.target.closest('[data-link-key]')?.dataset.linkKey;
            if (key && linksMap[key]) {
                const url = linksMap[key];
                if (url.startsWith('http')) {
                    window.open(url, '_blank', 'noopener,noreferrer');
                } else {
                    location.href = url;
                }
            }
        });
    }

    /* ===== دالة للكشف عن الجوال ===== */
    function isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               window.innerWidth <= 768;
    }

    /* ===== معالج زر الرجوع للجوال ===== */
    function handleBackButton() {
        if (isMobileDevice()) {
            history.pushState(null, null, location.href);
            window.addEventListener('popstate', function () {
                window.location.href = '../dashboard.html';
            });
        }
    }

    /* ===== تهيئة عند تحميل الصفحة ===== */
    function init() {
        handleDynamicLinks();
        handleBackButton();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
