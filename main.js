const firebaseConfig = {
    apiKey: "AIzaSyCKyFgMqrosCHz6TZvK7wkteEpkt2MreRA",
    authDomain: "delta-academy-4dc9d.firebaseapp.com",
    databaseURL: "https://delta-academy-4dc9d-default-rtdb.firebaseio.com",
    projectId: "delta-academy-4dc9d",
    storageBucket: "delta-academy-4dc9d.firebasestorage.app",
    messagingSenderId: "385346402856",
    appId: "1:385346402856:web:04c3b5617f2c8f6d75531d"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

const telegramSupportUrl = 'https://t.me/D_R_G_7_BOT';

const dialog = document.getElementById('customDialog');
const dialogTitle = document.getElementById('dialogTitle');
const dialogBody = document.getElementById('dialogBody');
const dialogCloseBtn = document.getElementById('dialogCloseBtn');

function showDialog(title, message) {
    dialogTitle.textContent = title;
    dialogBody.textContent = message;
    dialog.classList.remove('hidden');
}

dialogCloseBtn.addEventListener('click', () => {
    dialog.classList.add('hidden');
});

document.addEventListener('DOMContentLoaded', () => {
    const telegramLink = document.getElementById('telegramLink');
    if (telegramLink) {
        telegramLink.href = telegramSupportUrl;
        telegramLink.target = '_blank';
        telegramLink.rel = 'noopener noreferrer';
    }
});

const deviceId = localStorage.getItem('deviceId') || (() => {
    const id = 'device-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('deviceId', id);
    return id;
})();

auth.onAuthStateChanged(async (user) => {
    if (user) {
        const userRef = database.ref('users/' + user.uid);
        const snapshot = await userRef.once('value');
        if (snapshot.exists()) {
            const userData = snapshot.val();
            if (userData.isActive === false) {
                auth.signOut();
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('userUid');
                showDialog('الحساب محظور', 'تم حظر حسابك. يرجى التواصل مع فريق الدعم.');
            } else {
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userUid', user.uid);
                window.location.href = './platform/dashboard.html';
            }
        } else {
            auth.signOut();
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userUid');
        }
    }
});

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const toggleIcon = input.closest('.input-group').querySelector('.toggle-password');
    if (input.type === 'password') {
        input.type = 'text';
        toggleIcon.innerHTML = '𓂁';
    } else {
        input.type = 'password';
        toggleIcon.innerHTML = '𓂀';
    }
}

function toggleForm() {
    document.getElementById('loginForm').classList.toggle('hidden');
    document.getElementById('registerForm').classList.toggle('hidden');
    clearAllForms();
}

function clearAllForms() {
    document.querySelectorAll('.error-msg, .success-msg').forEach(el => {
        el.classList.add('hidden');
        el.textContent = '';
    });
    document.querySelectorAll('input').forEach(input => {
        input.value = '';
        const overlay = input.nextElementSibling;
        if (overlay && overlay.classList.contains('input-overlay')) {
            input.style.color = '#ffd700';
            overlay.style.opacity = '0';
            overlay.textContent = '';
        }
    });
}

document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const email = document.getElementById('loginUser').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    const loginError = document.getElementById('loginError');
    const submitButton = this.querySelector('button[type="submit"]');

    if (!email || !password) {
        loginError.textContent = 'يرجى ملء جميع الحقول المطلوبة';
        loginError.classList.remove('hidden');
        return;
    }
    submitButton.disabled = true;

    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const firebaseUser = userCredential.user;

        if (firebaseUser) {
            const userRef = database.ref('users/' + firebaseUser.uid);
            const snapshot = await userRef.once('value');
            if (snapshot.exists()) {
                const userData = snapshot.val();
                if (userData.isActive === false) {
                    auth.signOut();
                    showDialog('الحساب محظور', 'تم حظر حسابك. يرجى التواصل مع فريق الدعم.');
                    submitButton.disabled = false;
                } else {
                    const updates = {
                        deviceId: deviceId,
                        lastLogin: Date.now(),
                        loginCount: firebase.database.ServerValue.increment(1)
                    };
                    await userRef.update(updates);
                    
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('userUid', firebaseUser.uid);
                    window.location.href = './platform/dashboard.html';
                }
            } else {
                auth.signOut();
                loginError.textContent = 'خطأ: حسابك غير موجود في قاعدة البيانات.';
                loginError.classList.remove('hidden');
                submitButton.disabled = false;
            }
        }
    } catch (error) {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            loginError.textContent = 'بيانات تسجيل الدخول غير صحيحة';
        } else {
            loginError.textContent = 'خطأ في الاتصال بالخادم';
        }
        loginError.classList.remove('hidden');
        submitButton.disabled = false;
    }
});

document.getElementById('registerForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const photoURL = document.getElementById('regPhotoURL').value.trim();
    const password = document.getElementById('regPassword').value.trim();
    const regError = document.getElementById('regError');
    const submitButton = this.querySelector('button[type="submit"]');

    if (!name || !email || !photoURL || !password) {
        regError.textContent = 'يرجى ملء جميع الحقول المطلوبة';
        regError.classList.remove('hidden');
        return;
    }
    
    submitButton.disabled = true;
    
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const firebaseUser = userCredential.user;
        await firebaseUser.updateProfile({ displayName: name });
        
        // --- START: NEW CODE ---
        const customId = '1998' + Date.now().toString().slice(-9);
        // --- END: NEW CODE ---

        const userData = {
            uid: firebaseUser.uid,
            customId: customId, // The new custom ID
            name, email, photoURL,
            balance: 0,
            registeredDevice: deviceId,
            deviceId: deviceId,
            createdAt: Date.now(), 
            lastLogin: Date.now(),
            isActive: true, 
            loginCount: 1,
        };
        await database.ref('users/' + firebaseUser.uid).set(userData);
        await firebaseUser.sendEmailVerification();

        showDialog('نجاح التسجيل', 'تم إنشاء الحساب بنجاح! تم إرسال رسالة تحقق إلى بريدك الإلكتروني.');
        this.reset();
        toggleForm();

    } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
            regError.textContent = 'هذا البريد الإلكتروني مستخدم بالفعل';
        } else {
            regError.textContent = 'حدث خطأ أثناء إنشاء الحساب';
        }
        regError.classList.remove('hidden');
    } finally {
        submitButton.disabled = false;
    }
});