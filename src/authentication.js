// src/authentication.js
// ------------------------------------------------------------
// Part of the COMP1800 Projects 1 Course (BCIT).
// Starter code provided for students to use and adapt.
// Contains reusable Firebase Authentication functions
// (login, signup, logout, and auth state checks).
// -------------------------------------------------------------

// Import the initialized Firebase Authentication object
import { auth, db } from "/src/firebaseConfig.js";
import { doc, setDoc } from "firebase/firestore";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

// -------------------------------------------------------------
// loginUser(email, password)
// -------------------------------------------------------------
// Logs an existing user into Firebase Authentication.
//
// Parameters:
//   email (string)    - user's email
//   password (string) - user's password
//
// Returns: Promise resolving to the user credential object.
// Usage:
//   await loginUser("user@example.com", "password123");
// -------------------------------------------------------------
export async function loginUser(email, password) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const user = credential.user;
  localStorage.setItem("userName", user.displayName || "Unknown");
  localStorage.setItem("userEmail", user.email || "");
  return credential;
}

// -------------------------------------------------------------
// signupUser(name, email, password)
// -------------------------------------------------------------
// Creates a new user account with Firebase Authentication,
// then updates the user's profile with a display name.
//
// Parameters:
//   name (string)     - user's display name
//   email (string)    - user's email
//   password (string) - user's password
//
// Returns: the created user object.
// Usage:
//   const user = await signupUser("Alice", "alice@email.com", "secret");
// -------------------------------------------------------------
export async function signupUser(name, email, password) {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password,
  );
  const user = userCredential.user; // Get the user object

  // Update the user's profile with the display name, NOTE: updateProfile is a built-in Firebase function
  await updateProfile(user, { displayName: name });

  // Cache name and email for instant profile page load
  localStorage.setItem("userName", name);
  localStorage.setItem("userEmail", email);

  // After creating the user, we can also create a Firestore document for them with default values for country and school.
  // This demonstrates how to link Auth users to Firestore data.
  // Use 'try' 'catch' to handle any errors that might occur during Firestore document creation.
  try {
    // Create a Firestore document for the new user with default values
    await setDoc(doc(db, "tbUsers", user.uid), {
      name: name,
      email: email,
      userID: user.uid,
      successfulGroups: 0, //Default Value
      profilePicture: "/images/account.png",
      statusMessage: "Hi, I'm " + name + " and I'm a new travel buddy!",
    });
  } catch (error) {
    alert(
      `Error creating user document:\n${error.code || ""}\n${error.message || error}`,
    );
  }
  // Return the user object for further use (e.g., redirecting or showing a welcome message)
  return user;
}

// -------------------------------------------------------------
// logoutUser()
// -------------------------------------------------------------
// Signs out the currently logged-in user and redirects them
// back to the login page (index.html).
//
// Usage:
//   await logoutUser();
// -------------------------------------------------------------

var logoutBtn = document.getElementById("LogOutUser");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async function (event) {
    event.preventDefault();
    localStorage.removeItem("user");
    localStorage.removeItem("profilePic");
    await signOut(auth);
    window.location.href = "/index.html";
  });
}

// -------------------------------------------------------------
// checkAuthState()
// -------------------------------------------------------------
// Observes changes in the user's authentication state (login/logout)
// and updates the UI or redirects accordingly.
//
// If the user is on "main.html":
//   - If logged in → displays "Hello, [Name]!"
//   - If not logged in → redirects to "index.html"
//
// This function should be called once when the page loads.
//
// Usage:
//   checkAuthState();
// -------------------------------------------------------------
export function checkAuthState() {
  onAuthStateChanged(auth, (user) => {
    if (!window.location.pathname.endsWith("index.html")) {
      if (user) {
        localStorage.setItem("user", user.uid);
      } else {
        if (!window.location.pathname.endsWith("login")) {
          window.location.href = "/index.html";
        }
      }
    }
  });
}

export function onAuthReady(callback) {
  return onAuthStateChanged(auth, callback);
}

// -------------------------------------------------------------
// authErrorMessage(error)
// -------------------------------------------------------------
// Maps Firebase Auth error codes to short, user-friendly messages.
// Helps display clean error alerts instead of raw Firebase codes.
export function authErrorMessage(error) {
  const code = (error?.code || "").toLowerCase();

  const map = {
    "auth/invalid-credential": "Wrong email or password.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/user-not-found": "No account found with that email.",
    "auth/wrong-password": "Incorrect password.",
    "auth/too-many-requests": "Too many attempts. Try again later.",
    "auth/email-already-in-use": "Email is already in use.",
    "auth/weak-password": "Password too weak (min 6 characters).",
    "auth/missing-password": "Password cannot be empty.",
    "auth/network-request-failed": "Network error. Try again.",
  };

  return map[code] || "Something went wrong. Please try again.";
}
