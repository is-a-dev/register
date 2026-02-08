// ================== FIREBASE IMPORTS ==================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// ================== CONFIG ==================
const firebaseConfig = {
  apiKey: "AIzaSyAV6iEfJ5H3kQtiHc8IEyRERK1mqJbiJZo",
  authDomain: "hackerplayground-bf869.firebaseapp.com",
  projectId: "hackerplayground-bf869",
  storageBucket: "hackerplayground-bf869.firebasestorage.app",
  messagingSenderId: "319612108619",
  appId: "1:319612108619:web:4de1e81f08b52f574472ce",
};

// ================== INIT ==================
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ================== GLOBAL STATE ==================
window.currentUserRole = "guest";
window.currentUserEmail = "";

// ================== HELPERS ==================
function clearAuthForms() {
  [
    "signup-email",
    "signup-pass",
    "signup-confirm",
    "login-email",
    "login-pass",
    "signup-username",
    "signup-firstname",
    "signup-lastname",
  ].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
}

// ✅ Strong password validation
function isStrongPassword(p) {
  if (!p) return false;

  const hasLen = p.length >= 8;
  const hasUpper = /[A-Z]/.test(p);
  const hasLower = /[a-z]/.test(p);
  const hasNum = /[0-9]/.test(p);
  const hasSpecial = /[^A-Za-z0-9]/.test(p);

  return hasLen && hasUpper && hasLower && hasNum && hasSpecial;
}

// ✅ Username validation (safe)
function isValidUsername(username) {
  // Allow: a-z A-Z 0-9 . _
  // No spaces
  return /^[a-zA-Z0-9._]{3,20}$/.test(username);
}

// ✅ Better readable Firebase errors
function humanFirebaseError(msg = "") {
  const m = msg.toLowerCase();

  if (m.includes("email-already-in-use")) return "This email is already registered.";
  if (m.includes("invalid-email")) return "Invalid email format.";
  if (m.includes("weak-password")) return "Password is too weak.";
  if (m.includes("wrong-password")) return "Wrong password.";
  if (m.includes("user-not-found")) return "No account found with this email.";
  if (m.includes("too-many-requests")) return "Too many attempts, try again later.";
  if (m.includes("network-request-failed")) return "Network error. Check internet connection.";

  return msg;
}

// ✅✅ FIXED: Create/Update base user record (settings + roles)
async function saveUserToFirestore(uid, email, data = {}) {
  await setDoc(
    doc(db, "users", uid),
    {
      email,
      role: data.role || "user", // ✅ IMPORTANT (rules + admin access ke liye)

      firstName: data.firstName || "",
      lastName: data.lastName || "",
      username: data.username || "",

      gender: data.gender || "Prefer not to say",
      country: data.country || "India",

      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
}

async function getUserRole(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data().role || "user" : "user";
}

function applyRoleAccess(role) {
  window.currentUserRole = role;

  const adminOnly = document.getElementById("admin-only");
  if (adminOnly) adminOnly.style.display = role === "admin" ? "block" : "none";
}

function setupPasswordToggle(btnId, inputId) {
  const btn = document.getElementById(btnId);
  const input = document.getElementById(inputId);
  if (!btn || !input) return;

  btn.addEventListener("click", () => {
    input.type = input.type === "password" ? "text" : "password";
  });
}

// ✅ User login check
function isLoggedIn() {
  return window.currentUserRole && window.currentUserRole !== "guest";
}

// ✅ Safe logout function (reusable everywhere)
async function doLogout() {
  await signOut(auth);

  window.currentUserRole = "guest";
  window.currentUserEmail = "";

  clearAuthForms();

  window.location.replace("./index.html");
}

// ✅ Display name helper (used everywhere)
async function getDisplayName(user) {
  if (!user) return "";

  try {
    const snap = await getDoc(doc(db, "users", user.uid));
    if (snap.exists()) {
      const data = snap.data();
      const name = (data.username || data.firstName || "").trim();
      if (name) return name;
    }
  } catch (e) {
    console.log("DisplayName fetch error:", e);
  }

  return (user.email || "User").split("@")[0];
}

// ================== DOM READY ==================
document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ firebase.js loaded");

  const btnSignup = document.getElementById("btn-signup");
  const btnLogin = document.getElementById("btn-login");
  const btnLogout = document.getElementById("btn-logout");

  const btnNavProfile = document.getElementById("btn-nav-profile");

  const loginBtn = document.getElementById("btn-nav-login");
  const navWelcome = document.getElementById("nav-welcome");
  const navUserEmail = document.getElementById("nav-user-email"); // old support
  const navUsername = document.getElementById("nav-username"); // new support

  setupPasswordToggle("toggle-login-pass", "login-pass");
  setupPasswordToggle("toggle-signup-pass", "signup-pass");
  setupPasswordToggle("toggle-signup-confirm", "signup-confirm");

  // ================== SIGNUP ==================
  if (btnSignup) {
    btnSignup.addEventListener("click", async () => {
      const email = document.getElementById("signup-email")?.value.trim();
      const pass = document.getElementById("signup-pass")?.value.trim();
      const confirm = document.getElementById("signup-confirm")?.value.trim();

      const username = document.getElementById("signup-username")?.value.trim();
      const firstName = document.getElementById("signup-firstname")?.value.trim();
      const lastName = document.getElementById("signup-lastname")?.value.trim();
      const gender =
        document.getElementById("signup-gender")?.value || "Prefer not to say";
      const country = document.getElementById("signup-country")?.value || "India";

      if (!email || !pass || !confirm || !username || !firstName || !lastName) {
        alert("❌ Fill all fields");
        return;
      }

      if (!isValidUsername(username)) {
        alert("❌ Username must be 3-20 chars (a-z A-Z 0-9 . _ only)");
        return;
      }

      if (firstName.length < 2) {
        alert("❌ Enter First Name");
        return;
      }

      if (lastName.length < 2) {
        alert("❌ Enter Last Name");
        return;
      }

      if (pass !== confirm) {
        alert("❌ Passwords not matching");
        return;
      }

      // ✅ Strong password check
      if (!isStrongPassword(pass)) {
        alert("❌ Password must be 8+ chars with uppercase, lowercase, number & special character.");
        return;
      }

      try {
        const cred = await createUserWithEmailAndPassword(auth, email, pass);

        await saveUserToFirestore(cred.user.uid, email, {
          username,
          firstName,
          lastName,
          gender,
          country,
          createdAt: new Date().toISOString(),
        });

        alert("✅ Account created successfully! Now login.");

        // ✅ Force logout after signup
        await signOut(auth);
        clearAuthForms();

        // ✅ Redirect to login
        // (signup.html me login button ko index.html pe point kar diya hai)
        window.location.replace("./index.html#login");
      } catch (e) {
        alert("❌ Signup Error: " + humanFirebaseError(e.message));
        console.error(e);
      }
    });
  }

  // ================== LOGIN ==================
  if (btnLogin) {
    btnLogin.addEventListener("click", async () => {
      const email = document.getElementById("login-email")?.value.trim();
      const pass = document.getElementById("login-pass")?.value.trim();

      if (!email || !pass) {
        alert("❌ Enter email & password");
        return;
      }

      try {
        const cred = await signInWithEmailAndPassword(auth, email, pass);

        const role = await getUserRole(cred.user.uid);
        applyRoleAccess(role);

        clearAuthForms();

        // ✅ Login success => Dashboard
        window.location.replace("./dashboard.html");
      } catch (e) {
        alert("❌ Login Error: " + humanFirebaseError(e.message));
        console.error(e);
      }
    });
  }

  // ================== LOGOUT (Navbar logout) ==================
  if (btnLogout) {
    btnLogout.addEventListener("click", async () => {
      alert("✅ Logged out!");
      await doLogout();
    });
  }

  // ================== AUTH STATE ==================
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      window.currentUserEmail = user.email || "";

      const role = await getUserRole(user.uid);
      applyRoleAccess(role);

      if (loginBtn) loginBtn.style.display = "none";
      if (btnLogout) btnLogout.style.display = "inline-block";
      if (btnNavProfile) btnNavProfile.classList.remove("hidden");

      if (navWelcome) navWelcome.classList.remove("hidden");

      const navName = await getDisplayName(user);

      if (navUsername) navUsername.textContent = navName;
      if (navUserEmail) navUserEmail.textContent = navName;
    } else {
      applyRoleAccess("guest");

      if (loginBtn) loginBtn.style.display = "inline-block";
      if (btnLogout) btnLogout.style.display = "none";
      if (btnNavProfile) btnNavProfile.classList.add("hidden");

      if (navWelcome) navWelcome.classList.add("hidden");

      if (navUsername) navUsername.textContent = "";
      if (navUserEmail) navUserEmail.textContent = "";

      clearAuthForms();
    }
  });

  // ================== ✅ LAB/CTF ACCESS CONTROL ==================
  window.firebaseShowLoginAlert = function (type = "labs") {
    if (isLoggedIn()) {
      window.location.href = type === "ctf" ? "/ctf.html" : "/labs.html";
      return;
    }

    const modal = document.getElementById("login-modal");
    if (!modal) return;

    modal.classList.remove("hidden");
    modal.classList.add("flex");
  };

  // ================== ✅ Dashboard/Settings Logout Buttons ==================
  const dashLogoutBtn = document.getElementById("btn-dashboard-logout");
  if (dashLogoutBtn) {
    dashLogoutBtn.addEventListener("click", async () => {
      await doLogout();
    });
  }

  const settingsLogoutBtn = document.getElementById("btn-settings-logout");
  if (settingsLogoutBtn) {
    settingsLogoutBtn.addEventListener("click", async () => {
      await doLogout();
    });
  }
});

