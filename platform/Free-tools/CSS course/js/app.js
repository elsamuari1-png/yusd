// روابط الحلقات الـ 22 (مستخرجة يدوياً من الـ playlist)
const videos = [
  { id: 'PLm2HSnb0PI', title: '1 – مقدمة عن CSS' },
  { id: '6zp1lpaDqec', title: '2 – أماكن كتابة CSS' },
  { id: 'Wvj0qziwF3g', title: '3 – البنية والـ Syntax' },
  { id: 'MEtsuQjCXfY', title: '4 – Selectors الأساسية' },
  { id: '_pcpxd50UFg', title: '5 – Colors & Background' },
  { id: 'gWWtU051srA', title: '6 – Fonts & Text' },
  { id: 'A5aYhM_JywI?si', title: '7 – Box Model' },
  { id: '_DKqByC-gkk', title: '8 – Box-Sizing' },
  { id: '0W8Rgs_eT5o', title: '9 – مستويات Display' },
  { id: 'HPz5-iB6CHc', title: '10 – Position' },
  { id: '5tej3x8wQBQ', title: '11 – Flexbox الجزء 1' },
  { id: 'pBoyjKHUIes', title: '12 – Flexbox الجزء 2' },
  { id: 'RkNLiSrTmpg', title: '13 – Grid الجزء 1' },
  { id: '57uPJOHg-YE?si', title: '14 – Grid الجزء 2' },
  { id: 'X749JnFumIA', title: '15 – Responsive Design' },
  { id: 'BcgWtMw9Iqo', title: '16 – Media Queries' },
  { id: 'IAZ8GuwActQ', title: '17 – Animations' },
  { id: 'wZWp6uHnhPU', title: '18 – Transitions' },
  { id: 'tyII2YBUAHA', title: '19 – Transform' },
  { id: 'xOl-By4AuxE?si', title: '20 – CSS Variables' },
  { id: 'qLs8QH3gYU8', title: '21 – مشروع FontAwesome' },
  { id: '-KWU-aTlgng', title: '22 – مشروع متجر مصغر' }
];

const toc = document.getElementById('toc');
const episodes = document.getElementById('episodes');

let activeBtn = null;

// بناء قائمة التصفح
videos.forEach((v, idx) => {
  const btn = document.createElement('button');
  btn.textContent = idx + 1;
  btn.dataset.index = idx;
  btn.onclick = () => showEpisode(idx);
  toc.appendChild(btn);
});

function showEpisode(idx) {
  // تنشيط الزر
  if (activeBtn) activeBtn.classList.remove('active');
  activeBtn = toc.children[idx];
  activeBtn.classList.add('active');

  // عرض الحلقة
  episodes.innerHTML = `
    <section class="episode">
      <h2>${videos[idx].title}</h2>
      <div class="iframe-wrapper">
        <iframe
          src="https://www.youtube.com/embed/${videos[idx].id}?rel=0"
          allowfullscreen>
        </iframe>
      </div>
    </section>
  `;
}

// عرض الحلقة الأولى عند التحميل
showEpisode(0);

// ===== Mobile Modal logic: show on every page load =====
(function initCourseModal() {
  const modal = document.getElementById('courseModal');
  if (!modal) return;

  const backdrop = modal.querySelector('.mobile-modal__backdrop');
  const closeEls = modal.querySelectorAll('[data-close]');

  const openModal = () => {
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
  };

  // Show modal on every page load
  window.addEventListener('DOMContentLoaded', () => {
    setTimeout(openModal, 250);
  });

  // Event listeners
  if (backdrop) backdrop.addEventListener('click', closeModal);
  closeEls.forEach(el => el.addEventListener('click', closeModal));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
})();