import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, updateProfile } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBccwKK32upLrgpBLI96Ff5tszWp1xfhB4",
  authDomain: "ai-study-solution.firebaseapp.com",
  projectId: "ai-study-solution",
  storageBucket: "ai-study-solution.appspot.com",
  messagingSenderId: "836349905068",
  appId: "1:836349905068:web:d73d7fe0bfb543ba82b709",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Signup with Email and Password
document.getElementById('signup-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: name });
    alert('Signup successful!');
    window.location.href = "/dashboard";
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
});

// Signup with Google
window.signupWithGoogle = async function () {
  try {
    const result = await signInWithPopup(auth, provider);
    console.log("Google Signup successful:", result.user);
    window.location.href = "/dashboard";
  } catch (error) {
    console.error(error);
    alert("Google signup failed: " + error.message);
  }
};

// Toggle password visibility
window.togglePassword = function () {
  const passwordInput = document.getElementById("password");
  const eyeIcon = document.getElementById("eyeIcon");
  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    eyeIcon.innerHTML = `
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.978 9.978 0 011.357-2.572m1.838-2.354A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.974 9.974 0 01-4.148 5.042M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M3 3l18 18" />`;
  } else {
    passwordInput.type = "password";
    eyeIcon.innerHTML = `
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M2.458 12C3.732 7.943 7.522 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.478 0-8.268-2.943-9.542-7z" />`;
  }
};
