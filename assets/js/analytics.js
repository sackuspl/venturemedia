// Firebase core
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";

// Firestore (baza danych)
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

// 🔹 Konfiguracja Firebase (TA, KTÓRĄ SKOPIOWAŁEŚ)
const firebaseConfig = {
  apiKey: "AIzaSyC0ALO1e0MQ2YZG5yJ43kXlQvLF9M1i-EE",
  authDomain: "venture-panel.firebaseapp.com",
  projectId: "venture-panel",
  storageBucket: "venture-panel.firebasestorage.app",
  messagingSenderId: "986564015404",
  appId: "1:986564015404:web:b3d9e7b32c4fdfd82ca889"
};

// 🔹 Inicjalizacja
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 🔹 Unikalny użytkownik (1 na przeglądarkę)
let visitorId = localStorage.getItem("visitor_id");
if (!visitorId) {
  visitorId = crypto.randomUUID();
  localStorage.setItem("visitor_id", visitorId);
}

// 🔹 Dzisiejsza data (YYYY-MM-DD)
const today = new Date().toISOString().split("T")[0];

// 🔹 Sprawdzenie czy już liczone
const visitRef = doc(db, "visits", today, "users", visitorId);
const visitSnap = await getDoc(visitRef);

if (!visitSnap.exists()) {
  // zapis wejścia
  await setDoc(visitRef, {
    page: location.pathname,
    time: Date.now()
  });

  // inkrement dziennego licznika
  const statRef = doc(db, "stats", today);
  try {
    await updateDoc(statRef, { count: increment(1) });
  } catch {
    await setDoc(statRef, { count: 1 });
  }
}
