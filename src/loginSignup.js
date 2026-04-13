// -------------------------------------------------------------
// src/loginSignup.js
// -------------------------------------------------------------
// Part of the COMP1800 Projects 1 Course (BCIT).
// Starter code provided for students to use and adapt.
// Manages the login/signup form behaviour and redirects.
// -------------------------------------------------------------

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";
import "./styles/style.css";
import { loginUser, signupUser, authErrorMessage } from "./authentication.js";

// --- Login and Signup Page ---
// ─────────────────────────────────────────────────────────────────────────────
// initAuthUI()
// ─────────────────────────────────────────────────────────────────────────────
// Initializes the login/signup page UI.
// 1. Caches DOM element references
// 2. Sets up helper functions (setVisible, showError, etc.)
// 3. Attaches event listeners for form toggles and submissions
//
// Parameters: None — reads from DOM
// Returns: Nothing — runs initialization side-effects
// ─────────────────────────────────────────────────────────────────────────────
// Handles toggling between Login/Signup views and form submits
// using plain DOM APIs for simplicity and maintainability.

function initAuthUI() {
  // --- DOM Elements ---
  const alertEl = document.getElementById("authAlert");
  const loginView = document.getElementById("loginView");
  const signupView = document.getElementById("signupView");
  const toSignupBtn = document.getElementById("toSignup");
  const toLoginBtn = document.getElementById("toLogin");
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  const redirectUrl = "/main.html";

  // --- Helper Functions ---
// ─────────────────────────────────────────────────────────────────────────────
// setVisible(el, visible)
// ─────────────────────────────────────────────────────────────────────────────
// Toggles the Bootstrap "d-none" class to show/hide an element.
//
// Parameters:
//   el (DOM element) - The element to show/hide
//   visible (boolean) - true to show, false to hide
//
// Returns: Nothing
// ─────────────────────────────────────────────────────────────────────────────
function setVisible(el, visible) {
  el.classList.toggle("d-none", !visible);
}

// ─────────────────────────────────────────────────────────────────────────────
// showError(msg)
// ─────────────────────────────────────────────────────────────────────────────
// Displays an error message in the alert element and auto-hides after 5 seconds.
// Uses a timeout to allow auto-dismissal.
//
// Parameters:
//   msg (string) - Error message to display
//
// Returns: Nothing
// ─────────────────────────────────────────────────────────────────────────────
let errorTimeout;
function showError(msg) {
  alertEl.textContent = msg || "";
  alertEl.classList.remove("d-none");
  clearTimeout(errorTimeout);
  errorTimeout = setTimeout(hideError, 5000); // Auto-hide after 5s
}

// ─────────────────────────────────────────────────────────────────────────────
// hideError()
// ─────────────────────────────────────────────────────────────────────────────
// Hides the error alert and clears the timeout.
//
// Parameters: None
// Returns: Nothing
// ─────────────────────────────────────────────────────────────────────────────
function hideError() {
  alertEl.classList.add("d-none");
  alertEl.textContent = "";
  clearTimeout(errorTimeout);
}

// ─────────────────────────────────────────────────────────────────────────────
// setSubmitDisabled(form, disabled)
// ─────────────────────────────────────────────────────────────────────────────
// Enables or disables the submit button in a form to prevent double-submits.
//
// Parameters:
//   form (DOM element) - The form element
//   disabled (boolean) - true to disable, false to enable
//
// Returns: Nothing
// ─────────────────────────────────────────────────────────────────────────────
function setSubmitDisabled(form, disabled) {
  const submitBtn = form?.querySelector('[type="submit"]');
  if (submitBtn) submitBtn.disabled = disabled;
}

  // --- Event Listeners ---
  // Toggle buttons
  toSignupBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    hideError();
    setVisible(loginView, false);
    setVisible(signupView, true);
    signupView?.querySelector("input")?.focus();
  });

  toLoginBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    hideError();
    setVisible(signupView, false);
    setVisible(loginView, true);
    loginView?.querySelector("input")?.focus();
  });

  // Login form submit
  loginForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideError();
    const email = document.querySelector("#loginEmail")?.value?.trim() ?? "";
    const password = document.querySelector("#loginPassword")?.value ?? "";
    if (!email || !password) {
      showError("Please enter your email and password.");
      return;
    }
    setSubmitDisabled(loginForm, true);
    try {
      await loginUser(email, password);
      location.href = redirectUrl;
    } catch (err) {
      showError(authErrorMessage(err));
      console.error(err);
    } finally {
      setSubmitDisabled(loginForm, false);
    }
  });

  // Signup form submit
  signupForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideError();
    const name = document.querySelector("#signupName")?.value?.trim() ?? "";
    const email = document.querySelector("#signupEmail")?.value?.trim() ?? "";
    const password = document.querySelector("#signupPassword")?.value ?? "";
    if (!name || !email || !password) {
      showError("Please fill in name, email, and password.");
      return;
    }
    setSubmitDisabled(signupForm, true);
    try {
      await signupUser(name, email, password);
      location.href = redirectUrl;
    } catch (err) {
      showError(authErrorMessage(err));
      console.error(err);
    } finally {
      setSubmitDisabled(signupForm, false);
    }
  });
}

// --- Initialize UI on DOMContentLoaded ---
document.addEventListener("DOMContentLoaded", initAuthUI);
