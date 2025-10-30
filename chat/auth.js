import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getDatabase, ref, get, push } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";

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
const auth = getAuth(app);
const db = getDatabase(app);

const displayNameInput = document.getElementById("displayName");
const photoURLInput = document.getElementById("photoURL");
const loadingOverlay = document.getElementById("loadingOverlay");
const previewName = document.getElementById("previewName");
const previewImage = document.getElementById("previewImage");
const previewContainer = document.getElementById("previewContainer");

const defaultAvatar = "https://i.imgur.com/83itGts.png";

const showDialog = (message) => {
    document.getElementById("dialogMessage").textContent = message;
    document.getElementById("customDialog").classList.add('active');
};

function updatePreview() {
    const name = displayNameInput.value.trim();
    const photoURL = photoURLInput.value.trim();
    previewName.textContent = name || "اسمك هنا";
    previewImage.src = photoURL || defaultAvatar;
    if (name || photoURL) {
        previewContainer.style.opacity = '1';
    } else {
        previewContainer.style.opacity = '0';
    }
}

previewImage.onerror = () => {
    previewImage.src = defaultAvatar;
};

// --- ✨ بداية التعديل ---
async function saveUserData() {
  const user = auth.currentUser;
  if (!user) return;
  const uid = user.uid;
  const name = displayNameInput.value.trim();
  const photoURL = photoURLInput.value.trim();
  if (!name || !photoURL) return showDialog("الرجاء إكمال حقلي الاسم ورابط الصورة الشخصية.");
  
  displayNameInput.setAttribute('readonly', true);
  photoURLInput.setAttribute('readonly', true);

  // سنقوم بحفظ البيانات الأساسية في المتصفح أولاً
  localStorage.setItem("uid", uid);
  localStorage.setItem("name", name);
  localStorage.setItem("photoURL", photoURL);

  try {
    // محاولة حفظ البيانات في قاعدة البيانات
    const updatesRef = ref(db, 'profile_updates');
    await push(updatesRef, { uid: uid, name: name, photoURL: photoURL, timestamp: Date.now() });

    const userRef = ref(db, 'users/' + uid);
    const userSnap = await get(userRef);
    if (userSnap.exists()) {
      const d = userSnap.val();
      localStorage.setItem("isActive", d.isActive !== false);
      localStorage.setItem("isPublicChatBanned", d.isPublicChatBanned || false);
      localStorage.setItem("isPrivateChatBanned", d.isPrivateChatBanned || false);
      localStorage.setItem("verificationBadgeUrl", d.verificationBadgeUrl || "");
    }
  } catch (e) {
    // في حال فشل الحفظ، سنطبع الخطأ في الـ console ولكن لن نمنع المستخدم من الدخول
    console.error("Could not save user data, but redirecting anyway:", e);
    showDialog("حدث خطأ أثناء حفظ بياناتك، ولكن سيتم توجيهك الآن.");
  }
  
  // سيتم تنفيذ هذا السطر دائمًا، سواء نجحت عملية الحفظ أم لا
  location.href = "chat.html";
};
// --- نهاية التعديل ---

function typewriter(element, text, speed = 50) {
    return new Promise(resolve => {
        element.classList.add('typing');
        let i = 0;
        const interval = setInterval(() => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
            } else {
                clearInterval(interval);
                element.classList.remove('typing');
                resolve();
            }
        }, speed);
    });
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function startAuthAnimation() {
    const username = displayNameInput.value.trim();
    const line1 = document.getElementById('terminalLine1');
    const line2 = document.getElementById('terminalLine2');
    const line3 = document.getElementById('terminalLine3');

    await typewriter(line1, `جاري التحقق من ${username}...`, 30);
    await delay(150);
    await typewriter(line2, `تم منح الوصول.`, 30);
    await delay(150);
    await typewriter(line3, `توجيه إلى قناة آمنة...`, 30);
    await delay(400);
    location.href = "chat.html";
}

onAuthStateChanged(auth, async user => {
  if (user) {
    const uid = user.uid;
    const userRef = ref(db, 'users/' + uid);
    try {
      const userSnap = await get(userRef);
      if (userSnap.exists()) {
        const d = userSnap.val();
        displayNameInput.value = d.name || "";
        photoURLInput.value = d.photoURL || "";
        if (d.name) displayNameInput.setAttribute("readonly", true);
        if (d.photoURL) photoURLInput.setAttribute("readonly", true);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      showDialog("حدث خطأ أثناء جلب بياناتك.");
    } finally {
      updatePreview();
      loadingOverlay.classList.remove('active');
      const isNameReadonly = displayNameInput.hasAttribute('readonly');
      const isPhotoReadonly = photoURLInput.hasAttribute('readonly');
      if (displayNameInput.value && photoURLInput.value && isNameReadonly && isPhotoReadonly) {
        document.querySelector('.card').classList.add('data-loaded');
        startAuthAnimation();
      }
    }
  } else {
    signInAnonymously(auth).catch(err => {
      console.error("Anonymous sign-in failed:", err);
      loadingOverlay.classList.remove('active');
    });
  }
});

let timeoutId = null;

function handleInput() {
    updatePreview();
    if (timeoutId) clearTimeout(timeoutId);
    const name = displayNameInput.value.trim();
    const photo = photoURLInput.value.trim();
    const isNameReadonly = displayNameInput.hasAttribute('readonly');
    const isPhotoReadonly = photoURLInput.hasAttribute('readonly');
    if (name && photo && !isNameReadonly && !isPhotoReadonly) {
        timeoutId = setTimeout(saveUserData, 2000);
    }
}

displayNameInput.addEventListener('input', handleInput);
photoURLInput.addEventListener('input', handleInput);