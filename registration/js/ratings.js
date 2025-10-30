/* ===== بيانات كل كورس ===== */
const coursesData = {
  html5: {
    title: "💻 HTML5",
    lectures: 30,
    hours: 48,
    price: 25,
    platform: "NITROS TECH"
  },
  css: {
    title: "🎨 CSS",
    lectures: 25,
    hours: 40,
    price: 25,
    platform: "NITROS TECH"
  },
  js: {
    title: "⚡️ JavaScript",
    lectures: 40,
    hours: 60,
    price: 40,
    platform: "NITROS TECH"
  },
  java: {
    title: "☕️ Java",
    lectures: 50,
    hours: 70,
    price: 50,
    platform: "NITROS TECH"
  },
  ruby: {
    title: "💎 Ruby",
    lectures: 20,
    hours: 35,
    price: 35,
    platform: "NITROS TECH"
  },
  julia: {
    title: "🌀 Julia",
    lectures: 18,
    hours: 30,
    price: 39,
    platform: "NITROS TECH"
  },
  cpp: {
    title: "〽️ C++",
    lectures: 35,
    hours: 55,
    price: 60,
    platform: "NITROS TECH"
  },
  php: {
    title: "🐘 PHP",
    lectures: 28,
    hours: 42,
    price: 69,
    platform: "NITROS TECH"
  }
};

/* ===== إنشاء Dialog ===== */
function showDialog(course) {
  const data = coursesData[course];

  /* Overlay */
  const overlay = document.createElement('div');
  overlay.className = 'dialog-overlay';

  /* الـ Box */
  const box = document.createElement('div');
  box.className = 'dialog-box';
  box.innerHTML = `
    <button class="close-btn">&times;</button>
    <h3>${data.title}</h3>
    <p><strong>عدد الحلقات:</strong> ${data.lectures}</p>
    <p><strong>عدد الساعات:</strong> ${data.hours}</p>
    <p><strong>سعر القرص:</strong> ${data.price} دولار</p>
    <p><strong>مقدم من:</strong> ${data.platform}</p>

    <!-- زر الشراء -->
    <button class="buy-btn">شراء</button>
  `;

  overlay.appendChild(box);
  document.body.appendChild(overlay);

  /* إغلاق الـ Dialog */
  const close = () => document.body.removeChild(overlay);
  overlay.querySelector('.close-btn').addEventListener('click', close);
  overlay.addEventListener('click', e => e.target === overlay && close());

  /* زر الشراء – يفتح رابط الدفع مباشرة */
  box.querySelector('.buy-btn').addEventListener('click', () => {
    window.open('https://t.me/D_R_G_7_BOT/checkout', '_blank');
    close(); // يغلق الـ Dialog بعد الضغط
  });
}

/* ===== ربط الأزراب بالـ Dialog ===== */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.card[data-course] button.btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.closest('.card').dataset.course;
      showDialog(key);
    });
  });
});