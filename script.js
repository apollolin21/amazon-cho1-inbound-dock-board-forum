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

// Cloud Function URL (server-side admin delete)
const CLEAR_FUNCTION_URL =
  "https://us-central1-dock-board.cloudfunctions.net/clearAllThreads";

// Clear all threads (ADMIN ONLY)
clearBtn.addEventListener("click", async () => {
  const confirmClear = confirm("Delete ALL threads?");
  if (!confirmClear) return;

  const key = prompt("Admin password:");
  if (!key) return;

  try {
    const res = await fetch(CLEAR_FUNCTION_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key })
    });

    if (!res.ok) {
      alert("Unauthorized or failed request.");
      return;
    }

    alert("All threads cleared.");
  } catch (err) {
    alert("Network error.");
  }
});

