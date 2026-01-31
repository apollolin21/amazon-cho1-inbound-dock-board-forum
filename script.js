const form = document.getElementById("thread-form");
const categorySelect = document.getElementById("category");
const bodyInput = document.getElementById("body");
const threadList = document.querySelector(".thread-list");
const adminPanel = document.querySelector(".admin-panel");
const clearBtn = document.querySelector(".clearbtn");

// Firestore
const db = firebase.firestore();
const threadsRef = db.collection("threads");

// Render threads from Firestore
function renderThread(doc) {
  const div = document.createElement("div");
  div.classList.add("thread");

  div.innerHTML = `
    <span class="thread-category">${doc.data().category}</span>
    <p>${doc.data().body}</p>
  `;

  threadList.prepend(div);
}

// Load threads (real-time)
threadsRef.orderBy("createdAt", "desc").onSnapshot((snapshot) => {
  threadList.innerHTML = "";
  snapshot.forEach((doc) => renderThread(doc));
});

// New thread submission
form.addEventListener("submit", function (e) {
  e.preventDefault();

  const body = bodyInput.value.trim();
  if (!body) return;

  threadsRef.add({
    category: categorySelect.value,
    body: body,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });

  form.reset();
});

// Clear all threads (ADMIN)
document.addEventListener("keydown", function (e) {
  // Ctrl + Shift + A opens admin panel
  if (e.ctrlKey && e.shiftKey && e.key === "A") {
    const password = prompt("Admin password:");
    if (password === "dockadmin123") {
      adminPanel.style.display = "block";
      alert("Admin mode enabled");
    } else {
      alert("Incorrect password");
    }
  }
});

