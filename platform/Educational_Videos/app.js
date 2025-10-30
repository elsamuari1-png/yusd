// Initialization
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

// Initialization
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const auth = firebase.auth();
const videosRef = database.ref('videos');
const usersRef = database.ref('users');
const videoPermissionsRef = database.ref('videoUploadPermissions');

// Global state
let allVideos = [];
let currentUser = null; 

// DOM Elements
const uploadBtn = document.getElementById('upload-btn');
const uploadModal = document.getElementById('upload-modal');
const modalContent = document.querySelector('.modal-content');
const closeModalBtn = document.querySelector('.close-btn');
const uploadForm = document.getElementById('upload-form');
const videoContainer = document.querySelector('.video-container');
const uploaderNameInput = document.getElementById('uploader-name');
const videoLinkInput = document.getElementById('video-link');
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const uploadFormWrapper = document.getElementById('upload-form-wrapper');
const modalSuccessContent = document.getElementById('modal-success-content');
const confirmCloseBtn = document.getElementById('confirm-close-btn');
const modalErrorContent = document.getElementById('modal-error-content');
const confirmErrorCloseBtn = document.getElementById('confirm-error-close-btn');
const errorMessageElement = document.getElementById('error-message');

// Hide upload button by default
uploadBtn.style.display = 'none';

// Function to check upload permission
async function checkUploadPermission(uid) {
    if (!uid) {
        uploadBtn.style.display = 'none';
        return;
    }
    try {
        const snapshot = await videoPermissionsRef.child(uid).once('value');
        if (snapshot.exists() && snapshot.val() === true) {
            uploadBtn.style.display = 'flex';
        } else {
            uploadBtn.style.display = 'none';
        }
    } catch (error) {
        console.error("Error checking video upload permission:", error);
        uploadBtn.style.display = 'none';
    }
}

// Function to hide the modal
function hideModal() {
    uploadModal.classList.remove('is-visible');
    modalContent.classList.remove('is-entering');
    modalContent.classList.add('is-leaving');
    
    modalContent.addEventListener('animationend', () => {
        uploadModal.style.display = 'none';
        modalContent.classList.remove('is-leaving');
        uploadFormWrapper.style.display = 'block';
        modalSuccessContent.style.display = 'none';
        modalErrorContent.style.display = 'none'; 
        uploadForm.reset(); 
        videoLinkInput.classList.remove('input-error');
    }, { once: true });
}

// Function to show the modal
uploadBtn.addEventListener('click', () => {
    if (!currentUser) {
        alert("User data not loaded. Please wait.");
        return;
    }
    
    uploaderNameInput.value = currentUser.name;
    
    uploadModal.style.display = 'flex';
    requestAnimationFrame(() => {
        uploadModal.classList.add('is-visible');
        modalContent.classList.add('is-entering');
    });
    
    modalContent.addEventListener('animationend', () => {
        modalContent.classList.remove('is-entering');
    }, { once: true });
});

// Close modal
closeModalBtn.addEventListener('click', hideModal);
window.addEventListener('click', (e) => { if (e.target === uploadModal) hideModal(); });

// Handle form submission
uploadForm.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!currentUser) {
        alert("Authentication error. Cannot post video.");
        return;
    }

    const videoTitle = document.getElementById('video-title').value;
    const videoDesc = document.getElementById('video-desc').value;
    let videoLink = videoLinkInput.value;
    
    videoLinkInput.classList.remove('input-error');
    modalErrorContent.style.display = 'none'; 

    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = videoLink.match(youtubeRegex);

    if (match && match[1]) {
        const videoId = match[1];
        const params = new URLSearchParams({
            autoplay: 0,
            controls: 1,
            fs: 1,
            modestbranding: 1,
            rel: 0,
            showinfo: 0
        });
        videoLink = `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
    } else {
        videoLinkInput.classList.add('input-error');
        uploadFormWrapper.style.display = 'none';
        errorMessageElement.textContent = 'يرجى إدخال رابط فيديو YouTube صحيح.'; 
        modalErrorContent.style.display = 'flex';
        return;
    }

    videosRef.push({
        name: currentUser.name,
        videoTitle,
        videoDesc,
        videoLink,
        timestamp: Date.now(),
        uid: currentUser.uid,
        deviceId: currentUser.deviceId
    }).then(() => {
        uploadFormWrapper.style.display = 'none';
        modalSuccessContent.style.display = 'flex';
    }).catch(error => {
        console.error("Video upload error:", error);
        alert('حدث خطأ أثناء رفع الفيديو. (Permission Denied?)');
    });
});

// Confirmation button to close modal (Success)
confirmCloseBtn.addEventListener('click', () => {
    hideModal();
});

// Confirmation button to close error modal
confirmErrorCloseBtn.addEventListener('click', () => {
    modalErrorContent.style.display = 'none';
    uploadFormWrapper.style.display = 'block';
    videoLinkInput.classList.remove('input-error'); 
    videoLinkInput.focus();
});

// --- Search & Render Logic ---
function formatTimeAgo(timestamp) {
    const now = new Date();
    const seconds = Math.floor((now - new Date(timestamp)) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return `قبل ${Math.floor(interval)} سنوات`;
    
    interval = seconds / 2592000;
    if (interval > 1) return `قبل ${Math.floor(interval)} أشهر`;
    
    interval = seconds / 86400;
    if (interval > 1) return `قبل ${Math.floor(interval)} أيام`;
    
    interval = seconds / 3600;
    if (interval > 1) return `قبل ${Math.floor(interval)} ساعات`;
    
    interval = seconds / 60;
    if (interval > 1) return `قبل ${Math.floor(interval)} دقائق`;
    
    return 'قبل ثوانٍ قليلة';
}

function renderVideos(videosToRender) {
    videoContainer.innerHTML = '';
    
    if (videosToRender && videosToRender.length > 0) {
        videosToRender.forEach(video => {
            const videoCard = document.createElement('div');
            videoCard.classList.add('video-card');

            const videoInfo = document.createElement('div');
            videoInfo.classList.add('video-info');
            
            const fullDesc = video.videoDesc;
            const shortDesc = fullDesc.length > 100 ? fullDesc.substring(0, 100) + '...' : fullDesc;
            
            let isExpanded = false;

            videoInfo.innerHTML = `
                <div class="video-header">
                    <h3>${video.videoTitle}</h3>
                    <span class="video-timestamp"><i class="fas fa-clock"></i> ${formatTimeAgo(video.timestamp)}</span>
                </div>
                <span class="uploader-name"><i class="fas fa-user-circle"></i> ${video.name}</span>
                <p>${shortDesc}</p>
            `;

            if (fullDesc.length > 100) {
                const readMoreBtn = document.createElement('button');
                readMoreBtn.classList.add('read-more-btn');
                readMoreBtn.textContent = 'عرض المزيد';
                
                readMoreBtn.addEventListener('click', () => {
                    const descElement = videoInfo.querySelector('p');
                    isExpanded = !isExpanded;
                    descElement.textContent = isExpanded ? fullDesc : shortDesc;
                    readMoreBtn.textContent = isExpanded ? 'عرض أقل' : 'عرض المزيد';
                });
                
                videoInfo.appendChild(readMoreBtn);
            }

            const iframe = document.createElement('iframe');
            iframe.src = video.videoLink;
            iframe.frameBorder = "0";
            iframe.allowFullscreen = true;
            
            videoCard.appendChild(iframe);
            videoCard.appendChild(videoInfo);
            videoContainer.appendChild(videoCard);
        });
    } else {
        videoContainer.innerHTML = '<p class="no-videos-message">لم يتم العثور على فيديوهات تطابق معايير البحث.</p>';
    }
}

function filterVideos(searchTerm) {
    const term = searchTerm.toLowerCase().trim();
    if (!term) {
        renderVideos(allVideos);
        return;
    }

    const filtered = allVideos.filter(video => {
        const titleMatch = video.videoTitle && video.videoTitle.toLowerCase().includes(term);
        const nameMatch = video.name && video.name.toLowerCase().includes(term);
        
        return titleMatch || nameMatch;
    });

    renderVideos(filtered);
}

searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    filterVideos(searchInput.value);
});

searchInput.addEventListener('input', () => {
    filterVideos(searchInput.value);
});

// --- Main App Initialization ---
function loadInitialData() {
    auth.onAuthStateChanged((user) => {
        if (user) {
            // User is logged in.
            usersRef.child(user.uid).once('value').then((snapshot) => {
                if (snapshot.exists()) {
                    currentUser = { uid: user.uid, ...snapshot.val() };
                    checkUploadPermission(currentUser.uid); // Check permission for the *real* user
                } else {
                    console.error("User authenticated but no data in DB.");
                    currentUser = null;
                }
            });

            // Fetch and display videos (This will now work because user is authenticated)
            videosRef.on('value', (snapshot) => {
                const videos = snapshot.val();
                
                if (videos) {
                    allVideos = Object.keys(videos)
                        .map(key => ({ id: key, ...videos[key] }))
                        .sort((a, b) => b.timestamp - a.timestamp);
                } else {
                    allVideos = [];
                }

                if (searchInput.value) {
                    filterVideos(searchInput.value);
                } else {
                    renderVideos(allVideos);
                }
            });

        } else {
            // User is not logged in.
            currentUser = null;
            allVideos = [];
            renderVideos(allVideos); // Clear videos
            uploadBtn.style.display = 'none'; // Hide upload button
            console.log("User is not logged in. Redirecting...");
            // Redirect to login page
            // window.location.href = '../index.html'; 
        }
    });
}

// Start the app
document.addEventListener('DOMContentLoaded', loadInitialData);