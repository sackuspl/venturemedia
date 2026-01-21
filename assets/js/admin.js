// 🔹 Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

// 🔹 Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyC0ALO1e0MQ2YZG5yJ43kXlQvLF9M1i-EE",
  authDomain: "venture-panel.firebaseapp.com",
  projectId: "venture-panel",
};

// 🔹 Inicjalizacja
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 🔹 Logowanie i autoryzacja
onAuthStateChanged(auth, user => {
  if (!user) location.href = "login.html";
  else loadStats();
});

// 🔹 Wylogowanie
window.logout = () => signOut(auth).then(() => location.href="login.html");

// 🔹 Funkcja pobierająca dane i wyświetlająca liczby
async function loadStats() {
  // Pobranie danych
  const statsSnap = await getDocs(collection(db, "stats"));
  const visitsSnap = await getDocs(collection(db, "visits"));

  // Sumy dzienne, tygodniowe i miesięczne
  let dailyTotal = 0;
  let weeklyMap = {};
  let monthlyMap = {};
  let pageCounts = {};

  statsSnap.forEach(docSnap => {
    const date = docSnap.id; // YYYY-MM-DD
    const count = docSnap.data().count;
    dailyTotal += count;

    // Tygodnie
    const weekNum = Math.ceil(new Date(date).getDate() / 7);
    weeklyMap[`Tydzień ${weekNum}`] = (weeklyMap[`Tydzień ${weekNum}`] || 0) + count;

    // Miesiące
    const monthKey = date.slice(0, 7); // YYYY-MM
    monthlyMap[monthKey] = (monthlyMap[monthKey] || 0) + count;
  });

  // TOP podstrony
  for (let dayDoc of visitsSnap.docs) {
    const usersCol = collection(db, "visits", dayDoc.id, "users");
    const usersSnap = await getDocs(usersCol);
    usersSnap.forEach(userDoc => {
      const page = userDoc.data().page;
      pageCounts[page] = (pageCounts[page] || 0) + 1;
    });
  }

  // 🔹 Wstawianie danych do panelu
  document.getElementById("dailyCount").textContent = dailyTotal;
  document.getElementById("weeklyCount").textContent = Object.values(weeklyMap).reduce((a,b) => a+b, 0);
  document.getElementById("monthlyCount").textContent = Object.values(monthlyMap).reduce((a,b) => a+b, 0);

  const tbody = document.querySelector("#topPages tbody");
  tbody.innerHTML = "";
  Object.entries(pageCounts)
    .sort((a,b) => b[1]-a[1])
    .forEach(([page,count]) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${page}</td><td>${count}</td>`;
      tbody.appendChild(tr);
    });
}
