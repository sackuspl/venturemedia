import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";
import { getFirestore, collection, getDocs, doc } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";
import Chart from "https://cdn.jsdelivr.net/npm/chart.js@4.3.0/dist/chart.umd.min.js";

// 🔹 Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyC0ALO1e0MQ2YZG5yJ43kXlQvLF9M1i-EE",
  authDomain: "venture-panel.firebaseapp.com",
  projectId: "venture-panel",
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 🔹 Logowanie
onAuthStateChanged(auth, user => {
  if (!user) location.href = "login.html";
  else loadStats();
});

// 🔹 Wylogowanie
window.logout = () => signOut(auth).then(() => location.href="login.html");

// 🔹 Pobieranie danych i generowanie wykresów
async function loadStats() {
  // STATYSTYKI dzienne
  const statsSnap = await getDocs(collection(db, "stats"));
  const dailyLabels = [];
  const dailyData = [];
  const weeklyDataMap = {};
  const monthlyDataMap = {};

  statsSnap.forEach(docSnap => {
    const date = docSnap.id; // YYYY-MM-DD
    const count = docSnap.data().count;

    dailyLabels.push(date);
    dailyData.push(count);

    // tygodnie
    const weekNum = Math.ceil(new Date(date).getDate() / 7);
    weeklyDataMap[`Tydzień ${weekNum}`] = (weeklyDataMap[`Tydzień ${weekNum}`] || 0) + count;

    // miesiące
    const monthKey = date.slice(0,7); // YYYY-MM
    monthlyDataMap[monthKey] = (monthlyDataMap[monthKey] || 0) + count;
  });

  // WYKRES dzienny
  new Chart(document.getElementById('dailyChart'), {
    type: 'bar',
    data: { labels: dailyLabels, datasets: [{ label:'Wejścia dzienne', data: dailyData, backgroundColor:'#4f46e5' }] },
    options: { responsive:true }
  });

  // WYKRES tygodniowy
  new Chart(document.getElementById('weeklyChart'), {
    type: 'bar',
    data: { labels:Object.keys(weeklyDataMap), datasets:[{label:'Wejścia tygodniowe', data:Object.values(weeklyDataMap), backgroundColor:'#4f46e5'}] },
    options:{responsive:true}
  });

  // WYKRES miesięczny
  new Chart(document.getElementById('monthlyChart'), {
    type:'bar',
    data:{ labels:Object.keys(monthlyDataMap), datasets:[{label:'Wejścia miesięczne', data:Object.values(monthlyDataMap), backgroundColor:'#4f46e5'}] },
    options:{responsive:true}
  });

  // TOP podstrony
  const pageCounts = {};
  const visitsSnap = await getDocs(collection(db, "visits"));
  for (let dayDoc of visitsSnap.docs) {
    const usersCol = collection(db, "visits", dayDoc.id, "users");
    const usersSnap = await getDocs(usersCol);
    usersSnap.forEach(userDoc => {
      const page = userDoc.data().page;
      pageCounts[page] = (pageCounts[page] || 0) + 1;
    });
  }

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
