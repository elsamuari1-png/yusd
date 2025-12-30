import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  push,
  set,
  get,
  onDisconnect,
  runTransaction,
  update,
  query,
  orderByChild,
  limitToLast,
  remove,
  equalTo,
  endBefore,
  limitToFirst,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";

const STRINGS = {
    chooseChat: "اختر شخص للدردشة",
    typing: "يكتب الآن...",
    editedLabel: "(تم التعديل)",
    publicChat: "الدردشة العامة",
    forwardedMessage: "رسالة محولة",
    changesSaved: "تم حفظ التغييرات بنجاح.",
    saveChangesError: "حدث خطأ أثناء حفظ التغييرات.",
    nameCopied: "تم نسخ الاسم.",
    idCopied: "تم نسخ المعرف.",
    actionError: "حدث خطأ أثناء تنفيذ الإجراء.",
    fillAllFields: "الرجاء ملء جميع الحقول.",
    selectChatFirst: "الرجاء تحديد دردشة أولاً.",
    noLinksAllowed: "إرسال الروابط غير مسموح به.",
    noMessagesToEdit: "لا توجد رسائل أرسلتها بعد لتعديلها.",
    forwardTo: "إعادة توجيه إلى...",
    messageForwarded: "تم إعادة توجيه الرسالة بنجاح.",
    forwardError: "حدث خطأ أثناء إعادة التوجيه.",
    replyingTo: "يتم الرد على",
    reactionAdded: "تمت إضافة التفاعل.",
    reactionError: "خطأ في إضافة التفاعل.",
    pollCreated: "تم إنشاء الاستطلاع بنجاح.",
    pollCreationError: "حدث خطأ أثناء إنشاء الاستطلاع.",
    voteCast: "تم تسجيل صوتك.",
    alreadyVoted: "لقد قمت بالتصويت بالفعل في هذا الاستطلاع.",
    voteError: "حدث خطأ أثناء التصويت.",
    reportReasonRequired: "يرجى تقديم سبب للإبلاغ.",
    reportError: "حدث خطأ أثناء إرسال الإبلاغ.",
    reportSuccess: "تم إرسال بلاغك بنجاح.",
    cannotReportSelf: "لا يمكنك الإبلاغ عن نفسك.",
    userDataNotFound: "بيانات المستخدم غير موجودة.",
    reportDialogTitle: (name) => `إبلاغ عن: ${name}`,
    accountBanned: "حسابك محظور بشكل عام. تواصل مع الدعم.",
    publicChatBanned: "أنت محظور من الدردشة العامة. تواصل مع الدعم.",
    privateChatBanned: "أنت محظور من الدردشة الخاصة. تواصل مع الدعم.",
    groupDoesNotExist: "هذه المجموعة لم تعد موجودة.",
    groupIsBanned: "تم حظر هذه المجموعة من قبل الإدارة.",
    bannedFromGroup: "أنت محظور من هذه المجموعة.",
    joinGroupError: "حدث خطأ أثناء الانجماس للمجموعة.",
    joinGroupSuccess: "تم الانضمام للمجموعة بنجاح!",
    mustJoinToSend: "يجب أن تنضم للمجموعة لإرسال الرسائل.",
    chatDisabledByOwner: "الدردشة معطلة حاليًا من قبل مالك المجموعة.",
    ownerOnly: "فقط مالك المجموعة يمكنه تغيير هذا الإعداد.",
    channelPostingRestricted: "فقط المشرفون والمالك يمكنهم النشر في هذه القناة.",
    groupCreationError: "حدث خطأ أثناء إنشاء المجموعة.",
    groupCreatedSuccess: (type) => `تم إنشاء ${type === "group" ? "المجموعة" : "القناة"} بنجاح!`,
    noGroupSelected: "لم يتم تحديد أي مجموعة.",
    chatStatusUpdated: (enabled) => `الدردشة في المجموعة الآن ${enabled ? 'مفعلة' : 'معطلة'}.`,
    chatStatusUpdateError: "حدث خطأ أثناء تحديث حالة الدردشة.",
    confirmGroupDelete: "هل أنت متأكد من رغبتك في حذف هذه المجموعة نهائيًا؟ لا يمكن التراجع عن هذا الإجراء.",
    groupDeletedSuccess: "تم حذف المجموعة بنجاح.",
    cannotManageOwner: "لا يمكنك إدارة مالك المجموعة.",
    cannotManageHigherMod: "لا يمكنك إدارة مشرف يمتلك صلاحيات مساوية لك أو أعلى.",
    userBanned: (name) => `تم حظر ${name} من المجموعة.`,
    permissionsUpdated: "تم تحديث الصلاحيات بنجاح.",
    joinIdResetSuccess: "تم إعادة تعيين مُعرّف المجموعة بنجاح.",
    joinIdResetConfirm: "هل أنت متأكد من إعادة تعيين المُعرّف؟ يمكنك فعل هذا مرة كل أسبوع فقط. المُعرّف القديم سيتوقف عن العمل.",
    joinIdResetCooldown: (date) => `لقد قمت بإعادة تعيين المُعرّف مؤخراً. يمكنك المحاولة مرة أخرى في: ${date}`,
    confirmMessageDelete: "هل أنت متأكد من حذف هذه الرسالة؟",
    deleteError: "حدث خطأ أثناء الحذف.",
    editSaveError: "حدث خطأ أثناء حفظ التعديل.",
    pinMessageConfirm: "هل تريد تثبيت هذه الرسالة في أعلى المحادثة؟",
    unpinMessageConfirm: "هل تريد إلغاء تثبيت الرسالة الحالية؟",
    messagePinned: "تم تثبيت الرسالة بنجاح.",
    messageUnpinned: "تم إلغاء تثبيت الرسالة.",
    pinError: "حدث خطأ أثناء التثبيت.",
    pinAction: "تثبيت الرسالة",
    unpinAction: "إلغاء تثبيت الرسالة",
    forwardAction: "إعادة توجيه",
    replyAction: "رد",
    reactAction: "إضافة تفاعل",
};

const firebaseConfig = {
  apiKey: "AIzaSyAGFDJB-BMTBkYgIbeC8yvc8Wj2xgbJYcE",
  authDomain: "dark-web-egypt.firebaseapp.com",
  databaseURL: "https://dark-web-egypt-default-rtdb.firebaseio.com",
  projectId: "dark-web-egypt",
  storageBucket: "dark-web-egypt.firebasestorage.app",
  messagingSenderId: "870284326251",
  appId: "1:870284326251:web:197879a1d14b7b465e082e",
  measurementId: "G-YLEEHR23FX",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const uid = localStorage.getItem("uid");
const name = localStorage.getItem("name");
const photoURL = localStorage.getItem("photoURL");
const bio = localStorage.getItem("bio");
const verificationBadgeUrl = localStorage.getItem("verificationBadgeUrl");
const currentUserStatus = {
  isActive: localStorage.getItem("isActive") === "true",
  isPublicChatBanned: localStorage.getItem("isPublicChatBanned") === "true",
  isPrivateChatBanned: localStorage.getItem("isPrivateChatBanned") === "true",
};

if (!uid || !name) location.href = "chat.html";

let currentChatId = null;
let currentChatName = null;
let currentOtherUid = null;
let currentGroupData = null;
let userListeners = [];
let allUsersData = {};
let reportingUserId = null;
let selectedMemberForManagement = {};
let selectedMessageForAction = {};
let confirmCallback = null;
let replyingToMessage = null;
let messageObserver = null; 
let firstMessageKey = null;
let isLoadingMore = false;
let lastMessageCount = 0; // متغير جديد لتتبع عدد الرسائل


const chatHeaderEl = document.getElementById("chatHeader");
const typingIndicatorEl = document.getElementById("typingIndicator");
const messageInputEl = document.getElementById("messageInput");
const sendMessageBtn = document.getElementById('sendMessageBtn');
const createPollBtn = document.getElementById('createPollBtn');
const chatInputBarEl = document.querySelector(".input-bar");
const messageLoaderEl = document.getElementById("messageLoader");
const pinnedMessageBarEl = document.getElementById("pinnedMessageBar");
const pinnedMessageTextEl = document.getElementById("pinnedMessageText");
const replyPreviewEl = document.getElementById('replyPreview');
const mentionSuggestionsEl = document.getElementById('mentionSuggestions');
const reactionPickerEl = document.getElementById('reactionPicker');
const listsViewEl = document.getElementById('listsView');
const chatViewEl = document.getElementById('chatView');
const messagesEl = document.getElementById("messages");
const chatHeaderAvatarEl = document.getElementById('chatHeaderAvatar'); 

const createGroupDialogEl = document.getElementById("createGroupDialog");
const reportDialogEl = document.getElementById("reportDialog");
const groupSettingsSheetEl = document.getElementById("groupSettingsSheet");
const profileSheetEl = document.getElementById("profileSheet");
const permissionsManagementDialogEl = document.getElementById("permissionsManagementDialog");
const messageActionsSheetEl = document.getElementById("messageActionsSheet");
const editMessageDialogEl = document.getElementById("editMessageDialog");
const confirmDialogEl = document.getElementById("confirmDialog");
const forwardDialogEl = document.getElementById("forwardDialog");
const createPollDialogEl = document.getElementById("createPollDialog");
const userProfileDialogEl = document.getElementById("userProfileDialog");
const chatDialogEl = document.getElementById("chatDialog");


const showDialog = (message) => {
  document.getElementById("dialogMessage").textContent = message;
  chatDialogEl.classList.add("active");
};

const showConfirmDialog = (message, onConfirm) => {
    document.getElementById("confirmDialogMessage").textContent = message;
    confirmCallback = onConfirm;
    confirmDialogEl.classList.add('active');
};

function sanitizeText(text) {
  const element = document.createElement("div");
  element.textContent = text;
  return element.innerHTML;
}

function formatTime(timestamp) {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString('ar-EG', { hour: 'numeric', minute: '2-digit' });
}

function formatMessageText(text) {
    if (!text) return "";
    let sanitized = sanitizeText(text);
    sanitized = sanitized.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    sanitized = sanitized.replace(/\*(.*?)\*/g, '<em>$1</em>');
    sanitized = sanitized.replace(/`(.*?)`/g, '<code>$1</code>');
    sanitized = sanitized.replace(/@(\w+)/g, (match, username) => {
        const mentionedUser = Object.values(allUsersData).find(u => u.name === username);
        if (mentionedUser) {
            const isMe = mentionedUser.uid === uid;
            return `<span class="mention ${isMe ? 'mention-me' : ''}" data-uid="${mentionedUser.uid}">@${username}</span>`;
        }
        return match;
    });
    return sanitized;
}

const copyToClipboard = (text, successMessage) => {
    navigator.clipboard.writeText(text).then(() => {
        showDialog(successMessage);
    }).catch(err => {
        console.error('Copy failed', err);
    });
};

set(ref(db, `users/${uid}/isOnline`), true);
onDisconnect(ref(db, `users/${uid}/isOnline`)).set(false);
onDisconnect(ref(db, `users/${uid}/isTyping`)).set(false);

function unsubscribeAll() {
  userListeners.forEach((unsub) => unsub());
  userListeners = [];
  if (messageObserver) messageObserver.disconnect();
  firstMessageKey = null; 
  isLoadingMore = false;
  lastMessageCount = 0; // إعادة تعيين عداد الرسائل
}

function setupNavigation() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const listContainers = document.querySelectorAll('.list-container');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const viewId = btn.dataset.view;
            listContainers.forEach(container => {
                if (container.id === viewId) {
                    container.classList.add('active');
                } else {
                    container.classList.remove('active');
                }
            });
            
            if (viewId === 'groupsSearchView') onValue(ref(db, "groups"), snap => renderGroups(snap, ''));
            if (viewId === 'userSearchView') onValue(ref(db, "users"), snap => renderUsers(snap, ''));
        });
    });

    document.getElementById('backToListsBtn').addEventListener('click', () => {
        chatViewEl.classList.remove('active');
        listsViewEl.classList.remove('inactive');
        unsubscribeAll(); 
        currentChatId = null; 
        currentGroupData = null;
        currentOtherUid = null;
        chatHeaderEl.textContent = STRINGS.chooseChat;
    });
}
setupNavigation();

async function renderRecentChats(listElementId) {
    const recentChatsListEl = document.getElementById(listElementId);
    if (!recentChatsListEl) return;
    recentChatsListEl.innerHTML = "";

    const userChatsRef = query(ref(db, `users/${uid}/chats`), orderByChild('timestamp'));
    
    get(userChatsRef).then(userChatsSnap => {
        if (!userChatsSnap.exists()) return;

        const chatPromises = [];
        userChatsSnap.forEach(childSnap => {
            const chatId = childSnap.key;
            const chatPromise = get(ref(db, `conversations/${chatId}`)).then(async (snap) => {
                if (snap.exists()) {
                    const chatData = snap.val();
                    const unreadSnap = await get(ref(db, `unreadCounts/${uid}/${chatId}`));
                    chatData.unreadCount = unreadSnap.val() || 0;
                    return { id: chatId, ...chatData };
                }
                return null;
            });
            chatPromises.push(chatPromise);
        });

        Promise.all(chatPromises).then(async (chats) => {
            const validChats = chats.filter(Boolean);
            validChats.reverse(); 

            recentChatsListEl.innerHTML = "";
            for (const chat of validChats) {
                const li = await createRecentChatItem(chat, listElementId === 'forwardChatList');
                if (li) recentChatsListEl.appendChild(li);
            }
        });
    });
}

async function createRecentChatItem(chat, isForForwarding = false) {
    const li = document.createElement("li");
    li.dataset.chatId = chat.id;

    let chatName, imageUrl, otherUserId = null;

    if (chat.isGroup) {
        const groupSnap = await get(ref(db, `groups/${chat.id}`));
        if (!groupSnap.exists()) return null;
        const groupData = groupSnap.val();
        chatName = groupData.name;
        imageUrl = groupData.imageUrl;
    } else {
        otherUserId = chat.id.replace(uid, "").replace("_", "");
        const userSnap = await get(ref(db, `users/${otherUserId}`));
        if (!userSnap.exists()) return null;
        const userData = userSnap.val();
        chatName = userData.name;
        imageUrl = userData.photoURL;
    }

    if (isForForwarding) {
        li.onclick = () => confirmForward(chat.id, chatName);
    } else {
        li.onclick = chat.isGroup ? () => openGroupChat(chat.id, chatName, imageUrl) : () => openChat(otherUserId, chatName, imageUrl);
    }

    const unreadCount = chat.unreadCount || 0;
    const badgeHTML = unreadCount > 0 ? `<span class="unread-badge">${unreadCount > 99 ? '99+' : unreadCount}</span>` : '';

    li.innerHTML = `
        <div class="avatar-wrapper">
            <img src="${sanitizeText(imageUrl)}" class="user-avatar" alt="Avatar for ${sanitizeText(chatName)}">
        </div>
        <div class="chat-info-container">
            <div class="chat-info-header">
                <span class="user-name">${sanitizeText(chatName)}</span>
                ${!isForForwarding ? `<span class="last-message-time">${formatTime(chat.lastMessageTimestamp)}</span>` : ''}
            </div>
            <div class="chat-info-footer">
                 ${!isForForwarding ? `<span class="last-message">${sanitizeText(chat.lastMessage || "")}</span>` : ''}
                 ${badgeHTML}
            </div>
        </div>
    `;
    return li;
}

function renderUsers(snap, searchTerm = "") {
  const list = document.getElementById("usersList");
  list.innerHTML = "";
  snap.forEach((child) => {
    if (child.key === uid) return;
    const d = child.val();

    if (d.name && d.name.toLowerCase().includes(searchTerm)) {
      const li = document.createElement("li");
      const bioText = d.bio ? sanitizeText(d.bio) : 'مستخدم جديد';
      
      li.innerHTML = `
        <div class="avatar-wrapper">
            <img src="${sanitizeText(d.photoURL)}" class="user-avatar" alt="Avatar for ${sanitizeText(d.name)}">
        </div>
        <div class="chat-info-container">
            <span class="user-name">${sanitizeText(d.name)} ${d.verificationBadgeUrl ? `<img src="${sanitizeText(d.verificationBadgeUrl)}" class="verification-badge-inline" alt="Verification Badge">` : ""}</span>
            <span class="user-bio">${bioText}</span>
        </div>
      `;
      li.onclick = () => openChat(child.key, d.name, d.photoURL);
      list.appendChild(li);
    }
  });
}

function renderGroups(groupsSnap, searchTerm = "") {
  const groupsListEl = document.getElementById("groupsList");
  groupsListEl.innerHTML = "";

  groupsSnap.forEach((groupSnap) => {
    const groupData = groupSnap.val();
    if (!groupData.name || groupData.isBanned) return;

    if (groupData.name.toLowerCase().includes(searchTerm) || (groupData.joinId || "").includes(searchTerm)) {
      const li = document.createElement("li");
      const memberCount = Object.keys(groupData.members || {}).length;
      
      const categoryMap = {
          "programming": "البرمجة",
          "content-creation": "إنشاء محتوى",
          "language-learning": "تعليم لغات"
      };
      const categoryDisplayName = categoryMap[groupData.category] || groupData.category;
      const isMember = groupData.members && groupData.members[uid];

      li.innerHTML = `
          <div class="avatar-wrapper">
              <img src="${sanitizeText(groupData.imageUrl)}" class="user-avatar" alt="Avatar for ${sanitizeText(groupData.name)}">
          </div>
          <div class="chat-info-container">
              <div class="chat-info-header">
                  <span class="user-name">${sanitizeText(groupData.name)}</span>
                  <div class="member-count">
                      <i class="fas fa-users"></i>
                      <span>${memberCount}</span>
                  </div>
              </div>
              <div class="chat-info-footer">
                  <span class="group-category">${sanitizeText(categoryDisplayName)}</span>
              </div>
          </div>
      `;

      if (isMember) {
        li.onclick = () => openGroupChat(groupSnap.key, groupData.name, groupData.imageUrl);
      } else {
        const joinBtn = document.createElement("button");
        joinBtn.textContent = "انضمام";
        joinBtn.className = "join-btn";
        joinBtn.onclick = (e) => {
            e.stopPropagation();
            joinGroup(groupSnap.key);
        };
        li.querySelector('.chat-info-footer').appendChild(joinBtn);
      }
      groupsListEl.appendChild(li);
    }
  });
}

onValue(ref(db, "users"), (snap) => {
    allUsersData = snap.val() || {};
    const searchInput = document.getElementById("searchInput");
    if (document.body.contains(searchInput)) {
       const searchTerm = searchInput.value.toLowerCase().trim();
       renderUsers(snap, searchTerm);
    }
});

onValue(ref(db, "groups"), (snap) => {
    const groupsData = snap.val();
    if (currentGroupData && groupsData && groupsData[currentGroupData.key]) {
        currentGroupData = { key: currentGroupData.key, ...groupsData[currentGroupData.key] };
        if (groupSettingsSheetEl.classList.contains('active')) {
            renderMemberList();
            setupAdminControls();
        }
        renderPinnedMessage();
    }

    const groupSearchInput = document.getElementById("groupSearchInput");
    if(document.body.contains(groupSearchInput)){
      const searchTerm = groupSearchInput.value.toLowerCase().trim();
      renderGroups(snap, searchTerm);
    }
});

onValue(ref(db, `unreadCounts/${uid}`), () => {
    if (!currentChatId) {
        renderRecentChats('recentChatsList');
    }
});

function initializeMessageObserver() {
    if (messageObserver) messageObserver.disconnect();

    messageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const card = entry.target;
                const msgId = card.dataset.msgId;
                
                const msgReadRef = ref(db, `conversations/${currentChatId}/messages/${msgId}/readBy/${uid}`);
                set(msgReadRef, true);

                messageObserver.unobserve(card);
            }
        });
    }, { threshold: 0.8 });
}

function showChatView() {
    listsViewEl.classList.add('inactive');
    chatViewEl.classList.add('active');
    messagesEl.innerHTML = '';
}

async function openChat(otherUid, otherName, imageUrl) {
  if (!currentUserStatus.isActive) return showDialog(STRINGS.accountBanned);
  if (currentUserStatus.isPrivateChatBanned) return showDialog(STRINGS.privateChatBanned);

  unsubscribeAll();
  showChatView();

  currentOtherUid = otherUid;
  currentChatName = otherName;
  currentChatId = [uid, otherUid].sort().join("_");
  currentGroupData = null;
  
  initializeMessageObserver();
  
  createPollBtn.style.display = 'none';

  const chatTimestamp = Date.now();
  const updates = {};
  updates[`/users/${uid}/chats/${currentChatId}`] = { timestamp: chatTimestamp };
  updates[`/users/${otherUid}/chats/${currentChatId}`] = { timestamp: chatTimestamp };
  update(ref(db), updates);

  set(ref(db, `unreadCounts/${uid}/${currentChatId}`), 0);
  renderRecentChats('recentChatsList');

  chatHeaderEl.textContent = otherName;
  chatHeaderAvatarEl.src = sanitizeText(imageUrl); 
  typingIndicatorEl.style.display = "none";
  chatInputBarEl.style.display = 'flex';
  pinnedMessageBarEl.style.display = 'none';
  document.querySelector("#chatView .chatHeader").style.cursor = "pointer";

  const typingRef = ref(db, `users/${otherUid}/isTyping`);
  userListeners.push(onValue(typingRef, (snap) => {
    typingIndicatorEl.textContent = `${otherName} ${STRINGS.typing}`;
    typingIndicatorEl.style.display = snap.val() ? "flex" : "none";
  }));

  const msgsRef = query(ref(db, `conversations/${currentChatId}/messages`), orderByChild('timestamp'), limitToLast(50));
  messageLoaderEl.style.display = "flex";
  const unsub = onValue(msgsRef, (snap) => {
    renderMessages(snap, false);
  });
  userListeners.push(unsub);
}

async function openGroupChat(groupId, groupName, imageUrl) {
  if (!currentUserStatus.isActive) return showDialog(STRINGS.accountBanned);

  unsubscribeAll();
  showChatView();

  const groupRef = ref(db, `groups/${groupId}`);
  const groupSnap = await get(groupRef);
  if (!groupSnap.exists()) return showDialog(STRINGS.groupDoesNotExist);

  currentGroupData = groupSnap.val();
  currentGroupData.key = groupId;

  if (currentGroupData.isBanned) {
      currentGroupData = null;
      return showDialog(STRINGS.groupIsBanned);
  }
  
  initializeMessageObserver();

  currentChatId = groupId;
  currentChatName = groupName;
  currentOtherUid = null;
  document.querySelector("#chatView .chatHeader").style.cursor = "pointer";

  chatHeaderEl.textContent = currentChatName;
  chatHeaderAvatarEl.src = sanitizeText(imageUrl); 
  typingIndicatorEl.style.display = "none";

  const moderators = currentGroupData.moderators || {};
  const isOwner = uid === currentGroupData.ownerUid;
  const isMod = moderators[uid];
  const isOwnerOrMod = isOwner || isMod;

  const isChatAllowed = currentGroupData.isChatEnabled !== false;
  const isMember = currentGroupData.members && currentGroupData.members[uid];
  const isChannel = currentGroupData.type === 'channel';
  
  const canCreatePoll = isOwner || (isMod && (moderators[uid]?.canPinMessages || moderators[uid]?.canDeleteMessages));
  createPollBtn.style.display = canCreatePoll ? 'flex' : 'none';

  if (isMember) {
      if (isChannel) {
        chatInputBarEl.style.display = isOwnerOrMod ? 'flex' : 'none';
      } else {
        chatInputBarEl.style.display = isChatAllowed || isOwnerOrMod ? 'flex' : 'none';
      }
  } else {
      chatInputBarEl.style.display = 'none';
  }

  renderPinnedMessage();

  const msgsRef = query(ref(db, `conversations/${groupId}/messages`), orderByChild('timestamp'), limitToLast(50));
  messageLoaderEl.style.display = "flex";
  const unsub = onValue(msgsRef, (snap) => {
    renderMessages(snap, false);
  });
  userListeners.push(unsub);
}

function globalBtnHandler() {
  if (!currentUserStatus.isActive) return showDialog(STRINGS.accountBanned);
  if (currentUserStatus.isPublicChatBanned) return showDialog(STRINGS.publicChatBanned);

  unsubscribeAll();
  showChatView();

  currentChatId = "global";
  currentChatName = STRINGS.publicChat;
  currentOtherUid = null;
  currentGroupData = null;
  
  createPollBtn.style.display = 'none';
  chatHeaderAvatarEl.src = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌐</text></svg>';

  document.querySelector("#chatView .chatHeader").style.cursor = "default";
  chatHeaderEl.textContent = currentChatName;
  typingIndicatorEl.style.display = "none";
  chatInputBarEl.style.display = 'flex';
  pinnedMessageBarEl.style.display = 'none';

  const msgsRef = query(ref(db, "conversations/global/messages"), orderByChild('timestamp'), limitToLast(50));
  messageLoaderEl.style.display = "flex";
  const unsub = onValue(msgsRef, (snap) => {
    renderMessages(snap, false);
  });
  userListeners.push(unsub);
};

async function renderPinnedMessage() {
    if (currentGroupData && currentGroupData.pinnedMessageId) {
        const msgRef = ref(db, `conversations/${currentGroupData.key}/messages/${currentGroupData.pinnedMessageId}`);
        const msgSnap = await get(msgRef);
        if (msgSnap.exists()) {
            const msgData = msgSnap.val();
            pinnedMessageTextEl.textContent = `${msgData.sender}: ${msgData.text}`;
            pinnedMessageBarEl.style.display = 'flex';
        } else {
            await set(ref(db, `groups/${currentGroupData.key}/pinnedMessageId`), null);
            pinnedMessageBarEl.style.display = 'none';
        }
    } else {
        pinnedMessageBarEl.style.display = 'none';
    }
}

function renderMessages(snap, append = false) {
    // التحقق من عدد الرسائل لتجنب إعادة الرسم عند عدم وجود رسائل جديدة
    const currentMessageCount = snap.size;
    
    // إذا كان عدد الرسائل الحالي يساوي عدد الرسائل السابقة، لا تقم بتحديث العرض
    if (!append && currentMessageCount === lastMessageCount) {
        return;
    }
    
    if (!append) {
        messagesEl.innerHTML = "";
    }
    
    let messagesToRender = [];
    snap.forEach(msgSnap => {
        messagesToRender.push({ id: msgSnap.key, data: msgSnap.val() });
    });

    if (messagesToRender.length > 0 && !append) {
        firstMessageKey = messagesToRender[0].id;
    }

    const scrollBefore = messagesEl.scrollHeight;

    messagesToRender.forEach(msg => {
        if (msg.data.type === 'poll') {
            appendPollMessage(msg.data, msg.id, append);
        } else {
            appendMessage(msg.data, msg.id, append);
        }
    });

    messageLoaderEl.style.display = "none";

    if (append) {
        messagesEl.scrollTop = messagesEl.scrollHeight - scrollBefore;
    } else {
        messagesEl.scrollTo({ top: messagesEl.scrollHeight, behavior: "auto" });
    }
    
    // تحديث عدد الرسائل الحالي
    lastMessageCount = currentMessageCount;
    isLoadingMore = false;
}


function appendMessage(msgData, msgId, isPrepending = false) {
  const { sender, text, senderUid, photoURL, timestamp, isEdited, isForwarded, replyTo, reactions, readBy } = msgData;
  const isMe = senderUid === uid;
  
  const card = document.createElement("div");
  card.className = "msg-card " + (isMe ? "me" : "other");
  card.dataset.msgId = msgId;

  const isReadByOther = currentOtherUid && readBy && readBy[currentOtherUid];
  let readReceiptHTML = '';
  if (isMe && !currentGroupData) {
    const readClass = isReadByOther ? 'read' : '';
    readReceiptHTML = `<span class="read-receipt ${readClass}"><i class="fas fa-check-double"></i></span>`;
  }
  
  const isAlreadyReadByMe = readBy && readBy[uid];

  const senderData = allUsersData[senderUid];
  const badgeHTML = senderData?.verificationBadgeUrl ? `<img src="${senderData.verificationBadgeUrl}" class="verification-badge" alt="Verification Badge">` : "";
  const editedHTML = isEdited ? `<span class="edited-indicator">${STRINGS.editedLabel}</span>` : "";
  const forwardedHTML = isForwarded ? `<div class="forwarded-header">${STRINGS.forwardedMessage}</div>` : "";
  const replyHTML = replyTo ? `
    <div class="reply-quote">
      <strong>${sanitizeText(replyTo.sender)}</strong>
      <p>${sanitizeText(replyTo.text)}</p>
    </div>
  ` : "";
  const reactionsHTML = renderReactions(reactions, msgId);
  const avatarUrl = photoURL || `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%238b949e'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E`;
  card.innerHTML = `
    <img src="${sanitizeText(avatarUrl)}" class="avatar" alt="Avatar for ${sanitizeText(sender)}">
    <div class="content">
      <div class="sender-name-wrapper">
        <div class="sender-name">${sanitizeText(sender)}</div>
        ${badgeHTML}
      </div>
      ${replyHTML}
      ${forwardedHTML}
      <div class="text">${formatMessageText(text)}</div>
      <div class="reactions-container">${reactionsHTML}</div>
      <div class="footer">
        <span class="time">${new Date(timestamp).toLocaleTimeString('ar-EG', { hour: 'numeric', minute: '2-digit' })}${editedHTML}</span>
        ${readReceiptHTML}
      </div>
    </div>
  `;
  
  if (isPrepending) {
    messagesEl.insertBefore(card, messagesEl.firstChild);
  } else {
    messagesEl.appendChild(card);
  }

  if (!isMe && !isAlreadyReadByMe && messageObserver) {
      messageObserver.observe(card);
  }

  card.querySelector('.sender-name-wrapper').addEventListener('click', () => openMessageActions(msgId, msgData));
  card.querySelector('.avatar').addEventListener('click', () => showUserProfileSheet(senderUid));
  
  card.querySelectorAll('.reaction-chip').forEach(chip => {
      const emoji = chip.dataset.emoji;
      chip.addEventListener('click', () => toggleReaction(msgId, emoji));
  });
}

function sendMessage() {
  if (!currentChatId) return showDialog(STRINGS.selectChatFirst);
  if (!currentUserStatus.isActive) return showDialog(STRINGS.accountBanned);

  if (currentGroupData) {
      const isOwner = uid === currentGroupData.ownerUid;
      const isMod = currentGroupData.moderators && currentGroupData.moderators[uid];
      const isOwnerOrMod = isOwner || isMod;
      const isMember = currentGroupData.members && currentGroupData.members[uid];
      if (!isMember) return showDialog(STRINGS.mustJoinToSend);

      if (currentGroupData.type === 'channel' && !isOwnerOrMod) return showDialog(STRINGS.channelPostingRestricted);
      if (currentGroupData.type === 'group' && currentGroupData.isChatEnabled === false && !isOwnerOrMod) return showDialog(STRINGS.chatDisabledByOwner);
  } else if (currentChatId === "global" && currentUserStatus.isPublicChatBanned) {
    return showDialog(STRINGS.publicChatBanned);
  } else if (currentChatId !== "global" && !currentGroupData && currentUserStatus.isPrivateChatBanned) {
    return showDialog(STRINGS.privateChatBanned);
  }

  const text = messageInputEl.value.trim();
  if (!text) return;
  if (/https?:\/\//.test(text)) return showDialog(STRINGS.noLinksAllowed);

  if (currentOtherUid) {
    runTransaction(ref(db, `unreadCounts/${currentOtherUid}/${currentChatId}`), (c) => (c || 0) + 1);
  }

  const timestamp = Date.now();
  const messagePayload = {
    sender: name, senderUid: uid, text, photoURL, timestamp,
    readBy: { [uid]: true }
  };

  if (replyingToMessage) {
      messagePayload.replyTo = replyingToMessage;
      cancelReply();
  }

  const msgsRef = ref(db, `conversations/${currentChatId}/messages`);
  push(msgsRef, messagePayload).then(() => {
    const conversationUpdate = {
        lastMessage: text, lastMessageTimestamp: timestamp, isGroup: !!currentGroupData
    };
    update(ref(db, `conversations/${currentChatId}`), conversationUpdate);

    const chatTimestampUpdate = { timestamp };
    if(currentOtherUid) {
        set(ref(db, `users/${uid}/chats/${currentChatId}`), chatTimestampUpdate);
        set(ref(db, `users/${currentOtherUid}/chats/${currentChatId}`), chatTimestampUpdate);
    } else if (currentGroupData) {
        set(ref(db, `users/${uid}/chats/${currentChatId}`), chatTimestampUpdate);
    }
  });

  messageInputEl.value = "";
  resizeInput();
};

document.getElementById("createGroupBtn").onclick = () => createGroupDialogEl.classList.add("active");
document.getElementById("globalBtn").onclick = globalBtnHandler;
sendMessageBtn.onclick = sendMessage;
createPollBtn.onclick = () => createPollDialogEl.classList.add('active');


document.getElementById("searchInput").addEventListener("input", (e) => onValue(ref(db, "users"), snap => renderUsers(snap, e.target.value.toLowerCase().trim())));
document.getElementById("groupSearchInput").addEventListener("input", (e) => onValue(ref(db, "groups"), snap => renderGroups(snap, e.target.value.toLowerCase().trim())));

document.querySelector("#chatView .chatHeader").addEventListener("click", () => {
  if (currentGroupData) {
    openGroupSettings();
  } else if (currentOtherUid) {
    showUserProfileSheet(currentOtherUid);
  }
});

messagesEl.addEventListener('scroll', () => {
    if (messagesEl.scrollTop === 0 && !isLoadingMore && firstMessageKey) {
        loadMoreMessages();
    }
});
async function loadMoreMessages() {
    if (!currentChatId || !firstMessageKey) return;
    isLoadingMore = true;
    
    const msgsRef = ref(db, `conversations/${currentChatId}/messages`);
    const q = query(msgsRef, orderByChild('timestamp'), endBefore(firstMessageKey), limitToLast(25));
    
    const snap = await get(q);
    if (snap.exists()) {
        renderMessages(snap, true);
    } else {
        firstMessageKey = null;
    }
}

function showUserProfileSheet(userId) {
    const userData = allUsersData[userId];
    if (!userData) return;

    document.getElementById("profilePhoto").src = userData.photoURL;
    document.getElementById("profileName").textContent = userData.name;
    document.getElementById("profileBio").textContent = userData.bio || "لا يوجد نبذة شخصية.";

    const reportBtn = document.getElementById("reportUserSheetBtn");
    reportBtn.onclick = () => {
        profileSheetEl.classList.remove("active");
        showReportDialogFromChat(userId, userData.name);
    };

    const startChatBtn = document.getElementById("startChatFromProfileBtn");
    if(userId === currentOtherUid) { 
        startChatBtn.style.display = 'none';
    } else {
        startChatBtn.style.display = 'flex';
        startChatBtn.onclick = () => {
            profileSheetEl.classList.remove("active");
            openChat(userId, userData.name, userData.photoURL);
        }
    }
    
    profileSheetEl.classList.add("active");
}


document.getElementById("copyProfileNameBtn").onclick = () => copyToClipboard(document.getElementById("profileName").textContent, STRINGS.nameCopied);
document.getElementById("copyGroupNameBtn").onclick = () => copyToClipboard(document.getElementById("sheetGroupName").textContent, STRINGS.nameCopied);
document.getElementById("copyGroupIdBtn").onclick = () => copyToClipboard(document.getElementById("sheetGroupId").textContent, STRINGS.idCopied);
document.getElementById("unpinMessageBtn").onclick = () => {
    if (currentGroupData) {
        const canUnpin = uid === currentGroupData.ownerUid || currentGroupData.moderators?.[uid]?.canPinMessages;
        if (!canUnpin) return;
        showConfirmDialog(STRINGS.unpinMessageConfirm, () => {
            set(ref(db, `groups/${currentGroupData.key}/pinnedMessageId`), null)
            .then(() => showDialog(STRINGS.messageUnpinned))
            .catch(() => showDialog(STRINGS.pinError));
        });
    }
};

document.getElementById('cancelReplyBtn').onclick = cancelReply;

function openMessageActions(msgId, msgData) {
    selectedMessageForAction = { id: msgId, data: msgData };
    
    const isOwner = currentGroupData && uid === currentGroupData.ownerUid;
    const userPermissions = (currentGroupData && currentGroupData.moderators?.[uid]) || {};

    const canDelete = isOwner || userPermissions.canDeleteMessages;
    const canPin = isOwner || userPermissions.canPinMessages;

    const isMyMessage = msgData.senderUid === uid;
    document.getElementById('editMessageBtn').style.display = isMyMessage && msgData.type !== 'poll' ? 'flex' : 'none';
    document.getElementById('deleteMessageBtn').style.display = isMyMessage || canDelete ? 'flex' : 'none';
    document.getElementById('forwardMessageBtn').style.display = msgData.type !== 'poll' ? 'flex' : 'none';
    document.getElementById('replyMessageBtn').style.display = msgData.type !== 'poll' ? 'flex' : 'none';
    document.getElementById('reactMessageBtn').style.display = msgData.type !== 'poll' ? 'flex' : 'none';
    
    const pinBtn = document.getElementById('pinMessageBtn');
    if (canPin && currentGroupData) {
        const isPinned = currentGroupData.pinnedMessageId === msgId;
        pinBtn.innerHTML = `<i class="fas fa-thumbtack"></i> ${isPinned ? STRINGS.unpinAction : STRINGS.pinAction}`;
        pinBtn.style.display = 'flex';
    } else { 
        pinBtn.style.display = 'none'; 
    }
    messageActionsSheetEl.classList.add('active');
}

document.getElementById("deleteMessageBtn").onclick = () => {
    messageActionsSheetEl.classList.remove('active');
    showConfirmDialog(STRINGS.confirmMessageDelete, async () => {
        try { await remove(ref(db, `conversations/${currentChatId}/messages/${selectedMessageForAction.id}`)); } 
        catch (e) { showDialog(STRINGS.deleteError); console.error(e); }
    });
};

document.getElementById("editMessageBtn").onclick = () => {
    document.getElementById('editMessageInput').value = selectedMessageForAction.data.text;
    messageActionsSheetEl.classList.remove('active');
    editMessageDialogEl.classList.add('active');
};

document.getElementById("forwardMessageBtn").onclick = () => {
    messageActionsSheetEl.classList.remove('active');
    renderRecentChats('forwardChatList');
    forwardDialogEl.classList.add('active');
};

async function confirmForward(targetChatId, targetChatName) {
    const { data } = selectedMessageForAction;
    if (!data.text || !targetChatId) return showDialog(STRINGS.forwardError);
    try {
        const timestamp = Date.now();
        await push(ref(db, `conversations/${targetChatId}/messages`), {
            sender: name, senderUid: uid, text: data.text, photoURL,
            timestamp: timestamp, isForwarded: true, readBy: {[uid]: true}
        });
        await update(ref(db, `conversations/${targetChatId}`), { lastMessage: data.text, lastMessageTimestamp: timestamp });
        forwardDialogEl.classList.remove('active');
        showDialog(STRINGS.messageForwarded);
    } catch (e) { showDialog(STRINGS.forwardError); console.error(e); }
}


document.getElementById('pinMessageBtn').onclick = () => {
    const { id: msgId } = selectedMessageForAction;
    if (!msgId || !currentGroupData) return;
    messageActionsSheetEl.classList.remove('active');
    const isCurrentlyPinned = currentGroupData.pinnedMessageId === msgId;
    const pinRef = ref(db, `groups/${currentGroupData.key}/pinnedMessageId`);
    const confirmationText = isCurrentlyPinned ? STRINGS.unpinMessageConfirm : STRINGS.pinMessageConfirm;
    showConfirmDialog(confirmationText, async () => {
        try {
            await set(pinRef, isCurrentlyPinned ? null : msgId);
            showDialog(isCurrentlyPinned ? STRINGS.messageUnpinned : STRINGS.messagePinned);
        } catch (e) { showDialog(STRINGS.pinError); console.error(e); }
    });
};


document.getElementById('cancelActionBtn').onclick = () => messageActionsSheetEl.classList.remove('active');

document.getElementById("saveEditBtn").onclick = async () => {
    const newText = document.getElementById('editMessageInput').value.trim();
    if (!selectedMessageForAction.id || !newText) return;
    try {
        await update(ref(db, `conversations/${currentChatId}/messages/${selectedMessageForAction.id}`), { text: newText, isEdited: true });
        editMessageDialogEl.classList.remove('active');
    } catch (e) { showDialog(STRINGS.editSaveError); console.error(e); }
};

document.getElementById('confirmDialogYes').onclick = () => {
    if (confirmCallback) { confirmCallback(); }
    confirmDialogEl.classList.remove('active');
    confirmCallback = null;
};

document.getElementById('confirmDialogNo').onclick = () => {
    confirmDialogEl.classList.remove('active');
    confirmCallback = null;
};

document.getElementById('replyMessageBtn').onclick = () => {
    const { id, data } = selectedMessageForAction;
    replyingToMessage = { msgId: id, sender: data.sender, text: data.text };
    document.getElementById('replyPreviewSender').textContent = `${STRINGS.replyingTo} ${data.sender}`;
    document.getElementById('replyPreviewText').textContent = data.text;
    replyPreviewEl.style.display = 'flex';
    messageActionsSheetEl.classList.remove('active');
    messageInputEl.focus();
};

function cancelReply() {
    replyingToMessage = null;
    replyPreviewEl.style.display = 'none';
}

document.getElementById('reactMessageBtn').onclick = (e) => {
    const btnRect = e.target.getBoundingClientRect();
    reactionPickerEl.style.top = `${btnRect.top - 60}px`;
    reactionPickerEl.style.left = `${btnRect.left}px`;
    reactionPickerEl.style.display = 'flex';
    messageActionsSheetEl.classList.remove('active');
};

document.querySelectorAll('.reaction-emoji').forEach(el => {
    el.onclick = () => {
        const emoji = el.textContent;
        toggleReaction(selectedMessageForAction.id, emoji);
        reactionPickerEl.style.display = 'none';
    };
});

function renderReactions(reactions, msgId) {
    if (!reactions) return '';
    let html = '';
    for (const emoji in reactions) {
        const count = Object.keys(reactions[emoji]).length;
        if (count > 0) {
            const reactedByMe = reactions[emoji][uid];
            html += `<div class="reaction-chip ${reactedByMe ? 'reacted-by-me' : ''}" data-emoji="${emoji}">
                        ${emoji} ${count}
                     </div>`;
        }
    }
    return html;
}
function toggleReaction(msgId, emoji) {
    const reactionRef = ref(db, `conversations/${currentChatId}/messages/${msgId}/reactions/${emoji}/${uid}`);
    get(reactionRef).then(snap => {
        set(reactionRef, snap.exists() ? null : true).catch(e => {
            showDialog(STRINGS.reactionError);
            console.error(e);
        });
    });
};

function setupAdminControls() {
    if (!currentGroupData) return;
    const isOwner = uid === currentGroupData.ownerUid;
    const userPermissions = currentGroupData.moderators?.[uid] || {};

    const canEditInfo = isOwner || userPermissions.canEditGroupInfo;
    
    document.getElementById("sheetAdminControls").style.display = (isOwner || Object.keys(userPermissions).length > 0) ? "flex" : "none";
    document.getElementById("groupInfoEditContainer").style.display = canEditInfo ? "flex" : "none";
    document.getElementById("deleteGroupBtn").style.display = isOwner ? "flex" : "none";
    document.getElementById("ownerDivider").style.display = isOwner ? "block" : "none";
    document.getElementById("resetJoinIdBtn").style.display = isOwner ? "flex" : "none";

    const chatToggleRow = document.querySelector("#groupSettingsSheet .settings-toggle-row");
    if(chatToggleRow) chatToggleRow.style.display = isOwner ? "flex" : "none";
}

async function openGroupSettings() {
  if (!currentGroupData) return showDialog(STRINGS.noGroupSelected);
  document.getElementById("sheetGroupPhoto").src = currentGroupData.imageUrl;
  document.getElementById("sheetGroupName").textContent = currentGroupData.name;
  document.getElementById("sheetGroupId").textContent = currentGroupData.joinId;
  
  setupAdminControls(); 

  document.getElementById("groupNameEditInput").value = currentGroupData.name;
  document.getElementById("groupImageEditInput").value = currentGroupData.imageUrl;
  document.getElementById("sheetMemberCount").textContent = Object.keys(
    currentGroupData.members || {}
  ).length;

  const chatToggle = document.getElementById("chatEnabledToggle");
  chatToggle.checked = currentGroupData.isChatEnabled !== false;

  renderMemberList();
  groupSettingsSheetEl.classList.add("active");
}

function renderMemberList() {
    const adminsListEl = document.getElementById("sheetAdminsList");
    const moderatorsListEl = document.getElementById("sheetModeratorsList");
    const membersListEl = document.getElementById("sheetMembersList");

    adminsListEl.innerHTML = '';
    moderatorsListEl.innerHTML = '';
    membersListEl.innerHTML = '';

    const ownerUid = currentGroupData.ownerUid;
    const viewerPermissions = currentGroupData.moderators?.[uid] || {};
    const canViewerManageMods = uid === ownerUid || viewerPermissions.canManageModerators;

    const allMemberUids = Object.keys(currentGroupData.members || {});

    const owner = [];
    const moderators = [];
    const regularMembers = [];

    allMemberUids.forEach(memberUid => {
        const userData = allUsersData[memberUid];
        if (userData) {
            if (memberUid === ownerUid) {
                owner.push({ uid: memberUid, data: userData, role: "المالك" });
            } else if (currentGroupData.moderators && currentGroupData.moderators[memberUid]) {
                moderators.push({ uid: memberUid, data: userData, role: "مشرف" });
            } else {
                regularMembers.push({ uid: memberUid, data: userData, role: "عضو" });
            }
        }
    });

    const createMemberElement = (member) => {
        const item = document.createElement("div");
        item.className = "member-item";

        if (canViewerManageMods && member.uid !== uid && member.uid !== ownerUid) {
            item.style.cursor = 'pointer';
            item.onclick = () => openPermissionsDialog(member.uid, member.data.name);
        }

        item.innerHTML = `
            <div class="member-info-wrapper">
                <img src="${sanitizeText(member.data.photoURL)}" class="user-avatar" alt="Avatar for ${sanitizeText(member.data.name)}">
                <div class="member-details">
                    <span class="member-name">${sanitizeText(member.data.name)}</span>
                    <span class="member-role">${member.role}</span>
                </div>
            </div>
        `;
        return item;
    };
    
    if (owner.length > 0) {
        owner.forEach(o => adminsListEl.appendChild(createMemberElement(o)));
    }
    
    if (moderators.length > 0) {
        moderators.forEach(mod => moderatorsListEl.appendChild(createMemberElement(mod)));
    }
    
    if (regularMembers.length > 0) {
        regularMembers.forEach(mem => membersListEl.appendChild(createMemberElement(mem)));
    }
}


function openPermissionsDialog(memberUid, memberName) {
    const isOwner = uid === currentGroupData.ownerUid;
    const targetPermissions = currentGroupData.moderators?.[memberUid] || {};

    if (memberUid === currentGroupData.ownerUid) return showDialog(STRINGS.cannotManageOwner);
    if (!isOwner && targetPermissions.canManageModerators) {
        return showDialog(STRINGS.cannotManageHigherMod);
    }
    
    selectedMemberForManagement = { uid: memberUid, name: memberName };
    document.getElementById("permissionsMemberName").textContent = memberName;

    document.getElementById('canEditGroupInfo').checked = !!targetPermissions.canEditGroupInfo;
    document.getElementById('canDeleteMessages').checked = !!targetPermissions.canDeleteMessages;
    document.getElementById('canPinMessages').checked = !!targetPermissions.canPinMessages;
    document.getElementById('canBanUsers').checked = !!targetPermissions.canBanUsers;
    document.getElementById('canManageModerators').checked = !!targetPermissions.canManageModerators;

    document.getElementById('manageModsPermissionRow').style.display = isOwner ? 'flex' : 'none';

    permissionsManagementDialogEl.classList.add("active");
}

document.getElementById("savePermissionsBtn").onclick = async () => {
    const { uid: memberUid } = selectedMemberForManagement;
    if (!memberUid || !currentGroupData) return;

    const isOwner = uid === currentGroupData.ownerUid;
    const viewerPermissions = currentGroupData.moderators?.[uid] || {};
    if (!isOwner && !viewerPermissions.canManageModerators) return;

    const newPermissions = {
        canEditGroupInfo: document.getElementById('canEditGroupInfo').checked,
        canDeleteMessages: document.getElementById('canDeleteMessages').checked,
        canPinMessages: document.getElementById('canPinMessages').checked,
        canBanUsers: document.getElementById('canBanUsers').checked,
    };
    
    if (isOwner) {
        newPermissions.canManageModerators = document.getElementById('canManageModerators').checked;
    } else {
        const currentTargetPerms = currentGroupData.moderators?.[memberUid] || {};
        newPermissions.canManageModerators = !!currentTargetPerms.canManageModerators;
    }
    
    const modRef = ref(db, `groups/${currentGroupData.key}/moderators/${memberUid}`);
    const isNowModerator = Object.values(newPermissions).some(p => p === true);

    try {
        if (isNowModerator) {
            await set(modRef, newPermissions);
        } else {
            await remove(modRef);
        }
        showDialog(STRINGS.permissionsUpdated);
        permissionsManagementDialogEl.classList.remove('active');
    } catch(e) {
        showDialog(STRINGS.actionError);
        console.error(e);
    }
};

document.getElementById("banFromDialogBtn").onclick = async () => {
    const { uid: memberUid, name: memberName } = selectedMemberForManagement;
    if (!memberUid) return;

    const viewerIsOwner = uid === currentGroupData.ownerUid;
    const viewerCanBan = currentGroupData.moderators?.[uid]?.canBanUsers;

    if (!viewerIsOwner && !viewerCanBan) return;

    const updates = {};
    updates[`/groups/${currentGroupData.key}/banned/${memberUid}`] = true;
    updates[`/groups/${currentGroupData.key}/members/${memberUid}`] = null;
    updates[`/groups/${currentGroupData.key}/moderators/${memberUid}`] = null;
    
    try {
        await update(ref(db), updates);
        showDialog(STRINGS.userBanned(memberName));
        permissionsManagementDialogEl.classList.remove("active");
    } catch(e) {
        showDialog(STRINGS.actionError);
        console.error(e);
    }
};

document.getElementById("resetJoinIdBtn").onclick = () => {
    if (!currentGroupData || uid !== currentGroupData.ownerUid) return;

    const lastReset = currentGroupData.joinIdLastReset || 0;
    const cooldown = 7 * 24 * 60 * 60 * 1000;
    const now = Date.now();

    if (now - lastReset < cooldown) {
        const nextAvailableDate = new Date(lastReset + cooldown).toLocaleString('ar-EG');
        showDialog(STRINGS.joinIdResetCooldown(nextAvailableDate));
        return;
    }

    showConfirmDialog(STRINGS.joinIdResetConfirm, async () => {
        const newId = Math.floor(1000000000 + Math.random() * 9000000000).toString();
        const updates = {
            joinId: newId,
            joinIdLastReset: now
        };
        try {
            await update(ref(db, `groups/${currentGroupData.key}`), updates);
            document.getElementById("sheetGroupId").textContent = newId;
            showDialog(STRINGS.joinIdResetSuccess);
        } catch (error) {
            showDialog(STRINGS.actionError);
            console.error(error);
        }
    });
};

document.getElementById("saveGroupChangesBtn").onclick = async () => {
    if (!currentGroupData) return;
    const isOwner = uid === currentGroupData.ownerUid;
    const canEdit = isOwner || currentGroupData.moderators?.[uid]?.canEditGroupInfo;
    if (!canEdit) return;

    const newName = document.getElementById("groupNameEditInput").value.trim();
    const newImage = document.getElementById("groupImageEditInput").value.trim();
    if (!newName || !newImage) return showDialog(STRINGS.fillAllFields);

    try {
        await update(ref(db, `groups/${currentGroupData.key}`), {
            name: newName,
            imageUrl: newImage
        });
        showDialog(STRINGS.changesSaved);
        chatHeaderEl.textContent = newName;
        document.getElementById("sheetGroupName").textContent = newName;
    } catch (e) { showDialog(STRINGS.saveChangesError); console.error(e); }
};

document.getElementById("deleteGroupBtn").onclick = () => {
    if (!currentGroupData || uid !== currentGroupData.ownerUid) return;
    groupSettingsSheetEl.classList.remove("active");
    showConfirmDialog(STRINGS.confirmGroupDelete, async () => {
        try {
            await remove(ref(db, `groups/${currentGroupData.key}`));
            await remove(ref(db, `conversations/${currentGroupData.key}`));
            showDialog(STRINGS.groupDeletedSuccess);
            document.getElementById('backToListsBtn').click();
        } catch (e) { showDialog(STRINGS.actionError); console.error(e); }
    });
};

document.getElementById("chatEnabledToggle").onchange = (e) => {
    if (!currentGroupData || uid !== currentGroupData.ownerUid) return showDialog(STRINGS.ownerOnly);
    const isEnabled = e.target.checked;
    set(ref(db, `groups/${currentGroupData.key}/isChatEnabled`), isEnabled)
      .then(() => showDialog(STRINGS.chatStatusUpdated(isEnabled)))
      .catch(() => {
          showDialog(STRINGS.chatStatusUpdateError);
          console.error(e);
      });
};

function showUserProfileDialog(userId) {
    const userData = allUsersData[userId];
    if (!userData) return;
    document.getElementById("dialogProfilePhoto").src = userData.photoURL;
    document.getElementById("dialogProfileName").textContent = userData.name;
    document.getElementById("dialogProfileBio").textContent = userData.bio || "";
    if (userData.verificationBadgeUrl) {
      document.getElementById("dialogVerificationBadge").src = userData.verificationBadgeUrl;
      document.getElementById("dialogVerificationBadge").style.display = "inline-block";
    } else { document.getElementById("dialogVerificationBadge").style.display = "none"; }
    const startChatBtn = document.getElementById("startChatBtn");
    startChatBtn.onclick = () => {
      openChat(userId, userData.name, userData.photoURL);
      userProfileDialogEl.classList.remove("active");
    };
    userProfileDialogEl.classList.add("active");
}

function showReportDialogFromChat(userId, userName) {
    if (userId === uid) return showDialog(STRINGS.cannotReportSelf);
    const userData = allUsersData[userId];
    if (!userData) return showDialog(STRINGS.userDataNotFound);
    reportingUserId = userId;
    document.querySelector("#reportDialog h4").textContent = STRINGS.reportDialogTitle(userName);
    reportDialogEl.classList.add("active");
}

document.getElementById("submitReportBtn").onclick = async () => {
  const description = document.getElementById("reportDescriptionInput").value.trim();
  if (!description) return showDialog(STRINGS.reportReasonRequired);
  if (!reportingUserId) return showDialog(STRINGS.reportError);
  try {
    await push(ref(db, "reports"), { reportedUid: reportingUserId, reporterUid: uid, description, timestamp: Date.now() });
    document.getElementById("reportDescriptionInput").value = "";
    reportDialogEl.classList.remove("active");
    showDialog(STRINGS.reportSuccess);
  } catch (error) { showDialog(STRINGS.reportError); console.error(error); }
  reportingUserId = null;
};

async function joinGroup(groupId) {
  const groupRef = ref(db, `groups/${groupId}`);
  const groupSnap = await get(groupRef);
  if (!groupSnap.exists()) return showDialog(STRINGS.groupDoesNotExist);
  const groupData = groupSnap.val();
  if (groupData.isBanned) return showDialog(STRINGS.groupIsBanned);
  const isBannedSnap = await get(ref(db, `groups/${groupId}/banned/${uid}`));
  if (isBannedSnap.exists()) return showDialog(STRINGS.bannedFromGroup);
  try {
    const updates = {};
    updates[`/groups/${groupId}/members/${uid}`] = true;
    updates[`/users/${uid}/chats/${groupId}`] = { timestamp: Date.now() };
    await update(ref(db), updates);
    showDialog(STRINGS.joinGroupSuccess);
  } catch (error) { showDialog(STRINGS.joinGroupError); console.error(error); }
}

async function handleQuickEdit() {
    if (!currentChatId) return;
    const messagesRef = ref(db, `conversations/${currentChatId}/messages`);
    const q = query(messagesRef, orderByChild('senderUid'), equalTo(uid), limitToLast(1));
    const snapshot = await get(q);
    if (snapshot.exists()) {
        let msgId, msgData;
        snapshot.forEach(child => { msgId = child.key; msgData = child.val(); });
        if (msgData.type === 'poll') return showDialog('لا يمكن تعديل استطلاعات الرأي.');
        selectedMessageForAction = { id: msgId, data: msgData };
        document.getElementById('editMessageInput').value = msgData.text;
        editMessageDialogEl.classList.add('active');
    } else { showDialog(STRINGS.noMessagesToEdit); }
}

const resizeInput = () => {
  messageInputEl.style.height = "auto";
  messageInputEl.style.height = messageInputEl.scrollHeight + "px";
};
messageInputEl.addEventListener("input", handleMentionInput);
messageInputEl.addEventListener("keydown", (e) => {
    if (e.key === 'ArrowUp' && messageInputEl.value.trim() === '') { e.preventDefault(); handleQuickEdit(); }
});

document.getElementById("submitCreateGroupBtn").onclick = async () => {
    const groupName = document.getElementById("groupNameInput").value.trim();
    const category = document.getElementById("groupCategorySelect").value;
    const imageUrl = document.getElementById("groupImageInput").value.trim();
    const groupType = document.querySelector('input[name="groupType"]:checked').value;
    if (!groupName || !category || !imageUrl) return showDialog(STRINGS.fillAllFields);
    try {
        const newGroupRef = push(ref(db, "groups"));
        const joinId = Math.floor(1000000000 + Math.random() * 9000000000).toString();
        const newGroupData = { name: groupName, category, type: groupType, imageUrl, createdAt: Date.now(), ownerUid: uid, joinId, moderators: {}, members: { [uid]: true }, isChatEnabled: true };
        await set(newGroupRef, newGroupData);
        await set(ref(db, `users/${uid}/chats/${newGroupRef.key}`), { timestamp: Date.now() });
        createGroupDialogEl.classList.remove("active");
        showDialog(STRINGS.groupCreatedSuccess(groupType));
    } catch (error) { showDialog(STRINGS.groupCreationError); console.error(error); }
};

function handleMentionInput() {
    resizeInput();
    const text = messageInputEl.value;
    const mentionMatch = text.match(/@(\w*)$/);
    if (mentionMatch && currentGroupData) {
        const searchTerm = mentionMatch[1].toLowerCase();
        const members = Object.keys(currentGroupData.members || {});
        const suggestions = members.map(uid => allUsersData[uid]).filter(user => user && user.name.toLowerCase().includes(searchTerm));
        if (suggestions.length > 0) { renderMentionSuggestions(suggestions); } 
        else { mentionSuggestionsEl.style.display = 'none'; }
    } else { mentionSuggestionsEl.style.display = 'none'; }
}
function renderMentionSuggestions(users) {
    mentionSuggestionsEl.innerHTML = '';
    users.forEach(user => {
        const item = document.createElement('div');
        item.className = 'mention-suggestion-item';
        item.innerHTML = `<img src="${user.photoURL}" alt=""><span>${user.name}</span>`;
        item.onclick = () => selectMention(user.name);
        mentionSuggestionsEl.appendChild(item);
    });
    mentionSuggestionsEl.style.display = 'block';
}
function selectMention(name) {
    const currentText = messageInputEl.value;
    const newText = currentText.replace(/@(\w*)$/, `@${name} `);
    messageInputEl.value = newText;
    mentionSuggestionsEl.style.display = 'none';
    messageInputEl.focus();
}

document.getElementById('addPollOptionBtn').onclick = () => {
    const container = document.getElementById('pollOptionsContainer');
    if (container.children.length < 10) {
        const newInput = document.createElement('input');
        newInput.type = 'text';
        newInput.className = 'dialog-input poll-option-input';
        newInput.placeholder = `الخيار ${container.children.length + 1}`;
        container.appendChild(newInput);
    }
};
document.getElementById('submitCreatePollBtn').onclick = async () => {
    const question = document.getElementById('pollQuestionInput').value.trim();
    const options = [...document.querySelectorAll('.poll-option-input')].map(input => input.value.trim()).filter(text => text);
    if (!question || options.length < 2) return showDialog('يجب أن يحتوي الاستطلاع على سؤال وخيارين على الأقل.');
    const pollData = { question, options: options.reduce((obj, opt) => ({ ...obj, [opt]: { votes: 0 } }), {}), voters: {} };
    const messagePayload = { sender: name, senderUid: uid, photoURL, timestamp: Date.now(), type: 'poll', text: `استطلاع: ${question}`, pollData, readBy: {[uid]: true} };
    try {
        await push(ref(db, `conversations/${currentChatId}/messages`), messagePayload);
        createPollDialogEl.classList.remove('active');
        showDialog(STRINGS.pollCreated);
    } catch (e) { showDialog(STRINGS.pollCreationError); console.error(e); }
};
function appendPollMessage(msgData, msgId, isPrepending = false) {
    const { sender, senderUid, photoURL, timestamp, pollData } = msgData;
    const isMe = senderUid === uid;

    const card = document.createElement("div");
    card.className = "msg-card " + (isMe ? "me" : "other");
    card.dataset.msgId = msgId;
    const hasVoted = pollData.voters && pollData.voters[uid];
    const totalVotes = Object.values(pollData.options).reduce((sum, opt) => sum + (opt.votes || 0), 0);
    let optionsHTML = '';
    for (const optionText in pollData.options) {
        const votes = pollData.options[optionText].votes || 0;
        const percentage = totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(0) : 0;
        optionsHTML += `
            <div class="poll-option ${hasVoted ? 'poll-option-voted' : ''}" data-option="${sanitizeText(optionText)}">
                ${hasVoted ? `<div class="poll-option-percent-bar" style="width: ${percentage}%;"></div>` : ''}
                <span class="poll-option-text">${sanitizeText(optionText)}</span>
                ${hasVoted ? `<span class="poll-option-percent-text">${percentage}%</span>` : ''}
            </div>
        `;
    }
    card.innerHTML = `
        <img src="${sanitizeText(photoURL)}" class="avatar" alt="Avatar for ${sender}">
        <div class="content">
            <div class="sender-name-wrapper"> <div class="sender-name">${sanitizeText(sender)}</div> </div>
            <div class="poll-container">
                <div class="poll-question">${sanitizeText(pollData.question)}</div>
                <div class="poll-options">${optionsHTML}</div>
            </div>
            <div class="footer"> <span class="time">${new Date(timestamp).toLocaleTimeString('ar-EG', { hour: 'numeric', minute: '2-digit' })}</span> </div>
        </div>
    `;
    if (isPrepending) {
        messagesEl.insertBefore(card, messagesEl.firstChild);
    } else {
        messagesEl.appendChild(card);
    }

    card.querySelectorAll('.poll-option').forEach(opt => {
        if (!opt.classList.contains('poll-option-voted')) {
            opt.addEventListener('click', () => castVote(msgId, opt.dataset.option));
        }
    });
    card.querySelector('.avatar').addEventListener('click', () => showUserProfileDialog(senderUid));
}
function castVote(msgId, option) {
    const voteRef = ref(db, `conversations/${currentChatId}/messages/${msgId}/pollData`);
    runTransaction(voteRef, (pollData) => {
        if (pollData) {
            if (pollData.voters && pollData.voters[uid]) { return; }
            if (!pollData.options[option].votes) { pollData.options[option].votes = 0; }
            pollData.options[option].votes++;
            if (!pollData.voters) { pollData.voters = {}; }
            pollData.voters[uid] = true;
        }
        return pollData;
    }).then(result => {
        if (!result.committed) { showDialog(STRINGS.alreadyVoted); } 
        else { showDialog(STRINGS.voteCast); }
    }).catch(e => {
        showDialog(STRINGS.voteError);
        console.error(e);
    });
};

document.addEventListener('click', function(event) {
    if (event.target.matches('.dialog-close-btn') || event.target.matches('.cancel-btn')) {
        const dialog = event.target.closest('.dialog-box, .profile-sheet');
        if (dialog) {
            dialog.classList.remove('active');
        }
    }
    
    const clickedPicker = event.target.closest('.reaction-picker');
    const clickedReactBtn = event.target.closest('#reactMessageBtn');
    if (!clickedPicker && !clickedReactBtn && reactionPickerEl.style.display === 'flex') {
        reactionPickerEl.style.display = 'none';
    }
});

renderRecentChats('recentChatsList');