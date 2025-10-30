/* ====== بيانات كل كورس ====== */
const coursesData = {
  html5: {
    title: "💻 HTML5",
    lectures: 30,
    hours: 48,
    price: 25,
    platform: "NITROS TECH",
    link: 'https://t.me/D_R_G_7_BOT/checkout'
  },
  css: {
    title: "🎨 CSS",
    lectures: 25,
    hours: 40,
    price: 25,
    platform: "NITROS TECH",
    link: 'https://t.me/D_R_G_7_BOT/checkout'
  },
  js: {
    title: "⚡️ JavaScript",
    lectures: 40,
    hours: 60,
    price: 40,
    platform: "NITROS TECH",
    link: 'https://t.me/D_R_G_7_BOT/checkout'
  },
  java: {
    title: "☕️ Java",
    lectures: 50,
    hours: 70,
    price: 50,
    platform: "NITROS TECH",
    link: 'https://t.me/D_R_G_7_BOT/checkout'
  },
  ruby: {
    title: "💎 Ruby",
    lectures: 20,
    hours: 35,
    price: 35,
    platform: "NITROS TECH",
    link: 'https://t.me/D_R_G_7_BOT/checkout'
  },
  julia: {
    title: "🌀 Julia",
    lectures: 18,
    hours: 30,
    price: 39,
    platform: "NITROS TECH",
    link: 'https://t.me/D_R_G_7_BOT/checkout'
  },
  cpp: {
    title: "〽️ C++",
    lectures: 35,
    hours: 55,
    price: 60,
    platform: "NITROS TECH",
    link: 'https://t.me/D_R_G_7_BOT/checkout'
  },
  php: {
    title: "🐘 PHP",
    lectures: 28,
    hours: 42,
    price: 69,
    platform: "NITROS TECH",
    link: 'https://t.me/D_R_G_7_BOT/checkout'
  },
  'mobile-hack': {
    title: "مقدمة في أدوات التجسس",
    description: "تعلم أساسيات الأمان الرقمي",
    price: 20,
    link: 'https://t.me/D_R_G_7_BOT/checkout',
    rating: 4
  },
  cyber: {
    title: "الاختراق الأخلاقي للمبتدئين",
    description: "تعلم حماية الأنظمة والشبكات",
    price: 150,
    link: 'https://t.me/D_R_G_7_BOT/checkout',
    rating: 5
  }
};

/* ====== إنشاء Dialog (Popup) ====== */
function showDialog(courseKey) {
  const data = coursesData[courseKey];
  if (!data) return;

  const overlay = document.createElement('div');
  overlay.className = 'dialog-overlay';

  const box = document.createElement('div');
  box.className = 'dialog-box';
  box.innerHTML = `
    <button class="close-btn">&times;</button>
    <h3>${data.title}</h3>
    <p><strong>السعر:</strong> ${data.price} دولار</p>
    ${data.lectures ? `<p><strong>عدد الحلقات:</strong> ${data.lectures}</p>` : ''}
    ${data.hours ? `<p><strong>عدد الساعات:</strong> ${data.hours}</p>` : ''}
    ${data.platform ? `<p><strong>مقدم من:</strong> ${data.platform}</p>` : ''}
    <button class="buy-btn">شراء</button>
  `;

  overlay.appendChild(box);
  document.body.appendChild(overlay);

  const close = () => document.body.removeChild(overlay);
  overlay.querySelector('.close-btn').addEventListener('click', close);
  overlay.addEventListener('click', e => e.target === overlay && close());

  box.querySelector('.buy-btn').addEventListener('click', () => {
    window.open(data.link, '_blank');
    close();
  });
}

/* ====== ربط الأزرار بـ Dialog وتحديد النجوم ====== */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.show-dialog-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const courseKey = btn.closest('.card').dataset.course;
      showDialog(courseKey);
    });
  });

  // تحديد النجوم بناءً على البيانات
  document.querySelectorAll('.card[data-course]').forEach(card => {
    const courseKey = card.dataset.course;
    const data = coursesData[courseKey];
    if (data && data.rating) {
      const ratingContainer = card.querySelector('.rating');
      if (ratingContainer) {
        ratingContainer.querySelectorAll('.star').forEach((star, index) => {
          if (index < data.rating) {
            star.classList.add('active');
          } else {
            star.classList.remove('active');
          }
        });
      }
    }
  });

  /* ====== إضافة الشعار والاسم إلى القائمة الجانبية بواسطة JavaScript ====== */
  const sidebarHeader = document.querySelector('.sidebar-header');
  if (sidebarHeader) {
    const logoImg = document.createElement('img');
    logoImg.src = 'https://iili.io/FXSkHuI.md.jpg';
    logoImg.alt = 'NITROS TECH Logo';
    logoImg.classList.add('logo-sidebar');
    sidebarHeader.appendChild(logoImg);

    const nameHeading = document.createElement('h3');
    nameHeading.textContent = 'NITROS TECH';
    sidebarHeader.appendChild(nameHeading);
  }

  /* ====== إعادة تشغيل أنيميشن الروابط عند فتح القائمة ====== */
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.querySelectorAll('nav a');

  navToggle.addEventListener('change', () => {
    if (navToggle.checked) {
      navLinks.forEach(link => {
        link.style.animation = 'none';
        void link.offsetWidth;
        link.style.animation = '';
      });
    }
  });
});