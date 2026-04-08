// Dark mode utility - saves to Firestore for logged-in users, localStorage for guests

let darkModeInitialized = false;

// Apply dark mode immediately (synchronous)
function applyDarkModeImmediate() {
  try {
    var isDark = localStorage.getItem('darkMode') === 'true';
    if (isDark) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  } catch (e) {}
}

// Initialize dark mode - call this on every page
export async function initDarkMode() {
  // Already initialized, just apply and return
  if (darkModeInitialized) {
    applyDarkModeImmediate();
    return;
  }
  
  darkModeInitialized = true;

  // Apply immediately from localStorage (works offline, for guests)
  applyDarkModeImmediate();

  try {
    const { db, auth } = await import("/src/firebaseConfig.js");
    const { doc, getDoc, setDoc } = await import("firebase/firestore");
    const { onAuthStateChanged } = await import("firebase/auth");

    async function syncWithFirestore() {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const userDoc = await getDoc(doc(db, "tbUsers", user.uid));
        if (userDoc.exists() && userDoc.data().darkMode !== undefined) {
          const firestoreDarkMode = userDoc.data().darkMode;
          localStorage.setItem('darkMode', firestoreDarkMode);
          applyDarkModeImmediate();
        }
      } catch (e) {}
    }

    // Sync with Firestore on initial load
    await syncWithFirestore();

    // Listen for auth changes
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        await syncWithFirestore();
      }
    });

    // Also listen for custom dark mode events from other pages
    window.addEventListener('darkModeChanged', function(e) {
      applyDarkModeImmediate();
    });

  } catch (e) {
    console.warn('Dark mode init failed, using localStorage only');
  }
}

// Save dark mode preference - call this when toggling
export async function saveDarkMode(isDark) {
  localStorage.setItem('darkMode', isDark);

  try {
    const { db, auth } = await import("/src/firebaseConfig.js");
    const { doc, setDoc } = await import("firebase/firestore");

    const user = auth.currentUser;
    if (user) {
      await setDoc(doc(db, "tbUsers", user.uid), { darkMode: isDark }, { merge: true });
    }
  } catch (e) {}

  applyDarkModeImmediate();
  window.dispatchEvent(new CustomEvent('darkModeChanged', { detail: isDark }));
}

// Get current dark mode state (synchronous, from localStorage)
export function getDarkModeState() {
  try {
    return localStorage.getItem('darkMode') === 'true';
  } catch (e) {
    return false;
  }
}