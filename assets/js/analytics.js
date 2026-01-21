// Firebase core
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";

// Firestore
import {
  getFirestore,
  doc,
  setDoc,
  updateDoc,
  increment
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

// 🔹 Konfiguracja Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC0ALO1e0MQ2YZG5yJ43kXlQvLF9M1i-EE",
  authDomain: "venture-panel.firebaseapp.com",
  projectId: "venture-panel",
  storageBucket: "venturemedia.firebaseapp.com",
  messagingSenderId: "986564015404",
  appId: "1:986564015404:web:b3d9e7b32c4fdfd82ca889"
};

// 🔹 Inicjalizacja
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 🔹 Funkcja śledząca wejścia
async function trackVisit() {
  // Generujemy unikalny visitor ID na przeglądarkę
  let visitorId = localStorage.getItem("visitor_id");
  if (!visitorId) {
    visitorId = crypto.randomUUID();
    localStorage.setItem("visitor_id", visitorId);
  }

  // Dzisiejsza data YYYY-MM-DD
  const today = new Date().toISOString().split("T")[0];

  // 🔹 Zapisujemy wejście – bez odczytu, od razu tworzymy dokument
  const visitRef = doc(db, "visits", today, "users", visitorId);
  try {
    await setDoc(visitRef, {
      page: location.pathname,
      time: Date.now()
    });
  } catch (err) {
    console.error("Nie udało się zapisać wejścia:", err);
  }

  // 🔹 Inkrement dziennego licznika w stats
  const statRef = doc(db, "stats", today);
  try {
    await updateDoc(statRef, { count: increment(1) });
  } catch {
    // jeśli dokument nie istnieje, tworzymy go
    await setDoc(statRef, { count: 1 });
  }
}

// 🔹 Uruchamiamy funkcję
trackVisit().catch(console.error);
