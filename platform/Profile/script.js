import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, get, update, set, query, orderByChild, equalTo } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// --- تكوين Firebase ---
const firebaseConfig = {
    apiKey: "AIzaSyCKyFgMqrosCHz6TZvK7wkteEpkt2MreRA",
    authDomain: "delta-academy-4dc9d.firebaseapp.com",
    databaseURL: "https://delta-academy-4dc9d-default-rtdb.firebaseio.com",
    projectId: "delta-academy-4dc9d",
    storageBucket: "delta-academy-4dc9d.firebasestorage.app",
    messagingSenderId: "385346402856",
    appId: "1:385346402856:web:04c3b5617f2c8f6d75531d",
    measurementId: "G-ZRZPRMGR9R"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// --- عناصر DOM ---
const profileImg = document.getElementById('profileImg');
const profileName = document.getElementById('profileName');
const profileEmail = document.getElementById('profileEmail');
const profileCustomId = document.getElementById('profileCustomId');
const profileBalance = document.getElementById('profileBalance');
const editModal = document.getElementById('editModal');

const editBtn = document.getElementById('editBtn');
const saveBtn = document.getElementById('saveBtn');
const closeBtn = document.getElementById('closeBtn');

const newNameInput = document.getElementById('newNameInput');
const newImageInput = document.getElementById('newImageInput');

const copyNameBtn = document.getElementById('copyNameBtn');
const copyEmailBtn = document.getElementById('copyEmailBtn');
const copyCustomIdBtn = document.getElementById('copyCustomIdBtn');

// --- حالة محلية ---
let currentUserKey = null; // المفتاح الموجود في قاعدة البيانات عند البحث بواسطة deviceId
let latestUserData = null; // تخزين بيانات المستخدم التي تم جلبها

// --- نوافذ المودال ---
function showModal() { editModal.style.display = 'flex'; }
function hideModal() { editModal.style.display = 'none'; }
editBtn.addEventListener('click', showModal);
closeBtn.addEventListener('click', hideModal);

// --- deviceId محلي ---
function getDeviceId() {
  let id = localStorage.getItem('deviceId');
  if (!id) {
    id = 'device_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
    localStorage.setItem('deviceId', id);
  }
  return id;
}
const deviceId = getDeviceId();

// --- جلب بيانات المستخدم بحسب deviceId ---
async function fetchUserData() {
  const usersRef = ref(db, 'users');
  const userQuery = query(usersRef, orderByChild('deviceId'), equalTo(deviceId));
  const placeholderImg = 'https://iili.io/KO3LaJR.md.jpg';

  try {
    const snapshot = await get(userQuery);
    if (snapshot.exists()) {
      // خذ آخر عنصر (لو في أكثر من واحد) - عادة سيكون واحد
      let found;
      snapshot.forEach(child => {
        currentUserKey = child.key;
        found = child.val();
      });
      latestUserData = found || {};

      profileImg.src = latestUserData.photoURL || placeholderImg;
      profileImg.onerror = () => { profileImg.src = placeholderImg; };

      profileName.textContent = latestUserData.name || 'N/A';
      profileEmail.textContent = latestUserData.email || 'N/A';
      profileCustomId.textContent = `ID: ${latestUserData.customId || 'N/A'}`;

      // تأكد أن balance رقم
      const balance = parseFloat(latestUserData.balance);
      profileBalance.textContent = (isNaN(balance) ? 0 : balance).toFixed(2);

      newNameInput.value = latestUserData.name || '';
      newImageInput.value = latestUserData.photoURL || '';

    } else {
      profileName.textContent = "User not found";
      latestUserData = null;
      currentUserKey = null;
    }
  } catch (e) {
    console.error('Error loading data:', e);
    profileName.textContent = 'Loading error';
    latestUserData = null;
    currentUserKey = null;
  }
}

// --- نسخ إلى الحافظة مع fallback ---
async function copyToClipboard(textToCopy, wrapperElement) {
  if (wrapperElement.classList.contains('copied')) return;
  const cleanText = textToCopy.startsWith('ID: ') ? textToCopy.substring(4) : textToCopy;

  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(cleanText);
    } else {
      // fallback للـ execCommand
      const tempTextArea = document.createElement('textarea');
      tempTextArea.value = cleanText;
      tempTextArea.style.position = 'fixed';
      tempTextArea.style.left = '-9999px';
      document.body.appendChild(tempTextArea);
      tempTextArea.select();
      document.execCommand('copy');
      document.body.removeChild(tempTextArea);
    }

    wrapperElement.classList.add('copied');
    setTimeout(() => wrapperElement.classList.remove('copied'), 1500);
  } catch (err) {
    console.warn('Copy failed', err);
  }
}

copyNameBtn.addEventListener('click', () => copyToClipboard(profileName.textContent, copyNameBtn));
copyEmailBtn.addEventListener('click', () => copyToClipboard(profileEmail.textContent, copyEmailBtn));
copyCustomIdBtn.addEventListener('click', () => copyToClipboard(profileCustomId.textContent, copyCustomIdBtn));

// --- حدث الحفظ: يصحح مشاكل deviceId وقيود القواعد ---
saveBtn.addEventListener('click', async () => {
  const newName = newNameInput.value.trim();
  const newImage = newImageInput.value.trim();

  if (!auth.currentUser) {
    console.error('User not authenticated');
    // لا تعتمد alert إن كنت لا تريدها، لكن يمكن إظهار رسالة واجهة للمستخدم
    return;
  }

  const authUid = auth.currentUser.uid;
  const updates = {};
  if (newName) updates.name = newName;
  if (newImage && (newImage.startsWith('http://') || newImage.startsWith('https://'))) updates.photoURL = newImage;

  // تأكد أننا نرسل deviceId إلى حساب المستخدم الذي سنكتب له (authUid)
  updates.deviceId = deviceId;

  // لا تسمح بالحفظ إن لم يتغير شيء فعلي
  const keysToUpdate = Object.keys(updates).filter(k => updates[k] !== undefined && updates[k] !== null);
  if (keysToUpdate.length === 0) {
    hideModal();
    return;
  }

  try {
    // إذا كان currentUserKey مساوٍ لِـ authUid نحدّث نفس العقدة، وإلا نكتب إلى users/{authUid} (يسمح به بالقواعد)
    const targetKey = (currentUserKey && currentUserKey === authUid) ? currentUserKey : authUid;
    const targetRef = ref(db, `users/${targetKey}`);

    // إذا كانت العقدة غير موجودة ووجدنا بيانات قديمة (مقابلة deviceId على مفتاح مختلف)، نحاول الاحتفاظ بها كنسخة بينما نكتب على authUid
    if (targetKey === authUid && currentUserKey && currentUserKey !== authUid) {
      // حاول نسخ بعض الحقول الأساسية إذا كانت موجودة
      const base = {
        name: latestUserData?.name || null,
        email: latestUserData?.email || null,
        customId: latestUserData?.customId || null,
        balance: latestUserData?.balance || 0
      };
      // اكتب (merge) العقدة الجديدة مع البيانات القديمة - استخدام set قد يغيّر كل المحتوى، لذا نستخدم update مع البيانات المبدئية
      await update(targetRef, Object.assign({}, base, updates));
    } else {
      await update(targetRef, updates);
    }

    // بعد نجاح التحديث، حدّث الـ UI
    if (updates.name) profileName.textContent = updates.name;
    if (updates.photoURL) profileImg.src = updates.photoURL;

    // حدّث latestUserData و currentUserKey لتتوافق مع ما كتبناه
    latestUserData = Object.assign({}, latestUserData || {}, updates);
    currentUserKey = targetKey;

    hideModal();
  } catch (e) {
    console.error('Update failed:', e);
    // عرض رسالة بسيطة للمستخدم (يمكنك استبدال alert بطريقة عرض أنيقة في الواجهة)
    alert('حدث خطأ أثناء تحديث البيانات. يرجى التحقق من الأذونات أو الاتصال بالإنترنت.');
  }
});

// --- تهيئة الصفحة ---
async function initializePage() {
  try {
    // 1) تسجيل دخول مجهول (auth != null) - نحتاجه لتوافق قواعد الأمان
    const signInResult = await signInAnonymously(auth);
    console.log('Signed in anonymously as', signInResult.user.uid);

    // 2) بمجرد تسجيل الدخول، نحمل بيانات المستخدم بناءً على deviceId
    await fetchUserData();

    // 3) أنشئ أيقونات Lucide (إذا كانت مكتبة lucide محملة عبر CDN في HTML)
    if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();

  } catch (e) {
    console.error('Initialization failed:', e);
    profileName.textContent = 'Initialization error';
  }
}

// بدء التهيئة
initializePage();
