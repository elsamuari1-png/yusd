// rajwan.js — من أجل التعامل مع زر الرجوع في وضع الهاتف
(function () {
  // نعتبر وضع الهاتف عندما يكون العرض <= 768px (وفقاً لتصميم الموبايل)
  const mq = window.matchMedia('(max-width: 768px)');
  const isMobile = () => mq.matches;

  function setupMobileBackHandler() {
    // نُضيف حالة للتاريخ حتى لا يخرج مباشرةً عند أول ضغطه
    try {
      history.pushState({ rajwan: true }, '', location.href);
    } catch (e) {
      // تجاهل أي أخطاء غير متوقعة
    }

    window.addEventListener('popstate', function onPopstate() {
      if (isMobile()) {
        // إعادة التوجيه إلى صفحة الأدوات الحرة عند الضغط على الرجوع في الموبايل
        location.href = '../free-tools.html';
      } else {
        // في حال لم يعد موبايل، نسمح بالرجوع الطبيعي خطوة أخرى
        window.removeEventListener('popstate', onPopstate);
        history.back();
      }
    });
  }

  // تفعيل عند التحميل إذا كنا في وضع الهاتف
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (isMobile()) setupMobileBackHandler();
    });
  } else {
    if (isMobile()) setupMobileBackHandler();
  }

  // لو تغيرت حالة الميديا (تكبير/تصغير)، لا نحتاج لفعل شيء إضافي هنا
})();
