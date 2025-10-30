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

firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const auth = firebase.auth();

const lightModeBtn = document.getElementById('light-mode-btn');
const darkModeBtn = document.getElementById('dark-mode-btn');
const addOfferBtn = document.getElementById('addOfferBtn');
const offersList = document.getElementById('offersList');
const offerForm = document.getElementById('offerForm');
const offerNameInput = document.getElementById('offerName');
const offerPriceInput = document.getElementById('offerPrice');
const offerCategoryInput = document.getElementById('offerCategory');
const filterBtn = document.getElementById('filterBtn');
const filterModal = document.getElementById('filterModal');
const filterList = document.getElementById('filterList');
const durationOptionsContainer = document.getElementById('durationOptions');
const searchInput = document.getElementById('searchInput');
const searchType = document.getElementById('searchType');

const offerModal = document.getElementById('offerModal');
const successModal = document.getElementById('successModal');
const readMoreModal = document.getElementById('readMoreModal');
const banModal = document.getElementById('banModal');
const infoModal = document.getElementById('infoModal');
const okBtn = document.getElementById('okBtn');

let allOffers = [];
let usersMap = {};
let currentUser = null;
let currentFilter = 'All';

function setActiveThemeButton() {
    if (document.body.classList.contains('dark-mode')) {
        darkModeBtn.classList.add('active');
        lightModeBtn.classList.remove('active');
    } else {
        lightModeBtn.classList.add('active');
        darkModeBtn.classList.remove('active');
    }
}
lightModeBtn.addEventListener('click', () => {
    document.body.classList.remove('dark-mode');
    document.body.classList.add('light-mode');
    setActiveThemeButton();
});
darkModeBtn.addEventListener('click', () => {
    document.body.classList.remove('light-mode');
    document.body.classList.add('dark-mode');
    setActiveThemeButton();
});
setActiveThemeButton();

function showModal(modal) { if (modal) modal.style.display = 'flex'; }
function hideModal(modal) { if (modal) modal.style.display = 'none'; }

addOfferBtn.addEventListener('click', () => {
    if (!currentUser) {
        showModal(infoModal);
        return;
    }

    if (currentUser.isOffersBanned === true) {
        showModal(banModal);
    } else {
        offerNameInput.value = currentUser.name || '';
        showModal(offerModal);
    }
});

[offerModal, successModal, readMoreModal, filterModal, banModal, infoModal].forEach(modal => {
    if (modal) {
        modal.addEventListener('click', (event) => {
            if (event.target === modal) hideModal(modal);
        });
        modal.querySelectorAll('.close-btn, .close-modal-btn').forEach(btn => {
            btn.addEventListener('click', () => hideModal(modal));
        });
    }
});

okBtn.addEventListener('click', () => hideModal(successModal));
filterBtn.addEventListener('click', () => showModal(filterModal));

if (durationOptionsContainer) {
    durationOptionsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('duration-option')) {
            durationOptionsContainer.querySelectorAll('.duration-option').forEach(opt => {
                opt.classList.remove('active');
            });
            e.target.classList.add('active');
        }
    });
}

offerForm.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!currentUser) {
        showToast('لا يمكن نشر العرض، بيانات المستخدم غير متاحة.', 'error');
        return;
    }
    
    const activeDurationElement = durationOptionsContainer.querySelector('.duration-option.active');
    if (!activeDurationElement) {
        showToast('الرجاء اختيار مدة العرض.', 'error');
        return;
    }

    const newOffer = {
        name: offerNameInput.value,
        price: offerPriceInput.value,
        description: document.getElementById('offerDescription').value,
        category: offerCategoryInput.value,
        duration: parseInt(activeDurationElement.dataset.value),
        uid: currentUser.uid,
        timestamp: firebase.database.ServerValue.TIMESTAMP,
        expiryTimestamp: new Date().getTime() + (parseInt(activeDurationElement.dataset.value) * 60 * 60 * 1000),
        totalDuration: parseInt(activeDurationElement.dataset.value) * 60 * 60 * 1000
    };
    
    if (isNaN(newOffer.price) || newOffer.price === "" || parseFloat(newOffer.price) < 5) {
        showToast('الرجاء إدخال سعر صحيح (5 دولار كحد أدنى).', 'error');
        return;
    }

    database.ref('offers').push(newOffer).then(() => {
        hideModal(offerModal);
        offerForm.reset();
        durationOptionsContainer.querySelectorAll('.duration-option').forEach(opt => opt.classList.remove('active'));
        durationOptionsContainer.querySelector('.duration-option[data-value="8"]').classList.add('active');
        showModal(successModal);
    }).catch((error) => console.error("Error adding offer: ", error));
});

function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let iconClass = 'fas fa-check-circle';
    if (type === 'error') {
        iconClass = 'fas fa-exclamation-circle';
    }

    toast.innerHTML = `<i class="${iconClass}"></i> ${message}`;
    toastContainer.appendChild(toast);
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

const copyToClipboard = (text, element) => {
    navigator.clipboard.writeText(text).then(() => {
        const tooltip = element.querySelector('.tooltip-text');
        tooltip.textContent = 'تم النسخ!';
        setTimeout(() => {
            tooltip.textContent = 'نسخ الاسم';
        }, 2000);
    }).catch(err => console.error('Failed to copy: ', err));
};

function renderOffers(offersToRender) {
    offersList.innerHTML = '';
    if (offersToRender.length === 0) {
        offersList.innerHTML = '<p class="no-offers-message">لا توجد عروض تطابق بحثك.</p>';
        return;
    }

    offersToRender.forEach(offer => {
        const creator = usersMap[offer.uid];
        if (!creator) {
             console.warn("No user data for offer UID:", offer.uid);
            return; 
        }

        if (currentUser && currentUser.uid && !(offer.views && offer.views[currentUser.uid])) {
            database.ref(`offers/${offer.key}/views/${currentUser.uid}`).set(true);
        }
        const viewCount = Object.keys(offer.views || {}).length;

        const descriptionWords = offer.description.split(' ');
        const limitedDescription = descriptionWords.slice(0, 15).join(' ');
        const isDescriptionLong = descriptionWords.length > 15;
        
        const offerItem = document.createElement('div');
        offerItem.className = 'card';
        offerItem.innerHTML = `
            <div class="card-header">
                <img src="${creator.photoURL || 'https://via.placeholder.com/50'}" alt="User Photo" class="user-photo">
                <div class="user-info">
                    <h3 class="card-title">${offer.name || 'عرض بدون عنوان'}</h3>
                    <p class="creator-name">بواسطة ${creator.name || 'مستخدم غير معروف'}</p>
                </div>
            </div>
            <div class="card-body">
                <p class="description">${limitedDescription}${isDescriptionLong ? '...' : ''}</p>
                ${isDescriptionLong ? `<button class="read-more-btn">اقرأ المزيد</button>` : ''}
            </div>
            <div class="card-footer">
                 <div class="card-stat price-tag">
                    <i class="fas fa-dollar-sign"></i>
                    <span>${offer.price}</span>
                </div>
                <div class="card-stat time-tag" id="countdown-${offer.key}">
                    <i class="fas fa-clock"></i>
                    <span>Loading...</span>
                </div>
                <div class="card-stat views">
                    <i class="fas fa-eye"></i>
                    <span>${viewCount}</span>
                </div>
                <div class="card-stat copy-btn tooltip">
                    <i class="fas fa-copy"></i>
                    <span class="tooltip-text">نسخ الاسم</span>
                </div>
            </div>
        `;
        
        offerItem.querySelector('.copy-btn').addEventListener('click', (e) => {
            copyToClipboard(creator.name, e.currentTarget);
        });
        
        if (isDescriptionLong) {
            offerItem.querySelector('.read-more-btn').addEventListener('click', () => {
                document.getElementById('readMoreTitle').textContent = offer.name;
                document.getElementById('readMoreContent').textContent = offer.description;
                showModal(readMoreModal);
            });
        }
        
        offersList.appendChild(offerItem);
        
        if (offer.expiryTimestamp) {
            startCountdown(offer.key, offer.expiryTimestamp, offer.totalDuration);
        }
    });
}

function applyFiltersAndSearch() {
    const searchText = searchInput.value.toLowerCase().trim();
    const searchFilterType = searchType.value;

    let filteredOffers = (currentFilter === 'All') 
        ? allOffers 
        : allOffers.filter(offer => offer.category === currentFilter);

    if (searchText) {
        filteredOffers = filteredOffers.filter(offer => {
            const creator = usersMap[offer.uid];
            if (!creator) return false;

            switch (searchFilterType) {
                case 'name':
                    return offer.name.toLowerCase().includes(searchText);
                case 'description':
                    return offer.description.toLowerCase().includes(searchText);
                case 'price':
                    return offer.price.toString().includes(searchText);
                case 'category':
                    return offer.category.toLowerCase().includes(searchText);
                case 'creator':
                    return creator.name.toLowerCase().includes(searchText);
                default:
                    return true;
            }
        });
    }
    
    renderOffers(filteredOffers);
}


function populateFilterModal() {
    const categories = ['All', ...new Set(allOffers.map(offer => offer.category))];
    filterList.innerHTML = '';
    categories.forEach(category => {
        if (category) {
            const li = document.createElement('li');
            li.className = 'filter-item';
            li.textContent = category === 'All' ? 'عرض الكل' : category;
            li.dataset.category = category;
            if (category === currentFilter) {
                li.classList.add('active');
            }
            filterList.appendChild(li);
        }
    });
}

filterList.addEventListener('click', (e) => {
    if (e.target.tagName === 'LI') {
        currentFilter = e.target.dataset.category;
        applyFiltersAndSearch();
        populateFilterModal();
        hideModal(filterModal);
    }
});

searchInput.addEventListener('input', applyFiltersAndSearch);
searchType.addEventListener('change', applyFiltersAndSearch);


function initializeApp(user) {
    database.ref('users/' + user.uid).once('value').then((snapshot) => {
        if (snapshot.exists()) {
            currentUser = { ...snapshot.val(), uid: user.uid };
            
            database.ref('users').once('value', (usersSnapshot) => {
                 if (usersSnapshot.exists()) {
                    usersMap = usersSnapshot.val();
                }

                const offersRef = database.ref('offers').orderByChild('timestamp');
                offersRef.on('value', (offersSnapshot) => {
                    if (offersSnapshot.exists()) {
                        const offersData = offersSnapshot.val();
                        allOffers = Object.keys(offersData).map(key => ({
                            key,
                            ...offersData[key]
                        })).reverse();
                        
                        applyFiltersAndSearch();
                        populateFilterModal();
                    } else {
                        allOffers = [];
                        offersList.innerHTML = '<p class="no-offers-message">لا توجد عروض حالياً.</p>';
                    }
                });
            }).catch(error => {
                 console.error("Error fetching all users (check rules v1.5):", error);
                 showToast("Error loading user data for offers.", "error");
            });

        } else {
            console.error("User data not found in Realtime Database.");
            auth.signOut(); 
        }
    }).catch(error => {
        console.error("Error fetching current user data:", error);
        if (error.code === "PERMISSION_DENIED") {
             showToast("Security error: Cannot read user profile.", "error");
        }
        auth.signOut();
    });
}

function loadInitialData() {
    auth.onAuthStateChanged((user) => {
        if (user) {
            initializeApp(user);
        } else {
            console.log("User is not logged in. Redirecting...");
            window.location.href = '../index.html'; 
        }
    });
}


function startCountdown(offerKey, expiryTimestamp, totalDuration) {
    const countdownElement = document.getElementById(`countdown-${offerKey}`);
    if (!countdownElement) return;

    const timeTag = countdownElement.closest('.time-tag');
    const interval = setInterval(() => {
        const now = new Date().getTime();
        const distance = expiryTimestamp - now;
        const span = countdownElement.querySelector('span');

        if (timeTag) {
            timeTag.classList.remove('status-ok', 'status-warning', 'status-expired');
        }

        if (distance < 0) {
            clearInterval(interval);
            if(span) span.textContent = "Expired";
            if (timeTag) timeTag.classList.add('status-expired');
            database.ref(`offers/${offerKey}`).remove();
        } else {
            const warningThreshold = totalDuration * 0.25;
            if (distance < warningThreshold) {
                if (timeTag) timeTag.classList.add('status-warning');
            } else {
                if (timeTag) timeTag.classList.add('status-ok');
            }
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            if(span) span.textContent = `${hours}h ${minutes}m ${seconds}s`;
        }
    }, 1000);
}

document.addEventListener('DOMContentLoaded', loadInitialData);