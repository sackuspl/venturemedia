// Firebase core
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";
import { increment } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

// 🔹 Konfiguracja Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC0ALO1e0MQ2YZG5yJ43kXlQvLF9M1i-EE",
  authDomain: "venture-panel.firebaseapp.com",
  projectId: "venture-panel",
};

// 🔹 Inicjalizacja Firebase
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);

// 🔹 Funkcja śledząca wejścia
async function trackVisit() {
  try {
    // 1️⃣ ID użytkownika w localStorage
    let visitorId = localStorage.getItem("visitor_id");
    if (!visitorId) {
      visitorId = crypto.randomUUID();
      localStorage.setItem("visitor_id", visitorId);
    }

    // 2️⃣ Dzisiejsza data
    const today = new Date().toISOString().split("T")[0];

    // 3️⃣ Sprawdzenie w localStorage, czy już odwiedził dziś
    const lastVisit = localStorage.getItem(`visited_${today}`);
    if (lastVisit) return; // już odwiedzone → STOP

    // 4️⃣ Zapis wizyty w Firestore (tylko create, nie update)
    const visitRef = doc(db, "visits", today, "users", visitorId);
    try {
      await setDoc(visitRef, {
        page: location.pathname,
        time: Date.now()
      });
    } catch (err) {
      // dokument istnieje lub brak uprawnień → ignorujemy
      console.warn("Nie udało się zapisać wizyty (prawdopodobnie już istnieje):", err);
    }

    // 5️⃣ Inkrement licznika w stats
    const statRef = doc(db, "stats", today);
    await setDoc(statRef, { count: increment(1) }, { merge: true });

    // 6️⃣ Oznaczenie w localStorage, że dziś odwiedził
    localStorage.setItem(`visited_${today}`, "1");

    console.log(">>> Wyświetlenie policzone:", today, visitorId);

  } catch (err) {
    console.error("Analytics error:", err);
  }
}

// 🚀 Start po wczytaniu DOM
document.addEventListener('DOMContentLoaded', () => {
  trackVisit();
});
