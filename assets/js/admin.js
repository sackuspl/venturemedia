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

// 🔹 Mapa path → czytelna nazwa
const pageNames = {
  "/": "Home",
  "/index.html": "Home",
  "/join-us": "Join Us",
  "/join-us.html": "Join Us",
  "/kontakt": "Kontakt",
  "/kontakt.html": "Kontakt",
  // dodaj kolejne strony w razie potrzeby
};

// 🔹 Pobranie danych i wstawienie w panel
async function loadStats() {
  const statsSnap = await getDocs(collection(db, "stats"));
  const visitsSnap = await getDocs(collection(db, "visits"));

  // Sumy dzienne/tygodniowe/miesięczne
  let dailyTotal = 0;
  let weeklyTotal = 0;
  let monthlyTotal = 0;

  const weeklyMap = {};
  const monthlyMap = {};

  statsSnap.forEach(docSnap => {
    const date = docSnap.id;
    const count = docSnap.data().count;
    dailyTotal += count;

    // tydzień
    const weekNum = Math.ceil(new Date(date).getDate() / 7);
    weeklyMap[`Tydzień ${weekNum}`] = (weeklyMap[`Tydzień ${weekNum}`] || 0) + count;

    // miesiąc
    const monthKey = date.slice(0,7);
    monthlyMap[monthKey] = (monthlyMap[monthKey] || 0) + count;
  });

  weeklyTotal = Object.values(weeklyMap).reduce((a,b)=>a+b,0);
  monthlyTotal = Object.values(monthlyMap).reduce((a,b)=>a+b,0);

  // TOP podstrony
  const pageCounts = {};
  for (let dayDoc of visitsSnap.docs) {
    const usersCol = collection(db, "visits", dayDoc.id, "users");
    const usersSnap = await getDocs(usersCol);

    usersSnap.forEach(userDoc => {
      let page = userDoc.data().page;

      // 🔹 Mapowanie ścieżki na czytelną nazwę
      if (pageNames[page]) page = pageNames[page];

      pageCounts[page] = (pageCounts[page] || 0) + 1;
    });
  }

  // 🔹 Wstawienie danych do panelu
  const dailyEl = document.getElementById("dailyCount");
  const weeklyEl = document.getElementById("weeklyCount");
  const monthlyEl = document.getElementById("monthlyCount");

  if(dailyEl) dailyEl.textContent = dailyTotal;
  if(weeklyEl) weeklyEl.textContent = weeklyTotal;
  if(monthlyEl) monthlyEl.textContent = monthlyTotal;

  // Wstawienie TOP podstron do tabeli
  const tbody = document.querySelector("#topPages tbody");
  tbody.innerHTML = "";
  Object.entries(pageCounts)
    .sort((a,b)=>b[1]-a[1])
    .forEach(([page,count])=>{
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${page}</td><td>${count}</td>`;
      tbody.appendChild(tr);
    });
}
