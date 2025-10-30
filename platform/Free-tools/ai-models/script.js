// إعدادات Firebase
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

// تهيئة Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// العناصر من الصفحة
const modal = document.getElementById('modal');
const addButton = document.getElementById('addButton');
const cancelButton = document.getElementById('cancelButton');
const closeModalBtn = document.getElementById('closeModal');
const appForm = document.getElementById('appForm');
const cardsContainer = document.getElementById('cardsContainer');
const loadingMessage = document.getElementById('loadingMessage');
const noResults = document.getElementById('noResults');
const userNameInput = document.getElementById('userName');
const searchInput = document.getElementById('searchInput');
const themeToggle = document.getElementById('themeToggle');

// متغيرات عامة
let currentUserData = {
    name: '',
    uid: '',
    deviceId: ''
};
let allAppsData = [];

// ==== جلب أو إنشاء Device ID ====
function getDeviceId() {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
        deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('deviceId', deviceId);
    }
    return deviceId;
}

// ==== جلب أو إنشاء UID للمستخدم الحالي ====
function getCurrentUID() {
    let uid = localStorage.getItem('currentUID');
    if (!uid) {
        uid = 'uid_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('currentUID', uid);
    }
    return uid;
}

// ==== وظيفة الوضع الداكن/الفاتح ====
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
}

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
});

// ==== التحقق من صلاحية النشر ====
async function checkPostPermission() {
    if (!currentUserData.uid) {
        console.log('User UID not available yet for permission check.');
        return;
    }
    
    const permissionRef = database.ref(`aiPostPermissions/${currentUserData.uid}`);
    try {
        const snapshot = await permissionRef.once('value');
        if (snapshot.exists() && snapshot.val() === true) {
            addButton.style.display = 'flex'; // إظهار الزر
            console.log('✅ Access granted. User can post AI models.');
        } else {
            addButton.style.display = 'none'; // التأكد من إخفاء الزر
            console.log('⛔️ Access denied. User cannot post AI models.');
        }
    } catch (error) {
        console.error('❌ Error checking post permissions:', error);
        addButton.style.display = 'none'; // إخفاء الزر عند حدوث خطأ
    }
}

// ==== جلب بيانات المستخدم بناءً على Device ID ====
async function fetchUserData() {
    try {
        const myDeviceId = getDeviceId();
        const myUID = getCurrentUID();
        
        // البحث في users عن المستخدم بنفس Device ID
        const snapshot = await database.ref('users').once('value');
        
        if (snapshot.exists()) {
            const users = snapshot.val();
            let foundUser = null;
            
            // البحث عن المستخدم بنفس Device ID
            for (let userId in users) {
                if (users[userId].deviceId === myDeviceId) {
                    foundUser = {
                        uid: userId,
                        name: users[userId].name,
                        deviceId: users[userId].deviceId
                    };
                    break;
                }
            }
            
            if (!foundUser) {
                const firstUserId = Object.keys(users)[0];
                foundUser = {
                    uid: firstUserId,
                    name: users[firstUserId].name || 'مستخدم',
                    deviceId: users[firstUserId].deviceId || myDeviceId
                };
            }
            
            currentUserData = foundUser;
        } else {
            currentUserData = {
                name: 'مستخدم',
                uid: myUID,
                deviceId: myDeviceId
            };
        }
        
        userNameInput.value = currentUserData.name;
        console.log('✅ تم جلب بيانات المستخدم:', currentUserData);

        // استدعاء دالة التحقق من الصلاحية بعد جلب بيانات المستخدم
        await checkPostPermission();
        
    } catch (error) {
        console.error('❌ خطأ في جلب بيانات المستخدم:', error);
        const myDeviceId = getDeviceId();
        const myUID = getCurrentUID();
        currentUserData = {
            name: 'مستخدم',
            uid: myUID,
            deviceId: myDeviceId
        };
        userNameInput.value = currentUserData.name;
    }
}

// ==== الحصول على الحرف الأول من الاسم ====
function getInitial(name) {
    return name ? name.charAt(0).toUpperCase() : 'U';
}

// ==== تسجيل مشاهدة ====
async function recordView(postId) {
    const myUID = getCurrentUID();
    const viewsRef = database.ref(`AI/${postId}/views/${myUID}`);
    
    try {
        const snapshot = await viewsRef.once('value');
        if (!snapshot.exists()) {
            await viewsRef.set({
                timestamp: Date.now(),
                uid: myUID
            });
            console.log('✅ تم تسجيل مشاهدة جديدة');
        }
    } catch (error) {
        console.error('❌ خطأ في تسجيل المشاهدة:', error);
    }
}

// ==== حساب متوسط التقييم ====
function calculateRating(ratings) {
    if (!ratings || Object.keys(ratings).length === 0) {
        return { average: 0, count: 0 };
    }
    
    const values = Object.values(ratings).map(r => r.stars);
    const sum = values.reduce((a, b) => a + b, 0);
    const average = (sum / values.length).toFixed(1);
    
    return { average: parseFloat(average), count: values.length };
}

// ==== إضافة أو تحديث تقييم ====
async function setRating(postId, stars) {
    const myUID = getCurrentUID();
    const ratingRef = database.ref(`AI/${postId}/ratings/${myUID}`);
    
    try {
        await ratingRef.set({
            stars: stars,
            timestamp: Date.now(),
            uid: myUID
        });
        console.log(`✅ تم تقييم المنشور بـ ${stars} نجوم`);
    } catch (error) {
        console.error('❌ خطأ في التقييم:', error);
    }
}

// ==== إلغاء التقييم ====
async function removeRating(postId) {
    const myUID = getCurrentUID();
    const ratingRef = database.ref(`AI/${postId}/ratings/${myUID}`);
    
    try {
        await ratingRef.remove();
        console.log('✅ تم إلغاء التقييم');
    } catch (error) {
        console.error('❌ خطأ في إلغاء التقييم:', error);
    }
}

// ==== عرض البطاقات ====
function displayCards(data, searchTerm = '') {
    cardsContainer.innerHTML = '';
    loadingMessage.style.display = 'none';
    noResults.style.display = 'none';

    if (!data || data.length === 0) {
        noResults.style.display = 'block';
        noResults.querySelector('p').textContent = searchTerm 
            ? 'لم يتم العثور على نتائج' 
            : 'لا توجد نماذج. أضف أول نموذج!';
        return;
    }

    const myUID = getCurrentUID();

    data.forEach((item) => {
        recordView(item.id);
        
        const card = document.createElement('div');
        card.className = 'card';
        
        const initial = getInitial(item.userName);
        const viewsCount = item.views ? Object.keys(item.views).length : 0;
        const rating = calculateRating(item.ratings);
        const userRating = item.ratings && item.ratings[myUID] ? item.ratings[myUID].stars : 0;
        
        let ratingStarsHTML = '';
        for (let i = 1; i <= 5; i++) {
            ratingStarsHTML += `<button class="star-btn ${i <= rating.average ? 'filled' : ''}" data-post="${item.id}" data-star="${i}">
                <i class="fas fa-star"></i>
            </button>`;
        }
        
        card.innerHTML = `
            <div class="card-image-wrapper">
                ${item.imageUrl ? 
                    `<img src="${item.imageUrl}" alt="AI Model" class="card-image" onerror="this.parentElement.innerHTML='<div style=\\'display:flex;align-items:center;justify-content:center;height:100%;font-size:4em;color:white;\\'><i class=\\'fas fa-brain\\'></i></div>'">` 
                    : 
                    `<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:4em;color:white;"><i class="fas fa-brain"></i></div>`
                }
                <div class="card-badge">
                    <i class="fas fa-star"></i>
                    نموذج AI
                </div>
            </div>
            <div class="card-content">
                <div class="card-header">
                    <div class="card-avatar">${initial}</div>
                    <div class="card-author-info">
                        <div class="card-author-name">${item.userName}</div>
                        <div class="card-author-meta">
                            <span class="card-author-badge">مطور</span>
                        </div>
                    </div>
                </div>
                <h3 class="card-title">${item.description || 'نموذج ذكاء اصطناعي'}</h3>
                <p class="card-description">${item.description}</p>
                
                <div class="card-stats">
                    <div class="card-stat">
                        <i class="fas fa-eye"></i>
                        <span>${viewsCount} مشاهدة</span>
                    </div>
                    <div class="card-stat">
                        <i class="fas fa-star"></i>
                        <span>${rating.average} (${rating.count})</span>
                    </div>
                </div>
                
                <div class="card-rating">
                    <div class="rating-display">
                        <span class="rating-average">${rating.average}</span>
                        <div class="rating-stars-display">
                            ${Array(5).fill(0).map((_, i) => 
                                `<i class="fas fa-star" style="color: ${i < Math.round(rating.average) ? '#f59e0b' : '#ddd'}"></i>`
                            ).join('')}
                        </div>
                    </div>
                    <div class="rating-count">${rating.count} تقييم</div>
                    <div class="rating-input">
                        ${ratingStarsHTML}
                    </div>
                    ${userRating > 0 ? `<button class="remove-rating-btn" data-post="${item.id}">إلغاء تقييمي</button>` : ''}
                </div>
                
                <div class="card-footer">
                    <a href="${item.appLink}" target="_blank" class="card-link">
                        <i class="fas fa-rocket"></i>
                        تجربة النموذج
                    </a>
                </div>
            </div>
        `;
        
        cardsContainer.appendChild(card);
    });
    
    document.querySelectorAll('.star-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const postId = this.dataset.post;
            const stars = parseInt(this.dataset.star);
            setRating(postId, stars);
        });
        
        btn.addEventListener('mouseenter', function() {
            const stars = parseInt(this.dataset.star);
            const postId = this.dataset.post;
            document.querySelectorAll(`[data-post="${postId}"].star-btn`).forEach((s, i) => {
                if (i < stars) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });
        });
    });
    
    document.querySelectorAll('.remove-rating-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const postId = this.dataset.post;
            removeRating(postId);
        });
    });
    
    document.querySelectorAll('.rating-input').forEach(container => {
        container.addEventListener('mouseleave', function() {
            container.querySelectorAll('.star-btn').forEach(s => {
                s.classList.remove('active');
            });
        });
    });
}

// ==== الاستماع للتغييرات في البيانات ====
database.ref('AI').on('value', (snapshot) => {
    const data = snapshot.val();
    if (data) {
        allAppsData = Object.entries(data).map(([key, value]) => ({
            id: key,
            ...value
        })).reverse();
    } else {
        allAppsData = [];
    }
    displayCards(allAppsData);
});

// ==== وظيفة البحث ====
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();
    
    if (searchTerm === '') {
        displayCards(allAppsData);
        return;
    }

    const filteredData = allAppsData.filter(item => {
        const description = (item.description || '').toLowerCase();
        const userName = (item.userName || '').toLowerCase();
        return description.includes(searchTerm) || userName.includes(searchTerm);
    });

    displayCards(filteredData, searchTerm);
});

// ==== فتح النافذة المنبثقة ====
addButton.addEventListener('click', async () => {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
});

// ==== إغلاق النافذة المنبثقة ====
function closeModalFunction() {
    modal.classList.remove('active');
    appForm.reset();
    document.body.style.overflow = 'auto';
}

cancelButton.addEventListener('click', closeModalFunction);
closeModalBtn.addEventListener('click', closeModalFunction);

modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModalFunction();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModalFunction();
    }
});

// ==== إرسال البيانات ====
appForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitButton = appForm.querySelector('.btn-submit');
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';
    submitButton.disabled = true;

    const appData = {
        userName: currentUserData.name,
        uid: currentUserData.uid,
        deviceId: currentUserData.deviceId,
        appLink: document.getElementById('appLink').value,
        imageUrl: document.getElementById('imageLink').value,
        description: document.getElementById('description').value,
        timestamp: Date.now(),
        views: {},
        ratings: {}
    };

    try {
        await database.ref('AI').push(appData);
        
        console.log('✅ تم الإرسال بنجاح');
        
        submitButton.innerHTML = '<i class="fas fa-check-circle"></i> تم بنجاح!';
        submitButton.style.background = 'linear-gradient(135deg, #10b981, #059669)';
        
        setTimeout(() => {
            closeModalFunction();
            submitButton.innerHTML = originalText;
            submitButton.style.background = '';
            submitButton.disabled = false;
        }, 1500);

    } catch (error) {
        console.error('❌ خطأ في الإرسال:', error);
        alert('❌ حدث خطأ. حاول مرة أخرى.');
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
    }
});

// ==== تهيئة الصفحة ====
initTheme();
fetchUserData();

console.log('🔥 النظام جاهز! Device ID:', getDeviceId());
console.log('👤 UID الحالي:', getCurrentUID());