// =======================================
// FIREBASE IMPORTS
// =======================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// =======================================
// FIREBASE CONFIG
// =======================================

const firebaseConfig = {
  apiKey: "AIzaSyDy2Uha15IJ49rnY5NykeZ98-EfRhkDoe4",

  authDomain: "my-work-tracker-48fc2.firebaseapp.com",

  projectId: "my-work-tracker-48fc2",

  storageBucket: "my-work-tracker-48fc2.firebasestorage.app",

  messagingSenderId: "536287322425",

  appId: "1:536287322425:web:686f35dd42696d209c08e8",

  measurementId: "G-NQNMKDVH53",
};

// =======================================
// INITIALIZE FIREBASE
// =======================================

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

// =======================================
// GOOGLE SHEET WEB APP URL
// =======================================

const SHEET_WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbycy0vdnDEg1TFN2jCUxLZdlIS4II1BkDHuYaQn807AFPgL5s9PdkWJ57jxpODC90SlCg/exec";

// =======================================
// HTML ELEMENTS
// =======================================

const trackerBody = document.getElementById("trackerBody");

const totalHours = document.getElementById("totalHours");

const saveBtn = document.getElementById("saveBtn");

const updateBtn = document.getElementById("updateBtn");

// =======================================
// CREATE 45 DAYS TABLE
// =======================================

for (let i = 1; i <= 45; i++) {
  const row = document.createElement("tr");

  row.innerHTML = `

    <td>Day ${i}</td>

    <td>

      <input
        type="text"
        class="topic"
        data-day="${i}"
        placeholder="Topic Covered"
      >

    </td>

    <td>

      <input
        type="number"
        class="hours"
        data-day="${i}"
        placeholder="Hours"
      >

    </td>

    <td>

      <input
        type="checkbox"
        class="excel"
        data-day="${i}"
      >

    </td>

    <td>

      <input
        type="checkbox"
        class="sql"
        data-day="${i}"
      >

    </td>

    <td>

      <input
        type="checkbox"
        class="python"
        data-day="${i}"
      >

    </td>

    <td>

      <input
        type="checkbox"
        class="powerbi"
        data-day="${i}"
      >

    </td>

    <td>

      <input
        type="checkbox"
        class="tableau"
        data-day="${i}"
      >

    </td>

    <td>

      <input
        type="checkbox"
        class="project"
        data-day="${i}"
      >

    </td>

  `;

  trackerBody.appendChild(row);
}

// =======================================
// UPDATE TOTAL HOURS
// =======================================

function updateStats() {
  let total = 0;

  document.querySelectorAll(".hours").forEach((input) => {
    total += Number(input.value) || 0;
  });

  totalHours.innerText = total;
}

document.addEventListener("input", updateStats);

// =======================================
// COLLECT TRACKER DATA
// =======================================

function collectTrackerData() {
  const trackerData = [];

  for (let i = 1; i <= 45; i++) {
    trackerData.push({
      day: i,

      topic: document.querySelector(`.topic[data-day="${i}"]`).value,

      hours: document.querySelector(`.hours[data-day="${i}"]`).value,

      excel: document.querySelector(`.excel[data-day="${i}"]`).checked,

      sql: document.querySelector(`.sql[data-day="${i}"]`).checked,

      python: document.querySelector(`.python[data-day="${i}"]`).checked,

      powerbi: document.querySelector(`.powerbi[data-day="${i}"]`).checked,

      tableau: document.querySelector(`.tableau[data-day="${i}"]`).checked,

      project: document.querySelector(`.project[data-day="${i}"]`).checked,
    });
  }

  return trackerData;
}

// =======================================
// SAVE TO FIREBASE
// =======================================

async function saveToFirebase(data) {
  try {
    await setDoc(
      doc(db, "tracker", "45days"),

      {
        data: data,

        updatedAt: new Date().toISOString(),
      },
    );

    console.log("Firebase Updated");
  } catch (error) {
    console.log("Firebase Error:", error);

    alert("Firebase Save Failed ❌");
  }
}

// =======================================
// SAVE TO GOOGLE SHEET
// =======================================

async function saveToGoogleSheet(data) {
  try {
    await fetch(
      SHEET_WEB_APP_URL,

      {
        method: "POST",

        mode: "no-cors",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(data),
      },
    );

    console.log("Google Sheet Updated");
  } catch (error) {
    console.log("Google Sheet Error:", error);

    alert("Google Sheet Update Failed ❌");
  }
}

// =======================================
// SAVE / UPDATE BUTTON
// =======================================

async function saveOrUpdateData() {
  const trackerData = collectTrackerData();

  // SAVE FIREBASE

  await saveToFirebase(trackerData);

  // SAVE GOOGLE SHEET

  await saveToGoogleSheet(trackerData);

  alert("Data Saved Successfully ✅");
}

// =======================================
// BUTTON EVENTS
// =======================================

saveBtn.addEventListener(
  "click",

  saveOrUpdateData,
);

updateBtn.addEventListener(
  "click",

  saveOrUpdateData,
);

// =======================================
// LOAD FIREBASE DATA
// =======================================

async function loadData() {
  try {
    const docRef = doc(db, "tracker", "45days");

    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const savedData = docSnap.data().data;

      savedData.forEach((item) => {
        document.querySelector(`.topic[data-day="${item.day}"]`).value =
          item.topic || "";

        document.querySelector(`.hours[data-day="${item.day}"]`).value =
          item.hours || "";

        document.querySelector(`.excel[data-day="${item.day}"]`).checked =
          item.excel || false;

        document.querySelector(`.sql[data-day="${item.day}"]`).checked =
          item.sql || false;

        document.querySelector(`.python[data-day="${item.day}"]`).checked =
          item.python || false;

        document.querySelector(`.powerbi[data-day="${item.day}"]`).checked =
          item.powerbi || false;

        document.querySelector(`.tableau[data-day="${item.day}"]`).checked =
          item.tableau || false;

        document.querySelector(`.project[data-day="${item.day}"]`).checked =
          item.project || false;
      });

      updateStats();

      console.log("Previous Data Loaded");
    }
  } catch (error) {
    console.log("Load Error:", error);
  }
}

// =======================================
// INITIAL LOAD
// =======================================

loadData();
