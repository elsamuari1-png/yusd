// Firebase Config
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

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

// --- References ---
const usersRef = database.ref('users');
const groupsRef = database.ref('groups');
const reportsRef = database.ref('reports');
const permissionsRef = database.ref('uploadPermissions');
const videoPermissionsRef = database.ref('videoUploadPermissions');
const aiPostPermissionsRef = database.ref('aiPostPermissions');
const adminsRef = database.ref('admins');

// --- UI Elements ---
const loginContainer = document.getElementById('login-container');
const adminPanel = document.getElementById('admin-panel');
const loginForm = document.getElementById('loginForm');
const loginMessage = document.getElementById('loginMessage');
const logoutBtn = document.getElementById('logoutBtn');


// --- Authentication Logic ---

auth.onAuthStateChanged(async (user) => {
    if (user) {
        // User is signed in, check if they are an admin
        try {
            const adminSnapshot = await adminsRef.child(user.uid).once('value');
            if (adminSnapshot.exists() && adminSnapshot.val() === true) {
                // User is an admin
                loginContainer.style.display = 'none';
                adminPanel.style.display = 'block';
                initializeApp(); // Initialize the admin panel functionality
            } else {
                // User is not an admin
                displayMessage(loginMessage, 'Access denied. You are not an admin.', 'error');
                await auth.signOut(); // Sign out non-admin users
            }
        } catch (error) {
            console.error("Error checking admin status:", error);
            displayMessage(loginMessage, 'An error occurred during verification.', 'error');
            await auth.signOut();
        }
    } else {
        // User is signed out
        loginContainer.style.display = 'flex';
        adminPanel.style.display = 'none';
    }
});

const handleLogin = (e) => {
    e.preventDefault();
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;

    auth.signInWithEmailAndPassword(email, password)
        .catch(error => {
            console.error("Login failed:", error);
            let message = "An error occurred during login.";
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                message = "Invalid email or password.";
            }
            displayMessage(loginMessage, message, 'error');
        });
};

const handleLogout = () => {
    auth.signOut().catch(error => console.error("Logout failed:", error));
};

loginForm.addEventListener('submit', handleLogin);
logoutBtn.addEventListener('click', handleLogout);


// --- Main App Initialization (runs after successful admin login) ---

function initializeApp() {
    // --- Caching ---
    let allUsersCache = null;
    async function getAllUsers() {
        if (allUsersCache) return allUsersCache;
        try {
            const snapshot = await usersRef.once('value');
            allUsersCache = snapshot.exists() ? snapshot.val() : {};
            return allUsersCache;
        } catch (error) {
            console.error("Failed to fetch and cache users:", error);
            return {};
        }
    }

    // --- Helper Functions ---
    const copyIconSvg = `<svg viewBox="0 0 448 512"><path d="M384 336H192c-8.8 0-16-7.2-16-16V64c0-8.8 7.2-16 16-16l140.1 0L400 115.9V320c0 8.8-7.2 16-16 16zM192 384H384c35.3 0 64-28.7 64-64V115.9c0-12.7-5.1-24.9-14.1-33.9L366.1 14.1C357.1 5.1 344.9 0 332.1 0H192C147.8 0 112 35.8 112 80V320c0 35.3 28.7 64 64 64zM64 128c-35.3 0-64 28.7-64 64V448c0 35.3 28.7 64 64 64H256c35.3 0 64-28.7 64-64V416H272v32c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16V192c0-8.8 7.2-16 16-16H96V128H64z"/></svg>`;

    function copyToClipboard(text, element) {
        navigator.clipboard.writeText(text).then(() => {
            element.innerHTML = '✔️';
            element.style.color = 'var(--success-color)';
            setTimeout(() => {
                element.innerHTML = copyIconSvg;
                element.style.color = 'var(--secondary-color)';
            }, 1500);
        }).catch(err => console.error('Failed to copy text: ', err));
    }

    function displayMessage(element, text, type) {
        element.textContent = text;
        element.style.color = `var(--${type}-color)`;
    }

    async function findUserByEmail(email) {
        if (!email) return null;
        const snapshot = await usersRef.orderByChild('email').equalTo(email).once('value');
        if (!snapshot.exists()) return null;

        let user = { id: null, data: null };
        snapshot.forEach(childSnapshot => {
            user.id = childSnapshot.key;
            user.data = childSnapshot.val();
        });
        return user;
    }

    // --- Modal Management ---
    function setupModals() {
        const modalTriggers = {
            'showUsersBtn': 'usersModal',
            'manageUserBtn': 'manageUserModal',
            'chatBanBtn': 'chatBanModal',
            'verificationBtn': 'verificationModal',
            'manageGroupsBtn': 'manageGroupsModal',
            'showReportsBtn': 'reportsModal',
            'manageUploadBtn': 'uploadPermissionsModal',
            'manageOffersBtn': 'manageOffersModal',
            'manageVideoUploadBtn': 'videoUploadPermissionsModal',
            'chargeBalanceBtn': 'chargeBalanceModal',
            'manageAiModelsBtn': 'aiPostPermissionsModal'
        };

        const modals = document.querySelectorAll('.modal');
        const closeBtns = document.querySelectorAll('.close-btn');

        for (const [btnId, modalId] of Object.entries(modalTriggers)) {
            const btn = document.getElementById(btnId);
            const modal = document.getElementById(modalId);
            if (btn && modal) {
                btn.onclick = () => {
                    modal.style.display = 'block';
                    // Pre-fetch data when modal opens
                    if (modalId === 'usersModal') fetchAllUsers();
                    if (modalId === 'reportsModal') fetchReports();
                    if (modalId === 'verificationModal') fetchVerifiedUsers();
                    if (modalId === 'uploadPermissionsModal') fetchAllowedUsersByPermission('app');
                    if (modalId === 'videoUploadPermissionsModal') fetchAllowedUsersByPermission('video');
                    if (modalId === 'chargeBalanceModal') fetchUserBalances();
                    if (modalId === 'manageUserModal') fetchBannedUsers();
                    if (modalId === 'aiPostPermissionsModal') fetchAllowedUsersByPermission('ai_post');
                };
            }
        }

        const closeAllModals = () => modals.forEach(modal => modal.style.display = 'none');
        closeBtns.forEach(btn => btn.onclick = closeAllModals);
        window.onclick = (event) => {
            if (event.target.classList.contains('modal')) {
                closeAllModals();
            }
        };
    }

    // --- Data Fetching Functions ---
    async function fetchAllUsers() {
        const userCountEl = document.getElementById('userCount');
        const userListContainer = document.getElementById('userListContainer');
        userListContainer.innerHTML = '<p>Loading user list...</p>';
        try {
            const users = await getAllUsers();
            const userEntries = Object.entries(users);
            userCountEl.textContent = userEntries.length;

            if (userEntries.length > 0) {
                userListContainer.innerHTML = '';
                userEntries.forEach(([uid, user]) => {
                    const userItem = document.createElement('div');
                    userItem.className = 'user-item';
                    userItem.innerHTML = `
                        <div class="user-info">
                            <span class="name">${user.name || 'N/A'}</span>
                            <span class="email">${user.email || 'N/A'}</span>
                        </div>
                        <div class="user-actions">
                            <button class="copy-btn copy-name" title="Copy Name">${copyIconSvg}</button>
                            <button class="copy-btn copy-email" title="Copy Email">${copyIconSvg}</button>
                        </div>
                    `;
                    userItem.querySelector('.copy-name').onclick = (e) => copyToClipboard(user.name, e.currentTarget);
                    userItem.querySelector('.copy-email').onclick = (e) => copyToClipboard(user.email, e.currentTarget);
                    userListContainer.appendChild(userItem);
                });
            } else {
                userListContainer.innerHTML = '<p>No registered users yet.</p>';
            }
        } catch (error) {
            console.error("Error fetching all users:", error);
            userListContainer.innerHTML = '<p style="color: var(--error-color);">Error loading users.</p>';
        }
    }

    async function fetchReports() {
        const reportListContainer = document.getElementById('reportListContainer');
        const reportCountEl = document.getElementById('reportCount');
        reportListContainer.innerHTML = '<p>Loading reports...</p>';
        try {
            const [users, reportsSnapshot] = await Promise.all([getAllUsers(), reportsRef.once('value')]);

            if (!reportsSnapshot.exists()) {
                reportListContainer.innerHTML = '<p>No reports found.</p>';
                reportCountEl.textContent = 0;
                return;
            }

            const reportsData = reportsSnapshot.val();
            const sortedReports = Object.values(reportsData).sort((a, b) => b.timestamp - a.timestamp);
            reportCountEl.textContent = sortedReports.length;
            reportListContainer.innerHTML = '';

            sortedReports.forEach(report => {
                const reporterName = users[report.reporterUid]?.name || 'Unknown User';
                const reportedName = users[report.reportedUid]?.name || 'Unknown User';
                const reportDate = new Date(report.timestamp).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

                const reportItem = document.createElement('div');
                reportItem.className = 'report-item';
                reportItem.innerHTML = `
                    <div class="meta-info">
                        <span>From: <strong>${reporterName}</strong></span>
                        <span>Against: <strong>${reportedName}</strong></span>
                    </div>
                    <p class="description">${report.description}</p>
                    <span class="timestamp">${reportDate}</span>
                `;
                reportListContainer.appendChild(reportItem);
            });
        } catch (error) {
            console.error("Error fetching reports:", error);
            reportListContainer.innerHTML = '<p style="color: var(--error-color);">Error loading reports.</p>';
        }
    }

    async function fetchUserBalances() {
        const container = document.getElementById('userBalancesContainer');
        container.innerHTML = '<p>Loading balances...</p>';
        try {
            const users = await getAllUsers();
            const usersWithBalance = Object.values(users)
                .filter(user => typeof user.balance === 'number')
                .sort((a, b) => b.balance - a.balance);

            if (usersWithBalance.length === 0) {
                container.innerHTML = '<p>No users with balances found.</p>';
                return;
            }

            container.innerHTML = '';
            usersWithBalance.forEach(user => {
                const item = document.createElement('div');
                item.className = 'balance-item';
                item.innerHTML = `
                    <div class="user-details">
                        <span class="name">${user.name || 'N/A'}</span>
                        <span class="email">${user.email || 'N/A'}</span>
                    </div>
                    <div class="balance-amount">
                        ${(user.balance || 0).toFixed(2)} GT
                    </div>
                `;
                container.appendChild(item);
            });

        } catch (error) {
            console.error("Error fetching user balances:", error);
            container.innerHTML = '<p style="color: var(--error-color);">Error loading balances.</p>';
        }
    }

    async function fetchBannedUsers() {
        const container = document.getElementById('bannedUsersContainer');
        container.innerHTML = '<p>Loading banned users list...</p>';
        try {
            const users = await getAllUsers();
            const bannedUsers = Object.entries(users)
                .filter(([uid, user]) => user.isActive === false)
                .map(([uid, user]) => ({ uid, ...user }));

            if (bannedUsers.length === 0) {
                container.innerHTML = '<p>No banned users currently.</p>';
                return;
            }

            container.innerHTML = '';
            bannedUsers.forEach(user => {
                const item = document.createElement('div');
                item.className = 'user-item';
                item.innerHTML = `
                    <div class="user-info">
                        <span class="name">${user.name || 'N/A'}</span>
                        <span class="email">${user.email || 'N/A'}</span>
                    </div>
                    <button class="unban-btn" data-uid="${user.uid}">Unban</button>
                `;
                item.querySelector('.unban-btn').onclick = () => unbanUserByUid(user.uid);
                container.appendChild(item);
            });

        } catch (error) {
            console.error("Error fetching banned users:", error);
            container.innerHTML = '<p style="color: var(--error-color);">Error loading the list.</p>';
        }
    }

    async function fetchVerifiedUsers() {
        const container = document.getElementById('verifiedUserListContainer');
        container.innerHTML = '<p>Loading list...</p>';
        try {
            const users = await getAllUsers();
            const verifiedUsers = Object.entries(users)
                .filter(([uid, user]) => user.verificationBadgeUrl)
                .map(([uid, user]) => ({ uid, ...user }));

            if (verifiedUsers.length === 0) {
                container.innerHTML = '<p>No verified users found.</p>';
                return;
            }
            container.innerHTML = '';
            verifiedUsers.forEach(user => {
                const userItem = document.createElement('div');
                userItem.className = 'user-item verified';
                userItem.innerHTML = `
                    <div class="user-info">
                        <span class="name">${user.name}</span>
                        <span class="email">${user.email}</span>
                    </div>
                    <img src="${user.verificationBadgeUrl}" class="list-badge-icon" alt="Badge">
                    <button class="remove-btn" data-uid="${user.uid}">Remove</button>
                `;
                container.appendChild(userItem);
            });
            container.querySelectorAll('.remove-btn').forEach(button => {
                button.onclick = () => removeVerificationByUid(button.dataset.uid);
            });
        } catch (error) {
            console.error("Error fetching verified users:", error);
            container.innerHTML = '<p style="color: var(--error-color);">Error loading the list.</p>';
        }
    }

    // --- Core Management Functions ---

    async function unbanUserByUid(uid) {
        const messageEl = document.getElementById('messageGeneral');
        try {
            await usersRef.child(uid).update({ isActive: true });
            displayMessage(messageEl, 'User has been unbanned successfully.', 'success');
            fetchBannedUsers();
        } catch (error) {
            console.error("Error unbanning user by UID:", error);
            displayMessage(messageEl, 'An error occurred while unbanning.', 'error');
        }
    }

    async function updateUserBalance(action) {
        const emailInput = document.getElementById('userEmailBalance');
        const amountInput = document.getElementById('chargeAmount');
        const messageEl = document.getElementById('messageBalance');
        const email = emailInput.value.trim();
        const amount = parseFloat(amountInput.value);

        if (!email || !amount || amount <= 0) {
            displayMessage(messageEl, 'Please enter a valid email and a positive amount.', 'secondary');
            return;
        }

        try {
            const user = await findUserByEmail(email);
            if (!user) {
                displayMessage(messageEl, 'User not found.', 'error');
                return;
            }

            const currentBalance = user.data.balance || 0;
            const newBalance = action === 'add' ? currentBalance + amount : currentBalance - amount;
            const userName = user.data.name || email;

            await usersRef.child(user.id).update({ balance: newBalance });

            const actionText = action === 'add' ? 'added to' : 'deducted from';
            displayMessage(messageEl, `${amount} GT has been ${actionText} ${userName}. New balance: ${newBalance.toFixed(2)} GT.`, 'success');
            
            emailInput.value = '';
            amountInput.value = '';
            fetchUserBalances();
        } catch (error) {
            console.error("Error updating balance:", error);
            displayMessage(messageEl, 'An error occurred while updating the balance.', 'error');
        }
    }

    async function updateUserStatus(isBanned) {
        const emailInput = document.getElementById('userEmailGeneral');
        const messageEl = document.getElementById('messageGeneral');
        const email = emailInput.value.trim();

        if (!email) {
            displayMessage(messageEl, 'Please enter a user email.', 'secondary');
            return;
        }
        try {
            const user = await findUserByEmail(email);
            if (!user) {
                displayMessage(messageEl, 'User not found.', 'error');
                return;
            }
            await usersRef.child(user.id).update({ isActive: !isBanned });
            const actionText = isBanned ? 'banned' : 'unbanned';
            displayMessage(messageEl, `User has been ${actionText} successfully.`, 'success');
            emailInput.value = '';
            fetchBannedUsers();
        } catch (error) {
            console.error("Error updating user status:", error);
            displayMessage(messageEl, 'An error occurred.', 'error');
        }
    }

    async function updateOfferBanStatus(shouldBeBanned) {
        const emailInput = document.getElementById('userEmailOffers');
        const messageEl = document.getElementById('messageOffers');
        const email = emailInput.value.trim();

        if (!email) {
            displayMessage(messageEl, 'Please enter a user email.', 'secondary');
            return;
        }
        try {
            const user = await findUserByEmail(email);
            if (!user) {
                displayMessage(messageEl, 'User not found.', 'error');
                return;
            }
            await usersRef.child(user.id).update({ isOffersBanned: shouldBeBanned });
            const actionText = shouldBeBanned ? 'banned from offers' : 'unbanned from offers';
            displayMessage(messageEl, `User has been ${actionText} successfully.`, 'success');
            emailInput.value = '';
        } catch (error) {
            console.error("Error updating offer ban status:", error);
            displayMessage(messageEl, 'An error occurred.', 'error');
        }
    }

    async function updateChatBanStatus(banType, isBanned) {
        const emailInput = document.getElementById('userEmailChat');
        const messageEl = document.getElementById('messageChat');
        const email = emailInput.value.trim();
        if (!email) {
            displayMessage(messageEl, 'Please enter a user email.', 'secondary');
            return;
        }
        try {
            const user = await findUserByEmail(email);
            if (!user) {
                displayMessage(messageEl, 'User not found.', 'error');
                return;
            }
            const banField = banType === 'public' ? 'isPublicChatBanned' : 'isPrivateChatBanned';
            await usersRef.child(user.id).update({ [banField]: isBanned });
            const actionText = isBanned ? 'banned from' : 'unbanned from';
            const scopeText = banType === 'public' ? 'public chat' : 'private chat';
            displayMessage(messageEl, `User ${actionText} ${scopeText} successfully.`, 'success');
            emailInput.value = '';
        } catch (error) {
            displayMessage(messageEl, 'An error occurred while updating ban status.', 'error');
        }
    }

    async function updateGroupBanStatus(shouldBeBanned) {
        const identifierInput = document.getElementById('groupNameOrIdInput');
        const messageEl = document.getElementById('messageGroups');
        const identifier = identifierInput.value.trim();
        if (!identifier) {
            displayMessage(messageEl, 'Please enter a group name or ID.', 'secondary');
            return;
        }
        try {
            let groupSnapshot = await groupsRef.orderByChild('name').equalTo(identifier).once('value');
            if (!groupSnapshot.exists()) {
                groupSnapshot = await groupsRef.orderByChild('joinId').equalTo(identifier).once('value');
            }
            if (!groupSnapshot.exists()) {
                displayMessage(messageEl, 'Group or channel not found.', 'error');
                return;
            }
            let groupKey;
            groupSnapshot.forEach(child => { groupKey = child.key; });
            await groupsRef.child(groupKey).update({ isBanned: shouldBeBanned });
            const actionText = shouldBeBanned ? 'banned' : 'unbanned';
            displayMessage(messageEl, `Group/channel ${actionText} successfully.`, 'success');
            identifierInput.value = '';
        } catch (error) {
            console.error("Error updating group ban status:", error);
            displayMessage(messageEl, 'An error occurred.', 'error');
        }
    }

    async function updateVerification(action) {
        const emailInput = document.getElementById('userEmailVerification');
        const badgeUrlInput = document.getElementById('badgeUrl');
        const messageEl = document.getElementById('messageVerification');
        const email = emailInput.value.trim();
        const badgeUrl = badgeUrlInput.value.trim();

        if (!email) {
            displayMessage(messageEl, 'Please enter a user email.', 'secondary');
            return;
        }
        if (action === 'add' && !badgeUrl) {
            displayMessage(messageEl, 'Please provide a URL for the badge.', 'secondary');
            return;
        }
        try {
            const user = await findUserByEmail(email);
            if (!user) {
                displayMessage(messageEl, 'User not found.', 'error');
                return;
            }
            if (action === 'add') {
                await usersRef.child(user.id).update({ verificationBadgeUrl: badgeUrl });
                displayMessage(messageEl, 'Verification badge added/updated successfully.', 'success');
            } else {
                await usersRef.child(user.id).child('verificationBadgeUrl').remove();
                displayMessage(messageEl, 'Verification badge removed successfully.', 'success');
            }
            emailInput.value = '';
            badgeUrlInput.value = '';
            fetchVerifiedUsers();
        } catch (error) {
            console.error("Verification update error:", error);
            displayMessage(messageEl, 'An error occurred.', 'error');
        }
    }

    async function removeVerificationByUid(uid) {
        const messageEl = document.getElementById('messageVerification');
        try {
            await usersRef.child(`${uid}/verificationBadgeUrl`).remove();
            displayMessage(messageEl, 'Verification removed successfully.', 'success');
            fetchVerifiedUsers();
        } catch (error) {
            console.error("Error removing verification:", error);
            displayMessage(messageEl, 'An error occurred.', 'error');
        }
    }

    // --- Refactored Permissions Management ---
    async function updatePermission(permissionType, action) {
        const refs = {
            app: { emailInput: document.getElementById('userEmailPermissions'), messageEl: document.getElementById('messagePermissions'), permissionRef: permissionsRef, fetchFn: () => fetchAllowedUsersByPermission('app'), name: 'Upload permission' },
            video: { emailInput: document.getElementById('userEmailVideoUpload'), messageEl: document.getElementById('messageVideoUpload'), permissionRef: videoPermissionsRef, fetchFn: () => fetchAllowedUsersByPermission('video'), name: 'Video upload permission' },
            ai_post: { emailInput: document.getElementById('userEmailAiPermissions'), messageEl: document.getElementById('messageAiPermissions'), permissionRef: aiPostPermissionsRef, fetchFn: () => fetchAllowedUsersByPermission('ai_post'), name: 'AI model posting permission' }
        };
        const ref = refs[permissionType];
        const email = ref.emailInput.value.trim();

        if (!email) {
            displayMessage(ref.messageEl, 'Please enter a user email.', 'secondary');
            return;
        }
        try {
            const user = await findUserByEmail(email);
            if (!user) {
                displayMessage(ref.messageEl, 'User not found.', 'error');
                return;
            }

            const actionText = action === 'add' ? 'granted' : 'removed';
            if (action === 'add') {
                await ref.permissionRef.child(user.id).set(true);
            } else {
                await ref.permissionRef.child(user.id).remove();
            }
            displayMessage(ref.messageEl, `${ref.name} ${actionText} successfully.`, 'success');
            ref.emailInput.value = '';
            ref.fetchFn();
        } catch (error) {
            console.error(`${permissionType} permission update error:`, error);
            displayMessage(ref.messageEl, 'An error occurred.', 'error');
        }
    }

    async function fetchAllowedUsersByPermission(permissionType) {
        const refs = {
            app: { container: document.getElementById('allowedUserListContainer'), permissionRef: permissionsRef, removeFn: (uid) => removePermissionByUid('app', uid) },
            video: { container: document.getElementById('allowedVideoUsersListContainer'), permissionRef: videoPermissionsRef, removeFn: (uid) => removePermissionByUid('video', uid) },
            ai_post: { container: document.getElementById('allowedAiUserListContainer'), permissionRef: aiPostPermissionsRef, removeFn: (uid) => removePermissionByUid('ai_post', uid) }
        };
        const ref = refs[permissionType];
        ref.container.innerHTML = '<p>Loading list...</p>';
        try {
            const [permissionsSnapshot, allUsers] = await Promise.all([ref.permissionRef.once('value'), getAllUsers()]);
            if (!permissionsSnapshot.exists()) {
                ref.container.innerHTML = '<p>No users currently have this permission.</p>';
                return;
            }

            const allowedUids = Object.keys(permissionsSnapshot.val());
            ref.container.innerHTML = '';
            allowedUids.forEach(uid => {
                const user = allUsers[uid];
                if (user) {
                    const userItem = document.createElement('div');
                    userItem.className = 'user-item verified';
                    userItem.innerHTML = `
                        <div class="user-info">
                            <span class="name">${user.name || 'N/A'}</span>
                            <span class="email">${user.email || 'N/A'}</span>
                        </div>
                        <button class="remove-btn" data-uid="${uid}">Remove</button>
                    `;
                    userItem.querySelector('.remove-btn').onclick = () => ref.removeFn(uid);
                    ref.container.appendChild(userItem);
                }
            });
        } catch (error) {
            console.error(`Error fetching allowed ${permissionType} users:`, error);
            ref.container.innerHTML = '<p style="color: var(--error-color);">Error loading the list.</p>';
        }
    }

    async function removePermissionByUid(permissionType, uid) {
        const refs = {
            app: { messageEl: document.getElementById('messagePermissions'), permissionRef: permissionsRef, fetchFn: () => fetchAllowedUsersByPermission('app'), name: 'Permission' },
            video: { messageEl: document.getElementById('messageVideoUpload'), permissionRef: videoPermissionsRef, fetchFn: () => fetchAllowedUsersByPermission('video'), name: 'Permission' },
            ai_post: { messageEl: document.getElementById('messageAiPermissions'), permissionRef: aiPostPermissionsRef, fetchFn: () => fetchAllowedUsersByPermission('ai_post'), name: 'Permission' }
        };
        const ref = refs[permissionType];
        try {
            await ref.permissionRef.child(uid).remove();
            displayMessage(ref.messageEl, `${ref.name} removed successfully.`, 'success');
            ref.fetchFn();
        } catch (error) {
            console.error(`Error removing ${permissionType} permission by UID:`, error);
            displayMessage(ref.messageEl, 'An error occurred.', 'error');
        }
    }
    
    // --- Event Listeners ---
    // (Ensure they are not duplicated if initializeApp can be called multiple times)
    if (!document.getElementById('showUsersBtn').hasAttribute('data-initialized')) {
        setupModals();

        document.getElementById('searchInput').addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            document.querySelectorAll('#userListContainer .user-item').forEach(item => {
                const name = item.querySelector('.name').textContent.toLowerCase();
                const email = item.querySelector('.email').textContent.toLowerCase();
                item.style.display = (name.includes(searchTerm) || email.includes(searchTerm)) ? 'flex' : 'none';
            });
        });

        document.getElementById('addBalanceBtn').addEventListener('click', () => updateUserBalance('add'));
        document.getElementById('deductBalanceBtn').addEventListener('click', () => updateUserBalance('deduct'));
        document.getElementById('banUserBtn').addEventListener('click', () => updateUserStatus(true));
        document.getElementById('unbanUserBtn').addEventListener('click', () => updateUserStatus(false));
        document.getElementById('banOffersBtn').addEventListener('click', () => updateOfferBanStatus(true));
        document.getElementById('unbanOffersBtn').addEventListener('click', () => updateOfferBanStatus(false));
        document.getElementById('banPublicChatBtn').addEventListener('click', () => updateChatBanStatus('public', true));
        document.getElementById('unbanPublicChatBtn').addEventListener('click', () => updateChatBanStatus('public', false));
        document.getElementById('banPrivateChatBtn').addEventListener('click', () => updateChatBanStatus('private', true));
        document.getElementById('unbanPrivateChatBtn').addEventListener('click', () => updateChatBanStatus('private', false));
        document.getElementById('banGroupBtn').addEventListener('click', () => updateGroupBanStatus(true));
        document.getElementById('unbanGroupBtn').addEventListener('click', () => updateGroupBanStatus(false));
        document.getElementById('addVerificationBtn').addEventListener('click', () => updateVerification('add'));
        document.getElementById('removeVerificationBtn').addEventListener('click', () => updateVerification('remove'));
        document.getElementById('addAppPermissionBtn').addEventListener('click', () => updatePermission('app', 'add'));
        document.getElementById('removeAppPermissionBtn').addEventListener('click', () => updatePermission('app', 'remove'));
        document.getElementById('addVideoPermissionBtn').addEventListener('click', () => updatePermission('video', 'add'));
        document.getElementById('removeVideoPermissionBtn').addEventListener('click', () => updatePermission('video', 'remove'));
        document.getElementById('addAiPermissionBtn').addEventListener('click', () => updatePermission('ai_post', 'add'));
        document.getElementById('removeAiPermissionBtn').addEventListener('click', () => updatePermission('ai_post', 'remove'));
        
        // Mark as initialized
        document.querySelectorAll('.action-btn').forEach(btn => btn.setAttribute('data-initialized', 'true'));
    }
}