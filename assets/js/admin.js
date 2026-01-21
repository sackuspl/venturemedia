import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

// 🔹 Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyC0ALO1e0MQ2YZG5yJ43kXlQvLF9M1i-EE",
  authDomain: "venture-panel.firebaseapp.com",
  projectId: "venture-panel",
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 🔹 Logowanie sprawdzanie
onAuthStateChanged(auth, user => {
  if (!user) {
    location.href = "login.html";
  } else {
    loadStats();
  }
});

// 🔹 Wylogowanie
window.logout = () => {
  signOut(auth);
};

// 🔹 Pobieranie danych i generowanie wykresów
async function loadStats() {
  const statsSnap = await getDocs(collection(db, "stats"));
  const visitsSnap = await getDocs(collection(db, "visits"));

  // dane do wykresów dziennych
  const dailyLabels = [];
  const dailyData = [];
  statsSnap.forEach(doc => {
    dailyLabels.push(doc.id);
    dailyData.push(doc.data().count);
  });

  // Wykres dzienny
  new Chart(document.getElementById('dailyChart'), {
    type: 'bar',
    data: {
      labels: dailyLabels,
      datasets: [{
        label: 'Wejścia dzienne',
        data: dailyData,
        backgroundColor: '#4f46e5'
      }]
    },
    options: { responsive: true }
  });

  // TOP podstrony
  const pageCounts = {};
  visitsSnap.forEach(doc => {
    const users = doc.data();
    // tutaj iterujemy ręcznie – dla uproszczenia pobierzemy pathname z users
  });
  
  // dla prostego startu wyświetlamy ilość podstron
  const tbody = document.querySelector("#topPages tbody");
  visitsSnap.forEach(dayDoc => {
    dayDoc.ref.collection("users").get().then(usersSnap => {
      usersSnap.forEach(userDoc => {
        const page = userDoc.data().page;
        pageCounts[page] = (pageCounts[page] || 0) + 1;
      });

      // wyświetlenie w tabeli
      tbody.innerHTML = "";
      Object.entries(pageCounts).sort((a,b) => b[1]-a[1]).forEach(([page, count]) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td>${page}</td><td>${count}</td>`;
        tbody.appendChild(tr);
      });
    });
  });
}
