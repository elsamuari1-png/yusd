import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import {
  getDatabase,
  ref,
  push,
  onValue,
  get,
  set,
  update,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";

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

const projectsRef = ref(db, "applications");
const addDialog = document.getElementById("add-dialog");
const successDialog = document.getElementById("success-dialog");
const purchaseDialog = document.getElementById("purchase-dialog");
const proofDialog = document.getElementById("proof-dialog");
const balanceDialog = document.getElementById("insufficient-balance-dialog");
const failDialog = document.getElementById("transaction-fail-dialog");
const selfPurchaseDialog = document.getElementById("self-purchase-dialog");
const addForm = document.getElementById("add-form");
const purchaseForm = document.getElementById("purchase-form");
const cardsContainer = document.getElementById("cards-container");
const userNameInput = document.getElementById("userName");
const sidebar = document.getElementById("sidebar");
const mainContent = document.getElementById("main-content");
const menuToggleButton = document.getElementById("menu-toggle-button");
const themeToggleButton = document.getElementById("theme-toggle-button");
const searchInput = document.getElementById("search-input");

let currentUser = null;
let allProjects = [];

const toggleTheme = () => {
  document.body.classList.toggle("dark-mode");
  const isDarkMode = document.body.classList.contains("dark-mode");
  localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  themeToggleButton.innerHTML = isDarkMode
    ? `<span class="material-icons">light_mode</span>`
    : `<span class="material-icons">dark_mode</span>`;
};

const loadTheme = () => {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    themeToggleButton.innerHTML = `<span class="material-icons">light_mode</span>`;
  } else {
    themeToggleButton.innerHTML = `<span class="material-icons">dark_mode</span>`;
  }
};

themeToggleButton.addEventListener("click", toggleTheme);
document.addEventListener("DOMContentLoaded", loadTheme);

onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  const addButton = document.getElementById("add-button");
  if (user) {
    const userRef = ref(db, "users/" + user.uid);
    const userSnapshot = await get(userRef);
    userNameInput.value = userSnapshot.exists()
      ? userSnapshot.val().name || "Unknown"
      : user.displayName || "Unknown";
    
    // --- MODIFICATION START ---
    // Check the *value* of the permission, not just if it exists.
    // This now matches the security rule: root.child('uploadPermissions').child(auth.uid).val() === true
    const permissionRef = ref(db, "uploadPermissions/" + user.uid);
    const permissionSnapshot = await get(permissionRef);
    const hasPermission = permissionSnapshot.exists() && permissionSnapshot.val() === true;
    addButton.style.display = hasPermission ? "flex" : "none";
    // --- MODIFICATION END ---

  } else {
    userNameInput.value = "Please sign in";
    addButton.style.display = "none";
  }
});

document
  .getElementById("close-dialog-button")
  .addEventListener("click", () => addDialog.close());
document
  .getElementById("close-success-dialog")
  .addEventListener("click", () => successDialog.close());
document
  .getElementById("close-purchase-dialog")
  .addEventListener("click", () => purchaseDialog.close());
document
  .getElementById("close-proof-dialog")
  .addEventListener("click", () => proofDialog.close());
document
  .getElementById("close-balance-dialog")
  .addEventListener("click", () => balanceDialog.close());
document
  .getElementById("close-fail-dialog")
  .addEventListener("click", () => failDialog.close());
document
  .getElementById("close-self-purchase-dialog")
  .addEventListener("click", () => selfPurchaseDialog.close());
document
  .getElementById("add-button")
  .addEventListener("click", () => addDialog.showModal());

addDialog.addEventListener("close", () => {
  const nameValue = userNameInput.value;
  addForm.reset();
  userNameInput.value = nameValue;
  document.getElementById("price-input-container").style.display = "none";
});

document.querySelectorAll('input[name="paymentType"]').forEach((radio) => {
  radio.addEventListener("change", (e) => {
    const priceContainer = document.getElementById("price-input-container");
    const priceInput = document.getElementById("projectPrice");
    priceContainer.style.display = e.target.value === "paid" ? "block" : "none";
    priceInput.required = e.target.value === "paid";
  });
});

addForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!currentUser) return;
  try {
    const newProject = {
      name: userNameInput.value,
      uploaderUid: currentUser.uid,
      link: document.getElementById("projectLink").value,
      description: document.getElementById("projectDescription").value,
      images: [document.getElementById("imageLink").value],
      type: document.querySelector('input[name="projectType"]:checked').value,
      payment: {
        type: document.querySelector('input[name="paymentType"]:checked').value,
        price:
          document.querySelector('input[name="paymentType"]:checked').value ===
          "paid"
            ? Number(document.getElementById("projectPrice").value)
            : 0,
      },
      timestamp: Date.now(),
    };
    await push(projectsRef, newProject);
    addDialog.close();
    successDialog.showModal();
  } catch {
    failDialog.showModal();
  }
});

const logProjectView = (projectKey) => {
  if (!currentUser) return;
  set(ref(db, `applications/${projectKey}/views/${currentUser.uid}`), true);
};

const renderProjects = (projects) => {
  cardsContainer.innerHTML = "";
  projects.forEach(([projectKey, projectData]) => {
    logProjectView(projectKey);
    const card = document.createElement("div");
    card.className = "card animated-card";
    card.dataset.key = projectKey;

    const shortDescription =
      projectData.description.substring(0, 50) +
      (projectData.description.length > 50 ? "..." : "");
    const imagesHtml = `<div class="card-images-slider-wrapper"><img src="${projectData.images[0]}" alt="Project Image" class="card-image"></div>`;
    const paymentInfo = projectData.payment || { type: "free", price: 0 };
    const hasPurchased =
      currentUser && projectData.buyers && projectData.buyers[currentUser.uid];

    let priceHtml = "";
    let buttonHtml = `<a href="${projectData.link}" target="_blank" class="card-link">رابط التطبيق</a>`;
    let customIdPlaceholderHtml = "";

    if (paymentInfo.type === "paid" && !hasPurchased) {
      priceHtml = `<div class="card-price-info price-paid"><span class="material-icons">monetization_on</span><span>${paymentInfo.price} GT</span></div>`;
      if (projectData.uploaderUid) {
        buttonHtml = `<button class="card-link purchase-button" data-price="${paymentInfo.price}" data-uploader-uid="${projectData.uploaderUid}">شراء المنتج</button>`;
        get(ref(db, "users/" + projectData.uploaderUid)).then((snapshot) => {
          if (snapshot.exists() && snapshot.val().customId) {
            const customIdElement = card.querySelector(
              ".custom-id-placeholder"
            );
            if (customIdElement)
              customIdElement.innerHTML = `<div class="custom-id-container"><span>${
                snapshot.val().customId
              }</span><button class="copy-id-button" data-id="${
                snapshot.val().customId
              }"><span class="material-icons">content_copy</span></button></div>`;
          }
        });
      } else {
        buttonHtml = `<button class="card-link purchase-button" disabled title="هذا المنتج قديم ولا يمكن شراؤه">شراء غير متاح</button>`;
      }
    } else if (paymentInfo.type === "free") {
      priceHtml = `<div class="card-price-info price-free"><span class="material-icons">money_off</span><span>مجاني</span></div>`;
    }

    const ratings = projectData.ratings || {};
    const ratingValues = Object.values(ratings);
    const averageRating =
      ratingValues.length > 0
        ? ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length
        : 0;
    let starsHtml = "";
    for (let i = 1; i <= 5; i++)
      starsHtml += `<span class="material-icons rating-star" data-value="${i}">${
        i <= Math.round(averageRating) ? "star" : "star_border"
      }</span>`;

    card.innerHTML = `${imagesHtml}<div class="card-content"><div class="card-header"><h3>${
      projectData.name
    }</h3>${priceHtml}</div><p class="description-text">${shortDescription}</p><div class="custom-id-placeholder">${customIdPlaceholderHtml}</div>${
      projectData.description.length > 50
        ? `<button class="show-more-button">عرض المزيد</button>`
        : ""
    }<div class="card-stats"><div class="card-views"><span class="material-icons">visibility</span><span>${
      projectData.views ? Object.keys(projectData.views).length : 0
    }</span></div><div class="card-rating"><div class="rating-stars">${starsHtml}</div><span class="rating-info">(${averageRating.toFixed(
      1
    )} / ${
      ratingValues.length
    })</span></div></div><div class="card-footer">${buttonHtml}</div></div>`;
    cardsContainer.appendChild(card);
  });
};

cardsContainer.addEventListener("click", async (e) => {
  const target = e.target;
  const card = target.closest(".card");
  if (!card) return;

  if (target.closest(".show-more-button")) {
    e.stopPropagation();
    const showMoreButton = target.closest(".show-more-button");
    const descriptionText = card.querySelector(".description-text");
    const projectKey = card.dataset.key;
    const projectData = allProjects.find(([key]) => key === projectKey)[1];
    const shortDescription =
      projectData.description.substring(0, 50) +
      (projectData.description.length > 50 ? "..." : "");

    if (showMoreButton.textContent === "عرض المزيد") {
      descriptionText.textContent = projectData.description;
      showMoreButton.textContent = "عرض أقل";
    } else {
      descriptionText.textContent = shortDescription;
      showMoreButton.textContent = "عرض المزيد";
    }
    return;
  }

  if (target.closest(".copy-id-button")) {
    const id = target.closest(".copy-id-button").dataset.id;
    navigator.clipboard.writeText(id).then(() => {
      target.closest(
        ".copy-id-button"
      ).innerHTML = `<span class="material-icons">check</span>`;
      setTimeout(() => {
        target.closest(
          ".copy-id-button"
        ).innerHTML = `<span class="material-icons">content_copy</span>`;
      }, 1500);
    });
    return;
  }

  if (target.closest(".purchase-button")) {
    if (!currentUser) return alert("Please sign in to purchase an item.");
    const purchaseButton = target.closest(".purchase-button");
    const projectKey = card.dataset.key;
    const projectData = allProjects.find(([key]) => key === projectKey)[1];

    purchaseForm.dataset.projectKey = projectKey;
    purchaseForm.dataset.uploaderUid = purchaseButton.dataset.uploaderUid;
    purchaseForm.dataset.projectName = projectData.name;
    purchaseForm.dataset.projectLink = projectData.link;

    try {
      const userSnapshot = await get(ref(db, "users/" + currentUser.uid));
      if (userSnapshot.exists()) {
        const userData = userSnapshot.val();
        if ((userData.balance || 0) < Number(purchaseButton.dataset.price))
          return balanceDialog.showModal();
        if (userData.customId) {
          document.getElementById("purchase-price").textContent =
            purchaseButton.dataset.price;
          document.getElementById("buyer-custom-id").value = userData.customId;
          document.getElementById("transfer-amount").value =
            purchaseButton.dataset.price;
          purchaseDialog.showModal();
        } else alert("Your custom ID is not set.");
      } else alert("Could not find your user data.");
    } catch {
      failDialog.showModal();
    }
    return;
  }

  if (target.classList.contains("rating-star")) {
    if (!currentUser) return alert("Please sign in to rate projects.");
    await set(
      ref(db, `applications/${card.dataset.key}/ratings/${currentUser.uid}`),
      Number(target.dataset.value)
    );
  }
});

purchaseForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const { uploaderUid, projectKey, projectLink, projectName } =
    e.target.dataset;
  const buyerUid = currentUser.uid;
  const amount = Number(document.getElementById("transfer-amount").value);

  if (buyerUid === uploaderUid) {
    purchaseDialog.close();
    return selfPurchaseDialog.showModal();
  }

  try {
    const [buyerSnapshot, uploaderSnapshot] = await Promise.all([
      get(ref(db, "users/" + buyerUid)),
      get(ref(db, "users/" + uploaderUid)),
    ]);
    if (!buyerSnapshot.exists() || !uploaderSnapshot.exists())
      throw new Error("User data not found.");

    const buyerData = buyerSnapshot.val();
    if ((buyerData.balance || 0) < amount) {
      purchaseDialog.close();
      return balanceDialog.showModal();
    }

    const updates = {};
    updates[`/users/${buyerUid}/balance`] = (buyerData.balance || 0) - amount;
    updates[`/users/${uploaderUid}/balance`] =
      (uploaderSnapshot.val().balance || 0) + amount;
    updates[`/applications/${projectKey}/buyers/${buyerUid}`] = true;
    await update(ref(db), updates);

    await push(ref(db, "salesData"), {
      buyerUid,
      buyerName: buyerData.name || "Unknown",
      buyerCustomId: buyerData.customId || "N/A",
      sellerUid: uploaderUid,
      sellerName: uploaderSnapshot.val().name || "Unknown",
      projectKey,
      projectName,
      amount,
      timestamp: Date.now(),
    });

    document.getElementById("proof-buyer-name").textContent =
      buyerData.name || "غير معروف";
    document.getElementById("proof-custom-id").textContent = buyerData.customId;
    document.getElementById("proof-amount").textContent = amount;
    document.getElementById("proof-date").textContent =
      new Date().toLocaleString("ar-EG");

    purchaseDialog.close();
    proofDialog.showModal();

    const purchasedCard = document.querySelector(
      `.card[data-key="${projectKey}"]`
    );
    if (purchasedCard) {
      purchasedCard.querySelector(
        ".card-footer"
      ).innerHTML = `<a href="${projectLink}" target="_blank" class="card-link">رابط التطبيق</a>`;
      const priceInfo = purchasedCard.querySelector(".card-price-info");
      if (priceInfo) priceInfo.style.display = "none";
      const customIdPlaceholder = purchasedCard.querySelector(
        ".custom-id-placeholder"
      );
      if (customIdPlaceholder) customIdPlaceholder.innerHTML = "";
    }
  } catch (error) {
    console.error("Transaction failed: ", error);
    purchaseDialog.close();
    failDialog.showModal();
  }
});

const fetchAndRender = (type) => {
  onValue(projectsRef, (snapshot) => {
    const projects = [];
    snapshot.forEach((childSnapshot) => {
      const projectData = childSnapshot.val();
      if (projectData.type === type)
        projects.push([childSnapshot.key, projectData]);
    });
    allProjects = projects.reverse();
    renderProjects(allProjects);
    searchInput.value = "";
  });
};

searchInput.addEventListener("input", (e) => {
  const searchTerm = e.target.value.toLowerCase().trim();
  const filteredProjects = allProjects.filter(
    ([key, project]) =>
      project.name.toLowerCase().includes(searchTerm) ||
      project.description.toLowerCase().includes(searchTerm)
  );
  renderProjects(filteredProjects);
});

document.querySelectorAll(".sidebar-item").forEach((item) => {
  item.addEventListener("click", (e) => {
    e.preventDefault();
    document
      .querySelectorAll(".sidebar-item")
      .forEach((el) => el.classList.remove("active"));
    item.classList.add("active");
    fetchAndRender(item.dataset.filter);
  });
});

fetchAndRender("applications");

menuToggleButton.addEventListener("click", () => {
  sidebar.classList.toggle("collapsed");
  mainContent.classList.toggle("full-width");
});
