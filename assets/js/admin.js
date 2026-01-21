// 🔹 Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

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
window.logout = () =>
  signOut(auth).then(() => (location.href = "login.html"));

// 🔹 Mapa path → czytelna nazwa
const pageNames = {
  "/": "Home",
  "/index.html": "Home",
  "/join-us.html": "Join Us",
  "/newspapers.html": "Newspapers",
};

// 🔹 Pomocnicze daty
function getDateKey(date = new Date()) {
  return date.toISOString().split("T")[0];
}

function getLastDays(n) {
  const days = [];
  for (let i = 0; i < n; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(getDateKey(d));
  }
  return days;
}

// 🔹 Pobranie danych i wstawienie w panel
async function loadStats() {

  // ---------- SUMY ----------
  const statsSnap = await getDocs(collection(db, "stats"));

  let dailyTotal = 0;
  let weeklyTotal = 0;
  let monthlyTotal = 0;

  const today = getDateKey();
  const weekDays = getLastDays(7);
  const monthDays = getLastDays(30);

  statsSnap.forEach(doc => {
    const date = doc.id;
    const count = doc.data().count || 0;

    if (date === today) dailyTotal += count;
    if (weekDays.includes(date)) weeklyTotal += count;
    if (monthDays.includes(date)) monthlyTotal += count;
  });

  // ---------- TOP PODSTRONY ----------
  const top24h = {};
  const top7d = {};
  const top30d = {};

  async function countPages(days, target) {
    for (const day of days) {
      const usersCol = collection(db, "visits", day, "users");
      const snap = await getDocs(usersCol);

      snap.forEach(doc => {
        let page = doc.data().page;
        if (pageNames[page]) page = pageNames[page];
        target[page] = (target[page] || 0) + 1;
      });
    }
  }

  await countPages([today], top24h);
  await countPages(weekDays, top7d);
  await countPages(monthDays, top30d);

  // ---------- WSTAWIANIE SUM ----------
  document.getElementById("dailyCount").textContent = dailyTotal;
  document.getElementById("weeklyCount").textContent = weeklyTotal;
  document.getElementById("monthlyCount").textContent = monthlyTotal;

  // ---------- TABELA TOP ----------
  const tbody = document.querySelector("#topPages tbody");
  tbody.innerHTML = "";

  const pages = new Set([
    ...Object.keys(top24h),
    ...Object.keys(top7d),
    ...Object.keys(top30d),
  ]);

  [...pages]
    .sort((a, b) => (top30d[b] || 0) - (top30d[a] || 0))
    .forEach(page => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${page}</td>
        <td>${top24h[page] || 0}</td>
        <td>${top7d[page] || 0}</td>
        <td>${top30d[page] || 0}</td>
      `;
      tbody.appendChild(tr);
    });
}
