// Firebase core
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";

// Firestore
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

// 🔹 Konfiguracja Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC0ALO1e0MQ2YZG5yJ43kXlQvLF9M1i-EE",
  authDomain: "venture-panel.firebaseapp.com",
  projectId: "venture-panel",
};

// 🔹 Inicjalizacja (bez duplicate-app)
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);

// 🔹 Funkcja śledząca wejścia
async function trackVisit() {
  try {
    // 1️⃣ Stałe ID użytkownika (1 na przeglądarkę)
    let visitorId = localStorage.getItem("visitor_id");
    if (!visitorId) {
      visitorId = crypto.randomUUID();
      localStorage.setItem("visitor_id", visitorId);
    }

    // 2️⃣ Dzisiejsza data
    const today = new Date().toISOString().split("T")[0];

    // 3️⃣ Referencja do wizyty
    const visitRef = doc(db, "visits", today, "users", visitorId);

    // 🔑 Sprawdzenie, czy wizytę już zapisano (1/dzień)
    const visitSnap = await getDoc(visitRef);
    if (visitSnap.exists()) return; // już policzone → STOP

    // 4️⃣ Zapis wizyty
    await setDoc(visitRef, {
      page: location.pathname,
      time: Date.now()
    });

    // 5️⃣ Inkrement dziennego licznika w stats
    const statRef = doc(db, "stats", today);
    try {
      await updateDoc(statRef, { count: increment(1) });
    } catch {
      // jeśli nie istnieje → tworzymy
      await setDoc(statRef, { count: 1 });
    }

  } catch (err) {
    console.error("Analytics error:", err);
  }
}

// 🚀 Start
trackVisit();
